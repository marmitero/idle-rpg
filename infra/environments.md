# Ambientes

| Env | Quem usa | Persistência | Como sobe |
| --- | --- | --- | --- |
| `dev` | máquina local | SQLite `services/api/data/` | `npm run dev` |
| `ci` | GitHub Actions | SQLite efêmero | copiar `infra/ci.yml` → `.github/workflows/ci.yml` |
| `staging` | soft launch / QA | Postgres 16 | `docker compose -f infra/docker-compose.yml --profile staging up` |
| `prod` | jogadores | Postgres 16 gerenciado | compose/k8s + secrets |

Copie `.env.example` para `.env` em dev. Staging/prod: `infra/env/*.example` → secrets do vault, nunca git.

A API escolhe o dialecto por `DATABASE_URL`:

- vazio ou `sqlite:...` → SQLite (dev/ci)
- `postgres://` / `postgresql://` → Postgres (`pg`), mesmo schema em `infra/schema.sql`
