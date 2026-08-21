/**
 * Campaign State — motor puro de progresso, desbloqueio e estados do mapa
 * (docs/campaign/03, 05 e 06). Sem UI, sem I/O: testável de ponta a ponta.
 */

import { CAMPAIGN, CAMPAIGN_ORDER, CAMPAIGN_STAGE_BY_ID } from "./campaign";
import type { CampaignChapterDef, CampaignDefinition, CampaignStageDef, UnlockRequirement } from "./campaign";

export type CampaignProgress = {
  cleared: string[];
  stars: Record<string, number>;
  playerLevel?: number;
};

export const EMPTY_PROGRESS: CampaignProgress = { cleared: [], stars: {} };

export type StageNodeState =
  | "locked"
  | "unlocked"
  | "current"
  | "completed"
  | "perfect"
  | "boss"
  | "boss_locked";

// ── Unlock engine (docs/campaign/06) ────────────────────────────────────────

export function requirementMet(req: UnlockRequirement, progress: CampaignProgress, campaign: CampaignDefinition = CAMPAIGN): boolean {
  switch (req.type) {
    case "none":
      return true;
    case "previous_stage":
      return progress.cleared.includes(req.stageId);
    case "multiple_stages":
      return req.requiredStages.every((id) => progress.cleared.includes(id));
    case "chapter_completion": {
      const ch = campaign.chapters.find((c) => c.id === req.chapterId);
      return ch ? progress.cleared.includes(ch.bossStageId) : false;
    }
    case "player_level":
      return (progress.playerLevel ?? 0) >= req.level;
    case "boss_defeated":
      return progress.cleared.includes(req.bossStageId);
  }
}

export function isStageUnlocked(def: CampaignStageDef, progress: CampaignProgress, campaign: CampaignDefinition = CAMPAIGN): boolean {
  return requirementMet(def.unlockRequirement, progress, campaign);
}

export function isChapterUnlocked(ch: CampaignChapterDef, progress: CampaignProgress, campaign: CampaignDefinition = CAMPAIGN): boolean {
  return requirementMet(ch.unlockRequirement, progress, campaign);
}

// ── Progresso derivado ──────────────────────────────────────────────────────

/** Primeiro estágio desbloqueado e não concluído, na ordem canônica. */
export function currentStageId(progress: CampaignProgress, campaign: CampaignDefinition = CAMPAIGN): string | null {
  for (const id of CAMPAIGN_ORDER) {
    const def = CAMPAIGN_STAGE_BY_ID[id];
    if (!def) continue;
    if (progress.cleared.includes(id)) continue;
    if (isStageUnlocked(def, progress, campaign)) return id;
  }
  return null;
}

export function chapterProgress(ch: CampaignChapterDef, progress: CampaignProgress): { done: number; total: number; stars: number } {
  const total = ch.stages.length;
  const done = ch.stages.filter((id) => progress.cleared.includes(id)).length;
  const stars = ch.stages.reduce((acc, id) => acc + (progress.stars[id] ?? 0), 0);
  return { done, total, stars };
}

// ── Máquina de estados do nó (docs/campaign/05) ─────────────────────────────

export function computeStageState(
  def: CampaignStageDef,
  progress: CampaignProgress,
  campaign: CampaignDefinition = CAMPAIGN,
): StageNodeState {
  const current = currentStageId(progress, campaign);
  if (!isStageUnlocked(def, progress, campaign)) {
    return def.type === "boss" ? "boss_locked" : "locked";
  }
  if (progress.cleared.includes(def.id)) {
    return (progress.stars[def.id] ?? 0) >= campaign.settings.maxStars ? "perfect" : "completed";
  }
  if (def.id === current) return def.type === "boss" ? "boss" : "current";
  return def.type === "boss" ? "boss" : "unlocked";
}

/** Texto legível do requisito (para o painel de bloqueado). */
export function describeRequirement(req: UnlockRequirement): string {
  switch (req.type) {
    case "none":
      return "Disponível";
    case "previous_stage":
      return `Complete ${req.stageId} para desbloquear.`;
    case "multiple_stages":
      return `Complete ${req.requiredStages.join(", ")} para desbloquear.`;
    case "chapter_completion":
      return `Derrote o boss do capítulo ${req.chapterId.replace("chapter_", "")} para desbloquear.`;
    case "player_level":
      return `Alcance o nível de conta ${req.level} para desbloquear.`;
    case "boss_defeated":
      return `Derrote ${req.bossStageId} para desbloquear.`;
  }
}

// ── Estrelas (docs/campaign/03) ─────────────────────────────────────────────

/** 0 = derrota; vitória: 3 com 100% vivos, 2 com ≥60%, senão 1. */
export function starsFromBattle(win: boolean, allyAliveRatio: number, maxStars = 3): number {
  if (!win) return 0;
  if (maxStars <= 1) return 1;
  if (allyAliveRatio >= 0.99) return maxStars;
  if (allyAliveRatio >= 0.6) return Math.min(2, maxStars);
  return 1;
}

/** Nunca regride: mantém o máximo por estágio. */
export function mergeStars(stars: Record<string, number>, stageId: string, value: number): Record<string, number> {
  return { ...stars, [stageId]: Math.max(stars[stageId] ?? 0, value) };
}
