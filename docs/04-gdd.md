# Game Design Document — Relicwake

**Título de produção:** Relicwake  
**Mundo:** Vaelith  
**Gênero:** Idle auto-battle RPG · gacha · online  
**Plataformas:** Web (PC), Android, iPhone (mesmo cliente)  
**Classificação alvo:** 10+ / Everyone 10+ (violência fantástica estilizada)  
**Idiomas 1.0:** PT-BR, EN  
**Status:** v1 living — pré-produção  
**Dono:** Game design

Este documento define *o que o jogo é*. Como se constrói está no [TDD](04-tdd-arquitetura.md). Números vivos estão na [economia](07-economia-liveops.md).

---

## 1. Pitch

Vaelith é um continente que **dorme**. Enquanto dorme, o tempo condensa *Wake* — memória sólida. Você é um Waker: sobe o **Spire**, acorda Relíquias (heróis) e deixa seu time lutar sozinho na encosta. Quando volta, o mundo rendeu. A decisão seguinte — formação, pacto, ultimate — é sua.

Sessões de 3 e de 15 minutos. Profundidade no time-building. Guilda como fortaleza, não como menu.

---

## 2. Pilares

1. **Ausência fecunda.** Offline é conteúdo. O baú é diegético.
2. **Auto com intenção.** Posição + 3 diretivas + ultimates. Não é screensaver.
3. **Coleção com rosto.** 28 pessoas, não 28 barras de ATK.
4. **Facção é identidade e regra.** Cores, vantagem, bônus, torre.
5. **Guilda é lugar.** Hall, relíquia compartilhada, rito semanal.
6. **Respeito ao relógio.** Daily orçado. Sweep no dia 3. Sem segundo gacha de gear.

---

## 3. Fantasy e tom

- **Poder:** meu time sobe o pico sem mim.
- **Coleção:** acordar alguém que o mundo esqueceu.
- **Social:** sexta é hunt da fortaleza.
- **Tom:** high fantasy crepuscular, melancolia quente, humor seco nos NPCs. Sem grimdark, sem chibi-only.
- **Tabus:** nada de IP ninja/Naruto. Sem escravidão sexualizada. Sem loot boxes infantis sem odds.

---

## 4. Loop

```
              ┌──────────── campanha / torre ─────────────┐
              ▼                                           │
entrar → coletar Wake → gastar em poder → lutar (auto) ───┤
              │                                           │
              ├─ hunts / arena / guilda ──────────────────┘
              └─ summon / gear / passe
```

**Primeiros 8 minutos**

1. Nome do Waker. 20s de mundo (Spire acordando).
2. Relíquia inicial (escolha 1 de 3 facções core — não é gacha).
3. Combate tutorial com 1 diretiva e 1 ultimate manual.
4. Stage 1-4. Primeiro baú Wake disponível.
5. Primeiro summon *tutorial* (resultado scriptado: herói 2).
6. Hub destrava. Daily aparece. Jogador é dono do tempo.

---

## 5. Combate

### 5.1 Forma

- 5 v 5. Campo 2 colunas (frente / trás) × 3 fileiras. Frente cabe 2, trás cabe 3.
- Resolução automática em tempo real com ticks de 50 ms.
- Duração alvo: 12–25 s (1x). Speed 1x / 2x / 3x. Skip depois da 3ª vitória no mesmo stage.
- Determinístico: mesma seed + mesmos inputs = mesmo replay.

### 5.2 Decisões do jogador

| Quando | Decisão |
| --- | --- |
| Pré | Quem entra, posição, artefato de time, **3 diretivas** |
| Durante | Disparar ultimate (ou auto-ult) |
| Pós | Replay, retry com outra formação |

**Diretivas (assinatura):** o jogador escolhe 3 cartas, em ordem, que o cérebro do time executa quando a condição dispara.

| Diretiva | Efeito |
| --- | --- |
| **Foco** | Time prioriza o inimigo de maior ATK |
| **Guarda** | 8s de +25% DEF no aliado com menos HP% |
| **Execute** | +30% dano em alvos < 35% HP |
| **Maré** | Empurra 1 inimigo de trás para frente |
| **Pacto** | O próximo ult aliado cura 8% do time |
| **Cisma** | Ignora 20% da vantagem de facção inimiga |

Três slots. Sem mana. É a “macro” do auto-battle.

### 5.3 Atributos

`HP, ATK, DEF, SPD, CRIT, CRES, EFF, RES, ACC`

- SPD define ordem de ataque e frequência.
- Vantagem de facção: +20% dano e +10% ACC.
- Classes: **Vanguard, Striker, Channeler, Warden, Seer** (tank, DPS melee, mage, support/shield, control/healer).

### 5.4 Skills

Cada herói: **Passiva**, **Comando** (auto, CD), **Ultimate** (barra compartilhada por herói, enchida por dano/tempo).  
Ultimate manual pausa 0.3 s e faz cut-in de 0.9–1.3 s.

### 5.5 Vitória / derrota

- Vitória: todos os inimigos a 0 HP.
- Derrota: time a 0, ou timeout 45 s (conta como derrota, anti-stall).
- Estrelas do stage: vitória; nenhum aliado morto; duração < 20 s.

---

## 6. Campanha e Wake

- 12 capítulos × 20 stages = 240. Cada capítulo = um degrau do Spire e um bioma.
- Stage ímpar: wave. Stage 10 e 20: boss de ato.
- O **AFK stage** é o mais alto 3★. Ele define a taxa do baú.
- Baú **Wake**: ouro, essência (XP), poeira de relíquia, chance de shard.
- Cap offline: 8 h no tutorial → 12 h no cap. 2 → 16 h no cap. 6 → 24 h no cap. 10.
- Coletar é um toque. Não assiste anúncio para o baú-base.
- Empurrar campanha é o *único* jeito de subir a taxa. Outros modos dão recursos, não taxa.

---

## 7. Heróis e progressão

### 7.1 Roster 1.0

28 heróis.

| Facção | Papel | Qtd | Raridade de pool |
| --- | --- | --- | --- |
| **Embercourt** | Forja, honra, fogo | 6 | Core |
| **Tidebound** | Memória, mar, adaptação | 6 | Core |
| **Thornveil** | Mato vivo, crescimento | 6 | Core |
| **Ashen Choir** | Restos, sombra, canto | 6 | Core |
| **Solstice** | Astro raro | 2 | Rare |
| **Nadir** | Vão raro | 2 | Rare |

Nomes e kits: Narrative Bible + Roster bible (C-01).

Raridade de *unidade*: Rare / Elite / Relic (3 / 4 / 5★ de pull).  
Ascensão: Elite+ → Relic → Relic+ → Myth → Myth+ → Apex (cópias + poeira).

### 7.2 Power tracks (máx. 4, não 9)

1. **Nível** — via Resonance (os 5 mais altos puxam o resto até o teto).
2. **Ascensão / estrelas** — cópias e poeira.
3. **Skills** — manuais + essência de skill (sink raro).
4. **Gear** — 4 slots, sets de 2 peças.

Imprint (cópias extras): bônus linear pequeno, teto em +15%.  
**Não existe** mobilização de herói como combustível obrigatório (o ódio do gênero). Dupes = imprint ou poeira.

### 7.3 Starter

Escolha 1 de 3 Elites (um por facção core, excluindo Ashen no tutorial).  
Summon tutorial garante o 2º Elite de outra facção.  
Ninguém começa sem time de 5 até o stage 1-8 (aliados de empréstimo do capítulo, depois substituídos).

---

## 8. Gacha

Nome diegético: **The Font**.

| Banner | Moeda | Pity duro | Notas |
| --- | --- | --- | --- |
| Font Standard | Letters (grátis + shop) | 70 pulls → Elite+; 140 → Relic | Wishlist 4 (um por facção core) |
| Font of the Season | Letters + Fate (premium) | 70 / 140, 50% feature | Feature rate-up |
| Ash Font | Ash Marks (guild / passe) | 90 → rare faction | Sem money direto |

Regras éticas (também em compliance):

- Odds na tela de pull e numa página permanente.
- Histórico das últimas 100 puxadas.
- **Compra direta** do herói Relic padrão 28 dias após o lançamento dele, por moeda premium.
- Sem kompu. Sem trade. Sem marketplace.
- Bélgica: IAP não compra *Letters* nem pulls — só passa cosmética, battle pass sem random, e compra direta. Flag `region.paidRandom = false`.

---

## 9. Modos 1.0

| Modo | Unlock | Loop | Recompensa |
| --- | --- | --- | --- |
| Campanha | T0 | Empurrar AFK | Taxa Wake, história |
| Torre do Spire | Cap. 2 | Andares, sem stamina | Poeira, gemas |
| Torres de Facção | Cap. 6 | Reset semanal, lock | Letters, shards da facção |
| Hunts (4) | Cap. 3 | Stamina, sweep | Gear, essência, ouro, skill |
| Arena | Cap. 4 | 5 ataques/dia, snapshot | Arena coin, rank |
| Guild Hunt | Cap. 5 + guild | 2 tentativas/dia | Guild coin, boss chest |
| Guild War | Cap. 8 | 3 ataques, 2 defesas | Ash Marks, prestige |
| Labirinto | Cap. 7 | 2× semana, relics run | Lucent (cópia rara) |
| Honor Duel | Cap. 9 | Draft da pool | Cosmético + titles |
| Bounty | Cap. 4 | 4 missões idle 2–8 h | Mats, Letters |

Stamina: 120 cap, +1 / 6 min. Idle **não** gasta stamina. Sweep custa stamina e **1 ticket** (tickets pingam no baú e no daily).

---

## 10. Guilda

- 1 a 30 membros. Cargos: Sovereign, Flame, Member.
- Hall no Spire (visual da fortaleza sobe com nível da guilda).
- Ajuda: 1 toque reduz CD de bounty dos aliados.
- Relíquia compartilhada: buff de 7 dias votado (ATK / Wake / Hunt).
- Hunt: boss com HP de ranking individual (não precisa de speed-tune de Raid).
- War: 2 fortalezas, 3 ataques, defesa de 2 times. Sem realtime.
- Shop: shards core, Letters, cosmético de guilda.

---

## 11. Meta semanal do jogador

| Cadência | Conteúdo | Tempo |
| --- | --- | --- |
| Login | Baú + 1 toque de daily | 2–4 min |
| Diário completo | Campanha ou torre + 2 hunts sweep + 3 arena + ajuda | 12–18 min |
| Semanal | Labirinto, facção tower, war, passe | +40–60 min |
| Temporada (28 d) | Banner, 1 evento, 1 herói novo pós-1.0 | — |

---

## 12. UI / navegação

Hub com **cinco destinos** + utilitários:

```
        [Spire]     [Font]
[Hall]              [Hunt]
        [Roster]

barra:  Hub · Roster · Battle · Guild · Menu
```

Retrato no telefone (390×844 base). Landscape opcional só na batalha em desktop.  
Tablet: hub em duas colunas.  
PC: o mesmo retrato em coluna central, laterais com lore / chat da guilda.

---

## 13. Monetização (desenho, não planilha)

Paga-se por **tempo cosmética e conveniência honesta**, não por existir.

| SKU | Tipo |
| --- | --- |
| Passe da estação (free + premium) | Progressão, *sem* herói Relic exclusivo pago |
| Gazette (mensal) | +10% Wake, +1 bounty, 300 Fate |
| Packs de Fate com **odds iguais** ao grind | Sem “primeiro pack 30× melhor” escondido |
| Skins / outfits (VFX da ult quando houver) | Cosmético |
| Compra direta de herói fora do rate-up | Anti-gacha-only |
| Energy refill | Existe, caro, nunca obrigatório para idle |

Sem ads no 1.0. Sem loot box de gear.

---

## 14. Fora do jogo

Open-world 3D, PvP realtime, 80 heróis no launch, VA integral, mercado P2P, crossover, UGC, casino visual (luzes de caça-níquel).  
Naruto, vilas, sharingans, “jutsu” como palavra de UI.

---

## 15. Critérios de diversão (aceitação de design)

Um build é *o jogo* quando:

1. Um estranho entende o baú em 8 minutos.
2. Um stage 3★ perdido se ganha **trocando diretiva ou posição**, não só farmando 10 níveis.
3. Assistir um ultimate dá vontade de puxar aquele herói.
4. A daily cabe num café.
5. A guilda tem um motivo para falar na sexta.
6. Um F2P de 60 dias tem time Apex-capaz na campanha (não no top 10 da arena).
