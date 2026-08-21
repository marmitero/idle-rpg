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

async function loadSnapshot(accountId: string, deviceId: string, email: string | null): Promise<Account | null> {
  const row = await db.get<{ json: string }>("SELECT json FROM snapshots WHERE account_id = ?", [accountId]);
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

export async function getOrCreate(deviceId: string): Promise<Account> {
  const now = Date.now();
  const dev = await db.get<{ account_id: string }>("SELECT account_id FROM devices WHERE id = ?", [deviceId]);
  if (dev) {
    const acc = await db.get<{ email: string | null }>("SELECT email FROM accounts WHERE id = ?", [dev.account_id]);
    const loaded = await loadSnapshot(dev.account_id, deviceId, acc?.email ?? null);
    if (loaded) return loaded;
  }
  const id = randomUUID();
  const a = genesis(id, deviceId);
  await db.tx(async (q) => {
    await q.run("INSERT INTO accounts (id, email, password_hash, created_at) VALUES (?, NULL, NULL, ?)", [id, now]);
    await q.run("INSERT INTO devices (id, account_id, created_at) VALUES (?, ?, ?)", [deviceId, id, now]);
    await q.run("INSERT INTO snapshots (account_id, json) VALUES (?, ?)", [id, JSON.stringify(a)]);
  });
  return a;
}

export async function getById(accountId: string, deviceId: string): Promise<Account | null> {
  const acc = await db.get<{ email: string | null }>("SELECT email FROM accounts WHERE id = ?", [accountId]);
  if (!acc) return null;
  const existing = await db.get<{ account_id: string }>("SELECT account_id FROM devices WHERE id = ?", [deviceId]);
  if (!existing) {
    await db.run("INSERT OR IGNORE INTO devices (id, account_id, created_at) VALUES (?, ?, ?)", [
      deviceId,
      accountId,
      Date.now(),
    ]);
  }
  return loadSnapshot(accountId, deviceId, acc.email ?? null);
}

export async function getByEmail(email: string): Promise<{ id: string; password_hash: string | null } | null> {
  const row = await db.get<{ id: string; password_hash: string | null }>(
    "SELECT id, password_hash FROM accounts WHERE email = ?",
    [email.toLowerCase()],
  );
  return row ?? null;
}

export async function bindEmail(accountId: string, email: string, passwordHash: string) {
  await db.run("UPDATE accounts SET email = ?, password_hash = ? WHERE id = ?", [
    email.toLowerCase(),
    passwordHash,
    accountId,
  ]);
}

export async function save(a: Account) {
  await db.run(
    "INSERT INTO snapshots (account_id, json) VALUES (?, ?) ON CONFLICT(account_id) DO UPDATE SET json = excluded.json",
    [a.id, JSON.stringify(a)],
  );
}

export async function credit(
  a: Account,
  currency: LedgerEntry["currency"],
  delta: number,
  reason: string,
  ref: string,
) {
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
  await db.run("INSERT INTO ledger (id, account_id, currency, delta, reason, ref, at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
    entry.id,
    entry.accountId,
    entry.currency,
    entry.delta,
    entry.reason,
    entry.ref,
    entry.at,
  ]);
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
