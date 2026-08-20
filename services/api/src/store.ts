import { randomUUID } from "node:crypto";
import { HEROES } from "@relicwake/content";
import type { DirectiveId } from "@relicwake/shared";
import { db } from "./db.ts";

export type LedgerEntry = {
  id: string;
  accountId: string;
  currency: "gold" | "letters" | "fate" | "sweep" | "stamina";
  delta: number;
  reason: string;
  ref: string;
  at: number;
};

export type Account = {
  id: string;
  deviceId: string;
  email: string | null;
  gold: number;
  letters: number;
  fate: number;
  lastCollectAt: number;
  capHours: number;
  afkStage: string;
  cleared: string[];
  team: string[];
  owned: string[];
  pity: number;
  directives: DirectiveId[];
  stamina: number;
  lastStaminaAt: number;
  sweep: number;
  dailyDay: string;
  dailyProg: Record<string, number>;
  dailyClaimed: string[];
  ledger: LedgerEntry[];
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function genesis(id: string, deviceId: string): Account {
  return {
    id,
    deviceId,
    email: null,
    gold: 120,
    letters: 12,
    fate: 0,
    lastCollectAt: Date.now(),
    capHours: 8,
    afkStage: "1-1",
    cleared: [],
    team: ["hero.warrior", "hero.guardian", "hero.mage", "hero.archer", "hero.rogue"],
    owned: HEROES.map((h) => h.id),
    pity: 0,
    directives: ["foco", "guarda", "execute"],
    stamina: 80,
    lastStaminaAt: Date.now(),
    sweep: 4,
    dailyDay: today(),
    dailyProg: { login: 1 },
    dailyClaimed: [],
    ledger: [],
  };
}

function loadSnapshot(accountId: string, deviceId: string, email: string | null): Account | null {
  const row = db.prepare("SELECT json FROM snapshots WHERE account_id = ?").get(accountId) as
    | { json: string }
    | undefined;
  if (!row) return null;
  const a = JSON.parse(row.json) as Account;
  a.id = accountId;
  a.deviceId = deviceId;
  a.email = email;
  if (a.dailyDay !== today()) {
    a.dailyDay = today();
    a.dailyProg = { login: 1 };
    a.dailyClaimed = [];
  }
  return a;
}

export function publicState(a: Account) {
  const { ledger: _l, ...rest } = a;
  return rest;
}

export function getOrCreate(deviceId: string): Account {
  const now = Date.now();
  const dev = db.prepare("SELECT account_id FROM devices WHERE id = ?").get(deviceId) as
    | { account_id: string }
    | undefined;
  if (dev) {
    const acc = db.prepare("SELECT email FROM accounts WHERE id = ?").get(dev.account_id) as
      | { email: string | null }
      | undefined;
    const loaded = loadSnapshot(dev.account_id, deviceId, acc?.email ?? null);
    if (loaded) return loaded;
  }
  const id = randomUUID();
  const a = genesis(id, deviceId);
  db.exec("BEGIN");
  db.prepare("INSERT INTO accounts (id, email, password_hash, created_at) VALUES (?, NULL, NULL, ?)").run(id, now);
  db.prepare("INSERT INTO devices (id, account_id, created_at) VALUES (?, ?, ?)").run(deviceId, id, now);
  db.prepare("INSERT INTO snapshots (account_id, json) VALUES (?, ?)").run(id, JSON.stringify(a));
  db.exec("COMMIT");
  return a;
}

export function getById(accountId: string, deviceId: string): Account | null {
  const acc = db.prepare("SELECT email FROM accounts WHERE id = ?").get(accountId) as
    | { email: string | null }
    | undefined;
  if (!acc) return null;
  const dev = db.prepare("SELECT account_id FROM devices WHERE id = ?").get(deviceId) as
    | { account_id: string }
    | undefined;
  if (!dev) {
    db.prepare("INSERT OR IGNORE INTO devices (id, account_id, created_at) VALUES (?, ?, ?)").run(
      deviceId,
      accountId,
      Date.now(),
    );
  }
  return loadSnapshot(accountId, deviceId, acc.email);
}

export function getByEmail(email: string): { id: string; password_hash: string | null } | null {
  const row = db.prepare("SELECT id, password_hash FROM accounts WHERE email = ?").get(email.toLowerCase()) as
    | { id: string; password_hash: string | null }
    | undefined;
  return row ?? null;
}

export function bindEmail(accountId: string, email: string, passwordHash: string) {
  db.prepare("UPDATE accounts SET email = ?, password_hash = ? WHERE id = ?").run(
    email.toLowerCase(),
    passwordHash,
    accountId,
  );
}

export function save(a: Account) {
  db.prepare("INSERT INTO snapshots (account_id, json) VALUES (?, ?) ON CONFLICT(account_id) DO UPDATE SET json = excluded.json").run(
    a.id,
    JSON.stringify(a),
  );
}

export function credit(a: Account, currency: LedgerEntry["currency"], delta: number, reason: string, ref: string) {
  if (!delta) return a;
  a[currency] += delta;
  if (a[currency] < 0) throw new Error(`ledger_negative:${currency}`);
  const entry: LedgerEntry = {
    id: randomUUID(),
    accountId: a.id,
    currency,
    delta,
    reason,
    ref,
    at: Date.now(),
  };
  a.ledger.push(entry);
  db.prepare(
    "INSERT INTO ledger (id, account_id, currency, delta, reason, ref, at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run(entry.id, entry.accountId, entry.currency, entry.delta, entry.reason, entry.ref, entry.at);
  return a;
}

export function bumpDaily(a: Account, id: string, n = 1) {
  if (a.dailyDay !== today()) {
    a.dailyDay = today();
    a.dailyProg = { login: 1 };
    a.dailyClaimed = [];
  }
  a.dailyProg[id] = (a.dailyProg[id] ?? 0) + n;
}

export { today };
