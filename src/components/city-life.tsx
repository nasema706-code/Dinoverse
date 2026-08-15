import { WORLDS } from "@/lib/worlds";

export function CityLife() {
  return (
    <section className="border-t border-border px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">City life</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-medium tracking-tight">
          They live like us. They just kept the teeth.
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          Coffee. The floor. Dino Mart. The mall. Dino Fit. The Coliseum. This is the Dinoverse —
          a working city that listed itself on Solana. The Floor is a live 3D preview. Walking, Dino
          Mart, the Mall, and the Arena are still under construction — these plates are the rest of
          the tour.
        </p>

        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {WORLDS.flatMap((w) =>
            w.stills.map((still) => (
              <figure
                key={still.src}
                className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-border bg-surface"
              >
                <img src={still.src} alt={still.alt} className="w-full object-cover" />
                <figcaption className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="text-xs text-muted">{w.name}</span>
                  <span className="text-xs tracking-wide text-subtle uppercase">{still.caption}</span>
                </figcaption>
              </figure>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
