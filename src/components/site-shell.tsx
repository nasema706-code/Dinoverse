import type { ReactNode } from "react";
import { SiteNav } from "./site-nav";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-bg text-fg">
      <SiteNav />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-fg">The Dinoverse</p>
          <p>Rex Volt. A working city. $DINOVERSE.</p>
        </div>
      </footer>
    </div>
  );
}
