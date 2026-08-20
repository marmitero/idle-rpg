import { HUNTS, STAGES, UI } from "@relicwake/content";
import { DIRECTIVES, type DirectiveId } from "@relicwake/shared";
import { useRef, useState } from "react";
import { useGame } from "../state";
import { BattleView } from "./BattleView";
import { ChromaImg } from "./ChromaImg";

const LABELS: Record<DirectiveId, string> = {
  foco: "Foco",
  guarda: "Guarda",
  execute: "Execute",
  mare: "Maré",
  pacto: "Pacto",
  cisma: "Cisma",
};

export function Battle() {
  const fighting = useGame((s) => s.fighting);
  const directives = useGame((s) => s.directives);
  const setDirectives = useGame((s) => s.setDirectives);
  const startFight = useGame((s) => s.startFight);
  const startHunt = useGame((s) => s.startHunt);
  const sweepHunt = useGame((s) => s.sweepHunt);
  const clearFight = useGame((s) => s.clearFight);
  const cleared = useGame((s) => s.cleared);
  const stamina = useGame((s) => s.stamina);
  const sweep = useGame((s) => s.sweep);
  const [speed, setSpeed] = useState(1);
  const [done, setDone] = useState(false);
  const [huntMsg, setHuntMsg] = useState("");
  const settled = useRef(false);

  const toggle = (id: DirectiveId) => {
    const has = directives.includes(id);
    void setDirectives(has ? directives.filter((d) => d !== id) : [...directives, id].slice(-3));
  };

  if (fighting && !done) {
    const stage = STAGES.find((s) => s.id === fighting.id);
    const hunt = HUNTS.find((h) => h.id === fighting.id);
    return (
      <div>
        <BattleView
          bg={stage?.bg ?? hunt?.bg ?? ""}
          input={fighting.input}
          result={fighting.result}
          speed={speed}
          onDone={() => {
            if (settled.current) return;
            settled.current = true;
            setDone(true);
          }}
        />
        <div className="panel" style={{ marginTop: 0 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map((s) => (
              <button key={s} className="cta" style={{ flex: 1 }} onClick={() => setSpeed(s)}>
                {s}x{speed === s ? " •" : ""}
              </button>
            ))}
            <button
              className="cta"
              style={{ flex: 1 }}
              onClick={() => {
                if (settled.current) return;
                settled.current = true;
                setDone(true);
              }}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (fighting && done) {
    const w = fighting.rewards.win;
    return (
      <div className="panel">
        <h1>{w ? "O Sono cedeu" : "O Sono pesou"}</h1>
        {w ? (
          <p className="muted">
            +{fighting.rewards.gold} ouro
            {fighting.rewards.letters ? ` · +${fighting.rewards.letters} Letters` : ""} · ledger no servidor
          </p>
        ) : (
          <p className="muted">Mude a formação ou as diretivas.</p>
        )}
        <button
          className="cta"
          onClick={() => {
            settled.current = false;
            setDone(false);
            clearFight();
          }}
        >
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="panel">
        <h1>Spire</h1>
        <p className="muted">Três diretivas. Breath {stamina}/120 · Echo {sweep}</p>
        <div className="dir-row">
          {DIRECTIVES.map((d) => (
            <button key={d} className={`dir ${directives.includes(d) ? "on" : ""}`} onClick={() => toggle(d)}>
              <ChromaImg src={UI.directives[d]!} alt="" />
              <span>{LABELS[d]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Hunts</h2>
        {HUNTS.map((h) => (
          <div key={h.id} style={{ marginBottom: 10 }}>
            <strong>{h.name}</strong>
            <p className="muted">
              {h.stamina} Breath · +{h.gold} ouro · +{h.letters} Letters
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="cta"
                onClick={async () => {
                  const r = await startHunt(h.id);
                  setHuntMsg(r.ok ? "" : (r.reason ?? ""));
                }}
              >
                Lutar
              </button>
              <button
                className="cta"
                onClick={async () => {
                  const r = await sweepHunt(h.id);
                  setHuntMsg(r.ok ? `Sweep: +${r.gold} ouro` : (r.reason ?? ""));
                }}
              >
                Sweep
              </button>
            </div>
          </div>
        ))}
        {huntMsg && <p className="muted">{huntMsg}</p>}
      </div>

      {STAGES.map((s, i) => {
        const open = i === 0 || cleared.includes(STAGES[i - 1]!.id);
        return (
          <div key={s.id} className="panel">
            <h2>
              {s.id} · {s.name}
            </h2>
            <p className="muted">
              +{s.gold} ouro · taxa Wake {s.wakeRate}/h
            </p>
            <button className="cta" disabled={!open} onClick={() => void startFight(s.id)}>
              {open ? "Lutar" : "Trancado"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
