import { createFileRoute, Link } from "@tanstack/react-router";
import { MushroomRun } from "@/components/mushroom-run";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/play")({ component: PlayPage });

function PlayPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl min-w-0 px-4 py-4 sm:py-6">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-xl font-medium tracking-tight sm:text-3xl">
            Rex Volt — Mushroom Run
          </h1>
          <p className="max-w-md text-sm text-muted">
            No token purchase is required. Kit unlocks after the first crash.
          </p>
        </div>
        <MushroomRun />
        <p className="mt-4 text-sm text-muted">
          High scores stay on this device. Sign in to post on the{" "}
          <Link to="/leaderboard" className="text-gold hover:underline">
            Floor Board
          </Link>
          .
        </p>
      </main>
    </SiteShell>
  );
}
