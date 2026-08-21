import {
  ARENA_RANKS,
  FACTION_TOWERS,
  GEAR_SETS,
  GEAR_SLOTS,
  HONOR_POOL,
  LOGIN_EVENT,
  PASS_TRACK,
  SKUS,
  arenaRank,
} from "@relicwake/content";
import { useEffect, useState } from "react";
import { api } from "../api";
import { useGame } from "../state";

export function TowerPanel() {
  const floor = useGame((s) => s.towerFloor);
  const ft = useGame((s) => s.factionTower);
  const startFight = useGame((s) => s.startFight);
  return (
    <div>
      <div className="panel">
        <h1>Torre do Spire</h1>
        <p className="muted">Andar {floor}/100. Sem Breath. Vitória sobe o degrau.</p>
        <button className="cta" onClick={() => void startFight(`tower.${floor}`)}>
          Andar {floor}
        </button>
      </div>
      {FACTION_TOWERS.map((t) => {
        const n = ft[t.id] ?? 1;
        return (
          <div key={t.id} className="panel">
            <h2>{t.name}</h2>
            <p className="muted">Andar {n}/25</p>
            <button className="cta" onClick={() => void startFight(`ftower.${t.id}.${n}`)}>
              Subir
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ArenaPanel() {
  const rating = useGame((s) => s.arenaRating);
  const attacks = useGame((s) => s.arenaAttacks);
  const startFight = useGame((s) => s.startFight);
  const [ops, setOps] = useState<{ account_id: string; rating: number; name: string }[]>([]);
  useEffect(() => {
    void api<{ opponents: typeof ops }>("/api/arena/opponents").then((r) => setOps(r.opponents ?? []));
  }, []);
  const rank = arenaRank(rating);
  return (
    <div className="panel">
      <h1>Arena</h1>
      <p className="muted">
        {rank.name} · {rating} · {attacks}/5 ataques · snapshot
      </p>
      {ops.length === 0 && <p className="muted">Sem rivais ainda. Outros Wakers aparecem aqui.</p>}
      {ops.map((o) => (
        <div key={o.account_id} className="stage-row">
          <div>
            <strong>{o.name}</strong>
            <div className="muted">{o.rating}</div>
          </div>
          <button className="cta" style={{ width: 96 }} disabled={attacks < 1} onClick={() => void startFight("arena", { opponentId: o.account_id })}>
            Atacar
          </button>
        </div>
      ))}
      <p className="muted">Ranks: {ARENA_RANKS.map((r) => r.name).join(" · ")}</p>
    </div>
  );
}

export function HonorPanel() {
  const draft = useGame((s) => s.honorDraft);
  const cmd = useGame((s) => s.cmd);
  const startFight = useGame((s) => s.startFight);
  const [pick, setPick] = useState<string[]>(draft);
  const toggle = (id: string) => {
    setPick((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(0, 5)));
  };
  return (
    <div className="panel">
      <h1>Honor Duel</h1>
      <p className="muted">Pool {HONOR_POOL.length}. Draft 5. Sem gear.</p>
      <div className="grid3">
        {HONOR_POOL.map((h) => (
          <button key={h.id} className={`card ${pick.includes(h.id) ? "on" : ""}`} onClick={() => toggle(h.id)}>
            <div className="nm">{h.name}</div>
          </button>
        ))}
      </div>
      <button
        className="cta"
        style={{ marginTop: 10 }}
        disabled={pick.length !== 5}
        onClick={() => void cmd("/api/honor/draft", { picks: pick })}
      >
        Travar draft ({pick.length}/5)
      </button>
      <button className="cta" style={{ marginTop: 8 }} disabled={draft.length !== 5} onClick={() => void startFight("honor")}>
        Duelar
      </button>
    </div>
  );
}

export function LivePanel() {
  const mail = useGame((s) => s.mail);
  const passXp = useGame((s) => s.passXp);
  const prem = useGame((s) => s.passPremium);
  const claimed = useGame((s) => s.passClaimed);
  const eventDay = useGame((s) => s.eventDay);
  const eventClaimed = useGame((s) => s.eventClaimed);
  const cmd = useGame((s) => s.cmd);
  return (
    <div>
      <div className="panel">
        <h1>Correio</h1>
        {mail.length === 0 && <p className="muted">Caixa vazia.</p>}
        {mail.map((m) => (
          <div key={m.id} className="stage-row">
            <div>
              <strong>{m.title}</strong>
              <div className="muted">{m.body}</div>
            </div>
            <button className="cta" style={{ width: 96 }} disabled={m.claimed} onClick={() => void cmd("/api/mail/claim", { id: m.id })}>
              {m.claimed ? "Ok" : "Coletar"}
            </button>
          </div>
        ))}
      </div>
      <div className="panel">
        <h2>Passe S0</h2>
        <p className="muted">XP {passXp} · {prem ? "premium" : "free"}</p>
        {PASS_TRACK.filter((p) => p.level <= 8).map((p) => (
          <div key={p.level} className="stage-row">
            <div>
              Nv {p.level} · {p.xp} xp · +{p.freeGold} ouro
            </div>
            <button
              className="cta"
              style={{ width: 88 }}
              disabled={passXp < p.xp || claimed.includes(`free:${p.level}`)}
              onClick={() => void cmd("/api/pass/claim", { level: p.level, track: "free" })}
            >
              Free
            </button>
          </div>
        ))}
      </div>
      <div className="panel">
        <h2>Login 7 dias</h2>
        <p className="muted">Dia {eventDay}/7. Framework de evento, sem deploy de cliente.</p>
        {LOGIN_EVENT.map((d) => (
          <button
            key={d.day}
            className="cta"
            style={{ marginBottom: 6 }}
            disabled={d.day > eventDay || eventClaimed.includes(d.day)}
            onClick={() => void cmd("/api/event/login", { day: d.day })}
          >
            Dia {d.day} · +{d.gold} ouro
          </button>
        ))}
      </div>
      <div className="panel">
        <h2>Loja sandbox</h2>
        {SKUS.map((s) => (
          <button key={s.id} className="cta" style={{ marginBottom: 6 }} onClick={() => void cmd("/api/shop/buy", { id: s.id })}>
            {s.name}
          </button>
        ))}
        <p className="muted">IAP sandbox. Flag paidRandom bloqueia Fate onde a região exigir.</p>
      </div>
    </div>
  );
}

export function GearHint() {
  return (
    <p className="muted">
      Slots {GEAR_SLOTS.join(", ")} · sets {GEAR_SETS.map((s) => s.name).join(", ")}
    </p>
  );
}
