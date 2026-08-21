# AI_STATE — Relicwake

**Atualizado:** 2026-08-21  
**Branch:** `arena/01a01ca8-idle-rpg`  
**Último passo:** lote-13 — 10 bustos (Thorn 4, Ashen 5, Helion).

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
- **lote-13 (esta sessão):** bustos Tess Quin Ashleaf Yew Choir Dust Hymn Cinder Veil Helion

Bustos únicos agora: **20/22** placeholders. Faltam **Umbral** e **Rift** (Nadir). Battle clips dos 22 ainda emprestam kit da classe.

---

## 3. Fila de arte

| Lote | Conteúdo | Estado |
| --- | --- | --- |
| 12 | 10 bustos Ember/Tide/Bramble | feito |
| 13 | 10 bustos Thorn/Ashen/Helion | **feito** |
| 14 | bustos Umbral + Rift + 8 idle dos novos | **próximo** |
| 15+ | idle/atk/hit/die/ult dos 22 | pendente |
| — | inimigos ilustrados, cutscenes, stems, loc 100%, marketing | pendente |

Regras: `#FF00FF`, ≤10/sessão, sem magenta no sujeito. `assets/GENERATION.md`.

---

## 4. Falta além de arte

Typecheck web, CI `.github/workflows` (copiar `infra/ci.yml`), OAuth, Postgres live, Redis, idle worker, Capacitor/billing, LGPD/odds, stems, loc completa, calibrar stages.

---

## 5. Como continuar

1. `git fetch` + `reset --hard origin/arena/01a01ca8-idle-rpg`
2. Symlink `apps/web/public/assets` → `../../../assets`
3. Só esta branch. Economia no servidor. Magenta ≤10.
4. Atualizar **este arquivo**. `npm run dev` se pedirem preview.

**Próximo passo:** lote-14 — Umbral, Rift (bustos Nadir) e primeiros idles de batalha dos novos.
