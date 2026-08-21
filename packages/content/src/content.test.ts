import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CHAPTERS,
  ENEMIES,
  EVENTS,
  HEROES,
  HONOR_POOL,
  HUNTS,
  HUNT_UNLOCK_STAGE,
  STAGES,
  TOWER_FLOORS,
  TUTORIAL_STAGES,
  isStageOpen,
  poweredStats,
  starterGear,
} from "./index.ts";

test("campaign is 12 chapters × 20 stages", () => {
  assert.equal(STAGES.length, 240);
  assert.equal(CHAPTERS.length, 12);
  assert.equal(STAGES.filter((s) => s.chapter === 1).length, 20);
  assert.equal(STAGES.filter((s) => s.chapter === 12).length, 20);
  const ids = STAGES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(STAGES[0]!.id, "1-1");
  assert.equal(STAGES[239]!.id, "12-20");
});

test("wake rate and gold climb", () => {
  assert.ok(STAGES[0]!.wakeRate < STAGES[39]!.wakeRate);
  assert.ok(STAGES[0]!.gold < STAGES[19]!.gold);
  assert.ok(STAGES.every((s) => s.enemies.length >= 1 && s.enemies.length <= 5));
});

test("tutorial and hunt gates exist", () => {
  for (const id of TUTORIAL_STAGES) assert.ok(STAGES.some((s) => s.id === id));
  assert.ok(STAGES.some((s) => s.id === HUNT_UNLOCK_STAGE));
  assert.equal(isStageOpen([], "1-1"), true);
  assert.equal(isStageOpen([], "1-2"), false);
  assert.equal(isStageOpen(["1-1"], "1-2"), true);
});

test("systems complete content exists", () => {
  assert.equal(HUNTS.filter((h) => /^hunt\.[a-z]+\.\d+$/.test(h.id)).length, 40);
  assert.equal(HONOR_POOL.length, 16);
  assert.equal(TOWER_FLOORS, 200);
  assert.equal(starterGear().length, 4);
  const h = {
    id: "hero.warrior",
    name: "Kael",
    faction: "embercourt" as const,
    stats: { hp: 100, atk: 10, def: 10, spd: 10, crit: 5 },
  };
  const p = { level: 10, stars: 2, imprint: 2, pas: 1, cmd: 1, ult: 1 };
  const s = poweredStats(h, p, starterGear(), [h, h, h], false, 10);
  assert.ok(s.atk > 10);
});

test("content complete roster and acts", () => {
  assert.equal(HEROES.length, 28);
  assert.ok(ENEMIES.length >= 36 + 12 + 12);
  assert.equal(EVENTS.length, 3);
});
