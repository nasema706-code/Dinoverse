import { ArrowRight, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuality } from "@/game/quality";
import { TOKEN, TOKEN_STATS } from "@/lib/token";
import { cn } from "@/lib/utils";

export function LaunchHero() {
  const { settings } = useQuality();
  const [playVideo, setPlayVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  useEffect(() => {
    setPlayVideo(settings.videoHero);
  }, [settings.videoHero]);
  return (
    <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      <img
        src="/hero.png"
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 size-full object-cover object-center"
      />
      {playVideo ? (
        <video
          src="/intro.mov"
          poster="/hero.png"
          className={cn(
            "absolute inset-0 size-full object-cover object-center transition-opacity duration-700",
            videoReady ? "opacity-100" : "opacity-0",
          )}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onCanPlay={() => setVideoReady(true)}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-end gap-8 px-4 py-10 sm:py-14">
        <div className="max-w-2xl">
          <div className="flex flex-wrap gap-2">
            <Badge className="border-accent/40 text-accent">Solana listing</Badge>
          </div>
          <p className="mt-4 font-display text-5xl font-medium tracking-tight sm:text-7xl">
            {TOKEN.ticker}
          </p>
          <h1 className="mt-3 max-w-xl text-lg text-fg/90 sm:text-xl">{TOKEN.tagline}</h1>
          <p className="mt-3 max-w-xl text-sm text-muted">{TOKEN.blurb}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={TOKEN.buy} target="_blank" rel="noreferrer">
                Buy {TOKEN.ticker}
                <ArrowRight />
              </a>
            </Button>
          </div>
          <div className="mt-4 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-bg/75 px-3 py-2 backdrop-blur-sm">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] tracking-[0.18em] text-muted uppercase">CA</p>
              <p className="mt-0.5 font-mono text-[11px] break-all text-fg sm:text-xs">{TOKEN.ca}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={() => {
                void navigator.clipboard.writeText(TOKEN.ca);
                toast("Contract copied");
              }}
            >
              <Copy className="size-3.5" />
              Copy
            </Button>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TOKEN_STATS.map((row) => (
            <li
              key={row.k}
              className="rounded-xl border border-border bg-bg/75 px-4 py-3 backdrop-blur-sm"
            >
              <p className="text-[10px] tracking-[0.18em] text-muted uppercase">{row.k}</p>
              <p className="mt-1 font-display text-lg font-medium tabular-nums">{row.v}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
