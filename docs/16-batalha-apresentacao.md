# Apresentação de batalha — composição, desempenho e áudio

**Status:** v1 (2026-08-21)  
**Dono:** Client / Arte / Áudio  
**Aplica-se a:** `apps/web/src/ui/BattleView.tsx`, `apps/web/src/battleAssets.ts`, `apps/web/src/audio.ts`

Revisão do modo batalha após o primeiro playtest: posicionamento, escala,
desempenho de carga e som. Referências externas citadas ao longo do texto.

---

## 1. Composição — zonas, fileiras e escala

### 1.1 O que a pesquisa indica

- Em side-views de RPG, a **linha de frente fica maior e mais baixa**; a linha
  de trás fica **menor e mais alta** (profundidade 2.5D) — distribuição
  automática com margens, nunca amontoada [1](https://kadajah.itch.io/kadajahs-frontviewx).
- Layouts de jogo mobile usam **unidades relativas à tela** (percentuais), não
  pixels fixos, para sobreviver a qualquer resolução/aspecto; a escala dos
  personagens deve permanecer dentro de uma faixa definida do valor de
  referência (90–110%) [2](https://cursa.app/en/page/mobile-screen-resolution-aspect-ratios-and-safe-areas) [3](https://moldstud.com/articles/p-mobile-game-development-designing-for-different-screen-sizes).
- Em idle-gacha (AFK Arena e derivados), o palco é lido como **duas metades**
  (time × inimigos) com formação 3+2 ou 2+2+1 e sprites que ocupam cerca de
  **1/5 a 1/4 da altura do palco** cada — o bastante para ler silhueta e
  facção, sem esconder o vizinho.

### 1.2 Spec aplicada ao Relicwake (tudo relativo ao canvas do Pixi)

| Zona | Faixa X (× largura) |
| --- | --- |
| Aliados | **10% → 42%** (esquerda) |
| Inimigos | **58% → 90%** (direita) |

| Fileira | Y (pés, × altura) | Escala de profundidade |
| --- | --- | --- |
| Frente (slots 0–1) | 0.80 | ×1.04 |
| Meio (slots 2–3) | 0.54 | ×0.98 |
| Topo (slot 4, centralizado) | 0.28 | ×0.92 |

| Medida | Valor |
| --- | --- |
| Altura do herói/fodder | **19% da altura do canvas** |
| Altura de boss | **26% da altura do canvas** |
| Largura máxima por unidade | **15% da largura do canvas** (cabe na coluna) |
| Âncora do sprite | (0.5, 0.9) — pés no ponto da fileira |
| Clamp de escala | 0.05–0.32 (qualquer arte de origem) |
| **Orientação canônica** | Arte desenhada mirando para a **ESQUERDA**. Aliados (esquerda) são espelhados para mirar à direita; inimigos (direita) mantêm a orientação → times **frente a frente**. Regra vale também para os lotes 17+ (atk/hit/die/ult). |

A escala é calculada **por textura** (`targetH / tex.height`), então os assets
de tamanhos variados (1024², 1376×768, 1152×922…) normalizam sozinhos. Sem
pixels fixos — a composição sobrevive a PC, tablet e telefone.

### 1.3 Linha do chão — como identificar e o padrão proposto

**Diagnóstico (2026-08-21):** as fileiras usam Y fixo (frente 0.80, meio 0.54,
topo 0.28 da altura), mas cada plate desenha o chão numa altura diferente →
alguns personagens "voam". Os pés dentro dos sprites **não** são o problema
(medição: todos os idles têm pés entre 0.90 e 1.0 da altura do sprite — âncora
0.9 correta).

**Como identificar o chão de cada plate (duas ferramentas):**

1. **`tools/asset-pipeline/floor_scan.py`** — mede bordas horizontais e textura
   por linha e imprime candidatos (%) para os 10 plates de batalha. Não "vê"
   a imagem: os candidatos precisam de validação visual.
2. **Overlay `?floordebug`** — abra o jogo com `?floordebug` na URL e inicie
   uma batalha: aparece uma grade azul de 5 em 5% (30–95%) com rótulos, e as
   fileiras atuais em vermelho. **Leia o rótulo % da linha azul que coincide
   com o chão desenhado no plate** — esse é o valor a registrar.

**Padrão proposto (aguardando validação dos valores):**

| Peça | Regra |
| --- | --- |
| Fonte de verdade | `BATTLE_FLOOR: Record<bgId, number>` no `@relicwake/content` — chão como % da altura do plate (1:1 com o canvas, pois o plate é esticado) |
| Frente (slots 0–1) | pés exatamente em `FLOOR` |
| Meio (slots 2–3) | pés em `FLOOR − 0.10` com escala de profundidade (menor) |
| Topo (slot 4) | pés em `FLOOR − 0.20` com escala de profundidade |
| Âncora do sprite | 0.9 (pés) — validada pela medição |
| Fallback | 0.82 se o plate não estiver na tabela |

> Opção em aberto (decisão com o usuário): se os plates tiverem apenas UMA
> linha de chão, as fileiras de trás leem como "atrás" (perspectiva, padrão
> idle-gacha) em vez de plataformas — ou, no futuro, os plates ganham
> degraus/plataformas desenhados para as fileiras 2 e 3.

---

## 2. Desempenho de carga

### 2.1 Problema encontrado

O BattleView carregava ~50 PNGs **sequencialmente** (`await` por textura, por
ator) — cada PNG de batalha tem 0.5–1.8 MB, então a tela travava por muitos
segundos antes do primeiro frame.

### 2.2 Feito nesta revisão

1. **`apps/web/src/battleAssets.ts`** — `preloadBattle(input, bg)` baixa todas
   as texturas da batalha **em paralelo** (pool de 8 conexões) antes de montar
   os sprites; `loadTex()` deduplica requisições em voo e reusa o cache.
2. **Cache em memória do Pixi** — a segunda batalha/replay é instantânea
   (nenhuma requisição de rede).
3. Medição embutida: o diag reporta `preload N texturas em Xms` no log da API.

### 2.3 Opções avaliadas para o futuro (não são regra — decidir com dados)

| Opção | Custo | Ganho estimado | Veredito preliminar |
| --- | --- | --- | --- |
| **AVIF/WebP** via pipeline (`assets:finalize --format webp`) com fallback PNG | Encoder no CI (pillow/livvips), detecção de suporte no loader | PNGs de pixel art perdem pouco com lossless WebP; AVIF lossy pode borrar contornos finos [4](https://www.dunetools.com/guides/webp-vs-avif-2026/) [5](https://eastondev.com/blog/en/posts/dev/20251203-astro-image-optimization-guide/) | **Válida**, mas com cuidado: pixel art HD + contorno grosso = **WebP lossless ou AVIF q80+**; nunca AVIF lossy agressivo [6](https://jpeg.top/converting-comic-art-to-responsive-web-comics-jpeg-vs-webp-v) |
| **Cache imutável em produção** (nome de arquivo com hash + `Cache-Control: immutable`) | Ajuste no build/deploy | Re-carregamentos ~0 na mesma versão; sem cache-bust manual [6](https://jpeg.top/converting-comic-art-to-responsive-web-comics-jpeg-vs-webp-v) | **Válida** — combina com o passo 1 e com o manifesto do pipeline |
| **Atlas/spritesheet** por disciplina (`tools/asset-pipeline` já prevê) | Tooling do atlas + coordenadas no content | 50 requests → ~6 requests por batalha | **Forte candidata** para o 1.0 — é o padrão do gênero |
| Lazy-load por fase (idle primeiro, resto ao entrar em combate) | Lógica de prioridade | Primeiro frame mais cedo em redes lentas | Opcional — hoje o pool paralelo já resolve |
| Downscale de masters (battle ≤1024px) no pipeline | 1 passo no `assets:finalize` | Menos bytes para decodificar | Válida se a memória em mobile (Capacitor) apertar |

> Nota: o dev server do Vite responde `Cache-Control: no-cache`, então testes
> de re-carga no preview não refletem o ganho do cache imutável — medir em
> build de produção.

---

## 3. Áudio de batalha

### 3.1 Referências gratuitas pesquisadas (para inclusão futura)

Fontes consolidadas e bem avaliadas de SFX/música com licença livre
(CC0/CC-BY) [7](https://gamineai.com/blog/12-best-free-sound-effect-libraries-game-developers) [8](https://www.reddit.com/r/gamedev/comments/zkolpf/does_anyone_have_or_know_of_any_free_boss_battle/):

- **Freesound** (freesound.org) — busca por tag + filtro CC0;
- **OpenGameArt** (opengameart.org) — seção de SFX/loops voltada a jogos;
- **Kenney.nl** — packs CC0 (impactos, UI, power-ups, música).

> ⚠️ A rede do ambiente atual bloqueia esses hosts. **Decisão desta revisão:**
> síntese interna em camadas **baseada no desenho desses packs** (whoosh +
> impacto, kick sequenciado, hats, rise + boom) — a API (`playSfx`/`setBed`)
> não muda, então trocar síntese por arquivos CC0 depois é plug-and-play,
> com créditos no `assets/audio/README.md`.

### 3.2 Implementado em `apps/web/src/audio.ts`

| Som | Desenho em camadas |
| --- | --- |
| `hit` (ataque) | whoosh de ruído agudo (HP 900Hz) + glide square 380→150Hz |
| `crit` | whoosh mais brilhante (HP 2.4k) + glide saw + anel metálico 1.5kHz |
| `ult` | rise grave 90→38Hz + swell de ruído lowpass + shimmer de 3 notas |
| `death` | gliss descendente 320→50Hz + corpo de ruído |
| `win` / `lose` | arpejo maior triádico / descendente menor com filtro |
| `collect` / `pull` | coin de duas notas / whoosh de revelação + arpejo |
| `ui` | tick curto |
| **Cama de batalha** | sequenciador 112 BPM: kick 4×4, hats no contratempo, baixo A1/E2 alternado por barra, pad harmônico — agenda por lookahead (150ms), para instantâneo ao sair |

### 3.3 Pendências de áudio (já na fila)

- Baixar 1 pack CC0 de impacto + 1 loop de batalha quando a rede permitir;
  substituir síntese e registrar créditos;
- Música de hub/batalha em stems (fase 3 do roadmap);
- Loudness e master de loja (docs/03-roadmap, disciplina Áudio).
