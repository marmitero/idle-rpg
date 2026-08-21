# services/api

Autoridade da economia + auth.

- Hóspede: `X-Device-Id`
- Cloud save: `POST /api/auth/register` · `POST /api/auth/login` → JWT
- `Authorization: Bearer` tem precedência sobre o device
- **Adapter SQL:** `DATABASE_URL`
  - omitido / `sqlite:` → SQLite (`data/relicwake.sqlite`)
  - `postgres://` → Postgres (`pg` + `infra/schema.sql`)
- `/api/health` devolve `{ dialect, env }`

OAuth Google/Apple: `501` até haver client id de produção.
