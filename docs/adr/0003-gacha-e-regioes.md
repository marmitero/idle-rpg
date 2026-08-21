# ADR 0003 — Gacha como serviço regionalizado

- **Status:** aceito
- **Data:** 2026-08-20

## Contexto

Pull pago é loot box. Bélgica trata como jogo de azar. Lojas exigem odds. Brasil (LGPD) exige transparência e exclusão de dados. China/Coreia exigem disclosure — mesmo que o 1.0 não lance lá, o *desenho* já nasce compatível.

## Decisão

- Pull é command de servidor com pity persistido.
- Odds e histórico são endpoints públicos autenticados.
- Flag `paidRandom` por região. Onde for falso, IAP não vende moeda de pull.
- Sem marketplace, sem trade, sem conversão para dinheiro.
- Compra direta de herói padrão existe como alternativa não-aleatória.

## Consequências

- SKUs de loja se ramificam por região.
- QA precisa de matriz de região, não só de device.
- Legal review entra na Fase 4, mas a *arquitetura* já está nesta ADR.
