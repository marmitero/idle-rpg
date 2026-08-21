/** CampaignMapController — coordena dados + progresso + render + interação
 * (docs/campaign/01). Toda a lógica de estado é pura (content); aqui só
 * gluing de UI, foco de câmera e emissão de eventos. */

import {
  CAMPAIGN,
  CAMPAIGN_CHAPTER_BY_ID,
  CAMPAIGN_STAGE_BY_ID,
  chapterProgress,
  computeStageState,
  currentStageId,
  isChapterUnlocked,
  type CampaignChapterDef,
  type CampaignProgress,
  type CampaignStageDef,
  type StageNodeState,
} from "@relicwake/content";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../../state";
import { emitCampaign } from "./events";

export type NodeModel = { def: CampaignStageDef; state: StageNodeState; stars: number };

export type ChapterModel = {
  def: CampaignChapterDef;
  unlocked: boolean;
  done: number;
  total: number;
  stars: number;
};

export type MapRect = { w: number; h: number };

export const MAP_MIN_W = 560;
export const MAP_MIN_H = 900;

/** Camada de conversão Normalized → MapRect → Screen (docs/campaign/08). */
export function mapRectOf(cw: number, ch: number): MapRect {
  return { w: Math.max(cw, MAP_MIN_W), h: Math.max(ch, MAP_MIN_H) };
}

export function screenPos(rect: MapRect, def: CampaignStageDef): { x: number; y: number } {
  return { x: def.position.x * rect.w, y: def.position.y * rect.h };
}

export function useCampaignMap() {
  const cleared = useGame((s) => s.cleared);
  const campaignStars = useGame((s) => s.campaignStars);
  const heroProg = useGame((s) => s.heroProg);
  const fighting = useGame((s) => s.fighting);
  const startFight = useGame((s) => s.startFight);

  const progress: CampaignProgress = useMemo(() => {
    const levels = Object.values(heroProg ?? {}).map((p) => p.level);
    return { cleared, stars: campaignStars ?? {}, playerLevel: levels.length ? Math.max(...levels) : 1 };
  }, [cleared, campaignStars, heroProg]);

  const current = useMemo(() => currentStageId(progress), [progress]);
  const chapters: ChapterModel[] = useMemo(
    () =>
      CAMPAIGN.chapters.map((c) => {
        const { done, total, stars } = chapterProgress(c, progress);
        return { def: c, unlocked: isChapterUnlocked(c, progress), done, total, stars };
      }),
    [progress],
  );

  const [chapterId, setChapterId] = useState(() => {
    const cur = current ? CAMPAIGN_STAGE_BY_ID[current]?.chapterId : "chapter_1";
    return cur ?? "chapter_1";
  });
  const chapter = useMemo(
    () => chapters.find((c) => c.def.id === chapterId) ?? chapters[0]!,
    [chapters, chapterId],
  );

  const nodes: NodeModel[] = useMemo(
    () =>
      chapter.def.stageDefs.map((def) => ({
        def,
        state: computeStageState(def, progress),
        stars: progress.stars[def.id] ?? 0,
      })),
    [chapter, progress],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<MapRect>({ w: MAP_MIN_W, h: MAP_MIN_H });

  // Mede o container (câmera/scroll).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setRect(mapRectOf(el.clientWidth, el.clientHeight));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** focusOnStage: centraliza o nó no container, respeitando limites. */
  const focusOnStage = (stageId: string, smooth: boolean) => {
    const wrap = wrapRef.current;
    const nodeEl = contentRef.current?.querySelector<HTMLElement>(`[data-node-id="${stageId}"]`);
    if (!wrap || !nodeEl) return;
    const nx = nodeEl.offsetLeft + nodeEl.offsetWidth / 2;
    const ny = nodeEl.offsetTop + nodeEl.offsetHeight / 2;
    wrap.scrollTo({
      left: Math.max(0, nx - wrap.clientWidth / 2),
      top: Math.max(0, ny - wrap.clientHeight / 2),
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Ao abrir o mapa (ou trocar de capítulo): foca o estágio corrente.
  useEffect(() => {
    const target = chapter.def.stages.find((id) => {
      const def = CAMPAIGN_STAGE_BY_ID[id]!;
      return isChapterUnlocked(chapter.def, progress)
        ? !progress.cleared.includes(id)
        : false;
    });
    if (target) {
      // espera o nó existir no DOM
      const t = window.setTimeout(() => focusOnStage(target, false), 30);
      return () => window.clearTimeout(t);
    }
  }, [chapterId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Após uma batalha ao vivo (vitória em estágio): foca o novo corrente.
  const prevFighting = useRef(fighting);
  useEffect(() => {
    const was = prevFighting.current;
    prevFighting.current = fighting;
    if (was && !fighting && was.mode === "live" && was.rewards.win) {
      const next = currentStageId(progress);
      if (next) {
        const ch = CAMPAIGN_STAGE_BY_ID[next]?.chapterId;
        if (ch) setChapterId(ch);
        window.setTimeout(() => focusOnStage(next, true), 60);
      }
    }
  }, [fighting]); // eslint-disable-line react-hooks/exhaustive-deps

  // Eventos de progresso: deltas entre renders (docs/campaign/01).
  const prevProg = useRef<CampaignProgress>(progress);
  useEffect(() => {
    const p = prevProg.current;
    prevProg.current = progress;
    if (p.cleared === progress.cleared && p.stars === progress.stars) return;

    const added = progress.cleared.filter((id) => !p.cleared.includes(id));
    for (const id of added) {
      const def = CAMPAIGN_STAGE_BY_ID[id];
      if (!def) continue;
      const stars = progress.stars[id] ?? 0;
      emitCampaign("stage_completed", { stageId: id, stars });
      if (def.type === "boss") {
        emitCampaign("boss_defeated", { stageId: id });
        emitCampaign("chapter_completed", { chapterId: def.chapterId });
        const nextChapter = CAMPAIGN.chapters.find((c) => c.number === def.chapterNumber + 1);
        if (nextChapter && isChapterUnlocked(nextChapter, progress)) {
          emitCampaign("chapter_unlocked", { chapterId: nextChapter.id });
        }
      }
    }
    for (const id of CAMPAIGN.chapters.flatMap((c) => c.stages)) {
      const def = CAMPAIGN_STAGE_BY_ID[id]!;
      const was = computeStageState(def, p);
      const now = computeStageState(def, progress);
      if ((was === "locked" || was === "boss_locked") && (now === "unlocked" || now === "current" || now === "boss")) {
        emitCampaign("stage_unlocked", { stageId: id });
      }
    }
    emitCampaign("campaign_progress_changed", { cleared: progress.cleared, stars: progress.stars });
  }, [progress]);

  const select = (stageId: string) => {
    setSelectedId(stageId);
    emitCampaign("stage_selected", { stageId });
  };

  const play = (stageId: string) => {
    emitCampaign("stage_started", { stageId });
    setSelectedId(null);
    void startFight(stageId);
  };

  return {
    chapters,
    chapter,
    setChapterId,
    nodes,
    current,
    progress,
    selectedId,
    selectedDef: selectedId ? CAMPAIGN_STAGE_BY_ID[selectedId] ?? null : null,
    select,
    play,
    closePanel: () => setSelectedId(null),
    wrapRef,
    contentRef,
    rect,
    focusOnStage,
  };
}

export type CampaignMapModel = ReturnType<typeof useCampaignMap>;
