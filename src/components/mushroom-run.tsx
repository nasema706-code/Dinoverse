import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Link } from "@tanstack/react-router";
import { ChevronsUp, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { submitRunScore } from "@/lib/leaderboard";
import { useQuality } from "@/game/quality";
import { RunScene } from "@/game/mushroom-run/run-scene";
import { armSfx, playSfx, type SfxKind } from "@/game/mushroom-run/sfx";
import { CharacterTurntable } from "@/game/mushroom-run/character-turntable";
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
  MAX_LIVES,
  addVault,
  createRunState,
  loadBest,
  loadCollected,
  loadScout,
  loadVault,
  resetRun,
  requestJump,
  saveRunner,
  saveScout,
  type CharId,
  type Collected,
} from "@/game/mushroom-run/run-state";
import {
  ACCESSORIES,
  DEFAULT_LOADOUT,
  applyEquip,
  buyAccessory,
  isEquipped,
  loadLoadout,
  loadOwnedGear,
  type AccId,
  type Loadout,
} from "@/game/mushroom-run/shop";

const HOW_TO = [
  { key: "A / D", label: "Switch lanes. Tap left or right on the tape." },
  { key: "JUMP", label: "Space, W, swipe up. Rocks clip you if you stay low." },
  { key: "TUNNEL", label: "Mint glow is the hole. Stay low — jump and you eat the lintel." },
  { key: "RED CAP", label: "Crash. A graze still counts." },
  { key: "ORB", label: "Green crystal = energy. Banked at crash. Spend it in the shop." },
  { key: "CHIP", label: "Portrait chip. Flavor on the tape — Rex stays on the run." },
  { key: "BONE", label: "Parachute catch = extra life. Max three." },
] as const;

type Screen = "start" | "play" | "over";

function CharacterSelect({ loadout }: { loadout: Loadout }) {
  return (
    <div className="mt-4 rounded-xl border border-white/15 bg-black/45 p-3 text-left">
      <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">Play as</p>
      <p className="mt-1 text-[13px] leading-snug text-white/85">
        Rex Volt only. Drag for a full 360°. Equipped kit shows here and on the tape.
      </p>
      <div
        className="relative mt-3 h-[230px] cursor-grab touch-none overflow-hidden rounded-lg border border-white/12 bg-black pointer-events-auto active:cursor-grabbing"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <CharacterTurntable loadout={loadout} />
        <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[11px] tracking-[0.16em] text-white/75 uppercase">
          Drag to rotate · 360°
        </p>
      </div>
      <p className="mt-2.5 font-display text-lg leading-none text-white">Rex Volt</p>
      <p className="mt-1 text-[12px] text-white/65">Floor Chief</p>
      <p className="mt-2 text-[12px] font-medium text-accent">On the tape.</p>
    </div>
  );
}

function EnergyShop({
  vault,
  banked,
  owned,
  loadout,
  onBuyGear,
  onEquip,
}: {
  vault: number;
  banked: number | null;
  owned: AccId[];
  loadout: Loadout;
  onBuyGear: (id: AccId) => void;
  onEquip: (id: AccId) => void;
}) {
  return (
    <div className="mt-3 rounded-xl border border-white/15 bg-black/45 p-3 text-left">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">Energy shop</p>
        <p className="font-mono text-[12px] text-white/80">{vault} vault</p>
      </div>
      <p className="mt-1 text-[13px] leading-snug text-white/85">
        {banked && banked > 0 ? `This run banked +${banked}. ` : null}
        Spend banked energy on Rex's kit. Nothing here touches the ticker.
      </p>
      <ul className="mt-2 space-y-1.5">
        {ACCESSORIES.map((item) => {
          const has = owned.includes(item.id);
          const on = has && isEquipped(loadout, item.id);
          const canBuy = !has && vault >= item.cost;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => (has ? onEquip(item.id) : onBuyGear(item.id))}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left",
                  on ? "border-accent/50 bg-accent/10" : "border-white/10 bg-black/20",
                  !has && !canBuy ? "opacity-70" : null,
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-white">{item.name}</span>
                  <span className="block text-[11px] text-white/60">{item.blurb}</span>
                </span>
                <span className={cn("shrink-0 font-mono text-[12px]", on ? "text-accent" : "text-white")}>
                  {has ? (on ? "ON" : "EQUIP") : `${item.cost} E`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StagePicker({
  stage,
  onPick,
}: {
  stage: StageId;
  onPick: (id: StageId) => void;
}) {
  return (
    <div className="grid w-full grid-cols-3 gap-1.5">
      {([1, 2, 3] as const).map((id) => {
        const s = STAGES[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className={cn(
              "rounded-lg border px-1.5 py-2 text-center transition-colors",
              stage === id
                ? "border-accent bg-accent/20 text-accent"
                : "border-white/20 bg-white/5 text-white/75 hover:border-white/40 hover:text-white",
            )}
          >
            <p className="text-[10px] tracking-[0.14em] uppercase">Lv {id}</p>
            <p className="font-display text-[12px] leading-tight font-medium">{s.name}</p>
          </button>
        );
      })}
    </div>
  );
}

export function MushroomRun() {
  const hydrated = useHydrated();
  const { settings } = useQuality();
  const { user } = useCurrentUserState();
  const wrapRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(createRunState(1));
  const collectedRef = useRef<Collected>({});
  const bestRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userRef = useRef(user);
  userRef.current = user;

  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("start");
  const [stage, setStage] = useState<StageId>(1);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [lives, setLives] = useState(1);
  const [best, setBest] = useState(0);
  const [vault, setVault] = useState(0);
  const [ownedGear, setOwnedGear] = useState<AccId[]>([]);
  const [loadout, setLoadout] = useState<Loadout>(DEFAULT_LOADOUT);
  const [banked, setBanked] = useState<number | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [finalLine, setFinalLine] = useState("Score: 0");
  const [boardNote, setBoardNote] = useState<string | null>(null);

  const theme = STAGES[stage];

  useEffect(() => {
    if (!hydrated) return;
    const saved = loadCollected();
    const savedBest = loadBest();
    const savedStage = loadStage();
    collectedRef.current = saved;
    bestRef.current = savedBest;
    setVault(loadVault());
    setOwnedGear(loadOwnedGear());
    setLoadout(loadLoadout());
    saveRunner("rex");
    setBest(savedBest);
    setStage(savedStage);
    setMuted(loadMuted());
    setReady(true);
  }, [hydrated]);

  useEffect(() => {
    if (!authEnabled || !user || !ready) return;
    const localBest = loadBest();
    if (localBest <= 0) return;
    void submitRunScore({ data: { score: localBest, stage: loadStage() } }).catch(() => {});
  }, [user?.id, ready]);

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
      if (!next) armSfx();
      return next;
    });
  };

  const onHud = useCallback((nextScore: number, nextEnergy: number, nextLives: number) => {
    setScore(nextScore);
    setEnergy(nextEnergy);
    setLives(nextLives);
  }, []);

  const onScout = useCallback((id: CharId) => {
    if (collectedRef.current[id]) return;
    const already = loadScout() === id;
    saveScout(id);
    if (already) return;
    const char = CHARACTERS.find((c) => c.id === id);
    toast(char ? `${char.name} on the tape. Rex still runs.` : "Chip collected.");
  }, []);

  const buyNextGear = (id: AccId) => {
    const result = buyAccessory(vault, ownedGear, id);
    if (!result.ok) {
      if (result.reason === "energy") {
        const cost = ACCESSORIES.find((a) => a.id === id)?.cost ?? 0;
        toast(`Need ${Math.max(0, cost - vault)} more energy.`);
      }
      return;
    }
    setOwnedGear(result.owned);
    setVault(result.vault);
    setLoadout(result.loadout);
    playSfx("token", mutedRef.current);
    toast(`${ACCESSORIES.find((a) => a.id === id)?.name ?? "Kit"} equipped.`);
  };

  const equipGear = (id: AccId) => {
    setLoadout(applyEquip(loadout, id));
  };

  const onSfx = useCallback((kinds: SfxKind[]) => {
    for (const kind of kinds) playSfx(kind, mutedRef.current);
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
    const nextVault = addVault(run.energy);
    setVault(nextVault);
    setBanked(run.energy);
    setFinalLine(`Score: ${run.score}  •  Energy banked: +${run.energy}`);
    setScreen("over");
    setBoardNote(null);
    const snapshot = { score: run.score, stage: run.stage };
    if (!authEnabled || !userRef.current) {
      setBoardNote("Sign in to post this run on the Floor Board.");
      return;
    }
    void submitRunScore({ data: snapshot })
      .then((res) => {
        setBoardNote(
          res.improved
            ? `Posted — rank ${res.rank} with ${res.best}.`
            : `On the board — best ${res.best}, rank ${res.rank}.`,
        );
      })
      .catch(() => {
        setBoardNote("Could not reach the Floor Board.");
      });
  }, []);

  const startGame = () => {
    saveRunner("rex");
    armSfx();
    resetRun(runRef.current, stage);
    setScore(0);
    setEnergy(0);
    setLives(1);
    setNewBest(false);
    setBoardNote(null);
    setBanked(null);
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
          if (!next) armSfx();
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

  return (
    <div className="mx-auto w-full min-w-0 max-w-[520px]">
      <div
        ref={wrapRef}
        className={cn(
          "relative h-[min(82dvh,820px)] min-h-[32rem] overflow-hidden rounded-xl border border-white/12 shadow-[0_0_60px_rgba(62,207,142,0.14)] touch-none",
          theme.wrap,
        )}
      >
        {ready ? (
          <Canvas
            className="absolute inset-0 touch-none"
            shadows={false}
            camera={{ fov: 50, position: [0, 2.22, 5.35], near: 0.1, far: 96 }}
            dpr={settings.dpr}
            performance={{ min: 0.7 }}
            gl={{
              antialias: settings.antialias,
              powerPreference: "high-performance",
              stencil: false,
              alpha: false,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: stage === 1 ? 1.22 : 1.1,
            }}
          >
            <RunScene
              run={runRef}
              collected={collectedRef}
              playing={screen === "play"}
              stage={stage}
              onHud={onHud}
              onCrash={onCrash}
              onScout={onScout}
              onSfx={onSfx}
              loadout={loadout}
              runnerId="rex"
            />
          </Canvas>
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted">Loading the floor…</div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
          <div className={cn("rounded-[14px] border px-3 py-2 backdrop-blur-sm", theme.hud)}>
            <p className="text-[10px] tracking-[0.16em] text-white/60 uppercase">Score</p>
            <p className="font-display text-[22px] leading-none font-medium text-accent tabular-nums">
              {score}
            </p>
            <p className="mt-0.5 text-[11px] text-white/70">
              Best <span className="text-accent">{best}</span>
            </p>
            <p className="mt-1.5 text-[10px] tracking-[0.16em] text-white/55 uppercase">Lives</p>
            <div className="mt-1 flex gap-1">
              {Array.from({ length: MAX_LIVES }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-4 rounded-full",
                    i < lives ? "bg-accent shadow-[0_0_8px_rgba(62,207,142,0.7)]" : "bg-white/18",
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={cn("rounded-[14px] border px-3 py-2 text-right backdrop-blur-sm", theme.hud)}>
              <p className="text-[10px] tracking-[0.16em] text-white/60 uppercase">Energy</p>
              <p className="font-display text-[22px] leading-none font-medium text-accent tabular-nums">
                {energy}
              </p>
              <p className="mt-1 text-[10px] tracking-[0.16em] text-white/55 uppercase">Vault</p>
              <p className="font-display text-[15px] leading-none text-white tabular-nums">{vault}</p>
            </div>
            <button
              type="button"
              onClick={toggleMute}
              className={cn(
                "pointer-events-auto grid size-10 place-items-center rounded-full border text-accent backdrop-blur-sm",
                theme.hud,
              )}
              aria-label={muted ? "Unmute" : "Mute"}
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
            <p className="pointer-events-none absolute bottom-3 left-0 right-0 z-10 text-center text-[11px] tracking-[0.18em] text-white/85 uppercase">
              Rex Volt · {theme.name}
            </p>
          </>
        ) : null}

        {screen !== "play" ? (
          <div className="absolute inset-0 z-20 overflow-y-auto bg-black/86">
            <div className="mx-auto flex min-h-full max-w-[400px] flex-col justify-start px-5 py-6">
              {screen === "start" ? (
                <>
                  <p className="text-[11px] font-medium tracking-[0.22em] text-accent uppercase">
                    Floor tape
                  </p>
                  <h2 className="mt-1 font-display text-[28px] font-medium tracking-tight text-white">
                    REX VOLT
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    Mushroom Run — bank energy, kit Rex, dodge mushrooms. Rex holds the tape.
                  </p>

                  <CharacterSelect loadout={loadout} />

                  <div className="mt-4 rounded-xl border border-white/15 bg-black/45 p-3">
                    <p className="text-[11px] font-medium tracking-[0.18em] text-white uppercase">
                      How to play
                    </p>
                    <ul className="mt-2 space-y-2">
                      {HOW_TO.map((row) => (
                        <li key={row.key} className="flex gap-2.5 text-left">
                          <span className="mt-px w-[4.75rem] shrink-0 rounded-md bg-accent/15 px-1 py-0.5 text-center font-mono text-[10px] font-semibold tracking-wide text-accent">
                            {row.key}
                          </span>
                          <span className="text-[13px] leading-snug text-white">{row.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-4 text-[11px] font-medium tracking-[0.16em] text-white/55 uppercase">
                    Track
                  </p>
                  <div className="mt-1.5">
                    <StagePicker stage={stage} onPick={pickStage} />
                  </div>
                  <p className="mt-2 text-[12px] leading-snug text-white/75">{theme.tagline}</p>
                  <EnergyShop
                    vault={vault}
                    banked={null}
                    owned={ownedGear}
                    loadout={loadout}
                    onBuyGear={buyNextGear}
                    onEquip={equipGear}
                  />
                  <Button size="lg" className="mt-3 w-full" disabled={!ready} onClick={startGame}>
                    {ready ? "Start as Rex Volt" : "Loading…"}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-medium tracking-[0.22em] text-white/55 uppercase">
                    Off the tape
                  </p>
                  <h2 className="mt-1 font-display text-[28px] font-medium tracking-tight text-white">
                    RUN OVER
                  </h2>
                  <p className="mt-2 font-display text-xl text-accent tabular-nums">{finalLine}</p>
                  <p className="mt-1 text-sm text-white/75">{theme.name}</p>
                  <EnergyShop
                    vault={vault}
                    banked={banked}
                    owned={ownedGear}
                    loadout={loadout}
                    onBuyGear={buyNextGear}
                    onEquip={equipGear}
                  />
                  <CharacterSelect loadout={loadout} />
                  {newBest ? <p className="mt-2 text-sm font-medium text-accent">New personal best.</p> : null}
                  {boardNote ? (
                    <p className="mb-3 text-sm text-white/80">
                      {boardNote}{" "}
                      {authEnabled && !user ? (
                        <Link
                          to="/login"
                          search={{ next: "/play" }}
                          className="pointer-events-auto font-medium text-accent hover:underline"
                        >
                          Sign in
                        </Link>
                      ) : (
                        <Link
                          to="/leaderboard"
                          className="pointer-events-auto font-medium text-accent hover:underline"
                        >
                          Floor Board
                        </Link>
                      )}
                    </p>
                  ) : null}
                  <StagePicker stage={stage} onPick={pickStage} />
                  <Button size="lg" className="mt-3 w-full" onClick={startGame}>
                    Run {theme.name}
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
