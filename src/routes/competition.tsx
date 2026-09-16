import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CharacterCardStudio, type CardDraft } from "@/components/character-card-studio";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UsDisclosure } from "@/components/us-disclosure";
import { COMPETITION, NEED, STEPS } from "@/lib/competition";
import { TOKEN } from "@/lib/token";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/competition")({
  component: CompetitionPage,
  head: () => ({
    meta: [{ title: "Floor Cast · The Dinoverse" }],
  }),
});

const fieldClass =
  "mt-1.5 h-11 w-full rounded-md border border-accent/25 bg-bg px-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-accent";

const NEED_DOT = [
  "bg-accent text-accent-fg",
  "bg-gold text-gold-fg",
  "bg-[#c084fc] text-[#0b0b0c]",
  "bg-[#5b9dff] text-[#0b0b0c]",
] as const;

function CompetitionPage() {
  const hydrated = useHydrated();
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [draft, setDraft] = useState<CardDraft | null>(null);
  const [postUrl, setPostUrl] = useState("");
  const remaining = useMemo(() => (hydrated ? daysLeft(COMPETITION.end) : "—"), [hydrated]);

  return (
    <SiteShell>
      <main className="relative mx-auto max-w-6xl min-w-0 px-3 pt-2 pb-6 sm:px-4 sm:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_at_top,_rgba(62,207,142,0.22),transparent_58%)]" />
        <div className="flex items-center justify-between gap-3 md:block">
          <Link to="/" className="text-sm text-muted hover:text-fg">
            ← Back to Story
          </Link>
          <div className="flex shrink-0 items-center gap-3 md:hidden">
            <a href="#how" className="text-sm text-accent hover:text-fg">
              How
            </a>
            <a
              href={COMPETITION.xCompose("")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gold hover:text-fg"
            >
              Open X
            </a>
          </div>
        </div>

        <header className="mt-4 hidden flex-wrap items-end justify-between gap-4 md:flex">
          <div className="min-w-0">
            <Badge className="border-accent/0 bg-accent text-accent-fg">{COMPETITION.kicker}</Badge>
            <h1 className="mt-3 font-display text-[clamp(1.85rem,6vw,3.25rem)] font-medium tracking-tight text-fg">
              {COMPETITION.title}
            </h1>
            <p className="mt-1 font-display text-xl text-gold text-pretty sm:text-2xl">{COMPETITION.headline}</p>
            <p className="mt-2 text-sm text-accent/90">
              {COMPETITION.datesLabel}
              <span className="mx-2 text-subtle">·</span>
              {COMPETITION.platform}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="border-accent/60 text-accent hover:bg-accent/10">
              <a href="#how">How it works</a>
            </Button>
            <Button asChild>
              <a href={COMPETITION.xCompose("")} target="_blank" rel="noopener noreferrer">
                Open X
              </a>
            </Button>
          </div>
        </header>

        <section
          id="studio"
          className="mt-2 flex min-h-0 flex-col scroll-mt-20 overflow-hidden rounded-2xl border-2 border-accent/45 bg-surface p-2.5 shadow-[0_0_80px_rgba(62,207,142,0.16)] max-md:h-[calc(100dvh-4rem-env(safe-area-inset-top,0px)-3.15rem)] sm:p-6 md:mt-6 md:h-auto md:overflow-visible"
        >
          <div className="hidden shrink-0 md:block">
            <h2 className="font-display text-2xl font-medium">Card studio</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Pick a card layout, upload a portrait, write who they are, download the card, then post it on X.
            </p>
          </div>
          <div className="min-h-0 flex-1 md:mt-6">
            <CharacterCardStudio
              onReady={(dataUrl, next) => {
                setCardUrl(dataUrl);
                setDraft(next);
              }}
            />
          </div>
        </section>

        <div id="how" className="mt-6 grid scroll-mt-24 gap-4 md:grid-cols-[minmax(0,1.55fr)_minmax(16rem,0.85fr)]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-accent/25 bg-surface p-5 sm:p-6">
              <h2 className="font-display text-2xl font-medium">How to participate</h2>
              <p className="mt-1 text-sm text-muted">Three steps from a doodle in your head to a card on The Floor.</p>
              <ol className="mt-5 space-y-3">
                {STEPS.map((step, i) => (
                  <li
                    key={step.n}
                    className="flex gap-3 rounded-xl border border-accent/20 bg-bg/50 p-3 sm:p-4"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-md font-display text-sm font-medium ${
                        i === 1 ? "bg-gold text-gold-fg" : "bg-accent text-accent-fg"
                      }`}
                    >
                      {step.n}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{step.title}</p>
                      <p className="mt-1 text-sm text-muted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <h2 className="font-display text-2xl font-medium">Card requirements</h2>
              <p className="mt-1 text-sm text-muted">Four things. That&apos;s all.</p>
              <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                {NEED.map((item, i) => (
                  <li key={item.n} className="flex min-h-[9rem] flex-col rounded-2xl border border-accent/25 bg-bg/40 p-4">
                    <span
                      className={`grid size-8 place-items-center rounded-full font-display text-sm font-medium ${NEED_DOT[i]}`}
                    >
                      {item.n}
                    </span>
                    <p className="mt-3 font-display text-lg font-medium tracking-tight">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="h-fit overflow-hidden rounded-2xl border-2 border-gold/55 bg-gradient-to-b from-[#1a160c] to-surface p-5 shadow-[0_0_40px_rgba(232,195,106,0.12)] sm:p-6 lg:sticky lg:top-24">
            <p className="inline-flex items-center gap-1.5 text-xs tracking-[0.18em] text-gold uppercase">
              <Sparkles className="size-3.5" />
              What you win
            </p>
            <h2 className="mt-2 font-display text-xl font-medium">The Floor keeps your dinosaur</h2>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-accent/35 bg-accent/10 px-3 py-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-accent-fg">
                <Trophy className="size-5" />
              </span>
              <p className="text-sm font-medium leading-snug">{COMPETITION.prize}</p>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3 border-b border-gold/20 pb-3">
                <dt className="text-muted">What we build</dt>
                <dd className="max-w-[12rem] text-right">A 3D character from your card, walking HQ with the crew</dd>
              </div>
              <div className="flex items-start justify-between gap-3 border-b border-gold/20 pb-3">
                <dt className="text-muted">Entries per person</dt>
                <dd className="font-medium tabular-nums">{COMPETITION.maxEntries}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Closes in</dt>
                <dd className="font-display text-lg font-medium text-gold">{remaining}</dd>
              </div>
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-subtle">
              We pick one winner after the window closes — craft, personality, and whether they feel like they already work
              here. No purchase required. Holding {TOKEN.ticker} does not improve your odds.
            </p>
          </aside>
        </div>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-display text-2xl font-medium">Lock the post</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Official entries are public X posts during the window. Paste the link so you have a receipt on this device.
            We judge from the live post.
          </p>
          {cardUrl ? (
            <img
              src={cardUrl}
              alt={draft?.name ? `${draft.name} character card` : "Your character card"}
              className="mt-4 max-h-72 rounded-xl border border-accent/40 shadow-[0_8px_32px_rgba(62,207,142,0.18)]"
            />
          ) : null}
          <form
            className="mt-4 flex max-w-xl flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const url = postUrl.trim();
              if (!/^https?:\/\/(x\.com|twitter\.com)\//i.test(url)) {
                toast("Paste a public x.com post link");
                return;
              }
              try {
                window.localStorage.setItem(
                  "dinoverse-floor-cast",
                  JSON.stringify({ url, name: draft?.name ?? "", at: Date.now() }),
                );
              } catch {
                /* storage blocked */
              }
              toast("Receipt saved on this device. Keep the X post public until winners are named.");
            }}
          >
            <label className="block">
              <span className="text-xs tracking-[0.18em] text-muted uppercase">Your X post</span>
              <input
                className={fieldClass}
                inputMode="url"
                placeholder="https://x.com/you/status/…"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Save receipt</Button>
              <Button asChild type="button" variant="outline">
                <a href={COMPETITION.xCompose(draft?.name ?? "")} target="_blank" rel="noopener noreferrer">
                  Compose on X
                </a>
              </Button>
            </div>
          </form>
        </section>

        <UsDisclosure compact className="mt-8" />
      </main>
    </SiteShell>
  );
}

function daysLeft(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Closed";
  const days = Math.ceil(ms / 86_400_000);
  return days === 1 ? "1 day" : `${days} days`;
}
