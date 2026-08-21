/**
 * Campaign Map — definição data-driven da campanha (docs/campaign/02).
 *
 * Projeta o gameplay existente (STAGES/CHAPTERS) para o formato do mapa:
 * posições normalizadas, tipos, conexões, requisitos e recompensas.
 * Nenhum progresso do jogador vive aqui (docs/campaign/03).
 */

import { CHAPTERS, STAGES } from "./stages";

export type StageType = "normal" | "elite" | "boss" | "event" | "special";

/** Posição normalizada (0..1) no mapa do capítulo — docs/campaign/08. */
export type NodePosition = { x: number; y: number };

export type UnlockRequirement =
  | { type: "none" }
  | { type: "previous_stage"; stageId: string }
  | { type: "multiple_stages"; requiredStages: string[] }
  | { type: "chapter_completion"; chapterId: string }
  | { type: "player_level"; level: number }
  | { type: "boss_defeated"; bossStageId: string };

export type CampaignStageDef = {
  id: string;
  chapterId: string;
  chapterNumber: number;
  number: number;
  type: StageType;
  title: string;
  description: string;
  scene: string;
  position: NodePosition;
  connections: string[];
  unlockRequirement: UnlockRequirement;
  rewards: { gold: number; wakeRate: number };
  /** Heurística de exibição (poder recomendado) — não é fórmula de combate. */
  recommendedPower: number;
};

export type CampaignChapterDef = {
  id: string;
  number: number;
  title: string;
  description: string;
  background: string;
  bossStageId: string;
  unlockRequirement: UnlockRequirement;
  /** ids ordenados (frente de render/topologia) */
  stages: string[];
  /** definições completas, na mesma ordem de `stages` */
  stageDefs: CampaignStageDef[];
};

export type CampaignSettings = { starSystem: "stars" | "none"; maxStars: number };

export type CampaignDefinition = {
  id: string;
  title: string;
  settings: CampaignSettings;
  chapters: CampaignChapterDef[];
};

// ── Layout do mapa (dados de configuração do capítulo) ──────────────────────
// Serpentina de 4 colunas, de baixo (estágio 1) para cima; boss no topo central.
const COLS = 4;
const X0 = 0.08;
const X1 = 0.92;
const Y_TOP = 0.1;
const Y_BOTTOM = 0.88;

function layoutPosition(orderIndex: number, totalNodes: number, isBoss: boolean): NodePosition {
  if (isBoss) return { x: 0.5, y: 0.055 };
  const rows = Math.max(1, Math.ceil(totalNodes / COLS));
  const row = Math.floor(orderIndex / COLS);
  const col = orderIndex % COLS;
  const dir = row % 2 === 0 ? col : COLS - 1 - col;
  const x = X0 + (dir / (COLS - 1)) * (X1 - X0);
  const y = Y_BOTTOM - (row / (rows - 1)) * (Y_BOTTOM - Y_TOP);
  return { x, y };
}

const stageTypeOf = (s: (typeof STAGES)[number]): StageType =>
  s.boss && s.index === 20 ? "boss" : s.boss && s.index === 10 ? "elite" : "normal";

/** Poder recomendado de exibição: Σ base por tipo de inimigo × escala. */
function recommendedPower(s: (typeof STAGES)[number]): number {
  const baseOf = (id: string) => (id.includes("boss") ? 260 : id.includes("elite") ? 110 : 60);
  const total = s.enemies.reduce((acc, e) => acc + baseOf(e.enemyId) * e.scale, 0);
  return Math.max(50, Math.round(total / 50) * 50);
}

function buildStageDefs(chapterNumber: number, ci: number): CampaignStageDef[] {
  const stages = STAGES.filter((s) => s.chapter === chapterNumber);
  const nonBoss = stages.filter((s) => !s.boss);
  const chapterId = `chapter_${chapterNumber}`;
  return stages.map((s) => {
    const idx = stages.indexOf(s);
    const prev = stages[idx - 1];
    const next = stages[idx + 1];
    const unlock: UnlockRequirement =
      s.index === 1
        ? ci === 0
          ? { type: "none" }
          : { type: "chapter_completion", chapterId: `chapter_${chapterNumber - 1}` }
        : prev
          ? { type: "previous_stage", stageId: prev.id }
          : { type: "none" };
    return {
      id: s.id,
      chapterId,
      chapterNumber,
      number: s.index,
      type: stageTypeOf(s),
      title: s.name,
      description: s.name,
      scene: s.bg,
      position: layoutPosition(!!s.boss ? nonBoss.length : nonBoss.indexOf(s), nonBoss.length, !!s.boss),
      connections: next ? [next.id] : [],
      unlockRequirement: unlock,
      rewards: { gold: s.gold, wakeRate: s.wakeRate },
      recommendedPower: recommendedPower(s),
    };
  });
}

export const CAMPAIGN: CampaignDefinition = (() => {
  const chapters: CampaignChapterDef[] = CHAPTERS.map((c, ci) => {
    const stageDefs = buildStageDefs(c.chapter, ci);
    const boss = stageDefs.find((d) => d.type === "boss");
    return {
      id: `chapter_${c.chapter}`,
      number: c.chapter,
      title: c.name,
      description: c.blurb,
      background: c.bg,
      bossStageId: boss?.id ?? `${c.chapter}-20`,
      unlockRequirement:
        ci === 0
          ? ({ type: "none" } as const)
          : ({ type: "chapter_completion", chapterId: `chapter_${c.chapter - 1}` } as const),
      stages: stageDefs.map((d) => d.id),
      stageDefs,
    };
  });
  return { id: "main_campaign", title: "O Spire", settings: { starSystem: "stars", maxStars: 3 }, chapters };
})();

export const CAMPAIGN_CHAPTER_BY_ID: Record<string, CampaignChapterDef> = Object.fromEntries(
  CAMPAIGN.chapters.map((c) => [c.id, c]),
);

export const CAMPAIGN_STAGE_BY_ID: Record<string, CampaignStageDef> = Object.fromEntries(
  CAMPAIGN.chapters.flatMap((c) => c.stageDefs.map((d) => [d.id, d])),
);

/** Ordem canônica da campanha inteira (capítulo, depois estágio). */
export const CAMPAIGN_ORDER: string[] = CAMPAIGN.chapters.flatMap((c) => c.stages);
