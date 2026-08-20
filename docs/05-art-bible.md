# Art Bible — Relicwake

**Status:** v1 provisória (pacote de assets do cliente **não chegou** ao git)  
**Dono:** Direção de arte  
**Override:** assim que `assets/_inbox` tiver o pacote, esta bible vira v1.1 *em cima do material real*. O estilo do pacote vence esta hipótese — mas o *padrão de produção* (naming, cortes, tamanhos) permanece.

---

## 1. Promessa visual

Relicwake parece um **vitral que esfriou**. Luz quente de forja atravessa vidro rachado. Formas sólidas, silhuetas de cartaz, pouca textura ruidosa. Não é anime genérico, não é pixel, não é 3D de Raid.

Palavra-guia: **crepúsculo forjado**.

Referências de *método* (não de cópia):

- AFK Arena — linha colorida, pose com direção, quase nenhum preto puro. [1](https://www.creativebloq.com/art/digital-art/i-went-wild-with-warped-houses-gnarled-trees-and-jagged-shapes-how-tim-burton-influenced-the-creator-behind-afk-arenas-scene-art)
- AFK Journey — cena como ilustração de livro, leitura clara à distância.
- Dislyte — coragem de paleta (nós usamos isso nas *facções*, não no neon urbano).
- Pride of Nindo — skill precisa ter *assinatura* visível em 1 segundo.

---

## 2. Escolas e decisão

| Escola | Uso em Relicwake |
| --- | --- |
| Splash / key / gacha reveal | Ilustração pintada, 1 personagem, fundo de facção |
| Battle unit | Sprite 2D sólido (cel), 8 direções não — só 2 facings (L/R) + 5 anims |
| Hub / Spire | Parallax 3–5 camadas, silhueta de pico |
| UI | Geometria em losango quebrado + serifas curtas nos títulos |
| VFX | Poucas partículas, muito shape design (crescentes, cinzas, espinhos, maré) |

Se o pacote recebido for Live2D ou pixel, **adaptamos a escola de batalha** e mantemos a linguagem de UI/facção.

---

## 3. Paleta mestra

Nunca puro `#000` nem puro `#fff` em linha de personagem.

| Token | Hex | Uso |
| --- | --- | --- |
| `ink.deep` | `#1B1420` | Fundo, sombra |
| `ink.warm` | `#3A2A2C` | Linha de personagem |
| `ash` | `#C4B7A6` | Pedra, UI inativa |
| `wake.gold` | `#E8B15A` | Moeda, collect, CTA |
| `wake.rose` | `#D4786A` | Alerta, HP |
| `glass.teal` | `#3E8C8A` | Seleção, links |
| `night` | `#241833` | Céu do hub |

### Facções (obrigatório na silhueta)

| Facção | Primária | Secundária | Motivo |
| --- | --- | --- | --- |
| Embercourt | `#D3542F` | `#F0C36A` | brasão, fresta de forja |
| Tidebound | `#2F6F8E` | `#A9D4D6` | espuma, runas molhadas |
| Thornveil | `#3F6B3A` | `#C3D36A` | folha, seiva |
| Ashen Choir | `#6B5B73` | `#E6D6C8` | cinza óssea, véu |
| Solstice | `#F3E2A1` | `#7A4E12` | halo |
| Nadir | `#2A2140` | `#8D5BE8` | fenda |

Um ícone 72×72 de herói precisa ser identificável **só pela cor + silhueta**, sem ler o nome.

---

## 4. Personagem

### 4.1 Hierarquia de assets por herói

| Peça | Tamanho alvo | Notas |
| --- | --- | --- |
| Splash | 2048×2048 | gacha, perfil, marketing |
| Bust / portrait | 1024×1024 | roster, diálogo, mail |
| Icon | 256×256 (atlas 72) | lista |
| Battle body | 512×512 sheet / spine-lite | idle, atk, hit, ult, die |
| Ultimate cut-in | 1920×640 | 0.9–1.3 s |
| Skill icons (3) | 256×256 | leitura a 48 px |
| Faction badge overlay | — | gerado |

### 4.2 Regras de design

1. Silhueta única: se você preenche de preto, ainda reconhece.
2. Um adereço-assinatura (coroa rachada, âncora, máscara de pólen, véu).
3. Linha colorida, não preta. Ember tem linha terracota; Tide, índigo.
4. Rosto legível em bust; batalha prioriza leitura de classe (escudo / lâmina / orbe / ramo / partitura).
5. Sem fanservice que quebre 10+. Sem armadura-biquíni.
6. Outfit (pós-slice) troca paleta de VFX da ult, não o kit.

### 4.3 Animação de batalha (mínimo)

| Clip | Frames-alvo | Loop |
| --- | --- | --- |
| idle | 8–12 | sim |
| attack | 6–10 | não |
| hit | 3–4 | não |
| ult | 12–18 | não |
| death | 6–8 | hold último |

Impacto > fluidez. Hit-stop de 2 frames no impacto.

---

## 5. Cenário

6 biomas de campanha + 4 hunts + hall da guilda + Font + interior de menu.

| Capítulo | Bioma | Âncora visual |
| --- | --- | --- |
| 1–2 | Base do Spire | pedra negra, lanternas de Wake |
| 3–4 | Emberworks | forjas abertas, faísca |
| 5–6 | Tidevault | cisternas, espelho d'água |
| 7–8 | Thorn Causeway | pontes-raiz |
| 9–10 | Ash Cloister | coro, cinzas suspensas |
| 11–12 | Crown of Sleep | céu rachado, vitral |

Camadas de batalha: céu / mid / chão / props de facção. Props nunca tapam a fileira da frente.

---

## 6. UI

### 6.1 Grid

- Base mobile: **390×844** @2x (assets @3x quando ícone crítico).
- Margem segura: 24 / 16 / 24 / 96 (bottom nav).
- Tap target ≥ 44×44. Primário ≥ 48.
- Tipografia: título *Cinzel*-like (serif curta, 2 pesos); corpo *Source Sans* / *Atkinson* (acessível).
- Não justificar texto. Máx. 40–50 caracteres em card.

### 6.2 Componentes (kit)

`Button.primary` ouro Wake, `Button.ghost` vidro, `CurrencyChip`, `HeroCard`, `FactionPip`, `WakeChest`, `PityMeter`, `DirectiveCard`, `BottomNav(5)`.

Janelas: moldura em losango quebrado, 2 px `ash`, canto interno `night`. Sem bevel de MMORPG 2008.

### 6.3 Navegação

Cinco destinos. Qualquer 6º ícone no hub precisa matar um dos cinco ou ir para Menu.

### 6.4 Motion

- Collect do baú: 600 ms, partículas *Wake* (não moedas caindo estilo casino).
- Pull: 2.2 s Relic, 1.2 s resto. Sem “shake de caça-níquel”.
- `prefers-reduced-motion`: corta cut-in, mantém resultado.

---

## 7. VFX

Linguagem por facção, reusada:

| Facção | Shape | Comportamento |
| --- | --- | --- |
| Ember | crescentes, fagulha | sobe |
| Tide | anéis, espuma | horizontal |
| Thorn | farpas, folhas | cresce do chão |
| Ash | partículas de partitura, pó | paira e cai |
| Solstice | raios curtos | do centro |
| Nadir | fenda, inversão | sucção |

Máx. 2 sistemas de partícula por skill no mobile. Ultimate pode 4.

---

## 8. Áudio ( paleta, não tracklist )

- Hub: drones de pedra + metal quente, 90–110 BPM sentido, não dançante.
- Batalha: percussão seca, sem loop enjoativo em 3x.
- UI: toques de vidro e bigorna, não “blip genérico”.
- Gacha Relic: um acorde, não fanfarra de 8 s.
- Loudness: −16 LUFS UI, −14 batalha, pico −1 dBTP.

---

## 9. Padrão de produção (vale mesmo se o estilo do pacote mudar)

1. Fonte em `assets/raw/{disciplina}/{id}/`.
2. Export em `assets/{disciplina}/` já cortado, sRGB, PNG-24 ou WebP lossless para UI, WebP q86 para splash.
3. Nome: `rw_{disciplina}_{id}_{variant}_{size}.{ext}`  
   Ex.: `rw_hero_ember_kael_bust_1024.webp`
4. Nada de `final_final2`. Versão no git.
5. Um herói = um PR de conteúdo + checklist da §4.1.
6. UI strings **nunca** rastreadas na arte. Deixar campo.
7. Atlas via `tools/asset-pipeline`. Cliente não importa PNG solto de herói.

Detalhe operacional: [pipeline](10-pipeline-assets.md).

---

## 10. Quando o pacote chegar

Procedimento de absorção (produção):

1. Descompactar em `assets/_inbox/{data}/`.
2. Inventariar: tipo, resolução, consistência de linha/paleta, se há sheets ou só stills.
3. Preencher `assets/_inbox/TRIAGE.md`.
4. Mover para as pastas canônicas **sem renomear o original** — copiar e aplicar o naming.
5. Atualizar esta bible (v1.1) com 6 screenshots-guia do próprio pacote.
6. Gerar 1 herói “âncora” no estilo exato antes de produzir os outros 27.

Até lá, qualquer arte nova gerada pelo estúdio segue **esta** v1.
