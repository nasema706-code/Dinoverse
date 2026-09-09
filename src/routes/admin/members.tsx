import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listMemberEmails, type MemberEmailRow, type MemberExport } from "@/lib/members";

export const Route = createFileRoute("/admin/members")({
  component: MembersAdminPage,
});

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsv(rows: MemberEmailRow[]): string {
  const header = "email,name,verified,providers,createdAt";
  const lines = rows.map((row) =>
    [row.email, row.name, row.verified ? "yes" : "no", row.providers.join("+"), row.createdAt]
      .map(csvEscape)
      .join(","),
  );
  return [header, ...lines].join("\n");
}

function downloadCsv(rows: MemberEmailRow[]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dinoverse-members-${stamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function MembersAdminPage() {
  const { user, isPending } = useCurrentUserState();
  const [pack, setPack] = useState<MemberExport | null>(null);

  useEffect(() => {
    if (isPending) return;
    let cancelled = false;
    void listMemberEmails()
      .then((next) => {
        if (!cancelled) setPack(next);
      })
      .catch(() => {
        if (!cancelled) setPack({ status: "unauthorized" });
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, isPending]);

  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl min-w-0 px-4 py-8 sm:py-12">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Private</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Member emails
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Email/password and Google accounts only. X sign-ins are skipped. Not linked from the
          public nav.
        </p>

        {isPending || pack === null ? (
          <p className="mt-8 text-sm text-muted">Checking access…</p>
        ) : pack.status === "unauthorized" ? (
          <div className="mt-8 space-y-3">
            <p className="text-sm text-muted">Sign in with an allowlisted account to open this list.</p>
            {authEnabled ? (
              <Button asChild>
                <Link to="/login" search={{ next: "/admin/members" }}>
                  Sign in
                </Link>
              </Button>
            ) : null}
          </div>
        ) : pack.status === "setup" ? (
          <div className="mt-8 space-y-3 rounded-xl border border-border bg-surface p-5 text-sm text-muted">
            <p>
              No admin emails are configured yet. You are signed in as{" "}
              <span className="font-mono text-fg">{pack.yourEmail || "an account with no email"}</span>.
            </p>
            <p>
              Add that address to the Netlify env <span className="font-mono text-fg">ADMIN_EMAILS</span>{" "}
              (comma-separated if more than one), or put it in{" "}
              <span className="font-mono text-fg">src/lib/admin-emails.server.ts</span>, then reload.
            </p>
          </div>
        ) : pack.status === "forbidden" ? (
          <p className="mt-8 text-sm text-muted">This account cannot open the member list.</p>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">{pack.rows.length} real inbox{pack.rows.length === 1 ? "" : "es"}</p>
              <Button type="button" disabled={pack.rows.length === 0} onClick={() => downloadCsv(pack.rows)}>
                Download CSV
              </Button>
            </div>
            {pack.rows.length === 0 ? (
              <p className="text-sm text-muted">No Google or email/password accounts yet.</p>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                {pack.rows.map((row) => (
                  <li key={row.email} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm text-fg">{row.email}</p>
                      <p className="text-xs text-muted">{row.name}</p>
                    </div>
                    <p className="shrink-0 text-[11px] tracking-wide text-subtle uppercase">
                      {row.providers.join(" · ")}
                      {row.verified ? " · verified" : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </SiteShell>
  );
}
