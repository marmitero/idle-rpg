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
  placeholder?: boolean;
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

const KIT = {
  warrior: art("warrior"),
  guardian: art("guardian"),
  mage: art("mage"),
  archer: art("archer"),
  rogue: art("rogue"),
  cleric: art("cleric"),
};

const kitOf = (k: HeroClass, faction: Faction) => {
  if (k === "vanguard" || k === "warden") return KIT.guardian;
  if (k === "channeler") return KIT.mage;
  if (k === "seer") return KIT.cleric;
  if (faction === "embercourt") return KIT.warrior;
  if (faction === "thornveil") return KIT.archer;
  if (faction === "ashen") return KIT.rogue;
  return KIT.archer;
};

/** Unique bust/icon; battle clips still borrowed until later lots. */
function ownBust(slug: string, kit: HeroDef["art"]): HeroDef["art"] {
  return {
    ...kit,
    bust: `/assets/characters/bust/rw_hero_${slug}_bust_512.png`,
    icon: `/assets/characters/icon/rw_hero_${slug}_icon_256.png`,
  };
}

/** Bust/icon + own idle; atk/hit/die/ult still borrowed from class kit. */
function ownIdle(slug: string, kit: HeroDef["art"]): HeroDef["art"] {
  return {
    ...ownBust(slug, kit),
    idle: `/assets/characters/battle/rw_hero_${slug}_idle.png`,
  };
}

/** Bust/icon + own idle + own atk; hit/die/ult still borrowed from class kit. */
function ownAtk(slug: string, kit: HeroDef["art"]): HeroDef["art"] {
  return {
    ...ownIdle(slug, kit),
    atk: `/assets/characters/battle/rw_hero_${slug}_atk.png`,
  };
}

function h(
  id: string,
  name: string,
  epithet: string,
  faction: Faction,
  klass: HeroClass,
  rarity: Rarity,
  stats: Stats,
  skills: HeroDef["skills"],
  kit?: HeroDef["art"],
  placeholder = false,
): HeroDef {
  return {
    id,
    name,
    epithet,
    faction,
    klass,
    rarity,
    stats,
    skills,
    art: kit ?? kitOf(klass, faction),
    placeholder,
  };
}

/** 6 slice completo + 22 bustos (lotes 12–15) + 22 idles (lotes 14–16); 5 atks próprios (lote-16); hit/die/ult ainda kit. */
export const HEROES: HeroDef[] = [
  h("hero.warrior", "Kael", "O Sino Inacabado", "embercourt", "striker", "elite", { hp: 920, atk: 78, def: 42, spd: 62, crit: 12 }, { pas: "Coração de forja", cmd: "Golpe pesado", ult: "Sino rachado" }, KIT.warrior),
  h("hero.guardian", "Ward", "A Visada Azul", "embercourt", "vanguard", "elite", { hp: 1280, atk: 48, def: 88, spd: 44, crit: 6 }, { pas: "Baluarte", cmd: "Escudo-ariete", ult: "Muralha" }, KIT.guardian),
  h("hero.ember.bril", "Bril", "A Bigorna que Ri", "embercourt", "warden", "rare", { hp: 1100, atk: 55, def: 70, spd: 48, crit: 8 }, { pas: "Calor residual", cmd: "Rebite", ult: "Contrato quente" }, ownIdle("ember_bril", KIT.guardian), true),
  h("hero.ember.sora", "Sora", "Fagulha de Arquivo", "embercourt", "channeler", "rare", { hp: 760, atk: 90, def: 30, spd: 60, crit: 14 }, { pas: "Cinza útil", cmd: "Estilhaço", ult: "Forja aberta" }, ownIdle("ember_sora", KIT.mage), true),
  h("hero.ember.durn", "Durn", "O Que Não Para", "embercourt", "vanguard", "elite", { hp: 1400, atk: 42, def: 95, spd: 38, crit: 5 }, { pas: "Turno extra", cmd: "Empurra", ult: "Muralha segunda" }, ownIdle("ember_durn", KIT.guardian), true),
  h("hero.ember.hest", "Hest", "Juramento Tarde", "embercourt", "seer", "rare", { hp: 880, atk: 58, def: 48, spd: 52, crit: 9 }, { pas: "Lealdade", cmd: "Brasão", ult: "Corte de honra" }, ownIdle("ember_hest", KIT.cleric), true),

  h("hero.mage", "Orren", "Memória Líquida", "tidebound", "channeler", "elite", { hp: 740, atk: 92, def: 28, spd: 58, crit: 14 }, { pas: "Grimório", cmd: "Dardo arcano", ult: "Orbe da cisterna" }, KIT.mage),
  h("hero.tide.nera", "Nera", "Nome desta maré", "tidebound", "warden", "elite", { hp: 1180, atk: 50, def: 72, spd: 50, crit: 8 }, { pas: "Esquece o golpe", cmd: "Refluxo", ult: "Cisterna fecha" }, ownIdle("tide_nera", KIT.guardian), true),
  h("hero.tide.luth", "Luth", "Sal que Corta", "tidebound", "striker", "rare", { hp: 800, atk: 86, def: 32, spd: 80, crit: 16 }, { pas: "Adaptação", cmd: "Corte úmido", ult: "Maré curta" }, ownIdle("tide_luth", KIT.archer), true),
  h("hero.tide.cale", "Cale", "O Arquivo Molhado", "tidebound", "channeler", "rare", { hp: 720, atk: 96, def: 26, spd: 56, crit: 15 }, { pas: "Página nova", cmd: "Gotas", ult: "Nome errado" }, ownIdle("tide_cale", KIT.mage), true),
  h("hero.tide.ivo", "Ivo", "Âncora Cortês", "tidebound", "vanguard", "elite", { hp: 1320, atk: 46, def: 84, spd: 42, crit: 6 }, { pas: "Peso", cmd: "Amarra", ult: "Porto" }, ownIdle("tide_ivo", KIT.guardian), true),
  h("hero.tide.sem", "Sem", "Quem era ontem", "tidebound", "seer", "rare", { hp: 840, atk: 60, def: 40, spd: 54, crit: 10 }, { pas: "Ciclo", cmd: "Lembrete", ult: "Apaga o medo" }, ownAtk("tide_sem", KIT.cleric), true),

  h("hero.archer", "Mira", "Raiz que Aponta", "thornveil", "striker", "elite", { hp: 780, atk: 84, def: 30, spd: 86, crit: 18 }, { pas: "Olho de gavião", cmd: "Flecha única", ult: "Chuva verde" }, KIT.archer),
  h("hero.thorn.bramble", "Bramble", "Avenida Digestiva", "thornveil", "vanguard", "elite", { hp: 1240, atk: 50, def: 80, spd: 46, crit: 7 }, { pas: "Cerca viva", cmd: "Espinho", ult: "Cidade comida" }, ownAtk("thorn_bramble", KIT.guardian), true),
  h("hero.thorn.tess", "Tess", "Paciência com dente", "thornveil", "warden", "rare", { hp: 1080, atk: 52, def: 68, spd: 50, crit: 9 }, { pas: "Cresce depois", cmd: "Seda", ult: "Asfixia doce" }, ownAtk("thorn_tess", KIT.guardian), true),
  h("hero.thorn.quin", "Quin", "Pólen de arquivo", "thornveil", "channeler", "rare", { hp: 730, atk: 88, def: 28, spd: 64, crit: 15 }, { pas: "Broto", cmd: "Semente", ult: "Bosque instantâneo" }, ownAtk("thorn_quin", KIT.mage), true),
  h("hero.thorn.ashleaf", "Ashleaf", "Folha que queima devagar", "thornveil", "striker", "elite", { hp: 760, atk: 90, def: 28, spd: 82, crit: 20 }, { pas: "Verde-cinza", cmd: "Corte de seiva", ult: "Tempestade baixa" }, ownAtk("thorn_ashleaf", KIT.archer), true),
  h("hero.thorn.yew", "Yew", "O pacto pedido", "thornveil", "seer", "rare", { hp: 900, atk: 56, def: 44, spd: 50, crit: 8 }, { pas: "Raiz ouve", cmd: "Cura verde", ult: "Pacto" }, ownIdle("thorn_yew", KIT.cleric), true),

  h("hero.rogue", "Vell", "O Véu que Ri", "ashen", "striker", "elite", { hp: 700, atk: 88, def: 26, spd: 94, crit: 22 }, { pas: "Fumaça", cmd: "Punhal", ult: "Dança cinza" }, KIT.rogue),
  h("hero.ashen.choir", "Choir", "Ensaio do que ficou", "ashen", "channeler", "elite", { hp: 750, atk: 86, def: 30, spd: 58, crit: 13 }, { pas: "Harmonia rachada", cmd: "Nota", ult: "Requiem curto" }, ownIdle("ashen_choir", KIT.mage), true),
  h("hero.ashen.dust", "Dust", "Quem acordou errado", "ashen", "vanguard", "rare", { hp: 1200, atk: 48, def: 78, spd: 44, crit: 8 }, { pas: "Não desmancha", cmd: "Cinza dura", ult: "Coro em pé" }, ownIdle("ashen_dust", KIT.guardian), true),
  h("hero.ashen.hymn", "Hymn", "Memória que não perdoa", "ashen", "seer", "rare", { hp: 860, atk: 54, def: 42, spd: 52, crit: 9 }, { pas: "Lembra o golpe", cmd: "Canto", ult: "Nome dos mortos" }, ownIdle("ashen_hymn", KIT.cleric), true),
  h("hero.ashen.cinder", "Cinder", "Brasa no arquivo", "ashen", "warden", "elite", { hp: 1120, atk: 52, def: 74, spd: 48, crit: 8 }, { pas: "Restos", cmd: "Protege o ensaio", ult: "Fumaça densa" }, ownIdle("ashen_cinder", KIT.guardian), true),
  h("hero.ashen.veil", "Veil", "Sombra educada", "ashen", "striker", "rare", { hp: 720, atk: 92, def: 24, spd: 90, crit: 24 }, { pas: "Sumiu", cmd: "Corte de véu", ult: "Risada" }, ownIdle("ashen_veil", KIT.rogue), true),

  h("hero.cleric", "Ira", "Halo Rachado", "solstice", "seer", "relic", { hp: 860, atk: 54, def: 40, spd: 52, crit: 8 }, { pas: "Bênção", cmd: "Sol menor", ult: "Aurora" }, KIT.cleric),
  h("hero.solstice.helion", "Helion", "Quem recusou o Sono", "solstice", "striker", "relic", { hp: 820, atk: 96, def: 34, spd: 70, crit: 16 }, { pas: "Ofensa luminosa", cmd: "Raio curto", ult: "Meio-dia" }, ownIdle("solstice_helion", KIT.warrior), true),

  h("hero.nadir.umbral", "Umbral", "Olhou a rachadura", "nadir", "channeler", "relic", { hp: 780, atk: 98, def: 30, spd: 62, crit: 14 }, { pas: "Vão", cmd: "Escuro útil", ult: "Dentro do sol" }, ownIdle("nadir_umbral", KIT.mage), true),
  h("hero.nadir.rift", "Rift", "Necessário e mal-amado", "nadir", "warden", "relic", { hp: 1260, atk: 50, def: 86, spd: 40, crit: 7 }, { pas: "Fenda", cmd: "Segura o vazio", ult: "Pálpebra inversa" }, ownIdle("nadir_rift", KIT.guardian), true),
];

export const HERO_BY_ID = Object.fromEntries(HEROES.map((x) => [x.id, x]));
export const SLICE_OWNED = ["hero.warrior", "hero.guardian", "hero.mage", "hero.archer", "hero.rogue", "hero.cleric"];
