import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadMarketTape, type MarketTape } from "@/lib/market";
import { TOKEN } from "@/lib/token";
import { UsDisclosure } from "@/components/us-disclosure";

const ROWS: { k: string; pick: (tape: MarketTape) => string; tone?: "change" }[] = [
  { k: "Price", pick: (t) => t.price },
  { k: "Market cap", pick: (t) => t.marketCap },
  { k: "Liquidity", pick: (t) => t.liquidity },
  { k: "24-hour volume", pick: (t) => t.volume },
  { k: "24-hour change", pick: (t) => t.change, tone: "change" },
  { k: "Transactions", pick: (t) => t.txns },
];

function formatTapeTime(ms: number) {
  return `${new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(ms))} UTC`;
}

export function MarketTape() {
  const [tape, setTape] = useState<MarketTape | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const pull = () => {
      void loadMarketTape()
        .then((next) => {
          if (!alive) return;
          setTape(next);
          setFailed(!next);
        })
        .catch(() => {
          if (!alive) return;
          setFailed(true);
        });
    };
    pull();
    const id = window.setInterval(pull, 60_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <section className="border-t border-border px-4 py-16 sm:py-24">
      <div id="market" className="h-0 scroll-mt-20" />
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">Live market data</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="min-w-0 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            The tape, from DexScreener
          </h2>
          <p className="max-w-md text-sm text-muted">
            These figures refresh automatically. Markets move fast and feeds can lag. Confirm the CA
            and liquidity before you interact with the token.
          </p>
        </div>

        <div className="tape-seam mt-8" />
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROWS.map((row) => {
            const value = tape ? row.pick(tape) : "…";
            const changeClass =
              row.tone === "change" && tape?.changePositive != null
                ? tape.changePositive
                  ? "text-accent"
                  : "text-red-400"
                : "text-fg";
            return (
              <li key={row.k} className="rounded-xl border border-border bg-surface p-5">
                <p className="text-xs tracking-[0.18em] text-muted uppercase">{row.k}</p>
                <p className={`mt-2 font-display text-2xl font-medium tabular-nums ${changeClass}`}>
                  {failed && !tape ? "—" : value}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-sm text-muted">
          {failed && !tape
            ? "Last updated: DexScreener did not respond. Figures above may be stale."
            : tape
              ? `Last updated: ${formatTapeTime(tape.fetchedAt)} · DexScreener API`
              : "Last updated: fetching DexScreener…"}
        </p>

        <UsDisclosure className="mt-5" />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild variant="tape" size="lg" className="max-sm:w-full">
            <a href={tape?.pairUrl ?? TOKEN.dexscreener} target="_blank" rel="noreferrer">
              Open DexScreener
              <ExternalLink />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="max-sm:w-full">
            <a href={TOKEN.solscan} target="_blank" rel="noreferrer">
              Verify on Solscan
              <ExternalLink />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
