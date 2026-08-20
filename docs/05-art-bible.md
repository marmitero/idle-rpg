# Art Bible — Relicwake

**Status:** v1.1 **travada no pacote real** (82 PNGs em `origin/main`, 2026-08-20)  
**Dono:** Direção de arte  
**Override cumprido:** o pacote venceu a hipótese v1 (vitral/AFK). Escola oficial = **HD pixel ilustrado + UI ouro/navy**.  
**Catálogo:** [`assets/CATALOG.md`](../assets/CATALOG.md) · **Tela:** [`docs/12-responsividade.md`](12-responsividade.md)  
**Geração:** [`docs/13-regras-de-geracao.md`](13-regras-de-geracao.md) — fundo `#FF00FF`, 10 por lote. Magenta é cor proibida no sujeito.

---

## 1. Promessa visual

Relicwake parece um **grimório pixelado de forja**. Bustos pintados em HD pixel (contorno grosso, cel, metal com rebite), molduras de ouro sobre marinho, itens que lêem a 48 px. Não é anime Live2D, não é vitral AFK, não é 3D de Raid.

Palavra-guia: **crepúsculo forjado, em pixel**.

Âncoras *do próprio pacote* (copiar estes, não Pinterest):

- `portrait_warrior` / `portrait_mage` — massa, linha, luz de ¾.
- `frame_lendario` + `ui_panel_ornate` — filigrana ouro, fill navy.
- `icon_equip_weapon_t3` / `icon_ember_heart` — item ilustrado.
- `icon_stat_hp` / `icon_ui_home` — HUD chapado (família B).

Referências externas só de *método*: Idle Heroes / Sword Master Story (pixel de impacto), AFK só na *leitura de silhueta*.

---

## 2. Escola travada

| Peça | Escola | Fonte |
| --- | --- | --- |
| Retrato / gacha / perfil | HD pixel bust 512, fundo transparente | pack |
| Ícone de roster | 256 contain do bust | derivado |
| Item / material / raid | HD pixel 256, ¾, transparente | pack |
| HUD / stat / nav | Pixel chapado, silhueta de brinquedo | pack família B |
| Frame de raridade | Moldura 256, centro oco | pack + common gerado |
| Chrome (botão, panel, barra) | Ouro + navy, **9-slice** | pack |
| Battle unit (a produzir) | Mesma linha do bust, corpo ¾, 2 facings | *falta* |
| Hub / bioma (a produzir) | Pixel pintado, 3 camadas, paleta do pack | *falta* |

Qualquer arte nova que pareça “oil painting”, chibi anime ou flat material design está **fora**.

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
| Splash | 1024–2048 (ainda não há) | gacha full; até existir, usa bust 512 |
| Bust / portrait | **512×512** (pack) | roster, diálogo, mail, reveal |
| Icon | **256×256** | lista, nav, item |
| Battle body | 512 sheet (a produzir) | idle, atk, hit, ult, die |
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

## 10. Absorção (feita)

1. Pacote achado em `origin/main` (raiz, 82 PNG).
2. Cópia intacta em `assets/_inbox/2026-08-20_main-dump/`.
3. `TRIAGE.md` preenchido. Originais de retrato também em `assets/raw/characters/`.
4. Runtime em pastas canônicas com `rw_*`.
5. Esta bible = v1.1.
6. Âncora de personagem: `rw_hero_warrior_bust_512` + `rw_hero_mage_bust_512`.

Arte nova (complemento ou roster) copia **esses** dois bustos + `frame_lendario` + `icon_ember_heart`.
