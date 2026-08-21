import { randomUUID } from "node:crypto";
import { HEROES, SLICE_OWNED, defaultProg, starterGear, type GearPiece, type HeroProg } from "@relicwake/content";
import type { DirectiveId } from "@relicwake/shared";
import type { BattleInput, BattleRecord, BattleResult } from "@relicwake/sim";
import { db } from "./db.ts";

export type LedgerEntry = {
  id: string;
  accountId: string;
  currency: "gold" | "letters" | "fate" | "sweep" | "stamina" | "dust" | "crests" | "ember";
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
  /** Formação na grade 3x3 (9 slots, da esquerda p/ direita, frente p/ topo).
   *  Fonte de verdade do posicionamento; `team` é derivado (ordem dos slots). */
  formation: (string | null)[];
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
  wakerName: string | null;
  starterId: string | null;
  tutorialStep: number;
  tutorialPull: boolean;
  dust: number;
  crests: number;
  ember: number;
  heroProg: Record<string, HeroProg>;
  gear: GearPiece[];
  equipped: Record<string, string>;
  towerFloor: number;
  factionTower: Record<string, number>;
  arenaRating: number;
  arenaAttacks: number;
  guildId: string | null;
  guildRole: "sovereign" | "flame" | "member" | null;
  warAttacks: number;
  mail: Mail[];
  passXp: number;
  passPremium: boolean;
  passClaimed: string[];
  eventDay: number;
  eventClaimed: number[];
  honorDraft: string[];
  banned: boolean;
};

export type Mail = {
  id: string;
  title: string;
  body: string;
  gold: number;
  letters: number;
  dust: number;
  claimed: boolean;
  at: number;
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
    lastCollectAt: Date.now() - 2.5 * 3_600_000,
    capHours: 8,
    afkStage: "1-1",
    cleared: [],
    team: ["hero.warrior", "hero.guardian", "hero.mage", "hero.archer", "hero.rogue"],
    formation: ["hero.warrior", "hero.guardian", "hero.mage", "hero.archer", "hero.rogue", null, null, null, null],
    owned: [...SLICE_OWNED],
    pity: 0,
    directives: ["foco"],
    wakerName: null,
    starterId: null,
    tutorialStep: 0,
    tutorialPull: false,
    stamina: 80,
    lastStaminaAt: Date.now(),
    sweep: 4,
    dailyDay: today(),
    dailyProg: { login: 1 },
    dailyClaimed: [],
    ledger: [],
    dust: 40,
    crests: 0,
    ember: 0,
    heroProg: defaultProg([...SLICE_OWNED]),
    gear: starterGear(),
    equipped: Object.fromEntries(starterGear().map((g) => [g.slot, g.id])),
    towerFloor: 1,
    factionTower: { embercourt: 1, tidebound: 1, thornveil: 1, ashen: 1 },
    arenaRating: 1000,
    arenaAttacks: 5,
    guildId: null,
    guildRole: null,
    warAttacks: 3,
    mail: [
      {
        id: randomUUID(),
        title: "O Spire ouviu",
        body: "Moth arquivou seu nome. O ofício começa.",
        gold: 50,
        letters: 1,
        dust: 10,
        claimed: false,
        at: Date.now(),
      },
    ],
    passXp: 0,
    passPremium: false,
    passClaimed: [],
    eventDay: 1,
    eventClaimed: [],
    honorDraft: [],
    banned: false,
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
    a.arenaAttacks = 5;
    a.warAttacks = 3;
    a.eventDay = Math.min(7, (a.eventDay ?? 1) + 1);
  }
  if (a.tutorialStep == null) a.tutorialStep = a.cleared.length ? 8 : 0;
  if (a.wakerName === undefined) a.wakerName = null;
  if (a.starterId === undefined) a.starterId = null;
  if (a.tutorialPull == null) a.tutorialPull = a.tutorialStep >= 8;
  if (!a.directives) a.directives = ["foco", "guarda", "execute"];
  // Migração: contas antigas só têm `team` — preenche os primeiros slots
  // (frente 3 + meio 2) e deriva `team` da ordem da formação.
  if (!Array.isArray(a.formation) || a.formation.length !== 9) {
    a.formation = Array(9).fill(null);
    for (let i = 0; i < Math.min(5, a.team.length); i++) a.formation[i] = a.team[i] ?? null;
  }
  syncFormationTeam(a);
  ensureSystems(a);
  return a;
}

export function ensureSystems(a: Account) {
  if (a.dust == null) a.dust = 40;
  if (a.crests == null) a.crests = 0;
  if (a.ember == null) a.ember = 0;
  if (!a.heroProg) a.heroProg = defaultProg(a.owned.length ? a.owned : HEROES.map((h) => h.id));
  for (const id of a.owned) {
    if (!a.heroProg[id]) a.heroProg[id] = { level: 1, stars: 1, imprint: 0, pas: 1, cmd: 1, ult: 1 };
  }
  if (!a.gear) a.gear = starterGear();
  if (!a.equipped) a.equipped = Object.fromEntries(a.gear.map((g) => [g.slot, g.id]));
  if (!a.towerFloor) a.towerFloor = 1;
  if (!a.factionTower) a.factionTower = { embercourt: 1, tidebound: 1, thornveil: 1, ashen: 1 };
  if (a.arenaRating == null) a.arenaRating = 1000;
  if (a.arenaAttacks == null) a.arenaAttacks = 5;
  if (a.guildId === undefined) a.guildId = null;
  if (a.guildRole === undefined) a.guildRole = null;
  if (a.warAttacks == null) a.warAttacks = 3;
  if (!a.mail) a.mail = [];
  if (a.passXp == null) a.passXp = 0;
  if (a.passPremium == null) a.passPremium = false;
  if (!a.passClaimed) a.passClaimed = [];
  if (!a.eventDay) a.eventDay = 1;
  if (!a.eventClaimed) a.eventClaimed = [];
  if (!a.honorDraft) a.honorDraft = [];
  if (a.banned == null) a.banned = false;
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

/**
 * Mantém `formation` e `team` coerentes:
 * - heróis fora do team saem da formação;
 * - heróis do team sem slot entram nos primeiros espaços livres (frente primeiro);
 * - `team` é rederivado na ordem dos slots.
 * Preserva os posicionamentos escolhidos pelo jogador.
 */
export function syncFormationTeam(a: Account) {
  if (!Array.isArray(a.formation) || a.formation.length !== 9) a.formation = Array(9).fill(null);
  const f = a.formation.map((id) => (typeof id === "string" && a.team.includes(id) ? id : null));
  for (const id of a.team) {
    if (f.includes(id)) continue;
    const i = f.indexOf(null);
    if (i >= 0) f[i] = id;
  }
  a.formation = f;
  a.team = f.filter((x): x is string => typeof x === "string");
}

export async function save(a: Account) {
  syncFormationTeam(a);
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
