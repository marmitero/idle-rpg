import type { Faction, HeroClass, Rarity, Stats } from "@relicwake/shared";

export type HeroDef = {
  id: string;
  name: string;
  epithet: string;
  faction: Faction;
  klass: HeroClass;
  rarity: Rarity;
  stats: Stats;
  skills: { pas: string; cmd: string; ult: string };
  art: {
    bust: string;
    icon: string;
    idle: string;
    atk: string;
    hit: string;
    die: string;
    ult: string;
  };
};

const art = (slug: string) => ({
  bust: `/assets/characters/bust/rw_hero_${slug}_bust_512.png`,
  icon: `/assets/characters/icon/rw_hero_${slug}_icon_256.png`,
  idle: `/assets/characters/battle/rw_hero_${slug}_idle.png`,
  atk: `/assets/characters/battle/rw_hero_${slug}_atk.png`,
  hit: `/assets/characters/battle/rw_hero_${slug}_hit.png`,
  die: `/assets/characters/battle/rw_hero_${slug}_die.png`,
  ult: `/assets/characters/battle/rw_hero_${slug}_ult.png`,
});

export const HEROES: HeroDef[] = [
  {
    id: "hero.warrior",
    name: "Kael",
    epithet: "O Sino Inacabado",
    faction: "embercourt",
    klass: "striker",
    rarity: "elite",
    stats: { hp: 920, atk: 78, def: 42, spd: 62, crit: 12 },
    skills: { pas: "Coração de forja", cmd: "Golpe pesado", ult: "Sino rachado" },
    art: art("warrior"),
  },
  {
    id: "hero.guardian",
    name: "Ward",
    epithet: "A Visada Azul",
    faction: "embercourt",
    klass: "vanguard",
    rarity: "elite",
    stats: { hp: 1280, atk: 48, def: 88, spd: 44, crit: 6 },
    skills: { pas: "Baluarte", cmd: "Escudo-ariete", ult: "Muralha" },
    art: art("guardian"),
  },
  {
    id: "hero.mage",
    name: "Orren",
    epithet: "Memória Líquida",
    faction: "tidebound",
    klass: "channeler",
    rarity: "elite",
    stats: { hp: 740, atk: 92, def: 28, spd: 58, crit: 14 },
    skills: { pas: "Grimório", cmd: "Dardo arcano", ult: "Orbe da cisterna" },
    art: art("mage"),
  },
  {
    id: "hero.archer",
    name: "Mira",
    epithet: "Raiz que Aponta",
    faction: "thornveil",
    klass: "striker",
    rarity: "elite",
    stats: { hp: 780, atk: 84, def: 30, spd: 86, crit: 18 },
    skills: { pas: "Olho de gavião", cmd: "Flecha única", ult: "Chuva verde" },
    art: art("archer"),
  },
  {
    id: "hero.rogue",
    name: "Vell",
    epithet: "O Véu que Ri",
    faction: "ashen",
    klass: "striker",
    rarity: "elite",
    stats: { hp: 700, atk: 88, def: 26, spd: 94, crit: 22 },
    skills: { pas: "Fumaça", cmd: "Punhal", ult: "Dança cinza" },
    art: art("rogue"),
  },
  {
    id: "hero.cleric",
    name: "Ira",
    epithet: "Halo Rachado",
    faction: "solstice",
    klass: "seer",
    rarity: "relic",
    stats: { hp: 860, atk: 54, def: 40, spd: 52, crit: 8 },
    skills: { pas: "Bênção", cmd: "Sol menor", ult: "Aurora" },
    art: art("cleric"),
  },
];

export const HERO_BY_ID = Object.fromEntries(HEROES.map((h) => [h.id, h]));

export type EnemyDef = {
  id: string;
  name: string;
  faction: Faction;
  stats: Stats;
  art: { idle: string; atk: string; hit: string; die: string };
};

const boss = (slug: string, name: string, faction: Faction, stats: Stats): EnemyDef => ({
  id: `enemy.${slug}`,
  name,
  faction,
  stats,
  art: {
    idle: `/assets/enemies/rw_enemy_boss_${slug}_idle.png`,
    atk: `/assets/enemies/rw_enemy_boss_${slug}_atk.png`,
    hit: `/assets/enemies/rw_enemy_boss_${slug}_hit.png`,
    die: `/assets/enemies/rw_enemy_boss_${slug}_die.png`,
  },
});

export const ENEMIES: EnemyDef[] = [
  boss("goblin_king", "Rei Goblin", "ashen", { hp: 640, atk: 52, def: 28, spd: 50, crit: 8 }),
  boss("ash_wyrm", "Wyrm de Cinza", "embercourt", { hp: 1100, atk: 72, def: 40, spd: 40, crit: 10 }),
  boss("pale_hydra", "Hidra Pálida", "tidebound", { hp: 1500, atk: 68, def: 36, spd: 48, crit: 12 }),
];

export type { StageDef } from "./stages.ts";
export { BG, CHAPTERS, STAGES, isStageOpen } from "./stages.ts";
export * from "./systems.ts";
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
  name: string;
  bg: string;
  enemyId: string;
  stamina: number;
  gold: number;
  letters: number;
};

export const HUNTS: HuntDef[] = [
  {
    id: "hunt.goblin",
    name: "Toca Goblin",
    bg: BG.goblin,
    enemyId: "enemy.goblin_king",
    stamina: 8,
    gold: 70,
    letters: 1,
  },
  {
    id: "hunt.wyrm",
    name: "Covil do Wyrm",
    bg: BG.wyrm,
    enemyId: "enemy.ash_wyrm",
    stamina: 10,
    gold: 95,
    letters: 1,
  },
  {
    id: "hunt.hydra",
    name: "Cisterna da Hidra",
    bg: BG.hydra,
    enemyId: "enemy.pale_hydra",
    stamina: 12,
    gold: 120,
    letters: 2,
  },
  {
    id: HUNT_ROOT.id,
    name: HUNT_ROOT.name,
    bg: HUNT_ROOT.bg,
    enemyId: HUNT_ROOT.enemyId,
    stamina: HUNT_ROOT.stamina,
    gold: HUNT_ROOT.gold,
    letters: HUNT_ROOT.letters,
  },
];

export const HONOR_POOL: { id: string; heroId: string; name: string }[] = [
  ...HEROES.map((h) => ({ id: `honor.${h.id}`, heroId: h.id, name: h.name })),
  ...HEROES.map((h, i) => ({ id: `honor.echo.${i}`, heroId: h.id, name: `${h.name} · eco` })),
  ...HEROES.slice(0, 4).map((h, i) => ({ id: `honor.shade.${i}`, heroId: h.id, name: `${h.name} · sombra` })),
];

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
