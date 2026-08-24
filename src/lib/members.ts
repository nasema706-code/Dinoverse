import { createMiddleware, createServerFn } from "@tanstack/react-start";

const REAL_PROVIDERS = ["credential", "grok-google"] as const;

export type MemberEmailRow = {
  email: string;
  name: string;
  verified: boolean;
  providers: string[];
  createdAt: string;
};

export type MemberExport =
  | { status: "unauthorized" }
  | { status: "setup"; yourEmail: string | null }
  | { status: "forbidden" }
  | { status: "ok"; rows: MemberEmailRow[] };

const withOptionalSession = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    return next({ context: { bearerToken: context.bearerToken as string | undefined } });
  });

function splitEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function isRealInbox(email: string): boolean {
  const value = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  if (value.endsWith(".invalid")) return false;
  if (value.endsWith("@twitter.com") || value.endsWith("@x.com")) return false;
  if (value.includes("noreply") || value.includes("no-reply")) return false;
  return true;
}

function providerLabel(id: string): string {
  if (id === "credential") return "email";
  if (id === "grok-google") return "google";
  return id;
}

export const listMemberEmails = createServerFn({ method: "GET" })
  .middleware([withOptionalSession])
  .handler(async ({ context }): Promise<MemberExport> => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const me = await getSessionUser(context.bearerToken);
    if (!me) return { status: "unauthorized" };

    const { ADMIN_EMAILS } = await import("@/lib/admin-emails.server");
    const allow = [
      ...ADMIN_EMAILS.map((email) => email.trim().toLowerCase()).filter(Boolean),
      ...splitEmails(process.env.ADMIN_EMAILS),
      ...splitEmails(process.env.ADMIN_EMAIL),
    ];
    const mine = (me.email ?? "").trim().toLowerCase();
    if (allow.length === 0) return { status: "setup", yourEmail: mine || null };
    if (!mine || !allow.includes(mine)) return { status: "forbidden" };

    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const raw = await sql<{
      name: string;
      email: string;
      email_verified: boolean | string;
      created_at: string | Date;
      provider: string;
    }>`
      select
        u.name,
        u.email,
        u."emailVerified" as email_verified,
        u."createdAt" as created_at,
        a."providerId" as provider
      from "user" u
      inner join "account" a on a."userId" = u.id
      where a."providerId" in ('credential', 'grok-google')
      order by u."createdAt" desc
    `;

    const byEmail = new Map<string, MemberEmailRow>();
    for (const row of raw) {
      const email = (row.email ?? "").trim();
      if (!isRealInbox(email)) continue;
      const provider = REAL_PROVIDERS.includes(row.provider as (typeof REAL_PROVIDERS)[number])
        ? providerLabel(row.provider)
        : null;
      if (!provider) continue;
      const key = email.toLowerCase();
      const created =
        row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at);
      const existing = byEmail.get(key);
      if (existing) {
        if (!existing.providers.includes(provider)) existing.providers.push(provider);
        continue;
      }
      byEmail.set(key, {
        email,
        name: row.name || email.split("@")[0] || "Runner",
        verified: row.email_verified === true || row.email_verified === "t",
        providers: [provider],
        createdAt: created,
      });
    }

    return { status: "ok", rows: [...byEmail.values()] };
  });
