import { randomUUID } from "node:crypto";
import { HEROES } from "@relicwake/content";
import type { DirectiveId } from "@relicwake/shared";
import type { BattleInput, BattleRecord, BattleResult } from "@relicwake/sim";
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

export type StoredBattle = BattleRecord & { mac: string; accountId: string };

export type BattleSummary = {
  id: string;
  contentId: string;
  winner: BattleRecord["winner"];
  durationMs: number;
  hash: string;
  createdAt: number;
};

type BattleRow = {
  id: string;
  content_id: string;
  content_semver: string;
  seed: number | string;
  input_json: string;
  result_json: string;
  hash: string;
  mac: string;
  winner: string;
  duration_ms: number | string;
  created_at: number | string;
};

function parseBattle(row: BattleRow, accountId: string): StoredBattle {
  return {
    id: row.id,
    accountId,
    contentId: row.content_id,
    contentSemver: row.content_semver,
    seed: Number(row.seed),
    input: JSON.parse(row.input_json) as BattleInput,
    result: JSON.parse(row.result_json) as BattleResult,
    hash: row.hash,
    mac: row.mac,
    winner: row.winner as BattleRecord["winner"],
    durationMs: Number(row.duration_ms),
    createdAt: Number(row.created_at),
  };
}

const BATTLE_SELECT =
  "SELECT id, content_id, content_semver, seed, input_json, result_json, hash, mac, winner, duration_ms, created_at FROM battles";

export async function insertBattle(rec: StoredBattle, idempotencyKey: string | null): Promise<void> {
  await db.run(
    "INSERT INTO battles (id, account_id, content_id, content_semver, seed, input_json, result_json, hash, mac, winner, duration_ms, idempotency_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      rec.id,
      rec.accountId,
      rec.contentId,
      rec.contentSemver,
      rec.seed,
      JSON.stringify(rec.input),
      JSON.stringify(rec.result),
      rec.hash,
      rec.mac,
      rec.winner,
      rec.durationMs,
      idempotencyKey,
      rec.createdAt,
    ],
  );
}

export async function getBattleById(id: string, accountId: string): Promise<StoredBattle | null> {
  const row = await db.get<BattleRow>(`${BATTLE_SELECT} WHERE id = ? AND account_id = ?`, [id, accountId]);
  return row ? parseBattle(row, accountId) : null;
}

export async function getBattleByIdempotency(accountId: string, key: string): Promise<StoredBattle | null> {
  const row = await db.get<BattleRow>(`${BATTLE_SELECT} WHERE account_id = ? AND idempotency_key = ?`, [
    accountId,
    key,
  ]);
  return row ? parseBattle(row, accountId) : null;
}

export async function listBattles(accountId: string, limit = 20): Promise<BattleSummary[]> {
  const rows = await db.all<{
    id: string;
    content_id: string;
    winner: string;
    duration_ms: number | string;
    hash: string;
    created_at: number | string;
  }>(
    "SELECT id, content_id, winner, duration_ms, hash, created_at FROM battles WHERE account_id = ? ORDER BY created_at DESC LIMIT ?",
    [accountId, limit],
  );
  return rows.map((row) => ({
    id: row.id,
    contentId: row.content_id,
    winner: row.winner as BattleRecord["winner"],
    durationMs: Number(row.duration_ms),
    hash: row.hash,
    createdAt: Number(row.created_at),
  }));
}

export { today };
