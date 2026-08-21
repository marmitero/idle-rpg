/** Carga de texturas de batalha: paralela, com pool de concorrência e dedupe.
 *
 * Por que existe: o BattleView antigo carregava ~50 PNGs SEQUENCIALMENTE
 * (await por textura, por ator), travando a execução. Agora:
 *   1. `preloadBattle()` baixa TUDO em paralelo (pool de 8) antes de montar;
 *   2. `loadTex()` deduplica requisições em voo e reusa o cache do Pixi;
 *   3. batalhas/replays seguintes são instantâneas (cache em memória).
 */

import { Assets, type Texture } from "pixi.js";
import { ENEMIES, HERO_BY_ID } from "@relicwake/content";
import type { BattleInput } from "@relicwake/sim";

const inflight = new Map<string, Promise<Texture>>();

/** Carrega (ou devolve do cache/dedupe) a textura de um URL. */
export function loadTex(url: string): Promise<Texture> {
  let p = inflight.get(url);
  if (!p) {
    p = Assets.load(url)
      .then((t) => t as Texture)
      .finally(() => inflight.delete(url));
    inflight.set(url, p);
  }
  return p;
}

/** Pool simples: executa `worker` sobre `items` com no máximo `limit` em voo. */
function pool<T>(items: T[], worker: (t: T) => Promise<unknown>, limit = 8): Promise<void> {
  let i = 0;
  const run = async (): Promise<void> => {
    while (i < items.length) {
      const cur = items[i]!;
      i += 1;
      await worker(cur);
    }
  };
  return Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run())).then(() => undefined);
}

function unitUrls(heroId: string, withUlt: boolean): string[] {
  const hero = HERO_BY_ID[heroId];
  const enemy = ENEMIES.find((e) => e.id === heroId);
  const art = hero?.art ?? enemy?.art;
  if (!art) return [];
  const a = art as Record<string, string | undefined>;
  const urls: string[] = [];
  for (const key of ["idle", "atk", "hit", "die"] as const) {
    if (a[key]) urls.push(a[key]);
  }
  if (withUlt && a.ult) urls.push(a.ult);
  return urls;
}

/** Pré-carrega (paralelo, pool 8) todas as texturas de uma batalha + fundo. */
export async function preloadBattle(input: BattleInput, bg: string): Promise<number> {
  const urls = new Set<string>([bg]);
  for (const u of input.allies) for (const url of unitUrls(u.heroId, true)) urls.add(url);
  for (const u of input.enemies) for (const url of unitUrls(u.heroId, false)) urls.add(url);
  await pool([...urls], (url) => loadTex(url));
  return urls.size;
}
