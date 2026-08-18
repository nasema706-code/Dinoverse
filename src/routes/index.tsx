import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CharacterGrid } from "@/components/character-grid";
import { LaunchHero } from "@/components/launch-hero";
import { RexDossier } from "@/components/rex-dossier";
import { SiteShell } from "@/components/site-shell";
import { TokenSection } from "@/components/token-section";
import { Button } from "@/components/ui/button";
import { TOKEN } from "@/lib/token";
import { useDinoverse } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { WORLDS, isDistrictOpen } from "@/lib/worlds";
import { useQuality } from "@/game/quality";

const WorldPreview = lazy(() =>
  import("@/game/WorldPreview").then((m) => ({ default: m.WorldPreview })),
);

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hydrated = useHydrated();
  const characterId = useDinoverse((s) => (hydrated ? s.characterId : "rex"));
  const setCharacter = useDinoverse((s) => s.setCharacter);

  return (
    <SiteShell>
      <main>
        <LaunchHero />

        <div id="about" className="h-0 scroll-mt-20" />
        <RexDossier />

        <TokenSection />

        <section className="border-t border-border px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">The city</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="max-w-xl min-w-0 font-display text-3xl font-medium tracking-tight sm:text-4xl">
                Four floors. One listing. The Floor is a live preview.
              </h2>
              <p className="max-w-md text-sm text-muted">
                Look at HQ in 3D. Walking, Dino Mart, the Mall, and the Arena are still under
                construction.
              </p>
            </div>

            <HomeFloorPreview />

            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {WORLDS.map((w) => {
                const open = isDistrictOpen(w.id);
                return (
                  <li key={w.id}>
                    <Link
                      to="/worlds"
                      search={{ district: w.id }}
                      className="group block overflow-hidden rounded-xl border border-border bg-surface"
                    >
                      <div className="relative">
                        <img
                          src={w.cinematic}
                          alt={w.summary}
                          className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        {!open ? <div className="absolute inset-0 bg-bg/55" /> : null}
                        <span
                          className={
                            open
                              ? "absolute top-3 left-3 rounded-full border border-border bg-bg/80 px-2.5 py-1 text-[10px] font-medium tracking-wide text-fg uppercase"
                              : "absolute top-3 left-3 rounded-full border border-accent/40 bg-bg/80 px-2.5 py-1 text-[10px] font-medium tracking-wide text-accent uppercase"
                          }
                        >
                          {open ? "3D preview" : "Under construction"}
                        </span>
                      </div>
                      <div className="rex-seam" />
                      <div className="p-4">
                        <p className="text-xs text-muted">{w.district}</p>
                        <p className="mt-1 font-display text-xl font-medium">{w.name}</p>
                        <p className="mt-2 text-sm text-muted">
                          {open
                            ? "Live 3D look. Walking is locked until HQ construction is done."
                            : "The plates are live. The 3D walk is still pouring."}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="max-sm:w-full">
                <Link to="/explore">
                  Preview the floor
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="max-sm:w-full">
                <Link to="/play">Play Mushroom Run</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="max-sm:w-full">
                <Link to="/worlds">See all districts</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">The floor</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="max-w-xl min-w-0 font-display text-3xl font-medium tracking-tight sm:text-4xl">
                Rex holds the tape. The crew keeps him honest.
              </h2>
              <p className="max-w-md text-sm text-muted">
                Rex holds the tape by default, or switch guides. The city stays. The voice
                changes. Walking the floor opens when construction is done.
              </p>
            </div>
            <div className="mt-8">
              <CharacterGrid selected={characterId} onSelect={setCharacter} />
            </div>
          </div>
        </section>

        <section className="border-t border-border px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Play</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="max-w-xl min-w-0 font-display text-3xl font-medium tracking-tight sm:text-4xl">
                Rex Volt — Mushroom Run
              </h2>
              <p className="max-w-md text-sm text-muted">
                A three-lane run on this site. Catch energy, collect the herd, dodge mushrooms.
                High score saves while you keep {TOKEN.ticker} in the tape.
              </p>
            </div>
            <div className="mt-8 overflow-hidden rounded-xl border border-border bg-black sm:grid sm:grid-cols-[16rem_1fr]">
              <img
                src="/game/mushroom.jpg"
                alt="Glowing prehistoric mushroom field"
                className="h-56 w-full object-cover object-center sm:h-full"
              />
              <div className="flex flex-col justify-between gap-4 bg-surface p-5 sm:p-6">
                <div>
                  <p className="font-display text-2xl font-medium tracking-tight">Mushroom Run</p>
                  <p className="mt-2 text-sm text-muted">
                    Three tracks with music. Jump rocks, thread tunnels, catch parachute bones for
                    extra lives. Unlock Zen Stego, Elder Brachio, Flow Diplo, Quiet Anky, and Trike
                    Volt.
                  </p>
                </div>
                <Button asChild size="lg" className="max-sm:w-full sm:self-start">
                  <Link to="/play">
                    Play now
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-4 py-16">
          <div className="mx-auto flex max-w-6xl min-w-0 flex-col items-start justify-between gap-6 rounded-xl border border-accent/30 bg-surface p-4 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="text-xs tracking-[0.18em] text-accent uppercase">Live on Solana</p>
              <h2 className="mt-2 font-display text-2xl font-medium">The CA is posted</h2>
              <p className="mt-2 max-w-xl font-mono text-xs break-all text-muted sm:text-sm">
                {TOKEN.ca}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="lg">
                <Link to="/" hash="buy">
                  How to buy
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

function HomeFloorPreview() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [show3d, setShow3d] = useState(false);
  const { settings } = useQuality();
  useEffect(() => {
    if (!settings.preview3d) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setShow3d(true);
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [settings.preview3d]);
  const floor = WORLDS[0];
  return (
    <div ref={wrapRef} className="mt-8 overflow-hidden rounded-xl border border-border bg-surface">
      {show3d && settings.preview3d ? (
        <Suspense
          fallback={
            <img src={floor.cinematic} alt={floor.summary} className="aspect-video w-full object-cover" />
          }
        >
          <WorldPreview district="forum" />
        </Suspense>
      ) : (
        <img src={floor.cinematic} alt={floor.summary} className="aspect-video w-full object-cover" />
      )}
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="min-w-0 text-sm leading-relaxed text-muted">
          The Floor at dusk — drag to orbit. Walking is still under construction.
        </p>
        <Button asChild size="sm" className="max-sm:w-full">
          <Link to="/explore">
            Open 3D preview
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
