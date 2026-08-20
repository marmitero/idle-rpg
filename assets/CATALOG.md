# Catálogo de assets

Masters originais (nome do pacote) ficam em `assets/raw/` e na inbox.  
Runtime usa o prefixo `rw_`.

## Heróis (slice)

| Original | Canônico | Facção proposta | Classe Relicwake |
| --- | --- | --- | --- |
| `portrait_warrior` | `rw_hero_warrior_*` | Embercourt | Striker |
| `portrait_guardian` | `rw_hero_guardian_*` | Embercourt | Vanguard |
| `portrait_mage` | `rw_hero_mage_*` | Tidebound | Channeler |
| `portrait_archer` | `rw_hero_archer_*` | Thornveil | Striker |
| `portrait_rogue` | `rw_hero_rogue_*` | Ashen Choir | Striker |
| `portrait_cleric` | `rw_hero_cleric_*` | Solstice | Seer |

Peças: `bust_512` (pack) · `icon_256` (downscale do bust).  
Faltam: splash 2048, battle sheet, cut-in, 22 heróis restantes do 1.0.

## Chefes

| Original | Canônico | Uso |
| --- | --- | --- |
| `portrait_boss_goblin_king` | `rw_enemy_boss_goblin_king_*` | Hunt / cap. cedo |
| `portrait_boss_ash_wyrm` | `rw_enemy_boss_ash_wyrm_*` | Emberworks / raid |
| `portrait_boss_pale_hydra` | `rw_enemy_boss_pale_hydra_*` | Tidevault / raid |

## Frames de raridade

| Original | Canônico | Raridade |
| --- | --- | --- |
| — | `rw_ui_frame_common_256` | Common *(complemento)* |
| `frame_raro` | `rw_ui_frame_rare_256` | Rare |
| `frame_epico` | `rw_ui_frame_elite_256` | Elite |
| `frame_lendario` | `rw_ui_frame_relic_256` | Relic |
| — | myth/apex | *falta* |

## Chrome UI

`rw_ui_button(_press)`, `bar_bg`, `bar_fill`, `panel_ornate`, `header_cartouche`, `corner_gem`.

9-slice: [responsividade §6](../docs/12-responsividade.md).

## Economia e itens

Moedas pack: gold, silver, gem, xp.  
Complemento: `letters`, `fate`, `dust`, `wake_chest`.

Equip t1–t3: weapon, armor *(t2 complemento)*, accessory.  
Materiais e `raid_*` mapeiam 1:1 para hunts (goblin, wyrm, hydra, generic).

## HUD

26 ícones `rw_hud_*` (home, hero, raid, forge, mine, settings, collect…).  
Mapeamento de nav 1.0:

| Destino | Ícone atual | Nota |
| --- | --- | --- |
| Hub | `rw_hud_home` | ok (bigorna — trocar se o hub não for forja) |
| Roster | `rw_hud_hero` | ok |
| Battle / Spire | `rw_hud_area` / `raid` | decidir no UI kit |
| Guild | — | **falta** |
| Menu | `rw_hud_settings` | ok |
| Font | — | **falta** (usar `fuse` temporário) |

## Facções

Core geradas: Embercourt, Tidebound, Thornveil, Ashen.  
Raras: Solstice, Nadir — **faltam**.

## Stats

Pack: hp, def, crit, for.  
Complemento: atk, spd.

## Buracos do 1.0 (não inventar no código)

- 0 ambientes (hub, 6 biomas, 4 hunts, hall)
- 0 sprites de batalha / VFX
- 0 áudio
- 0 logo / key art
- 0 fontes licenciadas
- 22 heróis
- 9-slice JSON calibrado visualmente
