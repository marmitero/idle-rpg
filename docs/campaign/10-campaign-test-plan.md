# 10 — Campaign Test Plan

**Status:** v1 (2026-08-21) · **Automatizados:** `packages/content/src/campaign.test.ts`
(`npm test`). **Manuais:** matriz abaixo (critérios de aceite da spec §35).

## Automatizados (puros, sem UI)

1. **Definição:** 12 capítulos; cada um com 20 estágios + boss; ids únicos;
   posições dentro de 0..1; conexões formam cadeia terminando no boss.
2. **Progressão:** `{}` → 1-1 unlocked, 1-2 locked, `current = 1-1`;
   `cleared = ["1-1"]` → 1-2 unlocked e current.
3. **Estados:** 1-1 `current`; após concluir → `completed`; 3 estrelas →
   `perfect`; boss `boss_locked` até 1-19; depois `boss`.
4. **Capítulos:** cap. 2 `locked` até o boss do cap. 1; depois unlocked e
   `2-1` current (se não concluído).
5. **Requisitos:** `multiple_stages` (AND), `boss_defeated`, `player_level`,
   `none`.
6. **Estrelas:** `starsFromBattle` (derrota 0; vitórias 3/2/1 por
   sobrevivência) e `mergeStars` (max, nunca regride).
7. **Desbloqueio data-driven:** inserir estágio novo nos dados altera cadeia/
   corrente sem tocar em lógica (invariante testada sobre a projeção).

## Manuais (UI)

| Área | Casos |
| --- | --- |
| Progressão | 1-1 desbloqueado; completar desbloqueia o próximo; boss desbloqueia após 1-19; cap. 2 abre após boss do cap. 1 |
| UI | toque em bloqueado mostra requisito; toque em aberto abre painel; PLAY inicia batalha; replay em concluído; CLOSE fecha; troca de capítulo |
| Estados | visual de locked/unlocked/current/completed/perfect/boss/elite |
| Responsividade | 360×640, 390×844, 1280×720, tablet; safe areas; scroll + auto-center |
| Persistência | concluir → recarregar página → concluído permanece; estrelas máximas persistem; replay melhora estrela |

## Critérios de aceite da spec §35

Rastreados 1:1 nas tabelas acima; "adicionar estágio/capítulo sem modificar o
núcleo" é coberto pelo teste automatizado 7 e por docs/02.
