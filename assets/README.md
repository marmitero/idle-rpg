# Assets — Relicwake

Leia primeiro: [`CATALOG.md`](CATALOG.md), [`docs/10-pipeline-assets.md`](../docs/10-pipeline-assets.md), [`docs/05-art-bible.md`](../docs/05-art-bible.md), [`docs/12-responsividade.md`](../docs/12-responsividade.md).

Estilo oficial: HD pixel ilustrado, UI ouro/navy. Pacote absorvido em 2026-08-20.

| Pasta | O que vive aqui |
| --- | --- |
| `_inbox/` | Pacote cru do cliente |
| `raw/` | Fontes editáveis |
| `characters/` | Heróis (splash, bust, icon, battle, cut-in) |
| `enemies/` | Inimigos e bosses |
| `ui/` | Kit, ícones, HUD, fontes |
| `environments/` | Hub, biomas, hunts, guilda |
| `vfx/` | Skill e ultimate |
| `audio/` | Música, SFX, VO |
| `marketing/` | Key art, store, trailer stills |
| `generated/` | Atlases (CI) |

`assets/` guarda **finais prontos** (fundo removido). Masters de geração com
fundo magenta `#FF00FF` vivem em [`referencias/`](../referencias/README.md),
na mesma taxonomia. Fluxo: `npm run assets:finalize` + `npm run assets:check`.
