/** Painel contextual de estágio (normal / bloqueado / boss) — docs/campaign/04. */

import { describeRequirement, type CampaignStageDef, type StageNodeState } from "@relicwake/content";
import { playSfx } from "../../audio";

export function StageInfoPanel({
  def,
  state,
  stars,
  onPlay,
  onClose,
}: {
  def: CampaignStageDef;
  state: StageNodeState;
  stars: number;
  onPlay: (id: string) => void;
  onClose: () => void;
}) {
  const locked = state === "locked" || state === "boss_locked";
  const done = state === "completed" || state === "perfect";
  const boss = def.type === "boss";
  const btn = boss ? "FIGHT" : done ? "REPLAY" : "PLAY";

  return (
    <div className="stage-info">
      {boss && !locked ? (
        <>
          <div className="stage-info-type">BOSS DO CAPÍTULO</div>
          <h2>{def.title}</h2>
          <p className="muted">{def.description}</p>
          <p className="stage-power">Poder recomendado ≈ {def.recommendedPower}</p>
          {done ? (
            <p className="stage-stars">
              ★{"★".repeat(Math.max(0, stars - 1))} {stars}/3
            </p>
          ) : null}
        </>
      ) : locked ? (
        <>
          <div className="stage-info-type">🔒 BLOQUEADO</div>
          <h2>
            {def.id} · {def.title}
          </h2>
          <p className="muted">{describeRequirement(def.unlockRequirement)}</p>
        </>
      ) : (
        <>
          <div className="stage-info-type">STAGE {def.id}</div>
          <h2>{def.title}</h2>
          <p className="muted">
            {def.description} · +{def.rewards.gold} ouro · Wake {def.rewards.wakeRate}/h
          </p>
          <p className="stage-stars">
            {[0, 1, 2].map((i) => (
              <span key={i} className={i < stars ? "on" : ""}>
                ★
              </span>
            ))}{" "}
            {stars}/3
          </p>
        </>
      )}
      <div className="stage-info-actions">
        {!locked && (
          <button
            className="cta"
            style={{ flex: 1 }}
            onClick={() => {
              playSfx("ui");
              onPlay(def.id);
            }}
          >
            {btn}
          </button>
        )}
        <button className="cta" style={{ flex: 1 }} onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
}
