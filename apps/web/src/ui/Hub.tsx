import { UI } from "@relicwake/content";
import { useState } from "react";
import { useGame } from "../state";
import { ChromaImg } from "./ChromaImg";

export function Hub() {
  const collect = useGame((s) => s.collect);
  const last = useGame((s) => s.lastCollectAt);
  const cap = useGame((s) => s.capHours);
  const [msg, setMsg] = useState("");
  const hours = Math.min(cap, (Date.now() - last) / 3_600_000);

  return (
    <div className="hero-bg" style={{ backgroundImage: `url(${UI.hub})`, minHeight: "100%" }}>
      <div style={{ height: 280 }} />
      <div className="panel">
        <h1>O Spire dorme</h1>
        <p className="muted">
          Wake acumulado: {hours.toFixed(1)} h / {cap} h. Toque o baú para acordar o trecho.
        </p>
        <button
          className="cta"
          onClick={() => {
            const r = collect();
            setMsg(r.gold > 0 ? `+${r.gold} ouro em ${r.hours.toFixed(1)} h de sono.` : "O Spire ainda não rendeu.");
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <ChromaImg src={UI.chest} alt="" width={28} height={28} />
            Coletar Wake
          </span>
        </button>
        {msg && <p className="muted">{msg}</p>}
      </div>
    </div>
  );
}
