# 02 — Game UI Design System

**Status:** v1 (2026-08-21) · **Arquivos:** `apps/web/src/ui/gameUI.tsx`,
`apps/web/src/ui/global.css`, `packages/content/src/uiRegistry.ts`

## Componentes

| Componente | O que é | Asset(s) |
| --- | --- | --- |
| `WorldObject` | objeto interativo do mundo (destino do hub, Fonte) | `rw_obj_hub_*` (sprite), rótulo em placa |
| `ResourceCounter` | recurso do HUD: ícone + número sobre placa | `rw_currency_*` + `rw_ui_plate_counter` |
| `WakeBar` | progresso de Wake sob a Fonte | `rw_ui_bar_bg` + `rw_ui_bar_fill` |
| `NoticeBoard` | ofício do dia (contêiner diegético) | `rw_obj_hub_daily` (fundo) |
| `.panel` (pele global) | painéis de conteúdo restantes | `rw_ui_panel_ornate` (border-image) |
| `.cta` (pele global) | botões de ação | `rw_ui_button` / `rw_ui_button_press` |
| `NavSigil` | aba inferior | `rw_hud_*` (ícones próprios) |

## Estados (INTERACTIVE OBJECT)

```text
Normal → Hover (desktop) → Pressed → Active/Locked
```

- **Normal:** sprite em escala base, flutuação sutil (idle).
- **Hover (mouse):** scale 1.05 + glow suave (filter + sombra dourada).
- **Pressed (touch/click):** scale 0.95 (asset pode trocar no futuro:
  `*_press.png`).
- **Active:** sigil/borda dourada + label destacado.
- **Locked:** dessaturado + cadeado (asset `*_locked` futuro).
- `prefers-reduced-motion: reduce` desliga flutuação/pulso.

## RESOURCE

```text
Ícone + Contador + (Gain/Spend feedback)
```

Ganho: partícula (`rw_vfx_sparkle`) voando para o contador + número pisca.
Gasto: número pisca em rose.

## WORLD DESTINATION

```text
Sprite + Label(placa) + State + Interaction + Feedback
```

Dados em `HUB_WORLD` (registry): id, painel, label i18n, asset, posição
normalizada, tamanho, área de toque — mudar asset/posição/label é dado.

## Tipografia

Segue o projeto (system + Atkinson Hyperlegible). Papéis: título (caps,
dourado), label de objeto (pequena, caps), contador (numérico), muted
(secundário), feedback (gold/rose).

## Camadas (z)

0 Background · 1 Environment · 2 Decorations · 3 World Objects ·
4 Characters/Effects · 5 HUD · 6 Feedback temporário · 7 System UI.

## Microinterações

coletar (burst de sparkles + contador), desbloquear (pulso dourado no nó),
abrir destino (press do objeto), navegar (sigil acende), recompensa
(brilho no botão de coleta).
