import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { TOKEN } from "@/lib/token";
import { cn } from "@/lib/utils";
import { SiteNav } from "./site-nav";
import { Button } from "./ui/button";

function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"
      />
    </svg>
  );
}

function TelegramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M21.9 4.3c.2-.9-.6-1.6-1.4-1.3L2.7 10.1c-.9.3-.9 1.6.1 1.9l4.6 1.5 1.8 5.7c.3.8 1.3 1 1.9.4l2.6-2.6 4.7 3.5c.7.5 1.7.1 1.9-.7l2.6-15.5ZM8.4 12.8l8.8-5.4-6.9 6.6-.2 2.5-1.7-3.7Z"
      />
    </svg>
  );
}

const EXPERIENCE = [
  { to: "/play", label: "Play" },
  { to: "/visions", label: "Four Visions" },
  { to: "/canyon", label: "Skull Gate Canyon" },
  { to: "/explore", label: "The Floor" },
  { to: "/memes", label: "Memes" },
] as const;

const FACTS = [
  { to: "/", hash: "token", label: "Token" },
  { to: "/", hash: "market", label: "Chart" },
  { to: "/transparency", label: "Transparency" },
  { to: "/fossil-tokenisation", label: "Fossils" },
] as const;

export function SiteShell({
  children,
  mode = "page",
}: {
  children: ReactNode;
  mode?: "page" | "floor";
}) {
  const floor = mode === "floor";
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col overflow-x-clip bg-bg text-fg",
        floor ? "h-dvh max-h-dvh overflow-hidden" : "min-h-dvh",
      )}
    >
      <SiteNav />
      <div className={cn("w-full min-w-0 flex-1", floor && "min-h-0 overflow-hidden")}>{children}</div>
      {floor ? null : (
      <footer className="border-t border-border px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg text-fg">DinoVerse</p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              The bones went on-chain. The dinosaurs never left.
            </p>
            <div className="mt-4 flex gap-1">
              <Button asChild variant="ghost" size="icon" aria-label="X">
                <a href={TOKEN.x} target="_blank" rel="noopener noreferrer">
                  <XGlyph className="size-4" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" aria-label="Telegram">
                <a href={TOKEN.telegram} target="_blank" rel="noopener noreferrer">
                  <TelegramGlyph className="size-4" />
                </a>
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs tracking-[0.18em] text-muted uppercase">Experience</p>
            <ul className="mt-3 space-y-2 text-sm">
              {EXPERIENCE.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-muted hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-[0.18em] text-muted uppercase">Facts</p>
            <ul className="mt-3 space-y-2 text-sm">
              {FACTS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} hash={"hash" in item ? item.hash : undefined} className="text-muted hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-[0.18em] text-muted uppercase">Legal</p>
            <code className="mt-3 block font-mono text-[11px] break-all text-muted">{TOKEN.ca}</code>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 px-0"
              onClick={() => {
                void navigator.clipboard.writeText(TOKEN.ca);
                toast("Contract copied");
              }}
            >
              <Copy className="size-3.5" />
              Copy CA
            </Button>
            <p className="mt-3 text-xs leading-relaxed text-subtle">{TOKEN.usDisclosure}</p>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-xs leading-relaxed text-subtle">
          {TOKEN.independence} {TOKEN.disclaimer} Confirm the CA on this page before you swap.
        </p>
      </footer>
      )}
    </div>
  );
}
