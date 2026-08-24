import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHydrated } from "@/lib/use-hydrated";
import { BUY_STEPS, FAQS, ROADMAP, TOKEN, TOKENOMICS } from "@/lib/token";

const TABS = ["tokenomics", "buy", "roadmap", "faq"] as const;
type Tab = (typeof TABS)[number];

function tabFromHash(hash: string): Tab {
  if (hash === "buy" || hash === "roadmap" || hash === "faq") return hash;
  return "tokenomics";
}

export function TokenSection() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const hash = useRouterState({ select: (s) => s.location.hash.replace(/^#/, "") });
  const tab = hydrated ? tabFromHash(hash) : "tokenomics";

  return (
    <section className="border-t border-border px-4 py-16 sm:py-24">
      <div id="token" className="h-0 scroll-mt-20" />
      <div id="buy" className="h-0 scroll-mt-20" />
      <div id="roadmap" className="h-0 scroll-mt-20" />
      <div id="faq" className="h-0 scroll-mt-20" />
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">The listing</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="min-w-0 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            {TOKEN.ticker} on {TOKEN.chain}
          </h2>
          <p className="max-w-md text-sm text-muted">
            Fair launch. Zero tax. Live on Solana — copy the CA below.
          </p>
        </div>
        <div className="mt-8 max-w-3xl space-y-4 text-base leading-relaxed text-muted sm:text-lg">
          {TOKEN.lore.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            const next = TABS.includes(v as Tab) ? (v as Tab) : "tokenomics";
            void navigate({
              to: "/",
              hash: next === "tokenomics" ? "token" : next,
              replace: true,
            });
          }}
          className="mt-10"
        >
          <TabsList>
            <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
            <TabsTrigger value="buy">How to buy</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="tokenomics">
            <div className="grid gap-4 sm:grid-cols-2">
              {TOKENOMICS.map((row) => (
                <div key={row.k} className="rounded-xl border border-border bg-surface p-5">
                  <p className="text-xs tracking-[0.18em] text-muted uppercase">{row.k}</p>
                  <p className="mt-2 font-display text-2xl font-medium break-words tabular-nums">{row.v}</p>
                  <p className="mt-2 text-sm text-muted">{row.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
              <p className="text-xs tracking-[0.18em] text-muted uppercase">Contract</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <code className="min-w-0 font-mono text-xs break-all sm:text-sm">{TOKEN.ca}</code>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(TOKEN.ca);
                    toast("Contract copied");
                  }}
                >
                  <Copy className="size-3.5" />
                  Copy CA
                </Button>
              </div>
              <p className="mt-3 text-xs text-subtle">
                Live mint. Confirm this CA on DexScreener before you swap.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="buy">
            <ol className="grid gap-4 sm:grid-cols-2">
              {BUY_STEPS.map((step) => (
                <li key={step.n} className="rounded-xl border border-border bg-surface p-5">
                  <p className="font-mono text-xs text-accent">{step.n}</p>
                  <p className="mt-2 font-display text-xl font-medium">{step.title}</p>
                  <p className="mt-2 text-sm text-muted">{step.body}</p>
                  {"href" in step && step.href ? (
                    <Button asChild variant="secondary" size="sm" className="mt-4">
                      <a href={step.href} target="_blank" rel="noreferrer">
                        {step.cta}
                        <ExternalLink />
                      </a>
                    </Button>
                  ) : null}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild className="max-sm:w-full">
                <a href={TOKEN.buy} target="_blank" rel="noreferrer">
                  Buy {TOKEN.ticker}
                  <ExternalLink />
                </a>
              </Button>
              <Button asChild variant="secondary" className="max-sm:w-full">
                <a href={TOKEN.buy} target="_blank" rel="noreferrer">
                  Chart on DexScreener
                  <ExternalLink />
                </a>
              </Button>
              <Button asChild className="max-sm:w-full">
                <a href={TOKEN.telegram} target="_blank" rel="noopener noreferrer">
                  Telegram
                  <ExternalLink />
                </a>
              </Button>
              <Button asChild className="max-sm:w-full">
                <a href={TOKEN.x} target="_blank" rel="noopener noreferrer">
                  Follow on X
                  <ExternalLink />
                </a>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="roadmap">
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ROADMAP.map((item) => (
                <li key={item.phase} className="rounded-xl border border-border bg-surface p-5">
                  <p className="font-mono text-xs text-accent">Phase {item.phase}</p>
                  <p className="mt-1 text-xs tracking-wide text-muted uppercase">{item.when}</p>
                  <p className="mt-3 font-display text-lg font-medium">{item.title}</p>
                  <p className="mt-2 text-sm text-muted">{item.body}</p>
                </li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent value="faq">
            <ul className="space-y-3">
              {FAQS.map((item) => (
                <li key={item.q} className="rounded-xl border border-border bg-surface p-5">
                  <p className="font-medium">{item.q}</p>
                  <p className="mt-2 text-sm text-muted">{item.a}</p>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
