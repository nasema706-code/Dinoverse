import { createFileRoute } from "@tanstack/react-router";
import { MushroomRun } from "@/components/mushroom-run";
import { SiteShell } from "@/components/site-shell";
import { TOKEN } from "@/lib/token";

export const Route = createFileRoute("/play")({ component: PlayPage });

function PlayPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl min-w-0 px-4 py-8 sm:py-12">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Play</p>
        <h1 className="mt-3 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-5xl">
          Rex Volt — Mushroom Run
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Tap left or right (or A/D) to switch lanes. Jump with Space, W, swipe up, or the Jump
          button — rocks need it. Run through the mint tunnel opening and stay low. Catch
          parachute bones for extra lives. Mint orbs are energy. Red caps still hurt. Each level
          has its own music and speed. High score and collected characters stay on this device.
          Then buy {TOKEN.ticker}.
        </p>
        <div className="mt-8">
          <MushroomRun />
        </div>
      </main>
    </SiteShell>
  );
}
