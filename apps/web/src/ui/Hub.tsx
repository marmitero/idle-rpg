import { DAILIES, UI } from "@relicwake/content";
import { t } from "../i18n";
import { useState } from "react";
import { playSfx, unlockAudio } from "../audio";
import { useGame } from "../state";
import { ChromaImg } from "./ChromaImg";
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
  const hours = Math.min(cap, (Date.now() - last) / 3_600_000);
  if (panel === "tower") {
    return (
      <div>
        <button className="cta" style={{ margin: 12, width: "calc(100% - 24px)" }} onClick={() => setHubPanel("home")}>
          ← Hub
        </button>
        <TowerPanel />
      </div>
    );
  }
  if (panel === "arena") {
    return (
      <div>
        <button className="cta" style={{ margin: 12, width: "calc(100% - 24px)" }} onClick={() => setHubPanel("home")}>
          ← Hub
        </button>
        <ArenaPanel />
      </div>
    );
  }
  if (panel === "honor") {
    return (
      <div>
        <button className="cta" style={{ margin: 12, width: "calc(100% - 24px)" }} onClick={() => setHubPanel("home")}>
          ← Hub
        </button>
        <HonorPanel />
      </div>
    );
  }
  if (panel === "live") {
    return (
      <div>
        <button className="cta" style={{ margin: 12, width: "calc(100% - 24px)" }} onClick={() => setHubPanel("home")}>
          ← Hub
        </button>
        <LivePanel />
      </div>
    );
  }


  return (
    <div className="hero-bg" style={{ backgroundImage: `url(${UI.hub})`, minHeight: "100%" }}>
      <div style={{ height: 220 }} />
      <div className="panel">
        <h1>{t("spire_sleeps", locale)}</h1>
        <p className="muted">
          Wake acumulado: {hours.toFixed(1)} h / {cap} h.
        </p>
        <button
          className="cta"
          onClick={async () => {
            try {
              unlockAudio();
              const r = await collect();
              playSfx("collect");
              setMsg(r.gold > 0 ? `+${r.gold} ouro em ${r.hours.toFixed(1)} h de sono.` : "O Spire ainda não rendeu.");
            } catch (e) {
              setMsg(e instanceof Error ? e.message : "servidor");
            }
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <ChromaImg src={UI.chest} alt="" width={28} height={28} />
            {t("collect_wake", locale)}
          </span>
        </button>
        {msg && <p className="muted">{msg}</p>}
      </div>
      <div className="panel">
        <h2>{t("destinations", locale)}</h2>
        <div className="grid3">
          {(
            [
              ["tower", "tower"],
              ["arena", "arena"],
              ["honor", "honor"],
              ["live", "live"],
            ] as const
          ).map(([id, key]) => (
            <button key={id} className="cta" onClick={() => setHubPanel(id)}>
              {t(key, locale)}
            </button>
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>Ofício do dia</h2>
        {DAILIES.map((d) => {
          const p = prog[d.id] ?? 0;
          const done = p >= d.target;
          const took = claimed.includes(d.id);
          return (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
              <div style={{ flex: 1 }}>
                <div>{d.label}</div>
                <div className="muted">
                  {Math.min(p, d.target)}/{d.target}
                </div>
              </div>
              <button
                className="cta"
                style={{ width: 96, minHeight: 40 }}
                disabled={!done || took}
                onClick={() => claimDaily(d.id)}
              >
                {took ? "Ok" : done ? "Coletar" : "…"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
