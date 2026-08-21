# Responsividade — Relicwake

**Status:** v1 travada  
**Dono:** Client + UI  
**Superfícies:** navegador PC, tablet, Android, iPhone (PWA e Capacitor)  
**Decisão-mãe:** um único cliente. Não existe “versão mobile” e “versão desktop”. Existe um **estágio** (stage) que se ancora de formas diferentes.

---

## 1. Princípio

O jogo é **retrato-canônico**. Idle-gacha se lê com uma mão, polegar na barra inferior, baú no centro. No PC o mesmo palco fica no meio da janela; as laterais são *ornamento útil*, nunca o caminho crítico.

```
telefone / PWA / app          tablet                     desktop browser
┌─────────────┐            ┌──────────────────┐      ┌─────┬──────────┬─────┐
│  safe top   │            │  hub  │  rail    │      │lore │  STAGE   │chat │
│    HUD      │            │       │  roster  │      │     │  390–480 │     │
│   STAGE     │            │       │          │      │     │  retrato │     │
│   (390)     │            └──────────────────┘      └─────┴──────────┴─────┘
│  bottom nav │
└─────────────┘
```

Se uma ação não cabe no stage de 390×844, ela não existe.

---

## 2. Tokens de layout

Unidade: **dp lógico** (CSS `px` em `device-width`). Arte é desenhada @2x/@3x e *nunca* em pixels de device.

| Token | Valor | Uso |
| --- | --- | --- |
| `--stage-w` | 390 | largura do palco canônico |
| `--stage-h` | 844 | altura de referência (iPhone 14) |
| `--stage-max` | 480 | teto do palco em desktop/tablet |
| `--gutter` | 16 | margem interna |
| `--gutter-safe` | `max(16px, env(safe-area-inset-*))` | notch / home indicator |
| `--nav-h` | 64 + inset bottom | bottom nav |
| `--top-h` | 52 + inset top | moedas / settings |
| `--tap` | 44 | mínimo tocável |
| `--tap-primary` | 48 | CTA |
| `--type-min` | 13 | corpo mínimo |
| `--type-title` | 20 / 24 / 28 | compact / regular / expanded |
| `--radius` | 10 | cards internos (frames ornados têm o próprio) |

### Breakpoints (container, não user-agent)

| Nome | Largura da *janela* | Comportamento |
| --- | --- | --- |
| `compact` | < 600 | palco 100% largura, retrato, 1 coluna |
| `regular` | 600–1023 | palco centrado até 430, rail opcional |
| `expanded` | ≥ 1024 | palco 430–480 + 2 rails 240–320 |
| `ultrawide` | ≥ 1600 | rails crescem, palco **não** passa de 480 |

Orientação:

| Device | Hub / meta | Batalha |
| --- | --- | --- |
| Telefone retrato | canônico | canônico |
| Telefone landscape | lock de orientação **ou** aviso “gire” (não redesenhar o hub) | opcional: canvas 16:9 letterboxed |
| Tablet | 2 colunas | canvas maior, HUD nas bordas |
| Desktop | palco + rails | canvas no palco, speed/ult no rodapé do palco |

Não há layout landscape do *hub*. Evita dois produtos.

---

## 3. Viewport e PWA

```html
<meta name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=2">
```

- `theme-color` = `ink.deep` `#1B1420`.
- `display: standalone` no manifest.
- `env(safe-area-inset-top/bottom/left/right)` em `#app` e na bottom nav.
- `100dvh` (não `100vh`) para a barra do iOS Safari.
- `overscroll-behavior: none` no root — pull-to-refresh não pode roubar o collect.
- `-webkit-tap-highlight-color: transparent`.
- `touch-action: manipulation` nos botões (sem double-tap zoom).
- Fonte do sistema **não** substitui o kit; `text-size-adjust: 100%` + respeito a `html { font-size }` até 130% (acessibilidade).

Capacitor: `contentInset: automatic`, StatusBar overlay, splash na cor `ink.deep`.

---

## 4. Shell por superfície

### 4.1 Compact (telefone)

```
[ inset-top ]
[ gold | letters | fate | ⚙ ]     52
[         conteúdo          ]     flex
[ Hub Roster Battle Guild Menu ]  64 + inset-bottom
```

Cinco destinos. O conteúdo *nunca* passa por baixo da nav (padding-bottom = `--nav-h`).

### 4.2 Regular (tablet / janela média)

Hub em 2 colunas: esquerda Spire + baú, direita atalhos (Font, Hunt, daily).  
Bottom nav permanece — consistência motora.

### 4.3 Expanded (PC)

```
rail esquerdo          STAGE               rail direito
lore do capítulo       mesmo hub           chat da guilda
ou diretivas           390–480 × 100dvh    ou mail
```

Regras:

1. Rails **somem** se a janela ficar < 1024 (não esmagar o palco).
2. Fundo fora do palco: vinheta do Spire, não branco de site.
3. Clique fora de modal fecha. Esc fecha. Enter confirma CTA.
4. Hover é *açúcar* (brilho no botão). Todo controle tem estado `:active` e teclado.

### 4.4 Preview / iframe (sandbox)

O cliente aceita qualquer `Host`. Sem allowlist de origem no Vite. API por URL relativa. O palco se mede pelo **container**, não por `window.screen`.

---

## 5. Tipografia e densidade

| Peça | Compact | Expanded |
| --- | --- | --- |
| Título de tela | 20 | 24–28 |
| Moeda no chip | 13 | 14 |
| Card de herói (nome) | 14 | 16 |
| Botão | 15 / height 48 | 16 / height 52 |
| Lista de 5 heróis | 72-tall rows | 80-tall |

Nunca mais de **2** tamanhos de tipo numa barra.  
Quebra de linha PT-BR é orçada: labels de botão ≤ 18 caracteres (EN ≤ 16).

---

## 6. Grade e 9-slice (UI ornada)

O pacote é **ouro + marinho + cantos em losango**. Esses frames **não** esticam como PNG inteiro — distorce o filigrana.

### 6.1 Fatias (insets em px do asset 256)

Valores iniciais — calibrar no slice visual:

| Asset | left | top | right | bottom | Notas |
| --- | --- | --- | --- | --- | --- |
| `rw_ui_button_256` | 28 | 20 | 28 | 20 | stretch só o fill marinho |
| `rw_ui_button_press_256` | 28 | 20 | 28 | 20 | mesmo inset |
| `rw_ui_panel_ornate_256` | 36 | 36 | 36 | 36 | cantos de gema fixos |
| `rw_ui_header_cartouche_256` | 72 | 20 | 72 | 20 | laterais enroladas fixas |
| `rw_ui_bar_bg_256` / fill | 12 | 10 | 12 | 10 | barra de XP/HP |
| `rw_ui_frame_*` | 40 | 40 | 40 | 40 | raridade; centro transparente |

Implementação: CSS `border-image` **ou** NineSlice no Pixi para HUD de batalha. Uma função `slice(token)` no `@relicwake/ui`.

### 6.2 O que *não* é 9-slice

- Retratos 512 e ícones 256 — scale uniforme (`object-fit: contain`).
- Gemas de canto (`rw_ui_corner_gem`) — decoração absoluta nos 4 cantos de telas cheias, escondida em `compact` se roubar tap.

---

## 7. Batalha (Pixi)

Campo lógico: **720×1280** unidades (mesmo aspecto 9:16 do palco).

```
scale = min(stageW/720, battleH/1280)
offset = centralizar
```

- Em desktop o canvas *não* abre para 1920. Fica no palco.
- Em landscape opcional: campo vira 1280×720, posições de herói remapadas (frente = esquerda). **Fase 2.** 1.0 pode recusar landscape.
- Partículas e cut-in em coordenadas lógicas.
- Ult button: 72×72, canto inferior direito do canvas, acima da nav (ou no lugar da nav durante a luta — a nav some na batalha).

Durante a batalha compact:

```
[ back ]  [ 1x 2x 3x ]  [ skip ]
[           canvas            ]
[ diretivas ativas ][ ults 5 ]
```

---

## 8. Input

| | Touch | Mouse / trackpad | Teclado |
| --- | --- | --- | --- |
| Primário | tap 44+ | click | Enter / Space |
| Secundário | long-press 350 ms (info) | hover + right-click = info | I / F |
| Scroll | lista nativa | wheel | setas |
| Drag (formação) | pointer events unificados | idem | 1–5 seleciona slot |

Proibido: hover-only tooltips como única forma de ler skill.  
`pointer: coarse` aumenta slop de drag em 8 px.

---

## 9. Imagens e DPI

| Uso na tela | Asset fonte | Display |
| --- | --- | --- |
| Ícone de nav / moeda | 256 | 28–32 css |
| Ícone de item em lista | 256 | 48–56 |
| Card de herói | bust 512 + frame 256 | card 112–160 |
| Retrato de perfil / gacha | bust 512 | até 280 no palco |
| Painel | 9-slice 256 | qualquer |

`srcset` não é necessário se o bundle já é 256/512 (cobre @3x de um ícone de 56).  
WebP na pipeline; PNG do pacote é o master.

---

## 10. Telas críticas — comportamento

| Tela | Compact | Expanded |
| --- | --- | --- |
| Hub | Spire full-bleed, baú no terço inferior, 4 atalhos | Spire + baú; atalhos no rail |
| Roster | grid 3 col | grid 3 no palco; detalhe no rail |
| Font (gacha) | pull full-screen | pull no palco; odds no rail |
| Batalha | ver §7 | idem, speed no topo do palco |
| Guilda | lista → detalhe push | lista + detalhe lado a lado |
| Loja | 1 coluna | 2 colunas no palco |

Modais: sheet de baixo em compact (max 92dvh), dialog centrado em expanded (max 480×720).

---

## 11. Acessibilidade ligada à tela

- Contraste AA no texto sobre `ink.deep` e sobre o fill marinho dos botões (`#C4B7A6` em `#1B1420` passa; ouro `#E8B15A` em marinho precisa de stroke).
- `prefers-reduced-motion`: sem cut-in, baú em fade.
- `prefers-reduced-transparency`: painéis opacos.
- Zoom do SO até 130% sem clipar CTA.
- Foco visível 2 px `wake.gold` no desktop.

---

## 12. Performance por superfície

| | Telefone mid | Desktop |
| --- | --- | --- |
| Atlas de hub | 1 | 1 |
| Atlas de batalha | sob demanda | sob demanda |
| Parallax camadas | 3 | 5 |
| Partículas / skill | 2 sistemas | 4 |
| FPS alvo | 30 | 60 |

Se `compact` e `save-data` / RAM < 3.5 GB: desliga parallax extra e cut-in.

---

## 13. QA de responsividade (aceitação)

Device matrix mínima (já no QA):

1. iPhone SE (375×667) — nada clipado, nav usável, baú tocável.
2. iPhone 14 / 15 (390×844) — referência visual.
3. Android 360×800 e 412×915.
4. iPad 768×1024 retrato.
5. Desktop 1280×720 e 1920×1080.
6. Janela 500×800 (usuário que redimensiona).
7. Safari iOS PWA standalone (safe-area).
8. Chrome Android com teclado aberto numa tela de nome — CTA não some atrás.

Checklist por PR de UI:

- [ ] Palco não passa de 480.
- [ ] Safe-area testada.
- [ ] 9-slice não estica canto.
- [ ] Tap ≥ 44.
- [ ] Sem hover-only.
- [ ] Batalha letterbox correta.
- [ ] PT-BR não quebra botão.

---

## 14. Relação com o pacote de arte

Os PNGs vieram **quadrados 256 / 512**. Isso é *bom* para responsividade: ícones não têm aspect “de banner”.  
O que o pacote **não** traz — e a tela precisa — está no [catálogo](../assets/CATALOG.md) (fundos, frames 9-slice calibrados, HUD de guilda/Font). Até existirem, o shell usa cor sólida `ink.deep` + frame `panel_ornate`.
