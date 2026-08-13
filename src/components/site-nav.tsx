import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CHARACTERS } from "@/lib/characters";
import { useDinoverse } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/worlds", label: "Worlds" },
  { to: "/explore", label: "Explore" },
  { to: "/crew", label: "Crew" },
] as const;

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-8 animate-pulse rounded-full bg-surface-2" />;
  }
  if (user) {
    return (
      <div className="max-w-40 truncate text-xs text-muted [&_button]:text-muted [&_img]:size-7">
        <UserButton />
      </div>
    );
  }
  return (
    <Button asChild variant="ghost" size="sm">
      <Link to="/login">Sign in</Link>
    </Button>
  );
}

function NavLinks({ onClick, className }: { onClick?: () => void; className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {LINKS.map((link) => {
        const active = pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClick}
            className={cn(
              "inline-flex h-11 items-center px-3 text-sm font-medium transition-colors duration-150",
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
  const characterId = useDinoverse((s) => (hydrated ? s.characterId : "rex"));
  const character = CHARACTERS.find((c) => c.id === characterId) ?? null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-sm bg-surface-2 text-accent">
            <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M7 19c1-7 6-11 12-11 2.4 0 4.6 1 6 2.6-.8.1-1.7.4-2.4.9 1.4.4 2.4 1.4 2.8 2.7-1.6-.2-3.2 0-4.4.8 1.6 1.4 1.8 3.6.6 5.3C19.2 23.4 15 24.4 11 23c-2.4-.8-4.4-2.2-4-4z"
              />
            </svg>
          </span>
          <span className="font-display text-sm font-medium tracking-tight">Dinoverse</span>
        </Link>

        <NavLinks className="hidden md:flex" />

        <div className="flex items-center gap-2">
          {character ? (
            <Link
              to="/crew"
              className="hidden items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3 pl-1 sm:flex"
            >
              <img
                src={character.portrait}
                alt=""
                className="size-7 rounded-full object-cover object-top"
              />
              <span className="text-xs font-medium">{character.name}</span>
            </Link>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/crew">Pick a guide</Link>
            </Button>
          )}
          <div className="hidden sm:block">
            <SignedOut>
              <AuthSlot />
            </SignedOut>
            <SignedIn>
              <AuthSlot />
            </SignedIn>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent title="Navigate" side="right">
              <div className="flex flex-col gap-1">
                <SheetClose asChild>
                  <NavLinks className="flex-col items-stretch" />
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/crew" className="inline-flex h-11 items-center px-3 text-sm text-muted">
                    {character ? `Guide: ${character.name}` : "Pick a guide"}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/login" className="inline-flex h-11 items-center px-3 text-sm text-muted">
                    Sign in
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
