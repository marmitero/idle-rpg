# Relicwake — Documentação de estúdio

Índice vivo. Cada documento tem dono, audiência e critério de “pronto”. Versão atual: **pré-produção v1.1** (pacote de arte absorvido, shell responsivo).

## Como ler

Se você acabou de entrar no projeto, leia nesta ordem:

1. [Pesquisa de mercado](01-pesquisa-de-mercado.md) — o que o gênero ensina
2. [GDD](04-gdd.md) — o que estamos fazendo
3. [Roadmap](03-roadmap.md) — quando
4. [TDD](04-tdd-arquitetura.md) — como
5. [Inventário](02-inventario-de-documentos.md) — o resto do papelório profissional

## Mapa

```
docs/
├── 01-pesquisa-de-mercado.md      referências de estética + sistemas
├── 02-inventario-de-documentos.md  lista completa de docs de produção
├── 03-roadmap.md                   16 meses até 1.0 finalizado
├── 04-gdd.md                       game design document
├── 04-tdd-arquitetura.md           technical design + ADRs
├── 05-art-bible.md                 estilo, UI, VFX, produção
├── 06-narrative-bible.md           mundo, facções, tom
├── 07-economia-liveops.md          moedas, gacha, temporadas
├── 08-qa-compliance.md             qualidade, lojas, gacha, LGPD
├── 09-lancamento.md                go-to-market
├── 10-pipeline-assets.md           pastas, naming, import
├── 11-pitch-one-pager.md           uma página
├── 12-responsividade.md            PC, tablet, telefone
├── 13-regras-de-geracao.md         magenta + lotes de 10
└── adr/                            decisões técnicas datadas
```

## Regras da documentação

- Documentos são **living**. Mudança de sistema = PR no doc no mesmo commit.
- Números de economia só mudam com changelog na seção do doc.
- Arte nova precisa caber na Art Bible ou a Art Bible muda primeiro.
- Não existe feature “só no código”.
