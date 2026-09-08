import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";
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

type DropItem = { to: string; hash?: string; label: string };

const CITY_ITEMS: DropItem[] = [
  { to: "/explore", label: "The Floor · building" },
  { to: "/visions", label: "Four Visions" },
  { to: "/canyon", label: "Skull Gate Canyon" },
  { to: "/worlds", label: "Districts" },
  { to: "/crew", label: "Crew" },
];

const TOKEN_ITEMS: DropItem[] = [
  { to: "/", hash: "token", label: "Facts" },
  { to: "/", hash: "market", label: "Chart" },
  { to: "/transparency", label: "Locks" },
  { to: "/", hash: "faq", label: "FAQ" },
];

const MORE_ITEMS: DropItem[] = [
  { to: "/memes", label: "Memes" },
  { to: "/leaderboard", label: "Floor Board" },
  { to: "/fossil-tokenisation", label: "Fossils" },
];

const FACT_HASHES = new Set(["token", "buy", "faq", "market"]);
const CITY_PATHS = new Set(["/explore", "/visions", "/canyon", "/worlds", "/crew"]);
const MORE_PATHS = new Set(["/memes", "/leaderboard", "/fossil-tokenisation"]);

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

function NavDrop({
  label,
  active,
  items,
}: {
  label: string;
  active: boolean;
  items: DropItem[];
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          "inline-flex h-11 items-center gap-1 rounded-md px-2.5 text-sm font-medium outline-none",
          active ? "text-fg" : "text-muted hover:text-fg",
        )}
      >
        {label}
        <ChevronDown className="size-3.5 opacity-70" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-44 rounded-xl border border-border bg-surface p-1.5 shadow-xl"
        >
          {items.map((item) => (
            <DropdownMenu.Item key={item.label} asChild>
              <Link
                to={item.to}
                hash={item.hash}
                className="flex cursor-pointer rounded-md px-3 py-2 text-sm text-muted outline-none hover:bg-surface-2 hover:text-fg data-[highlighted]:bg-surface-2 data-[highlighted]:text-fg"
              >
                {item.label}
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function DesktopNav() {
  const hydrated = useHydrated();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({
    select: (s) => (hydrated ? s.location.hash.replace(/^#/, "") : ""),
  });
  const story = pathname === "/" && (!hash || hash === "about");
  const play = pathname === "/play";
  const city = CITY_PATHS.has(pathname);
  const token = pathname === "/transparency" || (pathname === "/" && FACT_HASHES.has(hash));
  const more = MORE_PATHS.has(pathname);

  return (
    <nav className="hidden items-center lg:flex">
      <Link
        to="/"
        hash="about"
        className={cn(
          "inline-flex h-11 items-center px-2.5 text-sm font-medium",
          story ? "text-fg" : "text-muted hover:text-fg",
        )}
      >
        Story
      </Link>
      <Link
        to="/play"
        className={cn(
          "inline-flex h-11 items-center px-2.5 text-sm font-medium",
          play ? "text-fg" : "text-muted hover:text-fg",
        )}
      >
        Play
      </Link>
      <NavDrop label="City" active={city} items={CITY_ITEMS} />
      <NavDrop label="Token" active={token} items={TOKEN_ITEMS} />
      <NavDrop label="More" active={more} items={MORE_ITEMS} />
    </nav>
  );
}

function SheetGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="px-3 text-[10px] font-medium tracking-[0.18em] text-subtle uppercase">{title}</p>
      <div className="mt-1 flex flex-col">{children}</div>
    </div>
  );
}

function SheetLink({
  to,
  hash,
  children,
}: {
  to: string;
  hash?: string;
  children: ReactNode;
}) {
  return (
    <SheetClose asChild>
      <Link
        to={to}
        hash={hash}
        className="inline-flex h-11 items-center px-3 text-sm font-medium text-muted hover:text-fg"
      >
        {children}
      </Link>
    </SheetClose>
  );
}

export function SiteNav() {
  const hydrated = useHydrated();
  const { user } = useCurrentUserState();
  const characterId = useDinoverse((s) => (hydrated ? s.characterId : "rex"));
  const walkAsSelf = useDinoverse((s) => (hydrated ? s.walkAsSelf : true));
  const character = CHARACTERS.find((c) => c.id === characterId) ?? null;

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-border/80 bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl min-w-0 items-center justify-between gap-2 px-4 sm:gap-3">
        <Link
          to="/"
          hash=""
          resetScroll
          aria-label="DinoVerse home"
          className="flex min-w-0 items-center gap-2 sm:gap-2.5"
          onClick={() => window.scrollTo({ top: 0 })}
        >
          <img
            src="/hero.jpg?v=5"
            alt=""
            className="size-8 shrink-0 rounded-md border border-gold/35 object-cover object-[center_18%]"
          />
          <span className="truncate font-display text-sm font-medium tracking-tight">
            {TOKEN.ticker}
          </span>
        </Link>

        <DesktopNav />

        <div className="flex min-w-0 shrink-0 items-center gap-0.5 sm:gap-1">
          <Button asChild variant="ghost" size="icon" className="hidden size-11 sm:inline-flex" aria-label="X">
            <a href={TOKEN.x} target="_blank" rel="noopener noreferrer">
              <XGlyph className="size-4" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="icon" className="hidden size-11 sm:inline-flex" aria-label="Telegram">
            <a href={TOKEN.telegram} target="_blank" rel="noopener noreferrer">
              <TelegramGlyph className="size-4" />
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
            <a href={TOKEN.buy} target="_blank" rel="noopener noreferrer">
              Buy
            </a>
          </Button>
          <Button asChild size="sm">
            <Link to="/explore">
              <span className="sm:hidden">Floor</span>
              <span className="hidden sm:inline">Explore</span>
            </Link>
          </Button>
          <AccountChip />
          {walkAsSelf ? (
            <Link
              to="/explore"
              title="Walking as you"
              className="hidden items-center gap-2 rounded-full border border-gold/30 bg-lore py-1 pr-3 pl-2 lg:flex"
            >
              <span className="grid size-7 place-items-center rounded-full bg-gold/20 text-[10px] font-medium tracking-wide text-gold uppercase">
                You
              </span>
              <span className="text-xs font-medium">Guest walk</span>
            </Link>
          ) : character ? (
            <Link
              to="/crew"
              title={`${character.name} · crew`}
              className="hidden items-center gap-2 rounded-full border border-gold/30 bg-lore py-1 pr-3 pl-1 lg:flex"
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
            <SheetContent title="Menu" side="bottom">
              <div className="flex flex-col pb-2">
                <SheetClose asChild>
                  <Button asChild size="lg" className="justify-center">
                    <Link to="/explore">Walk The Floor</Link>
                  </Button>
                </SheetClose>
                <p className="mt-2 px-1 text-xs leading-relaxed text-subtle">
                  Walk as you or pick a character. The Floor is open. The city is still being built.
                </p>
                <div className="mt-3 flex gap-2">
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="flex-1 justify-center">
                      <a href={TOKEN.buy} target="_blank" rel="noopener noreferrer">
                        Buy
                      </a>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild variant="ghost" size="icon" aria-label="X">
                      <a href={TOKEN.x} target="_blank" rel="noopener noreferrer">
                        <XGlyph className="size-4" />
                      </a>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild variant="ghost" size="icon" aria-label="Telegram">
                      <a href={TOKEN.telegram} target="_blank" rel="noopener noreferrer">
                        <TelegramGlyph className="size-4" />
                      </a>
                    </Button>
                  </SheetClose>
                </div>
                <SheetGroup title="Go">
                  <SheetLink to="/" hash="about">
                    Story
                  </SheetLink>
                  <SheetLink to="/play">Play</SheetLink>
                  <SheetLink to="/visions">Four Visions</SheetLink>
                  <SheetLink to="/canyon">Skull Gate Canyon</SheetLink>
                  <SheetLink to="/memes">Memes</SheetLink>
                  <SheetLink to="/crew">Crew</SheetLink>
                </SheetGroup>
                <SheetGroup title="Token">
                  <SheetLink to="/" hash="token">
                    Facts
                  </SheetLink>
                  <SheetLink to="/" hash="market">
                    Chart
                  </SheetLink>
                  <SheetLink to="/transparency">Locks</SheetLink>
                  <SheetLink to="/" hash="faq">
                    FAQ
                  </SheetLink>
                </SheetGroup>
                <SheetGroup title="More">
                  <SheetLink to="/worlds">Districts</SheetLink>
                  <SheetLink to="/leaderboard">Floor Board</SheetLink>
                  <SheetLink to="/fossil-tokenisation">Fossils</SheetLink>
                </SheetGroup>
                {authEnabled && !user ? (
                  <SheetClose asChild>
                    <Link
                      to="/login"
                      search={{ next: "/play" }}
                      className="inline-flex h-11 items-center px-3 text-sm font-medium text-muted"
                    >
                      Claim a name
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
