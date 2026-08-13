import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CharacterGrid } from "@/components/character-grid";
import { CityLife } from "@/components/city-life";
import { Companion } from "@/components/companion";
import { RexDossier } from "@/components/rex-dossier";
import { SiteShell } from "@/components/site-shell";
import { TokenSection } from "@/components/token-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CHARACTER_BY_ID } from "@/lib/characters";
import { useDinoverse } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { WORLDS } from "@/lib/worlds";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hydrated = useHydrated();
  const characterId = useDinoverse((s) => (hydrated ? s.characterId : "rex"));
  const setCharacter = useDinoverse((s) => s.setCharacter);
  const character = CHARACTER_BY_ID[characterId];
  const rex = CHARACTER_BY_ID.rex;

  return (
    <SiteShell>
      <main>
        <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
          <img
            src="/hero.jpg"
            alt="Dinoverse Global Headquarters plaza at dusk, eVTOL on the pad"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-bg/70" />
          <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-end gap-8 px-4 py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center sm:py-16">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>Floor Chief</Badge>
                <Badge>Solana · $DINOVERSE</Badge>
              </div>
              <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium tracking-tight sm:text-6xl">
                The Dinoverse
              </h1>
              <p className="mt-4 max-w-xl text-lg text-fg/90">{character.homeLead}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/explore">
                    Enter as {character.name}
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/worlds">Walk the floor</Link>
                </Button>
              </div>
              <div className="mt-8 max-w-lg">
                <Companion line={`${character.homeKicker}. ${character.tagline}`} />
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <img
                  src={rex.portrait}
                  alt="Rex Volt, Floor Chief of the Dinoverse"
                  className="aspect-portrait w-full object-cover object-top"
                />
                <div className="rex-seam" />
                <div className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-display text-sm font-medium">{rex.name}</p>
                    <p className="text-xs text-muted">Charcoal suit. Bone collar. Circuit seams.</p>
                  </div>
                  <span className="text-xs tracking-wide text-accent uppercase">Listing live</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <RexDossier />
        <CityLife />

        <section className="border-t border-border px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">The floor</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="max-w-xl font-display text-3xl font-medium tracking-tight">
                Rex holds the tape. The crew keeps him honest.
              </h2>
              <p className="max-w-md text-sm text-muted">
                Walk as the Floor Chief by default, or switch guides. The city stays. The voice
                changes.
              </p>
            </div>
            <div className="mt-8">
              <CharacterGrid selected={characterId} onSelect={setCharacter} />
            </div>
          </div>
        </section>

        <section className="border-t border-border px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Districts</p>
            <h2 className="mt-3 max-w-full font-display text-2xl font-medium tracking-tight sm:text-3xl">
              Four floors. One listing.
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {WORLDS.map((w) => (
                <li key={w.id}>
                  <Link
                    to="/worlds"
                    search={{ district: w.id }}
                    className="group block overflow-hidden rounded-xl border border-border bg-surface"
                  >
                    <img
                      src={w.cinematic}
                      alt={w.summary}
                      className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="rex-seam" />
                    <div className="p-4">
                      <p className="text-xs text-muted">{w.district}</p>
                      <p className="mt-1 font-display text-xl font-medium">{w.name}</p>
                      <p className="mt-2 text-sm text-muted">{w.summary}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border px-4 py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="font-display text-2xl font-medium">Walk the city in 3D</h2>
              <p className="mt-2 max-w-xl text-sm text-muted">
                First person. The plates are the rooms. Eight shards, four districts, Rex in your
                ear.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/explore">Open the explorer</Link>
            </Button>
          </div>
        </section>

        <TokenSection />
      </main>
    </SiteShell>
  );
}
