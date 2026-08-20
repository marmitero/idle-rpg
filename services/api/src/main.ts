import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomInt, randomUUID } from "node:crypto";
import { DAILIES, ENEMIES, HERO_BY_ID, HEROES, HUNTS, STAGES } from "@relicwake/content";
import { simulate, type LoadoutUnit } from "@relicwake/sim";
import { bumpDaily, credit, getByEmail, getById, getOrCreate, publicState, save, bindEmail, type Account } from "./store.ts";
import { hashPassword, signJwt, validEmail, verifyJwt, verifyPassword } from "./auth.ts";

const PORT = Number(process.env.API_PORT ?? 3000);
const CORS = process.env.CORS_ORIGIN ?? "*";
const RW_ENV = process.env.RW_ENV ?? "dev";
const STAMINA_CAP = 120;
const STAMINA_PER_H = 10;

function json(res: ServerResponse, code: number, body: unknown) {
  const data = JSON.stringify(body);
  res.writeHead(code, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": CORS,
    "access-control-allow-headers": "content-type, x-device-id, authorization, idempotency-key",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  res.end(data);
}

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c as Buffer));
    req.on("end", () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>);
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function device(req: IncomingMessage): string | null {
  const h = req.headers["x-device-id"];
  const v = Array.isArray(h) ? h[0] : h;
  return v && v.length >= 8 ? v : null;
}

function bearer(req: IncomingMessage): { sub: string; dev: string } | null {
  const h = req.headers.authorization;
  const v = Array.isArray(h) ? h[0] : h;
  if (!v?.startsWith("Bearer ")) return null;
  return verifyJwt(v.slice(7));
}

function account(req: IncomingMessage, res: ServerResponse): Account | null {
  const tok = bearer(req);
  const dev = device(req);
  if (tok) {
    const a = getById(tok.sub, dev || tok.dev || `jwt-${tok.sub}`);
    if (!a) {
      json(res, 401, { error: "invalid_token" });
      return null;
    }
    return a;
  }
  if (!dev) {
    json(res, 401, { error: "missing_device" });
    return null;
  }
  return getOrCreate(dev);
}

function regen(a: Account) {
  const now = Date.now();
  const gained = Math.floor(((now - a.lastStaminaAt) / 3_600_000) * STAMINA_PER_H);
  if (gained <= 0) return;
  a.stamina = Math.min(STAMINA_CAP, a.stamina + gained);
  a.lastStaminaAt += gained * (3_600_000 / STAMINA_PER_H);
}

function scaled(stats: LoadoutUnit["stats"], s: number): LoadoutUnit["stats"] {
  return {
    hp: Math.round(stats.hp * s),
    atk: Math.round(stats.atk * s),
    def: Math.round(stats.def * s),
    spd: stats.spd,
    crit: stats.crit,
  };
}

function loadoutFromTeam(a: Account): LoadoutUnit[] {
  return a.team.slice(0, 5).map((id, slot) => {
    const h = HERO_BY_ID[id] ?? HEROES[0]!;
    return { id: `a${slot}`, heroId: h.id, name: h.name, faction: h.faction, stats: h.stats, slot };
  });
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": CORS,
      "access-control-allow-headers": "content-type, x-device-id, authorization, idempotency-key",
      "access-control-allow-methods": "GET,POST,OPTIONS",
    });
    res.end();
    return;
  }
  const url = req.url?.split("?")[0] ?? "";
  try {
    if (req.method === "GET" && url === "/api/health") {
      json(res, 200, { ok: true, service: "relicwake-api", env: RW_ENV });
      return;
    }
    if (req.method === "POST" && url === "/api/session") {
      const a = account(req, res);
      if (!a) return;
      json(res, 200, { state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/auth/register") {
      const dev = device(req);
      if (!dev) return json(res, 401, { error: "missing_device" });
      const body = await readBody(req);
      const email = String(body.email ?? "").trim();
      const password = String(body.password ?? "");
      if (!validEmail(email) || password.length < 8) return json(res, 400, { error: "invalid_credentials" });
      if (getByEmail(email)) return json(res, 409, { error: "email_taken" });
      const a = getOrCreate(dev);
      if (a.email) return json(res, 409, { error: "already_bound" });
      bindEmail(a.id, email, hashPassword(password));
      a.email = email.toLowerCase();
      save(a);
      json(res, 200, { token: signJwt(a.id, dev), state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/auth/login") {
      const body = await readBody(req);
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      const row = getByEmail(email);
      if (!row?.password_hash || !verifyPassword(password, row.password_hash)) {
        return json(res, 401, { error: "invalid_credentials" });
      }
      const dev = device(req) ?? `login-${row.id}`;
      const a = getById(row.id, dev);
      if (!a) return json(res, 401, { error: "invalid_credentials" });
      json(res, 200, { token: signJwt(a.id, dev), state: publicState(a) });
      return;
    }
    if (req.method === "GET" && url === "/api/auth/oauth/google") {
      json(res, 501, { error: "oauth_not_configured", hint: "Google/Apple exigem client id de produção." });
      return;
    }
    if (req.method === "GET" && url === "/api/state") {
      const a = account(req, res);
      if (!a) return;
      regen(a);
      save(a);
      json(res, 200, { state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/wake/collect") {
      const a = account(req, res);
      if (!a) return;
      const now = Date.now();
      const stage = STAGES.find((s) => s.id === a.afkStage) ?? STAGES[0]!;
      const hours = Math.min(a.capHours, (now - a.lastCollectAt) / 3_600_000);
      const gold = Math.floor(hours * stage.wakeRate * 12);
      credit(a, "gold", gold, "wake.collect", a.afkStage);
      a.lastCollectAt = now;
      bumpDaily(a, "wake");
      save(a);
      json(res, 200, { gold, hours, state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/directives") {
      const a = account(req, res);
      if (!a) return;
      const body = await readBody(req);
      const d = Array.isArray(body.directives) ? (body.directives as Account["directives"]).slice(0, 3) : a.directives;
      a.directives = d;
      save(a);
      json(res, 200, { state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/daily/claim") {
      const a = account(req, res);
      if (!a) return;
      const body = await readBody(req);
      const id = String(body.id ?? "");
      const def = DAILIES.find((x) => x.id === id);
      if (!def) return json(res, 400, { error: "unknown_daily" });
      if (a.dailyClaimed.includes(id)) return json(res, 400, { error: "already_claimed" });
      if ((a.dailyProg[id] ?? 0) < def.target) return json(res, 400, { error: "incomplete" });
      const ref = `daily:${id}:${a.dailyDay}`;
      credit(a, "gold", def.gold, "daily.claim", ref);
      credit(a, "letters", def.letters, "daily.claim", ref);
      credit(a, "sweep", def.sweep, "daily.claim", ref);
      a.dailyClaimed.push(id);
      save(a);
      json(res, 200, { state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/gacha/pull") {
      const a = account(req, res);
      if (!a) return;
      if (a.letters < 1) return json(res, 400, { error: "no_letters" });
      credit(a, "letters", -1, "gacha.pull", "font");
      a.pity += 1;
      const roll = randomInt(0, 1_000_000) / 1_000_000;
      let rarity = "rare";
      if (a.pity >= 70 || roll < 0.012) rarity = "relic";
      else if (roll < 0.1) rarity = "elite";
      if (rarity === "relic") a.pity = 0;
      const pool = HEROES.filter((h) => (rarity === "relic" ? h.rarity === "relic" : true));
      const hero = pool[randomInt(0, pool.length)] ?? HEROES[0]!;
      if (!a.owned.includes(hero.id)) a.owned.push(hero.id);
      bumpDaily(a, "pull");
      save(a);
      json(res, 200, { rarity, heroId: hero.id, state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/hunt/sweep") {
      const a = account(req, res);
      if (!a) return;
      regen(a);
      const body = await readBody(req);
      const hunt = HUNTS.find((h) => h.id === String(body.id ?? ""));
      if (!hunt) return json(res, 400, { error: "unknown_hunt" });
      if (a.stamina < hunt.stamina) return json(res, 400, { error: "no_breath" });
      if (a.sweep < 1) return json(res, 400, { error: "no_echo" });
      credit(a, "stamina", -hunt.stamina, "hunt.sweep", hunt.id);
      credit(a, "sweep", -1, "hunt.sweep", hunt.id);
      credit(a, "gold", hunt.gold, "hunt.sweep", hunt.id);
      credit(a, "letters", hunt.letters, "hunt.sweep", hunt.id);
      bumpDaily(a, "hunt");
      save(a);
      json(res, 200, { gold: hunt.gold, letters: hunt.letters, state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/battle") {
      const a = account(req, res);
      if (!a) return;
      regen(a);
      const body = await readBody(req);
      const id = String(body.id ?? "");
      const stage = STAGES.find((s) => s.id === id);
      const hunt = HUNTS.find((h) => h.id === id);
      if (!stage && !hunt) return json(res, 400, { error: "unknown_content" });
      if (hunt) {
        if (a.stamina < hunt.stamina) return json(res, 400, { error: "no_breath" });
        credit(a, "stamina", -hunt.stamina, "hunt.enter", hunt.id);
      }
      const allies = loadoutFromTeam(a);
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
      const seed = randomInt(1, 2_147_000_000);
      const result = simulate({ seed, allies, enemies, directives: a.directives });
      const battleId = randomUUID();
      let gold = 0;
      let letters = 0;
      if (result.winner === "ally") {
        if (stage) {
          gold = stage.gold;
          credit(a, "gold", gold, "battle.win", battleId);
          if (!a.cleared.includes(stage.id)) a.cleared.push(stage.id);
          const idx = STAGES.findIndex((s) => s.id === stage.id);
          const afk = STAGES.findIndex((s) => s.id === a.afkStage);
          if (idx >= afk) a.afkStage = stage.id;
          bumpDaily(a, "fight");
        }
        if (hunt) {
          gold = hunt.gold;
          letters = hunt.letters;
          credit(a, "gold", gold, "hunt.win", battleId);
          credit(a, "letters", letters, "hunt.win", battleId);
          bumpDaily(a, "hunt");
        }
      }
      save(a);
      json(res, 200, {
        battleId,
        seed,
        result,
        rewards: { gold, letters, win: result.winner === "ally" },
        state: publicState(a),
      });
      return;
    }
    json(res, 404, { error: "not_found" });
  } catch (err) {
    json(res, 500, { error: "server", message: String(err) });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`relicwake-api env=${RW_ENV} on 0.0.0.0:${PORT}`);
});
