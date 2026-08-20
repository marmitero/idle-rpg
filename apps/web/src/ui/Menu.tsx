import { UI } from "@relicwake/content";
import { useState } from "react";
import { useGame } from "../state";

export function Menu() {
  const letters = useGame((s) => s.letters);
  const pity = useGame((s) => s.pity);
  const pull = useGame((s) => s.pull);
  const [log, setLog] = useState("");

  return (
    <div className="hero-bg" style={{ backgroundImage: `url(${UI.font})` }}>
      <div className="panel">
        <h1>A Font</h1>
        <p className="muted">Letters: {letters} · Pity Relic {pity}/70. Odds na tela — slice local, sem IAP.</p>
        <button
          className="cta"
          disabled={letters < 1}
          onClick={() => {
            const r = pull();
            setLog(`${r.rarity} — ${r.heroId}`);
          }}
        >
          Puxar (1 Letter)
        </button>
        {log && <p className="muted">{log}</p>}
      </div>
      <div className="panel">
        <h2>Menu</h2>
        <p className="muted">PT-BR · save no aparelho · combate simulado em @relicwake/sim.</p>
        <button
          className="cta"
          onClick={() => {
            localStorage.removeItem("relicwake.slice.v1");
            location.reload();
          }}
        >
          Resetar save do slice
        </button>
      </div>
    </div>
  );
}
