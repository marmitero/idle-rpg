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
