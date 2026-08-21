# 09 — Campaign Save Integration

**Status:** v1 (2026-08-21) · **Arquivos:** `services/api/src/store.ts`,
`services/api/src/combat.ts`

**Regra:** nenhum sistema de save paralelo. O Campaign usa o snapshot existente
da conta (SQLite/Postgres via adapter).

## O que é salvo (novo)

| Campo | Tipo | Default/migração |
| --- | --- | --- |
| `campaignStars` | `Record<string, number>` | `{}` em contas antigas (`loadSnapshot`) |

`cleared` e `afkStage` já existiam e continuam os mesmos — o mapa apenas os lê.

## Fluxos

- **Vitória em estágio (resolveBattle, servidor):** computa estrelas
  (`starsFromBattle`) → `mergeStars` (max) → atualiza `cleared`/`afkStage`
  (fluxo existente) → `save(a)` grava o snapshot.
- **Leitura:** `/api/session` → `publicState(a)` (spread inclui
  `campaignStars`) → `apply` no cliente (`state.ts`).
- **Replay:** permitido em concluídos; pode melhorar estrelas, nunca piorar.

## Carregamento e migração

- `loadSnapshot` normaliza campos ausentes (padrão do projeto:
  `ensureSystems`/defaults) — contas de qualquer versão sobem sem reset.
- `formation` (docs/17) já usa o mesmo padrão; `campaignStars` segue idêntico.

## Versionamento / corrupção

- Sem campo de versão explícito por enquanto (padrão atual do save):
  campos novos nascem com default seguro. Quando o save ganhar versão, o
  Campaign migra no mesmo ponto (nota de `AI_STATE.md`).
- Snapshot inválido segue o tratamento existente do store (JSON parse + defaults).
