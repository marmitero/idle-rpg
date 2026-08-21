# Triagem do pacote de assets

**Recebido em:** 2026-08-20  
**Origem:** `origin/main` (82 PNGs soltos na raiz)  
**Responsável:** arte  
**Decisão:** **Absorver como estilo oficial** → Art Bible v1.1

## Inventário bruto

| Família | Qtd | Resolução | Destino canônico |
| --- | --- | --- | --- |
| `portrait_*` heróis | 6 | 512×512 RGBA | `characters/bust` (+ icon 256 gerado) |
| `portrait_boss_*` | 3 | 512×512 RGBA | `enemies` |
| `frame_*` | 3 | 256×256 | `ui/kit` (rare / elite / relic) |
| `ui_*` chrome | 7 | 256×256 | `ui/kit` |
| `icon_equip_*` | 8 | 256×256 | `ui/icons/equip` (faltava armor t2) |
| `icon_stat_*` | 4 | 256×256 | `ui/icons/stats` |
| `icon_ui_*` | 26 | 256×256 | `ui/icons/hud` |
| `icon_raid_*` | 6 | 256×256 | `ui/icons/raid` |
| moedas gold/silver/gem/xp | 4 | 256×256 | `ui/icons/currency` |
| materiais | 15 | 256×256 | `ui/icons/materials` |
| **Total original** | **82** | | |

## Leitura de estilo

- **Linha:** contorno escuro grosso, 4–8 px aparentes no 512.
- **Escola:** *HD pixel / pixel ilustrado* (não 16×16 tile, não Live2D, não vitral AFK).
- **Pintura:** cel + dither fino, paleta limitada, metal com rebites.
- **UI:** ouro filigranado sobre fill `#1B1F3A`–navy, cantos em losango / gema.
- **Raridade:** azul = raro, roxo = épico, ouro = lendário.
- **Retratos:** bustos de classe clássica (guerreiro, mago, arqueira, ladino, clériga, guardião).
- **Bosses:** Rei Goblin, Wyrm de cinza, Hidra pálida — fantasy clássica, serve Vaelith sem ninja.
- **Duas famílias de ícone:** (A) item ilustrado (espada, osso, coração de magma); (B) HUD chapado (bigorna, bandeira, coração HP).
- **Sheets de batalha:** não.
- **Áudio / fontes / cenários:** não.

## Decisão

- [x] Absorver como estilo oficial → Art Bible v1.1
- [ ] Absorver só como referência
- [ ] Rejeitar

## Complementos desta rodada

Gerados no mesmo padrão (ver `CATALOG.md`): armor t2, frame common, Letters / Fate / Dust / Wake chest, 4 brasões de facção core, ATK/SPD.

Ainda faltam (próxima leva de arte): Solstice, Nadir, HUD Guild/Font, hub, biomas, sprites de batalha, logo, áudio.
