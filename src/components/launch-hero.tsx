import { ArrowRight, Copy } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TOKEN, TOKEN_STATS } from "@/lib/token";

function HeroLoop() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.removeAttribute("src");
      el.load();
      return;
    }

    el.muted = true;
    el.defaultMuted = true;
    el.volume = 0;
    el.playbackRate = 1;
    el.playsInline = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "true");
    el.setAttribute("webkit-playsinline", "true");
    el.setAttribute("autoplay", "true");

    const kick = () => {
      el.muted = true;
      void el.play().catch(() => {});
    };

    kick();
    el.addEventListener("canplay", kick);
    el.addEventListener("loadeddata", kick);
    el.addEventListener("suspend", kick);

    const onVis = () => {
      if (document.visibilityState === "visible") kick();
    };
    const onGesture = () => kick();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", kick);
    document.addEventListener("touchstart", onGesture, { passive: true });
    document.addEventListener("click", onGesture);

    return () => {
      el.removeEventListener("canplay", kick);
      el.removeEventListener("loadeddata", kick);
      el.removeEventListener("suspend", kick);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", kick);
      document.removeEventListener("touchstart", onGesture);
      document.removeEventListener("click", onGesture);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="pointer-events-none absolute inset-0 size-full object-cover object-[center_30%] sm:object-center"
      src="/intro.mp4?v=4"
      poster="/hero.png"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      aria-hidden="true"
      {...{
        playsinline: "true",
        "webkit-playsinline": "true",
        autoplay: "true",
      }}
    />
  );
}

export function LaunchHero() {
  return (
    <section className="relative min-h-[calc(100dvh-4rem)] overflow-x-clip">
      <img
        src="/hero.png"
        alt=""
        fetchPriority="high"
        decoding="async"
        className="pointer-events-none absolute inset-0 size-full object-cover object-[center_30%] sm:object-center"
      />
      <HeroLoop />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-end gap-5 px-4 py-8 sm:gap-8 sm:py-14">
        <div className="min-w-0 max-w-2xl">
          <div className="flex flex-wrap gap-2">
            <Badge className="border-accent/40 text-accent">Solana listing</Badge>
          </div>
          <p className="mt-4 font-display text-[clamp(2rem,10.6vw,4.5rem)] font-medium tracking-tight break-words">
            {TOKEN.ticker}
          </p>
          <h1 className="mt-3 max-w-xl text-base leading-snug text-fg/90 sm:text-xl">{TOKEN.tagline}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{TOKEN.blurb}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="max-sm:w-full">
              <a href={TOKEN.buy} target="_blank" rel="noopener noreferrer">
                Buy {TOKEN.ticker}
                <ArrowRight />
              </a>
            </Button>
          </div>
          <div className="mt-4 flex max-w-xl flex-col gap-2 rounded-xl border border-border bg-bg/75 px-3 py-2 backdrop-blur-sm xs:flex-row xs:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] tracking-[0.18em] text-muted uppercase">CA</p>
              <p className="mt-0.5 font-mono text-[11px] break-all text-fg sm:text-xs">{TOKEN.ca}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0 max-sm:w-full"
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

        <ul className="grid grid-cols-1 gap-2 xs:grid-cols-2 sm:grid-cols-4">
          {TOKEN_STATS.map((row) => (
            <li
              key={row.k}
              className="min-w-0 rounded-xl border border-border bg-bg/75 px-3 py-3 backdrop-blur-sm sm:px-4"
            >
              <p className="text-[10px] tracking-[0.18em] text-muted uppercase">{row.k}</p>
              <p className="mt-1 font-display text-base font-medium break-words leading-tight tabular-nums sm:text-lg">
                {row.v}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
