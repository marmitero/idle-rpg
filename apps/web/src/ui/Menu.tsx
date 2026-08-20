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
        <p className="muted">Letters: {letters} · Pity Relic {pity}/70. Pull no servidor (crypto).</p>
        <button
          className="cta"
          disabled={letters < 1}
          onClick={async () => {
            try {
              const r = await pull();
              setLog(`${r.rarity} — ${r.heroId}`);
            } catch (e) {
              setLog(e instanceof Error ? e.message : "erro");
            }
          }}
        >
          Puxar (1 Letter)
        </button>
        {log && <p className="muted">{log}</p>}
      </div>
      <div className="panel">
        <h2>Menu</h2>
        <p className="muted">Conta por device-id. Economia no ledger da API. Sem IAP neste slice.</p>
      </div>
    </div>
  );
}
