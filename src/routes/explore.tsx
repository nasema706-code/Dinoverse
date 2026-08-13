import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Explorer3D } from "@/game/Explorer3D";
import { SiteShell } from "@/components/site-shell";
import { useDinoverse } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { isWorldId, type WorldId } from "@/lib/worlds";

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
  const characterId = useDinoverse((s) => s.characterId);
  const start: WorldId = isWorldId(district) ? district : "forum";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!hydrated || !ready) {
    return (
      <SiteShell>
        <main className="grid min-h-[calc(100dvh-8rem)] place-items-center px-4">
          <p className="text-sm text-muted">Opening the floor…</p>
        </main>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <Explorer3D characterId={characterId} startDistrict={start} />
    </SiteShell>
  );
}
