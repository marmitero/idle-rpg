import { randomInt, randomUUID } from "node:crypto";
import {
  ENEMIES,
  HERO_BY_ID,
  HEROES,
  HUNT_UNLOCK_STAGE,
  HUNTS,
  LOAN_HEROES,
  STAGES,
  TUTORIAL_DONE,
  TUTORIAL_STAGES,
} from "@relicwake/content";
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
  rewards: { gold: number; letters: number; win: boolean };
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

export function loadoutFromTeam(a: Account): LoadoutUnit[] {
  const ids = [...a.team];
  for (const id of LOAN_HEROES) {
    if (ids.length >= 5) break;
    if (!ids.includes(id)) ids.push(id);
  }
  return ids.slice(0, 5).map((id, slot) => {
    const h = HERO_BY_ID[id] ?? HEROES[0]!;
    return { id: `a${slot}`, heroId: h.id, name: h.name, faction: h.faction, stats: h.stats, slot };
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
  if (!stage && !hunt) return { ok: false, error: "unknown_content" };

  if ((a.tutorialStep ?? TUTORIAL_DONE) < TUTORIAL_DONE) {
    if (hunt) return { ok: false, error: "tutorial_lock" };
    if (stage && !(TUTORIAL_STAGES as readonly string[]).includes(stage.id)) {
      return { ok: false, error: "tutorial_lock" };
    }
  }
  if (hunt && !a.cleared.includes(HUNT_UNLOCK_STAGE)) return { ok: false, error: "hunt_locked" };

  const enemies = enemiesFor(contentId);
  if (!enemies) return { ok: false, error: "unknown_content" };

  if (hunt) {
    if (a.stamina < hunt.stamina) return { ok: false, error: "no_breath" };
    await credit(a, "stamina", -hunt.stamina, "hunt.enter", hunt.id);
  }

  const allies = loadoutFromTeam(a);
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
  if (result.winner === "ally") {
    if (stage) {
      gold = stage.gold;
      await credit(a, "gold", gold, "battle.win", battleId);
      if (!a.cleared.includes(stage.id)) a.cleared.push(stage.id);
      const idx = STAGES.findIndex((s) => s.id === stage.id);
      const afk = STAGES.findIndex((s) => s.id === a.afkStage);
      if (idx >= afk) a.afkStage = stage.id;
      bumpDaily(a, "fight");
    }
    if (hunt) {
      gold = hunt.gold;
      letters = hunt.letters;
      await credit(a, "gold", gold, "hunt.win", battleId);
      await credit(a, "letters", letters, "hunt.win", battleId);
      bumpDaily(a, "hunt");
    }
  }

  await save(a);
  return { ok: true, payload: toPayload(a, rec, { gold, letters, win: result.winner === "ally" }) };
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
