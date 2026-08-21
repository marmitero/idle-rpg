# 01 — Campaign Map System

**Status:** v1 (2026-08-21) · **Dono:** Client / Design · **Lê com:** 02 (schema de dados), 03 (progresso), 05 (estados)

## Objetivo

Tela de progressão de campanha no padrão mobile idle-RPG: um mapa ilustrado por
capítulo, com **stage nodes** posicionados por dados, conectados por caminhos,
estados visuais (bloqueado/atual/concluído/perfect/boss), painel de informação e
entrada de batalha. É a infraestrutura de progressão da campanha inteira —
**não** uma tela estática nem uma imagem única.

## Princípios

1. **Data-driven** — capítulos/estágios/posições/conexões/requisitos vêm de
   `@relicwake/content` (`campaign.ts`). Adicionar estágio/capítulo = dados.
2. **Progresso separado da definição** — definição é estática; progresso vive
   no snapshot do jogador (servidor). Nunca misturar.
3. **Apresentação separada do conteúdo** — dados respondem *o que é*; o
   renderer responde *como aparece*.
4. **Sem hardcode** — nada de `if stage == 1 then unlock 2`; a progressão é
   avaliada pelo motor genérico de requisitos (`campaignState.ts`).
5. **Sem dependência de resolução** — posições normalizadas (0..1) convertidas
   por uma camada MapRect → Screen (docs/08).
6. **Mapa apenas inicia a fase** — o combate continua 100% autoritativo no
   servidor (`POST /api/battle`), sem acoplamento novo.

## Arquitetura (mapeada para os arquivos reais)

```text
CAMPAIGN SYSTEM (Relicwake)
│
├── CampaignDefinition ......... packages/content/src/campaign.ts (types + CAMPAIGN)
├── ChapterDefinition .......... CampaignChapterDef (12 capítulos, derivados de CHAPTERS)
├── StageDefinition ............ CampaignStageDef (240 estágios, derivados de STAGES)
├── StageConnection ............ stage.connections[] (dados, cadeia + boss)
├── CampaignProgress ........... account.cleared + account.campaignStars (servidor)
├── CampaignManager/Unlock ..... packages/content/src/campaignState.ts (puro, testável)
│                                 requirementMet / isStageUnlocked / currentStageId
├── CampaignStateManager ....... computeStageState (máquina de estados, docs/05)
├── CampaignMapController ...... apps/web/src/ui/campaign/controller.ts (hook + foco)
├── CampaignMapRenderer ........ apps/web/src/ui/campaign/CampaignMap.tsx (só apresenta)
├── StageNode / BossNode ....... ui/campaign/nodes.tsx
├── StagePath .................. ui/campaign/StagePath.tsx (SVG, estilo por estado)
├── ChapterMarker / Selector ... ui/campaign/CampaignMap.tsx
├── StageInfoPanel ............. ui/campaign/StageInfoPanel.tsx (+ modo boss)
├── CampaignEvents ............. ui/campaign/events.ts (bus tipado de UI)
└── Save ....................... services/api/src/store.ts (snapshot existente — docs/09)
```

**Nota de integração:** os dados de gameplay (`STAGES`, `CHAPTERS`) continuam a
fonte de verdade única; `campaign.ts` os **projeta** para o formato do mapa
(posição, tipo, conexões, requisitos). Nenhuma duplicação de gameplay.

## Fluxos

**Abertura do mapa:** monta → carrega definição (content, estático) → lê
progresso (estado do cliente, vindo do servidor) → calcula estados dos nós →
renderiza capítulo ativo → foca o estágio atual (`focusOnStage`).

**Toque no nó:** estado `locked` → painel com requisito; `unlocked/current/
completed/boss` → painel de info → **PLAY/FIGHT** → `startFight(stage.id)`
(tubo existente) → servidor julga, persiste `cleared` + estrelas → estado novo
volta via `/api/session` → mapa recalcula estados e foca o próximo.

**Eventos emitidos (bus de UI, fraco acoplamento):** `stage_selected`,
`stage_started`, `stage_completed`, `stage_unlocked`, `chapter_completed`,
`chapter_unlocked`, `boss_defeated`, `campaign_progress_changed`.

## MVP (aceite)

1 capítulo desbloqueado (cap. 1), 20 estágios + 1 boss; 1-1 desbloqueado e os
demais bloqueados; completar desbloqueia o próximo; boss desbloqueia após 1-19;
replay liberado em concluídos; estrelas (1–3) por vitória com sobrevivência;
scroll + auto-center; sem resolução fixa. Capítulos 2–12 já navegáveis quando
desbloqueados (mesma infraestrutura).
