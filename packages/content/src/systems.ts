import type { Faction, Stats } from "@relicwake/shared";
import { BG } from "./stages.ts";

export type HeroLike = {
  id: string;
  name: string;
  faction: Faction;
  stats: Stats;
};

export type GearSlot = "weapon" | "helm" | "chest" | "boots";
export type GearSetId = "forge" | "cistern" | "root" | "choir";

export const GEAR_SLOTS: GearSlot[] = ["weapon", "helm", "chest", "boots"];

export const GEAR_SETS: { id: GearSetId; name: string; faction: Faction; two: string; four: string }[] = [
  { id: "forge", name: "Forja", faction: "embercourt", two: "+6% ATK", four: "+12% ATK" },
  { id: "cistern", name: "Cisterna", faction: "tidebound", two: "+8% HP", four: "+14% HP" },
  { id: "root", name: "Raiz", faction: "thornveil", two: "+8 SPD", four: "+14 SPD" },
  { id: "choir", name: "Coro", faction: "ashen", two: "+5 CRIT", four: "+10 CRIT" },
];

export type GearPiece = { id: string; slot: GearSlot; set: GearSetId; plus: number };

export type HeroProg = { level: number; stars: number; imprint: number; pas: number; cmd: number; ult: number };

export const LEVEL_CAP = 60;
export const STAR_CAP = 6;
export const IMPRINT_CAP = 15;
export const ENHANCE_CAP = 15;
export const TOWER_FLOORS = 200;
export const FACTION_TOWER_FLOORS = 25;

export const ARENA_RANKS = [
  { id: "bronze", name: "Bronze", min: 0 },
  { id: "silver", name: "Prata", min: 1000 },
  { id: "gold", name: "Ouro", min: 1500 },
  { id: "platinum", name: "Platina", min: 2000 },
  { id: "sovereign", name: "Soberano", min: 2500 },
] as const;

export function arenaRank(rating: number) {
  let cur = ARENA_RANKS[0]!;
  for (const r of ARENA_RANKS) if (rating >= r.min) cur = r;
  return cur;
}

export const FACTION_TOWERS: { id: Faction; name: string }[] = [
  { id: "embercourt", name: "Torre Ember" },
  { id: "tidebound", name: "Torre Tide" },
  { id: "thornveil", name: "Torre Thorn" },
  { id: "ashen", name: "Torre Ashen" },
];

export const SKUS = [
  { id: "sku.gazette", name: "Gazette", fate: 300, gold: 0, premium: true, paidRandom: false },
  { id: "sku.pass", name: "Passe da estação", fate: 0, gold: 0, premium: true, paidRandom: false, pass: true },
  { id: "sku.fate10", name: "10 Fate", fate: 10, gold: 0, premium: true, paidRandom: true },
  { id: "sku.breath", name: "Refil de Breath", fate: 0, gold: 0, premium: false, paidRandom: false, stamina: 60 },
] as const;

export const PASS_TRACK = Array.from({ length: 30 }, (_, i) => ({
  level: i + 1,
  xp: (i + 1) * 40,
  freeGold: 20 + i * 4,
  premLetters: i % 5 === 4 ? 2 : 1,
}));

export const LOGIN_EVENT = Array.from({ length: 7 }, (_, i) => ({
  day: i + 1,
  gold: 30 + i * 15,
  letters: i === 6 ? 3 : 1,
}));

export function towerScale(floor: number): number {
  return 0.62 + floor * 0.018;
}

export function towerGold(floor: number): number {
  return 20 + floor * 3;
}

export function levelCost(level: number): number {
  return level * 28;
}

export function enhanceCost(plus: number): number {
  return (plus + 1) * 45;
}

export function starDust(stars: number): number {
  return stars * 8;
}

export function pieceBonus(p: GearPiece): Partial<Stats> {
  const m = 1 + p.plus * 0.12;
  if (p.slot === "weapon") return { atk: Math.round(14 * m) };
  if (p.slot === "helm") return { def: Math.round(10 * m) };
  if (p.slot === "chest") return { hp: Math.round(80 * m) };
  return { spd: Math.round(6 * m) };
}

export function setBonuses(pieces: GearPiece[]): Partial<Stats> {
  const counts: Record<string, number> = {};
  for (const p of pieces) counts[p.set] = (counts[p.set] ?? 0) + 1;
  const out: Stats = { hp: 0, atk: 0, def: 0, spd: 0, crit: 0 };
  for (const [set, n] of Object.entries(counts)) {
    if (n < 2) continue;
    if (set === "forge") out.atk += n >= 4 ? 18 : 8;
    if (set === "cistern") out.hp += n >= 4 ? 160 : 80;
    if (set === "root") out.spd += n >= 4 ? 14 : 8;
    if (set === "choir") out.crit += n >= 4 ? 10 : 5;
  }
  return out;
}

export function factionTeamMod(team: HeroLike[]): number {
  const c: Record<string, number> = {};
  for (const h of team) c[h.faction] = (c[h.faction] ?? 0) + 1;
  const best = Math.max(0, ...Object.values(c));
  if (best >= 5) return 1.12;
  if (best >= 3) return 1.05;
  return 1;
}

export function resonanceFloor(progs: HeroProg[]): number {
  const lv = [...progs].map((p) => p.level).sort((a, b) => b - a);
  return lv[4] ?? lv[lv.length - 1] ?? 1;
}

export function poweredStats(
  hero: HeroLike,
  prog: HeroProg,
  equipped: GearPiece[],
  team: HeroLike[],
  honor = false,
  resonance = 1,
): Stats {
  const level = Math.max(prog.level, resonance);
  const lv = 1 + 0.075 * (level - 1);
  const st = 1 + 0.11 * (prog.stars - 1);
  const im = 1 + 0.01 * Math.min(IMPRINT_CAP, prog.imprint);
  const fac = factionTeamMod(team);
  let hp = hero.stats.hp * lv * st;
  let atk = hero.stats.atk * lv * st * im * fac;
  let def = hero.stats.def * lv * st;
  let spd = hero.stats.spd;
  let crit = hero.stats.crit;
  if (!honor) {
    for (const p of equipped) {
      const b = pieceBonus(p);
      hp += b.hp ?? 0;
      atk += b.atk ?? 0;
      def += b.def ?? 0;
      spd += b.spd ?? 0;
      crit += b.crit ?? 0;
    }
    const sb = setBonuses(equipped);
    hp += sb.hp ?? 0;
    atk += sb.atk ?? 0;
    def += sb.def ?? 0;
    spd += sb.spd ?? 0;
    crit += sb.crit ?? 0;
  }
  return {
    hp: Math.round(hp),
    atk: Math.round(atk),
    def: Math.round(def),
    spd: Math.round(spd),
    crit: Math.round(crit),
  };
}

export function starterGear(): GearPiece[] {
  return GEAR_SLOTS.map((slot, i) => ({
    id: `gear.starter.${slot}`,
    slot,
    set: GEAR_SETS[i % GEAR_SETS.length]!.id,
    plus: 0,
  }));
}

export function defaultProg(owned: string[]): Record<string, HeroProg> {
  const o: Record<string, HeroProg> = {};
  for (const id of owned) o[id] = { level: 1, stars: 1, imprint: 0, pas: 1, cmd: 1, ult: 1 };
  return o;
}

export const HUNT_ROOT = {
  id: "hunt.root",
  name: "Raiz de Lucent",
  bg: BG.thorn,
  enemyId: "enemy.goblin_king",
  stamina: 10,
  gold: 88,
  letters: 1,
} as const;
