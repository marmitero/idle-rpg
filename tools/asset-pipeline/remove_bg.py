#!/usr/bin/env python3
"""remove_bg.py — master magenta (#FF00FF) → final transparente (RGBA).

Fluxo Relicwake (docs/13-regras-de-geracao.md):

  1. O gerador salva o master com fundo #FF00FF em `referencias/<taxonomia>`.
  2. `npm run assets:finalize` converte em PNG transparente em `assets/<taxonomia>`.
  3. O jogo carrega `assets/` direto — zero processamento em runtime.

Remoção segura (não causa "recortes" no sujeito):

  - O fundo é removido apenas por FLOOD a partir das bordas: componentes
    de pixels magenta-like conectados à borda viram alfa 0.
  - Pixels magenta-like DENTRO do sujeito (ilhas internas) viram buracos
    transparentes — nunca se remove sujeito por cor global.
  - Buracos minúsculos (<= HOLE_HEAL px, poeira de pipelines antigos)
    são cicatrizados com a cor média do anel opaco ao redor.

Uso:

  python3 remove_bg.py --all           # espelha referencias/ → assets/
  python3 remove_bg.py --src A --out B # um arquivo
  python3 remove_bg.py --check         # valida os finais em assets/
  python3 remove_bg.py --scan          # lista masters magenta sob assets/
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
REF = ROOT / "referencias"
ASSETS = ROOT / "assets"

HOLE_HEAL = 120      # px — buracos menores são cicatrizados
BORDER_RATIO = 0.02  # fração de borda magenta-like que classifica master


def mag_tint(a: np.ndarray) -> np.ndarray:
    """Pixels que leem como fundo magenta ou halo dele (nunca violeta #8D5BE8)."""
    r = a[..., 0].astype(np.int16)
    g = a[..., 1].astype(np.int16)
    b = a[..., 2].astype(np.int16)
    return (r > 150) & (b > 150) & (g < np.minimum(r, b) - 80)


def edge_components(mask: np.ndarray) -> np.ndarray:
    """Componentes conectados de `mask` que tocam a borda da imagem."""
    lbl, n = ndimage.label(mask)
    h, w = mask.shape
    touch = np.zeros(n + 1, dtype=bool)
    touch[lbl[0, :]] = True
    touch[lbl[-1, :]] = True
    touch[lbl[:, 0]] = True
    touch[lbl[:, -1]] = True
    bg = np.zeros(mask.shape, dtype=bool)
    for i in range(1, n + 1):
        if touch[i]:
            bg |= lbl == i
    return bg


def border_ratio(arr: np.ndarray) -> float:
    """Fração de pixels de borda opacos e magenta-like (alpha-aware)."""
    alpha = arr[..., 3] > 0
    rgb = arr[..., :3]
    mag = mag_tint(rgb) & alpha
    h, w, _ = arr.shape
    border = np.zeros((h, w), dtype=bool)
    border[0, :] = True
    border[-1, :] = True
    border[:, 0] = True
    border[:, -1] = True
    flat = (mag & border).ravel()
    step = max(1, flat.shape[0] // 4000)
    return float(flat[::step].mean())


def remove_bg(arr: np.ndarray) -> tuple[np.ndarray, int, int]:
    """Retorna (RGBA, buracos cicatrizados, vãos transparentes restantes)."""
    mag = mag_tint(arr)
    bg = edge_components(mag)
    bg |= mag & ~bg  # ilhas magenta internas → transparentes
    subject = ~bg

    out = arr.copy()
    holes_lbl, hn = ndimage.label(~subject)
    h, w = subject.shape
    touch = np.zeros(hn + 1, dtype=bool)
    touch[holes_lbl[0, :]] = True
    touch[holes_lbl[-1, :]] = True
    touch[holes_lbl[:, 0]] = True
    touch[holes_lbl[:, -1]] = True

    healed = 0
    gaps = 0
    for i in range(1, hn + 1):
        if touch[i]:
            continue
        comp = holes_lbl == i
        size = int(comp.sum())
        if size <= HOLE_HEAL:
            ring = ndimage.binary_dilation(comp, iterations=2) & subject
            ys, xs = np.nonzero(ring)
            for c in range(3):
                out[comp, c] = int(np.round(np.mean(arr[ys, xs, c])))
            healed += 1
        else:
            gaps += 1

    out[~subject] = 0  # RGB zero sob transparência (evita fringe em ferramentas)
    alpha = np.where(subject, 255, 0).astype(np.uint8)
    return np.dstack([out, alpha]), healed, gaps


def process(src: Path, dst: Path) -> None:
    arr = np.asarray(Image.open(src).convert("RGB")).astype(np.uint8)
    rgba, healed, gaps = remove_bg(arr)
    dst.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(dst)
    opaque = rgba[..., 3] > 0
    border_touch = bool((opaque[0, :].any() or opaque[-1, :].any() or opaque[:, 0].any() or opaque[:, -1].any()))
    print(f"  {src.relative_to(REF)} → {dst.relative_to(ASSETS)}  "
          f"({opaque.mean()*100:4.1f}% opaco, cicatrizados {healed}, vãos {gaps}{', sujeito na borda' if border_touch else ''})")


def cmd_all() -> int:
    files = sorted(REF.rglob("*.png"))
    if not files:
        print("referencias/ sem PNGs.", file=sys.stderr)
        return 1
    print(f"Processando {len(files)} masters de referencias/ → assets/")
    for src in files:
        process(src, ASSETS / src.relative_to(REF))
    return 0


def cmd_single(src: Path, dst: Path) -> int:
    process(src, dst)
    return 0


def cmd_scan() -> int:
    found = 0
    for p in sorted(ASSETS.rglob("*.png")):
        rel = p.relative_to(ASSETS)
        if rel.parts[0] in {"raw", "_inbox", "generated"}:
            continue
        arr = np.asarray(Image.open(p).convert("RGBA")).astype(np.uint8)
        if border_ratio(arr) > BORDER_RATIO:
            print(f"{p.relative_to(ROOT)}")
            found += 1
    print(f"{found} masters magenta", file=sys.stderr)
    return 0


def cmd_check() -> int:
    bad = 0
    files = sorted(REF.rglob("*.png"))
    print(f"Validando {len(files)} finais em assets/")
    for src in files:
        rel = src.relative_to(REF)
        dst = ASSETS / rel
        if not dst.exists():
            print(f"  FALTA {rel}")
            bad += 1
            continue
        rgba = np.asarray(Image.open(dst).convert("RGBA"))
        alpha = rgba[..., 3]
        corners = [alpha[0, 0], alpha[0, -1], alpha[-1, 0], alpha[-1, -1]]
        opaque = alpha > 0
        mag_opaque = int(mag_tint(rgba[..., :3][opaque]).sum()) if opaque.any() else 0
        if mag_opaque > 0 or opaque.mean() < 0.02:
            print(f"  ERRO {rel}: magenta-opaco={mag_opaque} cobertura={opaque.mean():.2%}")
            bad += 1
        elif not all(c == 0 for c in corners):
            print(f"  AVISO {rel}: sujeito encosta na borda (cantos={[int(c) for c in corners]})")
    print("  OK — todos os finais validados" if bad == 0 else f"  {bad} problema(s)")
    return 1 if bad else 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--all", action="store_true", help="espelha referencias/ → assets/")
    ap.add_argument("--src", type=Path, help="master de entrada")
    ap.add_argument("--out", type=Path, help="final de saída (com --src)")
    ap.add_argument("--scan", action="store_true", help="lista masters magenta sob assets/")
    ap.add_argument("--check", action="store_true", help="valida os finais em assets/")
    args = ap.parse_args()

    if args.all:
        return cmd_all()
    if args.src and args.out:
        return cmd_single(args.src, args.out)
    if args.scan:
        return cmd_scan()
    if args.check:
        return cmd_check()
    ap.print_help()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
