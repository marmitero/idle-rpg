# 04 — Campaign Map UI Spec

**Status:** v1 (2026-08-21) · **Arquivos:** `apps/web/src/ui/campaign/*`

## Componentes

| Componente | Responsabilidade |
| --- | --- |
| `CampaignMap` | renderer raiz: fundo do capítulo, camada de paths (SVG), nós, header, seletor de capítulos, foco |
| `StageNode` | nó de estágio (normal/elite): número, cadeado, estrelas, destaque |
| `BossNode` | nó de boss: visual próprio (maior, 👑, moldura), conexão especial |
| `ChapterMarker` | rótulo do capítulo (número + título) acima do mapa |
| `StagePath` | segmento SVG entre nós; estilo por estado (concluído/ativo/bloqueado/boss) |
| `StageInfoPanel` | painel contextual: título, descrição, estrelas, recompensas, PLAY/FIGHT/CLOSE; variante bloqueada (requisito) e variante boss (poder recomendado) |
| `controller.ts` | hook: estado do mapa, seleção, eventos, `focusOnStage` |
| `events.ts` | bus tipado de eventos de campanha |

## Camadas de render (ordem z)

```text
1. background do capítulo (plate do bioma, cover, escurecido p/ leitura)
2. paths (SVG, sob os nós)
3. nós (StageNode/BossNode) com posições normalizadas
4. header/seletor de capítulos (fora da área rolável)
5. StageInfoPanel (overlay inferior do mapa)
```

## Estados visuais dos nós

| Estado | Visual |
| --- | --- |
| `locked` | escurecido, 🔒, sem interação de gameplay (só painel de requisito) |
| `unlocked` | ativo, borda sóbria, selecionável |
| `current` | destaque âmbar + pulso sutil (CSS), é o próximo objetivo |
| `completed` | borda ouro + estrelas obtidas (★☆☆…★★★) |
| `perfect` | ouro forte + 3 estrelas cheias |
| `boss` | nó grande com 👑 e moldura de boss |
| `boss_locked` | nó de boss escurecido + 🔒 |
| `elite` (mini-boss) | nó médio com acento rosa (rose da paleta) |

## Paths (estilo por estado do destino)

| Estado | Estilo |
| --- | --- |
| destino `completed` | traço contínuo dourado |
| destino `current`/`unlocked` | traço contínuo teal |
| destino `locked` | tracejado escuro |
| destino `boss`/`boss_locked` | traço mais grosso + marcador de coroa no fim |

## Painel de informação

- **Normal (unlocked/current):** `STAGE 1-3` · título · estrelas (máx.) ·
  recompensas (`+X ouro · Wake Y/h`) · botão **PLAY** · CLOSE.
- **Concluído:** estrelas obtidas + botão **REPLAY** (permitido).
- **Bloqueado:** cadeado + requisito legível ("Complete 1-4 para desbloquear").
- **Boss:** título do boss, **PODER RECOMENDADO ≈ N** (heurística de exibição:
  Σ hp + atk×10 dos inimigos escalados — aproximação, não fórmula de combate),
  botão **FIGHT**.

## Estrelas/medalhas

Sistema configurável: `settings.starSystem = "stars"` (3 max). Nó concluído
mostra as estrelas do progresso; o painel mostra máx. obtido. Se no futuro
`starSystem = "none"`, os componentes param de renderizar estrelas (dados, não
código).

## Acessibilidade/UX

- Toque alvo dos nós ≥ 40px; área de interação maior que o visual do nó.
- Painel fecha com CLOSE, troca de capítulo ou toque fora (MVP: CLOSE + troca).
- Nenhum elemento crítico atrás de safe areas (docs/08).
