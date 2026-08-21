# AI_STATE — Relicwake

**Atualizado:** 2026-08-21  
**Branch:** `arena/01a02426-idle-rpg`  
**Último passo:** identificação do chão dos plates — floor_scan.py (candidatos) + overlay `?floordebug` no BattleView; aguardando valores do usuário para travar `BATTLE_FLOOR`.

**BUG FECHADO — tela preta em batalha:** o stack do usuário (`window.onerror: this._cancelResize is not a function` em `ResizePlugin.destroy` do pixi 8.19) provou que o cleanup do useEffect chamava `app.destroy(true)` **antes de o `app.init()` assíncrono terminar** (React StrictMode dev desmonta logo após montar). O `ResizePlugin.destroy()` chama `_cancelResize()` sem guarda → exceção no desmonte → React derruba a árvore inteira → só o fundo escuro do body. Correção (BattleView): flag `ready` pós-init + `safeDestroy()` com try/catch; cleanup só destrói se `ready`, senão o `run()` destrói ao resolver o init (caminho `destroyed`). O fix anterior `Assets.load` (Texture.from não carrega no v8) permanece — eram dois bugs. Instrumentação diag mantida (banner + /api/diag).

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
- lotes 12–16: **22/22 bustos** + **22/22 idles** + **11/28 atks** próprios (6 slice + Sem, Bramble, Tess, Quin, Ashleaf); hit/die/ult dos novos ainda kit
- **Apresentação de batalha (esta sessão, docs/16):** aliados na esquerda (10–42% w) e inimigos na direita (58–90% w) com fileiras frente/meio/topo; escala relativa ao canvas (herói 19% h, boss 26% h, largura máx 15% w, profundidade 1.04/0.98/0.92); pré-carga paralela com pool 8 (`battleAssets.ts`) no lugar dos ~50 awaits sequenciais; áudio redesenhado em camadas (hit/crit/ult/death/win/lose/collect/pull) + cama de batalha sequenciada 112 BPM. Pendências de perf/áudio (AVIF/WebP, cache imutável, atlas, packs CC0) — avaliar em produção, não regra.
- **Bugfix batalha preta (esta sessão):** no Pixi v8, `Texture.from(string)` SÓ consulta o Cache (não carrega) — `BattleView` criava sprites com textura vazia desde o slice. Troca por `Assets.load(url)` em `tex()` e no background. Bug pré-existente, não causado pela remoção do chroma.
- **Reorganização de assets:**
  - `referencias/` = masters magenta `#FF00FF` gerados, espelhando a taxonomia de `assets/`
  - `assets/` = **finais RGBA com fundo removido** — o jogo carrega direto, **sem processamento em runtime**
  - Novo pipeline `tools/asset-pipeline/remove_bg.py` (flood de borda; sujeito nunca é removido por cor). `chroma_magenta.py`, `chroma.ts` e `ChromaImg.tsx` removidos.
  - `npm run assets:finalize` + `npm run assets:check`
  - **Busto do Rift regenerado** (o antigo tinha 6.195 recortes internos causados pelo chroma global do pipeline velho)

---

## 3. Fila de arte

| Lote | Conteúdo | Estado |
| --- | --- | --- |
| 12–16 | 22 bustos + 22 idles + 5 atks novos + loop do slice | feito |
| 17 | 10 atk restantes (Bril, Sora, Durn, Hest, Nera, Luth, Cale, Ivo, Yew, Choir) | **próximo** |
| 18+ | 7 atk + hit/die/ult dos 22 | pendente |
| — | inimigos ilustrados, cutscenes, stems, loc 100%, marketing | pendente |

Regras: master → `referencias/<taxonomia>`; final → `npm run assets:finalize`. ≤10/sessão, `#FF00FF`, sem magenta no sujeito. `assets/GENERATION.md`.

Atk ainda kit: Bril, Sora, Durn, Hest, Nera, Luth, Cale, Ivo, Yew, Choir, Dust, Hymn, Cinder, Veil, Helion, Umbral, Rift (17).

---

## 4. Falta além de arte

Typecheck web/content (erros pré-existentes: `allowImportingTsExtensions` nos imports `.ts` de `content/src/index.ts` + narrowing de ranks em `systems.ts`; `shared` e `sim` já passam), CI `.github/workflows` (copiar `infra/ci.yml`), OAuth, Postgres live, Redis, idle worker, Capacitor/billing, LGPD/odds, stems, loc completa, calibrar stages.

---

## 5. Como continuar

1. `git fetch` + `reset --hard origin/arena/01a02426-idle-rpg`
2. `npm ci` + symlink `apps/web/public/assets` → `../../../assets`
3. Só esta branch. Economia no servidor. Magenta ≤10.
4. Atualizar **este arquivo**. `npm run dev` se pedirem preview.

**Próximo passo:** lote-17 — 10 atk restantes (Bril, Sora, Durn, Hest, Nera, Luth, Cale, Ivo, Yew, Choir), masters em `referencias/`, finais via `npm run assets:finalize`.
