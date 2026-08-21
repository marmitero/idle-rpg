import { ENEMIES, HERO_BY_ID } from "@relicwake/content";
import type { BattleInput, BattleResult } from "@relicwake/sim";
import { Application, Container, Sprite, Texture } from "pixi.js";
import { useEffect, useRef } from "react";
import { chromaUrl } from "../chroma";

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

function slotPos(team: "ally" | "enemy", slot: number, w: number, h: number) {
  const col = slot < 2 ? 0 : 1;
  const row = slot < 2 ? slot : slot - 2;
  const ox = team === "ally" ? w * 0.22 : w * 0.62;
  const oy = h * 0.42 + row * (h * 0.14);
  const dx = col * w * 0.16;
  return { x: ox + (team === "ally" ? dx : -dx), y: oy };
}

async function tex(url: string): Promise<Texture> {
  const data = await chromaUrl(url);
  return Texture.from(data);
}

export function BattleView({ bg, input, result, speed, onDone }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const done = useRef(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    done.current = false;
    const app = new Application();
    let destroyed = false;

    const run = async () => {
      await app.init({
        background: "#120e18",
        resizeTo: el,
        antialias: false,
        autoDensity: true,
        resolution: Math.min(2, window.devicePixelRatio || 1),
      });
      if (destroyed) {
        app.destroy();
        return;
      }
      el.appendChild(app.canvas);
      const w = app.renderer.width;
      const h = app.renderer.height;

      try {
        const bgTex = Texture.from(bg);
        const bgSpr = new Sprite(bgTex);
        bgSpr.width = w;
        bgSpr.height = h;
        app.stage.addChild(bgSpr);
      } catch {
        /* empty */
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
        const idle = await tex("idle" in art ? art.idle : art.idle);
        const atk = await tex("atk" in art ? art.atk : art.idle);
        const hit = await tex("hit" in art ? art.hit : art.idle);
        const die = await tex("die" in art ? art.die : art.idle);
        const ult = await tex("ult" in art && art.ult ? art.ult : art.atk);
        const spr = new Sprite(idle);
        const pos = slotPos(team, u.slot, w, h);
        const scale = team === "enemy" && u.heroId.includes("wyrm") ? 0.22 : team === "enemy" ? 0.2 : 0.22;
        spr.anchor.set(0.5, 0.85);
        spr.scale.set(team === "ally" ? scale : -scale, Math.abs(scale));
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
            const a = actors.get(ev.id);
            if (a) a.spr.texture = a.textures.die ?? a.textures.idle!;
          }
          if (ev.kind === "end" && !done.current) {
            done.current = true;
            window.setTimeout(onDone, 900);
          }
        }
      };
      app.ticker.add(ticker);
    };

    void run();
    return () => {
      destroyed = true;
      app.destroy(true);
    };
  }, [bg, input, result, onDone]);

  return (
    <div
      ref={host}
      style={{ width: "100%", height: "min(62dvh, 520px)", background: "#120e18" }}
    />
  );
}
