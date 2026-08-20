#!/usr/bin/env python3
"""Force a solid #FF00FF backdrop for chroma key.

Usage:
  chroma_magenta.py path/to/image.png [more.png]
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

MAGENTA = (255, 0, 255)
# how close to sampled edge color / white / near-magenta we treat as backdrop
EDGE_DIST = 48
WHITE_DIST = 36
NEAR_MAGENTA = 40


def dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2])


def is_magenta_like(rgb: tuple[int, int, int]) -> bool:
    r, g, b = rgb
    return r > 200 and b > 200 and g < 80


def process(path: Path) -> None:
    src = Image.open(path).convert("RGBA")
    w, h = src.size
    px = src.load()
    assert px is not None

    corners = [
        px[0, 0][:3],
        px[w - 1, 0][:3],
        px[0, h - 1][:3],
        px[w - 1, h - 1][:3],
    ]
    # majority corner as sampled backdrop (ignore already-magenta)
    samples = [c for c in corners if not is_magenta_like(c)]
    backdrop = samples[0] if samples else MAGENTA

    out = Image.new("RGB", (w, h), MAGENTA)
    dst = out.load()
    assert dst is not None

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            rgb = (r, g, b)
            edge = x < 2 or y < 2 or x >= w - 2 or y >= h - 2
            kill = (
                a < 250
                or is_magenta_like(rgb)
                or dist(rgb, MAGENTA) < NEAR_MAGENTA
                or dist(rgb, (255, 255, 255)) < WHITE_DIST
                or dist(rgb, backdrop) < EDGE_DIST
            )
            # keep interior near-white highlights (eyes, metal) — only kill if
            # connected-ish to edge via being very close to sampled bg OR alpha
            if a >= 250 and dist(rgb, (255, 255, 255)) < WHITE_DIST and not edge:
                # white highlight on subject: keep unless also matching backdrop
                if dist(rgb, backdrop) >= EDGE_DIST and not is_magenta_like(rgb):
                    kill = False
            if kill:
                dst[x, y] = MAGENTA
            else:
                dst[x, y] = rgb

    # second pass: flood from edges through remaining near-backdrop
    stack = []
    seen = [[False] * w for _ in range(h)]
    for x in range(w):
        stack.append((x, 0))
        stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y))
        stack.append((w - 1, y))
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y][x]:
            continue
        seen[y][x] = True
        rgb = dst[x, y]
        if rgb == MAGENTA or dist(rgb, backdrop) < EDGE_DIST or is_magenta_like(rgb):
            dst[x, y] = MAGENTA
            stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    out.save(path)
    print(f"chroma {path}")


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: chroma_magenta.py <png>...", file=sys.stderr)
        sys.exit(2)
    for arg in sys.argv[1:]:
        process(Path(arg))


if __name__ == "__main__":
    main()
