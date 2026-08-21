# 01 — Visual UI Direction

**Status:** v1 (2026-08-21) · **Dono:** Direção de arte / Client

## Objetivo visual

Deixar de parecer "aplicação web com elementos de jogo" e passar a parecer
"um mundo de jogo com elementos interativos". A interface é construída com os
**assets do próprio jogo** (kit ouro/navy, sprites, plates, objetos ilustrados),
em direção **diegetic-inspired** — sem copiar qualquer referência externa: a
identidade continua 100% Relicwake (Art Bible: *crepúsculo forjado, em pixel*).

## Princípio fundamental

> O código controla a interface. Os assets definem a aparência.

Código = posição, escala, estado, interação, animação, dados, responsividade.
Assets = aparência (sprites, ilustrações, ornamentos, placas, objetos).

## O que desaparece

- `border`, `border-radius`, `box-shadow` e gradientes CSS como identidade
  visual de painéis e botões;
- botões retangulares genéricos para **destinos** (viram objetos do mundo);
- pills/caixas de recurso no HUD (viram ícone + contador sobre placa asset);
- container de "coletar Wake" (vira interação direta com a Fonte, objeto do mundo).

## O que permanece

- Todo texto (nomes, números, instruções, feedback) — acessibilidade;
- estrutura de telas/tabs e toda a lógica (estado, save, navegação);
- UI puramente sistêmica (Menu/configurações, confirmações) com visual
  minimalista — sem embelezamento diegético forçado;
- a direção de arte já travada (docs/05-art-bible.md).

## Hierarquia de camadas (docs/06 §camadas)

Background → Environment → Decorations → Interactive World Objects →
Characters/Effects → HUD → Temporary Feedback → System UI. Nada mais vive
"numa única camada" de caixas.

## Regras de uso

1. Pergunta obrigatória antes de criar componente visual (spec §42):
   precisa ser painel? pode ser objeto do mundo? sprite? ícone? integrar ao
   cenário? interação direta sobre o asset? funciona mouse+touch? é coerente
   em qualquer tela?
2. Painel só quando fizer sentido artístico — e então **como asset**
   (moldura ornamentada do kit), nunca caixa desenhada por CSS.
3. Elemento sistêmico pode ficar tradicional se for melhor para UX.
4. Nenhuma decisão visual copiada de referência externa; paleta/forma vêm
   da Art Bible (ouro `#E8B15A`, navy `#241833`, tinta `#1B1420`).
