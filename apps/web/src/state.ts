import { create } from "zustand";
import type { DirectiveId } from "@relicwake/shared";
import type { Locale } from "@relicwake/content";
import type { BattleInput, BattleRecord, BattleResult } from "@relicwake/sim";
import { api, setToken } from "./api";
import { getLocale, setLocale as saveLocale } from "./i18n";

export type Tab = "hub" | "roster" | "battle" | "guild" | "menu";
export type HubPanel = "home" | "tower" | "arena" | "honor" | "live";

export type Remote = {
  gold: number;
  letters: number;
  fate: number;
  lastCollectAt: number;
  capHours: number;
  afkStage: string;
  cleared: string[];
  team: string[];
  /** Formação 3x3: 9 slots (0-2 frente, 3-5 meio, 6-8 topo; col = slot % 3). */
  formation: (string | null)[];
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
  dust: number;
  crests: number;
  ember: number;
  heroProg: Record<string, { level: number; stars: number; imprint: number; pas: number; cmd: number; ult: number }>;
  gear: { id: string; slot: string; set: string; plus: number }[];
  equipped: Record<string, string>;
  towerFloor: number;
  factionTower: Record<string, number>;
  arenaRating: number;
  arenaAttacks: number;
  guildId: string | null;
  guildRole: string | null;
  warAttacks: number;
  mail: { id: string; title: string; body: string; gold: number; letters: number; dust: number; claimed: boolean; at: number }[];
  passXp: number;
  passPremium: boolean;
  passClaimed: string[];
  eventDay: number;
  eventClaimed: number[];
  honorDraft: string[];
  banned: boolean;
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
  hubPanel: HubPanel;
  locale: Locale;
  setTab: (t: Tab) => void;
  setHubPanel: (p: HubPanel) => void;
  setLocale: (l: Locale) => void;
  cmd: (path: string, body?: unknown) => Promise<unknown>;
  startFight: (id: string, extra?: { opponentId?: string }) => Promise<void>;
  hydrate: () => Promise<void>;
  apply: (state: Remote) => void;
  loadReplays: () => Promise<void>;
  openReplay: (battleId: string) => Promise<void>;
  collect: () => Promise<{ gold: number; hours: number }>;
  claimDaily: (id: string) => Promise<boolean>;
  setDirectives: (d: DirectiveId[]) => Promise<void>;
  setFormation: (layout: (string | null)[]) => Promise<void>;
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
  formation: Array(9).fill(null),
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
  dust: 0,
  crests: 0,
  ember: 0,
  heroProg: {},
  gear: [],
  equipped: {},
  towerFloor: 1,
  factionTower: {},
  arenaRating: 1000,
  arenaAttacks: 5,
  guildId: null,
  guildRole: null,
  warAttacks: 3,
  mail: [],
  passXp: 0,
  passPremium: false,
  passClaimed: [],
  eventDay: 1,
  eventClaimed: [],
  honorDraft: [],
  banned: false,
};

export const useGame = create<Store>((set, get) => ({
  ...empty,
  tab: "hub",
  ready: false,
  error: "",
  fighting: null,
  replays: [],
  hubPanel: "home",
  locale: getLocale(),
  setTab: (tab) => set({ tab }),
  setHubPanel: (hubPanel) => set({ hubPanel }),
  setLocale: (locale) => {
    saveLocale(locale);
    set({ locale });
  },
  cmd: async (path, body) => {
    const r = await api<{ state?: Remote }>(path, body);
    if (r.state) get().apply(r.state);
    return r;
  },
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
  setFormation: async (layout) => {
    const r = await api<{ state: Remote }>("/api/formation", { layout });
    get().apply(r.state);
  },
  startFight: async (id, extra) => {
    const r = await api<{
      battleId: string;
      seed: number;
      input: BattleInput;
      result: BattleResult;
      hash: string;
      rewards: FightPayload["rewards"];
      state: Remote;
    }>("/api/battle", { id, opponentId: extra?.opponentId }, { "idempotency-key": crypto.randomUUID() });
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
