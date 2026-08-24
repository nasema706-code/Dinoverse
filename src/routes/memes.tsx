import { createFileRoute, Link } from "@tanstack/react-router";
import { MemeMaker } from "@/components/meme-maker";
import { SiteShell } from "@/components/site-shell";
import { isMemeView, type MemeView } from "@/lib/memes";
import { cn } from "@/lib/utils";

const TABS: { view: MemeView; label: string }[] = [
  { view: "generator", label: "Generator" },
  { view: "trending", label: "Trending" },
  { view: "wall", label: "Meme Wall" },
  { view: "mine", label: "My Creations" },
];

export const Route = createFileRoute("/memes")({
  validateSearch: (search: Record<string, unknown>): { view?: MemeView } => ({
    view: isMemeView(typeof search.view === "string" ? search.view : "")
      ? (search.view as MemeView)
      : undefined,
  }),
  component: MemesPage,
});

function MemesPage() {
  const search = Route.useSearch();
  const view: MemeView = search.view ?? "generator";

  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl min-w-0 px-4 py-8 sm:py-12">
        <nav className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1.5">
          {TABS.map((tab) => (
            <Link
              key={tab.view}
              to="/memes"
              search={tab.view === "generator" ? {} : { view: tab.view }}
              className={cn(
                "min-h-11 min-w-0 flex-1 rounded-md px-3 py-2 text-center text-sm font-medium",
                view === tab.view ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          <MemeMaker view={view} />
        </div>
      </main>
    </SiteShell>
  );
}
