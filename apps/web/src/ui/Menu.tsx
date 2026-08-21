import { UI } from "@relicwake/content";
import { useState } from "react";
import { getVolume, isMuted, playSfx, setMuted, setVolume, unlockAudio } from "../audio";
import { useGame } from "../state";

export function Menu() {
  const letters = useGame((s) => s.letters);
  const pity = useGame((s) => s.pity);
  const email = useGame((s) => s.email);
  const pull = useGame((s) => s.pull);
  const tutorial = useGame((s) => s.tutorial);
  const register = useGame((s) => s.register);
  const login = useGame((s) => s.login);
  const logout = useGame((s) => s.logout);
  const [log, setLog] = useState("");
  const [mail, setMail] = useState("");
  const [pass, setPass] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [mute, setMute] = useState(isMuted);
  const [vol, setVol] = useState(getVolume);
  const [admin, setAdmin] = useState("");

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
              unlockAudio();
              const r = await pull();
              playSfx("pull");
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
        <h2>Conta</h2>
        {email ? (
          <>
            <p className="muted">Cloud save: {email}</p>
            <button className="cta" onClick={() => logout()}>
              Sair
            </button>
          </>
        ) : (
          <>
            <p className="muted">Hóspede no device. Vincule e-mail para cloud save (mín. 8 caracteres).</p>
            <input
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="e-mail"
              style={inputStyle}
            />
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="senha"
              type="password"
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="cta"
                onClick={async () => {
                  try {
                    await register(mail, pass);
                    setAuthMsg("Conta vinculada.");
                  } catch (e) {
                    setAuthMsg(e instanceof Error ? e.message : "erro");
                  }
                }}
              >
                Vincular
              </button>
              <button
                className="cta"
                onClick={async () => {
                  try {
                    await login(mail, pass);
                    setAuthMsg("Sessão JWT.");
                  } catch (e) {
                    setAuthMsg(e instanceof Error ? e.message : "erro");
                  }
                }}
              >
                Entrar
              </button>
            </div>
            {authMsg && <p className="muted">{authMsg}</p>}
          </>
        )}
      </div>
      <div className="panel">
        <h2>Áudio</h2>
        <p className="muted">Camas procedurais de hub e batalha. Sem master de loja ainda.</p>
        <button
          className="cta"
          onClick={() => {
            unlockAudio();
            const next = !mute;
            setMute(next);
            setMuted(next);
          }}
        >
          {mute ? "Som off" : "Som on"}
        </button>
        <button
          className="cta"
          style={{ marginTop: 8 }}
          onClick={() => void tutorial({ reset: true })}
        >
          Rever ofício (tutorial)
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={vol}
          onChange={(e) => {
            const v = Number(e.target.value);
            setVol(v);
            unlockAudio();
            setVolume(v);
          }}
          style={{ width: "100%", marginTop: 10 }}
        />
      </div>
      <div className="panel">
        <h2>Admin live-ops</h2>
        <p className="muted">Chave local (ADMIN_KEY). Flags, mail, analytics.</p>
        <input value={admin} onChange={(e) => setAdmin(e.target.value)} placeholder="admin key" style={inputStyle} />
        <button
          className="cta"
          onClick={async () => {
            try {
              const { api } = await import("../api");
              const r = await api<{ flags: Record<string, string> }>("/api/admin/flags", undefined, { "x-admin-key": admin || "dev-admin" });
              setLog(JSON.stringify(r.flags));
            } catch (e) {
              setLog(e instanceof Error ? e.message : "admin");
            }
          }}
        >
          Ver flags
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  margin: "6px 0",
  minHeight: 44,
  borderRadius: 8,
  border: "1px solid #e8b15a66",
  background: "#0006",
  color: "#c4b7a6",
  padding: "8px 12px",
};
