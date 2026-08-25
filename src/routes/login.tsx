import { useState, type FormEvent } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { authClient, authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { emailAndPasswordEnabled } from "@/lib/auth/email-password";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { TOKEN } from "@/lib/token";
import { cn } from "@/lib/utils";

const NEXT_PATHS = ["/", "/play", "/memes", "/leaderboard", "/crew", "/worlds", "/explore", "/transparency", "/fossil-tokenisation", "/admin/members"] as const;
type NextPath = (typeof NEXT_PATHS)[number];

function safeNextPath(value: unknown): NextPath {
  if (typeof value === "string" && (NEXT_PATHS as readonly string[]).includes(value)) {
    return value as NextPath;
  }
  return "/play";
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { next: NextPath; forgot?: boolean } => {
    const next = safeNextPath(search.next);
    const forgot = search.forgot === true || search.forgot === "true" || search.forgot === "1";
    return forgot ? { next, forgot: true } : { next };
  },
  component: LoginPage,
});

const fieldClass =
  "mt-1.5 h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent";

function LoginPage() {
  const { next, forgot } = Route.useSearch();
  const { user } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up" | "forgot">(forgot ? "forgot" : "in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authEnabled) {
    return <Navigate to="/" />;
  }
  if (user) {
    return <Navigate to={next} />;
  }

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") {
        const { error: signUpError } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.split("@")[0] || "Runner",
        });
        if (signUpError) throw new Error(signUpError.message ?? "Could not create the account.");
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (signInError) throw new Error(signInError.message ?? "Could not sign in.");
      }
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  const submitForgot = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: resetError } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw new Error(resetError.message ?? "Could not start a password reset.");
      toast("If that email has a Floor pass, a reset link is on the way.");
      setMode("in");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start a password reset.");
    } finally {
      setBusy(false);
    }
  };

  const submitOAuth = async (providerId: string) => {
    setError(null);
    setBusy(true);
    try {
      await signIn(providerId, { callbackURL: next, errorCallbackURL: "/login" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed.";
      setError(message);
      toast(message);
      setBusy(false);
    }
  };

  return (
    <SiteShell>
      <main className="mx-auto max-w-md min-w-0 px-4 py-8 sm:py-16">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Floor pass</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Sign in to post scores
        </h1>
        <p className="mt-4 text-muted">
          Create a runner account, then Mushroom Run high scores land on the Floor Board. Local
          bests still save on this device if you play as a guest.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-surface/80 p-5">
          {emailAndPasswordEnabled ? (
            <form
              className="space-y-3"
              onSubmit={(event) => void (mode === "forgot" ? submitForgot(event) : submitEmail(event))}
            >
              {mode !== "forgot" ? (
              <div className="flex rounded-sm border border-border p-0.5">
                <button
                  type="button"
                  className={cn(
                    "h-9 flex-1 rounded-[6px] text-sm font-medium",
                    mode === "in" ? "bg-accent text-accent-fg" : "text-muted",
                  )}
                  onClick={() => setMode("in")}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={cn(
                    "h-9 flex-1 rounded-[6px] text-sm font-medium",
                    mode === "up" ? "bg-accent text-accent-fg" : "text-muted",
                  )}
                  onClick={() => setMode("up")}
                >
                  Create account
                </button>
              </div>
              ) : (
                <p className="text-sm text-muted">
                  Enter the email on the account. We send a reset link if it exists — we will not
                  say whether it does.
                </p>
              )}
              {mode === "up" ? (
                <label className="block text-xs tracking-wide text-muted uppercase">
                  Runner name
                  <input
                    className={fieldClass}
                    autoComplete="nickname"
                    maxLength={24}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Rex Volt"
                  />
                </label>
              ) : null}
              <label className="block text-xs tracking-wide text-muted uppercase">
                Email
                <input
                  className={fieldClass}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@floor.city"
                />
              </label>
              {mode !== "forgot" ? (
              <label className="block text-xs tracking-wide text-muted uppercase">
                Password
                <input
                  className={fieldClass}
                  type="password"
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                />
              </label>
              ) : null}
              {mode === "in" ? (
                <button
                  type="button"
                  className="text-xs text-accent hover:underline"
                  onClick={() => {
                    setError(null);
                    setMode("forgot");
                  }}
                >
                  Forgot password?
                </button>
              ) : null}
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy
                  ? "Working…"
                  : mode === "up"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Send reset link"
                      : "Sign in"}
              </Button>
              {mode === "forgot" ? (
                <button
                  type="button"
                  className="w-full text-center text-xs text-muted hover:text-fg"
                  onClick={() => {
                    setError(null);
                    setMode("in");
                  }}
                >
                  Back to sign in
                </button>
              ) : null}
            </form>
          ) : null}

          {mode !== "forgot" ? (
          <div className={cn("space-y-2", emailAndPasswordEnabled ? "mt-4" : "")}>
            {emailAndPasswordEnabled ? (
              <p className="text-center text-[11px] tracking-wide text-subtle uppercase">Or continue with</p>
            ) : null}
            {GROK_PROVIDERS.map((provider) => (
              <Button
                key={provider.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                disabled={busy}
                onClick={() => void submitOAuth(provider.providerId)}
              >
                {provider.label}
              </Button>
            ))}
          </div>
          ) : null}
        </div>

        <p className="mt-6 text-sm text-subtle">
          After you sign in, run {TOKEN.ticker} on{" "}
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
