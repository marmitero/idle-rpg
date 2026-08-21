# Relicwake — Documentação de estúdio

Índice vivo. Cada documento tem dono, audiência e critério de “pronto”. Versão atual: **pré-produção v1.1** (pacote de arte absorvido, shell responsivo).

## Como ler

Se você acabou de entrar no projeto, leia nesta ordem:

1. [Pesquisa de mercado](01-pesquisa-de-mercado.md) — o que o gênero ensina
2. [GDD](04-gdd.md) — o que estamos fazendo
3. [Roadmap](03-roadmap.md) — quando
4. [TDD](04-tdd-arquitetura.md) — como
5. [Inventário](02-inventario-de-documentos.md) — o resto do papelório profissional

## Mapa

```
docs/
├── 01-pesquisa-de-mercado.md      referências de estética + sistemas
├── 02-inventario-de-documentos.md  lista completa de docs de produção
├── 03-roadmap.md                   16 meses até 1.0 finalizado
├── 04-gdd.md                       game design document
├── 04-tdd-arquitetura.md           technical design + ADRs
├── 05-art-bible.md                 estilo, UI, VFX, produção
├── 06-narrative-bible.md           mundo, facções, tom
├── 07-economia-liveops.md          moedas, gacha, temporadas
├── 08-qa-compliance.md             qualidade, lojas, gacha, LGPD
├── 09-lancamento.md                go-to-market
├── 10-pipeline-assets.md           pastas, naming, import
├── 11-pitch-one-pager.md           uma página
├── 12-responsividade.md            PC, tablet, telefone
├── 13-regras-de-geracao.md         magenta + lotes de 10
├── 14-slice-onboarding.md          ofício de 8 minutos
├── 15-systems-complete.md          systems 1.0
├── 16-batalha-apresentacao.md      composição, perf e áudio da batalha
├── 17-formacao.md                  formação 3x3 (posicionamento estratégico)
├── ui-redesign/                    interface asset-driven (spec §33)
│   ├── 01-visual-ui-direction.md   filosofia e regras de uso
│   ├── 02-game-ui-design-system.md componentes, estados, tipografia, camadas
│   ├── 03-asset-ui-manifest.md     inventário de assets + placeholders
│   ├── 04-screen-asset-map.md      mapeamento elemento atual → asset
│   ├── 05-responsive-game-ui.md    superfícies, safe areas, interação
│   ├── 06-ui-interaction-spec.md   eventos e feedback por componente
│   ├── 07-asset-production-guide.md ficha padrão + pipeline
│   └── 08-screen-redesign-plan.md  plano por tela (fase 1/2) + aceite
├── campaign/                       Campaign Map (sistema de progressão)
│   ├── 01-campaign-map-system.md   objetivo, arquitetura, fluxos, integração
│   ├── 02-campaign-data-schema.md  campanha/capítulo/estágio/conexão/requisito
│   ├── 03-campaign-progress-schema.md progresso, estrelas, persistência
│   ├── 04-campaign-map-ui-spec.md  componentes e estados visuais
│   ├── 05-campaign-state-machine.md estados e transições dos nós
│   ├── 06-campaign-unlock-rules.md motor genérico de desbloqueio
│   ├── 07-campaign-asset-spec.md   background × sistema, inventário de assets
│   ├── 08-campaign-responsive-layout.md coords normalizadas, câmera, safe area
│   ├── 09-campaign-save-integration.md snapshot, migração, versionamento
│   └── 10-campaign-test-plan.md    matriz de testes (auto + manuais)
└── adr/                            decisões técnicas datadas
```

## Regras da documentação

- Documentos são **living**. Mudança de sistema = PR no doc no mesmo commit.
- Números de economia só mudam com changelog na seção do doc.
- Arte nova precisa caber na Art Bible ou a Art Bible muda primeiro.
- Não existe feature “só no código”.
