# AI_STATE — Relicwake

**Atualizado:** 2026-08-21  
**Branch:** `arena/01a02426-idle-rpg`  
**Último passo:** reorganização de assets (referencias × assets) + Rift regenerado + chroma runtime removido.

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
- lotes 12–15: **22/22 bustos únicos** + **17/22 idles próprios** (faltam Cinder, Veil, Helion, Umbral, Rift)
- **Reorganização de assets (esta sessão):**
  - `referencias/` = masters magenta `#FF00FF` gerados, espelhando a taxonomia de `assets/`
  - `assets/` = **finais RGBA com fundo removido** — o jogo carrega direto, **sem processamento em runtime**
  - Novo pipeline `tools/asset-pipeline/remove_bg.py` (flood de borda; sujeito nunca é removido por cor). `chroma_magenta.py`, `chroma.ts` e `ChromaImg.tsx` removidos.
  - `npm run assets:finalize` + `npm run assets:check`
  - **Busto do Rift regenerado** (o antigo tinha 6.195 recortes internos causados pelo chroma global do pipeline velho)

---

## 3. Fila de arte

| Lote | Conteúdo | Estado |
| --- | --- | --- |
| 12–15 | 22 bustos + 17 idles + loop do slice | feito |
| 16 | 5 idle restantes + 5 atk dos novos | **próximo** |
| 17+ | atk/hit/die/ult dos 22 | pendente |
| — | inimigos ilustrados, cutscenes, stems, loc 100%, marketing | pendente |

Regras: master → `referencias/<taxonomia>`; final → `npm run assets:finalize`. ≤10/sessão, `#FF00FF`, sem magenta no sujeito. `assets/GENERATION.md`.

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

**Próximo passo:** lote-16 — 5 idle restantes (Cinder, Veil, Helion, Umbral, Rift) + 5 atk dos novos (Sem, Bramble, Tess, Quin, Ashleaf), masters em `referencias/`, finais via `npm run assets:finalize`.
