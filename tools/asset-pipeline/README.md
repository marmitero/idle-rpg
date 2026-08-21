# tools/asset-pipeline

Conversão de masters em finais e validação da árvore de assets.

## remove_bg.py

Master magenta `#FF00FF` (`referencias/`) → final transparente RGBA (`assets/`).

```bash
npm run assets:finalize     # espelha referencias/ → assets/ (--all)
npm run assets:check        # valida os finais (--check)
python3 tools/asset-pipeline/remove_bg.py --scan   # lista masters magenta sob assets/
```

Regras da remoção (não causa "recortes" no sujeito):

1. Fundo = componentes de pixels magenta-like **conectados à borda** (flood).
2. Ilhas magenta **internas** viram buracos transparentes — sujeito nunca é
   removido por cor global (foi isso que danificou o busto do Rift no
   pipeline antigo `chroma_magenta.py`, removido).
3. Buracos ≤ 120 px são cicatrizados com a cor do anel ao redor.
4. Saída RGBA; o jogo carrega `assets/` sem processar nada em runtime.

Taxonomia: `referencias/` espelha `assets/` — ver `referencias/README.md`.

## Futuro

- valida naming + dimensões da Art Bible;
- atlas por disciplina + `assets/generated/manifest.json`;
- CI quebra se herói em `packages/content` não tem bust+icon+battle final.
