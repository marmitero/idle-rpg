import { ACT_CUTSCENES, BG, CHAPTERS, HUNT_UNLOCK_STAGE, HUNTS, STAGES, TUTORIAL_DONE, UI, isStageOpen } from "@relicwake/content";
import { DIRECTIVES, type DirectiveId } from "@relicwake/shared";
import { useEffect, useRef, useState } from "react";
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

function contentName(id: string): string {
  return STAGES.find((s) => s.id === id)?.name ?? HUNTS.find((h) => h.id === id)?.name ?? id;
}

function fightBg(id: string, stageBg?: string, huntBg?: string): string {
  if (stageBg) return stageBg;
  if (huntBg) return huntBg;
  if (id.startsWith("tower")) return BG.crown;
  if (id.startsWith("ftower")) return BG.ember;
  if (id === "gwar") return UI.guild;
  return BG.spire;
}

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
  const replays = useGame((s) => s.replays);
  const openReplay = useGame((s) => s.openReplay);
  const tutorialStep = useGame((s) => s.tutorialStep);
  const [speed, setSpeed] = useState(1);
  const [openCh, setOpenCh] = useState(1);
  const [done, setDone] = useState(false);
  const [huntMsg, setHuntMsg] = useState("");
  const [huntLv, setHuntLv] = useState<Record<string, number>>({});
  const locale = useGame((s) => s.locale);
  const settled = useRef(false);

  useEffect(() => {
    setDone(false);
    settled.current = false;
  }, [fighting?.battleId]);

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
          bg={fightBg(fighting.id, stage?.bg, hunt?.bg)}
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
          <p className="muted">
            {fighting.mode === "replay" ? "Replay" : "Julgamento"} · {fighting.battleId.slice(0, 8)} · {fighting.hash}
          </p>
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
    const replay = fighting.mode === "replay";
    return (
      <div className="panel">
        <h1>{replay ? (w ? "Replay · vitória" : "Replay · derrota") : w ? "O Sono cedeu" : "O Sono pesou"}</h1>
        {replay ? (
          <p className="muted">
            Só playback. Hash {fighting.hash} · seed {fighting.input.seed}
          </p>
        ) : w ? (
          <p className="muted">
            +{fighting.rewards.gold} ouro
            {fighting.rewards.letters ? ` · +${fighting.rewards.letters} Letters` : ""} · ledger no servidor
          </p>
        ) : (
          <p className="muted">Mude a formação ou as diretivas.</p>
        )}
        <p className="muted">
          {fighting.battleId.slice(0, 8)} · {contentName(fighting.id)}
        </p>
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
        {tutorialStep < TUTORIAL_DONE || !cleared.includes(HUNT_UNLOCK_STAGE) ? (
          <p className="muted">Abre após o 1-10. Breath não gasta o baú.</p>
        ) : null}
        {(["goblin", "wyrm", "hydra", "root"] as const).map((dungeon) => {
          const levels = HUNTS.filter((h) => h.dungeon === dungeon && /\\.[0-9]+$/.test(h.id));
          const lv = huntLv[dungeon] ?? 1;
          const h = levels.find((x) => x.level === lv) ?? levels[0];
          if (!h) return null;
          const lock = tutorialStep < TUTORIAL_DONE || !cleared.includes(HUNT_UNLOCK_STAGE);
          return (
            <div key={dungeon} style={{ marginBottom: 12 }}>
              <strong>{h.name.replace(/ \\d+$/, "")}</strong>
              <p className="muted">
                Nv {lv}/10 · {h.stamina} Breath · +{h.gold} ouro · +{h.letters} Letters
              </p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                {levels.map((x) => (
                  <button key={x.id} className={`dir ${lv === x.level ? "on" : ""}`} style={{ flex: "0 0 36px", minHeight: 36 }} onClick={() => setHuntLv((s) => ({ ...s, [dungeon]: x.level }))}>
                    {x.level}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="cta"
                  disabled={lock}
                  onClick={async () => {
                    const r = await startHunt(h.id);
                    setHuntMsg(r.ok ? "" : (r.reason ?? ""));
                  }}
                >
                  Lutar
                </button>
                <button
                  className="cta"
                  disabled={lock}
                  onClick={async () => {
                    const r = await sweepHunt(h.id);
                    setHuntMsg(r.ok ? `Sweep: +${r.gold} ouro` : (r.reason ?? ""));
                  }}
                >
                  Sweep
                </button>
              </div>
            </div>
          );
        })}
        {huntMsg && <p className="muted">{huntMsg}</p>}
      </div>

      {replays.length > 0 && (
        <div className="panel">
          <h2>Replays</h2>
          <p className="muted">O cliente só assiste o que o servidor já julgou.</p>
          {replays.slice(0, 8).map((b) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
              <div style={{ flex: 1 }}>
                <div>
                  {contentName(b.contentId)} · {b.winner === "ally" ? "vitória" : "derrota"}
                </div>
                <div className="muted">
                  {(b.durationMs / 1000).toFixed(1)}s · {b.hash}
                </div>
              </div>
              <button className="cta" style={{ width: 96, minHeight: 40 }} onClick={() => void openReplay(b.id)}>
                Assistir
              </button>
            </div>
          ))}
        </div>
      )}

      {CHAPTERS.map((ch) => {
        const list = STAGES.filter((s) => s.chapter === ch.chapter);
        const done = list.filter((s) => cleared.includes(s.id)).length;
        const expanded = openCh === ch.chapter;
        return (
          <div key={ch.chapter} className="panel">
            <button className="cta" onClick={() => setOpenCh(expanded ? 0 : ch.chapter)}>
              Cap. {ch.chapter} · {ch.name} · {done}/{list.length}
            </button>
            <p className="muted">{ch.blurb}</p>
            {expanded && (
              <p className="muted">{ACT_CUTSCENES.find((a) => a.chapter === ch.chapter)?.enter[locale]}</p>
            )}
            {expanded &&
              list.map((s) => {
                const open = isStageOpen(cleared, s.id);
                return (
                  <div key={s.id} className="stage-row">
                    <div>
                      <strong>
                        {s.id} · {s.name}
                      </strong>
                      <div className="muted">
                        +{s.gold} ouro · Wake {s.wakeRate}/h
                      </div>
                    </div>
                    <button className="cta" style={{ width: 88, minHeight: 40 }} disabled={!open} onClick={() => void startFight(s.id)}>
                      {open ? "Lutar" : "—"}
                    </button>
                  </div>
                );
              })}
          </div>
        );
      })}
      <div className="panel">
        <p className="muted">12 atos · 240 stages. Arte de inimigo ainda empresta os 3 bosses do slice.</p>
      </div>
    </div>
  );
}
