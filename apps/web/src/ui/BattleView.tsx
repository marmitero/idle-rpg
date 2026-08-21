import { ENEMIES, HERO_BY_ID } from "@relicwake/content";
import type { BattleInput, BattleResult } from "@relicwake/sim";
import { Application, Container, Sprite, Texture } from "pixi.js";
import { useEffect, useRef } from "react";
import { playSfx, setBed } from "../audio";
import { loadTex, preloadBattle } from "../battleAssets";
import { report, reportError } from "../diag";

/** Pixi playback of a server-judged BattleResult. Never calls simulate(). */
type Props = {
  bg: string;
  input: BattleInput;
  result: BattleResult;
  speed: number;
  onDone: () => void;
};

type Actor = {
  id: string;
  spr: Sprite;
  textures: Record<string, Texture>;
  x: number;
  y: number;
};

/**
 * Posição por slot em ZONAS: aliados na esquerda, inimigos na direita.
 * Fileiras: 0 = frente (baixo), 1 = meio, 2 = topo. Slot 4 centralizado no
 * topo da zona. Tudo relativo ao canvas — sem pixels fixos.
 */
function slotPos(team: "ally" | "enemy", slot: number, w: number, h: number) {
  const zone = team === "ally" ? { start: 0.1, width: 0.32 } : { start: 0.58, width: 0.32 };
  const row = slot < 2 ? 0 : slot < 4 ? 1 : 2;
  const col = slot % 2;
  const colX = slot === 4 ? 0.5 : 0.28 + 0.44 * col;
  const x = w * (zone.start + zone.width * colX);
  const y = h * (row === 0 ? 0.8 : row === 1 ? 0.54 : 0.28);
  return { x, y, row };
}

async function tex(url: string): Promise<Texture> {
  // Assets pré-carregados em paralelo; loadTex devolve do cache/dedupe.
  try {
    return await loadTex(url);
  } catch (e) {
    reportError(`tex ${url.split("/").pop()}`, e);
    return Texture.EMPTY;
  }
}

export function BattleView({ bg, input, result, speed, onDone }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const done = useRef(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    done.current = false;
    setBed("battle");
    const app = new Application();
    let destroyed = false;
    let ready = false;

    const safeDestroy = () => {
      try {
        app.destroy(true);
      } catch (e) {
        reportError("app.destroy", e);
      }
    };

    const run = async () => {
      try {
        await app.init({
          background: "#120e18",
          resizeTo: el,
          antialias: false,
          autoDensity: true,
          resolution: Math.min(2, window.devicePixelRatio || 1),
        });
        // StrictMode (dev) pode ter desmontado enquanto init estava pendente;
        // agora o init terminou, então destruir é seguro.
        if (destroyed) {
          safeDestroy();
          return;
        }
        ready = true;
        el.appendChild(app.canvas);
        const w = app.renderer.width;
        const h = app.renderer.height;
        report(`pixi ok canvas=${w}x${h} dpr=${window.devicePixelRatio}`);

        // Pré-carga paralela (pool 8) — elimina os ~50 awaits sequenciais.
        const t0 = performance.now();
        const n = await preloadBattle(input, bg);
        report(`preload ${n} texturas em ${Math.round(performance.now() - t0)}ms`);

        try {
          const bgTex = await loadTex(bg);
          const bgSpr = new Sprite(bgTex);
          bgSpr.width = w;
          bgSpr.height = h;
          app.stage.addChild(bgSpr);
          report(`bg ok ${bg.split("/").pop()}`);
        } catch (e) {
          reportError(`bg ${bg.split("/").pop()}`, e);
        }

        const layer = new Container();
        app.stage.addChild(layer);

        const actors = new Map<string, Actor>();
        const all = [
          ...input.allies.map((u) => ({ u, team: "ally" as const })),
          ...input.enemies.map((u) => ({ u, team: "enemy" as const })),
        ];

        for (const { u, team } of all) {
          const hero = HERO_BY_ID[u.heroId];
          const enemy = ENEMIES.find((e) => e.id === u.heroId);
          const art = hero?.art ?? enemy?.art;
          if (!art) continue;
          const a = art as { idle: string; atk: string; hit: string; die: string; ult?: string };
          const idle = await tex(a.idle);
          const atk = await tex(a.atk);
          const hit = await tex(a.hit);
          const die = await tex(a.die);
          const ult = await tex(a.ult ?? a.atk);
          const spr = new Sprite(idle);
          const pos = slotPos(team, u.slot, w, h);
          // Tamanho relativo ao CANVAS: herói ≈ 19% da altura, boss ≈ 26%;
          // limite de largura para caber na coluna; fileiras de trás menores
          // (profundidade 2.5D).
          const isBoss = enemy?.kind === "boss";
          const targetH = h * (isBoss ? 0.26 : 0.19);
          let s = targetH / (idle.height || 1024);
          s = Math.min(s, (w * 0.15) / (idle.width || 1024));
          s = Math.min(0.32, Math.max(0.05, s));
          const depth = pos.row === 0 ? 1.04 : pos.row === 1 ? 0.98 : 0.92;
          spr.anchor.set(0.5, 0.9);
          // Orientação canônica da arte: sprites desenhados mirando para a
          // ESQUERDA. No palco, aliados (esquerda) são espelhados para mirar
          // à direita; inimigos (direita) mantêm a orientação → frente a frente.
          spr.scale.set((team === "ally" ? -s : s) * depth, s * depth);
          spr.position.set(pos.x, pos.y);
          layer.addChild(spr);
          actors.set(u.id, {
            id: u.id,
            spr,
            textures: { idle, atk, hit, die, ult },
            x: pos.x,
            y: pos.y,
          });
        }
        report(`atores ${actors.size}/${all.length} eventos=${result.events.length}`);
        (window as unknown as { __battle?: unknown }).__battle = { app, actors, input, result };

        let i = 0;
        let acc = 0;
        const events = result.events;

        const ticker = () => {
          const dt = app.ticker.deltaMS * speedRef.current;
          acc += dt;
          while (i < events.length && acc >= events[i]!.t) {
            const ev = events[i]!;
            i += 1;
            if (ev.kind === "attack" || ev.kind === "ult") {
              playSfx(ev.kind === "ult" ? "ult" : ev.kind === "attack" && ev.crit ? "crit" : "hit");
              const src = actors.get(ev.src);
              const dst = actors.get(ev.dst);
              if (src) {
                src.spr.texture = src.textures[ev.kind === "ult" ? "ult" : "atk"] ?? src.textures.idle!;
                window.setTimeout(() => {
                  if (src.spr.texture !== src.textures.die) src.spr.texture = src.textures.idle!;
                }, 280 / speedRef.current);
              }
              if (dst) {
                dst.spr.texture = dst.textures.hit ?? dst.textures.idle!;
                dst.spr.tint = 0xff8888;
                window.setTimeout(() => {
                  dst.spr.tint = 0xffffff;
                  if (dst.spr.texture !== dst.textures.die) dst.spr.texture = dst.textures.idle!;
                }, 180 / speedRef.current);
              }
            }
            if (ev.kind === "death") {
              playSfx("death");
              const a = actors.get(ev.id);
              if (a) a.spr.texture = a.textures.die ?? a.textures.idle!;
            }
            if (ev.kind === "end" && !done.current) {
              done.current = true;
              playSfx(ev.winner === "ally" ? "win" : "lose");
              window.setTimeout(() => onDoneRef.current(), 900);
            }
          }
        };
        app.ticker.add(ticker);
      } catch (e) {
        reportError("battle init", e);
        if (destroyed) safeDestroy();
      }
    };

    void run();
    return () => {
      destroyed = true;
      setBed("hub");
      delete (window as unknown as { __battle?: unknown }).__battle;
      // NUNCA destruir antes do init resolver: ResizePlugin.destroy() chama
      // this._cancelResize() sem guarda (pixi 8.19) e a exceção derruba a
      // árvore React inteira (tela preta). O run() destrói ao resolver.
      if (ready) safeDestroy();
    };
  }, [bg, input, result]);

  return (
    <div
      ref={host}
      style={{ width: "100%", height: "min(62dvh, 520px)", background: "#120e18" }}
    />
  );
}
