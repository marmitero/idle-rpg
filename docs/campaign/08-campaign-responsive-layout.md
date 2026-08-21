# 08 — Campaign Responsive Layout

**Status:** v1 (2026-08-21) · **Arquivos:** `controller.ts` (MapRect/foco),
`CampaignMap.tsx` (CSS)

## Posições normalizadas (REGRA: sem resolução fixa)

- Dados: `position = { x, y }` com `0.0..1.0` (docs/02).
- Conversão em camadas:

```text
Normalized Position → MapRect (tamanho lógico do mapa) → Screen Position
```

```ts
mapRect = { w: max(containerW, 560), h: max(containerH, 900) };
screenX = position.x * mapRect.w;  screenY = position.y * mapRect.h;
```

- A área rolável é `mapRect`; o container clippa e rola (overflow: auto).
- Resultado: mesma composição em 16:9, 18:9, 19.5:9, 20:9, tablets e web.

## Câmera / scroll

- Scroll vertical e horizontal quando o mapa excede a tela.
- **Auto-center ao abrir:** `focusOnStage(currentStageId)` localiza o nó
  (`data-node-id`), calcula `scrollTo = nodeCenter − containerCenter`, aplica
  suave (inicial: instantâneo) e respeita limites do scroll.
- **Após vitória:** foca o novo estágio corrente (smooth).
- Zoom: fora do MVP (arquitetura aceita — foco/scroll independem).

## Safe area

- O mapa ocupa a área disponível entre topbar e nav (shell existente).
- Elementos críticos (header do capítulo, seletor, painel de info) ficam
  **fora** da área rolável ou ancorados com padding — nunca atrás de notch/
  barras do sistema.
- Reusa o padrão do shell (`apps/web/src/ui/global.css`, docs/12-responsividade.md).

## Perf

- Nós e paths são construídos **uma vez** por mudança de capítulo/progresso
  (React memo); nada roda por frame.
- Um capítulo por vez renderizado (≤21 nós) — 12 capítulos virtuais.
- Sem lógica de campanha dentro de loops de render; o cálculo de estados é
  puro e roda só quando o progresso muda.
