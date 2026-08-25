import { ExternalLink } from "lucide-react";
import { JURASSIC_SOURCES, TOKEN } from "@/lib/token";

export function JurassicCitations({ className }: { className?: string }) {
  return (
    <aside className={className}>
      <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Citations</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Specimen details, $TRCH1, $RAWR and the SPV / custody model on this page are{" "}
        <span className="text-fg">according to Jurassic Finance</span>. DinoVerse does not operate
        that structure and does not verify those claims independently.
      </p>
      <ul className="mt-4 space-y-3">
        {JURASSIC_SOURCES.map((source) => (
          <li key={source.href} className="rounded-xl border border-border bg-surface p-4">
            <a
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              {source.label}
              <ExternalLink className="size-3.5" />
            </a>
            <p className="mt-1 text-sm text-muted">{source.note}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-subtle">{TOKEN.independence}</p>
    </aside>
  );
}
