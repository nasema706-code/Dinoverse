import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CharacterGrid } from "@/components/character-grid";
import { JurassicSection } from "@/components/jurassic-section";
import { LaunchHero } from "@/components/launch-hero";
import { MarketTape } from "@/components/market-tape";
import { RexDossier } from "@/components/rex-dossier";
import { SiteShell } from "@/components/site-shell";
import { TokenFaq, TokenSection } from "@/components/token-section";
import { TransparencySection } from "@/components/transparency-section";
import { Button } from "@/components/ui/button";
import { TOKEN } from "@/lib/token";
import { useDinoverse } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { WORLDS } from "@/lib/worlds";
import { useQuality } from "@/game/quality";
import { cn } from "@/lib/utils";

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

        <section className="border-t border-border px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-[0.18em] text-gold uppercase">Experience</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Walk it. Run it. Stamp it.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-muted">
              Walk the Floor while we pour the rest of the city. Play and memes are live — no token
              purchase required.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ExperienceTile
                to="/visions"
                kicker="Visions · live 3D"
                title="Four worlds"
                body="Skull megacity, crystal racetrack, night jungle, bone coliseum. Orbit, fly, or press 1–4."
                image="/visions/fossil-megacity.jpg"
                imageAlt="A T-Rex skull mountain split into a vertical city at dusk"
                cta="Open the visions"
                primary
              />
              <ExperienceTile
                to="/canyon"
                kicker="World · live 3D"
                title="Skull Gate Canyon"
                body="A bone bridge crosses the dusk path. The Bone Spire closes the far mouth. Orbit, or press Fly."
                image="/hero.jpg"
                imageAlt="Skull Gate Canyon"
                cta="Enter the canyon"
              />
              <ExperienceTile
                to="/explore"
                kicker="The Floor · still building"
                title="Walk HQ"
                body="Walk as yourself or pick Rex, Vex, Tria, or Ptera. The rest of the city is still being built — expect scaffold."
                image={WORLDS[0].cinematic}
                imageAlt={WORLDS[0].summary}
                cta="Walk The Floor"
                preview
              />
              <ExperienceTile
                to="/play"
                kicker="Play"
                title="Mushroom Run"
                body="Guide Rex across Dawn Grove, Volt Dusk and Night Tape."
                image="/game/mushroom.jpg"
                imageAlt="Glowing prehistoric mushroom field"
                cta="Play now"
              />
              <ExperienceTile
                to="/memes"
                kicker="Memes"
                title="Stamp the city"
                body="Fourteen plates, one-tap captions, Impact / Tape / Quiet looks."
                image="/life/corporate.jpg"
                imageAlt="Rex Volt crossing the Floor"
                cta="Open the maker"
              />
            </div>
          </div>
        </section>

        <div id="about" className="h-0 scroll-mt-20" />
        <section className="border-t border-border bg-lore">
          <RexDossier />
          <div className="mx-auto max-w-6xl px-4 pb-16 sm:pb-24">
            <p className="text-xs font-medium tracking-[0.18em] text-gold uppercase">The crew</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="max-w-xl min-w-0 font-display text-3xl font-medium tracking-tight sm:text-4xl">
                Rex holds the tape. The crew keeps him honest.
              </h2>
              <p className="max-w-md text-sm text-muted">
                Rex holds the tape by default, or switch guides. On the Floor you can also walk as
                yourself. The city stays. The voice changes.
              </p>
            </div>
            <div className="mt-8">
              <CharacterGrid selected={characterId} onSelect={setCharacter} />
            </div>
          </div>
        </section>

        <FactsSubnav />
        <TokenSection />
        <MarketTape />
        <TransparencySection teaser />
        <JurassicSection teaser />
        <TokenFaq />

        <section className="border-t border-border px-4 py-16">
          <div className="mx-auto flex max-w-6xl min-w-0 flex-col items-start justify-between gap-6 rounded-xl border border-gold/30 bg-lore p-4 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="text-xs tracking-[0.18em] text-gold uppercase">The city is building</p>
              <h2 className="mt-2 font-display text-2xl font-medium">Welcome to the DinoVerse.</h2>
              <p className="mt-2 max-w-xl text-sm text-muted">
                Humans are only beginning to bring dinosaur history on-chain. The dinosaurs have been
                waiting for them to catch up.
              </p>
              <p className="mt-3 max-w-xl font-mono text-xs break-all text-muted sm:text-sm">{TOKEN.ca}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="lg">
                <Link to="/explore">Explore the DinoVerse</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/play">Play now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

function FactsSubnav() {
  const hydrated = useHydrated();
  const hash = useRouterState({
    select: (s) => (hydrated ? s.location.hash.replace(/^#/, "") : ""),
  });
  const items = [
    { hash: "token", label: "Facts" },
    { hash: "market", label: "Chart" },
    { to: "/transparency" as const, label: "Locks" },
    { hash: "faq", label: "FAQ" },
  ];

  return (
    <nav
      aria-label="Token facts"
      className="sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-30 border-y border-border bg-bg/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto overscroll-x-contain px-4 py-2 [-webkit-overflow-scrolling:touch]">
        {items.map((item) => {
          const active =
            "to" in item
              ? false
              : item.hash === "token"
                ? hash === "token" || hash === "buy"
                : hash === item.hash;
          const className = cn(
            "inline-flex h-10 shrink-0 items-center rounded-md px-3 text-sm font-medium",
            active ? "bg-lore text-fg shadow-[inset_0_-2px_0_0_var(--color-gold)]" : "text-muted hover:text-fg",
          );
          if ("to" in item && item.to) {
            return (
              <Link key={item.label} to={item.to} className={className}>
                {item.label}
              </Link>
            );
          }
          return (
            <Link key={item.label} to="/" hash={item.hash} className={className}>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function ExperienceTile({
  to,
  kicker,
  title,
  body,
  image,
  imageAlt,
  cta,
  primary = false,
  preview = false,
}: {
  to: "/explore" | "/play" | "/memes" | "/canyon" | "/visions";
  kicker: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  cta: string;
  primary?: boolean;
  preview?: boolean;
}) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface">
      {preview ? (
        <HomeFloorPreview />
      ) : (
        <img src={image} alt={imageAlt} className="aspect-[16/10] w-full object-cover" />
      )}
      <div className="rex-seam" />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[10px] tracking-[0.18em] text-gold uppercase">{kicker}</p>
        <p className="mt-1 font-display text-xl font-medium">{title}</p>
        <p className="mt-2 flex-1 text-sm text-muted">{body}</p>
        <Button asChild size="sm" variant={primary ? "default" : "outline"} className="mt-4 self-start">
          <Link to={to}>
            {cta}
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function HomeFloorPreview() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [show3d, setShow3d] = useState(false);
  const { settings } = useQuality();
  useEffect(() => {
    if (!settings.preview3d) return;
    if (window.matchMedia("(max-width: 900px)").matches) return;
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
    <div ref={wrapRef} className="aspect-[16/10] overflow-hidden bg-black">
      {show3d && settings.preview3d ? (
        <Suspense
          fallback={<img src={floor.cinematic} alt={floor.summary} className="aspect-[16/10] w-full object-cover" />}
        >
          <WorldPreview district="forum" className="!aspect-auto h-full min-h-[12rem]" />
        </Suspense>
      ) : (
        <img src={floor.cinematic} alt={floor.summary} className="aspect-[16/10] w-full object-cover" />
      )}
    </div>
  );
}
