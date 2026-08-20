import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DAILIES, HEROES } from "@relicwake/content";
import type { DirectiveId } from "@relicwake/shared";

const FILE = join(dirname(fileURLToPath(import.meta.url)), "../data/accounts.json");

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

type Disk = { accounts: Account[] };

function today() {
  return new Date().toISOString().slice(0, 10);
}

function empty(): Disk {
  return { accounts: [] };
}

function read(): Disk {
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as Disk;
  } catch {
    return empty();
  }
}

function write(d: Disk) {
  mkdirSync(dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(d, null, 2));
}

export function publicState(a: Account) {
  const { ledger: _l, ...rest } = a;
  return rest;
}

export function getOrCreate(deviceId: string): Account {
  const d = read();
  let a = d.accounts.find((x) => x.deviceId === deviceId);
  if (!a) {
    a = {
      id: randomUUID(),
      deviceId,
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
    d.accounts.push(a);
    write(d);
  }
  if (a.dailyDay !== today()) {
    a.dailyDay = today();
    a.dailyProg = { login: 1 };
    a.dailyClaimed = [];
    write(d);
  }
  return a;
}

export function save(a: Account) {
  const d = read();
  const i = d.accounts.findIndex((x) => x.id === a.id);
  if (i >= 0) d.accounts[i] = a;
  else d.accounts.push(a);
  write(d);
}

export function credit(a: Account, currency: LedgerEntry["currency"], delta: number, reason: string, ref: string) {
  if (!delta) return a;
  a[currency] += delta;
  if (a[currency] < 0) throw new Error(`ledger_negative:${currency}`);
  a.ledger.push({
    id: randomUUID(),
    accountId: a.id,
    currency,
    delta,
    reason,
    ref,
    at: Date.now(),
  });
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

export { DAILIES, today };
