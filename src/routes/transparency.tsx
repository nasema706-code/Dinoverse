import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { ALLOCATION_POLICY, TOKEN, TREASURY_WALLETS } from "@/lib/token";

export const Route = createFileRoute("/transparency")({ component: TransparencyPage });

function TransparencyPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl min-w-0 px-4 py-8 sm:py-16">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Transparency</p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-medium tracking-tight sm:text-5xl">
          Supply, locks, wallets and allocation.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          {TOKEN.ticker} is a speculative memecoin. This page lists what can be checked on-chain today
          and what has not been published yet. It is not a prospectus and it is not financial advice.
        </p>

        <section className="mt-12">
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">On-chain supply</p>
          <h2 className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl">
            What the mint currently shows
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs tracking-[0.18em] text-muted uppercase">Verified supply</p>
              <p className="mt-3 font-display text-2xl font-medium tabular-nums">{TOKEN.supply}</p>
              <p className="mt-2 text-sm text-muted">
                Previously shown as {TOKEN.supplyWas}. Confirm the live figure on Solscan.
              </p>
            </article>
            <article className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs tracking-[0.18em] text-muted uppercase">Mint & freeze</p>
              <p className="mt-3 font-display text-2xl font-medium">Revoked</p>
              <p className="mt-2 text-sm text-muted">
                Mint authority revoked. Freeze authority revoked. Decimals: {TOKEN.decimals}.
              </p>
            </article>
          </div>
          <Button asChild variant="secondary" size="sm" className="mt-4">
            <a href={TOKEN.solscan} target="_blank" rel="noreferrer">
              Verify on Solscan
              <ExternalLink />
            </a>
          </Button>
        </section>

        <section className="mt-14">
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Streamflow lock</p>
          <h2 className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl">
            Developer-origin allocation
          </h2>
          <article className="mt-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
            <p className="font-display text-3xl font-medium tabular-nums">{TOKEN.lockAmount}</p>
            <p className="mt-2 text-sm text-muted">
              About {TOKEN.lockShare} of current supply. The lock is described as non-cancellable and
              non-transferable. Tokens become fully claimable by the developer wallet on{" "}
              <span className="text-fg">{TOKEN.lockUnlock}</span>.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <a href={TOKEN.streamflow} target="_blank" rel="noreferrer">
                  Open Streamflow dashboard
                  <ExternalLink />
                </a>
              </Button>
              <Button asChild variant="tape">
                <a href={TOKEN.dexscreener} target="_blank" rel="noreferrer">
                  View live chart
                  <ExternalLink />
                </a>
              </Button>
            </div>
          </article>
        </section>

        <section className="mt-14">
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Treasury wallets</p>
          <h2 className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl">
            Labelled addresses
          </h2>
          {TREASURY_WALLETS.length ? (
            <ul className="mt-6 grid gap-4">
              {TREASURY_WALLETS.map((wallet) => (
                <li key={wallet.address} className="rounded-xl border border-border bg-surface p-5">
                  <p className="text-xs tracking-[0.18em] text-muted uppercase">{wallet.label}</p>
                  <code className="mt-3 block font-mono text-xs break-all sm:text-sm">{wallet.address}</code>
                  <p className="mt-2 text-sm text-muted">{wallet.note}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
              <p className="font-medium">No labelled treasury wallets have been published yet.</p>
              <p className="mt-2 text-sm text-muted">
                Do not send funds to unofficial addresses posted in chats or quote-tweets. When team,
                treasury or operations wallets are published, they will be listed here with labels and
                Solscan links. The Streamflow recipient can be inspected on the lock dashboard above.
              </p>
            </div>
          )}
        </section>

        <section className="mt-14">
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Allocation policy</p>
          <h2 className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl">
            How the supply is described today
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {ALLOCATION_POLICY.map((row) => (
              <li key={row.k} className="rounded-xl border border-border bg-surface p-5">
                <p className="text-xs tracking-[0.18em] text-muted uppercase">{row.k}</p>
                <p className="mt-2 font-display text-xl font-medium">{row.v}</p>
                <p className="mt-2 text-sm text-muted">{row.d}</p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 max-w-2xl text-sm text-subtle">
          {TOKEN.independence} {TOKEN.disclaimer}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/fossil-tokenisation">Fossil tokenisation explainer</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/explore">Explore the DinoVerse</Link>
          </Button>
        </div>
      </main>
    </SiteShell>
  );
}
