# AI_STATE — Relicwake

**Atualizado:** 2026-08-21  
**Branch:** `arena/01a01ca8-idle-rpg`  
**Último passo:** lote-12 — 10 bustos dos heróis placeholder (Ember 4 + Tide 5 + Bramble).

Este arquivo é a **fonte de verdade para o agente**. Atualize-o ao **final de cada execução**.

---

## 1. Onde o projeto está

Produto: **Relicwake** (mundo Vaelith). Idle auto-battle gacha web (PC + Android + iPhone, um cliente).

| Fase do roadmap | Status |
| --- | --- |
| 0 Pré-produção | Feita |
| 1 Vertical slice | Feita |
| 2 Systems complete | Feita |
| 3 Content complete | **Em curso** — dados 1.0 no build; arte em ondas de 10 |
| 4 Polish + cert + soft launch | Não começou |
| 5 Launch global | Não começou |

Preview: `npm run dev` → Vite **5173** + API **3000**.

---

## 2. O que já existe (não refazer)

- Monorepo, sim autoritativa, replay, auth JWT, SQLite/Postgres adapter
- Idle, gacha, dailies, hunts+sweep, tutorial, áudio procedural
- Systems: gear, progressão, torre 200, arena, guilda+war, passe, mail, honor, admin
- Content dados: 28 heróis, 240 stages, 4×10 hunts, i18n chrome PT/EN, eventos S0
- Arte slice 6 heróis (bust + battle idle/atk/hit/die/ult) + 3 bosses + plates + UI
- **lote-12 (esta sessão):** bustos únicos de Bril, Sora, Durn, Hest, Nera, Luth, Cale, Ivo, Sem, Bramble (ícone = cópia do bust). Battle sprites desses 10 ainda emprestam o kit da classe.

---

## 3. Fila de arte (onda roster)

22 placeholders. Após lote-12 restam **12 bustos**.

| Lote | Conteúdo | Estado |
| --- | --- | --- |
| 12 | 10 bustos Ember/Tide/Bramble | **feito** |
| 13 | 10 bustos Tess Quin Ashleaf Yew Choir Dust Hymn Cinder Veil Helion | **próximo** |
| 14 | 2 bustos Umbral + Rift, depois idle/atk desses heróis | pendente |
| … | idle/atk/hit/die/ult dos 22 (7 clips × 22 = 154; ~16 lotes) | pendente |
| — | inimigos 36+12+12 ilustrados | pendente |
| — | 12 cutscenes ilustradas | pendente |

Regras: fundo `#FF00FF`, máx. 10/sessão, sem magenta no sujeito. Registrar em `assets/GENERATION.md`.

---

## 4. O que falta além de arte

- [ ] Stems de áudio 1.0 (8 faixas + SFX)
- [ ] Loc 100% (stages, skills, mail, tutorial)
- [ ] Key art / screenshots / trailer / store copy
- [ ] Calibrar 240 stages
- [ ] Typecheck web, CI em `.github/workflows` (copiar `infra/ci.yml`)
- [ ] OAuth, Postgres live, Redis, idle worker
- [ ] Capacitor + billing, LGPD, odds, soft launch

---

## 5. Como continuar

1. `git fetch` + `reset --hard origin/arena/01a01ca8-idle-rpg`
2. Symlink `apps/web/public/assets` → `../../../assets`
3. Só esta branch. Economia só no servidor. Imagens: magenta, ≤10.
4. Atualizar **este arquivo** no fim. Subir `npm run dev` se pedirem preview.

**Próximo passo:** lote-13 — 10 bustos restantes (Thorn 4 + Ashen 5 + Helion).
