import { ENEMIES, HERO_BY_ID, HEROES, STAGES, UI } from "@relicwake/content";
import { DIRECTIVES, type DirectiveId } from "@relicwake/shared";
import { simulate, type BattleInput, type LoadoutUnit } from "@relicwake/sim";
import { useMemo, useState } from "react";
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
  const endFight = useGame((s) => s.endFight);
  const cleared = useGame((s) => s.cleared);
  const [speed, setSpeed] = useState(1);

  const input: BattleInput | null = useMemo(() => {
    if (!fighting) return null;
    const stage = STAGES.find((s) => s.id === fighting);
    if (!stage) return null;
    const allies: LoadoutUnit[] = teamIds.slice(0, 5).map((id, slot) => {
      const h = HERO_BY_ID[id] ?? HEROES[0]!;
      return { id: `a${slot}`, heroId: h.id, name: h.name, faction: h.faction, stats: h.stats, slot };
    });
    const enemies: LoadoutUnit[] = stage.enemies.map((e, i) => {
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
    return { seed: (Date.now() ^ fighting.length) >>> 0, allies, enemies, directives };
  }, [fighting, teamIds, directives]);

  const result = useMemo(() => (input ? simulate(input) : null), [input]);

  const toggle = (id: DirectiveId) => {
    const has = directives.includes(id);
    const next = has ? directives.filter((d) => d !== id) : [...directives, id].slice(-3);
    setDirectives(next);
  };

  if (fighting && input && result) {
    const stage = STAGES.find((s) => s.id === fighting)!;
    return (
      <div>
        <BattleView
          bg={stage.bg}
          input={input}
          result={result}
          speed={speed}
          onDone={() => endFight(result.winner === "ally")}
        />
        <div className="panel" style={{ marginTop: 0 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map((s) => (
              <button key={s} className="cta" style={{ flex: 1 }} onClick={() => setSpeed(s)}>
                {s}x{speed === s ? " •" : ""}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="panel">
        <h1>Spire</h1>
        <p className="muted">Três diretivas. Auto-batalha. O resultado nasce em @relicwake/sim.</p>
        <div className="dir-row">
          {DIRECTIVES.map((d) => (
            <button key={d} className={`dir ${directives.includes(d) ? "on" : ""}`} onClick={() => toggle(d)}>
              <ChromaImg src={UI.directives[d]!} alt="" />
              <span>{LABELS[d]}</span>
            </button>
          ))}
        </div>
      </div>
      {STAGES.map((s, i) => {
        const open = i === 0 || cleared.includes(STAGES[i - 1]!.id);
        return (
          <div key={s.id} className="panel">
            <h2>
              {s.id} · {s.name}
            </h2>
            <p className="muted">+{s.gold} ouro · taxa Wake {s.wakeRate}/h</p>
            <button className="cta" disabled={!open} onClick={() => startFight(s.id)}>
              {open ? "Lutar" : "Trancado"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
