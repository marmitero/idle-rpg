# Regras de geração de imagens

**Status:** travado — 2026-08-20  
**Dono:** Arte  
**Aplica-se a:** todo asset gerado pelo estúdio (não ao pacote original do cliente).

Estas duas regras valem **antes** de qualquer `generate` novo.

---

## Regra 1 — Fundo magenta sólido

Toda imagem gerada nasce com fundo **magenta puro, chapado, sem gradiente**.

| | |
| --- | --- |
| Hex | `#FF00FF` |
| RGB | `255, 0, 255` |
| Motivo | chroma key previsível (remover fundo no pipeline / engine) |

Obrigatório no prompt e no pós-processo:

- sem xadrez, sem branco, sem transparência no master gerado;
- sem sombra projetada *no fundo* (sombra só no próprio objeto, se houver);
- magenta das bordas estala para `#FF00FF` exato (sem “quase rosa”);
- o objeto **não** pode usar magenta / fúcsia na arte — paleta de produção proíbe `#FF00FF` em metal, gema, pano.

**Exceção:** placas full-bleed de cenário (hub, bioma, hunt) *são* o fundo. Não levam magenta. Entram num lote próprio, rotulado `plate`. Este lote 02 **não** tem plates.

Pós-processo obrigatório: `tools/asset-pipeline/chroma_magenta.py`  
(flood a partir das bordas + alfa baixo → `#FF00FF`, saída RGB sem alfa).

Runtime: o import troca `#FF00FF` por alfa 0 antes do atlas.

---

## Regra 2 — Lotes de 10

O gerador aceita **no máximo 10 imagens por sessão/turno**.

| | |
| --- | --- |
| Tamanho do lote | exatamente ≤ 10 |
| Registro | `assets/GENERATION.md` |
| Ordem | sempre a fila do slice / 1.0, nunca “o que der vontade” |
| Se faltar | para. Continua no lote seguinte. Não estoura o teto. |

Numeração: `lote-01` (já feito, fundos mistos — regularizar se reexportar), `lote-02` (este), `lote-03`…

---

## Prompt mínimo (copiar)

```
HD pixel art, thick dark outline, cel shading, idle RPG icon.
Subject: {descrição}.
Background: SOLID flat #FF00FF magenta, no checkerboard, no gradient,
no transparency, no drop shadow on the backdrop, chroma-key ready.
Do not use magenta or fuchsia anywhere on the subject.
No text unless it is the logo wordmark.
```
