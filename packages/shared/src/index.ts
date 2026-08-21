export type Faction =
  | "embercourt"
  | "tidebound"
  | "thornveil"
  | "ashen"
  | "solstice"
  | "nadir";

export type HeroClass = "vanguard" | "striker" | "channeler" | "warden" | "seer";

export type Rarity = "rare" | "elite" | "relic";

export type DirectiveId =
  | "foco"
  | "guarda"
  | "execute"
  | "mare"
  | "pacto"
  | "cisma";

export type Team = "ally" | "enemy";

export type Stats = {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
};

export const FACTION_BEATS: Record<Faction, Faction | null> = {
  embercourt: "thornveil",
  thornveil: "tidebound",
  tidebound: "ashen",
  ashen: "embercourt",
  solstice: "nadir",
  nadir: "solstice",
};

export function factionMod(atk: Faction, def: Faction): number {
  if (atk === def) return 1;
  if (FACTION_BEATS[atk] === def) return 1.2;
  if (FACTION_BEATS[def] === atk) return 0.85;
  return 1;
}

export const DIRECTIVES: DirectiveId[] = [
  "foco",
  "guarda",
  "execute",
  "mare",
  "pacto",
  "cisma",
];
