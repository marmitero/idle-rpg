import assert from "node:assert/strict";
import { test } from "node:test";
import { CHAPTERS, HUNT_UNLOCK_STAGE, STAGES, TUTORIAL_STAGES, isStageOpen } from "./index.ts";

test("slice campaign is 40 stages across 2 chapters", () => {
  assert.equal(STAGES.length, 40);
  assert.equal(CHAPTERS.length, 2);
  assert.equal(STAGES.filter((s) => s.chapter === 1).length, 20);
  assert.equal(STAGES.filter((s) => s.chapter === 2).length, 20);
  const ids = STAGES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(STAGES[0]!.id, "1-1");
  assert.equal(STAGES[39]!.id, "2-20");
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
