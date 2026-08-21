# AI_STATE — Relicwake

**Atualizado:** 2026-08-21  
**Branch:** `arena/01a02426-idle-rpg`  
**Último passo:** lote-15 — busto Rift + 9 idle Thorn/Ashen (bustos 22/22, idles 17/22).

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

Preview: `npm run dev` → Vite **5173** + API **3000**. Dependências: `npm ci` + symlink `apps/web/public/assets` → `../../../assets`.

---

## 2. Feito (não refazer)

- Slice jogável, replay, auth, SQLite/Postgres, systems (gear, torre 200, arena, guilda, passe, honor, admin)
- 28 heróis / 240 stages / 4×10 hunts / i18n chrome PT-EN
- Arte slice 6 heróis completa (bust+battle) + 3 bosses + plates
- **lote-12:** bustos Bril Sora Durn Hest Nera Luth Cale Ivo Sem Bramble
- **lote-13:** bustos Tess Quin Ashleaf Yew Choir Dust Hymn Cinder Veil Helion
- **lote-14:** bust Umbral; idle Bril Sora Durn Hest Nera Luth Cale Ivo
- **lote-15 (esta sessão, 10/10):** busto **Rift** (retomado do lote-14) + 9 idle Sem Bramble Tess Quin Ashleaf Yew Choir Dust Hymn.

Bustos únicos: **22/22** (fechado). Idle próprios: **17/22** (6 slice + 8 lote-14 + 9 lote-15). atk/hit/die/ult dos 22 ainda emprestam kit.

---

## 3. Fila de arte

| Lote | Conteúdo | Estado |
| --- | --- | --- |
| 12 | 10 bustos Ember/Tide/Bramble | feito |
| 13 | 10 bustos Thorn/Ashen/Helion | feito |
| 14 | Umbral + 8 idle Ember/Tide | feito |
| 15 | **Rift bust + 9 idle Thorn/Ashen** | **feito 10/10** |
| 16 | 5 idle restantes + 5 atk dos novos | **próximo** |
| 17+ | atk/hit/die/ult dos 22 | pendente |
| — | inimigos ilustrados, cutscenes, stems, loc 100%, marketing | pendente |

Regras: `#FF00FF`, ≤10/sessão, sem magenta no sujeito. `assets/GENERATION.md`.

Idle ainda kit: Cinder, Veil, Helion, Umbral, Rift (5).

---

## 4. Falta além de arte

Typecheck web/content (erros pré-existentes: `allowImportingTsExtensions` nos imports `.ts` de `content/src/index.ts` + narrowing de ranks em `systems.ts`; `shared` e `sim` já passam), CI `.github/workflows` (copiar `infra/ci.yml`), OAuth, Postgres live, Redis, idle worker, Capacitor/billing, LGPD/odds, stems, loc completa, calibrar stages.

---

## 5. Como continuar

1. `git fetch` + `reset --hard origin/arena/01a02426-idle-rpg`
2. `npm ci` + symlink `apps/web/public/assets` → `../../../assets`
3. Só esta branch. Economia no servidor. Magenta ≤10.
4. Atualizar **este arquivo**. `npm run dev` se pedirem preview.

**Próximo passo:** lote-16 — 5 idle restantes (Cinder, Veil, Helion, Umbral, Rift) + 5 atk dos novos (Sem, Bramble, Tess, Quin, Ashleaf).
