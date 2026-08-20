# Relicwake

Idle auto-battle RPG jogável no **navegador (PC)**, **Android** e **iPhone**.

> Título de produção. IP original. Inspiração mecânica em *Nindo Peak / Pride of Nindo* e no cânone idle-gacha (*AFK Arena*, *AFK Journey*, *Idle Heroes*). Tema **não** é Naruto.

Este repositório é o estúdio: planejamento, conteúdo, cliente, simulação, backend, live-ops e pipeline de arte.

## Estado atual

| Área | Status |
| --- | --- |
| Pesquisa de mercado e referências | Concluída |
| Inventário de documentos de produção | Concluído |
| GDD / TDD / Art Bible / Economia / Roadmap | v1 (living docs) |
| Arquitetura de monorepo | Estruturada |
| Pacote de assets do cliente | **Absorvido** — 82 PNG de `main`, organizados; ver `assets/CATALOG.md` |
| Responsividade PC/mobile | Documentada em `docs/12-responsividade.md` |
| Implementação de gameplay | Próximo: kickoff do vertical slice |

Comece por [`docs/README.md`](docs/README.md).

## Arquitetura (visão rápida)

```
apps/          clientes (web PWA, admin live-ops)
packages/      simulação determinística, protocolo, conteúdo, UI kit
services/      API autoritativa, workers de idle/settlement
assets/        arte organizada por disciplina
docs/          documentos de estúdio
infra/         deploy, observabilidade
tools/         pipelines de conteúdo e assets
```

- **Cliente:** TypeScript, Vite, React (HUD/meta), PixiJS (batalha).
- **Mobile:** o mesmo cliente web, empacotado com Capacitor (PWA primeiro).
- **Servidor:** NestJS, PostgreSQL, Redis, filas. Combate e recompensas são **autoritativos**.
- **Simulação:** `@relicwake/sim` é compartilhada entre servidor (autoridade) e cliente (previsão/replay).

Detalhes em [`docs/04-tdd-arquitetura.md`](docs/04-tdd-arquitetura.md).

## Documentos

| Documento | Para quê |
| --- | --- |
| [Pesquisa de mercado](docs/01-pesquisa-de-mercado.md) | Referências de estética e sistemas |
| [Inventário de documentos](docs/02-inventario-de-documentos.md) | O que o estúdio precisa produzir |
| [Roadmap](docs/03-roadmap.md) | Produção até um 1.0 finalizado |
| [GDD](docs/04-gdd.md) | O jogo |
| [TDD / Arquitetura](docs/04-tdd-arquitetura.md) | Como se constrói |
| [Art Bible](docs/05-art-bible.md) | Estética e padrão de produção |
| [Narrative Bible](docs/06-narrative-bible.md) | Mundo e tom |
| [Economia e Live-ops](docs/07-economia-liveops.md) | Progressão, gacha, temporada |
| [QA e Compliance](docs/08-qa-compliance.md) | Qualidade, gacha, lojas, privacidade |
| [Lançamento](docs/09-lancamento.md) | Soft launch → global |
| [Pipeline de assets](docs/10-pipeline-assets.md) | Como a arte entra no jogo |

## Princípios

1. **Idle honesto.** O jogador ganha estando ausente. O tempo offline é diegético, não um truque de retenção predatória.
2. **Estratégia antes do tap.** Time, facção, posição e ultimates decidem. Auto-batalha não é cosmética.
3. **Autoridade no servidor.** Cliente nunca concede ouro, piedade ou vitória.
4. **Gacha ético.** Odds públicas, pity duro, compra direta de heróis, sem mercado de itens por dinheiro real.
5. **Um cliente, três superfícies.** PC, telefone e tablet compartilham o mesmo produto.

## Licença

UNLICENSED — repositório privado do projeto.
