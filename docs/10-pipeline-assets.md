# Pipeline de assets

**Status:** v1.1  
**Dono:** Arte + client  
**Pastas canônicas:** `/assets`  
**Geração:** [regras](13-regras-de-geracao.md) — magenta `#FF00FF`, lotes de 10.

---

## 1. Estado do pacote do cliente

Em 2026-08-20 o pacote apareceu em `origin/main`: **82 PNGs na raiz**. Organizado neste branch. Inbox = `assets/_inbox/2026-08-20_main-dump/`. Catálogo = `assets/CATALOG.md`.

Procedimento quando o pacote chegar (zip, drive, anexo de issue, PR):

```
1. copiar o zip intacto para assets/_inbox/incoming/
2. descompactar em assets/_inbox/YYYY-MM-DD_label/
3. preencher assets/_inbox/TRIAGE.md
4. copiar (não mover cego) para as pastas da §2 com naming da Art Bible
5. raw (psd/clip/ase) → assets/raw/...
6. Art Bible → v1.1 com 6 frames do próprio pacote
```

Até lá, estas pastas existem e estão vazias de propósito.

---

## 2. Árvore

```
referencias/               masters magenta #FF00FF recém-gerados (mesma taxonomia)
assets/                    finais que o jogo carrega (fundo removido, bordas limpas)
├── _inbox/                 pacote cru, ainda sem naming
├── raw/                    fontes (psd, clip, ase, blend) — git-lfs se >10MB
├── characters/
│   ├── splash/
│   ├── bust/
│   ├── icon/
│   ├── battle/             sheets ou spines
│   └── cutin/
├── enemies/
├── ui/
│   ├── kit/                componentes
│   ├── icons/
│   ├── hud/
│   └── fonts/
├── environments/
│   ├── hub/
│   ├── biomes/
│   ├── hunts/
│   └── guild/
├── vfx/
├── audio/
│   ├── music/
│   ├── sfx/
│   └── vo/
├── marketing/
└── generated/              atlases e hashes (CI, não editar à mão)
```

Fluxo do corte de fundo: gerador salva o master em `referencias/` →
`npm run assets:finalize` (remove_bg.py) escreve o RGBA transparente em
`assets/` → `npm run assets:check` valida. O cliente não processa imagem
em runtime (chroma removido em 2026-08-21).

---

## 3. Naming

```
rw_{disciplina}_{id}_{variant}_{size}.{ext}
```

| Parte | Exemplo |
| --- | --- |
| disciplina | `hero` `enemy` `ui` `env` `vfx` `sfx` `bgm` |
| id | `ember_kael` `wake_chest` `biome_tidevault` |
| variant | `bust` `idle` `icon` `primary` |
| size | `256` `1024` `2048` ou `1x`/`2x`/`3x` |

IDs iguais aos de `packages/content`. Se o arquivo não tem ID de conteúdo, não entra no bundle.

---

## 4. Formatos

| Tipo | Master | Runtime |
| --- | --- | --- |
| Splash / marketing | PNG 16-bit ou PSD | WebP q86, max 2048 |
| UI / ícones | SVG ou PNG @3x | WebP lossless ou PNG-8 |
| Battle sheet | PNG + JSON (ou Spine JSON) | WebP + atlas |
| Audio música | WAV 48k | Opus 96–128k |
| Audio SFX | WAV | Opus / m4a curto |
| Fontes | OFL/licença clara | woff2 subset PT+EN |

sRGB. Sem perfil Adobe RGB no runtime.

---

## 5. Import

`tools/asset-pipeline` (remove_bg.py hoje; atlas no futuro):

1. valida naming + dimensões da bible;
2. remove o fundo magenta dos masters (`referencias/` → `assets/`);
3. gera atlas por disciplina + manifesto `generated/manifest.json` (hash, pixel size, content id);
4. CI quebra se herói em content não tem bust+icon+battle final.

Cliente carrega os finais de `assets/` direto, sem processamento em runtime.

---

## 6. Direitos

Nada de asset de marketplace com licença ambígua no roster jogável.  
Pacote do cliente: assumir work-for-hire; registrar origem no TRIAGE.  
Música contractor: contrato de sync + stems.
