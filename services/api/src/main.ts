import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomInt } from "node:crypto";
import { DAILIES, HEROES, HUNTS, STAGES } from "@relicwake/content";
import { bumpDaily, credit, getByEmail, getById, getOrCreate, publicState, save, bindEmail, type Account } from "./store.ts";
import { hashPassword, signJwt, validEmail, verifyJwt, verifyPassword } from "./auth.ts";
import { readBattle, readBattles, resolveBattle } from "./combat.ts";
import { dialect } from "./db.ts";

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

async function account(req: IncomingMessage, res: ServerResponse): Promise<Account | null> {
  const tok = bearer(req);
  const dev = device(req);
  if (tok) {
    const a = await getById(tok.sub, dev || tok.dev || `jwt-${tok.sub}`);
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

function header(req: IncomingMessage, name: string): string | null {
  const h = req.headers[name];
  const v = Array.isArray(h) ? h[0] : h;
  return v && v.length > 0 ? v : null;
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
      json(res, 200, { ok: true, service: "relicwake-api", env: RW_ENV, dialect });
      return;
    }
    if (req.method === "POST" && url === "/api/session") {
      const a = await account(req, res);
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
      if (await getByEmail(email)) return json(res, 409, { error: "email_taken" });
      const a = await getOrCreate(dev);
      if (a.email) return json(res, 409, { error: "already_bound" });
      await bindEmail(a.id, email, hashPassword(password));
      a.email = email.toLowerCase();
      await save(a);
      json(res, 200, { token: signJwt(a.id, dev), state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/auth/login") {
      const body = await readBody(req);
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      const row = await getByEmail(email);
      if (!row?.password_hash || !verifyPassword(password, row.password_hash)) {
        return json(res, 401, { error: "invalid_credentials" });
      }
      const dev = device(req) ?? `login-${row.id}`;
      const a = await getById(row.id, dev);
      if (!a) return json(res, 401, { error: "invalid_credentials" });
      json(res, 200, { token: signJwt(a.id, dev), state: publicState(a) });
      return;
    }
    if (req.method === "GET" && url === "/api/auth/oauth/google") {
      json(res, 501, { error: "oauth_not_configured", hint: "Google/Apple exigem client id de produção." });
      return;
    }
    if (req.method === "GET" && url === "/api/state") {
      const a = await account(req, res);
      if (!a) return;
      regen(a);
      await save(a);
      json(res, 200, { state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/wake/collect") {
      const a = await account(req, res);
      if (!a) return;
      const now = Date.now();
      const stage = STAGES.find((s) => s.id === a.afkStage) ?? STAGES[0]!;
      const hours = Math.min(a.capHours, (now - a.lastCollectAt) / 3_600_000);
      const gold = Math.floor(hours * stage.wakeRate * 12);
      await credit(a, "gold", gold, "wake.collect", a.afkStage);
      a.lastCollectAt = now;
      bumpDaily(a, "wake");
      await save(a);
      json(res, 200, { gold, hours, state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/directives") {
      const a = await account(req, res);
      if (!a) return;
      const body = await readBody(req);
      const d = Array.isArray(body.directives) ? (body.directives as Account["directives"]).slice(0, 3) : a.directives;
      a.directives = d;
      await save(a);
      json(res, 200, { state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/daily/claim") {
      const a = await account(req, res);
      if (!a) return;
      const body = await readBody(req);
      const id = String(body.id ?? "");
      const def = DAILIES.find((x) => x.id === id);
      if (!def) return json(res, 400, { error: "unknown_daily" });
      if (a.dailyClaimed.includes(id)) return json(res, 400, { error: "already_claimed" });
      if ((a.dailyProg[id] ?? 0) < def.target) return json(res, 400, { error: "incomplete" });
      const ref = `daily:${id}:${a.dailyDay}`;
      await credit(a, "gold", def.gold, "daily.claim", ref);
      await credit(a, "letters", def.letters, "daily.claim", ref);
      await credit(a, "sweep", def.sweep, "daily.claim", ref);
      a.dailyClaimed.push(id);
      await save(a);
      json(res, 200, { state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/gacha/pull") {
      const a = await account(req, res);
      if (!a) return;
      if (a.letters < 1) return json(res, 400, { error: "no_letters" });
      await credit(a, "letters", -1, "gacha.pull", "font");
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
      await save(a);
      json(res, 200, { rarity, heroId: hero.id, state: publicState(a) });
      return;
    }
    if (req.method === "POST" && url === "/api/hunt/sweep") {
      const a = await account(req, res);
      if (!a) return;
      regen(a);
      const body = await readBody(req);
      const hunt = HUNTS.find((h) => h.id === String(body.id ?? ""));
      if (!hunt) return json(res, 400, { error: "unknown_hunt" });
      if (a.stamina < hunt.stamina) return json(res, 400, { error: "no_breath" });
      if (a.sweep < 1) return json(res, 400, { error: "no_echo" });
      await credit(a, "stamina", -hunt.stamina, "hunt.sweep", hunt.id);
      await credit(a, "sweep", -1, "hunt.sweep", hunt.id);
      await credit(a, "gold", hunt.gold, "hunt.sweep", hunt.id);
      await credit(a, "letters", hunt.letters, "hunt.sweep", hunt.id);
      bumpDaily(a, "hunt");
      await save(a);
      json(res, 200, { gold: hunt.gold, letters: hunt.letters, state: publicState(a) });
      return;
    }
    if (req.method === "GET" && url === "/api/battles") {
      const a = await account(req, res);
      if (!a) return;
      json(res, 200, { battles: await readBattles(a) });
      return;
    }
    const battleGet = url.match(/^\/api\/battle\/([0-9a-f-]{8,})$/i);
    if (req.method === "GET" && battleGet) {
      const a = await account(req, res);
      if (!a) return;
      const got = await readBattle(a, battleGet[1]!);
      if (!got.ok) return json(res, got.error === "not_found" ? 404 : 409, { error: got.error });
      json(res, 200, { record: got.record });
      return;
    }
    if (req.method === "POST" && url === "/api/battle") {
      const a = await account(req, res);
      if (!a) return;
      regen(a);
      const body = await readBody(req);
      const id = String(body.id ?? "");
      const key = header(req, "idempotency-key");
      const out = await resolveBattle(a, id, key);
      if (!out.ok) {
        const code = out.error === "unknown_content" || out.error === "no_breath" ? 400 : 409;
        return json(res, code, { error: out.error });
      }
      json(res, 200, out.payload);
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
