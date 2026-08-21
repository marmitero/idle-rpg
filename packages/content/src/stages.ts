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

export const CHAPTERS = [
  { chapter: 1, name: "A Base que respira", blurb: "O primeiro degrau ainda tem pulso." },
  { chapter: 2, name: "O primeiro Waker que mente", blurb: "Alguém subiu antes e fechou a porta." },
] as const;

const GOB = "enemy.goblin_king";
const WYR = "enemy.ash_wyrm";
const HYD = "enemy.pale_hydra";

type Spec = {
  name: string;
  bg: string;
  fodder: string;
  n: number;
  boss?: { enemyId: string; scale: number };
};

const CH1: Spec[] = [
  { name: "A Base que respira", bg: BG.spire, fodder: GOB, n: 2 },
  { name: "Lanternas de Wake", bg: BG.spire, fodder: GOB, n: 3 },
  { name: "Degrau úmido", bg: BG.spire, fodder: GOB, n: 3 },
  { name: "O arquivo de Moth", bg: BG.spire, fodder: GOB, n: 4 },
  { name: "Cinzas no corrimão", bg: BG.spire, fodder: GOB, n: 4 },
  { name: "Quem fechou as janelas", bg: BG.spire, fodder: GOB, n: 4 },
  { name: "Três relíquias sem nome", bg: BG.spire, fodder: GOB, n: 5 },
  { name: "O Sino Inacabado ecoa", bg: BG.ember, fodder: GOB, n: 5 },
  { name: "Corredor das pálpebras", bg: BG.spire, fodder: GOB, n: 5 },
  { name: "Trono de osso", bg: BG.goblin, fodder: GOB, n: 4, boss: { enemyId: GOB, scale: 1.18 } },
  { name: "Depois do rei menor", bg: BG.spire, fodder: GOB, n: 4 },
  { name: "Poço que tosse", bg: BG.spire, fodder: GOB, n: 5 },
  { name: "Cartas no chão", bg: BG.spire, fodder: GOB, n: 5 },
  { name: "A escada que mente", bg: BG.spire, fodder: GOB, n: 5 },
  { name: "Vigia adormecido", bg: BG.ember, fodder: GOB, n: 5 },
  { name: "Bronze rachado", bg: BG.ember, fodder: WYR, n: 4 },
  { name: "Um Waker passou aqui", bg: BG.spire, fodder: GOB, n: 5 },
  { name: "A porta sem maçaneta", bg: BG.spire, fodder: GOB, n: 5 },
  { name: "Fôlego emprestado", bg: BG.spire, fodder: GOB, n: 5 },
  { name: "O primeiro contrato", bg: BG.goblin, fodder: GOB, n: 4, boss: { enemyId: GOB, scale: 1.38 } },
];

const CH2: Spec[] = [
  { name: "Emberworks abre", bg: BG.ember, fodder: WYR, n: 4 },
  { name: "O contrato da forja", bg: BG.ember, fodder: GOB, n: 5 },
  { name: "Canais de magma", bg: BG.ember, fodder: WYR, n: 4 },
  { name: "Brasão quente", bg: BG.ember, fodder: GOB, n: 5 },
  { name: "Quem vendeu o degrau", bg: BG.ember, fodder: GOB, n: 5 },
  { name: "Fole e mentira", bg: BG.ember, fodder: WYR, n: 4 },
  { name: "A Visada Azul", bg: BG.ember, fodder: GOB, n: 5 },
  { name: "Bigorna que lembra", bg: BG.ember, fodder: GOB, n: 5 },
  { name: "Cinza na boca", bg: BG.ash, fodder: WYR, n: 4 },
  { name: "Wyrm na forja", bg: BG.wyrm, fodder: WYR, n: 3, boss: { enemyId: WYR, scale: 1.12 } },
  { name: "Escória ainda viva", bg: BG.ember, fodder: GOB, n: 5 },
  { name: "Nomes gravados errado", bg: BG.ember, fodder: GOB, n: 5 },
  { name: "Sable Index deixa um recado", bg: BG.ash, fodder: WYR, n: 4 },
  { name: "O Sono com sotaque", bg: BG.ember, fodder: GOB, n: 5 },
  { name: "Ponte de ferro dormindo", bg: BG.ember, fodder: GOB, n: 5 },
  { name: "Oficiais de bronze", bg: BG.ember, fodder: WYR, n: 4 },
  { name: "A mentira tem degrau", bg: BG.tide, fodder: HYD, n: 4 },
  { name: "Forja sem fogo", bg: BG.ash, fodder: WYR, n: 4 },
  { name: "Um brasão que recusa", bg: BG.ember, fodder: GOB, n: 5 },
  { name: "A porta que ele fechou", bg: BG.wyrm, fodder: WYR, n: 3, boss: { enemyId: WYR, scale: 1.32 } },
];

function pack(chapter: number, specs: Spec[]): StageDef[] {
  return specs.map((s, i) => {
    const index = i + 1;
    const global = (chapter - 1) * 20 + index;
    const scale = 0.58 + global * 0.011;
    const gold = s.boss ? 140 + chapter * 40 + index * 4 : 36 + global * 6;
    const wakeRate = 8 + Math.floor(global * 0.4);
    const enemies = Array.from({ length: Math.min(5, s.n) }, (_, slot) => ({
      enemyId: s.fodder,
      slot,
      scale: Math.max(0.45, scale - slot * 0.03),
    }));
    if (s.boss) enemies[0] = { enemyId: s.boss.enemyId, slot: 0, scale: s.boss.scale };
    return {
      id: `${chapter}-${index}`,
      chapter,
      index,
      name: s.name,
      bg: s.bg,
      enemies,
      gold,
      wakeRate,
    };
  });
}

export const STAGES: StageDef[] = [...pack(1, CH1), ...pack(2, CH2)];

export function isStageOpen(cleared: string[], id: string): boolean {
  const i = STAGES.findIndex((s) => s.id === id);
  if (i <= 0) return i === 0;
  return cleared.includes(STAGES[i - 1]!.id);
}
