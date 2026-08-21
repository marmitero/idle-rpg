# 05 — Responsive Game UI

**Status:** v1 (2026-08-21) · Base: docs/12-responsividade.md, docs/campaign/08

## Superfícies

Desktop/laptop (mouse), Android, iPhone, tablets (touch) — mesmos assets,
layout responsivo. Estágio central (`--stage: min(480px, 100%)`), sem arte
de resolução única.

## Hub (cena)

- Posições dos objetos em **coordenadas normalizadas** (0..1) do contêiner
  da cena — mudam de asset sem tocar em layout (docs/ui-redesign/04).
- Tamanho dos objetos: `clamp()` com escala base por objeto
  (ex.: torre `clamp(96px, 30vw, 150px)`), âncora central, área de toque
  ≥ 48px (pode exceder o sprite — padding invisível).
- Rótulos sob o objeto, nunca atrás de safe areas.

## HUD / nav

- Topbar: altura = `52px + env(safe-area-inset-top)`; contadores compactos
  (ícone 22–24px + número), placa asset dimensiona junto.
- Nav: `64px + env(safe-area-inset-bottom)`; sigils 28px com área de toque
  44px+; sem hover-dependência.

## Interação mouse/touch (docs/06)

- Hover só em `@media (hover: hover)`; em touch os estados press/active
  cobrem o feedback.
- `prefers-reduced-motion: reduce` desliga flutuação/pulso/sparkles grandes.

## Aspect ratios

Testados 16:9, 18:9, 19.5:9, 20:9, tablet — posições % + clamp mantêm a
composição; a cena do hub não depende de medidas absolutas.
