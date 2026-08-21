# Economia e Live-ops

**Status:** v1 (ordens de grandeza; a planilha L-02 é a fonte numérica)  
**Dono:** Economia / design  
**Regra:** nenhum número de drop muda sem changelog neste doc + entrada na planilha.

---

## 1. Filosofia

1. **Idle é o salário.** Wake do baú cobre nível e enhance básico.
2. **Modos são bônus de especialização**, não o salário.
3. **Gacha é coleção**, não o único caminho de poder.
4. **Payer compra tempo e vaidade**, não a existência do herói.
5. **60 dias F2P** concluem a campanha. Top 1% da arena pode ser payer — e Honor Duel existe para o resto.

---

## 2. Moedas

| ID | Nome no mundo | Fonte | Sink | Premium? |
| --- | --- | --- | --- | --- |
| `gold` | Wake-forged | baú, stages, hunts | enhance, craft | não |
| `essence` | Marrow | baú, hunts | nível (via resonance) | não |
| `dust` | Relic dust | baú, torre, dupes | ascensão | não |
| `letters` | Letters | daily, passe, torre, shop | Font Standard | não |
| `fate` | Fate | passe, IAP, eventos | Font of the Season | sim |
| `ash` | Ash Marks | guild, war | Ash Font, shop raro | não |
| `arena` | Crests | arena | shop de arena | não |
| `guild` | Ember | hunt, ajuda | shop da guilda | não |
| `lucent` | Lucent | labirinto | cópia de raro | não |
| `stamina` | Breath | regen | hunts, alguns stages de evento | não |
| `sweep` | Echo tickets | baú, daily | sweep | não |
| `gem` | Shard-glass | atos, rank, eventos | universal menor | híbrido |

Toda transação → ledger (TDD).

---

## 3. Fontes e pias (diário F2P alvo)

Orçamento de sessão: **12–18 min**.

| Fonte | Gold | Letters | Essence | Sweep |
| --- | --- | --- | --- | --- |
| Baú 16–24 h | 60% | 10% | 55% | 2–4 |
| Daily / weekly | 10% | 40% | 10% | 4 |
| Hunts (stamina do dia) | 20% | — | 25% | — |
| Arena / torre | 5% | 25% | 5% | — |
| Guild | 5% | 10% | 5% | — |
| Evento | variável | variável | — | 2 |

**Letters/dia F2P:** ~8–10 (standard pull a cada 7–9 dias; pity Relic ~4–5 meses no standard, mais rápido com season + eventos).  
Isso é *intencional*: Relic é raro; o poder vem de resonance + gear + diretivas.

**Fate/dia F2P:** ~1–1.5 via passe free e eventos. Banner da temporada é poupável.

---

## 4. Poder

Fórmula de combate (sim):

```
dmg = ATK * skill_ratio * faction * directive * (1+crit) / (DEF_k + 100)
```

Orçamento de poder no cap de campanha (cap. 12):

| Track | Contribuição ao poder efetivo |
| --- | --- |
| Nível / resonance | 40% |
| Ascensão | 25% |
| Gear + set | 20% |
| Skills | 10% |
| Imprint | 5% |

Arena no soft launch será calibrada para que **diretiva + facção** virem uma defesa 200 de poder abaixo. Se não virar, o combate falhou (GDD §15.2).

---

## 5. Gacha (math)

Standard (por pull):

| Faixa | Rate | Pity |
| --- | --- | --- |
| Relic (5★) | 1.2% | duro 140; suave +0.6% a partir de 70 |
| Elite (4★) | 8.8% | duro 70 |
| Rare (3★) | 90% | — |

Wishlist: quando o pull é Relic *off-banner*, 50% escolhe a wishlist daquela facção (ciclo).  
Dupes Relic → imprint; excesso → dust.

Simulação nightly (CI): 10k contas F2P 60 dias, reportar p50/p90 de Relics e ouro ocioso.

---

## 6. Stamina e idle

- Regen 10/h, cap 120.  
- Hunt custa 8 / 10 / 12 conforme nível.  
- Sweep = custo de stamina + 1 ticket, resultado instantâneo (servidor).  
- Baú **não** gasta stamina. Esta é a linha que o gênero esquece e o jogador não.

---

## 7. IAP ( paleta, não preço final em BRL )

| SKU | Contém random pago? | BE |
| --- | --- | --- |
| Passe premium | não (track fixo) | ok |
| Gazette mensal | não | ok |
| Skin / outfit | não | ok |
| Fate pack | **sim** (moeda de pull) | **oculto** |
| Compra direta de herói | não | ok |
| Refill de Breath | não | ok |

Preços âncora (USD, converter local): $4.99 gazette, $9.99 passe, $2.99 skin small, $14.99 hero direct.  
Sem “primeiro pack 2000%”. Qualquer starter pack é **transparente** e único por conta.

---

## 8. Temporada

Ciclo de 28 dias.

| Semana | Live-ops |
| --- | --- |
| 1 | Banner novo, login 7 dias, mail de season |
| 2 | Evento de hunt (+sweep) |
| 3 | Mini-story (10 stages) |
| 4 | Honor Duel pool rotaciona, preview do próximo |

Admin liga o pacote (`season_id`) sem binário novo.  
Rollback: flag off + compensação de ledger se drop estava errado.

---

## 9. Telemetria obrigatória

`session.start`, `wake.collect` (elapsed, cap, amount), `battle.end` (mode, win, duration, directives), `gacha.pull` (banner, rarity, pity), `iap.start/ok/fail`, `funnel.onboarding.*`, `guild.help`, `error.sim_desync`.

Funis: D1/D7/D30, stage onde param, % que puxa 10, % que entra em guilda até D3, ouro-sink ratio.

Alerta: ouro médio/hora > 3σ do dia anterior.
