# QA, lojas e compliance

**Status:** v1  
**Donos:** QA + produção + legal (contractor na Fase 4)

---

## 1. Qualidade

### 1.1 Pirâmide

- Fuzz + golden da `sim` em todo PR.
- Contract tests do protocol.
- E2E do onboarding + collect + pull + 1 battle em staging.
- Playtest humano: 10 externos no slice, 30 no soft.

### 1.2 Device matrix (mínima)

| Classe | Exemplo | Deve |
| --- | --- | --- |
| iPhone pequeno | SE 2ª / 3ª | 30 fps batalha, tap 44 |
| Android mid | 4–6 GB RAM, Chrome | TTI 4s 4G |
| Android low | 3 GB, WebView Capacitor | sem crash no hub |
| iPad / tablet | — | hub 2 colunas |
| Desktop | 1280×720 e 1920×1080 | coluna central + laterais |
| Safari iOS | PWA add-to-home | idle em background ok |

### 1.3 Aceite por milestone

Ver [roadmap](03-roadmap.md) §3. Além disso:

- Zero crash no caminho feliz.
- Nenhuma moeda creditada offline-only no cliente.
- Odds na tela de pull batem com o endpoint.
- Loc: zero chave vazia em PT-BR/EN nas telas do milestone.

### 1.4 Acessibilidade

Contraste AA nos textos de UI. Reduce-motion. Não transmitir informação só por cor (facção tem ícone + cor). Daltonismo: testar Deuteranopia nas 4 facções core.

---

## 2. Gacha e loot

| Jurisdição | Postura | Nossa implementação |
| --- | --- | --- |
| Bélgica | pull pago = jogo de azar [1](https://gachawiki.com/wiki/gacha-regulation) | `paidRandom=false`; IAP só não-aleatório |
| Países Baixos | revertido em 2022; cautela | sem trade, sem cash-out |
| Reino Unido | não é gambling se não cash-out; disclosure voluntário | odds + age gate |
| China / KR | disclosure legal | odds page já no 1.0 |
| EUA | FTC / Cosmodore-adjacent | odds, sem dark pattern de “última chance” falso |
| Brasil | CDC + LGPD | português claro, cancelamento, exclusão |
| Apple / Google | odds disclosure, kids | IARC 10+, parental, nenhum gacha em conta kids |

Proibido: kompu gacha, pity escondido, “fake buttons” de pull, venda a menores sem gate.

Página permanente: `/legal/odds`.

---

## 3. Privacidade

- Política e ToS antes do bind de email.
- Dados: conta, roster, ledger, device, IP temporário, purchases.
- Sem vender dado. Analytics próprio / first-party.
- Direito de exportar e apagar (job 30 dias).
- Chat de guilda com report + mute + retention 90 dias.
- Cookies: só técnicos + analytics com opt-out na UE.

---

## 4. Lojas e PWA

- IARC / PEGI questionnaire na Fase 4.
- Screenshots reais, sem CGI que o jogo não entrega.
- “Contains random items” onde a loja exigir.
- PWA: manifest, icons 192/512, service worker só de static (nunca cachear ledger).
- Capacitor: Apple Sign-In, privacy nutrition labels, background modes mínimos.

---

## 5. Segurança de QA

- Contas de teste isoladas, Fate de staging marcado.
- Admin nunca aponta para prod sem 2FA e change ticket.
- Pen-test leve antes do soft (auth, ledger replay, IDOR de guilda).
