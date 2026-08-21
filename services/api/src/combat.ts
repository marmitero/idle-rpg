import { randomInt, randomUUID } from "node:crypto";
import {
  ENEMIES,
  FACTION_TOWER_FLOORS,
  HERO_BY_ID,
  HEROES,
  HONOR_POOL,
  HUNT_UNLOCK_STAGE,
  HUNTS,
  LOAN_HEROES,
  STAGES,
  TOWER_FLOORS,
  TUTORIAL_DONE,
  TUTORIAL_STAGES,
  poweredStats,
  resonanceFloor,
  towerGold,
  towerScale,
  type HeroProg,
} from "@relicwake/content";
import { equippedPieces } from "./systems.ts";
import { mergeStars, starsFromBattle } from "@relicwake/content";
import { battleHash, simulate, type BattleInput, type BattleRecord, type LoadoutUnit } from "@relicwake/sim";
import { signReplay, verifyReplayMac } from "./auth.ts";
import {
  bumpDaily,
  credit,
  getBattleById,
  getBattleByIdempotency,
  insertBattle,
  listBattles,
  publicState,
  save,
  type Account,
  type BattleSummary,
  type StoredBattle,
} from "./store.ts";

const CONTENT_SEMVER = process.env.CONTENT_SEMVER ?? "0.1.0";

export type BattlePayload = {
  battleId: string;
  seed: number;
  input: BattleInput;
  result: BattleRecord["result"];
  hash: string;
  contentId: string;
  contentSemver: string;
  rewards: { gold: number; letters: number; win: boolean; stars: number };
  state: ReturnType<typeof publicState>;
};

function scaled(stats: LoadoutUnit["stats"], s: number): LoadoutUnit["stats"] {
  return {
    hp: Math.round(stats.hp * s),
    atk: Math.round(stats.atk * s),
    def: Math.round(stats.def * s),
    spd: stats.spd,
    crit: stats.crit,
  };
}

export function loadoutFromTeam(a: Account, honor = false, draftIds?: string[]): LoadoutUnit[] {
  let entries: { id: string; slot: number }[];
  if (!honor && !draftIds?.length) {
    // Batalhas normais: a formação 3x3 é a fonte de verdade do posicionamento.
    entries = a.formation
      .map((id, slot) => (typeof id === "string" ? { id, slot } : null))
      .filter((x): x is { id: string; slot: number } => x !== null);
    const used = new Set(entries.map((e) => e.id));
    for (const id of LOAN_HEROES) {
      if (entries.length >= 5) break;
      if (used.has(id)) continue;
      const slot = a.formation.indexOf(null);
      if (slot < 0) break;
      a.formation[slot] = id; // temporário: só para montar o input desta batalha
      used.add(id);
      entries.push({ id, slot });
    }
  } else {
    const ids = (draftIds?.length
      ? draftIds.map((d) => HONOR_POOL.find((p) => p.id === d)?.heroId ?? d)
      : [...a.team]
    ).slice(0, 5);
    entries = ids.map((id, slot) => ({ id, slot }));
  }
  const ids = entries.map((e) => e.id);
  const teamHeroes = ids.map((id) => HERO_BY_ID[id] ?? HEROES[0]!);
  const res = resonanceFloor(Object.values(a.heroProg ?? {}));
  const gear = honor ? [] : equippedPieces(a);
  return entries.map(({ id, slot }) => {
    const h = HERO_BY_ID[id] ?? HEROES[0]!;
    const prog: HeroProg = a.heroProg?.[id] ?? { level: 1, stars: 1, imprint: 0, pas: 1, cmd: 1, ult: 1 };
    return {
      id: `a${slot}`,
      heroId: h.id,
      name: h.name,
      faction: h.faction,
      stats: poweredStats(h, prog, gear, teamHeroes, honor, res),
      slot,
    };
  });
}

export function enemiesFor(id: string): LoadoutUnit[] | null {
  const stage = STAGES.find((s) => s.id === id);
  const hunt = HUNTS.find((h) => h.id === id);
  if (stage) {
    return stage.enemies.map((e, i) => {
      const def = ENEMIES.find((x) => x.id === e.enemyId) ?? ENEMIES[0]!;
      return {
        id: `e${i}`,
        heroId: def.id,
        name: def.name,
        faction: def.faction,
        stats: scaled(def.stats, e.scale),
        slot: e.slot,
      };
    });
  }
  if (hunt) {
    const def = ENEMIES.find((x) => x.id === hunt.enemyId) ?? ENEMIES[0]!;
    return [0, 2, 3].map((slot, i) => ({
      id: `e${i}`,
      heroId: def.id,
      name: def.name,
      faction: def.faction,
      stats: scaled(def.stats, i === 0 ? 1 : 0.72),
      slot,
    }));
  }
  const tw = id.match(/^tower\.(\d+)$/);
  if (tw) {
    const n = Number(tw[1]);
    const def = ENEMIES[n % ENEMIES.length]!;
    const sc = towerScale(n);
    return [0, 1, 2].map((slot, i) => ({
      id: `e${i}`,
      heroId: def.id,
      name: def.name,
      faction: def.faction,
      stats: scaled(def.stats, sc - i * 0.04),
      slot,
    }));
  }
  const ft = id.match(/^ftower\.([a-z]+)\.(\d+)$/);
  if (ft) {
    const n = Number(ft[2]);
    const def = ENEMIES[n % ENEMIES.length]!;
    const sc = towerScale(n + 10);
    return [0, 2].map((slot, i) => ({
      id: `e${i}`,
      heroId: def.id,
      name: def.name,
      faction: def.faction,
      stats: scaled(def.stats, sc - i * 0.05),
      slot,
    }));
  }
  if (id === "gwar" || id.startsWith("honor")) {
    const pack = id === "gwar" ? [ENEMIES[2]!, ENEMIES[1]!] : [HEROES[1]!, HEROES[2]!, HEROES[3]!];
    return pack.map((def, i) => ({
      id: `e${i}`,
      heroId: def.id,
      name: def.name,
      faction: def.faction,
      stats: scaled(def.stats, id === "gwar" ? 1.15 - i * 0.08 : 0.88),
      slot: i,
    }));
  }
  return null;
}

function publicRecord(rec: StoredBattle): BattleRecord {
  return {
    id: rec.id,
    contentId: rec.contentId,
    contentSemver: rec.contentSemver,
    seed: rec.seed,
    input: rec.input,
    result: rec.result,
    hash: rec.hash,
    winner: rec.winner,
    durationMs: rec.durationMs,
    createdAt: rec.createdAt,
  };
}

function intact(rec: StoredBattle): boolean {
  if (!verifyReplayMac(rec.hash, rec.mac)) return false;
  return battleHash(rec.input, rec.result) === rec.hash;
}

function toPayload(a: Account, rec: StoredBattle, rewards: BattlePayload["rewards"]): BattlePayload {
  return {
    battleId: rec.id,
    seed: rec.seed,
    input: rec.input,
    result: rec.result,
    hash: rec.hash,
    contentId: rec.contentId,
    contentSemver: rec.contentSemver,
    rewards,
    state: publicState(a),
  };
}

export async function resolveBattle(
  a: Account,
  contentId: string,
  idempotencyKey: string | null,
  extra?: { opponentId?: string },
): Promise<{ ok: true; payload: BattlePayload } | { ok: false; error: string }> {
  if (idempotencyKey) {
    const prior = await getBattleByIdempotency(a.id, idempotencyKey);
    if (prior) {
      if (!intact(prior)) return { ok: false, error: "replay_corrupt" };
      return {
        ok: true,
        payload: toPayload(a, prior, {
          gold: 0,
          letters: 0,
          win: prior.winner === "ally",
        }),
      };
    }
  }

  const stage = STAGES.find((s) => s.id === contentId);
  const hunt = HUNTS.find((h) => h.id === contentId);
  const towerM = contentId.match(/^tower\.(\d+)$/);
  const ftM = contentId.match(/^ftower\.([a-z]+)\.(\d+)$/);
  const isHonor = contentId.startsWith("honor");
  const isArena = contentId === "arena";
  const isWar = contentId === "gwar";

  if ((a.tutorialStep ?? TUTORIAL_DONE) < TUTORIAL_DONE) {
    if (!stage || !(TUTORIAL_STAGES as readonly string[]).includes(stage.id)) {
      return { ok: false, error: "tutorial_lock" };
    }
  }
  if (hunt && !a.cleared.includes(HUNT_UNLOCK_STAGE)) return { ok: false, error: "hunt_locked" };

  let enemies = enemiesFor(contentId);
  if (isArena) {
    const { db } = await import("./db.ts");
    const opp = extra?.opponentId
      ? await db.get<{ snapshot: string }>("SELECT snapshot FROM arena_board WHERE account_id = ?", [extra.opponentId])
      : undefined;
    if (!opp) return { ok: false, error: "no_opponent" };
    if (a.arenaAttacks < 1) return { ok: false, error: "no_attacks" };
    a.arenaAttacks -= 1;
    const snap = JSON.parse(opp.snapshot) as { team: string[] };
    enemies = (snap.team ?? []).slice(0, 5).map((hid, slot) => {
      const h = HERO_BY_ID[hid] ?? HEROES[0]!;
      return { id: `e${slot}`, heroId: h.id, name: h.name, faction: h.faction, stats: scaled(h.stats, 1), slot };
    });
  }
  if (!enemies) return { ok: false, error: "unknown_content" };

  if (hunt) {
    if (a.stamina < hunt.stamina) return { ok: false, error: "no_breath" };
    await credit(a, "stamina", -hunt.stamina, "hunt.enter", hunt.id);
  }
  if (isWar) {
    if (!a.guildId) return { ok: false, error: "no_guild" };
    if (a.warAttacks < 1) return { ok: false, error: "no_war" };
    a.warAttacks -= 1;
  }
  if (isHonor && a.honorDraft.length !== 5) return { ok: false, error: "no_draft" };

  const allies = loadoutFromTeam(a, isHonor, isHonor ? a.honorDraft : undefined);
  const seed = randomInt(1, 2_147_000_000);
  const input: BattleInput = { seed, allies, enemies, directives: a.directives };
  const result = simulate(input);
  const hash = battleHash(input, result);
  const battleId = randomUUID();
  const rec: StoredBattle = {
    id: battleId,
    accountId: a.id,
    contentId,
    contentSemver: CONTENT_SEMVER,
    seed,
    input,
    result,
    hash,
    mac: signReplay(hash),
    winner: result.winner,
    durationMs: result.durationMs,
    createdAt: Date.now(),
  };

  await insertBattle(rec, idempotencyKey);

  let gold = 0;
  let letters = 0;
  let stars = 0;
  if (result.winner === "ally") {
    if (stage) {
      gold = stage.gold;
      await credit(a, "gold", gold, "battle.win", battleId);
      if (!a.cleared.includes(stage.id)) a.cleared.push(stage.id);
      const idx = STAGES.findIndex((s) => s.id === stage.id);
      const afk = STAGES.findIndex((s) => s.id === a.afkStage);
      if (idx >= afk) a.afkStage = stage.id;
      // Estrelas da campanha (docs/campaign/03): máx. entre replays.
      const allyTotal = Math.max(1, input.allies.length);
      const allyAlive = input.allies.filter((u) => (result.remaining[u.id] ?? 0) > 0).length;
      stars = starsFromBattle(true, allyAlive / allyTotal);
      a.campaignStars = mergeStars(a.campaignStars, stage.id, stars);
      bumpDaily(a, "fight");
    }
    if (hunt) {
      gold = hunt.gold;
      letters = hunt.letters;
      await credit(a, "gold", gold, "hunt.win", battleId);
      await credit(a, "letters", letters, "hunt.win", battleId);
      bumpDaily(a, "hunt");
    }
    if (towerM) {
      const n = Number(towerM[1]);
      gold = towerGold(n);
      await credit(a, "gold", gold, "tower.win", battleId);
      await credit(a, "dust", 2, "tower.win", battleId);
      if (n === a.towerFloor && a.towerFloor < TOWER_FLOORS) a.towerFloor += 1;
      a.passXp += 10;
    }
    if (ftM) {
      const fac = ftM[1]!;
      const n = Number(ftM[2]);
      gold = towerGold(n);
      await credit(a, "gold", gold, "ftower.win", battleId);
      if (n === (a.factionTower[fac] ?? 1) && (a.factionTower[fac] ?? 1) < FACTION_TOWER_FLOORS) {
        a.factionTower[fac] = n + 1;
      }
    }
    if (isArena && extra?.opponentId) {
      gold = 25;
      await credit(a, "gold", gold, "arena.win", battleId);
      await credit(a, "crests", 8, "arena.win", battleId);
      a.arenaRating += 18;
      a.passXp += 6;
    }
    if (isHonor) {
      gold = 15;
      await credit(a, "gold", gold, "honor.win", battleId);
    }
    if (isWar) {
      gold = 40;
      await credit(a, "gold", gold, "gwar.win", battleId);
      await credit(a, "ember", 6, "gwar.win", battleId);
    }
  } else if (isArena) {
    a.arenaRating = Math.max(0, a.arenaRating - 12);
  }

  await save(a);
  return { ok: true, payload: toPayload(a, rec, { gold, letters, win: result.winner === "ally", stars }) };
}

export async function readBattle(
  a: Account,
  id: string,
): Promise<{ ok: true; record: BattleRecord } | { ok: false; error: string }> {
  const rec = await getBattleById(id, a.id);
  if (!rec) return { ok: false, error: "not_found" };
  if (!intact(rec)) return { ok: false, error: "replay_corrupt" };
  return { ok: true, record: publicRecord(rec) };
}

export async function readBattles(a: Account): Promise<BattleSummary[]> {
  return listBattles(a.id, 20);
}
