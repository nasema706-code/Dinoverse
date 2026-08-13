import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const CA = "SOON-ON-SOLANA-DINOVERSE111111111111111111";

export function TokenSection() {
  return (
    <section id="token" className="border-t border-border px-4 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Rex's listing</p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            $DINOVERSE on Solana
          </h2>
          <p className="mt-4 max-w-xl text-muted">
            He does not pitch. He lists. $DINOVERSE is the ticker on a city that already works —
            coffee, gyms, the mall, the Coliseum, charcoal floors. The contract drops when the
            window opens.
          </p>
          <div className="mt-6 rounded-xl border border-border bg-surface p-4">
            <p className="text-xs tracking-wide text-muted uppercase">Contract</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="font-mono text-xs break-all text-fg sm:text-sm">{CA}</code>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(CA);
                  toast("Address copied");
                }}
              >
                <Copy className="size-3.5" />
                Copy
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { k: "Chain", v: "Solana" },
            { k: "Ticker", v: "$DINOVERSE" },
            { k: "Tax", v: "0 / 0" },
          ].map((row) => (
            <div key={row.k} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs tracking-wide text-muted uppercase">{row.k}</p>
              <p className="mt-1 font-display text-xl font-medium tabular-nums">{row.v}</p>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <a href="https://jup.ag" target="_blank" rel="noreferrer">
                Jupiter
                <ExternalLink />
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href="https://raydium.io" target="_blank" rel="noreferrer">
                Raydium
                <ExternalLink />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
