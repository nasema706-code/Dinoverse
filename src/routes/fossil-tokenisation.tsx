import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { JurassicCitations } from "@/components/jurassic-citations";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { TOKEN } from "@/lib/token";

export const Route = createFileRoute("/fossil-tokenisation")({
  component: FossilTokenisationPage,
});

const TOPICS = [
  {
    k: "Special Purpose Vehicles",
    v: "An SPV is a legal wrapper built for one job. According to Jurassic Finance, each fossil acquisition is placed in its own dedicated vehicle so that specimen’s rights sit in one place instead of being mixed with a company’s other assets. Think of it as a labelled box: the fossil’s paperwork lives in the box; the box is not the dinosaur city on this website.",
  },
  {
    k: "SPL tokens",
    v: "SPL is Solana’s standard for tokens, the way a ticker can move between wallets. According to Jurassic Finance, each fossil SPV can issue its own SPL token — for Deaton, that token is $TRCH1 — so that stated economic and legal rights under the SPV’s operating agreement can be transferred on-chain. $DINOVERSE is also an SPL token, but it is a meme ticker. It does not sit inside that SPV.",
  },
  {
    k: "Authentication",
    v: "Authentication is the off-chain work of checking that a specimen is what the paperwork says it is. According to Jurassic Finance, fossils are sourced as authenticated specimens and legal ownership is established off-chain. A blockchain cannot carbon-date a skull. It can only record who holds a token that a legal structure says is connected to that skull.",
  },
  {
    k: "Custody",
    v: "Custody is who physically looks after the object. According to Jurassic Finance, authentication, custody and insurance stay off-chain — typically with museum or institutional partners — while the ownership record lives on-chain. You do not receive a crate of bone if you hold $DINOVERSE, and according to Jurassic Finance you would not receive one from holding $TRCH1 either: the fossil stays in care; the token is a claim defined by that project’s documents.",
  },
] as const;

function FossilTokenisationPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl min-w-0 px-4 py-8 sm:py-16">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Education</p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-medium tracking-tight sm:text-5xl">
          Fossil tokenisation, in plain language.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          This page explains the real-world story DinoVerse is riffing on. It is not a product from
          Jurassic Finance, and holding {TOKEN.ticker} does not buy you a fossil.
        </p>

        <div className="mt-10 max-w-3xl space-y-4 text-base leading-relaxed text-muted sm:text-lg">
          <p>
            Humans put dinosaur bones in museums. According to Jurassic Finance, that project is trying
            to put the <em>rights around</em> those bones onto Solana: one legal wrapper per specimen,
            one token per wrapper, the object itself still sitting in professional care.
          </p>
          <p>
            DinoVerse is the joke that follows. If the bones went on-chain, the civilisation that left
            them never actually left. Rex still drinks the coffee. You can walk the Floor without
            buying anything.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 lg:grid-cols-2">
          {TOPICS.map((topic) => (
            <li key={topic.k} className="rounded-xl border border-border bg-surface p-5 sm:p-6">
              <p className="text-xs tracking-[0.18em] text-gold uppercase">{topic.k}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{topic.v}</p>
            </li>
          ))}
        </ul>

        <section className="mt-14 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-border bg-surface p-5 sm:p-6">
            <p className="text-xs tracking-[0.18em] text-muted uppercase">According to Jurassic Finance</p>
            <h2 className="mt-3 font-display text-2xl font-medium">Deaton and $TRCH1</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              According to Jurassic Finance, Deaton is a museum-grade <em>Triceratops prorsus</em> skull
              and the first specimen in that programme. According to Jurassic Finance, $TRCH1 is the
              SPL token connected to Deaton’s SPV, with a stated one-million supply and a 660,000 USDC
              acquisition and coordination target. Those figures are theirs. Check{" "}
              <a href={TOKEN.jurassic} className="text-accent hover:underline" target="_blank" rel="noreferrer">
                jurassic.finance
              </a>{" "}
              rather than this page if you need the live version of that story.
            </p>
          </article>
          <article className="rounded-xl border border-gold/35 bg-surface p-5 sm:p-6">
            <p className="text-xs tracking-[0.18em] text-gold uppercase">The DinoVerse</p>
            <h2 className="mt-3 font-display text-2xl font-medium">{TOKEN.ticker} is not that</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {TOKEN.ticker} is an independent meme token with characters, a city and a free game. It
              is not an SPV share, not a custody receipt, and not a claim on Deaton, $TRCH1 or $RAWR.
              No token purchase is required to play.
            </p>
          </article>
        </section>

        <JurassicCitations className="mt-12 max-w-3xl" />

        <div className="mt-10 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/explore">Explore the DinoVerse</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/transparency">Transparency</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href={TOKEN.jurassic} target="_blank" rel="noreferrer">
              Jurassic Finance
              <ExternalLink />
            </a>
          </Button>
        </div>
      </main>
    </SiteShell>
  );
}
