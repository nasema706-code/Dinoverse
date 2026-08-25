import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOKEN } from "@/lib/token";

export function TransparencySection({ teaser = false }: { teaser?: boolean }) {
  if (teaser) {
    return (
      <section className="border-t border-border px-4 py-12 sm:py-16">
        <div id="transparency" className="h-0 scroll-mt-20" />
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Locks</p>
            <h2 className="mt-2 font-display text-2xl font-medium tracking-tight sm:text-3xl">
              Streamflow, liquidity, supply history.
            </h2>
            <p className="mt-3 text-sm text-muted">
              {TOKEN.lockAmount} {TOKEN.ticker} in a Streamflow lock — about {TOKEN.lockShare} of
              current supply. The full dossier lives on its own page.
            </p>
          </div>
          <Button asChild variant="outline" size="lg" className="max-sm:w-full sm:shrink-0">
            <Link to="/transparency">Open transparency</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-border px-4 py-16 sm:py-24">
      <div id="transparency" className="h-0 scroll-mt-20" />
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Transparency</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Locks, liquidity, and what the supply used to say.
        </h2>

        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          <li className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs tracking-[0.18em] text-muted uppercase">Developer-origin allocation</p>
            <p className="mt-3 font-display text-2xl font-medium tabular-nums">{TOKEN.lockAmount}</p>
            <p className="mt-1 text-sm text-muted">
              {TOKEN.ticker} — about {TOKEN.lockShare} of current supply — in a non-cancellable,
              non-transferable Streamflow lock.
            </p>
            <p className="mt-3 text-sm text-fg">
              Fully claimable by the developer wallet on <span className="font-medium">{TOKEN.lockUnlock}</span>.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <a href={TOKEN.streamflow} target="_blank" rel="noreferrer">
                Verify Streamflow lock
                <ExternalLink />
              </a>
            </Button>
          </li>
          <li className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs tracking-[0.18em] text-muted uppercase">Liquidity</p>
            <p className="mt-3 font-display text-2xl font-medium">{TOKEN.dex}</p>
            <p className="mt-3 text-sm text-muted">
              The primary {TOKEN.ticker}/SOL market operates on PumpSwap. Liquidity was reported as 100%
              locked at the latest independent security check.
            </p>
            <Button asChild variant="tape" size="sm" className="mt-4">
              <a href={TOKEN.dexscreener} target="_blank" rel="noreferrer">
                View live DexScreener data
                <ExternalLink />
              </a>
            </Button>
          </li>
          <li className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs tracking-[0.18em] text-muted uppercase">Supply history</p>
            <p className="mt-3 font-display text-2xl font-medium tabular-nums">{TOKEN.supply}</p>
            <p className="mt-3 text-sm text-muted">
              This site previously displayed an initial figure of {TOKEN.supplyWas}. The current verified
              on-chain supply is {TOKEN.supply}.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <a href={TOKEN.solscan} target="_blank" rel="noreferrer">
                Verify on Solscan
                <ExternalLink />
              </a>
            </Button>
          </li>
        </ul>
      </div>
    </section>
  );
}
