import { Link } from "@tanstack/react-router";
import { ArrowRight, Copy } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UsDisclosure } from "@/components/us-disclosure";
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
      className="pointer-events-none absolute inset-0 size-full object-cover object-center"
      src="/intro.mp4?v=5"
      poster="/hero.jpg?v=5"
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
    <section className="relative overflow-x-hidden sm:min-h-[calc(100dvh-4rem)]">
      <img
        src="/hero.jpg?v=5"
        alt=""
        fetchPriority="high"
        decoding="async"
        className="pointer-events-none absolute inset-0 size-full object-cover object-center"
      />
      <HeroLoop />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-end gap-5 px-4 py-8 sm:min-h-[calc(100dvh-4rem)] sm:gap-8 sm:py-14">
        <div className="min-w-0 max-w-2xl">
          <div className="flex flex-wrap gap-2">
            <Badge>{TOKEN.kicker}</Badge>
          </div>
          <h1 className="mt-4 font-display text-[clamp(2rem,10.6vw,4.5rem)] font-medium tracking-tight break-words">
            {TOKEN.ticker}
          </h1>
          <p className="mt-3 max-w-xl font-display text-[clamp(1.15rem,4.2vw,1.75rem)] font-medium tracking-tight leading-[1.15] text-fg/90">
            {TOKEN.headline}
            <span className="mt-1 block">{TOKEN.headlineTwo}</span>
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Humans believed dinosaurs disappeared 65 million years ago. The dinosaurs were happy to
            let them believe it. While humanity invented paperwork, traffic jams and financial crises,
            an advanced dinosaur civilisation was building quietly beyond the human world — complete
            with scientists, pilots, engineers, traders and one exceptionally confident velociraptor
            carrying a coffee.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg/90">
            Welcome to <span className="font-medium">{TOKEN.name}</span>: an independent Solana meme
            universe inspired by dinosaur fossil tokenisation.
          </p>

          <div className="mt-6 rounded-xl border-2 border-gold/55 bg-lore/90 px-4 py-4 backdrop-blur-sm">
            <p className="text-[11px] font-medium tracking-[0.18em] text-gold uppercase">
              Official contract address
            </p>
            <p className="mt-2 font-mono text-[13px] leading-relaxed break-all text-fg sm:text-sm">
              {TOKEN.ca}
            </p>
            <Button
              type="button"
              size="lg"
              className="mt-4 w-full sm:w-auto"
              onClick={() => {
                void navigator.clipboard.writeText(TOKEN.ca);
                toast("Contract copied");
              }}
            >
              <Copy className="size-4" />
              Copy contract address
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="max-sm:w-full">
              <Link to="/explore">
                Explore the Floor
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="max-sm:w-full">
              <Link to="/play">Play Mushroom Run</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="max-sm:w-full">
              <a href={TOKEN.buy} target="_blank" rel="noopener noreferrer">
                Buy
              </a>
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted">
            Walk as you or pick a character. The Floor is walkable. The city is still being built.
          </p>
          <UsDisclosure compact className="mt-4" />
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
