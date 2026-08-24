export type SfxKind =
  | "energy"
  | "life"
  | "token"
  | "hitMushroom"
  | "hitTunnel"
  | "hitRock"
  | "crash"
  | "nearMiss";

type OscKind = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (!master) {
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  }
  return ctx;
}

async function resume() {
  const ac = audio();
  if (ac && ac.state === "suspended") await ac.resume().catch(() => {});
}

function env(gain: GainNode, t: number, peak: number, attack: number, release: number) {
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
}

function tone(
  ac: AudioContext,
  dest: AudioNode,
  freq: number,
  t: number,
  dur: number,
  type: OscKind,
  peak: number,
  attack = 0.008,
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  env(g, t, peak, attack, dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(t);
  osc.stop(t + attack + dur + 0.02);
}

function noiseBurst(ac: AudioContext, dest: AudioNode, t: number, dur: number, peak: number, hp = 400, lp = 2400) {
  const n = ac.createBufferSource();
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  n.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = (hp + lp) / 2;
  filter.Q.value = 0.7;
  const g = ac.createGain();
  env(g, t, peak, 0.004, dur);
  n.connect(filter);
  filter.connect(g);
  g.connect(dest);
  n.start(t);
  n.stop(t + dur + 0.02);
}

export function armSfx() {
  void resume();
}

export function playSfx(kind: SfxKind, muted: boolean) {
  if (muted) return;
  const ac = audio();
  if (!ac || !master) return;
  void resume();
  const t = ac.currentTime + 0.01;

  if (kind === "energy") {
    tone(ac, master, 880, t, 0.07, "triangle", 0.5, 0.003);
    tone(ac, master, 1320, t + 0.045, 0.1, "sine", 0.38, 0.004);
    tone(ac, master, 1760, t + 0.09, 0.08, "triangle", 0.22, 0.004);
    return;
  }
  if (kind === "life") {
    tone(ac, master, 330, t, 0.14, "sine", 0.4);
    tone(ac, master, 494, t + 0.08, 0.16, "triangle", 0.48);
    tone(ac, master, 659, t + 0.16, 0.22, "sine", 0.42);
    tone(ac, master, 988, t + 0.24, 0.28, "triangle", 0.28);
    return;
  }
  if (kind === "token") {
    tone(ac, master, 880, t, 0.08, "square", 0.22);
    tone(ac, master, 1320, t + 0.06, 0.16, "triangle", 0.35);
    return;
  }
  if (kind === "nearMiss") {
    noiseBurst(ac, master, t, 0.16, 0.28, 900, 3200);
    tone(ac, master, 220, t, 0.1, "sine", 0.12);
    return;
  }
  if (kind === "hitMushroom") {
    noiseBurst(ac, master, t, 0.18, 0.4, 180, 900);
    tone(ac, master, 110, t, 0.16, "sawtooth", 0.28);
    tone(ac, master, 73, t + 0.02, 0.2, "sine", 0.35);
    return;
  }
  if (kind === "hitTunnel") {
    noiseBurst(ac, master, t, 0.22, 0.45, 120, 700);
    tone(ac, master, 62, t, 0.24, "square", 0.22);
    tone(ac, master, 98, t + 0.04, 0.18, "triangle", 0.2);
    return;
  }
  if (kind === "hitRock") {
    noiseBurst(ac, master, t, 0.14, 0.38, 200, 1100);
    tone(ac, master, 82, t, 0.14, "square", 0.2);
    return;
  }
  noiseBurst(ac, master, t, 0.32, 0.55, 80, 500);
  tone(ac, master, 48, t, 0.36, "sine", 0.5);
  tone(ac, master, 36, t + 0.05, 0.4, "triangle", 0.28);
}
