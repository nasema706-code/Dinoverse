import { CHARACTER_BY_ID } from "@/lib/characters";
import { useDinoverse } from "@/lib/store";

export function Companion({ line }: { line: string }) {
  const characterId = useDinoverse((s) => s.characterId);
  if (!characterId) return null;
  const character = CHARACTER_BY_ID[characterId];

  return (
    <aside className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 sm:p-4">
      <img
        src={character.portrait}
        alt=""
        className="size-12 shrink-0 rounded-md object-cover object-top"
      />
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">
          {character.name}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-fg">{line}</p>
      </div>
    </aside>
  );
}
