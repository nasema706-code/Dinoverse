import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { TOKEN } from "@/lib/token";
import { SiteNav } from "./site-nav";
import { Button } from "./ui/button";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-bg text-fg">
      <SiteNav />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="font-display text-lg text-fg">{TOKEN.name}</p>
            <p className="mt-2 max-w-sm text-sm text-muted">{TOKEN.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" className="max-sm:flex-1">
                <a href={TOKEN.x} target="_blank" rel="noopener noreferrer">
                  X
                  <ExternalLink />
                </a>
              </Button>
              <Button asChild size="sm" className="max-sm:flex-1">
                <a href={TOKEN.telegram} target="_blank" rel="noopener noreferrer">
                  Telegram
                  <ExternalLink />
                </a>
              </Button>
              <Button asChild size="sm" className="max-sm:w-full">
                <a href={TOKEN.buy} target="_blank" rel="noreferrer">
                  Buy {TOKEN.ticker}
                </a>
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs tracking-[0.18em] text-muted uppercase">Navigate</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/" hash="about" className="text-muted hover:text-fg">
                  About
                </Link>
              </li>
              <li>
                <Link to="/" hash="token" className="text-muted hover:text-fg">
                  Tokenomics
                </Link>
              </li>
              <li>
                <Link to="/" hash="buy" className="text-muted hover:text-fg">
                  How to buy
                </Link>
              </li>
              <li>
                <Link to="/play" className="text-muted hover:text-fg">
                  Play
                </Link>
              </li>
              <li>
                <Link to="/memes" className="text-muted hover:text-fg">
                  Memes
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-muted hover:text-fg">
                  Floor Board
                </Link>
              </li>
              <li>
                <Link to="/worlds" className="text-muted hover:text-fg">
                  City
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-muted hover:text-fg">
                  The Floor
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-[0.18em] text-muted uppercase">Contract</p>
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
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-xs text-subtle">
          {TOKEN.ticker} is a meme coin on Solana. Nothing here is financial advice. Do your own
          research. Confirm the CA on this page before you swap.
        </p>
      </footer>
    </div>
  );
}
