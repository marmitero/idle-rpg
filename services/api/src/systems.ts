import { randomUUID } from "node:crypto";
import {
  ENHANCE_CAP,
  FACTION_TOWERS,
  GEAR_SETS,
  GEAR_SLOTS,
  HERO_BY_ID,
  HEROES,
  HONOR_POOL,
  IMPRINT_CAP,
  LEVEL_CAP,
  LOGIN_EVENT,
  PASS_TRACK,
  SKUS,
  STAR_CAP,
  TOWER_FLOORS,
  FACTION_TOWER_FLOORS,
  enhanceCost,
  levelCost,
  starDust,
  type GearPiece,
  type GearSetId,
  type GearSlot,
} from "@relicwake/content";
import { db } from "./db.ts";
import { credit, publicState, save, type Account } from "./store.ts";

const ADMIN = process.env.ADMIN_KEY ?? "dev-admin";

export async function track(accountId: string, name: string, payload: unknown) {
  await db.run("INSERT INTO analytics (id, account_id, name, payload, at) VALUES (?, ?, ?, ?, ?)", [
    randomUUID(),
    accountId,
    name,
    JSON.stringify(payload),
    Date.now(),
  ]);
}

export async function flag(k: string, fallback: string): Promise<string> {
  const row = await db.get<{ v: string }>("SELECT v FROM flags WHERE k = ?", [k]);
  return row?.v ?? fallback;
}

export async function setFlag(k: string, v: string) {
  const row = await db.get<{ k: string }>("SELECT k FROM flags WHERE k = ?", [k]);
  if (row) await db.run("UPDATE flags SET v = ? WHERE k = ?", [v, k]);
  else await db.run("INSERT INTO flags (k, v) VALUES (?, ?)", [k, v]);
}

export async function upsertArena(a: Account) {
  const name = a.wakerName ?? "Waker";
  const snap = JSON.stringify({ team: a.team, heroProg: a.heroProg, equipped: a.equipped, gear: a.gear, directives: a.directives });
  const row = await db.get<{ account_id: string }>("SELECT account_id FROM arena_board WHERE account_id = ?", [a.id]);
  if (row) {
    await db.run("UPDATE arena_board SET rating = ?, name = ?, snapshot = ?, updated_at = ? WHERE account_id = ?", [
      a.arenaRating,
      name,
      snap,
      Date.now(),
      a.id,
    ]);
  } else {
    await db.run("INSERT INTO arena_board (account_id, rating, name, snapshot, updated_at) VALUES (?, ?, ?, ?, ?)", [
      a.id,
      a.arenaRating,
      name,
      snap,
      Date.now(),
    ]);
  }
}

function equippedPieces(a: Account): GearPiece[] {
  return GEAR_SLOTS.map((s) => a.gear.find((g) => g.id === a.equipped[s])).filter(Boolean) as GearPiece[];
}

export { equippedPieces };

export async function handleSystems(
  url: string,
  method: string,
  a: Account,
  body: Record<string, unknown>,
  adminKey: string | null,
): Promise<{ code: number; body: unknown } | null> {
  if (a.banned) return { code: 403, body: { error: "banned" } };

  if (method === "POST" && url === "/api/team") {
    const team = Array.isArray(body.team) ? (body.team as string[]).slice(0, 5) : [];
    if (team.some((id) => !a.owned.includes(id))) return { code: 400, body: { error: "not_owned" } };
    a.team = team;
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/hero/level") {
    const id = String(body.id ?? "");
    const p = a.heroProg[id];
    if (!p || !a.owned.includes(id)) return { code: 400, body: { error: "unknown_hero" } };
    if (p.level >= LEVEL_CAP) return { code: 400, body: { error: "cap" } };
    const cost = levelCost(p.level);
    await credit(a, "gold", -cost, "hero.level", id);
    p.level += 1;
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/hero/star") {
    const id = String(body.id ?? "");
    const p = a.heroProg[id];
    if (!p) return { code: 400, body: { error: "unknown_hero" } };
    if (p.stars >= STAR_CAP) return { code: 400, body: { error: "cap" } };
    await credit(a, "dust", -starDust(p.stars), "hero.star", id);
    p.stars += 1;
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/hero/imprint") {
    const id = String(body.id ?? "");
    const p = a.heroProg[id];
    if (!p) return { code: 400, body: { error: "unknown_hero" } };
    if (p.imprint >= IMPRINT_CAP) return { code: 400, body: { error: "cap" } };
    await credit(a, "dust", -6, "hero.imprint", id);
    p.imprint += 1;
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/hero/skill") {
    const id = String(body.id ?? "");
    const which = String(body.which ?? "") as "pas" | "cmd" | "ult";
    const p = a.heroProg[id];
    if (!p || !["pas", "cmd", "ult"].includes(which)) return { code: 400, body: { error: "bad_skill" } };
    if (p[which] >= 5) return { code: 400, body: { error: "cap" } };
    await credit(a, "dust", -5 * p[which], "hero.skill", `${id}:${which}`);
    p[which] += 1;
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/gear/equip") {
    const id = String(body.id ?? "");
    const g = a.gear.find((x) => x.id === id);
    if (!g) return { code: 400, body: { error: "unknown_gear" } };
    a.equipped[g.slot] = g.id;
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/gear/enhance") {
    const id = String(body.id ?? "");
    const g = a.gear.find((x) => x.id === id);
    if (!g) return { code: 400, body: { error: "unknown_gear" } };
    if (g.plus >= ENHANCE_CAP) return { code: 400, body: { error: "cap" } };
    await credit(a, "gold", -enhanceCost(g.plus), "gear.enhance", id);
    g.plus += 1;
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/gear/craft") {
    const slot = String(body.slot ?? "") as GearSlot;
    const set = String(body.set ?? "") as GearSetId;
    if (!GEAR_SLOTS.includes(slot) || !GEAR_SETS.some((s) => s.id === set)) return { code: 400, body: { error: "bad_craft" } };
    await credit(a, "gold", -80, "gear.craft", slot);
    await credit(a, "dust", -4, "gear.craft", slot);
    const piece: GearPiece = { id: `gear.${randomUUID().slice(0, 8)}`, slot, set, plus: 0 };
    a.gear.push(piece);
    await save(a);
    return { code: 200, body: { piece, state: publicState(a) } };
  }

  if (method === "GET" && url === "/api/arena/opponents") {
    await upsertArena(a);
    const rows = await db.all<{ account_id: string; rating: number; name: string }>(
      "SELECT account_id, rating, name FROM arena_board WHERE account_id != ? ORDER BY rating DESC LIMIT 8",
      [a.id],
    );
    return { code: 200, body: { opponents: rows, rank: a.arenaRating } };
  }

  if (method === "POST" && url === "/api/guild/create") {
    const name = String(body.name ?? "").trim();
    if (name.length < 3 || name.length > 20) return { code: 400, body: { error: "bad_name" } };
    if (a.guildId) return { code: 400, body: { error: "already_guild" } };
    const id = randomUUID();
    await db.run("INSERT INTO guilds (id, name, sovereign_id, ember, hunt_hp, war_hp, created_at) VALUES (?, ?, ?, 0, 10000, 20000, ?)", [
      id,
      name,
      a.id,
      Date.now(),
    ]);
    await db.run("INSERT INTO guild_members (account_id, guild_id, role) VALUES (?, ?, ?)", [a.id, id, "sovereign"]);
    a.guildId = id;
    a.guildRole = "sovereign";
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/guild/join") {
    const name = String(body.name ?? "").trim();
    const g = await db.get<{ id: string }>("SELECT id FROM guilds WHERE name = ?", [name]);
    if (!g) return { code: 404, body: { error: "no_guild" } };
    if (a.guildId) return { code: 400, body: { error: "already_guild" } };
    await db.run("INSERT INTO guild_members (account_id, guild_id, role) VALUES (?, ?, ?)", [a.id, g.id, "member"]);
    a.guildId = g.id;
    a.guildRole = "member";
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "GET" && url === "/api/guild") {
    if (!a.guildId) return { code: 200, body: { guild: null } };
    const g = await db.get<{ id: string; name: string; ember: number; hunt_hp: number; war_hp: number; sovereign_id: string }>(
      "SELECT id, name, ember, hunt_hp, war_hp, sovereign_id FROM guilds WHERE id = ?",
      [a.guildId],
    );
    const members = await db.all<{ account_id: string; role: string }>(
      "SELECT account_id, role FROM guild_members WHERE guild_id = ?",
      [a.guildId],
    );
    return { code: 200, body: { guild: g, members } };
  }

  if (method === "POST" && url === "/api/guild/help") {
    if (!a.guildId) return { code: 400, body: { error: "no_guild" } };
    await credit(a, "ember", 2, "guild.help", a.guildId);
    await db.run("UPDATE guilds SET ember = ember + 2 WHERE id = ?", [a.guildId]);
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/guild/shop") {
    if (!a.guildId) return { code: 400, body: { error: "no_guild" } };
    await credit(a, "ember", -12, "guild.shop", "letters");
    await credit(a, "letters", 1, "guild.shop", "letters");
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/mail/claim") {
    const id = String(body.id ?? "");
    const m = a.mail.find((x) => x.id === id);
    if (!m || m.claimed) return { code: 400, body: { error: "mail" } };
    m.claimed = true;
    await credit(a, "gold", m.gold, "mail.claim", id);
    await credit(a, "letters", m.letters, "mail.claim", id);
    await credit(a, "dust", m.dust, "mail.claim", id);
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/pass/claim") {
    const level = Number(body.level);
    const track = String(body.track ?? "free");
    const def = PASS_TRACK.find((p) => p.level === level);
    if (!def) return { code: 400, body: { error: "pass" } };
    const key = `${track}:${level}`;
    if (a.passClaimed.includes(key)) return { code: 400, body: { error: "claimed" } };
    if (a.passXp < def.xp) return { code: 400, body: { error: "xp" } };
    if (track === "prem" && !a.passPremium) return { code: 400, body: { error: "not_premium" } };
    a.passClaimed.push(key);
    if (track === "free") await credit(a, "gold", def.freeGold, "pass.claim", key);
    else await credit(a, "letters", def.premLetters, "pass.claim", key);
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/event/login") {
    const day = Number(body.day);
    const def = LOGIN_EVENT.find((d) => d.day === day);
    if (!def) return { code: 400, body: { error: "event" } };
    if (day > a.eventDay) return { code: 400, body: { error: "locked" } };
    if (a.eventClaimed.includes(day)) return { code: 400, body: { error: "claimed" } };
    a.eventClaimed.push(day);
    await credit(a, "gold", def.gold, "event.login", String(day));
    await credit(a, "letters", def.letters, "event.login", String(day));
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/shop/buy") {
    const id = String(body.id ?? "");
    const sku = SKUS.find((s) => s.id === id);
    if (!sku) return { code: 400, body: { error: "sku" } };
    const paidRandom = (await flag("paidRandom", "true")) === "true";
    if ("paidRandom" in sku && sku.paidRandom && !paidRandom) return { code: 400, body: { error: "region_block" } };
    if ("pass" in sku && sku.pass) a.passPremium = true;
    if (sku.fate) await credit(a, "fate", sku.fate, "shop.sandbox", id);
    if ("stamina" in sku && sku.stamina) {
      a.stamina = Math.min(120, a.stamina + sku.stamina);
    }
    await save(a);
    await track(a.id, "iap.sandbox", { sku: id });
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/honor/draft") {
    const picks = Array.isArray(body.picks) ? (body.picks as string[]).slice(0, 5) : [];
    if (picks.length !== 5) return { code: 400, body: { error: "draft" } };
    if (picks.some((id) => !HONOR_POOL.some((p) => p.id === id))) return { code: 400, body: { error: "pool" } };
    a.honorDraft = picks;
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "GET" && url === "/api/admin/flags") {
    if (adminKey !== ADMIN) return { code: 401, body: { error: "admin" } };
    const rows = await db.all<{ k: string; v: string }>("SELECT k, v FROM flags", []);
    return { code: 200, body: { flags: Object.fromEntries(rows.map((r) => [r.k, r.v])), env: process.env.RW_ENV ?? "dev" } };
  }

  if (method === "POST" && url === "/api/admin/flag") {
    if (adminKey !== ADMIN) return { code: 401, body: { error: "admin" } };
    await setFlag(String(body.k ?? ""), String(body.v ?? ""));
    return { code: 200, body: { ok: true } };
  }

  if (method === "POST" && url === "/api/admin/mail") {
    if (adminKey !== ADMIN) return { code: 401, body: { error: "admin" } };
    a.mail.push({
      id: randomUUID(),
      title: String(body.title ?? "Live-ops"),
      body: String(body.body ?? ""),
      gold: Number(body.gold ?? 0),
      letters: Number(body.letters ?? 0),
      dust: Number(body.dust ?? 0),
      claimed: false,
      at: Date.now(),
    });
    await save(a);
    return { code: 200, body: { state: publicState(a) } };
  }

  if (method === "POST" && url === "/api/admin/ban") {
    if (adminKey !== ADMIN) return { code: 401, body: { error: "admin" } };
    a.banned = true;
    await save(a);
    return { code: 200, body: { ok: true } };
  }

  if (method === "GET" && url === "/api/admin/analytics") {
    if (adminKey !== ADMIN) return { code: 401, body: { error: "admin" } };
    const rows = await db.all<{ name: string; n: number }>(
      "SELECT name, COUNT(*) as n FROM analytics GROUP BY name",
      [],
    );
    return { code: 200, body: { counters: rows } };
  }

  void HEROES;
  void HERO_BY_ID;
  void TOWER_FLOORS;
  void FACTION_TOWER_FLOORS;
  void FACTION_TOWERS;
  return null;
}
