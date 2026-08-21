/** Procedural beds + SFX. Sem binário: o slice não espera master de loja. */

type Bed = "hub" | "battle" | "off";
type Sfx = "ui" | "hit" | "crit" | "ult" | "death" | "win" | "lose" | "collect" | "pull";

type Ctx = {
  ac: AudioContext;
  master: GainNode;
  music: GainNode;
  sfx: GainNode;
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
    ctx = { ac: audio, master, music, sfx };
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

function tone(
  c: Ctx,
  dest: GainNode,
  freq: number,
  dur: number,
  type: OscillatorType,
  gain: number,
  at = 0,
) {
  const t = c.ac.currentTime + at;
  const o = c.ac.createOscillator();
  const g = c.ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
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
  if (kind === "ui") tone(c, s, 520, 0.07, "triangle", 0.08);
  if (kind === "hit") tone(c, s, 180, 0.09, "square", 0.07);
  if (kind === "crit") {
    tone(c, s, 240, 0.1, "square", 0.08);
    tone(c, s, 480, 0.12, "triangle", 0.06, 0.02);
  }
  if (kind === "ult") {
    tone(c, s, 90, 0.35, "sawtooth", 0.1);
    tone(c, s, 360, 0.28, "triangle", 0.08, 0.04);
  }
  if (kind === "death") tone(c, s, 70, 0.4, "sine", 0.12);
  if (kind === "win") {
    tone(c, s, 392, 0.18, "triangle", 0.1);
    tone(c, s, 523, 0.22, "triangle", 0.09, 0.12);
    tone(c, s, 659, 0.3, "triangle", 0.08, 0.24);
  }
  if (kind === "lose") {
    tone(c, s, 220, 0.25, "sine", 0.1);
    tone(c, s, 146, 0.4, "sine", 0.1, 0.12);
  }
  if (kind === "collect") {
    tone(c, s, 440, 0.12, "sine", 0.09);
    tone(c, s, 660, 0.18, "sine", 0.08, 0.08);
    tone(c, s, 880, 0.22, "triangle", 0.07, 0.16);
  }
  if (kind === "pull") {
    tone(c, s, 220, 0.4, "sawtooth", 0.07);
    tone(c, s, 554, 0.5, "triangle", 0.08, 0.2);
  }
}

export function setBed(next: Bed) {
  if (bed === next) return;
  bed = next;
  bedStop?.();
  bedStop = null;
  const c = ac();
  if (!c || next === "off" || muted) return;

  const oscs: OscillatorNode[] = [];
  const stop = () => {
    const t = c.ac.currentTime;
    for (const o of oscs) {
      try {
        o.stop(t + 0.2);
      } catch {
        /* already */
      }
    }
  };
  bedStop = stop;

  if (next === "hub") {
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
  }

  if (next === "battle") {
    const o = c.ac.createOscillator();
    const g = c.ac.createGain();
    o.type = "square";
    o.frequency.value = 55;
    g.gain.value = 0.03;
    o.connect(g);
    g.connect(c.music);
    o.start();
    oscs.push(o);
    const pulse = c.ac.createOscillator();
    const pg = c.ac.createGain();
    pulse.type = "triangle";
    pulse.frequency.value = 2.2;
    pg.gain.value = 0.02;
    pulse.connect(pg);
    pg.connect(g.gain);
    pulse.start();
    oscs.push(pulse);
  }
}
