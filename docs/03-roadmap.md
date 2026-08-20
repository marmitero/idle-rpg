# Roadmap de produção — Relicwake 1.0

**Status:** v1  
**Horizonte:** 16 meses até *launch global* de um indie **finalizado**, não um MVP.  
**Equipe-alvo:** 6–9 pessoas (ver §8). Um solo estende o calendário; não corta o 1.0.

Datas são relativas ao **T0 = kickoff de pré-produção** (hoje, 2026-08-20).

```
T0          T+2m         T+5m          T+9m           T+13m      T+15m     T+16m
Pré-prod    Vertical     Systems       Content        Polish     Soft      Global
            Slice        Complete      Complete       + cert     Launch    Launch
```

---

## 0. O que “finalizado” significa aqui

O 1.0 **não** é “campanha + summon e a gente vê”. É um produto que um jogador pode viver por 60–90 dias sem sentir buraco de modo, com:

- campanha completa (não infinita — tem *final de ato* e New Game+ de torre);
- 28 heróis, 4+2 facções, gacha com pity, resonance, gear;
- idle offline autoritativo;
- torre, 4 hunts com sweep, arena, guilda (hunt + shop + war);
- passe, eventos-framework, 1 temporada de lançamento;
- PWA + apps iOS/Android nas lojas;
- admin live-ops, analytics, compliance de gacha, PT-BR + EN.

Pós-1.0 é live-ops (S1, S2), não “faltou o jogo”.

---

## 1. Fases

### Fase 0 — Pré-produção (T0 → T+8 semanas)

**Meta:** ninguém escreve feature sem saber o jogo.

| Semana | Entrega |
| --- | --- |
| 0 | Pesquisa, inventário, GDD v1, TDD, Art Bible provisória, economia v1, pastas de asset |
| 1 | Recebimento e triagem do pacote de arte. Art Bible v1.1 travada no material real |
| 1–2 | Narrative bible, pitch one-pager, cut-list 1.0, roster 28 nomes |
| 2–4 | Fichas S-01 a S-05, UI kit paper, proto de combate em mesa (planilha) |
| 4–6 | Vertical slice *paper* aprovado: 1 capítulo, 4 heróis, 1 hunt, baú, 1 summon |
| 6–8 | Skeleton de monorepo compilando, CI verde, proto cinza jogável internamente |

**Exit:** direção assina o slice. Economia spreadsheet v0 existe. Estilo de arte travado.

**Gate de arte:** se o pacote não chegar até a semana 1, o estúdio produz um kit-base na escola C (Art Bible) e não espera.

---

### Fase 1 — Vertical Slice (T+2 → T+5 meses)

O slice **é** o jogo em miniatura. Tudo que entra depois reusa estes tubos.

Conteúdo do slice:

- Conta (device + email), cloud save.
- Hub com 5 destinos.
- Campanha capítulos 1–2 (≈40 stages), 4 heróis jogáveis, 8 inimigos, 2 bosses.
- Combate 5v5 auto + ultimate + 3 diretivas + replay.
- Baú Wake offline (servidor).
- 1 banner de summon com pity.
- 1 dungeon + sweep.
- Daily de 5 missões.
- UI final *do slice* (não placeholder eterno).
- Áudio: música de hub + batalha + 20 SFX.

**Exit (jogável por estranhos):**

- First session ≤ 8 min até o primeiro collect de Wake.
- Battle 30 fps em iPhone SE / Android mid / desktop 1280.
- Zero economia concedida pelo cliente.
- 10 playtesters externos completam o cap. 1 sem ajuda.

---

### Fase 2 — Systems Complete (T+5 → T+9 meses)

Todos os *sistemas* do 1.0 existem, mesmo com conteúdo parcial.

| Sistema | Done when |
| --- | --- |
| Progressão | Nível, skill, estrela, imprint, resonance |
| Facções | Triângulo, bonus 3/5, 2 raros |
| Gear | 4 slots, 4 sets, enhance, craft básico |
| Torre | 100 andares + 4 torres de facção |
| Arena | Snapshot, 5 ranks, loja |
| Hunts | 4 dungeons, stamina, sweep |
| Guilda | criar/entrar, cargos, ajuda, hunt, shop |
| Guild war | 1.0 late desta fase — 3 ataques, 1 mapa |
| Passe + mail + loja IAP sandbox | SKUs reais em sandbox |
| Event framework | 1 evento “login 7 dias” ligado sem deploy de cliente |
| Honor Duel | pool de 16, draft 5, sem gear |
| Admin | banner, mail, drop, ban, season flag |
| Analytics | funil D1/D7, economy gold, gacha |

**Exit:** feature freeze de sistemas. Bug de sistema = P0. Conteúdo ainda pode faltar.

---

### Fase 3 — Content Complete (T+9 → T+13 meses)

| Bloco | Volume 1.0 |
| --- | --- |
| Heróis | 28 (6 por facção core + 2 por rara) |
| Campanha | 12 capítulos × 20 stages = 240 + 12 bosses de ato |
| Inimigos | 36 base + 12 elites + 12 bosses |
| Torre | 200 andares calibrados |
| Hunts | 10 níveis cada |
| Narrativa | cutscenes de ato (12), voicelines-chave (não full VA) |
| Eventos | S0 launch pack + 2 eventos recorrentes |
| Loc | PT-BR + EN 100% |
| Áudio | 8 faixas, SFX matrix completa, hit confirms |
| Marketing | key art, 8 screenshots, trailer 45s, store copy |

**Exit:** “não falta tela”. Pass é jogável ponta a ponta por QA.

---

### Fase 4 — Polish, certificação, soft launch (T+13 → T+15 meses)

- Performance pass (TTI < 4s 4G, RAM iPhone SE).
- Balance pass 1 (spreadsheet → live).
- Tutorial rewrite com telemetria do slice.
- Acessibilidade: contraste, tap targets 44px, reduce-motion.
- Legal: odds page, ToS, privacy, age gate, exclusão de conta.
- Store: IARC, fichas Apple/Google, PWA install.
- **Soft launch** em 2 países (PT + EN small: Portugal + Nova Zelândia, ou similar).
- 4 semanas de live, 2 hotfixes de economia orçados.

**Exit do soft:** D1 ≥ 35%, D7 ≥ 12%, crash-free ≥ 99.5%, IAP sandbox→prod sem chargeback anômalo, nenhum P0 aberto.

---

### Fase 5 — Launch global (T+16)

- Build candidato, content freeze T-14 dias.
- Season 0 ligada (28 dias).
- Relação pública: itch/web, Play, App Store, Discord, 1 criador por idioma.
- War room 14 dias (design + backend + community).
- Retro de lançamento no T+16+2 semanas.

---

## 2. Backlog por disciplina (não é MVP fatiado — é sequência de um 1.0)

### Design

1. Combate e diretivas  
2. Wake / campanha  
3. Herói + gacha  
4. Daily loop  
5. Hunts + sweep  
6. Torre  
7. Arena  
8. Guilda hunt  
9. Gear  
10. Passe / eventos  
11. Guild war  
12. Honor Duel  
13. Balance contínuo  

### Engenharia

1. Monorepo, CI, ambientes  
2. Auth + save  
3. Sim determinística + replay  
4. Idle worker  
5. Inventory / currency ledger  
6. Gacha server-side  
7. Matchmaking snapshot  
8. Guild services  
9. Admin + feature flags  
10. Payments (Stripe web + Play Billing + IAP)  
11. Capacitor shells  
12. Observabilidade e anti-abuso  

### Arte

1. Triagem do pacote + kit UI  
2. 4 heróis do slice (splash, bust, battle, skill FX)  
3. Hub + 2 biomas  
4. Ícones de moeda / facção / skills  
5. Resto do roster em ondas de 6  
6. 6 biomas + 4 hunts + guild hall  
7. Marketing  

### Áudio

1. Paleta e placeholder  
2. Hub + battle loop do slice  
3. SFX de UI e hit  
4. Temas de facção  
5. Master e loudness store  

---

## 3. Marcos e critérios de saída (go / no-go)

| Marco | Data | Go |
| --- | --- | --- |
| M0 Style lock | T+2 sem | Art Bible v1.1 + 1 herói herói-alvo aprovado |
| M1 Grey fight | T+8 sem | 5v5 simula e desenha no cliente |
| M2 Vertical Slice | T+5 m | 10 externos terminam cap. 1 |
| M3 Systems Complete | T+9 m | Cut-list 1.0 zerada em sistemas |
| M4 Content Complete | T+13 m | 28 heróis + 240 stages no build |
| M5 Soft Launch | T+15 m | KPIs §Fase 4 |
| M6 Global | T+16 m | Cert + war room |

No-go em qualquer marco **atrasa o calendário**, não corta o 1.0. Cortes só saem da cut-list assinada (P-08), nunca de pânico.

---

## 4. O que está *fora* do 1.0 (de propósito)

- Open-world 3D.
- PvP realtime.
- Housing profundo.
- VA full cast em todos os heróis.
- 80+ heróis no launch.
- Mercado jogador-jogador.
- Cross-over de IP.
- Editor de herói UGC.
- Console nativo.

Isso é 1.1+ ou never. Ver GDD §Fora.

---

## 5. Riscos (os que realmente matam este gênero)

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Pacote de arte ausente / inconsistente | Estilo não trava, roster atrasa | Semana 1: triagem. Semana 2: kit interno se vazio |
| Combate chato de assistir | Churn D1 | Slice julga *espetáculo*, não só DPS |
| Economia quebrada no soft | Review bomb | Ledger + flags + hotfix orçado |
| Web performance em Android mid | Uninstall | Budget de atlas e TTI desde M1 |
| Rejeição de gacha nas lojas / BE | Bloqueio legal | Compra direta + odds + flag regional |
| Scope creep “só mais um modo” | 1.0 eterno | Cut-list, dono único de escopo |
| Live-ops sem admin | Cada evento é deploy | Framework na Fase 2 |

---

## 6. Calendário de conteúdo pós-1.0 (já desenhado, não produzido)

| Temporada | Quando | Promessa |
| --- | --- | --- |
| S0 Emberwake | Launch + 28d | 28 heróis, evento de login, 1 banner |
| S1 Thorn Tide | +30d | +2 heróis, 1 hunt skin, 1 story act side |
| S2 Ashen Choir | +60d | +2 heróis, guild war map 2, Honor Duel pool nova |

O 1.0 já nasce com o *tubo* de temporada. Sem isso o gênero morre na semana 5.

---

## 7. Dependência da arte recebida

```
assets/_inbox  →  triagem (semana 1)
                 ├─ serve o estilo?  → Art Bible v1.1, produção em cima
                 └─ vazio/inútil?    → produzir kit-base escola C, 4 heróis slice
```

Nenhuma fase de engenharia espera arte final para *sistemas*. Espera arte final para *content complete*.

---

## 8. Capacidade assumida

| Função | FTE |
| --- | --- |
| Direção / GD lead | 1 |
| Combat / systems designer | 1 |
| Tech lead (client + sim) | 1 |
| Backend / live-ops eng | 1 |
| Character + VFX artist | 1–2 |
| UI / UX | 1 |
| Narrative + loc | 0.5 |
| Audio (contractor ok) | 0.5 |
| QA | 0.5 → 1 a partir de M3 |
| Produção | 0.5 (pode ser a direção) |

Abaixo disso, estique o calendário em +4–6 meses. Não delete a guilda ou o idle autoritativo — aí não é mais este jogo.
