import { DAILIES, HUB_PLAZA, HUB_WORLD, type HubWorldDef } from "@relicwake/content";
import { useState } from "react";
import { playSfx, unlockAudio } from "../audio";
import { t } from "../i18n";
import { useGame } from "../state";
import { NoticeBoard, SparkleBurst, WakeBar, WorldObject } from "./gameUI";
import { ArenaPanel, HonorPanel, LivePanel, TowerPanel } from "./Modes";

export function Hub() {
  const collect = useGame((s) => s.collect);
  const last = useGame((s) => s.lastCollectAt);
  const cap = useGame((s) => s.capHours);
  const prog = useGame((s) => s.dailyProg);
  const claimed = useGame((s) => s.dailyClaimed);
  const claimDaily = useGame((s) => s.claimDaily);
  const panel = useGame((s) => s.hubPanel);
  const setHubPanel = useGame((s) => s.setHubPanel);
  const locale = useGame((s) => s.locale);
  const [msg, setMsg] = useState("");
  const [burst, setBurst] = useState(0);
  const hours = Math.min(cap, (Date.now() - last) / 3_600_000);

  const open = (def: HubWorldDef) => {
    if (def.action === "open_tower") setHubPanel("tower");
    else if (def.action === "open_arena") setHubPanel("arena");
    else if (def.action === "open_honor") setHubPanel("honor");
    else if (def.action === "open_live" || def.action === "open_mail") setHubPanel("live");
  };

  const collectWake = async () => {
    try {
      unlockAudio();
      const r = await collect();
      playSfx("collect");
      setBurst((b) => b + 1);
      setMsg(r.gold > 0 ? `+${r.gold} ouro em ${r.hours.toFixed(1)} h de sono.` : "O Spire ainda não rendeu.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "servidor");
    }
  };

  if (panel !== "home") {
    return (
      <div>
        <button className="cta back-cta" onClick={() => setHubPanel("home")}>
          ← Hub
        </button>
        {panel === "tower" && <TowerPanel />}
        {panel === "arena" && <ArenaPanel />}
        {panel === "honor" && <HonorPanel />}
        {panel === "live" && <LivePanel />}
      </div>
    );
  }

  return (
    <div className="hub-scene">
      <div className="hub-bg" style={{ backgroundImage: `url(${HUB_PLAZA})` }} />
      <div className="hub-shade" />

      <div className="hub-title">{t("spire_sleeps", locale)}</div>

      <div className="hub-world">
        {HUB_WORLD.map((def) => (
          <WorldObject
            key={def.id}
            def={def}
            locale={locale}
            onActivate={(d) => {
              if (d.action === "collect") void collectWake();
              else open(d);
            }}
          >
            {def.id === "font" ? <WakeBar hours={hours} cap={cap} /> : null}
          </WorldObject>
        ))}
        {burst > 0 && <SparkleBurst key={burst} />}
      </div>

      {msg && <div className="hub-msg">{msg}</div>}

      <div className="hub-board">
        <NoticeBoard title={t("daily", locale)}>
          {DAILIES.map((d) => {
            const p = prog[d.id] ?? 0;
            const done = p >= d.target;
            const took = claimed.includes(d.id);
            return (
              <div key={d.id} className="daily-row">
                <div className="daily-info">
                  <div>{d.label}</div>
                  <div className="muted">
                    {Math.min(p, d.target)}/{d.target}
                  </div>
                </div>
                <button
                  className="cta daily-btn"
                  disabled={!done || took}
                  onClick={() => claimDaily(d.id)}
                >
                  {took ? "Ok" : done ? "Coletar" : "…"}
                </button>
              </div>
            );
          })}
        </NoticeBoard>
      </div>
    </div>
  );
}
