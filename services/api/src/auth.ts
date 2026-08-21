import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SECRET = process.env.JWT_SECRET ?? "dev-only-change-me";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function b64url(data: Buffer | string): string {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return buf.toString("base64url");
}

export function signJwt(accountId: string, deviceId: string, ttlSec = 60 * 60 * 24 * 14): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({ sub: accountId, dev: deviceId, exp: Math.floor(Date.now() / 1000) + ttlSec }),
  );
  const sig = b64url(createHmac("sha256", SECRET).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${sig}`;
}

export function verifyJwt(token: string): { sub: string; dev: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts as [string, string, string];
  const expect = b64url(createHmac("sha256", SECRET).update(`${h}.${p}`).digest());
  const a = Buffer.from(s);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const body = JSON.parse(Buffer.from(p, "base64url").toString("utf8")) as {
      sub?: string;
      dev?: string;
      exp?: number;
    };
    if (!body.sub || !body.exp || body.exp < Date.now() / 1000) return null;
    return { sub: body.sub, dev: body.dev ?? "" };
  } catch {
    return null;
  }
}

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length < 120;
}

export function signReplay(hash: string): string {
  return createHmac("sha256", SECRET).update(`rw.replay.${hash}`).digest("hex");
}

export function verifyReplayMac(hash: string, mac: string): boolean {
  const expect = signReplay(hash);
  const a = Buffer.from(mac);
  const b = Buffer.from(expect);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
