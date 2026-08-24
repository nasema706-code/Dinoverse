import { createFileRoute, Link } from "@tanstack/react-router";
import { MushroomRun } from "@/components/mushroom-run";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/play")({ component: PlayPage });

const LEGEND = [
  { k: "Play as", v: "Rex Volt — drag the 3D model 360°" },
  { k: "Lanes", v: "A / D or tap left / right" },
  { k: "Jump", v: "Space, W, swipe up — rocks" },
  { k: "Tunnel", v: "Mint hole. Stay low." },
  { k: "Crash", v: "Red caps. Grazes count." },
  { k: "Energy", v: "Orbs bank into the vault" },
] as const;

function PlayPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl min-w-0 px-4 py-8 sm:py-12">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Play</p>
        <h1 className="mt-3 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-5xl">
          Rex Volt — Mushroom Run
        </h1>
        <p className="mt-4 max-w-2xl text-fg/90">
          Rex Volt runs the tape. Drag the 3D model through a full 360°, then put him on the floor.
          Bank energy when you crash. Spend it in the shop to kit Rex. The ticker lives elsewhere on
          the site.
        </p>
        <dl className="mt-6 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3">
          {LEGEND.map((row) => (
            <div key={row.k} className="rounded-lg border border-border bg-surface px-3 py-2.5">
              <dt className="text-[10px] font-medium tracking-[0.16em] text-accent uppercase">{row.k}</dt>
              <dd className="mt-1 text-sm text-fg">{row.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted">
          High scores stay on this device. Sign in to post on the{" "}
          <Link to="/leaderboard" className="text-accent hover:underline">
            Floor Board
          </Link>
          .
        </p>
        <div className="mt-8">
          <MushroomRun />
        </div>
      </main>
    </SiteShell>
  );
}
