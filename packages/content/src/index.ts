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

export type StageDef = {
  id: string;
  chapter: number;
  index: number;
  name: string;
  bg: string;
  enemies: { enemyId: string; slot: number; scale: number }[];
  gold: number;
  wakeRate: number;
};

const gob = (slot: number, scale: number) => ({
  enemyId: "enemy.goblin_king",
  slot,
  scale,
});

export const STAGES: StageDef[] = [
  {
    id: "1-1",
    chapter: 1,
    index: 1,
    name: "A Base que respira",
    bg: "/assets/environments/biomes/rw_env_battle_spire_base.png",
    enemies: [gob(0, 0.72), gob(2, 0.7), gob(3, 0.68)],
    gold: 40,
    wakeRate: 8,
  },
  {
    id: "1-2",
    chapter: 1,
    index: 2,
    name: "Lanternas de Wake",
    bg: "/assets/environments/biomes/rw_env_battle_spire_base.png",
    enemies: [gob(0, 0.78), gob(1, 0.76), gob(2, 0.74), gob(3, 0.72)],
    gold: 55,
    wakeRate: 10,
  },
  {
    id: "1-3",
    chapter: 1,
    index: 3,
    name: "O primeiro Waker que mente",
    bg: "/assets/environments/biomes/rw_env_battle_spire_base.png",
    enemies: [gob(0, 0.85), gob(1, 0.82), gob(2, 0.8), gob(3, 0.8), gob(4, 0.78)],
    gold: 70,
    wakeRate: 12,
  },
  {
    id: "1-10",
    chapter: 1,
    index: 10,
    name: "Trono de osso",
    bg: "/assets/environments/hunts/rw_env_hunt_goblin.png",
    enemies: [
      gob(2, 0.7),
      gob(3, 0.7),
      gob(4, 0.7),
      { enemyId: "enemy.goblin_king", slot: 0, scale: 1.15 },
    ],
    gold: 180,
    wakeRate: 18,
  },
  {
    id: "2-1",
    chapter: 2,
    index: 1,
    name: "Emberworks",
    bg: "/assets/environments/biomes/rw_env_battle_emberworks.png",
    enemies: [
      gob(0, 0.9),
      gob(2, 0.85),
      { enemyId: "enemy.ash_wyrm", slot: 1, scale: 0.95 },
    ],
    gold: 90,
    wakeRate: 16,
  },
];

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
