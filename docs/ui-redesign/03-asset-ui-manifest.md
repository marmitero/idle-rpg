# 03 — Asset UI Manifest

**Status:** v1 (2026-08-21) · Lote de produção: `lote-ui-01` (ver
`assets/GENERATION.md`). Masters em `referencias/`, finais em `assets/`.

## HUD

```
resources/
├── gold      rw_currency_gold.png         (existe)
├── letters   rw_currency_letters.png      (existe)
├── dust      rw_currency_dust.png         (existe)
└── plate     rw_ui_plate_counter.png      (novo — placa de contador)
```

## DESTINATIONS / WORLD OBJECTS (novos, lote-ui-01)

```
world/
├── rw_obj_hub_tower.png    torre do Spire (objeto interativo)
├── rw_obj_hub_font.png     a Fonte (coleta de Wake)
├── rw_obj_hub_arena.png    portal da Arena
├── rw_obj_hub_honor.png    estátua do Honor
├── rw_obj_hub_mail.png     poste de cartas (mail)
├── rw_obj_hub_pass.png     quadro do emissário (passe/eventos)
└── rw_obj_hub_daily.png    quadro do ofício do dia
```

## INTERACTION / FEEDBACK

```
fx/
├── rw_vfx_sparkle.png      partícula de coleta (novo)
├── hover  — CSS (scale+glow); pressed — CSS (scale) ou asset *_press futuro
└── unlock_fx / reward_fx   CSS (pulso dourado) — asset dedicado futuro
```

## ENVIRONMENT

```
environments/hub/
└── rw_env_hub_plaza.png    praça do hub (plate novo, full-bleed, sem magenta)
```

## NAVIGATION (existentes — KEEP)

`rw_hud_home / hero / spire / guild / settings` (sigils das abas).

## KIT (existentes — passam a ser usados como pele)

`rw_ui_panel_ornate`, `rw_ui_button(_press)`, `rw_ui_bar_bg(_fill)`,
`rw_ui_header_cartouche`, frames de raridade.

## Placeholders — classificação (§29)

| Item | Veredito |
| --- | --- |
| Nav icons / currency icons | KEEP |
| hero-bg (placa antiga do hub) | REPLACE → `rw_env_hub_plaza` |
| Destinos `grid3` de botões genéricos | REMOVE → world objects |
| `.cta` gradiente CSS | REPLACE → asset `rw_ui_button` |
| `.panel` borda CSS | REPLACE → asset `rw_ui_panel_ornate` |
| Bustos emprestados no roster | REWORK (fila de arte, lotes futuros — fora do escopo) |
