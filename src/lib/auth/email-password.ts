/**
 * Local email/password sign-in (this app's Better Auth DB — not the broker).
 *
 * Off. Runner identity is a unique Floor name + password (`/login`).
 * Do NOT rewrite `server.ts` to add email back — flip this flag only.
 */
export const emailAndPasswordEnabled = false;
