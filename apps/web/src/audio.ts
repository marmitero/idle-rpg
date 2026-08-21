/** Áudio procedural em camadas.
 *
 * Sem binário no repo: o slice sintetiza tudo no WebAudio. A partir da
 * revisão de 2026-08-21, os sons de batalha foram redesenhados em camadas
 * no padrão dos packs gratuitos bem avaliados (whoosh + impacto, kick
 * sequenciado, hats, rise + boom de ultimate) — ver docs/16. Quando a
 * rede permitir baixar referências CC0 (freesound/opengameart/kenney),
 * os arquivos substituem a síntese sem mudar a API.
 */

type Bed = "hub" | "battle" | "off";
type Sfx = "ui" | "hit" | "crit" | "ult" | "death" | "win" | "lose" | "collect" | "pull";

type Ctx = {
  ac: AudioContext;
  master: GainNode;
  music: GainNode;
  sfx: GainNode;
  noiseBuf: AudioBuffer;
};

type ToneOpts = {
  freq: number;
  slide?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  at?: number;
  lp?: number;
};

type NoiseOpts = {
  dur: number;
  gain?: number;
  at?: number;
  hp?: number;
  lp?: number;
  decay?: number;
};

let ctx: Ctx | null = null;
let bed: Bed = "off";
let bedStop: (() => void) | null = null;
let muted = localStorage.getItem("relicwake.mute") === "1";
let volume = Number(localStorage.getItem("relicwake.vol") ?? "0.7");
let lastHit = 0;

function ac(): Ctx | null {
  return ctx;
}

function noiseBuffer(a: AudioContext): AudioBuffer {
  const buf = a.createBuffer(1, a.sampleRate, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

export function unlockAudio() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!ctx) {
    const audio = new AC();
    const master = audio.createGain();
    const music = audio.createGain();
    const sfx = audio.createGain();
    music.gain.value = 0.2;
    sfx.gain.value = 0.5;
    master.gain.value = muted ? 0 : volume;
    music.connect(master);
    sfx.connect(master);
    master.connect(audio.destination);
    ctx = { ac: audio, master, music, sfx, noiseBuf: noiseBuffer(audio) };
  }
  if (ctx.ac.state === "suspended") void ctx.ac.resume();
}

export function isMuted() {
  return muted;
}

export function getVolume() {
  return volume;
}

export function setMuted(v: boolean) {
  muted = v;
  localStorage.setItem("relicwake.mute", v ? "1" : "0");
  if (ctx) ctx.master.gain.setTargetAtTime(v ? 0 : volume, ctx.ac.currentTime, 0.05);
}

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  localStorage.setItem("relicwake.vol", String(volume));
  if (ctx && !muted) ctx.master.gain.setTargetAtTime(volume, ctx.ac.currentTime, 0.05);
}

/** Oscilador com envelope exp e (opcional) glide de pitch e lowpass. */
function tone(c: Ctx, dest: GainNode, o: ToneOpts) {
  const t = c.ac.currentTime + (o.at ?? 0);
  const osc = c.ac.createOscillator();
  const g = c.ac.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t);
  if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + o.dur);
  g.gain.setValueAtTime(o.gain ?? 0.1, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  g.connect(dest);
  let head: AudioNode = osc;
  if (o.lp) {
    const f = c.ac.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = o.lp;
    osc.connect(f);
    head = f;
  }
  head.connect(g);
  osc.start(t);
  osc.stop(t + o.dur + 0.02);
}

/** Rajada de ruído branco com filtros e decaimento próprio. */
function noise(c: Ctx, dest: GainNode, o: NoiseOpts) {
  const t = c.ac.currentTime + (o.at ?? 0);
  const src = c.ac.createBufferSource();
  src.buffer = c.noiseBuf;
  src.loop = true;
  const g = c.ac.createGain();
  g.gain.setValueAtTime(o.gain ?? 0.1, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (o.decay ?? o.dur));
  g.connect(dest);
  let head: AudioNode = src;
  if (o.hp) {
    const f = c.ac.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = o.hp;
    src.connect(f);
    head = f;
  }
  if (o.lp) {
    const f = c.ac.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = o.lp;
    head.connect(f);
    head = f;
  }
  head.connect(g);
  src.start(t);
  src.stop(t + o.dur + 0.02);
}

export function playSfx(kind: Sfx) {
  const c = ac();
  if (!c || muted) return;
  const now = performance.now();
  if (kind === "hit" || kind === "crit") {
    if (now - lastHit < 70) return;
    lastHit = now;
  }
  const s = c.sfx;

  if (kind === "ui") {
    tone(c, s, { freq: 640, slide: 460, dur: 0.05, type: "triangle", gain: 0.05 });
  }
  if (kind === "hit") {
    // ataque: whoosh (ruído agudo) + impacto (glide grave)
    noise(c, s, { dur: 0.06, gain: 0.07, hp: 900 });
    tone(c, s, { freq: 380, slide: 150, dur: 0.08, type: "square", gain: 0.045 });
  }
  if (kind === "crit") {
    // crítico: whoosh mais brilhante + impacto + anel metálico
    noise(c, s, { dur: 0.09, gain: 0.06, hp: 2400 });
    tone(c, s, { freq: 1000, slide: 240, dur: 0.09, type: "sawtooth", gain: 0.05 });
    tone(c, s, { freq: 1500, dur: 0.14, type: "triangle", gain: 0.035, at: 0.01 });
  }
  if (kind === "ult") {
    // ultimate: rise (glide grave) + swell de ruído + shimmer
    tone(c, s, { freq: 90, slide: 38, dur: 0.45, type: "sine", gain: 0.16 });
    noise(c, s, { dur: 0.35, gain: 0.07, lp: 500, decay: 0.28 });
    tone(c, s, { freq: 660, dur: 0.1, type: "triangle", gain: 0.03, at: 0.1 });
    tone(c, s, { freq: 990, dur: 0.12, type: "triangle", gain: 0.03, at: 0.14 });
    tone(c, s, { freq: 1320, dur: 0.16, type: "triangle", gain: 0.025, at: 0.18 });
  }
  if (kind === "death") {
    // morte: gliss descendente + corpo de ruído
    tone(c, s, { freq: 320, slide: 50, dur: 0.7, type: "sine", gain: 0.14 });
    noise(c, s, { dur: 0.35, gain: 0.05, lp: 700, decay: 0.3 });
  }
  if (kind === "win") {
    const notes = [392, 523, 659, 784];
    notes.forEach((f, i) => tone(c, s, { freq: f, dur: 0.14, type: "triangle", gain: 0.09, at: i * 0.09 }));
    tone(c, s, { freq: 196, dur: 0.5, type: "sine", gain: 0.05 });
  }
  if (kind === "lose") {
    const notes = [220, 175, 146];
    notes.forEach((f, i) => tone(c, s, { freq: f, dur: 0.18, type: "sawtooth", gain: 0.045, at: i * 0.14, lp: 800 }));
  }
  if (kind === "collect") {
    tone(c, s, { freq: 700, slide: 920, dur: 0.06, type: "triangle", gain: 0.06 });
    tone(c, s, { freq: 1240, dur: 0.09, type: "triangle", gain: 0.045, at: 0.05 });
  }
  if (kind === "pull") {
    // gacha: whoosh de revelação + arpejo de brilho
    noise(c, s, { dur: 0.5, gain: 0.06, hp: 400, decay: 0.45 });
    [554, 740, 1108].forEach((f, i) => tone(c, s, { freq: f, dur: 0.1, type: "triangle", gain: 0.05, at: 0.18 + i * 0.05 }));
  }
}

export function setBed(next: Bed) {
  if (bed === next) return;
  bed = next;
  bedStop?.();
  bedStop = null;
  const c = ac();
  if (!c || next === "off" || muted) return;

  if (next === "hub") {
    const oscs: OscillatorNode[] = [];
    const pad = (freq: number, gain: number) => {
      const o = c.ac.createOscillator();
      const g = c.ac.createGain();
      const lfo = c.ac.createOscillator();
      const lg = c.ac.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = gain;
      lfo.frequency.value = 0.07 + freq / 8000;
      lg.gain.value = freq * 0.012;
      lfo.connect(lg);
      lg.connect(o.frequency);
      o.connect(g);
      g.connect(c.music);
      o.start();
      lfo.start();
      oscs.push(o, lfo);
    };
    pad(110, 0.045);
    pad(164.81, 0.03);
    pad(246.94, 0.018);
    bedStop = () => {
      const t = c.ac.currentTime;
      for (const o of oscs) {
        try {
          o.stop(t + 0.2);
        } catch {
          /* já parado */
        }
      }
    };
  }

  if (next === "battle") {
    // Cama de batalha sequenciada (112 BPM, colcheias): kick 4x4, hats no
    // contratempo, baixo alternando A1/E2 por barra e pad por baixo.
    const stepDur = 60 / 112 / 2;
    let step = 0;
    let nextTime = c.ac.currentTime + 0.05;
    const schedule = (st: number, t: number) => {
      const at = t - c.ac.currentTime;
      if (st % 4 === 0) tone(c, c.music, { freq: 130, slide: 40, dur: 0.14, gain: 0.15, at });
      if (st % 4 === 2) noise(c, c.music, { dur: 0.03, gain: 0.022, hp: 6000, at });
      if (st % 8 === 0) {
        const root = st % 16 === 0 ? 55 : 82.41;
        tone(c, c.music, { freq: root, dur: 0.42, type: "sawtooth", gain: 0.05, lp: 260, at });
        tone(c, c.music, { freq: root * 2, dur: 1.6, gain: 0.012, at });
        tone(c, c.music, { freq: root * 3, dur: 1.6, gain: 0.01, at });
        tone(c, c.music, { freq: root * 4, dur: 1.6, gain: 0.008, at });
      }
    };
    const timer = window.setInterval(() => {
      while (nextTime < c.ac.currentTime + 0.15) {
        schedule(step % 16, nextTime);
        nextTime += stepDur;
        step += 1;
      }
    }, 40);
    bedStop = () => window.clearInterval(timer);
  }
}
