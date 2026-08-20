import { create } from "zustand";
import type { DirectiveId } from "@relicwake/shared";
import type { BattleInput, BattleResult } from "@relicwake/sim";
import { api, setToken } from "./api";

export type Tab = "hub" | "roster" | "battle" | "guild" | "menu";

export type Remote = {
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
  email: string | null;
};

export type FightPayload = {
  id: string;
  input: BattleInput;
  result: BattleResult;
  rewards: { gold: number; letters: number; win: boolean };
};

type Store = Remote & {
  tab: Tab;
  ready: boolean;
  error: string;
  fighting: FightPayload | null;
  setTab: (t: Tab) => void;
  hydrate: () => Promise<void>;
  apply: (state: Remote) => void;
  collect: () => Promise<{ gold: number; hours: number }>;
  claimDaily: (id: string) => Promise<boolean>;
  setDirectives: (d: DirectiveId[]) => Promise<void>;
  startFight: (id: string) => Promise<void>;
  startHunt: (id: string) => Promise<{ ok: boolean; reason?: string }>;
  sweepHunt: (id: string) => Promise<{ ok: boolean; reason?: string; gold?: number }>;
  clearFight: () => void;
  pull: () => Promise<{ rarity: string; heroId: string }>;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const empty: Remote = {
  gold: 0,
  letters: 0,
  fate: 0,
  lastCollectAt: Date.now(),
  capHours: 8,
  afkStage: "1-1",
  cleared: [],
  team: [],
  owned: [],
  pity: 0,
  directives: ["foco", "guarda", "execute"],
  stamina: 0,
  lastStaminaAt: Date.now(),
  sweep: 0,
  dailyDay: "",
  dailyProg: {},
  dailyClaimed: [],
  email: null,
};

export const useGame = create<Store>((set, get) => ({
  ...empty,
  tab: "hub",
  ready: false,
  error: "",
  fighting: null,
  setTab: (tab) => set({ tab }),
  apply: (state) => set({ ...state, ready: true, error: "" }),
  hydrate: async () => {
    try {
      const r = await api<{ state: Remote }>("/api/session", {});
      get().apply(r.state);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "api", ready: false });
    }
  },
  collect: async () => {
    const r = await api<{ gold: number; hours: number; state: Remote }>("/api/wake/collect", {});
    get().apply(r.state);
    return { gold: r.gold, hours: r.hours };
  },
  claimDaily: async (id) => {
    try {
      const r = await api<{ state: Remote }>("/api/daily/claim", { id });
      get().apply(r.state);
      return true;
    } catch {
      return false;
    }
  },
  setDirectives: async (directives) => {
    const r = await api<{ state: Remote }>("/api/directives", { directives });
    get().apply(r.state);
  },
  startFight: async (id) => {
    const r = await api<{
      seed: number;
      result: BattleResult;
      rewards: FightPayload["rewards"];
      state: Remote;
    }>("/api/battle", { id });
    get().apply(r.state);
    const { buildInput } = await import("./battleInput");
    set({
      fighting: {
        id,
        result: r.result,
        rewards: r.rewards,
        input: buildInput(id, get().team, get().directives, r.seed),
      },
      tab: "battle",
    });
  },
  startHunt: async (id) => {
    try {
      await get().startFight(id);
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: e instanceof Error ? e.message : "hunt" };
    }
  },
  sweepHunt: async (id) => {
    try {
      const r = await api<{ gold: number; letters: number; state: Remote }>("/api/hunt/sweep", { id });
      get().apply(r.state);
      return { ok: true, gold: r.gold };
    } catch (e) {
      return { ok: false, reason: e instanceof Error ? e.message : "sweep" };
    }
  },
  clearFight: () => set({ fighting: null }),
  pull: async () => {
    const r = await api<{ rarity: string; heroId: string; state: Remote }>("/api/gacha/pull", {});
    get().apply(r.state);
    return { rarity: r.rarity, heroId: r.heroId };
  },
  register: async (email, password) => {
    const r = await api<{ token: string; state: Remote }>("/api/auth/register", { email, password });
    setToken(r.token);
    get().apply(r.state);
  },
  login: async (email, password) => {
    const r = await api<{ token: string; state: Remote }>("/api/auth/login", { email, password });
    setToken(r.token);
    get().apply(r.state);
  },
  logout: () => {
    setToken(null);
    void get().hydrate();
  },
}));
