import { Link } from "@tanstack/react-router";
import { Companion } from "@/components/companion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CHARACTER_BY_ID } from "@/lib/characters";
import { useDinoverse } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import {
  CONSTRUCTION_LINE,
  type World,
  type WorldId,
} from "@/lib/worlds";

export function ConstructionGate({
  world,
  stills = true,
}: {
  world: World;
  stills?: boolean;
}) {
  const hydrated = useHydrated();
  const characterId = useDinoverse((s) => (hydrated ? s.characterId : "rex"));
  const character = CHARACTER_BY_ID[characterId];
  const rex = CHARACTER_BY_ID.rex;
  const closed = world.id === "forum" ? null : CONSTRUCTION_LINE[world.id as Exclude<WorldId, "forum">];
  const line = closed?.[character.id] ?? `${world.name} is still under construction.`;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="relative bg-black">
        <img
          src="/brand/coming-soon.png"
          alt="Dinoverse coming soon on Solana"
          className="aspect-square w-full object-cover sm:aspect-[16/10]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        {rex.figure ? (
          <img
            src={rex.figure}
            alt="Rex Volt, Floor Chief"
            className="pointer-events-none absolute right-0 bottom-0 hidden h-[88%] w-auto object-contain sm:block"
          />
        ) : null}
        <div className="absolute inset-0 flex flex-col justify-end gap-3 p-5 sm:max-w-[62%] sm:p-7">
          <div className="flex flex-wrap gap-2">
            <Badge className="border-accent/40 text-accent">Under construction</Badge>
            <Badge>{world.district}</Badge>
          </div>
          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">{world.name}</h2>
          <p className="max-w-xl text-sm text-fg/90">
            Under construction. The plates are up. The 3D walk is not. {world.name} opens when the
            floor is honest.
          </p>
        </div>
      </div>
      <div className="space-y-5 p-5 sm:p-7">
        <div className="flex items-end gap-4">
          {rex.figure ? (
            <img
              src={rex.figure}
              alt=""
              className="h-28 w-auto shrink-0 object-contain object-bottom sm:hidden"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <Companion line={line} />
          </div>
        </div>
        {stills && world.stills.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {world.stills.map((still) => (
              <li key={still.src} className="overflow-hidden rounded-lg border border-border">
                <img src={still.src} alt={still.alt} className="aspect-video w-full object-cover" />
                <p className="px-2 py-1.5 text-[11px] tracking-wide text-subtle uppercase">
                  {still.caption}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/worlds" search={{ district: "forum" }}>
              Back to The Floor preview
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
