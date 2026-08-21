# ADR 0001 — Stack e monorepo

- **Status:** aceito
- **Data:** 2026-08-20
- **Decisores:** tech lead, direção

## Contexto

O jogo precisa rodar no navegador de PC e em telefones (Android/iPhone), com idle autoritativo, combate simulável e live-ops. Unity WebGL é pesado para first paint em 4G. Dois clientes (nativo + web) dobram o custo de um time indie.

## Decisão

- TypeScript end-to-end.
- pnpm workspaces.
- Cliente: Vite + React + PixiJS.
- Mobile: o mesmo cliente via PWA e Capacitor.
- API: NestJS + PostgreSQL + Redis + BullMQ.
- Simulação em `packages/sim`, compartilhada.
- Conteúdo versionado em `packages/content`.

## Consequências

- Um HUD e uma batalha para todas as superfícies.
- Contratação e onboarding em uma linguagem.
- Precisamos de disciplina de performance (atlas, code split) que um engine 3D esconderia.
- Capacitor ainda exige certificados e billing nativo — orçado na Fase 4.

## Alternativas rejeitadas

| Opção | Motivo |
| --- | --- |
| Unity / Godot web | Payload e ciclo de UI de hub piores para este gênero |
| Cliente nativo separado | Custo de paridade |
| Firebase-only | Ledger e simulação de combate não cabem |
| Python no servidor | Queremos o mesmo `sim` no browser e no node |
