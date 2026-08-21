-- Mesmo modelo do SQLite de desenvolvimento.
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  created_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS snapshots (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id),
  json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ledger (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  currency TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref TEXT NOT NULL,
  at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS ledger_account ON ledger(account_id, at);
CREATE TABLE IF NOT EXISTS battles (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
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
CREATE TABLE IF NOT EXISTS guilds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sovereign_id TEXT NOT NULL,
  ember INTEGER NOT NULL,
  hunt_hp INTEGER NOT NULL,
  war_hp INTEGER NOT NULL,
  created_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS guild_members (
  account_id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL,
  role TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS arena_board (
  account_id TEXT PRIMARY KEY,
  rating INTEGER NOT NULL,
  name TEXT NOT NULL,
  snapshot TEXT NOT NULL,
  updated_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS flags (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  payload TEXT NOT NULL,
  at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS analytics_name ON analytics(name, at);
