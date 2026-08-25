import { useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { CHARACTER_BY_ID } from "@/lib/characters";
import { Button } from "@/components/ui/button";

const PRINCIPLES = [
  {
    k: "Executives",
    v: "Velociraptors became financial executives. At the centre is Rex Volt — live tablet in one claw, coffee in the other.",
  },
  {
    k: "Institutions",
    v: "Triceratops built the institutions. Pteranodons mastered aviation. The city kept a balance sheet while humans studied the leftovers.",
  },
  {
    k: "Security",
    v: "Ankylosaurs took over security — because nobody argues with the dinosaur carrying a natural wrecking ball.",
  },
];

function AboutIntro() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const togglePlay = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      el.muted = muted;
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const el = ref.current;
    if (!el) return;
    const next = !el.muted;
    el.muted = next;
    setMuted(next);
  };

  return (
    <div className="relative mt-6 overflow-hidden rounded-xl border border-border bg-black">
      <video
        ref={ref}
        className="aspect-video max-h-[22rem] w-full cursor-pointer object-cover sm:max-h-[28rem]"
        src="/intro.mp4?v=5"
        poster="/hero.jpg?v=5"
        playsInline
        preload="metadata"
        controls={false}
        aria-label="Dinoverse intro"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        {...{
          playsinline: "true",
          "webkit-playsinline": "true",
        }}
      />
      {!playing ? (
        <button
          type="button"
          className="absolute inset-x-0 top-0 bottom-14 grid place-items-center bg-bg/25"
          onClick={togglePlay}
          aria-label="Play intro"
        >
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-gold/80 text-gold-fg sm:size-16">
            <Play className="size-6 fill-current sm:size-7" />
          </span>
        </button>
      ) : null}
      <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 sm:inset-x-3 sm:bottom-3">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="bg-transparent text-fg hover:bg-transparent"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause /> : <Play />}
          <span className="max-[360px]:sr-only">{playing ? "Pause" : "Play"}</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="bg-transparent text-fg hover:bg-transparent"
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX /> : <Volume2 />}
          <span className="max-[360px]:sr-only">{muted ? "Unmute" : "Mute"}</span>
        </Button>
      </div>
    </div>
  );
}

export function RexDossier() {
  const rex = CHARACTER_BY_ID.rex;

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Humans found the bones.
          <span className="mt-1 block">The dinosaurs kept the balance sheet.</span>
        </h2>
        <AboutIntro />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-center">
          <div className="overflow-hidden rounded-xl border border-border bg-black">
            <img
              src={rex.figure ?? rex.portrait}
              alt="Rex Volt, velociraptor Floor Chief in a charcoal three-piece suit"
              className="mx-auto h-auto max-h-[22rem] w-full object-contain object-bottom sm:max-h-[28rem]"
            />
            <div className="rex-seam" />
            <div className="p-4">
              <p className="font-display text-xl font-medium">{rex.name}</p>
              <p className="text-sm text-muted">
                {rex.title} · {rex.species}
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              For millions of years, humans studied the leftovers.
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              They assumed they were looking at an extinct civilisation. They were only looking at
              what the dinosaurs left behind. Beyond the human world, the DinoVerse kept evolving.
            </p>
            <p className="mt-4 max-w-xl text-muted">
              $DINOVERSE is the independent meme token at the centre of this story-world:
              original characters, playable experiences, animated lore and a hidden dinosaur city
              being built in public. It is a meme coin with a world — not a claim on a real-world
              fossil.
            </p>
            <blockquote className="mt-6 border-l-2 border-gold pl-4 text-lg text-fg">
              {rex.tagline}
            </blockquote>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {PRINCIPLES.map((item) => (
                <li key={item.k} className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-xs tracking-wide text-muted uppercase">{item.k}</p>
                  <p className="mt-2 text-sm text-muted">{item.v}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
