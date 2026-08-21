# 06 — Campaign Unlock Rules

**Status:** v1 (2026-08-21) · **Função:** `requirementMet` em
`packages/content/src/campaignState.ts`

Motor genérico de desbloqueio — nenhum `if stage == n then unlock n+1`.

## Tipos suportados

| Tipo | Campo | Avaliação |
| --- | --- | --- |
| `none` | — | sempre `true` (ex.: 1-1) |
| `previous_stage` | `stageId` | `cleared` contém `stageId` |
| `multiple_stages` | `requiredStages[]` | **todos** os ids em `cleared` (AND) |
| `chapter_completion` | `chapterId` | boss final do capítulo em `cleared` |
| `player_level` | `level` | `playerLevel ≥ level` (nível máx. do roster) |
| `boss_defeated` | `bossStageId` | id do boss em `cleared` |

## Uso atual (1.0)

```ts
1-1        → { type: "none" }
1-n (n>1)  → { type: "previous_stage", stageId: "1-(n-1)" }
capítulo c → { type: "chapter_completion", chapterId: "chapter_(c-1)" }  // boss do cap. anterior
```

## Extensibilidade

Novos requisitos entram como novo membro do union `UnlockRequirement` +
branch em `requirementMet` + teste em `campaign.test.ts`. O renderer e o
painel de informação **não mudam**: o painel bloqueado renderiza o requisito
pela função `describeRequirement(req)` (texto legível, também nos dados/lógica
pura — nunca no componente visual).

Exemplos futuros já modelados:

```json
{ "type": "multiple_stages", "requiredStages": ["1-3", "1-4"] }
{ "type": "player_level", "level": 40 }
{ "type": "boss_defeated", "bossStageId": "2-20" }
```

Bifurcações: basta que dois estágios apontem `connections` para o mesmo alvo e
o requisito do alvo seja `multiple_stages` — a topologia está nos dados.
