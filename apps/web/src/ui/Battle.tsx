import { ENEMIES, HERO_BY_ID, HEROES, HUNTS, STAGES, UI } from "@relicwake/content";
import { DIRECTIVES, type DirectiveId } from "@relicwake/shared";
import { simulate, type BattleInput, type LoadoutUnit } from "@relicwake/sim";
import { useMemo, useRef, useState } from "react";
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

function scaled(stats: LoadoutUnit["stats"], s: number): LoadoutUnit["stats"] {
  return {
    hp: Math.round(stats.hp * s),
    atk: Math.round(stats.atk * s),
    def: Math.round(stats.def * s),
    spd: stats.spd,
    crit: stats.crit,
  };
}

export function Battle() {
  const fighting = useGame((s) => s.fighting);
  const teamIds = useGame((s) => s.team);
  const directives = useGame((s) => s.directives);
  const setDirectives = useGame((s) => s.setDirectives);
  const startFight = useGame((s) => s.startFight);
  const startHunt = useGame((s) => s.startHunt);
  const endFight = useGame((s) => s.endFight);
  const cleared = useGame((s) => s.cleared);
  const stamina = useGame((s) => s.stamina);
  const sweep = useGame((s) => s.sweep);
  const tickStamina = useGame((s) => s.tickStamina);
  const [speed, setSpeed] = useState(1);
  const [outcome, setOutcome] = useState<null | { win: boolean; gold: number; letters: number }>(null);
  const [huntMsg, setHuntMsg] = useState("");
  const settled = useRef(false);

  const input: BattleInput | null = useMemo(() => {
    if (!fighting) return null;
    const stage = STAGES.find((s) => s.id === fighting);
    const hunt = HUNTS.find((h) => h.id === fighting);
    const allies: LoadoutUnit[] = teamIds.slice(0, 5).map((id, slot) => {
      const h = HERO_BY_ID[id] ?? HEROES[0]!;
      return { id: `a${slot}`, heroId: h.id, name: h.name, faction: h.faction, stats: h.stats, slot };
    });
    let enemies: LoadoutUnit[] = [];
    if (stage) {
      enemies = stage.enemies.map((e, i) => {
        const def = ENEMIES.find((x) => x.id === e.enemyId) ?? ENEMIES[0]!;
        return {
          id: `e${i}`,
          heroId: def.id,
          name: def.name,
          faction: def.faction,
          stats: scaled(def.stats, e.scale),
          slot: e.slot,
        };
      });
    } else if (hunt) {
      const def = ENEMIES.find((x) => x.id === hunt.enemyId) ?? ENEMIES[0]!;
      enemies = [0, 2, 3].map((slot, i) => ({
        id: `e${i}`,
        heroId: def.id,
        name: def.name,
        faction: def.faction,
        stats: scaled(def.stats, i === 0 ? 1 : 0.72),
        slot,
      }));
    } else return null;
    return { seed: (Date.now() ^ fighting.length) >>> 0, allies, enemies, directives };
  }, [fighting, teamIds, directives]);

  const result = useMemo(() => (input ? simulate(input) : null), [input]);

  const toggle = (id: DirectiveId) => {
    const has = directives.includes(id);
    setDirectives(has ? directives.filter((d) => d !== id) : [...directives, id].slice(-3));
  };

  const finish = (win: boolean) => {
    if (settled.current) return;
    settled.current = true;
    const r = endFight(win);
    setOutcome({ win, gold: r.gold, letters: r.letters });
  };

  if (fighting && input && result && !outcome) {
    const stage = STAGES.find((s) => s.id === fighting);
    const hunt = HUNTS.find((h) => h.id === fighting);
    const bg = stage?.bg ?? hunt?.bg ?? "";
    return (
      <div>
        <BattleView
          bg={bg}
          input={input}
          result={result}
          speed={speed}
          onDone={() => finish(result.winner === "ally")}
        />
        <div className="panel" style={{ marginTop: 0 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map((s) => (
              <button key={s} className="cta" style={{ flex: 1 }} onClick={() => setSpeed(s)}>
                {s}x{speed === s ? " •" : ""}
              </button>
            ))}
            <button className="cta" style={{ flex: 1 }} onClick={() => finish(result.winner === "ally")}>
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (outcome) {
    return (
      <div className="panel">
        <h1>{outcome.win ? "O Sono cedeu" : "O Sono pesou"}</h1>
        {outcome.win ? (
          <p className="muted">
            +{outcome.gold} ouro{outcome.letters ? ` · +${outcome.letters} Letters` : ""}
          </p>
        ) : (
          <p className="muted">Mude a formação ou as diretivas.</p>
        )}
        <button
          className="cta"
          onClick={() => {
            settled.current = false;
            setOutcome(null);
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
                onClick={() => {
                  tickStamina();
                  const r = startHunt(h.id);
                  setHuntMsg(r.ok ? "" : (r.reason ?? ""));
                }}
              >
                Lutar
              </button>
              <button
                className="cta"
                onClick={() => {
                  tickStamina();
                  const r = startHunt(h.id, true);
                  setHuntMsg(r.ok ? `Sweep: +${h.gold} ouro` : (r.reason ?? ""));
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
            <button className="cta" disabled={!open} onClick={() => startFight(s.id)}>
              {open ? "Lutar" : "Trancado"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
