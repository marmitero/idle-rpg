/** Bus tipado de eventos de campanha (docs/campaign/01 §Eventos).
 * Fraco acoplamento: outros sistemas assinam sem depender do mapa. */

export type CampaignEventMap = {
  stage_selected: { stageId: string };
  stage_started: { stageId: string };
  stage_completed: { stageId: string; stars: number };
  stage_unlocked: { stageId: string };
  chapter_completed: { chapterId: string };
  chapter_unlocked: { chapterId: string };
  boss_defeated: { stageId: string };
  campaign_progress_changed: { cleared: string[]; stars: Record<string, number> };
};

type AnyHandler = (payload: never) => void;
const handlers = new Map<keyof CampaignEventMap, Set<AnyHandler>>();

export function onCampaign<K extends keyof CampaignEventMap>(
  event: K,
  fn: (payload: CampaignEventMap[K]) => void,
): () => void {
  let set = handlers.get(event);
  if (!set) {
    set = new Set();
    handlers.set(event, set);
  }
  set.add(fn as AnyHandler);
  return () => set.delete(fn as AnyHandler);
}

export function emitCampaign<K extends keyof CampaignEventMap>(event: K, payload: CampaignEventMap[K]): void {
  handlers.get(event)?.forEach((fn) => fn(payload as never));
}
