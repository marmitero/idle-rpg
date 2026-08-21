# 06 — UI Interaction Spec

**Status:** v1 (2026-08-21) · Implementado em `gameUI.tsx` + `global.css`

## WorldObject (destinos + Fonte)

| Evento | Feedback |
| --- | --- |
| idle | flutuação sutil (±4px, 2.6s) — sensação de mundo vivo |
| pointerenter (mouse) | `scale 1.05` + glow dourado (transição 150ms) |
| pointerdown | `scale 0.95` (press) |
| pointerup/click | ação (abre painel/coleta) + `playSfx("ui")` |
| locked (futuro) | dessaturado + cadeado |

## Coleta de Wake (microinteração de recompensa)

```
touch na Fonte → objeto reage (press) → burst de 6 sparkles
(rw_vfx_sparkle, direções aleatórias via CSS) → playSfx("collect")
→ contador de ouro no HUD pisca (gold)
```

## NavSigil

ativo: ícone com glow dourado + label em gold + elevação 2px; inativo:
opacidade 0.65; press: scale 0.92.

## Painel/botão (pele global)

`.cta`: fundo = `rw_ui_button`; `:active` = `rw_ui_button_press` (troca de
asset, não de cor CSS). Disabled: dessaturação + sem press.

## Acessibilidade

Estados nunca dependem só de cor (label + cadeado + estrelas); contraste dos
números sobre a placa escura preservado; alvos ≥ 44px; `aria-label` nos
objetos do mundo.
