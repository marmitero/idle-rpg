import { factionMod, type DirectiveId, type Faction, type Stats, type Team } from "@relicwake/shared";

/** xorshift32 — no Math.random */
export function makeRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

export type BattleUnit = {
  id: string;
  heroId: string;
  name: string;
  team: Team;
  slot: number;
  faction: Faction;
  stats: Stats;
  hp: number;
  ult: number;
  alive: boolean;
  nextAt: number;
};

export type BattleEvent =
  | { t: number; kind: "attack"; src: string; dst: string; dmg: number; crit: boolean }
  | { t: number; kind: "ult"; src: string; dst: string; dmg: number }
  | { t: number; kind: "heal"; src: string; dst: string; amount: number }
  | { t: number; kind: "guard"; dst: string }
  | { t: number; kind: "death"; id: string }
  | { t: number; kind: "end"; winner: Team };

export type LoadoutUnit = {
  id: string;
  heroId: string;
  name: string;
  faction: Faction;
  stats: Stats;
  slot: number;
};

export type BattleInput = {
  seed: number;
  allies: LoadoutUnit[];
  enemies: LoadoutUnit[];
  directives: DirectiveId[];
};

export type BattleResult = {
  winner: Team;
  durationMs: number;
  events: BattleEvent[];
  remaining: Record<string, number>;
};

/** Persistable judged fight. Client plays `result.events`; it does not resimulate. */
export type BattleRecord = {
  id: string;
  contentId: string;
  contentSemver: string;
  seed: number;
  input: BattleInput;
  result: BattleResult;
  hash: string;
  winner: Team;
  durationMs: number;
  createdAt: number;
};

/** Canonical JSON (sorted keys) so the hash is stable across runtimes. */
export function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`).join(",")}}`;
}

/** FNV-1a 64-bit — portable, no node:crypto (sim runs in Node and in the browser). */
export function fnv1a64(text: string): string {
  let h = 0xcbf29ce484222325n;
  for (let i = 0; i < text.length; i++) {
    h ^= BigInt(text.charCodeAt(i));
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return h.toString(16).padStart(16, "0");
}

export function battleHash(input: BattleInput, result: BattleResult): string {
  return fnv1a64(
    canonical({
      seed: input.seed,
      allies: input.allies,
      enemies: input.enemies,
      directives: input.directives,
      winner: result.winner,
      durationMs: result.durationMs,
      events: result.events,
      remaining: result.remaining,
    }),
  );
}

/** Re-run sim and compare hashes. Server/CI only — the client must not judge. */
export function verifyJudgement(input: BattleInput, result: BattleResult): boolean {
  return battleHash(input, simulate(input)) === battleHash(input, result);
}

const TICK = 50;
const LIMIT = 45_000;
const ULT_COST = 100;

function interval(spd: number): number {
  return Math.max(650, 2100 - spd * 9);
}

function pickTarget(src: BattleUnit, foes: BattleUnit[], directives: DirectiveId[], rng: () => number): BattleUnit | null {
  const live = foes.filter((u) => u.alive);
  if (!live.length) return null;
  if (directives.includes("foco")) {
    return live.reduce((a, b) => (a.stats.atk >= b.stats.atk ? a : b));
  }
  if (directives.includes("execute")) {
    const low = live.filter((u) => u.hp / u.stats.hp < 0.35);
    if (low.length) return low[rng() * low.length | 0] ?? low[0]!;
  }
  const front = live.filter((u) => u.slot < 2);
  const pool = front.length ? front : live;
  return pool[rng() * pool.length | 0] ?? pool[0]!;
}

function dmgOf(src: BattleUnit, dst: BattleUnit, ratio: number, directives: DirectiveId[], rng: () => number): { dmg: number; crit: boolean } {
  let fac = factionMod(src.faction, dst.faction);
  if (directives.includes("cisma")) fac = 1 + (fac - 1) * 0.8;
  const crit = rng() < src.stats.crit / 100;
  let raw = (src.stats.atk * ratio * fac * (crit ? 1.5 : 1)) / (dst.stats.def + 100);
  if (directives.includes("execute") && dst.hp / dst.stats.hp < 0.35) raw *= 1.3;
  if (directives.includes("guarda") && dst.team === "ally") raw *= 0.88;
  return { dmg: Math.max(1, Math.round(raw * 18)), crit };
}

export function simulate(input: BattleInput): BattleResult {
  const rng = makeRng(input.seed);
  const units: BattleUnit[] = [
    ...input.allies.map((u) => ({
      ...u,
      team: "ally" as const,
      hp: u.stats.hp,
      ult: 0,
      alive: true,
      nextAt: interval(u.stats.spd) * (0.2 + rng() * 0.4),
    })),
    ...input.enemies.map((u) => ({
      ...u,
      team: "enemy" as const,
      hp: u.stats.hp,
      ult: 0,
      alive: true,
      nextAt: interval(u.stats.spd) * (0.3 + rng() * 0.5),
    })),
  ];

  const events: BattleEvent[] = [];
  let t = 0;
  let winner: Team | null = null;

  const living = (team: Team) => units.filter((u) => u.team === team && u.alive);

  while (t < LIMIT && !winner) {
    t += TICK;
    for (const u of units) {
      if (!u.alive) continue;
      if (u.nextAt > t) continue;
      const foes = living(u.team === "ally" ? "enemy" : "ally");
      const dst = pickTarget(u, foes, input.directives, rng);
      if (!dst) continue;

      const fireUlt = u.ult >= ULT_COST;
      const ratio = fireUlt ? 2.4 : 1;
      const { dmg, crit } = dmgOf(u, dst, ratio, input.directives, rng);
      dst.hp -= dmg;
      u.ult = fireUlt ? 0 : Math.min(ULT_COST, u.ult + 18 + (crit ? 8 : 0));
      u.nextAt = t + interval(u.stats.spd);

      events.push(
        fireUlt
          ? { t, kind: "ult", src: u.id, dst: dst.id, dmg }
          : { t, kind: "attack", src: u.id, dst: dst.id, dmg, crit },
      );

      if (fireUlt && input.directives.includes("pacto") && u.team === "ally") {
        for (const a of living("ally")) {
          const heal = Math.round(a.stats.hp * 0.08);
          a.hp = Math.min(a.stats.hp, a.hp + heal);
          events.push({ t, kind: "heal", src: u.id, dst: a.id, amount: heal });
        }
      }

      if (dst.hp <= 0) {
        dst.hp = 0;
        dst.alive = false;
        events.push({ t, kind: "death", id: dst.id });
      }
    }
    if (!living("enemy").length) winner = "ally";
    else if (!living("ally").length) winner = "enemy";
  }

  if (!winner) winner = living("ally").length ? "ally" : "enemy";
  events.push({ t, kind: "end", winner });
  const remaining: Record<string, number> = {};
  for (const u of units) remaining[u.id] = u.hp;
  return { winner, durationMs: t, events, remaining };
}
