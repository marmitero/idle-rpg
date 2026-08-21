import { HERO_BY_ID, STARTERS, TUTORIAL_DONE, TUTORIAL_STAGES, UI } from "@relicwake/content";
import { useEffect, useState } from "react";
import { playSfx, unlockAudio } from "../audio";
import { useGame } from "../state";
import { ChromaImg } from "./ChromaImg";

export function Tutorial() {
  const step = useGame((s) => s.tutorialStep);
  const fighting = useGame((s) => s.fighting);
  const cleared = useGame((s) => s.cleared);
  const tutorial = useGame((s) => s.tutorial);
  const startFight = useGame((s) => s.startFight);
  const setTab = useGame((s) => s.setTab);
  const collect = useGame((s) => s.collect);
  const wakerName = useGame((s) => s.wakerName);
  const [name, setName] = useState(wakerName ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (fighting) return;
    if (step === 4 && cleared.includes("1-1")) void tutorial({ step: 5 });
    if (step === 5 && TUTORIAL_STAGES.every((id) => cleared.includes(id))) {
      setTab("hub");
      void tutorial({ step: 6 });
    }
  }, [fighting, cleared, step, tutorial, setTab]);

  if (step >= TUTORIAL_DONE) return null;
  if (fighting) return null;

  const go = async (body: { step: number; name?: string; starterId?: string; pull?: boolean }, tab?: "hub" | "battle" | "menu") => {
    setBusy(true);
    setErr("");
    try {
      unlockAudio();
      playSfx("ui");
      await tutorial(body);
      if (tab) setTab(tab);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "erro");
    } finally {
      setBusy(false);
    }
  };

  const nextClimb = TUTORIAL_STAGES.find((id) => !cleared.includes(id)) ?? "1-4";

  return (
    <div className="tut">
      <div className="tut-card">
        {step === 0 && (
          <>
            <p className="muted">Arquivo Moth</p>
            <h1>Vaelith dorme. Você não.</h1>
            <p>O Spire é uma coluna de cidades empilhadas. Quem sobe e acorda um degrau vira Waker. Eu arquivo. Você sobe.</p>
            <button className="cta" disabled={busy} onClick={() => void go({ step: 1 })}>
              Estou acordado
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <h1>Como te chamam?</h1>
            <p className="muted">Um nome curto. O Sono não precisa de mais.</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do Waker"
              maxLength={24}
              style={inputStyle}
            />
            <button
              className="cta"
              disabled={busy || name.trim().length < 2}
              onClick={() => void go({ step: 2, name: name.trim() })}
            >
              Gravado
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h1>A primeira Relíquia</h1>
            <p className="muted">Não é gacha. É um pacto. Três facções core.</p>
            <div className="grid3">
              {STARTERS.map((s) => {
                const h = HERO_BY_ID[s.id]!;
                return (
                  <button
                    key={s.id}
                    className="card"
                    disabled={busy}
                    onClick={() => void go({ step: 3, starterId: s.id })}
                    style={{ border: "1px solid #e8b15a66", cursor: "pointer" }}
                  >
                    <img className="bust" src={h.art.bust} alt={h.name} />
                    <div className="nm">{h.name}</div>
                    <div className="ep">{h.epithet}</div>
                  </button>
                );
              })}
            </div>
            <p className="muted" style={{ marginTop: 10 }}>
              {STARTERS.map((s) => s.line).join(" ")}
            </p>
          </>
        )}
        {step === 3 && (
          <>
            <h1>Foco</h1>
            <p>O time luta sozinho. Você escolhe a intenção. Foco: priorize o inimigo de maior ATK.</p>
            <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
              <div className="dir on">
                <ChromaImg src={UI.directives.foco!} alt="" />
                <span>Foco</span>
              </div>
            </div>
            <button className="cta" disabled={busy} onClick={() => void go({ step: 4 }, "battle")}>
              Entendi
            </button>
          </>
        )}
        {step === 4 && (
          <>
            <h1>A Base que respira</h1>
            <p className="muted">Primeira subida. Auto. O servidor julga. Você assiste.</p>
            <button
              className="cta"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  unlockAudio();
                  await startFight("1-1");
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "erro");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Subir
            </button>
          </>
        )}
        {step === 5 && (
          <>
            <h1>Quatro degraus até o baú</h1>
            <p className="muted">
              {TUTORIAL_STAGES.filter((id) => cleared.includes(id)).length}/4. O Wake só rende depois que você toca a pedra.
            </p>
            <button
              className="cta"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await startFight(nextClimb);
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "erro");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Lutar {nextClimb}
            </button>
          </>
        )}
        {step === 6 && (
          <>
            <h1>O Spire rendeu</h1>
            <p className="muted">Enquanto você subia, o tempo condensou Wake. Coletar é um toque. Sem anúncio.</p>
            <button
              className="cta"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  unlockAudio();
                  const r = await collect();
                  playSfx("collect");
                  setErr(r.gold > 0 ? `+${r.gold} ouro.` : "");
                  await tutorial({ step: 6 });
                  setTab("menu");
                  await tutorial({ step: 7 });
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "erro");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <ChromaImg src={UI.chest} alt="" width={28} height={28} />
                Coletar Wake
              </span>
            </button>
          </>
        )}
        {step === 7 && (
          <>
            <h1>A Font</h1>
            <p className="muted">Wake vira gente. Uma Letter, um nome. Este primeiro é ofício, não azar.</p>
            <button
              className="cta"
              disabled={busy}
              onClick={async () => {
                await go({ step: 7, pull: true });
                playSfx("pull");
                await go({ step: TUTORIAL_DONE });
              }}
            >
              Ouvir a Font
            </button>
          </>
        )}
        {step < 8 && (
          <button
            className="cta"
            style={{ marginTop: 8, opacity: 0.7 }}
            disabled={busy}
            onClick={() => void go({ step: TUTORIAL_DONE, name: name.trim() || "Waker", starterId: STARTERS[0]!.id })}
          >
            Já sei o ofício
          </button>
        )}
        {err && <p className="muted">{err}</p>}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  margin: "6px 0 12px",
  minHeight: 44,
  borderRadius: 8,
  border: "1px solid #e8b15a66",
  background: "#0006",
  color: "#c4b7a6",
  padding: "8px 12px",
};
