import type { MushroomLook } from "./props";

export const STAGE_KEY = "dino_run_stage";
export const MUTE_KEY = "dino_run_muted";

export type StageId = 1 | 2 | 3;

export type StageTheme = {
  id: StageId;
  name: string;
  tagline: string;
  music: string;
  playbackRate: number;
  sky: string;
  fog: string;
  sun: string;
  sunGlow: string;
  ground: string;
  grass: string;
  lane: string;
  laneMid: string;
  stripe: string;
  stripeEmissive: string;
  hills: [string, string];
  hemiSky: string;
  hemiGround: string;
  dirLight: string;
  accentA: string;
  accentB: string;
  spores: [string, string, string, string];
  grove: MushroomLook[];
  hazard: MushroomLook;
  wrap: string;
  overlay: string;
  hud: string;
  speedBase: number;
  speedRamp: number;
  mushroomChance: number;
  spawnMin: number;
  spawnMax: number;
};

const groveMuted: MushroomLook[] = [
  { cap: "#c45a88", emissive: "#8a2a55", stem: "#e8d7b4", spot: "#f3e6d0", glow: "#d98aa8" },
  { cap: "#5a6aad", emissive: "#2e3a7a", stem: "#e6d8b8", spot: "#d8d4ec", glow: "#8a90c8" },
  { cap: "#c9a43a", emissive: "#8a6a12", stem: "#eadcb8", spot: "#f4ead0", glow: "#d4b86a" },
];

export const STAGES: Record<StageId, StageTheme> = {
  1: {
    id: 1,
    name: "Dawn Grove",
    tagline: "Open the tape. Jump the rocks. Don't eat the red caps.",
    music: "/game/music/dino-dash-boost.mp3",
    playbackRate: 1,
    sky: "#7ec8ea",
    fog: "#c3e2d2",
    sun: "#ffe07a",
    sunGlow: "#ffd36a",
    ground: "#1f6b32",
    grass: "#2f8a44",
    lane: "#f3ecc4",
    laneMid: "#fff8d8",
    stripe: "#fff4a0",
    stripeEmissive: "#e8c84a",
    hills: ["#246b38", "#348a4c"],
    hemiSky: "#fff1c8",
    hemiGround: "#2a6e3a",
    dirLight: "#fff4d0",
    accentA: "#ff9ec8",
    accentB: "#7c6bff",
    spores: ["#fff4a0", "#ff9ec8", "#7dffb3", "#8ed8ff"],
    grove: groveMuted,
    hazard: {
      cap: "#e83c1a",
      emissive: "#c21800",
      stem: "#f3e4c0",
      spot: "#2a140c",
      glow: "#ff7a45",
    },
    wrap: "bg-[#7ec8ea]",
    overlay: "bg-black/82",
    hud: "border-white/20 bg-black/62",
    speedBase: 4.5,
    speedRamp: 6,
    mushroomChance: 0.16,
    spawnMin: 22,
    spawnMax: 50,
  },
  2: {
    id: 2,
    name: "Volt Dusk",
    tagline: "Faster tape. Same hole. Clip a cap and you're off the board.",
    music: "/game/music/dino-dash-boost-alt.mp3",
    playbackRate: 1,
    sky: "#24143c",
    fog: "#3a2458",
    sun: "#ffb06a",
    sunGlow: "#ff8a4a",
    ground: "#1a1428",
    grass: "#2a1c3c",
    lane: "#f0d48a",
    laneMid: "#ffe9b0",
    stripe: "#7dffb3",
    stripeEmissive: "#3ecf8e",
    hills: ["#3a1a55", "#1c2840"],
    hemiSky: "#ffc89a",
    hemiGround: "#1a1028",
    dirLight: "#ffd0a8",
    accentA: "#ff8ad4",
    accentB: "#7c6bff",
    spores: ["#f0d48a", "#ff8ad4", "#7dffb3", "#b8a0ff"],
    grove: [
      { cap: "#6a3a88", emissive: "#4a2068", stem: "#d8c8a8", spot: "#c8b8d8", glow: "#a070c0" },
      { cap: "#3a4a78", emissive: "#243058", stem: "#d8c8a8", spot: "#b8c4d8", glow: "#7080b0" },
      { cap: "#8a4a6a", emissive: "#5a2848", stem: "#d8c8a8", spot: "#e0c8d0", glow: "#c07090" },
    ],
    hazard: {
      cap: "#ff6a12",
      emissive: "#e04800",
      stem: "#f3e4c0",
      spot: "#2a140c",
      glow: "#ffb06a",
    },
    wrap: "bg-[#24143c]",
    overlay: "bg-black/84",
    hud: "border-white/18 bg-black/68",
    speedBase: 5.5,
    speedRamp: 7,
    mushroomChance: 0.22,
    spawnMin: 18,
    spawnMax: 42,
  },
  3: {
    id: 3,
    name: "Night Tape",
    tagline: "Icy lanes. Neon edges. Spend the vault on kit.",
    music: "/game/music/dino-dash-boost.mp3",
    playbackRate: 1.06,
    sky: "#070b16",
    fog: "#10182a",
    sun: "#d8f0ff",
    sunGlow: "#8ec8ff",
    ground: "#0a1018",
    grass: "#121a24",
    lane: "#e8f6ff",
    laneMid: "#ffffff",
    stripe: "#3ecf8e",
    stripeEmissive: "#7dffb3",
    hills: ["#101828", "#182030"],
    hemiSky: "#8eb8ff",
    hemiGround: "#0a1018",
    dirLight: "#dce8ff",
    accentA: "#3ecf8e",
    accentB: "#5ec8ff",
    spores: ["#3ecf8e", "#5ec8ff", "#e8f6ff", "#7dffb3"],
    grove: [
      { cap: "#1a3a48", emissive: "#0e2834", stem: "#c8bca0", spot: "#8aa8b0", glow: "#3a6a78" },
      { cap: "#243050", emissive: "#141c38", stem: "#c8bca0", spot: "#8890b0", glow: "#4a5878" },
      { cap: "#1a4840", emissive: "#0e302c", stem: "#c8bca0", spot: "#88b0a4", glow: "#2a6860" },
    ],
    hazard: {
      cap: "#ff3b2e",
      emissive: "#ff1808",
      stem: "#f3e4c0",
      spot: "#2a100c",
      glow: "#ff8a70",
    },
    wrap: "bg-[#070b16]",
    overlay: "bg-black/86",
    hud: "border-accent/30 bg-black/55",
    speedBase: 6.6,
    speedRamp: 8,
    mushroomChance: 0.28,
    spawnMin: 16,
    spawnMax: 34,
  },
};

export function isStageId(value: unknown): value is StageId {
  return value === 1 || value === 2 || value === 3;
}

export function loadStage(): StageId {
  const n = Number.parseInt(localStorage.getItem(STAGE_KEY) || "1", 10);
  return isStageId(n) ? n : 1;
}

export function loadMuted() {
  return localStorage.getItem(MUTE_KEY) === "1";
}
