import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { CHARACTERS } from "@/lib/characters";
import { TOKEN } from "@/lib/token";
import { useDinoverse } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { AccountChip } from "./account-chip";
import { Button } from "./ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet";
import { authEnabled, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const LINKS = [
  { to: "/", hash: "about", label: "About" },
  { to: "/", hash: "token", label: "Tokenomics" },
  { to: "/", hash: "buy", label: "How to buy" },
  { to: "/", hash: "roadmap", label: "Roadmap" },
  { to: "/play", label: "Play" },
  { to: "/memes", label: "Memes" },
  { to: "/leaderboard", label: "Board" },
  { to: "/worlds", label: "City" },
  { to: "/explore", label: "The Floor" },
] as const;

function NavLinks({ onClick, className }: { onClick?: () => void; className?: string }) {
  const hydrated = useHydrated();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({
    select: (s) => (hydrated ? s.location.hash.replace(/^#/, "") : ""),
  });
  return (
    <nav className={cn("flex items-center gap-0.5", className)}>
      {LINKS.map((link) => {
        const linkHash = "hash" in link ? link.hash : undefined;
        const active = linkHash
          ? pathname === "/" && hash === linkHash
          : pathname === link.to && !hash;
        return (
          <Link
            key={linkHash ? `${link.to}#${linkHash}` : link.to}
            to={link.to}
            hash={linkHash}
            onClick={onClick}
            className={cn(
              "inline-flex h-11 items-center px-2.5 text-sm font-medium transition-colors duration-150 lg:px-3",
              active ? "text-fg" : "text-muted hover:text-fg",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteNav() {
  const hydrated = useHydrated();
  const { user } = useCurrentUserState();
  const characterId = useDinoverse((s) => (hydrated ? s.characterId : "rex"));
  const character = CHARACTERS.find((c) => c.id === characterId) ?? null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl min-w-0 items-center justify-between gap-2 px-4 sm:gap-3">
        <Link
          to="/"
          hash=""
          resetScroll
          aria-label="Dinoverse home"
          className="flex min-w-0 items-center gap-2 sm:gap-2.5"
          onClick={() => window.scrollTo({ top: 0 })}
        >
          <img
            src="/hero.png"
            alt=""
            className="size-8 shrink-0 rounded-sm border border-border object-cover object-[center_18%]"
          />
          <span className="truncate font-display text-sm font-medium tracking-tight">
            {TOKEN.ticker}
          </span>
        </Link>

        <NavLinks className="hidden lg:flex" />

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={TOKEN.x} target="_blank" rel="noopener noreferrer">
              X
            </a>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={TOKEN.telegram} target="_blank" rel="noopener noreferrer">
              Telegram
            </a>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={TOKEN.buy} target="_blank" rel="noreferrer">
              Buy {TOKEN.ticker}
            </a>
          </Button>
          <AccountChip />
          {character ? (
            <Link
              to="/crew"
              className="hidden items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3 pl-1 xl:flex"
            >
              <img
                src={character.portrait}
                alt=""
                className={
                  character.id === "rex"
                    ? "size-7 rounded-full object-cover object-[center_18%]"
                    : "size-7 rounded-full object-cover object-top"
                }
              />
              <span className="text-xs font-medium">{character.name}</span>
            </Link>
          ) : null}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent title="Navigate" side="right">
              <div className="flex flex-col gap-1">
                <SheetClose asChild>
                  <NavLinks className="flex-col items-stretch" />
                </SheetClose>
                <SheetClose asChild>
                  <a
                    href={TOKEN.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center px-3 text-sm font-medium text-accent"
                  >
                    Follow on X
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="mt-1 justify-start">
                    <a href={TOKEN.telegram} target="_blank" rel="noopener noreferrer">
                      Telegram
                    </a>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="mt-1 justify-start">
                    <a href={TOKEN.buy} target="_blank" rel="noreferrer">
                      Buy {TOKEN.ticker}
                    </a>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/crew" className="inline-flex h-11 items-center px-3 text-sm text-muted">
                    {character ? `Guide: ${character.name}` : "Pick a guide"}
                  </Link>
                </SheetClose>
                {authEnabled && !user ? (
                  <SheetClose asChild>
                    <Link
                      to="/login"
                      search={{ next: "/play" }}
                      className="inline-flex h-11 items-center px-3 text-sm font-medium text-accent"
                    >
                      Sign in
                    </Link>
                  </SheetClose>
                ) : null}
                {authEnabled && user ? (
                  <SheetClose asChild>
                    <button
                      type="button"
                      className="inline-flex h-11 items-center px-3 text-left text-sm text-muted"
                      onClick={() => void signOut("/")}
                    >
                      Sign out
                    </button>
                  </SheetClose>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
