import assert from "node:assert/strict";
import { test } from "node:test";
import { makeRng, simulate, type LoadoutUnit } from "./index.js";

const unit = (id: string, slot: number, atk = 80): LoadoutUnit => ({
  id,
  heroId: "hero.warrior",
  name: id,
  faction: "embercourt",
  stats: { hp: 800, atk, def: 30, spd: 60, crit: 10 },
  slot,
});

test("rng is deterministic", () => {
  const a = makeRng(42);
  const b = makeRng(42);
  assert.equal(a(), b());
  assert.equal(a(), b());
});

test("simulate is deterministic for the same seed", () => {
  const input = {
    seed: 99,
    allies: [unit("a0", 0), unit("a1", 1)],
    enemies: [unit("e0", 0, 40), unit("e1", 1, 40)],
    directives: ["foco" as const],
  };
  const x = simulate(input);
  const y = simulate(input);
  assert.equal(x.winner, y.winner);
  assert.equal(x.events.length, y.events.length);
  assert.equal(x.durationMs, y.durationMs);
});

test("allies can win a weaker pack", () => {
  const r = simulate({
    seed: 7,
    allies: [unit("a0", 0, 120), unit("a1", 1, 120), unit("a2", 2, 120)],
    enemies: [unit("e0", 0, 20)],
    directives: ["execute"],
  });
  assert.equal(r.winner, "ally");
  assert.ok(r.events.some((e) => e.kind === "end"));
});
