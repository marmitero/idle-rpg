# Fila de geração

Regra: **10 por lote**. Fundo: **`#FF00FF`**. Spec: [`docs/13-regras-de-geracao.md`](../docs/13-regras-de-geracao.md).

**Saída do gerador:** master em `referencias/<taxonomia>` → `npm run assets:finalize` escreve o final transparente em `assets/<taxonomia>`. O jogo nunca processa imagem em runtime (chroma removido em 2026-08-21).

## lote-01 (passado)

Complementos sem a regra do magenta (armor t2, frame common, 4 moedas, 4 facções core).  
Reexportar em lote futuro se o chroma for necessário nesses arquivos.

## lote-02 (feito) — cutouts do slice, fundo `#FF00FF`

| # | Arquivo | Tipo |
| --- | --- | --- |
| 1 | `ui/icons/factions/rw_faction_solstice.png` | brasão raro |
| 2 | `ui/icons/factions/rw_faction_nadir.png` | brasão raro |
| 3 | `ui/icons/hud/rw_hud_guild.png` | nav |
| 4 | `ui/icons/hud/rw_hud_font.png` | nav |
| 5 | `marketing/rw_brand_logo.png` | logo |
| 6 | `ui/kit/rw_ui_frame_mythic_256.png` | raridade |
| 7 | `characters/battle/rw_hero_warrior_idle.png` | sprite |
| 8 | `characters/battle/rw_hero_mage_idle.png` | sprite |
| 9 | `characters/battle/rw_hero_archer_idle.png` | sprite |
| 10 | `characters/battle/rw_hero_guardian_idle.png` | sprite |

## lote-03 (feito, 9/10) — fundo `#FF00FF`

| # | Arquivo | Tipo |
| --- | --- | --- |
| 1 | `characters/battle/rw_hero_rogue_idle.png` | sprite |
| 2 | `characters/battle/rw_hero_cleric_idle.png` | sprite |
| 3 | `enemies/rw_enemy_boss_goblin_king_idle.png` | sprite |
| 4 | `enemies/rw_enemy_boss_ash_wyrm_idle.png` | sprite |
| 5 | hidra idle | **falhou** (limite da sessão) → lote-04 |
| 6 | `ui/icons/hud/rw_hud_spire.png` | nav |
| 7 | `ui/icons/directives/rw_directive_foco.png` | diretiva |
| 8 | `ui/icons/directives/rw_directive_guarda.png` | diretiva |
| 9 | `ui/icons/directives/rw_directive_execute.png` | diretiva |
| 10 | `ui/icons/directives/rw_directive_mare.png` | diretiva |

## lote-04 (feito) — fundo `#FF00FF`

| # | Arquivo | Tipo |
| --- | --- | --- |
| 1 | `enemies/rw_enemy_boss_pale_hydra_idle.png` | sprite |
| 2 | `ui/icons/directives/rw_directive_pacto.png` | diretiva |
| 3 | `ui/icons/directives/rw_directive_cisma.png` | diretiva |
| 4 | `ui/icons/skills/rw_skill_warrior_ult.png` | ultimate |
| 5 | `ui/icons/skills/rw_skill_guardian_ult.png` | ultimate |
| 6 | `ui/icons/skills/rw_skill_mage_ult.png` | ultimate |
| 7 | `ui/icons/skills/rw_skill_archer_ult.png` | ultimate |
| 8 | `ui/icons/skills/rw_skill_rogue_ult.png` | ultimate |
| 9 | `ui/icons/skills/rw_skill_cleric_ult.png` | ultimate |
| 10 | `vfx/rw_vfx_hit_slash.png` | VFX |

## lote-05 (feito) — plates, SEM magenta

| # | Arquivo | Cena |
| --- | --- | --- |
| 1 | `environments/hub/rw_env_hub_spire.png` | hub |
| 2 | `environments/biomes/rw_env_battle_spire_base.png` | batalha cap. 1 |
| 3 | `environments/guild/rw_env_guild_hall.png` | hall |
| 4 | `environments/hub/rw_env_font.png` | Font |
| 5 | `environments/biomes/rw_env_battle_emberworks.png` | Emberworks |
| 6 | `environments/biomes/rw_env_battle_tidevault.png` | Tidevault |
| 7 | `environments/biomes/rw_env_battle_thorn.png` | Thorn Causeway |
| 8 | `environments/hunts/rw_env_hunt_goblin.png` | hunt goblin |
| 9 | `environments/hunts/rw_env_hunt_wyrm.png` | hunt wyrm |
| 10 | `environments/hunts/rw_env_hunt_hydra.png` | hunt hidra |

## lote-06 (feito)

| # | Arquivo | Tipo |
| --- | --- | --- |
| 1 | `environments/biomes/rw_env_battle_ash.png` | plate (sem magenta) |
| 2 | `environments/biomes/rw_env_battle_crown.png` | plate (sem magenta) |
| 3–8 | `ui/icons/skills/rw_skill_*_cmd.png` | comando dos 6 |
| 9 | `characters/battle/rw_hero_warrior_atk.png` | clip atk |
| 10 | `vfx/rw_vfx_heal.png` | VFX |

## lote-07 (feito) — fundo `#FF00FF`

| # | Arquivo | Tipo |
| --- | --- | --- |
| 1–6 | `ui/icons/skills/rw_skill_*_pas.png` | passiva dos 6 |
| 7 | `characters/battle/rw_hero_guardian_atk.png` | atk |
| 8 | `characters/battle/rw_hero_mage_atk.png` | atk |
| 9 | `characters/battle/rw_hero_archer_atk.png` | atk |
| 10 | `characters/battle/rw_hero_rogue_atk.png` | atk |

## lote-08 (feito) — fundo `#FF00FF`

| # | Arquivo | Tipo |
| --- | --- | --- |
| 1 | `characters/battle/rw_hero_cleric_atk.png` | atk |
| 2–7 | `characters/battle/rw_hero_*_hit.png` | hit dos 6 |
| 8 | `enemies/rw_enemy_boss_goblin_king_atk.png` | boss atk |
| 9 | `enemies/rw_enemy_boss_ash_wyrm_atk.png` | boss atk |
| 10 | `enemies/rw_enemy_boss_pale_hydra_atk.png` | boss atk |

## lote-09 (feito) — fundo `#FF00FF`

| # | Arquivo | Tipo |
| --- | --- | --- |
| 1–6 | `characters/battle/rw_hero_*_die.png` | die dos 6 |
| 7 | `enemies/rw_enemy_boss_goblin_king_hit.png` | boss hit |
| 8 | `enemies/rw_enemy_boss_ash_wyrm_hit.png` | boss hit |
| 9 | `enemies/rw_enemy_boss_pale_hydra_hit.png` | boss hit |
| 10 | `enemies/rw_enemy_boss_goblin_king_die.png` | boss die |

## lote-10 (feito) — fundo `#FF00FF`

| # | Arquivo | Tipo |
| --- | --- | --- |
| 1 | `enemies/rw_enemy_boss_ash_wyrm_die.png` | boss die |
| 2 | `enemies/rw_enemy_boss_pale_hydra_die.png` | boss die |
| 3 | `characters/battle/rw_hero_warrior_ult.png` | ult pose *(retomado)* |
| 4 | `characters/battle/rw_hero_guardian_ult.png` | ult pose |
| 5 | `characters/battle/rw_hero_mage_ult.png` | ult pose |
| 6 | `characters/battle/rw_hero_archer_ult.png` | ult pose |
| 7 | `characters/battle/rw_hero_rogue_ult.png` | ult pose |
| 8 | `characters/battle/rw_hero_cleric_ult.png` | ult pose |
| 9 | `vfx/rw_vfx_ember.png` | VFX facção |
| 10 | `vfx/rw_vfx_tide.png` | VFX facção |

## lote-11 (feito, 5/10 — fecha a etapa) — fundo `#FF00FF`

| # | Arquivo | Tipo |
| --- | --- | --- |
| 1 | `characters/battle/rw_hero_warrior_ult.png` | já no lote-10 retomado |
| 2 | `vfx/rw_vfx_thorn.png` | VFX facção |
| 3 | `vfx/rw_vfx_ashen.png` | VFX facção |
| 4 | `vfx/rw_vfx_solstice.png` | VFX facção |
| 5 | `vfx/rw_vfx_nadir.png` | VFX facção |

Slice de combate (idle/atk/hit/die/ult + VFX das 6 facções) **fechado**.

## lote-12 (feito) — fundo `#FF00FF` — onda roster 1/3 (bustos)

Primeiros 10 heróis placeholder (bust 512; ícone = cópia). Battle clips ainda emprestados.

| # | Arquivo | Herói |
| --- | --- | --- |
| 1 | `characters/bust/rw_hero_ember_bril_bust_512.png` | Bril |
| 2 | `characters/bust/rw_hero_ember_sora_bust_512.png` | Sora |
| 3 | `characters/bust/rw_hero_ember_durn_bust_512.png` | Durn |
| 4 | `characters/bust/rw_hero_ember_hest_bust_512.png` | Hest |
| 5 | `characters/bust/rw_hero_tide_nera_bust_512.png` | Nera |
| 6 | `characters/bust/rw_hero_tide_luth_bust_512.png` | Luth |
| 7 | `characters/bust/rw_hero_tide_cale_bust_512.png` | Cale |
| 8 | `characters/bust/rw_hero_tide_ivo_bust_512.png` | Ivo |
| 9 | `characters/bust/rw_hero_tide_sem_bust_512.png` | Sem |
| 10 | `characters/bust/rw_hero_thorn_bramble_bust_512.png` | Bramble |

**Próximo lote-13:** bustos Tess, Quin, Ashleaf, Yew, Choir, Dust, Hymn, Cinder, Veil, Helion.

## lote-13 (feito) — fundo `#FF00FF` — onda roster 2/3 (bustos)

| # | Arquivo | Herói |
| --- | --- | --- |
| 1 | `characters/bust/rw_hero_thorn_tess_bust_512.png` | Tess |
| 2 | `characters/bust/rw_hero_thorn_quin_bust_512.png` | Quin |
| 3 | `characters/bust/rw_hero_thorn_ashleaf_bust_512.png` | Ashleaf |
| 4 | `characters/bust/rw_hero_thorn_yew_bust_512.png` | Yew |
| 5 | `characters/bust/rw_hero_ashen_choir_bust_512.png` | Choir |
| 6 | `characters/bust/rw_hero_ashen_dust_bust_512.png` | Dust |
| 7 | `characters/bust/rw_hero_ashen_hymn_bust_512.png` | Hymn |
| 8 | `characters/bust/rw_hero_ashen_cinder_bust_512.png` | Cinder |
| 9 | `characters/bust/rw_hero_ashen_veil_bust_512.png` | Veil |
| 10 | `characters/bust/rw_hero_solstice_helion_bust_512.png` | Helion |

**Próximo lote-14:** bustos Umbral + Rift (Nadir) e 8 idle/atk dos novos (ou 8 bustos já feitos não). Só restam 2 bustos; completar Nadir e começar sprites idle.

## lote-14 (feito, 9/10) — fundo `#FF00FF` — fecha Nadir (parcial) + 8 idle

| # | Arquivo | Tipo |
| --- | --- | --- |
| 1 | `characters/bust/rw_hero_nadir_umbral_bust_512.png` | Umbral |
| 2 | `characters/bust/rw_hero_nadir_rift_bust_512.png` | **falhou** (erro de geração + teto 10) → lote-15 |
| 3 | `characters/battle/rw_hero_ember_bril_idle.png` | idle Bril |
| 4 | `characters/battle/rw_hero_ember_sora_idle.png` | idle Sora |
| 5 | `characters/battle/rw_hero_ember_durn_idle.png` | idle Durn |
| 6 | `characters/battle/rw_hero_ember_hest_idle.png` | idle Hest |
| 7 | `characters/battle/rw_hero_tide_nera_idle.png` | idle Nera |
| 8 | `characters/battle/rw_hero_tide_luth_idle.png` | idle Luth |
| 9 | `characters/battle/rw_hero_tide_cale_idle.png` | idle Cale |
| 10 | `characters/battle/rw_hero_tide_ivo_idle.png` | idle Ivo |

Wiring: `ownIdle()` para os 8 Ember/Tide; `ownBust` Helion (atrasado do lote-13) + Umbral. Rift ainda kit da classe.

## lote-15 (feito, 10/10) — fundo `#FF00FF` — fecha os bustos + onda 3 de idle

| # | Arquivo | Tipo |
| --- | --- | --- |
| 1 | `characters/bust/rw_hero_nadir_rift_bust_512.png` | busto Rift *(retomado do lote-14)* |
| 2 | `characters/battle/rw_hero_tide_sem_idle.png` | idle Sem |
| 3 | `characters/battle/rw_hero_thorn_bramble_idle.png` | idle Bramble |
| 4 | `characters/battle/rw_hero_thorn_tess_idle.png` | idle Tess |
| 5 | `characters/battle/rw_hero_thorn_quin_idle.png` | idle Quin |
| 6 | `characters/battle/rw_hero_thorn_ashleaf_idle.png` | idle Ashleaf |
| 7 | `characters/battle/rw_hero_thorn_yew_idle.png` | idle Yew |
| 8 | `characters/battle/rw_hero_ashen_choir_idle.png` | idle Choir |
| 9 | `characters/battle/rw_hero_ashen_dust_idle.png` | idle Dust |
| 10 | `characters/battle/rw_hero_ashen_hymn_idle.png` | idle Hymn |

Wiring: `ownBust("nadir_rift", KIT.guardian)` (Rift sai do kit caído — ver nota) e `ownIdle()` para os 9. Ícone do Rift = cópia do busto (convenção lotes 12–13).

Nota (2026-08-21, reorganização): o busto do Rift foi **regenerado** — o primeiro
master tinha sido perfurado pelo chroma global do pipeline antigo (6.195 recortes
internos). Novo pipeline `remove_bg.py` (flood de borda, sem kill por cor) substitui
`chroma_magenta.py`; masters vivem em `referencias/`, finais transparentes em `assets/`.

## lote-16 (feito, 10/10) — fundo `#FF00FF` — fecha os idles + abre os atk

| # | Arquivo | Tipo |
| --- | --- | --- |
| 1 | `characters/battle/rw_hero_ashen_cinder_idle.png` | idle Cinder |
| 2 | `characters/battle/rw_hero_ashen_veil_idle.png` | idle Veil |
| 3 | `characters/battle/rw_hero_solstice_helion_idle.png` | idle Helion |
| 4 | `characters/battle/rw_hero_nadir_umbral_idle.png` | idle Umbral |
| 5 | `characters/battle/rw_hero_nadir_rift_idle.png` | idle Rift |
| 6 | `characters/battle/rw_hero_tide_sem_atk.png` | atk Sem |
| 7 | `characters/battle/rw_hero_thorn_bramble_atk.png` | atk Bramble |
| 8 | `characters/battle/rw_hero_thorn_tess_atk.png` | atk Tess |
| 9 | `characters/battle/rw_hero_thorn_quin_atk.png` | atk Quin |
| 10 | `characters/battle/rw_hero_thorn_ashleaf_atk.png` | atk Ashleaf |

Wiring: `ownIdle()` nos 5 que faltavam (**idles 22/22 fechados**); novo helper `ownAtk()` ligado nos 5 primeiros (Sem, Bramble, Tess, Quin, Ashleaf) — **atk próprios 11/28** (6 slice + 5). Helion/Quin/Ashleaf/Sem tiveram padding magenta 100px (pose encostava na borda).

**Próximo lote-17:** 10 atk restantes (Bril, Sora, Durn, Hest, Nera, Luth, Cale, Ivo, Yew, Choir).

