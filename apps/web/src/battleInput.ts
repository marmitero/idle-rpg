import { ENEMIES, HERO_BY_ID, HEROES, HUNTS, STAGES } from "@relicwake/content";
import type { DirectiveId } from "@relicwake/shared";
import type { BattleInput, LoadoutUnit } from "@relicwake/sim";

function scaled(stats: LoadoutUnit["stats"], s: number): LoadoutUnit["stats"] {
  return {
    hp: Math.round(stats.hp * s),
    atk: Math.round(stats.atk * s),
    def: Math.round(stats.def * s),
    spd: stats.spd,
    crit: stats.crit,
  };
}

export function buildInput(id: string, team: string[], directives: DirectiveId[], seed: number): BattleInput {
  const allies: LoadoutUnit[] = team.slice(0, 5).map((hid, slot) => {
    const h = HERO_BY_ID[hid] ?? HEROES[0]!;
    return { id: `a${slot}`, heroId: h.id, name: h.name, faction: h.faction, stats: h.stats, slot };
  });
  const stage = STAGES.find((s) => s.id === id);
  const hunt = HUNTS.find((h) => h.id === id);
  let enemies: LoadoutUnit[] = [];
  if (stage) {
    enemies = stage.enemies.map((e, i) => {
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
  } else if (hunt) {
    const def = ENEMIES.find((x) => x.id === hunt.enemyId) ?? ENEMIES[0]!;
    enemies = [0, 2, 3].map((slot, i) => ({
      id: `e${i}`,
      heroId: def.id,
      name: def.name,
      faction: def.faction,
      stats: scaled(def.stats, i === 0 ? 1 : 0.72),
      slot,
    }));
  }
  return { seed, allies, enemies, directives };
}
