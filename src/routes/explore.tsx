import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Companion } from "@/components/companion";
import { ConstructionGate } from "@/components/construction-gate";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CHARACTER_BY_ID } from "@/lib/characters";
import { useDinoverse } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import {
  FLOOR_PREVIEW_LINE,
  WORLD_BY_ID,
  isDistrictOpen,
  isDistrictWalkable,
  isWorldId,
  type WorldId,
} from "@/lib/worlds";

const WorldPreview = lazy(() =>
  import("@/game/WorldPreview").then((m) => ({ default: m.WorldPreview })),
);

const Explorer3D = lazy(() =>
  import("@/game/Explorer3D").then((m) => ({ default: m.Explorer3D })),
);

type ExploreSearch = { district?: string };

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): ExploreSearch => ({
    district: typeof search.district === "string" ? search.district : undefined,
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const { district } = Route.useSearch();
  const hydrated = useHydrated();
  const characterId = useDinoverse((s) => (hydrated ? s.characterId : "rex"));
  const character = CHARACTER_BY_ID[characterId];
  const requested: WorldId = isWorldId(district) ? district : "forum";
  const start: WorldId = isDistrictOpen(requested) ? requested : "forum";
  const world = WORLD_BY_ID[start];

  if (!hydrated) {
    return (
      <SiteShell>
        <main className="grid min-h-[calc(100dvh-8rem)] place-items-center px-4">
          <p className="text-sm text-muted">Opening the floor…</p>
        </main>
      </SiteShell>
    );
  }

  if (!isDistrictOpen(requested)) {
    return (
      <SiteShell>
        <main className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
          <ConstructionGate world={WORLD_BY_ID[requested]} />
        </main>
      </SiteShell>
    );
  }

  if (isDistrictWalkable(start)) {
    return (
      <SiteShell>
        <Suspense
          fallback={
            <main className="grid min-h-[calc(100dvh-8rem)] place-items-center px-4">
              <p className="text-sm text-muted">Opening the floor…</p>
            </main>
          }
        >
          <Explorer3D characterId={characterId} startDistrict={start} />
        </Suspense>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <main>
        <div className="border-b border-border bg-surface">
          <Suspense
            fallback={
              <div className="grid h-[min(78dvh,44rem)] min-h-[22rem] place-items-center">
                <p className="text-sm text-muted">Loading the 3D preview…</p>
              </div>
            }
          >
            <WorldPreview district={world.id} variant="stage" />
          </Suspense>
        </div>
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:py-10">
          <div className="flex flex-wrap gap-2">
            <Badge className="border-accent/40 text-accent">Under construction</Badge>
            <Badge>3D preview</Badge>
            <Badge>{world.district}</Badge>
          </div>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            {world.name} — look only
          </h1>
          <p className="max-w-2xl text-muted">
            HQ is live as a 3D preview. Drag to orbit the plaza, lobby, and tape. First-person walking
            is locked until construction is done. Dino Mart, the Mall, and the Arena stay plates for now.
          </p>
          <Companion line={FLOOR_PREVIEW_LINE[character.id]} />
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link to="/worlds" search={{ district: "forum" }}>
                City plates
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
