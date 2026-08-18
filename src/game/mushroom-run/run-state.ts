import { STAGES, type StageId } from "./levels";

export const BEST_KEY = "dino_run_best";
export const COLLECTED_KEY = "dino_run_collected";

export const CHARACTERS = [
  { id: "stego", img: "/game/zen-stego.jpg", name: "Zen Stego" },
  { id: "brachio", img: "/game/elder-brachio.jpg", name: "Elder Brachio" },
  { id: "diplo", img: "/game/flow-diplo.jpg", name: "Flow Diplo" },
  { id: "anky", img: "/game/quiet-anky.jpg", name: "Quiet Anky" },
  { id: "trike", img: "/game/trike-volt.jpg", name: "Trike Volt" },
] as const;

export type CharId = (typeof CHARACTERS)[number]["id"];
export type Collected = Partial<Record<CharId, boolean>>;

export const LANE_X = [-1.45, 0, 1.45] as const;
export const SPAWN_Z = -32;
export const JUMP_V = 7.05;
export const GRAVITY = 17.5;
export const MAX_LIVES = 3;
export const ROCK_CLEAR_Y = 0.78;
export const TUNNEL_HIT_Y = 0.42;

export type RunObj =
  | { id: number; type: "orb"; lane: number; z: number }
  | { id: number; type: "mushroom"; lane: number; z: number }
  | { id: number; type: "token"; lane: number; z: number; charId: CharId }
  | { id: number; type: "rock"; lane: number; z: number }
  | { id: number; type: "tunnel"; lane: number; z: number }
  | { id: number; type: "bone"; lane: number; z: number; y: number };

export type RunState = {
  active: boolean;
  stage: StageId;
  playerLane: number;
  laneX: number;
  y: number;
  vy: number;
  speed: number;
  distance: number;
  score: number;
  energy: number;
  lives: number;
  invuln: number;
  objects: RunObj[];
  spawnTimer: number;
  nextId: number;
};

export type StepResult = {
  fatal: boolean;
  lostLife: boolean;
  gainedLife: boolean;
  collectedId?: CharId;
};

export function createRunState(stage: StageId = 1): RunState {
  const theme = STAGES[stage];
  return {
    active: false,
    stage,
    playerLane: 1,
    laneX: LANE_X[1] ?? 0,
    y: 0,
    vy: 0,
    speed: theme.speedBase,
    distance: 0,
    score: 0,
    energy: 0,
    lives: 1,
    invuln: 0,
    objects: [],
    spawnTimer: 36,
    nextId: 1,
  };
}

export function resetRun(run: RunState, stage: StageId) {
  const theme = STAGES[stage];
  run.active = true;
  run.stage = stage;
  run.playerLane = 1;
  run.laneX = LANE_X[1] ?? 0;
  run.y = 0;
  run.vy = 0;
  run.speed = theme.speedBase;
  run.distance = 0;
  run.score = 0;
  run.energy = 0;
  run.lives = 1;
  run.invuln = 0;
  run.objects = [];
  run.spawnTimer = 36;
}

export function requestJump(run: RunState) {
  if (!run.active) return;
  if (run.y <= 0.06 && run.vy <= 0.15) {
    run.vy = JUMP_V;
    run.y = 0.02;
  }
}

export function loadCollected(): Collected {
  try {
    const raw = localStorage.getItem(COLLECTED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const next: Collected = {};
    for (const c of CHARACTERS) {
      if (parsed[c.id] === true) next[c.id] = true;
    }
    return next;
  } catch {
    return {};
  }
}

export function loadBest() {
  const n = Number.parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function takeHit(run: RunState): { fatal: boolean; lostLife: boolean } {
  if (run.invuln > 0) return { fatal: false, lostLife: false };
  if (run.lives > 0) {
    run.lives -= 1;
    run.invuln = 1.15;
    if (run.lives <= 0) return { fatal: true, lostLife: true };
    return { fatal: false, lostLife: true };
  }
  return { fatal: true, lostLife: false };
}

export function spawnObject(run: RunState, collected: Collected) {
  const theme = STAGES[run.stage];
  const lane = Math.floor(Math.random() * 3);
  const r = Math.random();
  const id = run.nextId++;
  const h = theme.mushroomChance;

  if (r < h * 0.42) {
    run.objects.push({ id, type: "mushroom", lane, z: SPAWN_Z });
    return;
  }
  if (r < h * 0.82) {
    run.objects.push({ id, type: "rock", lane, z: SPAWN_Z });
    return;
  }
  if (r < h * 1.12) {
    run.objects.push({ id, type: "tunnel", lane, z: SPAWN_Z - 1 });
    return;
  }
  if (r < h * 1.12 + 0.09) {
    run.objects.push({ id, type: "bone", lane, z: SPAWN_Z + 2, y: 4.4 });
    return;
  }
  if (r < h * 1.12 + 0.18) {
    const chars = CHARACTERS.filter((c) => !collected[c.id]);
    if (chars.length > 0 && Math.random() < 0.5) {
      const pick = chars[Math.floor(Math.random() * chars.length)]!;
      run.objects.push({ id, type: "token", charId: pick.id, lane, z: SPAWN_Z + 1.5 });
      return;
    }
  }
  run.objects.push({ id, type: "orb", lane, z: SPAWN_Z });
}

export function stepRun(run: RunState, dt: number, collected: Collected): StepResult {
  const theme = STAGES[run.stage];
  const frames = dt * 60;
  run.distance += run.speed * frames;
  run.speed = theme.speedBase + Math.min(theme.speedRamp, run.distance / 1800);
  run.invuln = Math.max(0, run.invuln - dt);

  run.vy -= GRAVITY * dt;
  run.y += run.vy * dt;
  if (run.y <= 0) {
    run.y = 0;
    run.vy = 0;
  }

  const targetX = LANE_X[run.playerLane] ?? 0;
  run.laneX += (targetX - run.laneX) * Math.min(1, dt * 14);

  run.spawnTimer -= frames;
  if (run.spawnTimer <= 0) {
    spawnObject(run, collected);
    run.spawnTimer = Math.max(theme.spawnMin, theme.spawnMax - Math.floor(run.distance / 400));
  }

  const worldSpeed = run.speed * 3.9;
  let fatal = false;
  let lostLife = false;
  let gainedLife = false;
  let collectedId: CharId | undefined;
  const airborne = run.y > ROCK_CLEAR_Y;

  for (let i = run.objects.length - 1; i >= 0; i--) {
    const o = run.objects[i]!;
    o.z += worldSpeed * dt;
    if (o.type === "bone") {
      o.y = Math.max(0.95, o.y - dt * 1.55);
    }

    const sameLane = o.lane === run.playerLane;
    const near = o.z > -0.58 && o.z < 0.98;
    const tunnelNear = o.z > -1.15 && o.z < 1.25;

    if (o.type === "bone" && sameLane && o.z > -0.7 && o.z < 1.1) {
      const reach = Math.abs(run.y + 0.55 - o.y) < 1.35 || run.y > 0.2;
      if (reach) {
        if (run.lives < MAX_LIVES) run.lives += 1;
        run.energy += 2;
        gainedLife = true;
        run.objects.splice(i, 1);
        continue;
      }
    }

    if (sameLane && near && (o.type === "orb" || o.type === "token")) {
      if (o.type === "orb") {
        run.energy += 1;
        run.objects.splice(i, 1);
        continue;
      }
      collectedId = o.charId;
      run.energy += 5;
      run.objects.splice(i, 1);
      continue;
    }

    if (o.type === "mushroom" && sameLane && near && run.y < 0.55) {
      const hit = takeHit(run);
      lostLife = lostLife || hit.lostLife;
      fatal = fatal || hit.fatal;
      if (hit.lostLife || hit.fatal) run.objects.splice(i, 1);
      if (fatal) break;
      continue;
    }

    if (o.type === "rock" && sameLane && near && !airborne) {
      const hit = takeHit(run);
      lostLife = lostLife || hit.lostLife;
      fatal = fatal || hit.fatal;
      if (hit.lostLife || hit.fatal) run.objects.splice(i, 1);
      if (fatal) break;
      continue;
    }

    if (o.type === "tunnel" && tunnelNear) {
      const inHole = sameLane;
      const headHit = inHole && run.y > TUNNEL_HIT_Y;
      const wallHit = !inHole;
      if (headHit || wallHit) {
        const hit = takeHit(run);
        lostLife = lostLife || hit.lostLife;
        fatal = fatal || hit.fatal;
        if (hit.lostLife || hit.fatal) run.objects.splice(i, 1);
        if (fatal) break;
      }
      continue;
    }

    if (o.z > 9) run.objects.splice(i, 1);
  }

  run.score = Math.floor(run.distance * 0.35) + run.energy * 15 + run.lives * 20;
  return { fatal, lostLife, gainedLife, collectedId };
}
