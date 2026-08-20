# Technical Design — Arquitetura

**Status:** v1  
**Dono:** Tech lead  
**Companheiros:** [ADRs](adr/0001-stack-e-monorepo.md)

---

## 1. Objetivos técnicos

| Objetivo | Implicação |
| --- | --- |
| Um cliente, três superfícies | Web é o produto. Capacitor empacota. Sem fork mobile. |
| Idle verdadeiro | Servidor simula ausência. Fechar a aba é legal. |
| Anti-cheat de economia | Cliente nunca credita moeda, pull ou vitória. |
| Replay e balance | Combate determinístico em pacote compartilhado. |
| Live-ops sem app review | Eventos, banners, drops por config. |
| First paint em 4G | Budget de payload. Sem Unity WebGL. |

---

## 2. Diagrama de contextos

```
                     ┌──────────────┐
                     │  CDN static  │
                     │  client PWA  │
                     └──────┬───────┘
                            │ HTTPS / WSS
              ┌─────────────▼──────────────┐
              │         api gateway        │
              │   (NestJS, JWT, rate)      │
              └─┬──────────┬────────────┬──┘
                │          │            │
        ┌───────▼──┐  ┌────▼────┐  ┌────▼─────┐
        │ command  │  │ query   │  │  realtime│
        │ (writes) │  │ (reads) │  │  (ws)    │
        └───────┬──┘  └────┬────┘  └────┬─────┘
                │          │            │
         ┌──────▼──────────▼────────────▼──────┐
         │              domain                  │
         │  account  roster  combat  idle       │
         │  gacha    guild   shop    mail       │
         └──────┬──────────┬────────────┬──────┘
                │          │            │
         ┌──────▼──┐ ┌─────▼────┐ ┌─────▼─────┐
         │ Postgres│ │  Redis   │ │  queue    │
         │ ledger  │ │ snapshot │ │ idle tick │
         └─────────┘ └──────────┘ └─────┬─────┘
                                        │
                                  ┌─────▼─────┐
                                  │  workers  │
                                  │ wake/settle│
                                  └───────────┘

packages/sim  ── usado por api (autoridade) e web (previsão/replay)
packages/content ── JSON versionado, validado no CI
packages/protocol ── tipos TS gerados, uma fonte
```

---

## 3. Monorepo

```
apps/web            PWA — React HUD + Pixi battle
apps/admin          live-ops interno (nunca público)
packages/shared     ids, branded types, result
packages/protocol   DTOs, erros, versões
packages/sim        combate determinístico
packages/content    heróis, stages, banners (dados)
packages/ui         design system
services/api        NestJS
services/worker     idle, settlement, mail, season
tools/content-cli   validate, diff, publish content
tools/asset-pipeline atlas, compress, hash
infra/              compose, terraform/k8s, dashboards
assets/             fonte de arte (não vai toda pro bundle)
docs/
```

Workspaces: pnpm. Node ≥ 20. TypeScript strict.

---

## 4. Cliente

### 4.1 Camadas

```
views (React)  →  application (stores, queries)
                       │
              game-session (commands)
                       │
         ┌─────────────┼─────────────┐
         │ pixi battle │  sim pred.  │  api client
         └─────────────┴─────────────┘
```

- **React** para hub, lojas, roster, mail, settings. Acessível, i18n, rotas.
- **PixiJS** para o canvas de batalha e o Spire do hub (parallax leve).
- **Shell responsivo:** palco 390–480, container queries, 9-slice dos frames do pacote. Spec: [responsividade](12-responsividade.md), ADR 0004.
- Estado de servidor via TanStack Query. Mutações otimistas só em UI cosmética.
- Batalha: cliente prediz com `sim` para 3x speed fluido; o **resultado oficial** chega assinado do servidor. Divergência > ε gera resync e log. Pixi escala pelo retângulo do palco, não pela janela.

### 4.2 Plataformas

| Superfície | Como |
| --- | --- |
| PC browser | PWA, landscape com coluna central |
| Android Chrome / iOS Safari | PWA retrato, install prompt |
| Play / App Store | Capacitor 6, WebView, billing nativo |

Regras de preview/sandbox (obrigatórias): bind `0.0.0.0`, sem allowlist de host estreita, sem `localhost` no cliente para falar com API — só URLs relativas e proxy.

### 4.3 Performance budget

| Métrica | Alvo |
| --- | --- |
| JS+CSS first load (gzip) | ≤ 350 KB |
| Atlas inicial (hub) | ≤ 1.5 MB |
| Atlas de batalha sob demanda | ≤ 2.5 MB |
| TTI 4G mid | ≤ 4 s |
| Batalha | 30 fps Android mid, 60 desktop |
| RAM iPhone SE | ≤ 450 MB pico |

Código splitting por rota. Heróis não usados não entram no first paint.

---

## 5. Servidor e dados

### 5.1 Princípio do ledger

Toda moeda, item, pull e recompensa passa por `ledger_entries` append-only:

```
(id, account_id, currency, delta, reason, ref_type, ref_id, created_at, actor)
```

Saldo é projeção. Nunca `UPDATE wallets SET gold = gold + ?` solto.  
Isso permite auditoria, rollback de evento e anti-dupe.

### 5.2 Combate autoritativo

```
client: submit TeamLoadout + directives + seed_request
api:    valida eligibilidade, trava stamina/ataque,
        roda packages/sim no servidor,
        persiste BattleRecord (seed, inputs, hash),
        credita recompensas no ledger,
        devolve resultado + replay binário
```

PvP: o defensor é um **snapshot** (time + stats + seed de IA). Não há handshake.

### 5.3 Idle

```
wake_state (account_id, afk_stage, last_collect_at, cap_hours)
worker: não precisa tickar todo mundo
collect: now = min(now, last + cap); reward = rate(stage) * elapsed
```

Fechar o app é irrelevante. Relógio do servidor.

### 5.4 Gacha

RNG no servidor (`crypto`). Pity persistido por banner/account.  
Pull devolve itens já creditados. Cliente só anima.

### 5.5 Persistência

- **Postgres:** contas, roster, ledger, guildas, batalhas, mail.
- **Redis:** sessões, locks (collect, pull), snapshots de arena, presence.
- **Object storage:** replays grandes, dumps.
- **Fila (BullMQ/Redis):** mail em massa, settlement de war, season rollover.

### 5.6 Identidade

- Device id (primeiro boot) → conta hóspede.
- Bind: email + OAuth (Google, Apple — exigência iOS).
- Exclusão: endpoint + job de purge PII (LGPD).
- JWT curto + refresh. Admin num realm separado.

---

## 6. Conteúdo como dados

Heróis, skills, stages, banners, missões vivem em `packages/content` (JSON/YAML) com:

- schema Zod;
- IDs estáveis (`hero.ember.kael`);
- CI que quebra se skill referencia status inexistente;
- publicação por *content version* (`content_semver`). Cliente antigo continua jogando com a versão que o servidor aceita (N e N-1).

Live-ops liga flags e *overrides* (drop rate de evento) sem novo binário.

---

## 7. Realtime

WebSocket só para:

- presença de guilda / chat;
- mail badge;
- war state;
- maintenance kick.

Não para combate PvE e não para idle. HTTP é suficiente e mais barato.

---

## 8. Admin

`apps/admin`, VPN / SSO, audit log.

Capacidades 1.0: mail, banner, drop override, feature flag, ban, compensação de ledger, season clock, gacha odds viewer.

---

## 9. Segurança

- Rate limit por conta e IP em pull, collect, battle, chat.
- Idempotency-key em todos os commands.
- Sem economia no cliente.
- HMAC nos replays.
- Admin 2FA.
- Secrets fora do git.
- Payments: Stripe (web) + Billing nativo; servidor valida receipt.

---

## 10. Ambientes

| Env | Uso |
| --- | --- |
| local | compose: api, worker, postgres, redis |
| staging | time interno, content experimental |
| soft | lojas, região de soft launch |
| prod | global |

Migrations só para frente. Conteúdo rollback-ável por `content_semver`.

---

## 11. Testes

| Camada | O quê |
| --- | --- |
| sim | golden replays, fuzz 10k seeds, invariantes (HP≥0, timeout) |
| api | contract tests do protocol |
| economy | simulação de 60 dias F2P vs payer (CI nightly) |
| e2e | onboarding, collect, pull, 1 battle |
| client | visual regression do UI kit |

---

## 12. Observabilidade

- Traces (OpenTelemetry) em command handlers.
- Métricas: collect latency, battle sim ms, pull/min, ledger conflicts, WS connects.
- Alertas: error rate, payout anomaly (ouro/min > 3σ), fila atrasada.
- SLO: API p95 < 200 ms (ex-sim), sim p95 < 40 ms, crash-free 99.5%.
