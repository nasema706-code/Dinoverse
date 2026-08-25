import { TOKEN } from "@/lib/token";
import { cn } from "@/lib/utils";

export function UsDisclosure({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <p
      className={cn(
        compact
          ? "max-w-xl text-xs leading-relaxed text-subtle"
          : "max-w-4xl text-sm leading-relaxed text-muted",
        className,
      )}
    >
      {TOKEN.usDisclosure}
    </p>
  );
}
