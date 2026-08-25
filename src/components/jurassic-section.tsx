import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOKEN } from "@/lib/token";

export function JurassicSection({ teaser = false }: { teaser?: boolean }) {
  if (teaser) {
    return (
      <section className="border-t border-border bg-lore px-4 py-16 sm:py-20">
        <div id="bones" className="h-0 scroll-mt-20" />
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium tracking-[0.18em] text-gold uppercase">On-chain bones</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Inspired by fossil tokenisation. Not part of it.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{TOKEN.independence}</p>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            According to Jurassic Finance, authenticated fossils can sit in dedicated SPVs with their
            own Solana tokens. DinoVerse is the independent story that follows: the civilisation that
            left the bones never actually left.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="max-sm:w-full">
              <Link to="/fossil-tokenisation">How fossil tokenisation works</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="max-sm:w-full">
              <a href={TOKEN.jurassic} target="_blank" rel="noreferrer">
                Jurassic Finance
                <ExternalLink />
              </a>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
