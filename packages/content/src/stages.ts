export type StageDef = {
  id: string;
  chapter: number;
  index: number;
  name: string;
  bg: string;
  enemies: { enemyId: string; slot: number; scale: number }[];
  gold: number;
  wakeRate: number;
  boss?: boolean;
};

/** Distribuição centralizada de inimigos na grade 3x3 (slot 0-8). */
const ENEMY_SLOTS: Record<number, number[]> = {
  1: [1], // boss solo: centro da frente
  2: [0, 2],
  3: [0, 1, 2],
  4: [0, 1, 2, 4],
  5: [0, 1, 2, 3, 4],
};

export const BG = {
  spire: "/assets/environments/biomes/rw_env_battle_spire_base.png",
  ember: "/assets/environments/biomes/rw_env_battle_emberworks.png",
  tide: "/assets/environments/biomes/rw_env_battle_tidevault.png",
  thorn: "/assets/environments/biomes/rw_env_battle_thorn.png",
  ash: "/assets/environments/biomes/rw_env_battle_ash.png",
  crown: "/assets/environments/biomes/rw_env_battle_crown.png",
  goblin: "/assets/environments/hunts/rw_env_hunt_goblin.png",
  wyrm: "/assets/environments/hunts/rw_env_hunt_wyrm.png",
  hydra: "/assets/environments/hunts/rw_env_hunt_hydra.png",
};

export const CHAPTERS: { chapter: number; name: string; blurb: string; bg: string; fodder: string; bossId: string }[] = [
  { chapter: 1, name: "A Base que respira", blurb: "O primeiro degrau ainda tem pulso.", bg: BG.spire, fodder: "enemy.fodder.ash", bossId: "enemy.boss.goblin_king" },
  { chapter: 2, name: "O primeiro Waker que mente", blurb: "Alguém subiu antes e fechou a porta.", bg: BG.ember, fodder: "enemy.fodder.ember", bossId: "enemy.boss.ash_wyrm" },
  { chapter: 3, name: "Emberworks — o contrato da forja", blurb: "Trabalho demais também é Sono.", bg: BG.ember, fodder: "enemy.fodder.ember", bossId: "enemy.boss.ch3" },
  { chapter: 4, name: "Um brasão que não quer ser acordado", blurb: "Lealdade contra o relógio.", bg: BG.ember, fodder: "enemy.elite.ember", bossId: "enemy.boss.ch4" },
  { chapter: 5, name: "Tidevault — nomes na água", blurb: "Cada ciclo, outro você.", bg: BG.tide, fodder: "enemy.fodder.tide", bossId: "enemy.boss.pale_hydra" },
  { chapter: 6, name: "A cisterna sem fundo", blurb: "Memória demais afoga.", bg: BG.hydra, fodder: "enemy.elite.tide", bossId: "enemy.boss.ch6" },
  { chapter: 7, name: "Thorn Causeway — a cidade comida", blurb: "O mato não odeia. Ele digere.", bg: BG.thorn, fodder: "enemy.fodder.thorn", bossId: "enemy.boss.ch7" },
  { chapter: 8, name: "Raiz que pede um pacto", blurb: "Paciência com dente.", bg: BG.thorn, fodder: "enemy.elite.thorn", bossId: "enemy.boss.ch8" },
  { chapter: 9, name: "Ash Cloister — o ensaio do coro", blurb: "Acordaram errado e aprenderam a cantar.", bg: BG.ash, fodder: "enemy.fodder.ash", bossId: "enemy.boss.ch9" },
  { chapter: 10, name: "Uma Relíquia que recusa o roster", blurb: "Nem todo nome quer voltar.", bg: BG.ash, fodder: "enemy.elite.ash", bossId: "enemy.boss.ch10" },
  { chapter: 11, name: "A pálpebra", blurb: "O topo não é céu.", bg: BG.crown, fodder: "enemy.elite.ember", bossId: "enemy.boss.ch11" },
  { chapter: 12, name: "Acordar é um ofício, não um milagre", blurb: "Negociar com o Sono.", bg: BG.crown, fodder: "enemy.elite.tide", bossId: "enemy.boss.ch12" },
];

export const ACT_CUTSCENES = CHAPTERS.map((c) => ({
  chapter: c.chapter,
  enter: {
    "pt-BR": `${c.name}. Moth anota: o Spire ainda respira neste degrau.`,
    en: `${c.name}. Moth files: the Spire still breathes on this step.`,
  },
  boss: {
    "pt-BR": `O Sono pesou no fim do ato ${c.chapter}. Diretiva, não milagre.`,
    en: `Sleep weighed at the end of act ${c.chapter}. A directive, not a miracle.`,
  },
}));

const LABELS = ["degrau", "corredor", "poço", "janela", "arquivo", "ponte", "vigia", "porta", "fôlego", "contrato"];

function chapterStages(meta: (typeof CHAPTERS)[number]): StageDef[] {
  return Array.from({ length: 20 }, (_, i) => {
    const index = i + 1;
    const global = (meta.chapter - 1) * 20 + index;
    const isBoss = index === 10 || index === 20;
    const scale = 0.55 + global * 0.0048;
    const n = isBoss ? 4 : 2 + (index % 4);
    const slots = ENEMY_SLOTS[Math.min(5, n)] ?? [0, 1, 2];
    const enemies = slots.map((slot, i) => ({
      enemyId: isBoss && i === 0 ? meta.bossId : meta.fodder,
      slot,
      scale: isBoss && i === 0 ? 1.05 + meta.chapter * 0.04 : Math.max(0.4, scale - i * 0.03),
    }));
    return {
      id: `${meta.chapter}-${index}`,
      chapter: meta.chapter,
      index,
      name: isBoss ? `Boss · ${meta.name}` : `${LABELS[(index - 1) % LABELS.length]} ${index}`,
      bg: isBoss ? (index === 20 ? meta.bg : meta.bg) : meta.bg,
      enemies,
      gold: isBoss ? 120 + meta.chapter * 18 : 28 + global * 2,
      wakeRate: 8 + Math.floor(global * 0.12),
      boss: isBoss,
    };
  });
}

export const STAGES: StageDef[] = CHAPTERS.flatMap(chapterStages);

export function isStageOpen(cleared: string[], id: string): boolean {
  const i = STAGES.findIndex((s) => s.id === id);
  if (i <= 0) return i === 0;
  return cleared.includes(STAGES[i - 1]!.id);
}
