# 07 — Asset Production Guide

**Status:** v1 (2026-08-21) · Regras: docs/13-regras-de-geracao.md,
referencias/README.md, docs/10-pipeline-assets.md

## Ficha padrão de asset de UI

```text
Nome:        rw_obj_hub_tower.png
Função:      objeto interativo do hub (abre Torre)
Dimensão:    ~1024px (master); render ~96-150px
Formato:     master PNG fundo #FF00FF → final RGBA (remove_bg.py)
Transparência: final com alfa (fundo removido)
Anchor:      centro (objetos); canto (placas 9-slice)
Estados:     normal (agora); hover/press = CSS; *_press/_locked futuros
Animações:   flutuação/pulso (CSS); partículas separadas
Área segura: 8% de margem interna no sprite
Área interativa: >= 48px (pode exceder o sprite)
```

## Pipeline

1. Gerar em `referencias/ui/world/…` (fundo `#FF00FF` chapado, sem magenta
   no sujeito, sem texto).
2. `python3 tools/asset-pipeline/remove_bg.py --src … --out assets/…`.
3. `npm run assets:check`.
4. Registrar no `assets/GENERATION.md` e no manifesto (docs/03).

## Plates (exceção)

Plates full-bleed (ex.: `rw_env_hub_plaza`) **não** levam magenta: são o
fundo; entram direto em `assets/environments/…` (regra do lote-05).
Sem texto/UI/lock no plate — os elementos interativos são recortes separados.

## Naming

`rw_{disciplina}_{id}_{variant}_{size}.png` — objetos do mundo:
`rw_obj_hub_{id}.png`; VFX: `rw_vfx_{id}.png`; kit: `rw_ui_{id}.png`.
