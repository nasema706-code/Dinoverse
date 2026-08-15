import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CharacterGrid } from "@/components/character-grid";
import { Companion } from "@/components/companion";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { CHARACTERS, type CharacterId } from "@/lib/characters";
import { useDinoverse } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/crew")({ component: CrewPage });

function CrewPage() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const selected = useDinoverse((s) => (hydrated ? s.characterId : "rex"));
  const setCharacter = useDinoverse((s) => s.setCharacter);
  const pick = (id: CharacterId) => setCharacter(id);
  const current = CHARACTERS.find((c) => c.id === selected);

  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">The floor</p>
        <h1 className="mt-3 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-5xl">
          Rex Volt holds the cuff. The crew can borrow it.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          The site talks as the Floor Chief by default — charcoal three-piece, headset, coffee and a live tablet.
          Switch guides if you want another pair of eyes. The listing stays his. Walking HQ opens when
          construction is done.
        </p>

        <div className="mt-8">
          <CharacterGrid selected={selected} onSelect={pick} />
        </div>

        {current ? (
          <div className="mt-8 space-y-4">
            <Companion line={current.blurb} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate({ to: "/worlds" })}>Walk their districts</Button>
              <Button variant="secondary" onClick={() => navigate({ to: "/explore" })}>
                Preview as {current.name}
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted">Pick a guide to unlock their version of the city.</p>
        )}
      </main>
    </SiteShell>
  );
}
