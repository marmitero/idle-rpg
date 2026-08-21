#!/usr/bin/env python3
"""floor_scan.py — candidatos de linha de chão nos plates de batalha.

Não "vê" a imagem: mede bordas horizontais e textura por linha e ranqueia
onde um horizonte/chão costuma estar (metade inferior do plate). A saída é
uma tabela de candidatos (%) para o agente/usuario validarem com o overlay
`?floordebug` do BattleView.

Uso: python3 tools/asset-pipeline/floor_scan.py
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ENV = ROOT / "assets" / "environments"

BATTLE_BGS = [
    "biomes/rw_env_battle_spire_base.png",
    "biomes/rw_env_battle_emberworks.png",
    "biomes/rw_env_battle_tidevault.png",
    "biomes/rw_env_battle_thorn.png",
    "biomes/rw_env_battle_ash.png",
    "biomes/rw_env_battle_crown.png",
    "hunts/rw_env_hunt_goblin.png",
    "hunts/rw_env_hunt_wyrm.png",
    "hunts/rw_env_hunt_hydra.png",
    "guild/rw_env_guild_hall.png",
]


def analyze(path: Path) -> list[tuple[float, float]]:
    im = Image.open(path).convert("RGB")
    tw = 300
    th = max(1, int(im.height * tw / im.width))
    a = np.asarray(im.resize((tw, th))).astype(np.int16)
    lum = a.mean(axis=2)
    # força de borda horizontal por linha (transição de cima p/ baixo)
    edge = np.abs(np.diff(lum, axis=0)).mean(axis=1)  # (th-1,)
    # textura (variância) por linha — chão costuma ser mais "ruidoso" que céu
    var = lum.var(axis=1)

    lo, hi = int(0.35 * th), int(0.97 * th)
    scores = edge[lo:hi] * (1 + 0.15 * (var[lo + 1 : hi + 1] - var[lo:hi]) / (var[lo:hi] + 1.0))
    order = np.argsort(scores)[::-1][:8]
    cands: list[tuple[float, float]] = []
    for i in order:
        y_pct = round((lo + i + 1) / th * 100, 1)
        cands.append((y_pct, round(float(scores[i]), 2)))
    return cands


def main() -> None:
    print(f"{'plate':44s}  candidatos (y% do alto, pontuação)")
    print("-" * 78)
    for rel in BATTLE_BGS:
        p = ENV / rel
        if not p.exists():
            print(f"{rel:44s}  FALTA")
            continue
        cands = analyze(p)
        top = ", ".join(f"{y}%({s:.0f})" for y, s in cands[:4])
        print(f"{rel:44s}  {top}")


if __name__ == "__main__":
    main()
