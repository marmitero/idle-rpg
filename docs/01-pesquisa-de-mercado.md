# Pesquisa de mercado e referências

**Status:** v1 — pré-produção  
**Dono:** Direção criativa + design  
**Data:** 2026-08-20  
**Objetivo:** extrair estética e sistemas de jogos do mesmo gênero que *Nindo Peak*, sem copiar tema, IP ou pipeline predatório.

O tema ninja/Naruto dos títulos citados pelo briefing **não é regra de produção**. Servem como amostra de *loop*, *espetáculo de batalha* e *metagame social*.

---

## 1. O que o briefing pede, em linguagem de produto

| Pedido | Tradução de design |
| --- | --- |
| Jogável via web no PC e no telefone | Um cliente HTML5 responsivo + PWA + wrap nativo |
| Gacha | Coleção de heróis com raridade, banners, pity |
| Batalha automática | Combate espetacular em que a decisão é *antes* e *no ultimate* |
| Online | Conta, nuvem, PvP assíncrono, guilda, ranking |
| Recompensa idle | Progressão e baú AFK enquanto o app está fechado |
| Guild | Identidade social + chefão + guerra + chat |

Isso não é um incremental puro (*Cookie Clicker*) nem um gacha de ação plena (*Genshin*). É o híbrido **idle-collector** popularizado por Lilith e DHGames: sessões curtas, profundidade no time-building, recompensa por voltar.

---

## 2. Referência-âncora: Nindo Peak / Pride of Nindo

*Pride of Nindo* (VJOY Global) é o título público mais próximo do que o briefing chama de Nindo Peak. [1](https://play.google.com/store/apps/details?id=com.prideofnindo.gp&hl=en_US)

### O que o produto realmente vende

- **Live2D + clip de skill único por personagem.** A batalha automática precisa *valer a pena assistir*.
- **Deploy primeiro, luta depois.** O jogador posiciona; o sistema resolve.
- **Três eixos de power:** Enhance (nível/stats), Scrolls (itens/pergaminhos), Jutsu (kit de habilidade).
- **Outfits que mudam VFX da skill.** Cosmético com feedback de combate — coleção sem só ser skin morta.
- **Guilda como caminho de poder**, não só chat.
- **Hub + retrato mobile**, anime / eastern fantasy, isekai-adjacent.

### O que as reviews ensinam (o que *não* copiar)

Jogadores reclamam de preço de cópia 4★, quantidade absurda de dupes para rank-up, e da sensação de reskin. [1](https://play.google.com/store/apps/details?id=com.prideofnindo.gp&hl=en_US)  
**Decisão nossa:** cópias alimentam um sistema de *resonance / imprint* com teto claro; heróis do roster base são obtíveis 100% por gameplay; pity duro público.

### Extração mecânica (tema-agnóstica)

```
pré-batalha: time 5 + formação + artifactos
batalha: auto + ultimate manual opcional + speed-up
pós: ouro / exp / shards / AFK rate sobe com o stage
meta: summon → enhance → skill → gear → facção → guilda
social: guild hunt, war, ajuda
```

---

## 3. Matriz de referências

Jogos estudados por **mecânica**, **estética** ou **ambos**. Nenhum é template de IP.

### 3.1 Núcleo do gênero (sistemas)

| Jogo | Por que importa | O que pegamos | O que rejeitamos |
| --- | --- | --- | --- |
| **AFK Arena** (Lilith, 2019) | Cânone do idle-gacha. 45M+ downloads, ~US$1B. [2](https://en.wikipedia.org/wiki/AFK_Arena) Time de 5, facções, baú AFK, torre, labirinto, arena assíncrona, guild hunt, wishlist no tavern. | Baú AFK atrelado ao stage; 5 v 5 com posição; facção com vantagem triangular; wishlist; crystal de ressonância (nível compartilhado). | Feature-debt de 7 anos; dimensional crossovers; monetização de late-game PvP fechado. |
| **AFK Journey** (Lilith / Farlight, 2024) | Sequência moderna: idle + mapa + combate tático em grid. [3](https://en.wikipedia.org/wiki/AFK_Journey) [4](https://vgtopup.com/apps/afk-journey) | Combate com terreno e linha de visão; classes compartilham gear; Resonating Hall; modos em camadas (Dream Realm, Honor Duel, Labyrinth, Clashfronts); unlock de modos por stage AFK. | Open-world 3D pesado demais para web mobile; seasonal reset agressivo no 1.0. |
| **Idle Heroes** | Teto estratégico do gênero antigo: facção, fragments, vessel, gear. [5](https://www.mobilegamereport.com/articles/best-games-like-idle-heroes-2026) | Fragmentos como caminho F2P; facção wars. | Atrito F2P no high-end; UI datada. |
| **Raid: Shadow Legends** | Profundidade de champion + clan boss coordenado. [6](https://www.mobilegamereport.com/articles/best-games-like-raid-shadow-legends-2026) | Clan boss com HP compartilhado e roles (speed-tune light). | 3D high-poly inviável na web; monetização agressiva. |
| **Epic Seven** | Pity, arte animada de ponta, PvP profundo. [7](https://www.resetera.com/threads/epic-seven-ot2-the-tragic-edgy-version-of-ot1.290606/) | Pity duro comunicável; skill animations como fantasy de coleção. | Gear RNG de 7 camadas; hunt que exige emulador 24/7; custo de unequip. |
| **Summoners War** | Rune/dungeon loop + arena clássica. | Dungeons de recurso com identidade (um por stat). | Rune RNG como segundo gacha invisível. |
| **Hero Wars / Mobile Legends: Adventure** | Prova de que o loop escala em mercados massivos. | Onboarding rápido, daily de 15 min. | Narrativa descartável, power-creep sem teto. |

### 3.2 Vizinhos estéticos e de *feel*

| Jogo | Estética | Lição |
| --- | --- | --- |
| **AFK Arena** | Vitral + Art Nouveau, linha colorida, pouco preto puro, pose com movimento. [8](https://www.creativebloq.com/art/digital-art/i-went-wild-with-warped-houses-gnarled-trees-and-jagged-shapes-how-tim-burton-influenced-the-creator-behind-afk-arenas-scene-art) | Identidade visual *forte* vale mais que fidelidade. Splash art é o produto. |
| **AFK Journey** | Canvas / livro ilustrado, mapa pintado. | Exploração leve dá alma a um jogo idle. |
| **Dislyte** | Mito urbano + neon + vaporwave + moda. [9](https://gbakery.substack.com/p/dislyte-aesthetics-leading-trend) | Tema original vende o lançamento. Gameplay genérico não segura o ano 2. |
| **Epic Seven** | Anime 2D de corte cinematográfico. | Skill cut-in é a fantasy de puxar o gacha. |
| **Sword Master Story** | Pixel/2D side-scroll flashy, auto + ultimate manual. [10](https://www.hardcoredroid.com/sword-master-story-review/) | Combate precisa de *impacto* mesmo em auto. Offline verdadeiro faz falta — o jogo sofre por exigir tela ligada. [11](https://www.reddit.com/r/gachagaming/comments/uh0odo/sword_master_story_reroll_guide/) |
| **Eversoul** | Live2D íntimo, idle + bond. | Live2D é caro; só vale se o pipeline for industrializado. |
| **Alchemy Stars / Reverse: 1999** | Grid tático + direção de arte autoral. | Posicionamento pode ser o diferencial intelectual. |
| **Gacha Idle** (Steam/EGS) | HQ / comic, 5 facções elementais, turn-based idle, guild war. [12](https://store.steampowered.com/app/3686710/Gacha_Idle/) | Confirma o pacote “idle + facção + dungeon + PvP + temporada” como expectativa do mercado 2025–26. |

### 3.3 Web-first (a restrição que os mobile-natives ignoram)

| Jogo | Lição para um cliente browser |
| --- | --- |
| **Melvor Idle** | Idle web pode ser profundo se o estado é barato de simular. |
| **IdleOn** | Um cliente web + mobile com a mesma conta é o padrão certo. |
| **Idle Clans / IdleMMO / Milky Way Idle** | Servidor simula o tick; fechar a aba não quebra o contrato idle. |
| **Phaser / Pixi / Defold cases** | Payload inicial < 3–5 MB para first paint em 4G. Unity WebGL (~8 MB vazio) é hostil a mobile web. [13](https://app.cinevva.com/guides/web-game-engines-comparison) |

---

## 4. Anatomia do gênero (sistemas que o 1.0 precisa ter)

Mapeamento cruzado. Se um sistema aparece em ≥4 âncoras, é **cânone**. Se aparece em 2–3, é **diferencial opcional**. Se aparece em 1, é **assinatura** — só entra com dono e orçamento.

### 4.1 Cânone (obrigatório no 1.0)

| Sistema | Como os referentes fazem | Nossa leitura |
| --- | --- | --- |
| **Campanha / AFK stage** | Stage linear; o mais alto define a taxa do baú. | Núcleo. Sem isso não há idle. |
| **Baú / recompensa offline** | Cap 12h → 24h conforme progressão. | Cap honesto, collect-all, sem ads obrigatório. |
| **Time de 5 + formação** | Frente/trás ou grid. | Frente 2 / trás 3 no 1.0; grid vira expansão. |
| **Auto-batalha + ultimate manual** | Auto padrão, tap no ult, speed 1x/2x/3x. | Igual, com replay determinístico. |
| **Facções + vantagem** | 4 core + 2 raras. 3-of-faction bonus. | 4 + 2. Triângulo entre as 4. |
| **Gacha com wishlist / banner** | Tavern + event banner + pity. | Pity duro, wishlist nas 4 facções, banner limitado. |
| **Progressão compartilhada** | Crystal / Resonating Hall. | Evita grind de 40 heróis. |
| **Torre** | Andares, facção-lock semanal. | Torre livre + torre de facção. |
| **Arena assíncrona** | Ataca o snapshot do defensor. | Sem realtime no 1.0. |
| **Dungeons de recurso** | Um por material (ouro, gear, XP, shards). | 4 hunts. Sweep tickets desde o dia 3. |
| **Guilda** | Hunt / boss, shop, ajuda, war. | Hunt + shop + ajuda no 1.0; war no 1.0 late. |
| **Missões diárias / passe** | 10–15 min de daily. | Daily + weekly + passe free+premium. |
| **Loja de moedas de modo** | Arena coin, guild coin, lab coin. | Cada modo tem sink e source. |

### 4.2 Diferenciais (1.0 se couber, senão 1.1)

- Labirinto roguelite semanal (AFK Arena / Journey).
- Honor Duel / draft (skill expression sem roster paywall).
- Outfit que troca VFX (Pride of Nindo).
- Bounty board (missões idle de heróis).
- Mapa de exploração leve com baús (Journey, sem open-world).

### 4.3 Assinatura nossa (entra no 1.0 porque *é* o jogo)

Ver GDD. Resumo:

1. **O sono do mundo é o idle.** Vaelith adormece; enquanto o jogador está ausente, o mundo produz *Wake*. Coletar é *acordar* o trecho.
2. **Planos de batalha.** Antes do auto, o jogador escolhe 3 diretivas (foco, guarda, execute). Auto-batalha com intenção.
3. **Pacto de guilda.** A guilda é uma fortaleza no Spire, visível, com um relíquia compartilhada.

---

## 5. Loops (o que o jogador *sente*)

### Sessão de 3 minutos (check-in)

```
abrir → coletar Wake → daily de 4 toques → 1 summon ou 1 upgrade → fechar
```

### Sessão de 15 minutos (core)

```
coletar → empurrar 5–15 stages da campanha
       → 1 dungeon sweep
       → 3 arenas
       → 1 decisão de time / gear
       → daily completo
```

### Semana

```
labirinto ou evento
torre de facção
guild hunt (tentativas diárias, ranking semanal)
passe semanal
banner atual
```

### Anti-padrões observados

| Anti-padrão | Onde dói | Nossa regra |
| --- | --- | --- |
| Idle que exige tela ligada | Sword Master Story | Offline é simulado no servidor. Sempre. |
| Gear como segundo gacha | Epic Seven, Raid | Sets simples, substats com pity de qualidade, unequip grátis 1×/dia. |
| Power-creep sem teto | Hero Wars | Caps de poder por temporada, heróis do 1.0 permanecem úteis. |
| Daily de 60+ min | Raid late | Daily orçado em 12–18 min. |
| Compra de energia como unique path | vários | Energia regenera; idle não consome energia. |
| Kompu gacha / complete-the-set pago | JP banido desde 2012 | Proibido. |

---

## 6. Estética: o que o mercado premia

Três escolas viáveis para um indie web:

| Escola | Referência | Custo | Risco |
| --- | --- | --- | --- |
| **A. Ilustração pintada / vitral** | AFK Arena | Alto por herói (splash + bust + skill FX) | Sem pipeline, o roster morre |
| **B. Anime 2D / Live2D** | Pride of Nindo, Eversoul, Epic Seven | Muito alto | Inviável se o pacote de assets não for dessa família |
| **C. Stylized 2D sólido (cel + silhueta forte)** | Alchemy Stars-lite, indie comic | Médio | É o que um indie consegue *manter* |

**Decisão provisória:** Escola C com *luxo seletivo* — splash art de herói no nível A, sprite de batalha em 2D sólido, skill FX com poucas camadas bem compostas.  
**Override:** o pacote de assets do cliente ainda **não chegou ao repositório**. A Art Bible v1 descreve o alvo; a v1.1 trava o estilo no material recebido (ver `assets/_inbox`).

Princípios estéticos extraídos, *independentes* da escola:

1. Silhueta legível a 72 px (ícone de roster).
2. Paleta de facção inconfundível.
3. Quase nunca preto puro nas linhas (AFK).
4. Pose com direção de movimento.
5. Ultimate = corte de câmera + 1.2 s de leitura, não 8 s de CG.
6. UI de hub com 5 destinos, não 18 ícones.

---

## 7. Posicionamento de Relicwake

```
NÃO somos: clone de Naruto, clone de AFK, idle de planilha, gacha 3D.
SOMOS: um idle-collector web-native com auto-batalha intencional,
        facções de um IP original (Vaelith), guilda como lugar,
        e um contrato honesto com o tempo do jogador.
```

**Fantasia de poder:** “Meu time luta no Spire enquanto eu vivo. Quando volto, o mundo acordou um pouco — e a próxima decisão é minha.”

**Fantasia de coleção:** “Cada Relíquia é uma pessoa que o mundo esqueceu. Eu não puxo um unit; eu acordo alguém.”

**Fantasia social:** “A guilda é uma fortaleza cravada no pico. O hunt de sexta é o nosso rito.”

---

## 8. Implicações para produção (o que a pesquisa muda no plano)

1. **Web-first descarta Unity/Unreal** como cliente. Pixi/React, payload enxuto.
2. **Simulação no servidor** é o que separa “idle de verdade” de “deixe o emulador ligado”.
3. **Roster lançamento = 28 heróis jogáveis**, não 80. Qualidade > volume (lição Dislyte vs. AFK year-1).
4. **Sweep tickets e resonance** entram no 1.0, não como QoL tardio.
5. **Honor Duel-like** é o antídoto PvP contra paywall de roster — slotado no 1.0 late.
6. **Art pipeline industrial** (naming, slices, atlas, locale-safe UI) é tão crítico quanto o combate.
7. **Compliance de gacha** (odds, pity, compra direta, bloqueio BE) é desenho, não jurídico de última hora.

---

## 9. Fontes

1. Pride of Nindo — Google Play. https://play.google.com/store/apps/details?id=com.prideofnindo.gp
2. AFK Arena — Wikipedia. https://en.wikipedia.org/wiki/AFK_Arena
3. AFK Journey — Wikipedia. https://en.wikipedia.org/wiki/AFK_Journey
4. AFK Journey strategic guide (modos). https://vgtopup.com/apps/afk-journey
5. Games like Idle Heroes (2026). https://www.mobilegamereport.com/articles/best-games-like-idle-heroes-2026
6. Games like Raid (2026). https://www.mobilegamereport.com/articles/best-games-like-raid-shadow-legends-2026
7. Epic Seven community systems discussion. https://www.resetera.com/threads/epic-seven-ot2-the-tragic-edgy-version-of-ot1.290606/
8. AFK Arena scene art / Art Nouveau. https://www.creativebloq.com/art/digital-art/i-went-wild-with-warped-houses-gnarled-trees-and-jagged-shapes-how-tim-burton-influenced-the-creator-behind-afk-arenas-scene-art
9. Dislyte aesthetics. https://gbakery.substack.com/p/dislyte-aesthetics-leading-trend
10. Sword Master Story review. https://www.hardcoredroid.com/sword-master-story-review/
11. Sword Master Story — falta de offline. https://www.reddit.com/r/gachagaming/comments/uh0odo/sword_master_story_reroll_guide/
12. Gacha Idle — Steam. https://store.steampowered.com/app/3686710/Gacha_Idle/
13. Web game engines 2026. https://app.cinevva.com/guides/web-game-engines-comparison
14. Loot box / gacha regulation. https://gachawiki.com/wiki/gacha-regulation
15. Loot box laws 2025. https://blog.promise.legal/loot-box-laws-game-developers/
