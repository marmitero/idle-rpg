# Inventário de documentos de produção

**Status:** v1  
**Dono:** Produção  
**Audiência:** todo o estúdio  
**Nota:** isto **não** é um MVP. É a papelada de um indie que pretende *lançar* um 1.0 completo e sustentá-lo.

Documentos marcados com ★ já existem neste repositório (v1). Os demais são gerados nas fases do [roadmap](03-roadmap.md).

---

## 1. Por que esta lista

Times indie morrem de duas formas: sem papel (cada um imagina um jogo) ou com um GDD de 200 páginas que ninguém lê. A regra da casa:

- Um **doc mestre curto** por disciplina (este inventário aponta).
- **Fichas** por sistema / herói / modo (templates versionados).
- **ADRs** para decisões técnicas irreversíveis.
- Tudo no git, revisado em PR, como o código.

---

## 2. Direção e produto

| # | Documento | Dono | Quando | Critério de pronto |
| --- | --- | --- | --- | --- |
| P-01 ★ | [Pesquisa de mercado](01-pesquisa-de-mercado.md) | Direção | Semana 0 | Referências citadas, extrações acionáveis, anti-padrões |
| P-02 ★ | [GDD](04-gdd.md) | Game design | Semana 0, vivo | Loops, pilares, modos 1.0, o que *não* é o jogo |
| P-03 ★ | [Narrative Bible](06-narrative-bible.md) | Narrativa | Semana 0–2 | Mundo, tom, facções, tabus, naming |
| P-04 ★ | [Art Bible](05-art-bible.md) | Arte | Semana 0–2 | Paleta, silhueta, UI, VFX, produção |
| P-05 ★ | [Posicionamento e lançamento](09-lancamento.md) | Publishing | Pré-produção | Público, canais, soft launch, stores |
| P-06 | One-pager de pitch (1 página) | Direção | Semana 1 | Usável para press / colab / loja |
| P-07 | Competitive tracker (planilha viva) | Produto | Mensal | 8 referentes, patches, o que copiar/ignorar |
| P-08 | Feature cut-list 1.0 / 1.1 / never | Produção | Semana 2 e a cada milestone | Assinado por direção |

---

## 3. Design de sistemas (um doc por pilar)

Cada sistema tem: fantasy, regras, UI, dados, economia, edge cases, telemetria, aceite.

| # | Documento | Sistema |
| --- | --- | --- |
| S-01 | Ficha — Combate e planos de batalha | Auto-batalha, formação, ultimates, diretivas |
| S-02 | Ficha — Campanha e baú Wake | Stages, AFK rate, cap offline |
| S-03 | Ficha — Heróis e progressão | Nível, estrela, skill, imprint, resonance |
| S-04 | Ficha — Facções e sinergia | Triângulo, bonus 3/5, raros |
| S-05 | Ficha — Gacha e banners | Odds, pity, wishlist, histórico |
| S-06 | Ficha — Equipamento | Slots, sets, enhance, craft |
| S-07 | Ficha — Torre | Andares, facção, resets |
| S-08 | Ficha — Arena | Snapshot, ranking, loja |
| S-09 | Ficha — Hunts / dungeons | 4 recursos, sweep, stamina |
| S-10 | Ficha — Guilda | Criação, cargos, hunt, shop, war |
| S-11 | Ficha — Missões, passe, mail | Daily 12–18 min |
| S-12 | Ficha — Loja e IAP | SKUs, battle pass, packs éticos |
| S-13 | Ficha — Eventos | Framework, calendário S0–S2 |
| S-14 | Ficha — Tutorial e onboarding | 8 minutos até o primeiro baú |
| S-15 | Ficha — Perfil, amigos, bloqueio | Social mínimo |
| S-16 | Ficha — Honor Duel (1.0 late) | Draft, pool da temporada |

Templates em `docs/templates/` (criados no kickoff de design).

---

## 4. Conteúdo

| # | Documento | Conteúdo |
| --- | --- | --- |
| C-01 | Roster bible (28 heróis 1.0) | Nome, facção, classe, kit, arte, VA |
| C-02 | Stage bible (campanha) | Capítulos, inimigos, bosses, rates |
| C-03 | Enemy / elite / boss sheets | Stats, skills, telegraphs |
| C-04 | Item e moeda catalog | IDs estáveis, ícones, sinks |
| C-05 | Dialogue and loc keys | Fonte PT-BR, EN, placeholders |
| C-06 | Audio bible | Paleta sonora, interstitials, SFX matrix |
| C-07 | Cinematic / ultimate shot list | 28 ultimates, duração, câmera |
| C-08 | Event content packs | S0 launch, S1, S2 |

---

## 5. Engenharia

| # | Documento | Dono | Critério |
| --- | --- | --- | --- |
| E-01 ★ | [TDD / Arquitetura](04-tdd-arquitetura.md) | Tech lead | Stack, bounded contexts, autoridade |
| E-02 ★ | ADRs em `docs/adr/` | Tech lead | Uma decisão, um arquivo |
| E-03 | Protocol spec (`packages/protocol`) | Backend | Mensagens versionadas |
| E-04 | Simulação (`packages/sim`) | Gameplay | Determinismo, replay, fuzz |
| E-05 | Data schema / migrations | Backend | ERD, retenção, PII |
| E-06 | Auth e identidade | Backend | OAuth, device, exclusão de conta |
| E-07 | Anti-abuso e autoridade | Backend | Rate limit, replay verify, economy audit |
| E-08 | Observabilidade | Platform | Métricas, traces, alertas, SLOs |
| E-09 | CI/CD e ambientes | Platform | dev / staging / soft / prod |
| E-10 | Client performance budget | Client | TTI, atlas, memória iPhone SE |
| E-11 | Capacitor / PWA runbook | Client | iOS, Android, installability |
| E-12 | Disaster recovery | Platform | Backup, RPO/RTO, rollback de season |

---

## 6. Arte e áudio

| # | Documento |
| --- | --- |
| A-01 ★ | [Art Bible](05-art-bible.md) |
| A-02 ★ | [Pipeline de assets](10-pipeline-assets.md) |
| A-03 | UI kit spec (tokens, grid, componentes) |
| A-04 | Iconography sheet |
| A-05 | VFX language sheet |
| A-06 | Character turnaround + expression sheet (por herói) |
| A-07 | Environment kit (hub, 6 biomas, 4 hunts) |
| A-08 | Marketing art list (key art, store, ads) |

---

## 7. Economia, live-ops, analytics

| # | Documento |
| --- | --- |
| L-01 ★ | [Economia e Live-ops](07-economia-liveops.md) |
| L-02 | Spreadsheet mestra de economia (fonte da verdade numérica) |
| L-03 | Gacha math appendix (EV, pity, banner calendar) |
| L-04 | Season playbook |
| L-05 | Event toolkit (o que um designer pode ligar sem deploy) |
| L-06 | Analytics taxonomy (eventos, funis, economia gold-sink) |
| L-07 | Live dashboard definitions |
| L-08 | Incident / rollback de economia |

---

## 8. Qualidade, legal, lojas

| # | Documento |
| --- | --- |
| Q-01 ★ | [QA e Compliance](08-qa-compliance.md) |
| Q-02 | Test plan por milestone |
| Q-03 | Device matrix (iPhone SE, Android mid, desktop 1280, tablet) |
| Q-04 | Accessibility checklist (WCAG 2.2 AA razoável para jogo) |
| Q-05 | Localization style guide PT-BR / EN |
| Q-06 | Privacy policy + ToS + gacha odds page |
| Q-07 | Age gate, LGPD/GDPR, exclusão de dados |
| Q-08 | Store listing copy + PEGI/IARC questionnaire |
| Q-09 | Belgium / paid-random policy |
| Q-10 | Security review (auth, payments, admin) |

---

## 9. Produção e operação do estúdio

| # | Documento |
| --- | --- |
| O-01 ★ | [Roadmap](03-roadmap.md) |
| O-02 | RACI do estúdio |
| O-03 | Rituals (standup, review, content freeze) |
| O-04 | Milestone exit criteria |
| O-05 | Risk register |
| O-06 | Budget e headcount (interno) |
| O-07 | Vendor / contractor briefs |
| O-08 | Postmortem template |

---

## 10. Ordem de escrita (não escreva tudo no dia 1)

```
Semana 0   P-01 P-02 O-01 E-01 A-01 A-02 L-01 Q-01 P-05   ← feito
Semana 1-2 P-03 P-06 P-08 S-01 S-02 S-03 S-05 C-01 início
Semana 3-4 S-04 S-06..S-14 E-03 E-04 E-05 A-03 L-02 L-03
Vertical   C-02 C-03 Q-02 E-10
Content    C-04..C-08 A-04..A-08 L-04 L-05
Ship       Q-05..Q-10 O-04 P-05 update E-11 E-12
```

---

## 11. O que *não* vamos escrever

- GDD de 200 páginas monolítico.
- Documento de “visão” separado do GDD.
- Wiki fora do git.
- Spec de feature que não tem ficha no inventário.
