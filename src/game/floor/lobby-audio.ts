const MUTE_KEY = "dinoverse-lobby-mute";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let nodes: AudioNode[] = [];
let playing = false;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  return ctx;
}

export function isLobbyMuted() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MUTE_KEY) === "1";
}

export function setLobbyMuted(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  if (value) stopLobbyBed();
}

export async function startLobbyBed() {
  if (playing || isLobbyMuted()) return;
  const ac = audio();
  if (!ac) return;
  if (ac.state === "suspended") await ac.resume().catch(() => {});
  master = ac.createGain();
  master.gain.value = 0.045;
  master.connect(ac.destination);

  const drone = ac.createOscillator();
  drone.type = "sine";
  drone.frequency.value = 58;
  const droneG = ac.createGain();
  droneG.gain.value = 0.55;
  drone.connect(droneG);
  droneG.connect(master);

  const fifth = ac.createOscillator();
  fifth.type = "triangle";
  fifth.frequency.value = 87;
  const fifthG = ac.createGain();
  fifthG.gain.value = 0.12;
  fifth.connect(fifthG);
  fifthG.connect(master);

  const len = ac.sampleRate * 2;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
  const hush = ac.createBufferSource();
  hush.buffer = buf;
  hush.loop = true;
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 380;
  const hushG = ac.createGain();
  hushG.gain.value = 0.22;
  hush.connect(lp);
  lp.connect(hushG);
  hushG.connect(master);

  drone.start();
  fifth.start();
  hush.start();
  nodes = [drone, fifth, hush, droneG, fifthG, hushG, lp, master];
  playing = true;
}

export function stopLobbyBed() {
  if (!playing) return;
  for (const node of nodes) {
    try {
      if ("stop" in node) (node as OscillatorNode).stop();
      node.disconnect();
    } catch {
      /* already stopped */
    }
  }
  nodes = [];
  master = null;
  playing = false;
}
