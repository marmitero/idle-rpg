/** Game UI kit — componentes asset-driven (docs/ui-redesign/02 e /06).
 * O código controla posição/estado/interação; os assets definem a aparência. */

import { HUB_DAILY_BOARD, UI_KIT, type HubWorldDef, type Locale } from "@relicwake/content";
import type { ReactNode } from "react";
import { t } from "../i18n";
import { playSfx } from "../audio";

// ── HUD ─────────────────────────────────────────────────────────────────────

export function ResourceCounter({
  icon,
  value,
  kind,
  flash,
}: {
  icon: string;
  value: number;
  kind: "gold" | "letters" | "dust";
  flash?: "gain" | "spend";
}) {
  return (
    <div className={`res-counter res-${kind}${flash ? ` flash-${flash}` : ""}`} aria-label={kind}>
      <img src={icon} alt={kind} />
      <span className="res-num">{value}</span>
    </div>
  );
}

export function WakerPlate({ name }: { name: string }) {
  return (
    <div className="topbar-name" style={{ backgroundImage: `url(${UI_KIT.cartouche})` }}>
      {name}
    </div>
  );
}

// ── Objetos do mundo ────────────────────────────────────────────────────────

export function WorldObject({
  def,
  locale,
  onActivate,
  children,
}: {
  def: HubWorldDef;
  locale: Locale;
  onActivate: (def: HubWorldDef) => void;
  children?: ReactNode;
}) {
  return (
    <button
      className={`wobj wobj-${def.id}`}
      style={{ left: `${def.position.x * 100}%`, top: `${def.position.y * 100}%`, width: def.size, height: def.size }}
      aria-label={t(def.labelKey, locale)}
      onClick={() => {
        playSfx("ui");
        onActivate(def);
      }}
    >
      <img className="wobj-sprite" src={def.asset} alt="" />
      <span className="wobj-label">{t(def.labelKey, locale)}</span>
      {children}
    </button>
  );
}

export function WakeBar({ hours, cap }: { hours: number; cap: number }) {
  const pct = Math.max(0, Math.min(100, (hours / cap) * 100));
  return (
    <div className="wake-bar" role="progressbar" aria-valuemin={0} aria-valuemax={cap} aria-valuenow={hours}>
      <img className="wake-bar-bg" src={UI_KIT.barBg} alt="" />
      <div className="wake-bar-fillwrap" style={{ width: `${pct}%` }}>
        <img className="wake-bar-fill" src={UI_KIT.barFill} alt="" />
      </div>
      <span className="wake-bar-label">
        {hours.toFixed(1)}h / {cap}h
      </span>
    </div>
  );
}

// ── Feedback temporário (microinteração de coleta) ─────────────────────────

export function SparkleBurst({ count = 6 }: { count?: number }) {
  const parts = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const dist = 60 + Math.random() * 50;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - 30,
      size: 14 + Math.random() * 14,
      delay: Math.random() * 80,
      key: i,
    };
  });
  return (
    <div className="sparkle-layer" aria-hidden>
      {parts.map((p) => (
        <img
          key={p.key}
          className="sparkle"
          src={UI_KIT.sparkle}
          alt=""
          style={
            {
              width: p.size,
              height: p.size,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              animationDelay: `${p.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// ── Quadro do ofício (contêiner diegético) ─────────────────────────────────

export function NoticeBoard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="notice-board">
      <img className="notice-board-bg" src={HUB_DAILY_BOARD} alt="" />
      <div className="notice-board-body">
        <h2 className="notice-board-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
