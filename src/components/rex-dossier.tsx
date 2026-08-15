import { CHARACTER_BY_ID } from "@/lib/characters";

const PRINCIPLES = [
  {
    k: "Handshake",
    v: "If he nods, the stall is under protection for the hour. No contract longer than a meal.",
  },
  {
    k: "Ledger",
    v: "The tablet is not a prop. It is the tape. $DINOVERSE moves when the floor is ready.",
  },
  {
    k: "Floor",
    v: "Charcoal three-piece, burgundy tie, coffee in one claw, the schematic in the other. Headset on. He dresses like the listing already happened.",
  },
];

export function RexDossier() {
  const rex = CHARACTER_BY_ID.rex;

  return (
    <section className="border-t border-border px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">The Floor Chief</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-center">
          <div className="overflow-hidden rounded-xl border border-border bg-black">
            <img
              src={rex.figure ?? rex.portrait}
              alt="Rex Volt, velociraptor Floor Chief in a charcoal three-piece suit"
              className="aspect-[2/3] min-h-[28rem] w-full object-contain object-bottom sm:min-h-[36rem] lg:min-h-[44rem]"
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
              Built like a listing
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              Rex Volt is the face of $DINOVERSE because he already treats dinosaurs like a public
              market. The fossils are lining up to list. He listed the lifestyle first — coffee in
              one claw, the live tape in the other. The crew keeps him honest. He keeps the floor
              open.
            </p>
            <blockquote className="mt-6 border-l-2 border-accent pl-4 text-lg text-fg">
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
