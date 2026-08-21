import { UI } from "@relicwake/content";
import { useEffect, useState } from "react";
import { api } from "../api";
import { useGame } from "../state";

export function Guild() {
  const gid = useGame((s) => s.guildId);
  const role = useGame((s) => s.guildRole);
  const ember = useGame((s) => s.ember);
  const war = useGame((s) => s.warAttacks);
  const cmd = useGame((s) => s.cmd);
  const startFight = useGame((s) => s.startFight);
  const [name, setName] = useState("");
  const [info, setInfo] = useState<string>("");
  useEffect(() => {
    if (!gid) return;
    void api<{ guild: { name: string; ember: number; hunt_hp: number; war_hp: number } | null }>("/api/guild").then((r) => {
      if (r.guild) setInfo(`${r.guild.name} · ember ${r.guild.ember} · hunt ${r.guild.hunt_hp} · war ${r.guild.war_hp}`);
    });
  }, [gid]);
  return (
    <div className="hero-bg" style={{ backgroundImage: `url(${UI.guild})`, minHeight: "100%" }}>
      <div style={{ height: 160 }} />
      <div className="panel">
        <h1>Hall</h1>
        {gid ? (
          <>
            <p className="muted">
              {info || gid.slice(0, 8)} · {role} · suas marcas {ember} · war {war}/3
            </p>
            <button className="cta" onClick={() => void cmd("/api/guild/help", {})}>
              Ajuda (+2 ember)
            </button>
            <button className="cta" style={{ marginTop: 8 }} onClick={() => void cmd("/api/guild/shop", {})}>
              Shop: 12 ember → 1 Letter
            </button>
            <button className="cta" style={{ marginTop: 8 }} disabled={war < 1} onClick={() => void startFight("gwar")}>
              Guild war (1 mapa, 3 ataques)
            </button>
          </>
        ) : (
          <>
            <p className="muted">Crie ou entre. Cargos: Sovereign, Flame, Member.</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="nome da fortaleza" style={inp} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="cta" onClick={() => void cmd("/api/guild/create", { name })}>
                Criar
              </button>
              <button className="cta" onClick={() => void cmd("/api/guild/join", { name })}>
                Entrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const inp = {
  width: "100%",
  margin: "6px 0 12px",
  minHeight: 44,
  borderRadius: 8,
  border: "1px solid #e8b15a66",
  background: "#0006",
  color: "#c4b7a6",
  padding: "8px 12px",
};
