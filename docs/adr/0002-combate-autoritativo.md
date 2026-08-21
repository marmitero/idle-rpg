# ADR 0002 — Combate autoritativo e determinístico

- **Status:** aceito
- **Data:** 2026-08-20

## Contexto

Idle + arena + guild hunt criam incentivo para mentir o resultado no cliente. Balance exige replay. 3x speed exige previsão local.

## Decisão

`packages/sim` é uma função pura:

```
simulate(loadoutA, loadoutB, directives, seed) → BattleResult
```

O servidor executa e persiste um `BattleRecord` (`seed`, `input`, `result.events`, `hash` FNV-1a, HMAC-SHA256). Recompensas só depois do insert do record. O cliente **não julga**: recebe o record e faz playback dos eventos no Pixi. Relutar o mesmo `Idempotency-Key` devolve o record já persistido sem recrédito.

`GET /api/battles` lista. `GET /api/battle/:id` devolve o record se o HMAC e o hash baterem.

## Consequências

- RNG da batalha usa PRNG seedado (xorshift), nunca `Math.random`.
- Dados de herói na sim vêm do `content_semver` daquela batalha, não do “latest”.
- Fuzz e golden files são obrigação de CI.
- Previsão local 3x (sim no cliente) fica reservada a polish; o slice 1.0 é playback puro.

## Alternativas rejeitadas

- Cliente-autoritativo com validação frouxa (abre economia).
- Lockstep realtime (inútil para async e hostil a mobile).
