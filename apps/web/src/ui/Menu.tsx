import { UI } from "@relicwake/content";
import { useState } from "react";
import { useGame } from "../state";

export function Menu() {
  const letters = useGame((s) => s.letters);
  const pity = useGame((s) => s.pity);
  const email = useGame((s) => s.email);
  const pull = useGame((s) => s.pull);
  const register = useGame((s) => s.register);
  const login = useGame((s) => s.login);
  const logout = useGame((s) => s.logout);
  const [log, setLog] = useState("");
  const [mail, setMail] = useState("");
  const [pass, setPass] = useState("");
  const [authMsg, setAuthMsg] = useState("");

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
