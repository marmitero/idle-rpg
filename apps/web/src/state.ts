import { create } from "zustand";
import { DAILIES, HEROES, HUNTS, STAGES } from "@relicwake/content";
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
  stamina: number;
  lastStaminaAt: number;
  sweep: number;
  dailyDay: string;
  dailyProg: Record<string, number>;
  dailyClaimed: string[];
};

const KEY = "relicwake.slice.v2";
const STAMINA_CAP = 120;
const STAMINA_PER_H = 10;

const today = () => new Date().toISOString().slice(0, 10);

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
  stamina: 80,
  lastStaminaAt: Date.now(),
  sweep: 4,
  dailyDay: today(),
  dailyProg: { login: 1 },
  dailyClaimed: [],
});

function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const s = { ...defaultSave(), ...(JSON.parse(raw) as Save) };
    if (s.dailyDay !== today()) {
      s.dailyDay = today();
      s.dailyProg = { login: 1 };
      s.dailyClaimed = [];
    }
    return s;
  } catch {
    return defaultSave();
  }
}

function regenStamina(s: Save, now: number): { stamina: number; lastStaminaAt: number } {
  const gained = Math.floor(((now - s.lastStaminaAt) / 3_600_000) * STAMINA_PER_H);
  if (gained <= 0) return { stamina: s.stamina, lastStaminaAt: s.lastStaminaAt };
  return {
    stamina: Math.min(STAMINA_CAP, s.stamina + gained),
    lastStaminaAt: s.lastStaminaAt + gained * (3_600_000 / STAMINA_PER_H),
  };
}

type Store = Save & {
  tab: Tab;
  fighting: string | null;
  setTab: (t: Tab) => void;
  persist: () => void;
  tickStamina: () => void;
  collect: () => { gold: number; hours: number };
  bumpDaily: (id: string, n?: number) => void;
  claimDaily: (id: string) => boolean;
  setDirectives: (d: DirectiveId[]) => void;
  startFight: (stageId: string) => void;
  startHunt: (huntId: string, sweep?: boolean) => { ok: boolean; reason?: string };
  endFight: (win: boolean) => { gold: number; letters: number };
  pull: () => { rarity: string; heroId: string };
};

function wakeGold(save: Save, now: number): { gold: number; hours: number } {
  const stage = STAGES.find((s) => s.id === save.afkStage) ?? STAGES[0]!;
  const elapsedH = Math.min(save.capHours, (now - save.lastCollectAt) / 3_600_000);
  return { gold: Math.floor(elapsedH * stage.wakeRate * 12), hours: elapsedH };
}

const SAVE_KEYS: (keyof Save)[] = [
  "gold",
  "letters",
  "fate",
  "lastCollectAt",
  "capHours",
  "afkStage",
  "cleared",
  "team",
  "owned",
  "pity",
  "directives",
  "stamina",
  "lastStaminaAt",
  "sweep",
  "dailyDay",
  "dailyProg",
  "dailyClaimed",
];

export const useGame = create<Store>((set, get) => ({
  ...load(),
  tab: "hub",
  fighting: null,
  setTab: (tab) => set({ tab }),
  persist: () => {
    const s = get();
    const dump: Record<string, unknown> = {};
    for (const k of SAVE_KEYS) dump[k] = s[k];
    localStorage.setItem(KEY, JSON.stringify(dump));
  },
  tickStamina: () => {
    const r = regenStamina(get(), Date.now());
    if (r.stamina !== get().stamina) {
      set(r);
      get().persist();
    }
  },
  collect: () => {
    const now = Date.now();
    const { gold, hours } = wakeGold(get(), now);
    set({ gold: get().gold + gold, lastCollectAt: now });
    get().bumpDaily("wake");
    get().persist();
    return { gold, hours };
  },
  bumpDaily: (id, n = 1) => {
    const s = get();
    if (s.dailyDay !== today()) {
      set({ dailyDay: today(), dailyProg: { login: 1 }, dailyClaimed: [] });
    }
    const prog = { ...get().dailyProg, [id]: (get().dailyProg[id] ?? 0) + n };
    set({ dailyProg: prog });
    get().persist();
  },
  claimDaily: (id) => {
    const def = DAILIES.find((d) => d.id === id);
    if (!def) return false;
    if (get().dailyClaimed.includes(id)) return false;
    if ((get().dailyProg[id] ?? 0) < def.target) return false;
    set({
      gold: get().gold + def.gold,
      letters: get().letters + def.letters,
      sweep: get().sweep + def.sweep,
      dailyClaimed: [...get().dailyClaimed, id],
    });
    get().persist();
    return true;
  },
  setDirectives: (directives) => {
    set({ directives: directives.slice(0, 3) as DirectiveId[] });
    get().persist();
  },
  startFight: (stageId) => set({ fighting: stageId, tab: "battle" }),
  startHunt: (huntId, sweep = false) => {
    get().tickStamina();
    const hunt = HUNTS.find((h) => h.id === huntId);
    if (!hunt) return { ok: false, reason: "Hunt inexistente." };
    if (get().stamina < hunt.stamina) return { ok: false, reason: "Breath insuficiente." };
    if (sweep) {
      if (get().sweep < 1) return { ok: false, reason: "Sem Echo tickets." };
      set({
        stamina: get().stamina - hunt.stamina,
        sweep: get().sweep - 1,
        gold: get().gold + hunt.gold,
        letters: get().letters + hunt.letters,
      });
      get().bumpDaily("hunt");
      get().persist();
      return { ok: true };
    }
    set({ stamina: get().stamina - hunt.stamina, fighting: huntId, tab: "battle" });
    get().persist();
    return { ok: true };
  },
  endFight: (win) => {
    const id = get().fighting;
    set({ fighting: null });
    let gold = 0;
    let letters = 0;
    if (win && id) {
      const stage = STAGES.find((s) => s.id === id);
      const hunt = HUNTS.find((h) => h.id === id);
      if (stage) {
        gold = stage.gold;
        const cleared = get().cleared.includes(id) ? get().cleared : [...get().cleared, id];
        const idx = STAGES.findIndex((s) => s.id === id);
        const afkIdx = STAGES.findIndex((s) => s.id === get().afkStage);
        set({
          cleared,
          gold: get().gold + gold,
          afkStage: idx >= afkIdx ? (STAGES[idx]!.id) : get().afkStage,
        });
        get().bumpDaily("fight");
      }
      if (hunt) {
        gold = hunt.gold;
        letters = hunt.letters;
        set({ gold: get().gold + gold, letters: get().letters + letters });
        get().bumpDaily("hunt");
      }
      get().persist();
    }
    return { gold, letters };
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
    get().bumpDaily("pull");
    get().persist();
    return { rarity, heroId: hero.id };
  },
}));
