import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Companion } from "@/components/companion";
import { ConstructionGate } from "@/components/construction-gate";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CHARACTER_BY_ID } from "@/lib/characters";
import { useDinoverse } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { WORLDS, FLOOR_PREVIEW_LINE, isDistrictOpen, isDistrictWalkable, isWorldId, type WorldId } from "@/lib/worlds";
import { useQuality } from "@/game/quality";

const WorldPreview = lazy(() =>
  import("@/game/WorldPreview").then((m) => ({ default: m.WorldPreview })),
);

type WorldsSearch = { district?: string };

export const Route = createFileRoute("/worlds")({
  validateSearch: (search: Record<string, unknown>): WorldsSearch => ({
    district: typeof search.district === "string" ? search.district : undefined,
  }),
  component: WorldsPage,
});

function WorldsPage() {
  const { district } = Route.useSearch();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const characterId = useDinoverse((s) => (hydrated ? s.characterId : "rex"));
  const initial = isWorldId(district) ? district : "forum";
  const [tab, setTab] = useState<WorldId>(initial);
  const [mounted, setMounted] = useState(false);
  const character = CHARACTER_BY_ID[characterId];

  useEffect(() => {
    setMounted(true);
  }, []);

  const active = useMemo(() => WORLDS.find((w) => w.id === tab) ?? WORLDS[0], [tab]);
  const beats = character ? active.beats[character.id] : active.beats.rex;
  const { settings } = useQuality();

  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Districts</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-5xl">
          Four districts. One floor still pouring.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          The Floor is a live 3D preview — look, do not walk. Dino Mart, the Mall, and the Arena are
          still pouring. Come back when the rooms exist.
        </p>

        {isDistrictOpen(tab) ? (
          <div className="mt-6">
            <Companion line={isDistrictWalkable(tab) ? active.enterLine[character.id] : FLOOR_PREVIEW_LINE[character.id]} />
          </div>
        ) : null}

        <Tabs
          value={tab}
          onValueChange={(v) => {
            if (!isWorldId(v)) return;
            setTab(v);
            void navigate({ to: "/worlds", search: { district: v }, replace: true });
          }}
          className="mt-8"
        >
          <TabsList>
            {WORLDS.map((w) => (
              <TabsTrigger key={w.id} value={w.id}>
                {w.name}
                {!isDistrictOpen(w.id) ? (
                  <span className="ml-2 text-[10px] tracking-wide text-subtle uppercase">Soon</span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>

          {WORLDS.map((w) => (
            <TabsContent key={w.id} value={w.id}>
              {!isDistrictOpen(w.id) ? (
                <ConstructionGate world={w} />
              ) : (
                <article className="overflow-hidden rounded-xl border border-border bg-surface">
                  {mounted && tab === w.id && settings.preview3d ? (
                    <Suspense
                      fallback={
                        <img src={w.cinematic} alt={w.summary} className="aspect-video w-full object-cover" />
                      }
                    >
                      <WorldPreview district={w.id} />
                    </Suspense>
                  ) : (
                    <img src={w.cinematic} alt={w.summary} className="aspect-video w-full object-cover" />
                  )}
                  <div className="space-y-5 p-5 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{w.district}</Badge>
                      <Badge>3D preview</Badge>
                      <Badge>With {character.name}</Badge>
                    </div>
                    <h2 className="font-display text-2xl font-medium">{w.name}</h2>
                    <p className="text-muted">{w.summary}</p>
                    {!isDistrictWalkable(w.id) ? (
                      <p className="text-sm text-accent">
                        Walking is locked. Orbit the 3D preview until HQ construction is done.
                      </p>
                    ) : null}
                    {w.stills.length > 0 ? (
                      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {w.stills.map((still) => (
                          <li key={still.src} className="overflow-hidden rounded-lg border border-border">
                            <img src={still.src} alt={still.alt} className="aspect-video w-full object-cover" />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <ol className="space-y-4">
                      {beats.map((beat, i) => (
                        <li key={beat.title} className="grid gap-1 sm:grid-cols-[4rem_1fr]">
                          <span className="font-mono text-xs text-subtle tabular-nums">0{i + 1}</span>
                          <div>
                            <p className="font-medium">{beat.title}</p>
                            <p className="mt-1 text-sm text-muted">{beat.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    {isDistrictWalkable(w.id) ? (
                      <Button asChild>
                        <Link to="/explore" search={{ district: w.id }}>
                          Enter {w.name} in 3D
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="secondary">
                        <Link to="/explore" search={{ district: w.id }}>
                          Open 3D preview
                        </Link>
                      </Button>
                    )}
                  </div>
                </article>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </SiteShell>
  );
}
