import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { CharacterId } from "@/lib/characters";
import { CHARACTER_BY_ID } from "@/lib/characters";
import { COLLECT_LINES, INSPECT_COPY, NPC_LINES, WORLD_BY_ID, type WorldId } from "@/lib/worlds";
import { useDinoverse } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { GAME_MAPS, dist, rectsOverlap, type GameMap, type Rect } from "./maps";

type Dir = "down" | "left" | "right" | "up";
const DIRS: Dir[] = ["down", "left", "right", "up"];

type Prompt = { kind: "npc" | "inspect" | "portal"; id: string; label: string } | null;

type Hud = {
  district: string;
  prompt: Prompt;
  line: string;
  shake: number;
};

declare global {
  interface Window {
    __controlsTest?: {
      getX: () => number;
      getY: () => number;
      getSpeed: () => number;
      getTick?: () => number;
      getKeys?: () => string[];
      getCam?: () => Record<string, number>;
      setKeys: (codes: string[]) => void;
    };
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function playTone(ctx: AudioContext, freq: number, dur = 0.12, gain = 0.05) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

export function ExplorerCanvas({
  characterId,
  startDistrict,
}: {
  characterId: CharacterId;
  startDistrict: WorldId;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; body: string } | null>(null);
  const [hud, setHud] = useState<Hud>({
    district: WORLD_BY_ID[startDistrict].name,
    prompt: null,
    line: WORLD_BY_ID[startDistrict].enterLine[characterId],
    shake: 0,
  });
  const [complete, setComplete] = useState(false);
  const collectShard = useDinoverse((s) => s.collectShard);
  const visitWorld = useDinoverse((s) => s.visitWorld);
  const completeQuest = useDinoverse((s) => s.completeQuest);
  const collected = useDinoverse((s) => s.collected);
  const visited = useDinoverse((s) => s.visited);
  const questDone = useDinoverse((s) => s.questDone);
  const character = CHARACTER_BY_ID[characterId];

  const interactRef = useRef<() => void>(() => {});
  const joystickRef = useRef({ active: false, dx: 0, dy: 0, id: -1 });

  useEffect(() => {
    visitWorld(startDistrict);
  }, [startDistrict, visitWorld]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let killed = false;
    let raf = 0;
    const keys = new Set<string>();
    const injected = new Set<string>();
    let audio: AudioContext | null = null;

    const player = {
      x: GAME_MAPS[startDistrict].spawn.x,
      y: GAME_MAPS[startDistrict].spawn.y,
      vx: 0,
      vy: 0,
      dir: "down" as Dir,
      frame: 0,
      dist: 0,
      speed: 0,
    };
    let mapId: WorldId = startDistrict;
    let fade = 0;
    let fadeDir = 0;
    let pending: { to: WorldId; x: number; y: number } | null = null;
    let camX = player.x;
    let camY = player.y;
    let shake = 0;
    let lineTimer = 4;
    let currentLine = WORLD_BY_ID[startDistrict].enterLine[characterId];
    let collectIndex = 0;
    const taken = new Set(useDinoverse.getState().collected);
    const particles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    let prompt: Prompt = null;
    let lastHud = "";

    const images: {
      maps: Partial<Record<WorldId, HTMLImageElement>>;
      walk: HTMLImageElement | null;
      shard: HTMLImageElement | null;
    } = { maps: {}, walk: null, shard: null };

    const ensureAudio = () => {
      if (!audio) audio = new AudioContext();
      if (audio.state === "suspended") void audio.resume();
      return audio;
    };

    const pushLine = (text: string, seconds = 4) => {
      currentLine = text;
      lineTimer = seconds;
    };

    const interact = () => {
      if (!prompt) return;
      const ctx = ensureAudio();
      playTone(ctx, 420, 0.08, 0.04);
      if (prompt.kind === "npc") {
        const npc = NPC_LINES[prompt.id];
        if (npc) setDialog({ title: npc.name, body: npc.body[characterId] });
      } else if (prompt.kind === "inspect") {
        const copy = INSPECT_COPY[prompt.id];
        if (copy) setDialog({ title: copy.title, body: copy.body[characterId] });
      } else if (prompt.kind === "portal") {
        const portal = GAME_MAPS[mapId].portals.find((p) => p.to === prompt?.id);
        if (portal) {
          pending = { to: portal.to, x: portal.spawn.x, y: portal.spawn.y };
          fadeDir = 1;
        }
      }
    };
    interactRef.current = interact;

    const body: Rect = { x: 0, y: 0, w: 28, h: 16 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.type === "keydown") {
        keys.add(e.code);
        if (e.code === "KeyE" || e.code === "Space") {
          e.preventDefault();
          interact();
        }
      } else {
        keys.delete(e.code);
      }
    };
    const onBlur = () => keys.clear();

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", resize);
    resize();

    window.__controlsTest = {
      getX: () => player.x,
      getY: () => player.y,
      getSpeed: () => player.speed,
      setKeys: (codes) => {
        injected.clear();
        for (const c of codes) injected.add(c);
      },
    };

    const boot = async () => {
      try {
        const [walk, shard, ...maps] = await Promise.all([
          loadImage(character.walkSheet).catch(() => null),
          loadImage("/game/shard.png").catch(() => null),
          ... (Object.keys(GAME_MAPS) as WorldId[]).map((id) =>
            loadImage(GAME_MAPS[id].src).then((img) => [id, img] as const),
          ),
        ]);
        if (killed) return;
        images.walk = walk;
        images.shard = shard;
        for (const entry of maps) {
          if (entry) images.maps[entry[0]] = entry[1];
        }
        setReady(true);
        loop(performance.now());
      } catch {
        setReady(true);
        loop(performance.now());
      }
    };

    let last = performance.now();
    const loop = (now: number) => {
      if (killed) return;
      raf = requestAnimationFrame(loop);
      let dt = (now - last) / 1000;
      last = now;
      dt = Math.min(dt, 0.1);
      if (!startedRef.current || dialogRef.current) return;
      step(dt);
      draw();
    };

    const startedRef = { current: false };
    const dialogRef = { current: false };
    const startedWatch = setInterval(() => {
      startedRef.current = startedFlag.current;
      dialogRef.current = dialogFlag.current;
    }, 50);
    const startedFlag = { current: false };
    const dialogFlag = { current: false };
    const syncFlags = setInterval(() => {
      startedFlag.current = canvas.dataset.started === "1";
      dialogFlag.current = canvas.dataset.dialog === "1";
    }, 40);

    const step = (dt: number) => {
      const map = GAME_MAPS[mapId];
      let mx = 0;
      let my = 0;
      const held = (code: string) => keys.has(code) || injected.has(code);
      if (held("KeyA") || held("ArrowLeft")) mx -= 1;
      if (held("KeyD") || held("ArrowRight")) mx += 1;
      if (held("KeyW") || held("ArrowUp")) my -= 1;
      if (held("KeyS") || held("ArrowDown")) my += 1;
      const joy = joystickRef.current;
      if (joy.active) {
        mx += joy.dx;
        my += joy.dy;
      }
      const len = Math.hypot(mx, my);
      if (len > 1) {
        mx /= len;
        my /= len;
      }
      const speed = 210;
      let nx = player.x + mx * speed * dt;
      let ny = player.y + my * speed * dt;
      const nextX = { x: nx - body.w / 2, y: player.y - body.h / 2, w: body.w, h: body.h };
      const nextY = { x: player.x - body.w / 2, y: ny - body.h / 2, w: body.w, h: body.h };
      if (!insideWalk(nextX, map.walk)) nx = player.x;
      if (!insideWalk(nextY, map.walk)) ny = player.y;
      player.x = nx;
      player.y = ny;
      player.vx = mx;
      player.vy = my;
      player.speed = Math.hypot(mx, my) * speed;
      if (Math.abs(mx) > 0.2 || Math.abs(my) > 0.2) {
        if (Math.abs(mx) > Math.abs(my)) player.dir = mx < 0 ? "left" : "right";
        else player.dir = my < 0 ? "up" : "down";
        player.dist += player.speed * dt;
        player.frame = Math.floor(player.dist / 18) % 4;
      } else {
        player.frame = 0;
      }

      if (fadeDir !== 0) {
        fade += fadeDir * dt * 3.2;
        if (fade >= 1 && pending) {
          mapId = pending.to;
          player.x = pending.x;
          player.y = pending.y;
          visitWorld(pending.to);
          pushLine(WORLD_BY_ID[pending.to].enterLine[characterId], 4.5);
          pending = null;
          fadeDir = -1;
        }
        if (fade <= 0) {
          fade = 0;
          fadeDir = 0;
        }
      }

      shake = Math.max(0, shake - dt * 8);
      lineTimer = Math.max(0, lineTimer - dt);

      prompt = null;
      for (const npc of map.npcs) {
        if (dist(player.x, player.y, npc.x, npc.y) < 56) {
          prompt = { kind: "npc", id: npc.id, label: NPC_LINES[npc.id]?.name ?? "Talk" };
        }
      }
      for (const item of map.inspectables) {
        if (dist(player.x, player.y, item.x + item.w / 2, item.y + item.h / 2) < 64) {
          prompt = { kind: "inspect", id: item.id, label: INSPECT_COPY[item.id]?.title ?? "Look" };
        }
      }
      for (const portal of map.portals) {
        const pb = { x: player.x - 14, y: player.y - 8, w: 28, h: 16 };
        if (rectsOverlap(pb, portal)) {
          prompt = { kind: "portal", id: portal.to, label: `Enter ${portal.label}` };
        }
      }

      for (const shard of map.shards) {
        if (taken.has(shard.id)) continue;
        if (dist(player.x, player.y, shard.x, shard.y) < 36) {
          taken.add(shard.id);
          collectShard(shard.id);
          const lines = COLLECT_LINES[characterId];
          pushLine(lines[collectIndex % lines.length], 3);
          collectIndex += 1;
          shake = 1;
          const ctx = audio;
          if (ctx) {
            playTone(ctx, 660, 0.1, 0.06);
            playTone(ctx, 880, 0.14, 0.04);
          }
          for (let i = 0; i < 10; i++) {
            const a = (Math.PI * 2 * i) / 10;
            particles.push({
              x: shard.x,
              y: shard.y,
              vx: Math.cos(a) * 80,
              vy: Math.sin(a) * 80,
              life: 0.45,
            });
          }
        }
      }

      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].life <= 0) particles.splice(i, 1);
      }

      const state = useDinoverse.getState();
      if (!state.questDone && state.collected.length >= 8 && state.visited.length >= 4) {
        completeQuest();
        setComplete(true);
        pushLine("The bag is full. The city noticed.", 6);
      }

      camX += (player.x - camX) * (1 - Math.exp(-7 * dt));
      camY += (player.y - camY) * (1 - Math.exp(-7 * dt));

      const nextHud = JSON.stringify({
        d: mapId,
        p: prompt,
        l: lineTimer > 0 ? currentLine : "",
        s: shake,
      });
      if (nextHud !== lastHud) {
        lastHud = nextHud;
        setHud({
          district: WORLD_BY_ID[mapId].name,
          prompt,
          line: lineTimer > 0 ? currentLine : "",
          shake,
        });
      }
    };

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vw = canvas.width / dpr;
      const vh = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, vw, vh);

      const map = GAME_MAPS[mapId];
      const sx = shake > 0 ? (Math.random() - 0.5) * 8 * shake : 0;
      const sy = shake > 0 ? (Math.random() - 0.5) * 8 * shake : 0;
      const viewL = clamp(camX - vw / 2, 0, map.width - vw);
      const viewT = clamp(camY - vh / 2, 0, map.height - vh);

      const mapImg = images.maps[mapId];
      if (mapImg) {
        ctx.drawImage(mapImg, viewL - sx, viewT - sy, vw, vh, 0, 0, vw, vh);
      } else {
        ctx.fillStyle = "#151815";
        ctx.fillRect(0, 0, vw, vh);
      }

      const wx = (x: number) => x - viewL + sx;
      const wy = (y: number) => y - viewT + sy;

      for (const portal of map.portals) {
        ctx.save();
        ctx.globalAlpha = 0.35 + Math.sin(performance.now() / 400) * 0.1;
        ctx.fillStyle = "#3ecf8e";
        ctx.fillRect(wx(portal.x), wy(portal.y), portal.w, portal.h);
        ctx.restore();
      }

      for (const item of map.inspectables) {
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = "#ece8df";
        ctx.fillRect(wx(item.x), wy(item.y), item.w, item.h);
        ctx.restore();
      }

      for (const npc of map.npcs) {
        ctx.save();
        ctx.fillStyle = "#1c211c";
        ctx.beginPath();
        ctx.ellipse(wx(npc.x), wy(npc.y) + 10, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#8d9388";
        ctx.beginPath();
        ctx.arc(wx(npc.x), wy(npc.y) - 10, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ece8df";
        ctx.font = "600 11px Figtree, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(NPC_LINES[npc.id]?.name ?? "NPC", wx(npc.x), wy(npc.y) - 30);
        ctx.restore();
      }

      const t = performance.now() / 1000;
      for (const shard of map.shards) {
        if (taken.has(shard.id)) continue;
        const bob = Math.sin(t * 3 + shard.x) * 6;
        if (images.shard) {
          ctx.drawImage(images.shard, wx(shard.x) - 16, wy(shard.y) - 18 + bob, 32, 28);
        } else {
          ctx.fillStyle = "#3ecf8e";
          ctx.beginPath();
          ctx.moveTo(wx(shard.x), wy(shard.y) - 12 + bob);
          ctx.lineTo(wx(shard.x) + 10, wy(shard.y) + 8 + bob);
          ctx.lineTo(wx(shard.x) - 10, wy(shard.y) + 8 + bob);
          ctx.fill();
        }
      }

      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life * 2);
        ctx.fillStyle = "#3ecf8e";
        ctx.fillRect(wx(p.x), wy(p.y), 3, 3);
        ctx.globalAlpha = 1;
      }

      const pw = 56;
      const ph = 78;
      if (images.walk) {
        const row = DIRS.indexOf(player.dir);
        const col = player.frame;
        const sw = images.walk.width / 4;
        const sh = images.walk.height / 4;
        ctx.drawImage(
          images.walk,
          col * sw,
          row * sh,
          sw,
          sh,
          wx(player.x) - pw / 2,
          wy(player.y) - ph + 10,
          pw,
          ph,
        );
      } else {
        ctx.fillStyle = "#3ecf8e";
        ctx.beginPath();
        ctx.arc(wx(player.x), wy(player.y) - 20, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      if (fade > 0) {
        ctx.fillStyle = `rgba(11,13,11,${fade})`;
        ctx.fillRect(0, 0, vw, vh);
      }
    };

    void boot();

    return () => {
      killed = true;
      cancelAnimationFrame(raf);
      clearInterval(startedWatch);
      clearInterval(syncFlags);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", resize);
      delete window.__controlsTest;
    };
  }, [character.walkSheet, characterId, collectShard, completeQuest, startDistrict, visitWorld]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.dataset.started = started ? "1" : "0";
    canvas.dataset.dialog = dialog ? "1" : "0";
  }, [started, dialog]);

  const onStickStart = (e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    joystickRef.current.active = true;
    joystickRef.current.id = e.pointerId;
    moveStick(e);
  };
  const moveStick = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = (e.clientX - cx) / (rect.width / 2);
    let dy = (e.clientY - cy) / (rect.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    if (len < 0.2) {
      dx = 0;
      dy = 0;
    }
    joystickRef.current.dx = dx;
    joystickRef.current.dy = dy;
  };
  const onStickEnd = () => {
    joystickRef.current.active = false;
    joystickRef.current.dx = 0;
    joystickRef.current.dy = 0;
  };

  const shards = collected.length;
  const districts = visited.length;

  return (
    <div className="relative isolate min-h-[calc(100dvh-4rem)] bg-bg">
      <div ref={wrapRef} className="absolute inset-0 overflow-hidden touch-none">
        <canvas ref={canvasRef} className="block size-full" />
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="pointer-events-auto rounded-lg border border-border bg-bg/80 px-3 py-2 backdrop-blur-sm">
              <p className="text-xs tracking-wide text-muted uppercase">{hud.district}</p>
              <p className="font-display text-sm tabular-nums">
                {shards}/8 shards · {districts}/4 districts
              </p>
            </div>
            <div className="pointer-events-auto hidden rounded-lg border border-border bg-bg/80 px-3 py-2 text-xs text-muted sm:block">
              WASD move · E interact
            </div>
          </div>
          {hud.line ? (
            <div className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-border bg-bg/85 p-3 backdrop-blur-sm">
              <img
                src={character.portrait}
                alt=""
                className="size-10 rounded-md object-cover object-top"
              />
              <p className="text-sm leading-relaxed">{hud.line}</p>
            </div>
          ) : null}
        </div>

        <div className="hidden justify-end sm:flex">
          {hud.prompt ? (
            <Button
              type="button"
              className="pointer-events-auto"
              onClick={() => interactRef.current()}
            >
              {hud.prompt.label}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="absolute bottom-24 left-4 sm:hidden">
        <div
          className="relative size-28 rounded-full border border-border bg-bg/50 touch-none"
          onPointerDown={onStickStart}
          onPointerMove={moveStick}
          onPointerUp={onStickEnd}
          onPointerCancel={onStickEnd}
        >
          <div className="pointer-events-none absolute inset-8 rounded-full bg-surface-2" />
        </div>
      </div>
      <button
        type="button"
        className="absolute right-4 bottom-24 grid size-16 place-items-center rounded-full border border-border bg-accent text-accent-fg font-display text-sm sm:hidden"
        onClick={() => interactRef.current()}
      >
        E
      </button>

      {!started ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-bg/80 p-6">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
            <p className="text-xs tracking-wide text-muted uppercase">{character.name}</p>
            <h1 className="mt-2 font-display text-2xl font-medium">Walk the Dinoverse</h1>
            <p className="mt-3 text-sm text-muted">
              Collect eight $DINOVERSE shards and visit every district. Move with WASD or the stick.
              Press E or the action button to talk, look, and take gates.
            </p>
            <Button className="mt-6 w-full" disabled={!ready} onClick={() => setStarted(true)}>
              {ready ? "Enter" : "Loading the floor…"}
            </Button>
          </div>
        </div>
      ) : null}

      {dialog ? (
        <div className="absolute inset-0 z-20 grid place-items-end bg-bg/40 p-4 sm:place-items-center">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-5">
            <p className="text-xs tracking-wide text-muted uppercase">{dialog.title}</p>
            <p className="mt-2 text-sm leading-relaxed">{dialog.body}</p>
            <Button className="mt-4" onClick={() => setDialog(null)}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {complete || questDone ? (
        <div className="absolute inset-x-0 top-20 z-10 mx-auto w-[min(100%-1.5rem,28rem)] rounded-xl border border-accent/40 bg-surface p-4">
          <p className="font-display text-lg">Bag secured</p>
          <p className="mt-1 text-sm text-muted">
            You walked the four districts as {character.name}. The Floor is still open. The other districts are still pouring.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function insideWalk(box: Rect, walk: Rect) {
  return (
    box.x >= walk.x &&
    box.y >= walk.y &&
    box.x + box.w <= walk.x + walk.w &&
    box.y + box.h <= walk.y + walk.h
  );
}
