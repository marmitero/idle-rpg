# referencias/ — masters de geração

Esta pasta guarda os **masters gerados com fundo magenta `#FF00FF`**, organizados
na **mesma taxonomia de `assets/`** (a arquitetura que o jogo consome).

## Regra de ouro

```
referencias/<taxonomia>/rw_*.png   →   master magenta (saída do gerador, NUNCA usado pelo jogo)
                                        │
                        npm run assets:finalize
                        (tools/asset-pipeline/remove_bg.py)
                                        │
assets/<taxonomia>/rw_*.png        →   final RGBA com fundo removido e bordas limpas
                                        (única fonte que o jogo carrega)
```

- O jogo **nunca** lê `referencias/` e **nunca** processa imagem em runtime.
- O final em `assets/` é **derivado** — sempre regenerável a partir do master.
- Masters com fundo magenta ficam aqui; assets que já nascem prontos do pacote
  (moedas, materiais, plates de cenário, etc.) vivem só em `assets/`.

## Taxonomia (espelho de assets/)

```
referencias/
├── audio/{music,sfx,vo}      masters de som (quando houver)
├── characters/{bust,icon,battle,cutin,splash}
├── enemies/
├── environments/{hub,biomes,hunts,guild}
├── ui/{kit,icons/{currency,directives,equip,factions,hud,materials,raid,skills,stats},hud,fonts}
├── vfx/
└── marketing/
```

## Regras ao gerar (docs/13-regras-de-geracao.md)

1. Fundo `#FF00FF` chapado, sem magenta no sujeito.
2. Lotes de no máximo 10 por sessão, registrados em `assets/GENERATION.md`.
3. Após cada lote: `npm run assets:finalize` + `python3 tools/asset-pipeline/remove_bg.py --check`.
