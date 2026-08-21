import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

export type Dialect = "sqlite" | "postgres";
export type Row = Record<string, unknown>;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS snapshots (
  account_id TEXT PRIMARY KEY,
  json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ledger (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  currency TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref TEXT NOT NULL,
  at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS ledger_account ON ledger(account_id, at);
CREATE TABLE IF NOT EXISTS battles (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  content_semver TEXT NOT NULL,
  seed BIGINT NOT NULL,
  input_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  hash TEXT NOT NULL,
  mac TEXT NOT NULL,
  winner TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  idempotency_key TEXT UNIQUE,
  created_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS battles_account ON battles(account_id, created_at);
`;

function isPostgres(url: string | undefined): boolean {
  return !!url && /^(postgres|postgresql):\/\//i.test(url);
}

function toPg(sql: string): string {
  const rewritten = sql
    .replace(
      /INSERT OR IGNORE INTO devices \(([^)]+)\) VALUES \(([^)]+)\)/i,
      "INSERT INTO devices ($1) VALUES ($2) ON CONFLICT (id) DO NOTHING",
    )
    .replace(
      /ON CONFLICT\(account_id\) DO UPDATE SET json = excluded\.json/gi,
      "ON CONFLICT (account_id) DO UPDATE SET json = EXCLUDED.json",
    );
  let n = 0;
  return rewritten.replace(/\?/g, () => `$${++n}`);
}

export type Query = {
  get: <T extends Row>(sql: string, params?: unknown[]) => Promise<T | undefined>;
  all: <T extends Row>(sql: string, params?: unknown[]) => Promise<T[]>;
  run: (sql: string, params?: unknown[]) => Promise<void>;
};

export type Db = Query & {
  dialect: Dialect;
  tx: <T>(fn: (q: Query) => Promise<T>) => Promise<T>;
};

async function sqliteDb(): Promise<Db> {
  const rawUrl = process.env.DATABASE_URL;
  const file =
    rawUrl && rawUrl.startsWith("sqlite:")
      ? rawUrl.replace(/^sqlite:/, "")
      : join(dirname(fileURLToPath(import.meta.url)), "../data/relicwake.sqlite");
  mkdirSync(dirname(file), { recursive: true });
  const raw = new DatabaseSync(file);
  raw.exec(SCHEMA);
  const q: Query = {
    async get<T extends Row>(sql: string, params: unknown[] = []) {
      return raw.prepare(sql).get(...params) as T | undefined;
    },
    async all<T extends Row>(sql: string, params: unknown[] = []) {
      return raw.prepare(sql).all(...params) as T[];
    },
    async run(sql: string, params: unknown[] = []) {
      raw.prepare(sql).run(...params);
    },
  };
  return {
    dialect: "sqlite",
    ...q,
    async tx<T>(fn: (inner: Query) => Promise<T>) {
      raw.exec("BEGIN");
      try {
        const out = await fn(q);
        raw.exec("COMMIT");
        return out;
      } catch (e) {
        raw.exec("ROLLBACK");
        throw e;
      }
    },
  };
}

async function postgresDb(url: string): Promise<Db> {
  const mod = await import("pg");
  const Pool =
    (mod as { default?: { Pool: typeof import("pg").Pool }; Pool?: typeof import("pg").Pool }).default?.Pool ??
    (mod as { Pool: typeof import("pg").Pool }).Pool;
  const pool = new Pool({ connectionString: url, max: 8 });
  await pool.query(SCHEMA);
  const make = (query: (sql: string, params?: unknown[]) => Promise<{ rows: Row[] }>): Query => ({
    async get<T extends Row>(sql: string, params: unknown[] = []) {
      const r = await query(toPg(sql), params);
      return r.rows[0] as T | undefined;
    },
    async all<T extends Row>(sql: string, params: unknown[] = []) {
      const r = await query(toPg(sql), params);
      return r.rows as T[];
    },
    async run(sql: string, params: unknown[] = []) {
      await query(toPg(sql), params);
    },
  });
  const q = make((sql, params) => pool.query(sql, params));
  return {
    dialect: "postgres",
    ...q,
    async tx<T>(fn: (inner: Query) => Promise<T>) {
      const c = await pool.connect();
      const inner = make((sql, params) => c.query(sql, params));
      try {
        await c.query("BEGIN");
        const out = await fn(inner);
        await c.query("COMMIT");
        return out;
      } catch (e) {
        await c.query("ROLLBACK");
        throw e;
      } finally {
        c.release();
      }
    },
  };
}

const url = process.env.DATABASE_URL;
export const dialect: Dialect = isPostgres(url) ? "postgres" : "sqlite";
export const db: Db = await (dialect === "postgres" ? postgresDb(url!) : sqliteDb());
