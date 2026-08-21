# Formação 3×3 — mecânica de posicionamento

**Status:** v1 (2026-08-21)  
**Dono:** Design / Client / Servidor  
**Aplica-se a:** `@relicwake/sim` (pickTarget), `services/api` (store/systems/combat), `apps/web` (Roster/BattleView)

O jogador decide **onde cada herói fica** na batalha, numa grade de **3
fileiras × 3 colunas = 9 espaços** por time (no máximo 5 heróis, no mínimo 1).

---

## 1. O que a pesquisa do gênero diz

- **AFK Arena:** a formação decide quem apanha primeiro — tanques na frente
  absorvem dano e carregam ultimate mais cedo; reposicionar unidades vence
  stages acima do poder de combate [1](https://www.bluestacks.com/blog/game-guides/afk-arena/tips-tricks-progressing-winning-en.html).
- **Idle Heroes:** 2 na frente + 4 atrás; a linha de frente leva o grosso do
  dano; magos/assassinos/padres ficam atrás [2](https://www.bluestacks.com/blog/game-guides/idle-heroes/everything-need-battle-system-en.html).
- **Idle Hero Arena:** exemplo direto do gênero com **grade 3×3** — o jogador
  posiciona heróis nos 9 espaços e a batalha roda sozinha [3](https://play.google.com/store/apps/details?id=com.xgamexxx.blockpuzzle&hl=en_US).
- **Idle Champions:** estratégias de formação (diamond, shield wall…) e buffs
  por linha/coluna [4](https://idlechampions.fandom.com/wiki/Formation_strategy).
- **AFK Journey (comunidade):** reposicionar contra composições específicas —
  ex.: tanque atrás para absorver assassino que foca a retaguarda [5](https://www.reddit.com/r/AFKJourney/comments/1c8na0o/question_about_positioning/).

**Princípio adotado:** posicionamento é **estratégico, não cosmético** — a
fileira da frente é o alvo prioritário dos ataques básicos.

---

## 2. Modelo de dados

| Peça | Valor |
| --- | --- |
| Grade | 9 slots: `slot = linha * 3 + coluna` |
| Colunas | 0 esquerda, 1 centro, 2 direita (`col = slot % 3`) |
| Fileiras | 0 **frente** (0–2), 1 meio (3–5), 2 topo (6–8) (`row = floor(slot/3)`) |
| Persistência | `account.formation: (string \| null)[]` (9) — fonte de verdade |
| `account.team` | derivado (ordem dos slots) — `syncFormationTeam()` no `save()` |
| Regras | 1–5 heróis, sem duplicatas, apenas heróis possuídos |

Migração: contas antigas (só `team`) preenchem os 5 primeiros slots
(frente 3 + meio 2) na carga.

## 3. Como a formação afeta o combate

- `pickTarget` no sim: ataques básicos preferem **slots 0–2 (frente)**;
  diretivas continuam sobrepondo (foco = maior ATK, execute = <35% HP).
- `loadoutFromTeam` (servidor): batalhas normais montam o input com os slots
  reais da formação; honor/draft mantém slots por índice.
- Renderização: `BattleView` converte slot em posição (colunas nas zonas,
  fileiras na banda de pés 75%–97,5% — docs/16).

## 4. UI atual e próxima etapa

- **Hoje:** painel "Formação" na tela Relíquias — selecione um herói e toque
  num espaço (mover = selecionar e tocar noutro; remover = botão; mínimo 1,
  máximo 5, validados também no servidor).
- **Futuro (aba "Equipe"/"Formação"):** tela dedicada com lista de possuídos,
  incluir/remover da formação e os mesmos limites (1–5).
- **Pós-1.0 (ideias do gênero, ainda fora de escopo):** bônus por
  linha/coluna (ex.: +DEF na frente, +ATK no topo), buffs de adjacência
  (Idle Champions), e posicionamento reativo a composições inimigas.

## 5. Segurança

Toda mutação passa por `POST /api/formation` no servidor (valida 9 slots,
1–5 heróis, sem duplicatas, somente possuídos). O cliente nunca decide
posição válida sozinho — o input da batalha vem do snapshot do servidor.
