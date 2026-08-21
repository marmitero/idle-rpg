# 04 — Screen Asset Map

Mapeamento elemento-atual → nova representação (auditoria de código,
2026-08-21).

## Topbar (HUD)

| Atual | Problema | Nova |
| --- | --- | --- |
| `.chip` ouro (pill) | container genérico | `ResourceCounter`: ícone ouro + número sobre `rw_ui_plate_counter` |
| `.chip` letters | idem | `ResourceCounter` letters |
| `.chip` "poeira N" | idem | `ResourceCounter` dust (ícone `rw_currency_dust`) |
| nome do Waker (span) | solto | sobre `rw_ui_header_cartouche` |

## Nav inferior

| Atual | Problema | Nova |
| --- | --- | --- |
| barra `.nav` com fundo e border-top | caixa de app | barra translúcida sem borda; sigils (assets existentes) com glow no ativo |

## Hub — home

| Atual | Problema | Nova |
| --- | --- | --- |
| `hero-bg` (placa antiga) | cenário estático | `rw_env_hub_plaza` (plate novo) |
| panel "O Spire dorme" + botão coletar | caixa + botão genérico | **Fonte (objeto do mundo)** clicável + `WakeBar` sob ela; coletar = tocar na Fonte |
| panel destinos com 4 `.cta` | navegação abstrata | **4 World Objects** (torre/arena/honor/emissário) + mail → dados `HUB_WORLD` |
| panel "Ofício do dia" (lista) | caixa genérica | `NoticeBoard` (quadro diegético) com a lista |

## Demais telas (fase 1: pele global)

| Tela | Atual | Nova |
| --- | --- | --- |
| Tower/Arena/Honor/Live panels | `.panel` CSS | mesmo conteúdo, pele `rw_ui_panel_ornate` + `.cta` asset (fase 2 converte em cenas) |
| Roster/Formação | panels + cards | pele global agora; cena própria na fase 2 |
| Spire (Campaign Map) | já asset-driven (nós/paths SVG) | KEEP/POLISH |
| Guilda | panels | pele global agora; fase 2 |
| Menu/configurações | system UI | KEEP (minimal system UI permitida) |

## Interações por objeto (spec §32 — data-driven)

```json
{ "id": "tower", "type": "destination", "asset": "rw_obj_hub_tower",
  "position": { "x": 0.5, "y": 0.30 }, "action": "open_tower" }
```
