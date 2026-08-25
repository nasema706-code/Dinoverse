import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): { token: string; error: string } => ({
    token: typeof search.token === "string" ? search.token : "",
    error: typeof search.error === "string" ? search.error : "",
  }),
  component: ResetPasswordPage,
});

const fieldClass =
  "mt-1.5 h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent";

function ResetPasswordPage() {
  const { token, error: tokenError } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    tokenError === "INVALID_TOKEN" ? "That reset link is invalid or expired." : null,
  );
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError("That reset link is missing a token. Request a new one.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (resetError) throw new Error(resetError.message ?? "Could not reset that password.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset that password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteShell>
      <main className="mx-auto max-w-md min-w-0 px-4 py-8 sm:py-16">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Floor pass</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Choose a new password
        </h1>
        <p className="mt-4 text-muted">
          This only works for email accounts. Google and X sign-ins do not use a password here.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-surface/80 p-5">
          {done ? (
            <div className="space-y-4">
              <p className="text-sm text-fg">Password saved. Sign in with the new one.</p>
              <Button asChild className="w-full">
                <Link to="/login" search={{ next: "/play" }}>
                  Sign in
                </Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={(event) => void submit(event)}>
              <label className="block text-xs tracking-wide text-muted uppercase">
                New password
                <input
                  className={fieldClass}
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                />
              </label>
              <label className="block text-xs tracking-wide text-muted uppercase">
                Confirm password
                <input
                  className={fieldClass}
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                />
              </label>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy || !token}>
                {busy ? "Saving…" : "Save password"}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-sm text-subtle">
          Need a new link?{" "}
          <Link to="/login" search={{ next: "/play", forgot: true }} className="text-accent hover:underline">
            Request a reset
          </Link>
          .
        </p>
      </main>
    </SiteShell>
  );
}
