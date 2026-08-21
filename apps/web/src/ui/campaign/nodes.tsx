/** Componentes de nó do Campaign Map — puramente apresentacionais
 * (docs/campaign/04). O estado vem pronto do controller; aqui só aparência. */

import { CAMPAIGN, type CampaignStageDef, type StageNodeState } from "@relicwake/content";

function Stars({ n, dim }: { n: number; dim?: boolean }) {
  return (
    <span className={`cnode-stars${dim ? " dim" : ""}`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? "on" : ""}>
          ★
        </span>
      ))}
    </span>
  );
}

export function StageNode({
  def,
  state,
  stars,
  isCurrent,
  left,
  top,
  onSelect,
}: {
  def: CampaignStageDef;
  state: StageNodeState;
  stars: number;
  isCurrent: boolean;
  left: number;
  top: number;
  onSelect: (id: string) => void;
}) {
  const locked = state === "locked" || state === "boss_locked";
  const done = state === "completed" || state === "perfect";
  const elite = def.type === "elite";
  const cls = [
    "cnode",
    elite ? "cnode-elite" : "",
    locked ? "cnode-locked" : "",
    done ? "cnode-done" : "",
    isCurrent ? "cnode-current" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      className={cls}
      data-node-id={def.id}
      style={{ left, top }}
      onClick={() => onSelect(def.id)}
    >
      {locked ? <span className="cnode-lock">🔒</span> : null}
      {done ? <Stars n={stars} /> : <span className="cnode-id">{def.id}</span>}
    </button>
  );
}

export function BossNode({
  def,
  state,
  stars,
  isCurrent,
  left,
  top,
  onSelect,
}: {
  def: CampaignStageDef;
  state: StageNodeState;
  stars: number;
  isCurrent: boolean;
  left: number;
  top: number;
  onSelect: (id: string) => void;
}) {
  const locked = state === "boss_locked";
  const done = state === "completed" || state === "perfect";
  const cls = [
    "cnode",
    "cnode-boss",
    locked ? "cnode-locked" : "",
    done ? "cnode-done" : "",
    isCurrent ? "cnode-current" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      className={cls}
      data-node-id={def.id}
      style={{ left, top }}
      onClick={() => onSelect(def.id)}
    >
      <span className="cnode-crown">{locked ? "🔒" : "👑"}</span>
      <span className="cnode-boss-label">BOSS</span>
      {done ? <Stars n={stars} /> : null}
    </button>
  );
}

export function ChapterMarker({ number, title, blurb, done, total, stars }: {
  number: number;
  title: string;
  blurb: string;
  done: number;
  total: number;
  stars: number;
}) {
  const maxStars = CAMPAIGN.settings.maxStars;
  return (
    <div className="campaign-header">
      <div className="campaign-title">
        CAPÍTULO {number} · {title}
      </div>
      <div className="campaign-blurb">{blurb}</div>
      <div className="campaign-progress muted">
        {done}/{total} · ★ {stars}/{total * maxStars}
      </div>
    </div>
  );
}
