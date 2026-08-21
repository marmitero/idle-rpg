import type { Faction, Stats } from "@relicwake/shared";
export type { HeroDef } from "./heroes.ts";
export { HEROES, HERO_BY_ID, SLICE_OWNED } from "./heroes.ts";
import { HEROES, HERO_BY_ID } from "./heroes.ts";

// Campaign Map (docs/campaign/*)
export * from "./campaign.ts";
export * from "./campaignState.ts";

export type EnemyDef = {
  id: string;
  name: string;
  faction: Faction;
  stats: Stats;
  art: { idle: string; atk: string; hit: string; die: string };
  kind: "fodder" | "elite" | "boss";
};

const bossArt = (slug: string) => ({
  idle: `/assets/enemies/rw_enemy_boss_${slug}_idle.png`,
  atk: `/assets/enemies/rw_enemy_boss_${slug}_atk.png`,
  hit: `/assets/enemies/rw_enemy_boss_${slug}_hit.png`,
  die: `/assets/enemies/rw_enemy_boss_${slug}_die.png`,
});

const ART = {
  goblin: bossArt("goblin_king"),
  wyrm: bossArt("ash_wyrm"),
  hydra: bossArt("pale_hydra"),
};

function enemy(id: string, name: string, faction: Faction, stats: Stats, art: EnemyDef["art"], kind: EnemyDef["kind"]): EnemyDef {
  return { id, name, faction, stats, art, kind };
}

/** 36 fodder + 12 elite + 12 bosses (3 artes-base emprestadas). */
export const ENEMIES: EnemyDef[] = [
  enemy("enemy.goblin_king", "Rei Goblin", "ashen", { hp: 640, atk: 52, def: 28, spd: 50, crit: 8 }, ART.goblin, "boss"),
  enemy("enemy.ash_wyrm", "Wyrm de Cinza", "embercourt", { hp: 1100, atk: 72, def: 40, spd: 40, crit: 10 }, ART.wyrm, "boss"),
  enemy("enemy.pale_hydra", "Hidra Pálida", "tidebound", { hp: 1500, atk: 68, def: 36, spd: 48, crit: 12 }, ART.hydra, "boss"),
  enemy("enemy.boss.goblin_king", "Rei Goblin", "ashen", { hp: 640, atk: 52, def: 28, spd: 50, crit: 8 }, ART.goblin, "boss"),
  enemy("enemy.boss.ash_wyrm", "Wyrm de Cinza", "embercourt", { hp: 1100, atk: 72, def: 40, spd: 40, crit: 10 }, ART.wyrm, "boss"),
  enemy("enemy.boss.pale_hydra", "Hidra Pálida", "tidebound", { hp: 1500, atk: 68, def: 36, spd: 48, crit: 12 }, ART.hydra, "boss"),
  ...(["ember", "tide", "thorn", "ash"] as const).flatMap((fac, fi) => {
    const faction: Faction = fac === "ember" ? "embercourt" : fac === "tide" ? "tidebound" : fac === "thorn" ? "thornveil" : "ashen";
    const art = fi % 3 === 0 ? ART.goblin : fi % 3 === 1 ? ART.wyrm : ART.hydra;
    const fodder = Array.from({ length: 9 }, (_, i) =>
      enemy(
        `enemy.fodder.${fac}${i ? `.${i}` : ""}`,
        `Eco ${fac} ${i + 1}`,
        faction,
        { hp: 420 + i * 20, atk: 36 + i * 2, def: 20 + i, spd: 46 + i, crit: 6 },
        art,
        "fodder",
      ),
    );
    const elites = Array.from({ length: 3 }, (_, i) =>
      enemy(
        `enemy.elite.${fac}${i ? `.${i}` : ""}`,
        `Elite ${fac} ${i + 1}`,
        faction,
        { hp: 800 + i * 40, atk: 58 + i * 4, def: 32 + i * 2, spd: 50, crit: 10 },
        art,
        "elite",
      ),
    );
    return [...fodder, ...elites];
  }),
  ...Array.from({ length: 12 }, (_, i) => {
    const ch = i + 1;
    const art = i % 3 === 0 ? ART.goblin : i % 3 === 1 ? ART.wyrm : ART.hydra;
    const faction: Faction = (["embercourt", "tidebound", "thornveil", "ashen"] as const)[i % 4]!;
    return enemy(
      `enemy.boss.ch${ch}`,
      `Ato ${ch}`,
      faction,
      { hp: 900 + ch * 80, atk: 60 + ch * 4, def: 34 + ch, spd: 44, crit: 10 },
      art,
      "boss",
    );
  }),
];

export type { StageDef } from "./stages.ts";
export { BG, CHAPTERS, STAGES, ACT_CUTSCENES, isStageOpen } from "./stages.ts";
export * from "./systems.ts";
export * from "./i18n.ts";
export * from "./events.ts";
import { BG } from "./stages.ts";
import { HUNT_ROOT } from "./systems.ts";

export const TUTORIAL_DONE = 8;
export const TUTORIAL_STAGES = ["1-1", "1-2", "1-3", "1-4"] as const;
export const HUNT_UNLOCK_STAGE = "1-10";
export const LOAN_HEROES = ["hero.warrior", "hero.guardian", "hero.mage", "hero.archer", "hero.rogue"];
export const STARTERS = [
  { id: "hero.warrior", line: "Kael. Embercourt. O Sono se quebra com trabalho." },
  { id: "hero.mage", line: "Orren. Tidebound. A memória muda de nome, não de ofício." },
  { id: "hero.archer", line: "Mira. Thornveil. A cidade é comida. A flecha não." },
] as const;

export type HuntDef = {
  id: string;
  dungeon: string;
  level: number;
  name: string;
  bg: string;
  enemyId: string;
  stamina: number;
  gold: number;
  letters: number;
};

const HUNT_BASE: Omit<HuntDef, "id" | "level">[] = [
  { dungeon: "goblin", name: "Toca Goblin", bg: BG.goblin, enemyId: "enemy.goblin_king", stamina: 8, gold: 70, letters: 1 },
  { dungeon: "wyrm", name: "Covil do Wyrm", bg: BG.wyrm, enemyId: "enemy.ash_wyrm", stamina: 10, gold: 95, letters: 1 },
  { dungeon: "hydra", name: "Cisterna da Hidra", bg: BG.hydra, enemyId: "enemy.pale_hydra", stamina: 12, gold: 120, letters: 2 },
  { dungeon: "root", name: HUNT_ROOT.name, bg: HUNT_ROOT.bg, enemyId: HUNT_ROOT.enemyId, stamina: HUNT_ROOT.stamina, gold: HUNT_ROOT.gold, letters: HUNT_ROOT.letters },
];

export const HUNTS: HuntDef[] = HUNT_BASE.flatMap((h) =>
  Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    return {
      ...h,
      id: `hunt.${h.dungeon}.${level}`,
      level,
      name: `${h.name} ${level}`,
      stamina: h.stamina + i,
      gold: Math.round(h.gold * (1 + i * 0.12)),
      letters: h.letters + (i % 4 === 3 ? 1 : 0),
    };
  }),
);

/** aliases do slice */
HUNTS.push(
  { ...HUNTS[0]!, id: "hunt.goblin" },
  { ...HUNTS[10]!, id: "hunt.wyrm" },
  { ...HUNTS[20]!, id: "hunt.hydra" },
  { ...HUNTS[30]!, id: "hunt.root" },
);

export const HONOR_POOL: { id: string; heroId: string; name: string }[] = HEROES.slice(0, 16).map((h) => ({
  id: `honor.${h.id}`,
  heroId: h.id,
  name: h.name,
}));

export const DAILIES = [
  { id: "wake", label: "Coletar Wake", target: 1, gold: 40, letters: 2, sweep: 1 },
  { id: "fight", label: "Vencer 1 stage do Spire", target: 1, gold: 50, letters: 2, sweep: 1 },
  { id: "hunt", label: "Completar 1 hunt", target: 1, gold: 50, letters: 1, sweep: 2 },
  { id: "pull", label: "Puxar 1 Letter na Font", target: 1, gold: 20, letters: 1, sweep: 0 },
  { id: "login", label: "Entrar no Spire hoje", target: 1, gold: 30, letters: 1, sweep: 1 },
] as const;

export const FACTION_LABEL: Record<Faction, string> = {
  embercourt: "Embercourt",
  tidebound: "Tidebound",
  thornveil: "Thornveil",
  ashen: "Ashen Choir",
  solstice: "Solstice",
  nadir: "Nadir",
};

export const UI = {
  hub: "/assets/environments/hub/rw_env_hub_spire.png",
  font: "/assets/environments/hub/rw_env_font.png",
  guild: "/assets/environments/guild/rw_env_guild_hall.png",
  logo: "/assets/marketing/rw_brand_logo.png",
  chest: "/assets/ui/icons/currency/rw_currency_wake_chest.png",
  gold: "/assets/ui/icons/currency/rw_currency_gold.png",
  letters: "/assets/ui/icons/currency/rw_currency_letters.png",
  fate: "/assets/ui/icons/currency/rw_currency_fate.png",
  nav: {
    hub: "/assets/ui/icons/hud/rw_hud_home.png",
    roster: "/assets/ui/icons/hud/rw_hud_hero.png",
    battle: "/assets/ui/icons/hud/rw_hud_spire.png",
    guild: "/assets/ui/icons/hud/rw_hud_guild.png",
    menu: "/assets/ui/icons/hud/rw_hud_settings.png",
  },
  directives: {
    foco: "/assets/ui/icons/directives/rw_directive_foco.png",
    guarda: "/assets/ui/icons/directives/rw_directive_guarda.png",
    execute: "/assets/ui/icons/directives/rw_directive_execute.png",
    mare: "/assets/ui/icons/directives/rw_directive_mare.png",
    pacto: "/assets/ui/icons/directives/rw_directive_pacto.png",
    cisma: "/assets/ui/icons/directives/rw_directive_cisma.png",
  } as Record<string, string>,
};


