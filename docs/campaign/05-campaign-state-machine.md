# 05 — Campaign State Machine

**Status:** v1 (2026-08-21) · **Função:** `computeStageState` em
`packages/content/src/campaignState.ts`

## Estados

```text
LOCKED · UNLOCKED · CURRENT · COMPLETED · PERFECT · BOSS · BOSS_LOCKED
```

## Algoritmo (ordem de avaliação)

```text
desbloqueado? (requirementMet — docs/06)
 ├─ NÃO → type === "boss" ? BOSS_LOCKED : LOCKED
 └─ SIM
     ├─ cleared contém o id?
     │   ├─ SIM → stars === maxStars ? PERFECT : COMPLETED
     │   └─ NÃO → id === currentStageId ?
     │       ├─ SIM → type === "boss" ? BOSS (corrente) : CURRENT
     │       └─ NÃO → type === "boss" ? BOSS : UNLOCKED
```

Regras complementares:

- Boss concluído mantém o visual de boss (nó grande) com ouro/estrelas — a
  distinção completed/perfect de boss é apresentada pelo nó, não por um novo
  estado.
- `CURRENT` é único na campanha: o primeiro estágio desbloqueado e não
  concluído na ordem (capítulo, depois estágio).
- Elite (estágio 10) usa os mesmos estados de normal; o tipo só muda o visual.

## Transições

```text
LOCKED ──requisito cumprido──▶ UNLOCKED
UNLOCKED ──virou corrente──▶ CURRENT          (conclusão do anterior)
CURRENT ──vitória──▶ COMPLETED / PERFECT
COMPLETED/PERFECT ──replay──▶ (mesmo estado; estrelas podem subir)
UNLOCKED/COMPLETED ──capítulo anterior fechado──▶ BOSS
BOSS ──vitória──▶ COMPLETED/PERFECT (visual de boss)
BOSS ──derrota──▶ BOSS (replay)
BOSS_LOCKED ──1-19 concluído──▶ BOSS
COMPLETED (boss do capítulo) ──▶ capítulo seguinte: cap. LOCKED→UNLOCKED
```

Nenhuma transição é disparada por código hardcoded: todas derivam da
reavaliação de `computeStageState` sobre o progresso novo (REGRAS 1–3 da spec).
