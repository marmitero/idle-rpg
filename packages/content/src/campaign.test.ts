import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CAMPAIGN,
  CAMPAIGN_CHAPTER_BY_ID,
  CAMPAIGN_STAGE_BY_ID,
  computeStageState,
  currentStageId,
  describeRequirement,
  isChapterUnlocked,
  isStageUnlocked,
  mergeStars,
  requirementMet,
  starsFromBattle,
  type CampaignProgress,
} from "./index.ts";

const P = (cleared: string[], stars: Record<string, number> = {}, playerLevel?: number): CampaignProgress => ({
  cleared,
  stars,
  playerLevel,
});

test("campanha: 12 capítulos × 20 estágios, ids únicos e posições normalizadas", () => {
  assert.equal(CAMPAIGN.id, "main_campaign");
  assert.equal(CAMPAIGN.chapters.length, 12);
  for (const ch of CAMPAIGN.chapters) {
    assert.equal(ch.stageDefs.length, 20);
    assert.equal(ch.stages.length, 20);
    assert.equal(ch.stageDefs.filter((d) => d.type === "boss").length, 1, `${ch.id} tem boss`);
    assert.equal(ch.stageDefs.filter((d) => d.type === "elite").length, 1, `${ch.id} tem elite`);
    for (const d of ch.stageDefs) {
      assert.ok(d.position.x >= 0 && d.position.x <= 1, `${d.id} x normalizado`);
      assert.ok(d.position.y >= 0 && d.position.y <= 1, `${d.id} y normalizado`);
      assert.ok(d.rewards.gold > 0 && d.recommendedPower >= 50);
      for (const next of d.connections) assert.ok(CAMPAIGN_STAGE_BY_ID[next], `${d.id}→${next} existe`);
    }
    // cadeia: cada estágio conecta ao próximo; último (boss) não conecta
    for (let i = 0; i < ch.stageDefs.length - 1; i++) {
      assert.deepEqual(ch.stageDefs[i]!.connections, [ch.stageDefs[i + 1]!.id]);
    }
    assert.deepEqual(ch.stageDefs[19]!.connections, []);
    assert.equal(ch.bossStageId, ch.stageDefs[19]!.id);
  }
  const all = CAMPAIGN.chapters.flatMap((c) => c.stages);
  assert.equal(new Set(all).size, all.length);
});

test("progressão linear: 1-1 aberto, resto bloqueado; completar desbloqueia o próximo", () => {
  const empty = P([]);
  assert.equal(isStageUnlocked(CAMPAIGN_STAGE_BY_ID["1-1"]!, empty), true);
  assert.equal(isStageUnlocked(CAMPAIGN_STAGE_BY_ID["1-2"]!, empty), false);
  assert.equal(currentStageId(empty), "1-1");

  const after11 = P(["1-1"]);
  assert.equal(isStageUnlocked(CAMPAIGN_STAGE_BY_ID["1-2"]!, after11), true);
  assert.equal(currentStageId(after11), "1-2");
});

test("estados do nó: locked/current/completed/perfect/boss/boss_locked", () => {
  const empty = P([]);
  assert.equal(computeStageState(CAMPAIGN_STAGE_BY_ID["1-1"]!, empty), "current");
  assert.equal(computeStageState(CAMPAIGN_STAGE_BY_ID["1-2"]!, empty), "locked");
  assert.equal(computeStageState(CAMPAIGN_STAGE_BY_ID["1-20"]!, empty), "boss_locked");

  const p1 = P(["1-1"], { "1-1": 1 });
  assert.equal(computeStageState(CAMPAIGN_STAGE_BY_ID["1-1"]!, p1), "completed");
  assert.equal(computeStageState(CAMPAIGN_STAGE_BY_ID["1-2"]!, p1), "current");

  const perfect = P(["1-1"], { "1-1": 3 });
  assert.equal(computeStageState(CAMPAIGN_STAGE_BY_ID["1-1"]!, perfect), "perfect");

  const bossOpen = P(Array.from({ length: 19 }, (_, i) => `${1}-${i + 1}`));
  assert.equal(computeStageState(CAMPAIGN_STAGE_BY_ID["1-20"]!, bossOpen), "boss");
});

test("capítulos: cap. 2 bloqueado até o boss do cap. 1; depois 2-1 vira corrente", () => {
  const ch1 = CAMPAIGN_CHAPTER_BY_ID["chapter_1"]!;
  const ch2 = CAMPAIGN_CHAPTER_BY_ID["chapter_2"]!;
  const onlyBoss = P(["1-20"]);
  assert.equal(isChapterUnlocked(ch1, P([])), true);
  assert.equal(isChapterUnlocked(ch2, P([])), false);
  assert.equal(isChapterUnlocked(ch2, onlyBoss), true);
  // 2-1 exige chapter_completion (não previous_stage de 1-20)
  assert.equal(isStageUnlocked(CAMPAIGN_STAGE_BY_ID["2-1"]!, onlyBoss), true);
  assert.equal(isStageUnlocked(CAMPAIGN_STAGE_BY_ID["2-1"]!, P(["1-19"])), false);
  // a campanha é sequencial: com só o boss limpo, a corrente continua em 1-1
  assert.equal(currentStageId(onlyBoss), "1-1");
  // capítulo 1 inteiro limpo → corrente avança para 2-1
  const fullCh1 = P(Array.from({ length: 20 }, (_, i) => `1-${i + 1}`));
  assert.equal(currentStageId(fullCh1), "2-1");
});

test("requisitos genéricos: multiple_stages, boss_defeated, player_level, none", () => {
  const base = P(["a", "b"], {}, 40);
  assert.equal(requirementMet({ type: "none" }, base), true);
  assert.equal(requirementMet({ type: "previous_stage", stageId: "a" }, base), true);
  assert.equal(requirementMet({ type: "previous_stage", stageId: "z" }, base), false);
  assert.equal(requirementMet({ type: "multiple_stages", requiredStages: ["a", "b"] }, base), true);
  assert.equal(requirementMet({ type: "multiple_stages", requiredStages: ["a", "z"] }, base), false);
  assert.equal(requirementMet({ type: "player_level", level: 40 }, base), true);
  assert.equal(requirementMet({ type: "player_level", level: 41 }, base), false);
  assert.equal(requirementMet({ type: "boss_defeated", bossStageId: "b" }, base), true);
  assert.ok(describeRequirement({ type: "previous_stage", stageId: "1-4" }).includes("1-4"));
});

test("estrelas: thresholds de sobrevivência e merge sem regressão", () => {
  assert.equal(starsFromBattle(false, 1), 0);
  assert.equal(starsFromBattle(true, 1), 3);
  assert.equal(starsFromBattle(true, 0.75), 2);
  assert.equal(starsFromBattle(true, 0.6), 2);
  assert.equal(starsFromBattle(true, 0.4), 1);
  let stars = mergeStars({}, "1-1", 1);
  stars = mergeStars(stars, "1-1", 3);
  assert.equal(stars["1-1"], 3);
  stars = mergeStars(stars, "1-1", 2); // replay pior não regride
  assert.equal(stars["1-1"], 3);
});
