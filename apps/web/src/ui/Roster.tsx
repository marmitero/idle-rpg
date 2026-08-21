import { FACTION_LABEL, GEAR_SETS, GEAR_SLOTS, HEROES, HERO_BY_ID, enhanceCost, levelCost, starDust } from "@relicwake/content";
import { useState } from "react";
import { t } from "../i18n";
import { useGame } from "../state";

/** Fileiras da grade 3x3 exibidas de trás p/ frente: 2 (topo), 1 (meio), 0 (frente). */
const ROWS: { row: number; label: string }[] = [
  { row: 2, label: "Topo" },
  { row: 1, label: "Meio" },
  { row: 0, label: "Frente" },
];

export function Roster() {
  const team = useGame((s) => s.team);
  const formation = useGame((s) => s.formation);
  const setFormation = useGame((s) => s.setFormation);
  const owned = useGame((s) => s.owned);
  const prog = useGame((s) => s.heroProg);
  const gear = useGame((s) => s.gear);
  const equipped = useGame((s) => s.equipped);
  const gold = useGame((s) => s.gold);
  const dust = useGame((s) => s.dust);
  const cmd = useGame((s) => s.cmd);
  const locale = useGame((s) => s.locale);
  const [sel, setSel] = useState(HEROES[0]!.id);
  const [all, setAll] = useState(false);
  const list = all ? HEROES : HEROES.filter((h) => owned.includes(h.id));
  const p = prog[sel] ?? { level: 1, stars: 1, imprint: 0, pas: 1, cmd: 1, ult: 1 };
  const inFormation = formation.includes(sel);
  const count = formation.filter(Boolean).length;

  const place = (slot: number) => {
    const cur = formation[slot];
    if (cur) {
      setSel(cur); // slot ocupado: seleciona para mover
      return;
    }
    if (!owned.includes(sel)) return;
    const next = [...formation];
    const from = next.indexOf(sel);
    if (from >= 0) {
      next[from] = null; // move
    } else if (count >= 5) {
      return; // formação cheia
    }
    next[slot] = sel;
    void setFormation(next);
  };

  const addSel = () => {
    if (inFormation || count >= 5 || !owned.includes(sel)) return;
    const next = [...formation];
    const i = next.indexOf(null);
    if (i >= 0) next[i] = sel;
    void setFormation(next);
  };

  const removeSel = () => {
    if (!inFormation || count <= 1) return;
    void setFormation(formation.map((id) => (id === sel ? null : id)));
  };

  return (
    <div>
      <div className="panel">
        <h1>Relíquias</h1>
        <p className="muted">
          Ouro {gold} · Poeira {dust} · {t("all_relics", locale)}
        </p>
        <button className="cta" onClick={() => setAll((v) => !v)}>
          {all ? t("owned_only", locale) : t("all_relics", locale)}
        </button>
        <div className="grid3" style={{ marginTop: 8 }}>
          {list.map((h) => (
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
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button className="cta" style={{ flex: 1 }} disabled={inFormation || count >= 5} onClick={addSel}>
            {inFormation ? "Já está na formação" : "Colocar na formação"}
          </button>
          <button className="cta" style={{ flex: 1 }} disabled={!inFormation || count <= 1} onClick={removeSel}>
            Tirar da formação
          </button>
        </div>
      </div>

      <div className="panel">
        <h2>Formação · {count}/5</h2>
        <p className="muted">
          Selecione um herói e toque num espaço para posicionar. A frente apanha primeiro; atrás fica protegido.
        </p>
        {ROWS.map(({ row, label }) => (
          <div key={row} style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0" }}>
            <div style={{ width: 46, fontSize: 11, color: "#cbb88a", textAlign: "right", flexShrink: 0 }}>{label}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, flex: 1 }}>
              {[0, 1, 2].map((col) => {
                const slot = row * 3 + col;
                const id = formation[slot] ?? null;
                const hero = id ? HERO_BY_ID[id] : null;
                return (
                  <button
                    key={slot}
                    className="card"
                    onClick={() => place(slot)}
                    style={{
                      minHeight: 56,
                      padding: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      outline: id === sel ? "1px solid #e8b15a" : undefined,
                      background: id ? undefined : "#16101c",
                    }}
                  >
                    {hero ? (
                      <img src={hero.art.icon} alt={hero.name} style={{ width: "100%", height: 52, objectFit: "contain" }} />
                    ) : (
                      <span style={{ color: "#5d5066", fontSize: 18 }}>＋</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
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
