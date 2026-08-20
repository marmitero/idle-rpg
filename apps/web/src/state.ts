import { create } from "zustand";
import { HEROES, STAGES } from "@relicwake/content";
import type { DirectiveId } from "@relicwake/shared";

export type Tab = "hub" | "roster" | "battle" | "guild" | "menu";

export type Save = {
  gold: number;
  letters: number;
  fate: number;
  lastCollectAt: number;
  capHours: number;
  afkStage: string;
  cleared: string[];
  team: string[];
  owned: string[];
  pity: number;
  directives: DirectiveId[];
};

const KEY = "relicwake.slice.v1";

const defaultSave = (): Save => ({
  gold: 120,
  letters: 12,
  fate: 0,
  lastCollectAt: Date.now(),
  capHours: 8,
  afkStage: "1-1",
  cleared: [],
  team: ["hero.warrior", "hero.guardian", "hero.mage", "hero.archer", "hero.rogue"],
  owned: HEROES.map((h) => h.id),
  pity: 0,
  directives: ["foco", "guarda", "execute"],
});

function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    return { ...defaultSave(), ...(JSON.parse(raw) as Save) };
  } catch {
    return defaultSave();
  }
}

type Store = Save & {
  tab: Tab;
  fighting: string | null;
  setTab: (t: Tab) => void;
  persist: () => void;
  collect: () => { gold: number; hours: number };
  addGold: (n: number) => void;
  setDirectives: (d: DirectiveId[]) => void;
  startFight: (stageId: string) => void;
  endFight: (win: boolean) => void;
  pull: () => { rarity: string; heroId: string };
};

function wakeGold(save: Save, now: number): { gold: number; hours: number } {
  const stage = STAGES.find((s) => s.id === save.afkStage) ?? STAGES[0]!;
  const elapsedH = Math.min(save.capHours, (now - save.lastCollectAt) / 3_600_000);
  return { gold: Math.floor(elapsedH * stage.wakeRate * 12), hours: elapsedH };
}

export const useGame = create<Store>((set, get) => ({
  ...load(),
  tab: "hub",
  fighting: null,
  setTab: (tab) => set({ tab }),
  persist: () => {
    const s = get();
    const { tab: _t, fighting: _f, persist: _p, collect: _c, addGold: _a, setDirectives: _d, startFight: _s, endFight: _e, pull: _u, setTab: _st, ...save } = s;
    localStorage.setItem(KEY, JSON.stringify(save));
  },
  collect: () => {
    const now = Date.now();
    const { gold, hours } = wakeGold(get(), now);
    set({ gold: get().gold + gold, lastCollectAt: now });
    get().persist();
    return { gold, hours };
  },
  addGold: (n) => {
    set({ gold: get().gold + n });
    get().persist();
  },
  setDirectives: (directives) => {
    set({ directives: directives.slice(0, 3) as DirectiveId[] });
    get().persist();
  },
  startFight: (stageId) => set({ fighting: stageId, tab: "battle" }),
  endFight: (win) => {
    const id = get().fighting;
    set({ fighting: null });
    if (win && id) {
      const stage = STAGES.find((s) => s.id === id);
      const cleared = get().cleared.includes(id) ? get().cleared : [...get().cleared, id];
      const idx = STAGES.findIndex((s) => s.id === id);
      const next = STAGES[idx + 1];
      set({
        cleared,
        gold: get().gold + (stage?.gold ?? 0),
        afkStage: next ? get().afkStage : id,
      });
      if (next && STAGES.findIndex((s) => s.id === get().afkStage) < idx + 1) {
        set({ afkStage: next.id });
      }
      get().persist();
    }
  },
  pull: () => {
    const letters = get().letters;
    if (letters < 1) return { rarity: "none", heroId: "" };
    let pity = get().pity + 1;
    const roll = Math.random();
    let rarity = "rare";
    if (pity >= 70 || roll < 0.012) rarity = "relic";
    else if (roll < 0.1) rarity = "elite";
    if (rarity === "relic") pity = 0;
    const pool = HEROES.filter((h) => (rarity === "relic" ? h.rarity === "relic" : true));
    const hero = pool[Math.floor(Math.random() * pool.length)] ?? HEROES[0]!;
    set({ letters: letters - 1, pity });
    get().persist();
    return { rarity, heroId: hero.id };
  },
}));
