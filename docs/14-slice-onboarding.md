# Slice — campanha, áudio, ofício (tutorial)

**Status:** v1 no vertical slice  
**Dono:** design + client

## Campanha do slice

Capítulos 1 e 2, 20 stages cada (40 no total). IDs `1-1` … `2-20`. Bosses em `1-10`, `1-20`, `2-10`, `2-20`. Hunts abrem em `1-10`. Caps 3–12 ficam para content complete.

## Áudio

Sem stems master. `apps/web/src/audio.ts` sintetiza:

- cama de hub (pads)
- cama de batalha (pulso)
- SFX: ui, hit, crit, ult, death, win, lose, collect, pull

Mute e volume no Menu. Gesture (`pointerdown`) destrava o `AudioContext`.

## Ofício (8 minutos)

Servidor: `POST /api/tutorial`. Conta nova nasce no passo 0 com ~2.5 h de Wake já acumulado.

| Passo | Beat |
| --- | --- |
| 0 | Moth. O Spire respira. |
| 1 | Nome do Waker |
| 2 | Relíquia inicial (Kael / Orren / Mira) |
| 3 | Diretiva Foco |
| 4 | Stage 1-1 (julgamento no servidor, playback) |
| 5 | 1-2 → 1-4 |
| 6 | Coletar Wake |
| 7 | Font tutorial (herói scriptado, sem gastar Letter) |
| 8 | Hub destrava |

Menu → **Rever ofício** reseta o passo. Economia continua autoritativa.
