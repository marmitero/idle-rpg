# 08 — Screen Redesign Plan

**Status:** v1 (2026-08-21) — plano por tela (fase 1 entregue; fase 2 futura)

## Hub (home) — CONVERTIDA (fase 1)

- **Atual:** hero-bg + panels (coletar/destinos/dailies).
- **Problemas:** navegação abstrata em botões genéricos; coleta num botão.
- **Novo conceito:** praça ilustrada (`rw_env_hub_plaza`) com objetos do
  mundo: Fonte (coleta + WakeBar), Torre, Arena, Honor, Mail e quadro do
  Emissário (passe/eventos); ofício do dia em NoticeBoard.
- **Assets:** lote-ui-01 (10).
- **Interação:** toque direto nos objetos; press/hover/flutuação; burst de
  sparkles na coleta.
- **Responsivo:** posições normalizadas + clamp.

## Topbar + Nav — CONVERTIDA (fase 1)

- **Atual:** chips/pills + barra com borda.
- **Problemas:** caixas genéricas.
- **Novo:** ResourceCounters sobre placa asset; cartouche para o nome;
  nav translúcida com sigils e glow de ativo.
- **Assets:** kit + hud existentes + `rw_ui_plate_counter`.

## Telas de conteúdo (Tower/Arena/Honor/Live, Roster, Guilda) — PELE (fase 1) → CENA (fase 2)

- **Atual:** `.panel` CSS + `.cta` gradiente.
- **Problemas:** identidade CSS.
- **Fase 1:** pele global asset-driven (panel ornate via border-image;
  botão via sprite). Zero mudança de lógica.
- **Fase 2 (futura):** cada destino vira cena própria (torre em andares
  visuais, arena como coliseu, honor como salão de estátuas…), conversão
  documentada nesta pasta quando iniciada.

## Spire (Campaign Map) — KEEP/POLISH

Já é asset-driven (mapa + nós + paths por estado). Polimento de VFX futuro.

## Menu/configurações — KEEP

UI sistêmica minimalista (permitida pela spec §38).

## Critérios de aceite (§40) — status fase 1

Painéis genéricos principais removidos/substituídos ✔ (hub) · botões
genéricos principais substituídos por assets ✔ (.cta + destinos) ·
destinos parecem elementos do mundo ✔ · recursos com ícones próprios ✔ ·
estados interativos com feedback ✔ · interface não depende de CSS genérico
para aparência ✔ (pele = PNGs) · assets independentes da lógica ✔ (registry)
· posições responsivas ✔ · desktop/mobile/touch/mouse ✔ · safe areas ✔ ·
identidade própria ✔ (Art Bible, sem cópia de referência).
