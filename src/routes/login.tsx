import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <SiteShell>
      <main className="grid min-h-[calc(100dvh-8rem)] place-items-center px-4 py-12">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6">
          <p className="text-xs tracking-wide text-muted uppercase">Crew gate</p>
          <h1 className="mt-2 font-display text-2xl font-medium">Sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Keep a guide and a bag across visits. Google or X.
          </p>
          <div className="mt-6 space-y-2">
            {authEnabled ? (
              GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                >
                  Continue with {p.label}
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted">Sign-in is disabled.</p>
            )}
          </div>
          <Link to="/" className="mt-6 inline-flex h-11 items-center text-sm text-muted hover:text-fg">
            Back to the city
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
