import { STAGES, type StageId } from "./levels";
import type { SfxKind } from "./sfx";

export const BEST_KEY = "dino_run_best";
export const COLLECTED_KEY = "dino_run_collected";

export const CHARACTERS = [
  { id: "stego", img: "/game/zen-stego.jpg", name: "Zen Stego", cost: 20 },
  { id: "brachio", img: "/game/elder-brachio.jpg", name: "Elder Brachio", cost: 35 },
  { id: "diplo", img: "/game/flow-diplo.jpg", name: "Flow Diplo", cost: 50 },
  { id: "anky", img: "/game/quiet-anky.jpg", name: "Quiet Anky", cost: 70 },
  { id: "trike", img: "/game/trike-volt.jpg", name: "Trike Volt", cost: 95 },
] as const;

export type CharId = (typeof CHARACTERS)[number]["id"];
export type RunCharacter = (typeof CHARACTERS)[number];
export type Collected = Partial<Record<CharId, boolean>>;
export type RunnerId = "rex" | CharId;

export const RUNNER_KEY = "dino_run_runner";
export const ENERGY_VAULT_KEY = "dino_run_energy";
export const SCOUT_KEY = "dino_run_scout";

export const RUNNERS = [
  { id: "rex" as const, name: "Rex Volt", title: "Floor Chief", img: "/game/rex-volt.jpg", cost: 0 },
  { id: "stego" as const, name: "Zen Stego", title: "Grove tank", img: "/game/zen-stego.jpg", cost: 20 },
  { id: "brachio" as const, name: "Elder Brachio", title: "High tape", img: "/game/elder-brachio.jpg", cost: 35 },
  { id: "diplo" as const, name: "Flow Diplo", title: "Long signal", img: "/game/flow-diplo.jpg", cost: 50 },
  { id: "anky" as const, name: "Quiet Anky", title: "Quiet armor", img: "/game/quiet-anky.jpg", cost: 70 },
  { id: "trike" as const, name: "Trike Volt", title: "Horn desk", img: "/game/trike-volt.jpg", cost: 95 },
] as const;

export function isRunnerId(value: string | null | undefined): value is RunnerId {
  return RUNNERS.some((r) => r.id === value);
}

export function runnerUnlocked(id: RunnerId, _collected: Collected) {
  return id === "rex";
}

export function loadRunner(_collected: Collected): RunnerId {
  return "rex";
}

export function saveRunner(_id: RunnerId) {
  localStorage.setItem(RUNNER_KEY, "rex");
}

export const LANE_X = [-1.45, 0, 1.45] as const;
export const SPAWN_Z = -46;
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
  whooshIds: Set<number>;
};

export type StepResult = {
  fatal: boolean;
  lostLife: boolean;
  gainedLife: boolean;
  collectedId?: CharId;
  sfx: SfxKind[];
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
    whooshIds: new Set<number>(),
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
  run.whooshIds.clear();
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

function asVault(raw: string | null) {
  const n = Number.parseInt(raw || "0", 10);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function loadVault() {
  try {
    return asVault(localStorage.getItem(ENERGY_VAULT_KEY));
  } catch {
    return 0;
  }
}

export function saveVault(n: number) {
  const next = Math.max(0, Math.floor(n));
  localStorage.setItem(ENERGY_VAULT_KEY, String(next));
  return next;
}

export function addVault(delta: number) {
  return saveVault(loadVault() + Math.max(0, Math.floor(delta)));
}

export function isCharId(value: string | null | undefined): value is CharId {
  return CHARACTERS.some((c) => c.id === value);
}

export function loadScout(): CharId | null {
  try {
    const raw = localStorage.getItem(SCOUT_KEY);
    return isCharId(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function saveScout(id: CharId) {
  localStorage.setItem(SCOUT_KEY, id);
}

export function nextListing(collected: Collected, scout: CharId | null = null): RunCharacter | null {
  if (scout && !collected[scout]) {
    return CHARACTERS.find((c) => c.id === scout) ?? null;
  }
  return CHARACTERS.find((c) => !collected[c.id]) ?? null;
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
  const sfx: SfxKind[] = [];
  const airborne = run.y > ROCK_CLEAR_Y;

  const ping = (kind: SfxKind) => {
    sfx.push(kind);
  };
  const whoosh = (id: number) => {
    if (run.whooshIds.has(id)) return;
    run.whooshIds.add(id);
    ping("nearMiss");
  };
  const applyHit = (kind: "hitMushroom" | "hitTunnel" | "hitRock") => {
    const hit = takeHit(run);
    lostLife = lostLife || hit.lostLife;
    fatal = fatal || hit.fatal;
    if (hit.lostLife || hit.fatal) {
      ping(kind);
      if (hit.fatal) ping("crash");
    }
    return hit;
  };

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
        ping("life");
        run.objects.splice(i, 1);
        continue;
      }
    }

    if (sameLane && near && (o.type === "orb" || o.type === "token")) {
      if (o.type === "orb") {
        run.energy += 1;
        ping("energy");
        run.objects.splice(i, 1);
        continue;
      }
      collectedId = o.charId;
      run.energy += 5;
      ping("token");
      run.objects.splice(i, 1);
      continue;
    }

    if (o.type === "mushroom" && sameLane && near && run.y < 0.55) {
      const hit = applyHit("hitMushroom");
      if (hit.lostLife || hit.fatal) run.objects.splice(i, 1);
      if (fatal) break;
      continue;
    }
    if (o.type === "mushroom" && near && (run.y >= 0.55 || Math.abs(o.lane - run.playerLane) === 1)) {
      whoosh(o.id);
    }

    if (o.type === "rock" && sameLane && near && !airborne) {
      const hit = applyHit("hitRock");
      if (hit.lostLife || hit.fatal) run.objects.splice(i, 1);
      if (fatal) break;
      continue;
    }
    if (o.type === "rock" && near && (airborne || Math.abs(o.lane - run.playerLane) === 1)) {
      whoosh(o.id);
    }

    if (o.type === "tunnel" && tunnelNear) {
      const inHole = sameLane;
      const headHit = inHole && run.y > TUNNEL_HIT_Y;
      const wallHit = !inHole;
      if (headHit || wallHit) {
        const hit = applyHit("hitTunnel");
        if (hit.lostLife || hit.fatal) run.objects.splice(i, 1);
        if (fatal) break;
      } else {
        whoosh(o.id);
      }
      continue;
    }

    if (o.z > 9) run.objects.splice(i, 1);
  }

  run.score = Math.floor(run.distance * 0.35) + run.energy * 15 + run.lives * 20;
  return { fatal, lostLife, gainedLife, collectedId, sfx };
}
