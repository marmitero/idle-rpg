# ADR 0004 — Shell retrato-canônico, um cliente

- **Status:** aceito
- **Data:** 2026-08-20

## Contexto

O jogo precisa ser o mesmo no Chrome de PC, no Safari do iPhone e no Android. Dois layouts (landscape web + retrato mobile) dobram UI e QA. Idle-gacha é um gênero de uma mão.

## Decisão

- Um palco de 390–480 px de largura, retrato.
- Desktop = palco centrado + rails opcionais.
- Tablet = palco + uma rail.
- Telefone landscape do hub = recusar / pedir rotação no 1.0.
- Frames ornados via 9-slice. Medida pelo container, não por UA.

Detalhe: [docs/12-responsividade.md](../12-responsividade.md).

## Consequências

- CSS em container queries (`@container`) sempre que possível.
- Pixi recebe o retângulo do palco, não a janela.
- Design nunca entrega mock “1920 hero website”.
