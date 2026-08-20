import { DAILIES, UI } from "@relicwake/content";
import { useState } from "react";
import { useGame } from "../state";
import { ChromaImg } from "./ChromaImg";

export function Hub() {
  const collect = useGame((s) => s.collect);
  const last = useGame((s) => s.lastCollectAt);
  const cap = useGame((s) => s.capHours);
  const prog = useGame((s) => s.dailyProg);
  const claimed = useGame((s) => s.dailyClaimed);
  const claimDaily = useGame((s) => s.claimDaily);
  const [msg, setMsg] = useState("");
  const hours = Math.min(cap, (Date.now() - last) / 3_600_000);


  return (
    <div className="hero-bg" style={{ backgroundImage: `url(${UI.hub})`, minHeight: "100%" }}>
      <div style={{ height: 220 }} />
      <div className="panel">
        <h1>O Spire dorme</h1>
        <p className="muted">
          Wake acumulado: {hours.toFixed(1)} h / {cap} h.
        </p>
        <button
          className="cta"
          onClick={async () => {
            try {
              const r = await collect();
              setMsg(r.gold > 0 ? `+${r.gold} ouro em ${r.hours.toFixed(1)} h de sono.` : "O Spire ainda não rendeu.");
            } catch (e) {
              setMsg(e instanceof Error ? e.message : "servidor");
            }
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <ChromaImg src={UI.chest} alt="" width={28} height={28} />
            Coletar Wake
          </span>
        </button>
        {msg && <p className="muted">{msg}</p>}
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
