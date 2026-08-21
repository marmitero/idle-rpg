/** Caminhos entre nós — SVG, estilo derivado do estado do destino
 * (docs/campaign/04). Dados: topologia (connections) + posições normalizadas. */

import { CAMPAIGN_STAGE_BY_ID } from "@relicwake/content";
import type { CampaignStageDef, StageNodeState } from "@relicwake/content";

export function stagePathClass(state: StageNodeState): string {
  if (state === "boss" || state === "boss_locked") return "path-boss";
  if (state === "completed" || state === "perfect") return "path-completed";
  if (state === "current" || state === "unlocked") return "path-active";
  return "path-locked";
}

export function StagePath({
  rect,
  nodes,
  stateOf,
}: {
  rect: { w: number; h: number };
  nodes: { def: CampaignStageDef; state: StageNodeState }[];
  stateOf: (id: string) => StageNodeState;
}) {
  const segments: { x1: number; y1: number; x2: number; y2: number; cls: string; key: string }[] = [];
  for (const node of nodes) {
    for (const targetId of node.def.connections) {
      const target = CAMPAIGN_STAGE_BY_ID[targetId];
      if (!target) continue;
      const a = node.def.position;
      const b = target.position;
      const x1 = a.x * rect.w;
      const y1 = a.y * rect.h;
      const x2 = b.x * rect.w;
      const y2 = b.y * rect.h;
      const mx = (x1 + x2) / 2;
      segments.push({
        key: `${node.def.id}->${targetId}`,
        x1,
        y1,
        x2,
        y2,
        cls: stagePathClass(stateOf(targetId)),
      });
      void mx;
    }
  }
  return (
    <svg className="campaign-paths" width={rect.w} height={rect.h} aria-hidden>
      {segments.map((s) => (
        <path
          key={s.key}
          className={s.cls}
          d={`M ${s.x1} ${s.y1} C ${s.x1} ${(s.y1 + s.y2) / 2}, ${s.x2} ${(s.y1 + s.y2) / 2}, ${s.x2} ${s.y2}`}
        />
      ))}
    </svg>
  );
}
