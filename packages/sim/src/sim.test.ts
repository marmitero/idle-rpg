import assert from "node:assert/strict";
import { test } from "node:test";
import { battleHash, makeRng, simulate, verifyJudgement, type LoadoutUnit } from "./index.js";

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

test("battleHash is stable and detects tampering", () => {
  const input = {
    seed: 42,
    allies: [unit("a0", 0), unit("a1", 1)],
    enemies: [unit("e0", 0, 40), unit("e1", 1, 40)],
    directives: ["foco" as const],
  };
  const a = simulate(input);
  const b = simulate(input);
  assert.equal(battleHash(input, a), battleHash(input, b));
  assert.equal(verifyJudgement(input, a), true);
  const tampered = { ...a, winner: a.winner === "ally" ? ("enemy" as const) : ("ally" as const) };
  assert.notEqual(battleHash(input, a), battleHash(input, tampered));
  assert.equal(verifyJudgement(input, tampered), false);
});

test("same inputs replay identically across seeds (golden)", () => {
  for (let seed = 1; seed <= 40; seed++) {
    const input = {
      seed,
      allies: [unit("a0", 0, 100), unit("a1", 1, 90), unit("a2", 2, 80)],
      enemies: [unit("e0", 0, 70), unit("e1", 1, 60)],
      directives: ["guarda" as const, "execute" as const],
    };
    const x = simulate(input);
    const y = simulate(input);
    assert.deepEqual(x.events, y.events);
    assert.equal(battleHash(input, x), battleHash(input, y));
  }
});
