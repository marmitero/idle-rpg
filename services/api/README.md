# services/api

Autoridade da economia do slice.

- `POST /api/session` — cria conta por `X-Device-Id`
- `POST /api/wake/collect` — idle no servidor
- `POST /api/battle` — simula e credita no ledger
- `POST /api/gacha/pull` — RNG `crypto`
- `POST /api/hunt/sweep` · `POST /api/daily/claim`

Persistência: JSON em `data/` (dev). Postgres entra no passo seguinte.

Bind `0.0.0.0:3000`. O cliente web fala só com `/api` (proxy Vite).
