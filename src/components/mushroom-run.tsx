import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { ChevronsUp, Copy, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TOKEN } from "@/lib/token";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { useQuality } from "@/game/quality";
import { RunScene } from "@/game/mushroom-run/run-scene";
import {
  MUTE_KEY,
  STAGE_KEY,
  STAGES,
  loadMuted,
  loadStage,
  type StageId,
} from "@/game/mushroom-run/levels";
import {
  BEST_KEY,
  CHARACTERS,
  COLLECTED_KEY,
  createRunState,
  loadBest,
  loadCollected,
  resetRun,
  requestJump,
  type CharId,
  type Collected,
} from "@/game/mushroom-run/run-state";

type Screen = "start" | "play" | "over";

function TokenRow({ collected }: { collected: Collected }) {
  return (
    <div className="my-3 flex flex-wrap justify-center gap-2">
      {CHARACTERS.map((c) => (
        <img
          key={c.id}
          src={c.img}
          alt={c.name}
          title={c.name}
          className={cn(
            "size-[42px] rounded-full border-2 object-cover object-top",
            collected[c.id]
              ? "border-accent opacity-100 shadow-[0_0_14px_rgba(62,207,142,0.45)]"
              : "border-border opacity-35",
          )}
        />
      ))}
    </div>
  );
}

export function MushroomRun() {
  const hydrated = useHydrated();
  const { settings } = useQuality();
  const wrapRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(createRunState(1));
  const collectedRef = useRef<Collected>({});
  const bestRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("start");
  const [stage, setStage] = useState<StageId>(1);
  const [muted, setMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(1);
  const [best, setBest] = useState(0);
  const [collected, setCollected] = useState<Collected>({});
  const [newBest, setNewBest] = useState(false);
  const [finalLine, setFinalLine] = useState("Score: 0");

  const theme = STAGES[stage];

  useEffect(() => {
    if (!hydrated) return;
    const saved = loadCollected();
    const savedBest = loadBest();
    const savedStage = loadStage();
    collectedRef.current = saved;
    bestRef.current = savedBest;
    setCollected(saved);
    setBest(savedBest);
    setStage(savedStage);
    setMuted(loadMuted());
    setReady(true);
  }, [hydrated]);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.42;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || typeof window === "undefined") return;
    const next = new URL(theme.music, window.location.href).href;
    if (audio.src !== next) {
      audio.src = theme.music;
    }
    audio.playbackRate = theme.playbackRate;
  }, [theme.music, theme.playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (screen === "play" && !muted) {
      void audio.play().catch(() => {});
    } else {
      audio.pause();
      if (screen !== "play") audio.currentTime = 0;
    }
  }, [screen, muted, theme.music]);

  const pickStage = (next: StageId) => {
    setStage(next);
    localStorage.setItem(STAGE_KEY, String(next));
  };

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      return next;
    });
  };

  const onHud = useCallback((nextScore: number, nextEnergy: number, nextLives: number) => {
    setScore(nextScore);
    setEnergy(nextEnergy);
    setLives(nextLives);
  }, []);

  const onUnlock = useCallback((id: CharId) => {
    collectedRef.current = { ...collectedRef.current, [id]: true };
    localStorage.setItem(COLLECTED_KEY, JSON.stringify(collectedRef.current));
    setCollected({ ...collectedRef.current });
  }, []);

  const onCrash = useCallback(() => {
    const run = runRef.current;
    if (!run.active) return;
    run.active = false;
    const isNew = run.score > bestRef.current;
    if (isNew) {
      bestRef.current = run.score;
      localStorage.setItem(BEST_KEY, String(run.score));
      setBest(run.score);
    }
    setNewBest(isNew);
    setScore(run.score);
    setEnergy(run.energy);
    setLives(run.lives);
    setFinalLine(`Score: ${run.score}  •  Energy: ${run.energy}`);
    setCollected({ ...collectedRef.current });
    setScreen("over");
  }, []);

  const startGame = () => {
    resetRun(runRef.current, stage);
    setScore(0);
    setEnergy(0);
    setLives(1);
    setNewBest(false);
    setScreen("play");
  };

  const jump = () => {
    requestJump(runRef.current);
  };

  const shiftLane = (dir: -1 | 1) => {
    if (!runRef.current.active) return;
    runRef.current.playerLane = Math.max(0, Math.min(2, runRef.current.playerLane + dir));
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ptr = { x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      if (!runRef.current.active) return;
      if ((e.target as HTMLElement | null)?.closest("button")) return;
      ptr.x = e.clientX;
      ptr.y = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!runRef.current.active) return;
      if ((e.target as HTMLElement | null)?.closest("button")) return;
      const dy = e.clientY - ptr.y;
      if (dy < -42) {
        jump();
        return;
      }
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      shiftLane(x < rect.width / 2 ? -1 : 1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!runRef.current.active) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        shiftLane(-1);
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        shiftLane(1);
      }
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        jump();
      }
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setMuted((prev) => {
          const next = !prev;
          localStorage.setItem(MUTE_KEY, next ? "1" : "0");
          return next;
        });
      }
    };
    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKey, { passive: false });
    return () => {
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [ready]);

  const copyCa = () => {
    void navigator.clipboard.writeText(TOKEN.ca);
    toast("Contract copied");
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-[440px]">
      <div
        ref={wrapRef}
        className={cn(
          "relative h-[min(78dvh,780px)] min-h-[28rem] overflow-hidden rounded-xl border border-border shadow-[0_0_50px_rgba(62,207,142,0.16)] touch-none",
          theme.wrap,
        )}
      >
        {ready ? (
          <Canvas
            className="absolute inset-0 touch-none"
            shadows={false}
            camera={{ fov: 48, position: [0, 1.72, 4.15], near: 0.1, far: 70 }}
            dpr={settings.dpr}
            performance={{ min: 0.7 }}
            gl={{
              antialias: settings.antialias,
              powerPreference: "high-performance",
              stencil: false,
              alpha: false,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: stage === 1 ? 1.28 : 1.12,
            }}
          >
            <RunScene
              run={runRef}
              collected={collectedRef}
              playing={screen === "play"}
              stage={stage}
              onHud={onHud}
              onCrash={onCrash}
              onUnlock={onUnlock}
            />
          </Canvas>
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted">Loading the floor…</div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
          <div className={cn("rounded-[14px] border px-3 py-2 backdrop-blur-sm", theme.hud)}>
            <p className="text-[10px] tracking-wide text-muted uppercase">Score</p>
            <p className="font-display text-[22px] leading-none font-medium text-accent tabular-nums">
              {score}
            </p>
            <p className="mt-0.5 text-[11px] text-subtle">
              Best <span className="text-accent">{best}</span>
            </p>
            <p className="mt-1 text-[11px] tracking-wide text-accent">
              {"🦴".repeat(Math.max(0, lives))}
              <span className="ml-1 text-subtle">{lives} {lives === 1 ? "life" : "lives"}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={cn("rounded-[14px] border px-3 py-2 text-right backdrop-blur-sm", theme.hud)}>
              <p className="text-[10px] tracking-wide text-muted uppercase">Energy</p>
              <p className="font-display text-[22px] leading-none font-medium text-accent tabular-nums">
                {energy}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleMute}
              className={cn(
                "pointer-events-auto grid size-10 place-items-center rounded-full border text-accent backdrop-blur-sm",
                theme.hud,
              )}
              aria-label={muted ? "Unmute music" : "Mute music"}
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </div>
        </div>

        {screen === "play" ? (
          <>
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                jump();
              }}
              className={cn(
                "pointer-events-auto absolute bottom-10 left-1/2 z-10 flex h-14 w-28 -translate-x-1/2 items-center justify-center gap-1 rounded-full border text-sm font-medium text-accent backdrop-blur-sm",
                theme.hud,
              )}
            >
              <ChevronsUp className="size-5" />
              Jump
            </button>
            <p className="pointer-events-none absolute bottom-3 left-0 right-0 z-10 text-center text-[11px] tracking-wide text-white/80 uppercase">
              {theme.name}
            </p>
          </>
        ) : null}

        {screen !== "play" ? (
          <div
            className={cn(
              "absolute inset-0 z-20 flex flex-col items-center justify-center px-5 py-5 text-center backdrop-blur-[1px]",
              theme.overlay,
            )}
          >
            {screen === "start" ? (
              <>
                <h2 className="font-display text-[24px] font-medium tracking-tight text-accent">
                  REX VOLT
                </h2>
                <p className="mt-1 mb-2 text-sm leading-relaxed text-muted">
                  Mushroom Run
                  <br />
                  Pick a track · Jump rocks · Grab parachute bones
                </p>
                <div className="mb-2 grid w-full max-w-[280px] grid-cols-3 gap-1.5">
                  {([1, 2, 3] as const).map((id) => {
                    const s = STAGES[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => pickStage(id)}
                        className={cn(
                          "rounded-lg border px-1.5 py-2 text-center transition-colors",
                          stage === id
                            ? "border-accent bg-accent/15 text-accent"
                            : "border-white/15 bg-black/25 text-subtle hover:border-white/30",
                        )}
                      >
                        <p className="text-[10px] tracking-wide uppercase">Lv {id}</p>
                        <p className="font-display text-[12px] leading-tight font-medium">{s.name}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="mb-1 max-w-[280px] text-[11px] text-subtle">{theme.tagline}</p>
                <TokenRow collected={collected} />
                <Button size="lg" className="mt-1 w-full max-w-[260px]" disabled={!ready} onClick={startGame}>
                  {ready ? `Start ${theme.name}` : "Loading…"}
                </Button>
                <p className="mt-3 text-xs text-subtle">
                  Tap left / right for lanes. Swipe up, Jump, Space, or W to jump. M mutes.
                </p>
                <p className="mt-3 max-w-[280px] text-[11px] break-all text-subtle">
                  {TOKEN.ticker}
                  <br />
                  {TOKEN.ca}
                </p>
                <div className="mt-2 flex w-full max-w-[260px] flex-col gap-2">
                  <Button type="button" variant="secondary" onClick={copyCa}>
                    <Copy className="size-3.5" />
                    Copy CA
                  </Button>
                  <Button asChild variant="secondary">
                    <a href={TOKEN.buy} target="_blank" rel="noreferrer">
                      Buy {TOKEN.ticker}
                      <ExternalLink />
                    </a>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-[26px] font-medium tracking-tight text-accent">
                  RUN OVER
                </h2>
                <p className="mt-1.5 text-sm text-muted">{finalLine}</p>
                <p className="mt-1 text-xs text-subtle">{theme.name}</p>
                <TokenRow collected={collected} />
                {newBest ? <p className="mb-2 text-sm text-accent">New personal best!</p> : null}
                <div className="mb-3 grid w-full max-w-[280px] grid-cols-3 gap-1.5">
                  {([1, 2, 3] as const).map((id) => {
                    const s = STAGES[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => pickStage(id)}
                        className={cn(
                          "rounded-lg border px-1.5 py-2 text-center transition-colors",
                          stage === id
                            ? "border-accent bg-accent/15 text-accent"
                            : "border-white/15 bg-black/25 text-subtle hover:border-white/30",
                        )}
                      >
                        <p className="text-[10px] tracking-wide uppercase">Lv {id}</p>
                        <p className="font-display text-[12px] leading-tight font-medium">{s.name}</p>
                      </button>
                    );
                  })}
                </div>
                <Button size="lg" className="w-full max-w-[260px]" onClick={startGame}>
                  Run {theme.name}
                </Button>
                <Button asChild variant="secondary" className="mt-2 w-full max-w-[260px]">
                  <a href={TOKEN.buy} target="_blank" rel="noreferrer">
                    Buy {TOKEN.ticker}
                    <ExternalLink />
                  </a>
                </Button>
                <Button type="button" variant="ghost" className="mt-1 w-full max-w-[260px]" onClick={copyCa}>
                  <Copy className="size-3.5" />
                  Copy CA
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
