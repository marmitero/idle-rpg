# 03 — Campaign Progress Schema

**Status:** v1 (2026-08-21) · **Arquivos:** `services/api/src/store.ts` (Account),
`packages/content/src/campaignState.ts` (avaliação)

Progresso do jogador **não** mora na definição da campanha. Mora no snapshot
da conta (servidor) e é espelhado no estado do cliente via `/api/session`.

## Forma canônica

```ts
export type CampaignProgress = {
  cleared: string[];                 // ids de estágios vencidos (já existia)
  stars: Record<string, number>;     // melhores estrelas por estágio (novo)
  playerLevel?: number;              // requisitos futuros player_level
};
```

Exemplo JSON:

```json
{
  "cleared": ["1-1", "1-2", "1-3"],
  "stars": { "1-1": 3, "1-2": 2, "1-3": 3 }
}
```

## Campos no Account (servidor)

| Campo | Tipo | Regra |
| --- | --- | --- |
| `cleared` | `string[]` | existente — vitória em stage adiciona o id |
| `afkStage` | `string` | existente — estágio mais avançado (idle/coleta) |
| `campaignStars` | `Record<string, number>` | **novo** — máx. de estrelas por estágio |

`campaignStars` migra como `{}` em contas antigas (`loadSnapshot`), nunca
requer reset. O cliente espelha `campaignStars` em `Remote` (`state.ts`).

## Estrelas por vitória

`starsFromBattle(win, allyAliveRatio, maxStars = 3)` (puro, em
`campaignState.ts`):

| Resultado | Estrelas |
| --- | --- |
| derrota | 0 |
| vitória, 100% dos aliados vivos | 3 |
| vitória, ≥ 60% vivos | 2 |
| vitória, < 60% vivos | 1 |

Sempre `max` entre o valor atual e o novo (`mergeStars`) — replay pode melhorar,
nunca piorar. O cálculo roda no **servidor** (combat.ts) dentro do julgamento
autoritativo; o cliente só exibe.

## Derivações (puras, em `campaignState.ts`)

```ts
currentStageId(campaign, progress)   // 1º estágio unlocked && !cleared, na ordem
chapterProgress(chapter, progress)   // { done, total, stars }
isStageUnlocked(def, campaign, progress)
computeStageState(def, campaign, progress)  // máquina — docs/05
```

## Persistência / integração

- **Salvar:** fluxo existente — `resolveBattle` atualiza `cleared` +
  `campaignStars` e `save(a)` grava o snapshot (docs/09).
- **Carregar:** `/api/session` → `publicState` → `apply` no cliente.
- **Eventos:** o controller do mapa emite `stage_completed` etc. a partir de
  deltas observados nesse progresso (docs/01).
