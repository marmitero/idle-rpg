# services/api

Autoridade da economia + auth.

- Hóspede: `X-Device-Id`
- Cloud save: `POST /api/auth/register` · `POST /api/auth/login` → JWT
- `Authorization: Bearer` tem precedência sobre o device
- Ledger em tabela SQL (`data/relicwake.sqlite` no slice)
- Schema Postgres: `infra/schema.sql` + `infra/docker-compose.yml`

OAuth Google/Apple: `501` até haver client id de produção.
