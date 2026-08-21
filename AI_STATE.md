# AI_STATE — Relicwake

**Atualizado:** 2026-08-21  
**Branch:** `arena/01a02426-idle-rpg`  
**Último passo:** investigação da tela preta em batalha — instrumentação de diag adicionada; aguardando teste do usuário.

**BUG ABERTO — tela preta ao iniciar batalha:** o fix `Assets.load` (commit 6410235) era necessário e está correto (`Texture.from(string)` não carrega no Pixi v8), mas o usuário reporta sintoma persistente. Causas candidatas: (a) build/cache antigo no navegador do usuário; (b) `app.init()` falhando (WebGL) no ambiente dele; (c) crash React. Instrumentação (commit e5e9eb8): banner vermelho visível + logs de progresso (init/bg/atores) e erros enviados a `POST /api/diag` (dev-only) — ler o log da API (`get_process_output`) após o usuário jogar uma batalha. `window.__battle` exposto no cliente. PRÓXIMA AÇÃO: pedir hard-refresh + uma batalha; ler `[diag]` no log; corrigir a causa real.

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
