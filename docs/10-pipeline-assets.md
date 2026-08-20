# Pipeline de assets

**Status:** v1  
**Dono:** Arte + client  
**Pastas canônicas:** `/assets`

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
assets/
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

`tools/asset-pipeline` (a escrever no kickoff):

1. valida naming + dimensões da bible;
2. gera atlas por disciplina;
3. escreve manifesto `generated/manifest.json` (hash, pixel size, content id);
4. CI quebra se herói em content não tem bust+icon+battle.

Cliente só conhece o manifesto.

---

## 6. Direitos

Nada de asset de marketplace com licença ambígua no roster jogável.  
Pacote do cliente: assumir work-for-hire; registrar origem no TRIAGE.  
Música contractor: contrato de sync + stems.
