import { FACTION_LABEL, GEAR_SETS, GEAR_SLOTS, HEROES, enhanceCost, levelCost, starDust } from "@relicwake/content";
import { useState } from "react";
import { useGame } from "../state";

export function Roster() {
  const team = useGame((s) => s.team);
  const prog = useGame((s) => s.heroProg);
  const gear = useGame((s) => s.gear);
  const equipped = useGame((s) => s.equipped);
  const gold = useGame((s) => s.gold);
  const dust = useGame((s) => s.dust);
  const cmd = useGame((s) => s.cmd);
  const [sel, setSel] = useState(HEROES[0]!.id);
  const p = prog[sel] ?? { level: 1, stars: 1, imprint: 0, pas: 1, cmd: 1, ult: 1 };
  const toggleTeam = (id: string) => {
    const next = team.includes(id) ? team.filter((x) => x !== id) : [...team, id].slice(0, 5);
    void cmd("/api/team", { team: next });
  };
  return (
    <div>
      <div className="panel">
        <h1>Relíquias</h1>
        <p className="muted">
          Ouro {gold} · Poeira {dust} · Resonance puxa os 5 mais altos.
        </p>
        <div className="grid3">
          {HEROES.map((h) => (
            <button
              key={h.id}
              className="card"
              onClick={() => setSel(h.id)}
              style={{ outline: sel === h.id ? "1px solid #e8b15a" : team.includes(h.id) ? "1px solid #3e8c8a" : undefined }}
            >
              <img className="bust" src={h.art.bust} alt={h.name} />
              <div className="nm">{h.name}</div>
              <div className="ep">
                {FACTION_LABEL[h.faction]} · {prog[h.id]?.level ?? 1}nv
              </div>
            </button>
          ))}
        </div>
        <button className="cta" style={{ marginTop: 10 }} onClick={() => toggleTeam(sel)}>
          {team.includes(sel) ? "Tirar do time" : "Colocar no time"}
        </button>
      </div>
      <div className="panel">
        <h2>
          {HEROES.find((h) => h.id === sel)?.name} · nv {p.level} · {p.stars}★ · imprint {p.imprint}
        </h2>
        <p className="muted">
          Skills pas {p.pas} / cmd {p.cmd} / ult {p.ult}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="cta" style={{ flex: 1 }} onClick={() => void cmd("/api/hero/level", { id: sel })}>
            Nível ({levelCost(p.level)})
          </button>
          <button className="cta" style={{ flex: 1 }} onClick={() => void cmd("/api/hero/star", { id: sel })}>
            Estrela ({starDust(p.stars)} poeira)
          </button>
          <button className="cta" style={{ flex: 1 }} onClick={() => void cmd("/api/hero/imprint", { id: sel })}>
            Imprint
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {(["pas", "cmd", "ult"] as const).map((w) => (
            <button key={w} className="cta" onClick={() => void cmd("/api/hero/skill", { id: sel, which: w })}>
              {w}
            </button>
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>Gear · 4 slots, 4 sets</h2>
        {GEAR_SLOTS.map((slot) => {
          const pieces = gear.filter((g) => g.slot === slot);
          return (
            <div key={slot} style={{ marginBottom: 8 }}>
              <strong>{slot}</strong>
              {pieces.map((g) => (
                <div key={g.id} className="stage-row">
                  <div>
                    {g.set} +{g.plus} {equipped[slot] === g.id ? "· vestido" : ""}
                  </div>
                  <button className="cta" style={{ width: 72 }} onClick={() => void cmd("/api/gear/equip", { id: g.id })}>
                    Equip
                  </button>
                  <button className="cta" style={{ width: 88 }} onClick={() => void cmd("/api/gear/enhance", { id: g.id })}>
                    + ({enhanceCost(g.plus)})
                  </button>
                </div>
              ))}
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {GEAR_SETS.map((s) => (
            <button key={s.id} className="cta" style={{ flex: 1 }} onClick={() => void cmd("/api/gear/craft", { slot: "weapon", set: s.id })}>
              Craft {s.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
