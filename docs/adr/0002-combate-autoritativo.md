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

O servidor executa e persiste `(inputs, seed, hash)`. O cliente executa para apresentação. Divergência gera resync. Recompensas só após o hash do servidor.

## Consequências

- RNG da batalha usa PRNG seedado (xorshift), nunca `Math.random`.
- Dados de herói na sim vêm do `content_semver` daquela batalha, não do “latest”.
- Fuzz e golden files são obrigação de CI.

## Alternativas rejeitadas

- Cliente-autoritativo com validação frouxa (abre economia).
- Lockstep realtime (inútil para async e hostil a mobile).
