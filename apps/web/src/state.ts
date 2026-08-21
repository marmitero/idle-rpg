import { create } from "zustand";
import type { DirectiveId } from "@relicwake/shared";
import type { BattleInput, BattleRecord, BattleResult } from "@relicwake/sim";
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
  wakerName: string | null;
  starterId: string | null;
  tutorialStep: number;
  tutorialPull: boolean;
};

export type FightPayload = {
  id: string;
  battleId: string;
  hash: string;
  input: BattleInput;
  result: BattleResult;
  rewards: { gold: number; letters: number; win: boolean };
  mode: "live" | "replay";
};

export type BattleSummary = {
  id: string;
  contentId: string;
  winner: "ally" | "enemy";
  durationMs: number;
  hash: string;
  createdAt: number;
};

type Store = Remote & {
  tab: Tab;
  ready: boolean;
  error: string;
  fighting: FightPayload | null;
  replays: BattleSummary[];
  setTab: (t: Tab) => void;
  hydrate: () => Promise<void>;
  apply: (state: Remote) => void;
  loadReplays: () => Promise<void>;
  openReplay: (battleId: string) => Promise<void>;
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
  tutorial: (body: { step?: number; name?: string; starterId?: string; pull?: boolean; reset?: boolean }) => Promise<void>;
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
  wakerName: null,
  starterId: null,
  tutorialStep: 0,
  tutorialPull: false,
};

export const useGame = create<Store>((set, get) => ({
  ...empty,
  tab: "hub",
  ready: false,
  error: "",
  fighting: null,
  replays: [],
  setTab: (tab) => set({ tab }),
  apply: (state) => set({ ...state, ready: true, error: "" }),
  hydrate: async () => {
    try {
      const r = await api<{ state: Remote }>("/api/session", {});
      get().apply(r.state);
      await get().loadReplays();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "api", ready: false });
    }
  },
  loadReplays: async () => {
    try {
      const r = await api<{ battles: BattleSummary[] }>("/api/battles");
      set({ replays: r.battles });
    } catch {
      /* session may not be ready */
    }
  },
  openReplay: async (battleId) => {
    const r = await api<{ record: BattleRecord }>(`/api/battle/${battleId}`);
    const rec = r.record;
    set({
      fighting: {
        id: rec.contentId,
        battleId: rec.id,
        hash: rec.hash,
        input: rec.input,
        result: rec.result,
        rewards: { gold: 0, letters: 0, win: rec.winner === "ally" },
        mode: "replay",
      },
      tab: "battle",
    });
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
      battleId: string;
      seed: number;
      input: BattleInput;
      result: BattleResult;
      hash: string;
      rewards: FightPayload["rewards"];
      state: Remote;
    }>("/api/battle", { id }, { "idempotency-key": crypto.randomUUID() });
    get().apply(r.state);
    set({
      fighting: {
        id,
        battleId: r.battleId,
        hash: r.hash,
        result: r.result,
        rewards: r.rewards,
        input: r.input,
        mode: "live",
      },
      tab: "battle",
    });
    void get().loadReplays();
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
  tutorial: async (body) => {
    const r = await api<{ state: Remote }>("/api/tutorial", body);
    get().apply(r.state);
  },
}));
