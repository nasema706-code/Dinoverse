import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { claimFloorPass, enterFloorPass } from "@/lib/floor-pass";
import { setFloorUserCache } from "@/lib/floor-session";
import { FLOOR_NAME_MAX, FLOOR_PASSWORD_MAX, floorPasswordError, normalizeFloorName } from "@/lib/floor-name";
import { TOKEN } from "@/lib/token";
import { cn } from "@/lib/utils";

const NEXT_PATHS = ["/", "/play", "/memes", "/leaderboard", "/crew", "/worlds", "/explore", "/transparency", "/fossil-tokenisation", "/admin/members"] as const;
type NextPath = (typeof NEXT_PATHS)[number];
const SAVED_KEY = "dv-floor-pass";

function safeNextPath(value: unknown): NextPath {
  if (typeof value === "string" && (NEXT_PATHS as readonly string[]).includes(value)) {
    return value as NextPath;
  }
  return "/play";
}

function readSavedPass(): { name: string; key: string } | null {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: unknown; key?: unknown };
    if (typeof parsed.name !== "string") return null;
    return { name: parsed.name, key: typeof parsed.key === "string" ? parsed.key : "" };
  } catch {
    return null;
  }
}

function writeSavedName(name: string) {
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify({ name }));
  } catch {
    /* storage blocked */
  }
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { next: NextPath } => ({
    next: safeNextPath(search.next),
  }),
  component: LoginPage,
});

const fieldClass =
  "mt-1.5 h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent";

function LoginPage() {
  const { next } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"claim" | "return">("claim");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = readSavedPass();
    if (!saved) return;
    setName(saved.name);
    if (saved.key) setPassword(saved.key);
    setMode("return");
  }, []);

  if (!authEnabled) {
    return <Navigate to="/" />;
  }
  if (isPending) {
    return (
      <SiteShell>
        <main className="mx-auto max-w-md px-4 py-16">
          <p className="text-sm text-muted">Checking the Floor pass…</p>
        </main>
      </SiteShell>
    );
  }
  if (user) {
    return <Navigate to={next} />;
  }

  const submitClaim = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const secretError = floorPasswordError(password, name);
    if (secretError) {
      setError(secretError);
      return;
    }
    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const pass = await claimFloorPass({ data: { name, password } });
      writeSavedName(pass.name);
      setFloorUserCache(pass);
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not claim that name.");
    } finally {
      setBusy(false);
    }
  };

  const submitReturn = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const pass = await enterFloorPass({ data: { name, password } });
      writeSavedName(pass.name);
      setFloorUserCache(pass);
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open that Floor pass.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteShell>
      <main className="mx-auto max-w-md min-w-0 px-4 py-8 sm:py-16">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Floor pass</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Claim a runner name
        </h1>
        <p className="mt-4 text-muted">
          Pick a unique name and your own password. That name is yours for Mushroom Run scores. Once
          claimed, nobody else can take it.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-surface/80 p-5">
          <div className="flex rounded-sm border border-border p-0.5">
            <button
              type="button"
              className={cn(
                "h-9 flex-1 rounded-[6px] text-sm font-medium",
                mode === "claim" ? "bg-accent text-accent-fg" : "text-muted",
              )}
              onClick={() => {
                setError(null);
                setMode("claim");
              }}
            >
              New name
            </button>
            <button
              type="button"
              className={cn(
                "h-9 flex-1 rounded-[6px] text-sm font-medium",
                mode === "return" ? "bg-accent text-accent-fg" : "text-muted",
              )}
              onClick={() => {
                setError(null);
                setMode("return");
              }}
            >
              I have a password
            </button>
          </div>

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => void (mode === "claim" ? submitClaim(event) : submitReturn(event))}
          >
            <label className="block text-xs tracking-wide text-muted uppercase">
              Runner name
              <input
                className={fieldClass}
                autoComplete="username"
                maxLength={FLOOR_NAME_MAX}
                value={name}
                onChange={(event) => setName(normalizeFloorName(event.target.value))}
                placeholder="Rex Volt"
                required
              />
            </label>
            <label className="block text-xs tracking-wide text-muted uppercase">
              Password
              <input
                className={fieldClass}
                type="password"
                autoComplete={mode === "claim" ? "new-password" : "current-password"}
                maxLength={FLOOR_PASSWORD_MAX}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === "claim" ? "At least 8 characters" : "Your password"}
                required
              />
            </label>
            {mode === "claim" ? (
              <label className="block text-xs tracking-wide text-muted uppercase">
                Confirm password
                <input
                  className={fieldClass}
                  type="password"
                  autoComplete="new-password"
                  maxLength={FLOOR_PASSWORD_MAX}
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="Type it again"
                  required
                />
              </label>
            ) : (
              <p className="text-xs text-subtle">
                Older passes that still use a Dino Floor key can enter that key here.
              </p>
            )}
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Working…" : mode === "claim" ? "Claim this name" : "Enter the Floor"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-sm text-subtle">
          After you claim a name, run {TOKEN.ticker} on{" "}
          <Link to="/play" className="text-accent hover:underline">
            Play
          </Link>{" "}
          and check the{" "}
          <Link to="/leaderboard" className="text-accent hover:underline">
            Floor Board
          </Link>
          .
        </p>
      </main>
    </SiteShell>
  );
}
