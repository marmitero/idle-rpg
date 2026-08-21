# AI_STATE — Relicwake

**Atualizado:** 2026-08-21  
**Branch:** `arena/01a01ca8-idle-rpg`  
**Último passo:** lote-14 — Umbral bust + 8 idle Ember/Tide (Rift falhou).

Este arquivo é a **fonte de verdade para o agente**. Atualize-o ao **final de cada execução**.

---

## 1. Onde o projeto está

Produto: **Relicwake** (mundo Vaelith). Idle auto-battle gacha web (PC + Android + iPhone).

| Fase | Status |
| --- | --- |
| 0 Pré-produção | Feita |
| 1 Vertical slice | Feita |
| 2 Systems complete | Feita |
| 3 Content complete | **Em curso** — dados 1.0; arte em ondas de 10 |
| 4 Polish + cert + soft | Não começou |
| 5 Launch global | Não começou |

Preview: `npm run dev` → Vite **5173** + API **3000**.

---

## 2. Feito (não refazer)

- Slice jogável, replay, auth, SQLite/Postgres, systems (gear, torre 200, arena, guilda, passe, honor, admin)
- 28 heróis / 240 stages / 4×10 hunts / i18n chrome PT-EN
- Arte slice 6 heróis completa (bust+battle) + 3 bosses + plates
- **lote-12:** bustos Bril Sora Durn Hest Nera Luth Cale Ivo Sem Bramble
- **lote-13:** bustos Tess Quin Ashleaf Yew Choir Dust Hymn Cinder Veil Helion
- **lote-14 (esta sessão, 9/10):** bust Umbral; idle Bril Sora Durn Hest Nera Luth Cale Ivo. Helion `ownBust` ligado (atraso do 13). **Rift falhou** (erro + teto 10).

Bustos únicos: **21/22**. Falta **Rift**. Idle próprios: 6 slice + 8 novos. atk/hit/die/ult dos 22 ainda emprestam kit.

---

## 3. Fila de arte

| Lote | Conteúdo | Estado |
| --- | --- | --- |
| 12 | 10 bustos Ember/Tide/Bramble | feito |
| 13 | 10 bustos Thorn/Ashen/Helion | feito |
| 14 | Umbral + 8 idle Ember/Tide | **feito 9/10** |
| 15 | **Rift bust (retomado)** + 9 idle restantes | **próximo** |
| 16+ | atk/hit/die/ult dos 22 | pendente |
| — | inimigos ilustrados, cutscenes, stems, loc 100%, marketing | pendente |

Regras: `#FF00FF`, ≤10/sessão, sem magenta no sujeito. `assets/GENERATION.md`.

Idle ainda kit: Sem, Bramble, Tess, Quin, Ashleaf, Yew, Choir, Dust, Hymn, Cinder, Veil, Helion, Umbral, Rift (14).

---

## 4. Falta além de arte

Typecheck web, CI `.github/workflows` (copiar `infra/ci.yml`), OAuth, Postgres live, Redis, idle worker, Capacitor/billing, LGPD/odds, stems, loc completa, calibrar stages.

---

## 5. Como continuar

1. `git fetch` + `reset --hard origin/arena/01a01ca8-idle-rpg`
2. Symlink `apps/web/public/assets` → `../../../assets`
3. Só esta branch. Economia no servidor. Magenta ≤10.
4. Atualizar **este arquivo**. `npm run dev` se pedirem preview.

**Próximo passo:** lote-15 — busto Rift (retomado) e 9 idle (Sem, Bramble, Tess, Quin, Ashleaf, Yew, Choir, Dust, Hymn).
