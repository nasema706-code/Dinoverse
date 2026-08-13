import { CHARACTERS, type CharacterId } from "@/lib/characters";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

export function CharacterGrid({
  selected,
  onSelect,
}: {
  selected: CharacterId | null;
  onSelect: (id: CharacterId) => void;
}) {
  const featured = CHARACTERS.find((c) => c.id === "rex");
  const rest = CHARACTERS.filter((c) => c.id !== "rex");

  return (
    <div className="space-y-4">
      {featured ? (
        <button
          type="button"
          onClick={() => onSelect(featured.id)}
          className={cn(
            "group grid w-full overflow-hidden rounded-xl border bg-surface text-left transition-[border-color] duration-200 sm:grid-cols-[14rem_1fr]",
            selected === featured.id ? "border-accent" : "border-border hover:border-muted",
          )}
        >
          <img
            src={featured.portrait}
            alt={`${featured.name}, ${featured.species} ${featured.title}`}
            className="h-56 w-full object-cover object-top sm:h-full"
          />
          <div className="flex flex-col justify-between p-5 sm:p-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge>Floor Chief</Badge>
                <Badge>{featured.species}</Badge>
              </div>
              <div>
                <p className="font-display text-2xl font-medium tracking-tight">{featured.name}</p>
                <p className="mt-1 text-sm text-muted">{featured.tagline}</p>
              </div>
              <p className="max-w-xl text-sm text-muted">{featured.blurb}</p>
            </div>
            <p className="mt-4 text-xs tracking-wide text-subtle uppercase">Default guide · $DINOVERSE face</p>
          </div>
        </button>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-3">
        {rest.map((c) => {
          const active = selected === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className={cn(
                  "flex h-full w-full flex-col overflow-hidden rounded-xl border bg-surface text-left transition-[border-color] duration-200",
                  active ? "border-accent" : "border-border hover:border-muted",
                )}
              >
                <img
                  src={c.portrait}
                  alt={`${c.name}, ${c.species} ${c.title}`}
                  className="h-40 w-full object-cover object-top"
                />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <Badge>{c.title}</Badge>
                  <p className="font-display text-lg font-medium tracking-tight">{c.name}</p>
                  <p className="text-sm text-muted">{c.tagline}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
