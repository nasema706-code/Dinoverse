import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Trophy, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CharacterCardStudio, type CardDraft } from "@/components/character-card-studio";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UsDisclosure } from "@/components/us-disclosure";
import { COMPETITION, MUST, MUST_NOT, STEPS } from "@/lib/competition";
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

function CompetitionPage() {
  const hydrated = useHydrated();
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [draft, setDraft] = useState<CardDraft | null>(null);
  const [postUrl, setPostUrl] = useState("");
  const remaining = useMemo(() => (hydrated ? daysLeft(COMPETITION.end) : "—"), [hydrated]);

  return (
    <SiteShell>
      <main className="relative mx-auto max-w-6xl min-w-0 overflow-x-clip px-4 py-6 sm:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_at_top,_rgba(62,207,142,0.22),transparent_58%)]" />
        <Link to="/" className="text-sm text-muted hover:text-fg">
          ← Back to Story
        </Link>

        <section className="relative mt-4 overflow-hidden rounded-2xl border-2 border-accent/45 bg-[#07140f] shadow-[0_0_80px_rgba(62,207,142,0.16)]">
          <div className="pointer-events-none absolute -top-24 left-[-10%] size-80 rounded-full bg-accent/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-[-20%] size-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative z-10 grid md:grid-cols-[minmax(0,1.2fr)_minmax(14rem,0.9fr)] md:items-end">
            <div className="px-5 py-8 sm:px-8 sm:py-12">
              <Badge className="border-accent/0 bg-accent text-accent-fg">{COMPETITION.kicker}</Badge>
              <h1 className="mt-4 font-display text-[clamp(1.85rem,6vw,3.25rem)] font-medium tracking-tight text-fg">
                {COMPETITION.title}
              </h1>
              <p className="mt-2 font-display text-xl text-gold text-pretty sm:text-2xl">{COMPETITION.headline}</p>
              <p className="mt-3 text-sm text-accent/90">
                {COMPETITION.datesLabel}
                <span className="mx-2 text-subtle">·</span>
                Platforms: {COMPETITION.platform}
                <span className="mx-2 text-subtle">·</span>
                Type: {COMPETITION.type}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg/90 sm:text-base">{COMPETITION.blurb}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild size="lg">
                  <a href="#studio">Build your card</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-accent/60 text-accent hover:bg-accent/10"
                >
                  <a href={COMPETITION.xCompose("")} target="_blank" rel="noopener noreferrer">
                    Open X
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative hidden min-h-[18rem] md:block md:min-h-[22rem]">
              <img
                src="/characters/rex/full.png?v=3"
                alt="Rex Volt, Floor Chief — the house style for a character card"
                className="pointer-events-none absolute inset-0 size-full object-contain object-bottom [mask-image:radial-gradient(ellipse_at_bottom,black_58%,transparent_82%)]"
              />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.55fr)_minmax(16rem,0.85fr)]">
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
              <p className="mt-1 text-sm text-muted">
                Missing any of these and the post is rejected in review. The card is the entry — not a thread, not a reel of
                someone else&apos;s dinosaur.
              </p>
              <ul className="mt-5 space-y-2">
                {MUST.map((item) => (
                  <li key={item} className="flex gap-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
                {MUST_NOT.map((item) => (
                  <li key={item} className="flex gap-3 rounded-lg border border-danger/35 bg-bg/40 px-3 py-3 text-sm">
                    <X className="mt-0.5 size-4 shrink-0 text-danger" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
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

        <section
          id="studio"
          className="mt-6 scroll-mt-24 rounded-2xl border border-accent/30 bg-surface p-5 shadow-[0_0_50px_rgba(62,207,142,0.08)] sm:p-6"
        >
          <h2 className="font-display text-2xl font-medium">Card studio</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Upload a portrait, write the traits and bio, and download the card. Post that image on X. You can also design
            the card in any tool — the studio is optional, the single-image rule is not.
          </p>
          <div className="mt-6">
            <CharacterCardStudio
              onReady={(dataUrl, next) => {
                setCardUrl(dataUrl);
                setDraft(next);
              }}
            />
          </div>
        </section>

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
