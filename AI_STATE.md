# AI_STATE — Relicwake

**Atualizado:** 2026-08-21  
**Branch:** `arena/01a01ca8-idle-rpg`  
**Último commit esperado:** content complete (dados) + este arquivo.

Este arquivo é a **fonte de verdade para o agente**. Atualize-o ao **final de cada execução**.

---

## 1. Onde o projeto está

Produto: **Relicwake** (mundo Vaelith). Idle auto-battle gacha web (PC + Android + iPhone, um cliente).

| Fase do roadmap | Status |
| --- | --- |
| 0 Pré-produção (docs, art bible, GDD/TDD) | Feita |
| 1 Vertical slice | Feita (jogável) |
| 2 Systems complete | Feita (tubos no API + UI) |
| 3 **Content complete** | **Em curso — dados 1.0 no build; arte/áudio/loc de volume ainda parciais** |
| 4 Polish + cert + soft launch | Não começou |
| 5 Launch global | Não começou |

Preview local: `npm run dev` → Vite **5173** + API **3000** (`0.0.0.0`, proxy `/api`).

---

## 2. O que já existe (não refazer)

- Monorepo: `apps/web`, `packages/{shared,sim,content}`, `services/api`, `docs/`, `assets/`, `infra/`
- Combate autoritativo `@relicwake/sim` (xorshift, 50ms, 45s) + **replay** (`battles`, hash + HMAC, cliente só playback)
- Auth device + JWT email; OAuth Google **501**
- Persistência: SQLite default / Postgres se `DATABASE_URL=postgres://`
- Idle collect, gacha pity, dailies, hunts+sweep, tutorial 8 min, áudio procedural
- Systems: gear 4x4, nível/estrela/imprint/skill/resonance, torre, arena snapshot, guilda+war, passe, mail, login 7d, honor draft, admin flags, analytics
- **Content (dados, este passo):**
  - **28 heróis** (6 arte própria + 22 kit emprestado `placeholder`)
  - **240 stages** (12×20) + cutscenes de ato
  - Inimigos gerados (fodder/elite/boss) com 3 artes-base
  - **4 hunts × 10 níveis**
  - Torre **200** andares
  - Honor pool 16
  - i18n UI PT-BR + EN (Menu)
  - Eventos S0: login7, hunt_tide, story_side

---

## 3. O que falta (ordenado)

### Content complete — ainda aberto

- [ ] **Arte dos 22 heróis** (bust/icon/idle/atk/hit/die/ult), 10 imagens/sessão, fundo magenta `#FF00FF`
- [ ] **Inimigos ilustrados** (36+12+12) em vez de reciclar 3 bosses
- [ ] **12 cutscenes ilustradas** (hoje texto)
- [ ] **Stems de áudio 1.0** (8 faixas + SFX matrix) — hoje síntese
- [ ] **Loc 100%** (nomes de stage, skills, mail, tutorial) — hoje chrome de UI
- [ ] **Key art / 8 screenshots / trailer 45s / store copy**
- [ ] Calibrar 240 stages (números ainda gerados)
- [ ] Hunt 10 níveis com arte/biome próprios

### Polish / cert / lojas

- [ ] Typecheck do `apps/web` (exactOptionalPropertyTypes, BattleView unions)
- [ ] CI em `.github/workflows` (GitHub App **não** escreve; copiar `infra/ci.yml`)
- [ ] OAuth Google/Apple
- [ ] Postgres testado ao vivo; Redis; idle worker contínuo
- [ ] Capacitor iOS/Android, billing nativo, Stripe
- [ ] Acessibilidade, ToS, odds page, exclusão LGPD, IARC
- [ ] Soft launch KPIs

### Não fazer no 1.0

Open-world, PvP realtime, 80 heróis, VA full, mercado P2P, tema Naruto.

---

## 4. Como o agente deve continuar

1. `git fetch` + `reset --hard origin/arena/01a01ca8-idle-rpg` (sandbox reseta)
2. Recriar `apps/web/public/assets` → `../../../assets`
3. Trabalhar **somente** nesta branch
4. Não creditar economia no cliente
5. Imagens geradas: magenta sólido, máx. 10/sessão
6. Ao terminar: atualizar **este arquivo**, citar o próximo passo, `npm run dev` se o usuário precisar de preview

**Próximo passo sugerido:** onda de arte dos heróis placeholder (10/sessão) **ou** Polish (typecheck web, CI, OAuth, performance).
