# 07 — Campaign Asset Spec

**Status:** v1 (2026-08-21) · **Regras gerais:** docs/10-pipeline-assets.md,
docs/13-regras-de-geracao.md, referencias/README.md

## Separação background × sistema (REGRA 4)

O background do mapa é um **asset independente** e **nunca** contém:
números de estágio, cadeados, estrelas, botões, textos ou qualquer elemento
interativo. Tudo isso é renderizado pelo sistema (nós/overlay).

## Inventário

| Asset | Origem atual | Estado |
| --- | --- | --- |
| Map background por capítulo | plates de bioma existentes (`rw_env_battle_*`) + overlay escuro de leitura | MVP (reuso) |
| Plate dedicado de mapa por capítulo (estilo "mapa" com trilha) | a produzir — masters em `referencias/environments/campaign/`, finais em `assets/` | futuro |
| Stage node (normal) | componente DOM + CSS (chrome ouro/navy da Art Bible) | pronto |
| Elite node | componente DOM com acento rosa (`wake.rose`) | pronto |
| Boss node | componente DOM grande + 👑 + moldura | pronto (substituível por arte) |
| Cadeado 🔒 / estrelas ★ / coroa | glyphs do sistema | pronto |
| Paths | SVG gerado (traço, cor e espessura por estado) | pronto |
| Chapter marker/selector | DOM + CSS | pronto |
| Marcadores de recompensa | ícones existentes (`rw_hud_*`, `rw_currency_*`) | pronto |
| Animações (pulso do current, brilho de unlock) | CSS keyframes | pronto |
| VFX de conclusão de capítulo | a produzir | futuro |

## Diretrizes para a arte futura do mapa

- **Plate limpo** (sem UI): serve qualquer configuração de campanha — mudar
  posições/nós não exige reexportar o background.
- Paleta por capítulo (facção/bioma — Art Bible §paleta mestra): o plate deve
  manter a leitura dos nós (contraste) — overlay de escurecimento é do sistema,
  não da arte.
- Formatos: masters magenta `#FF00FF` quando houver recorte (ex.: elementos
  decorativos separados); plates full-bleed **sem** magenta (regra dos plates).
- Dimensões: o sistema usa coordenadas normalizadas — qualquer proporção serve,
  mas o alvo é ~9:16 (portrait, mesma família dos plates atuais).

## Sons

- `stage_selected` → reusa `ui` (tick); `stage_started` → cama de batalha já
  existente; `stage_completed`/`chapter_completed`/`boss_defeated` → reusam
  `win` (e, no futuro, jingle dedicado do pacote CC0 — docs/16 §3).
