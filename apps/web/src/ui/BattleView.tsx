import { ENEMIES, HERO_BY_ID } from "@relicwake/content";
import type { BattleInput, BattleResult } from "@relicwake/sim";
import { Application, Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import { useEffect, useRef } from "react";
import { playSfx, setBed } from "../audio";
import { loadTex, preloadBattle } from "../battleAssets";
import { report, reportError } from "../diag";

/** Grade de depuração do chão: ative com ?floordebug na URL. */
const FLOOR_DEBUG = new URLSearchParams(window.location.search).has("floordebug");

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
 * Linha dos pés por fileira — banda decidida com o usuário (2026-08-21):
 * o pé nunca fica acima de 75% da altura, nem abaixo do meio exato entre a
 * linha de 95% e a borda inferior (97,5%). Frente pisa no limite baixo,
 * topo no limite alto e meio no centro da banda.
 */
const FEET_ROW_Y = [0.975, 0.8625, 0.75]; // fileiras 0 (frente), 1 (meio), 2 (topo)

/**
 * Posição por slot na GRADE 3x3 (9 espaços por time): aliados na esquerda,
 * inimigos na direita. coluna = slot % 3, fileira = floor(slot / 3) — frente
 * (0-2) embaixo, meio (3-5), topo (6-8). Tudo relativo ao canvas.
 */
function slotPos(team: "ally" | "enemy", slot: number, w: number, h: number) {
  const zone = team === "ally" ? { start: 0.08, width: 0.38 } : { start: 0.54, width: 0.38 };
  const s = Math.min(8, Math.max(0, slot));
  const col = s % 3;
  const row = Math.floor(s / 3);
  const colX = (col + 0.5) / 3;
  const x = w * (zone.start + zone.width * colX);
  const y = h * (FEET_ROW_Y[row] ?? 0.8625);
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
          // limite de largura para caber na coluna da grade 3x3; fileiras de
          // trás menores (profundidade 2.5D).
          const isBoss = enemy?.kind === "boss";
          const targetH = h * (isBoss ? 0.26 : 0.19);
          let s = targetH / (idle.height || 1024);
          s = Math.min(s, (w * 0.11) / (idle.width || 1024));
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

        if (FLOOR_DEBUG) {
          // Grade de % para identificar a linha do chão de cada plate.
          const grid = new Container();
          const g = new Graphics();
          for (let p = 30; p <= 95; p += 5) {
            g.moveTo(0, (h * p) / 100).lineTo(w, (h * p) / 100).stroke({
              width: 1,
              color: p % 10 === 0 ? 0x53e0ff : 0x2f7d94,
            });
          }
          grid.addChild(g);
          for (let p = 30; p <= 95; p += 5) {
            const lbl = new Text({ text: `${p}%`, style: { fontSize: 10, fill: 0xbdf0ff } });
            lbl.position.set(4, (h * p) / 100 + 2);
            grid.addChild(lbl);
          }
          const rows: [number, string][] = [
            [0.975, "frente (máx. baixo)"],
            [0.8625, "meio (centro da banda)"],
            [0.75, "topo (máx. alto)"],
          ];
          const rg = new Graphics();
          for (const [f, name] of rows) {
            rg.moveTo(0, h * f).lineTo(w, h * f).stroke({ width: 2, color: 0xff6b6b });
            const lbl = new Text({ text: `${name} ${f}`, style: { fontSize: 10, fill: 0xffc9c9 } });
            lbl.position.set(w - 96, h * f + 2);
            grid.addChild(lbl);
          }
          grid.addChild(rg);
          app.stage.addChild(grid);
          report("floordebug: grade 30–95% (azul) + fileiras atuais (vermelho)");
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
