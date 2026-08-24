/**
 * Local email/password sign-in (this app's Better Auth DB — not the broker).
 *
 * Enabled so the Floor Board can store high scores on a runner account.
 * Sign-up / sign-in forms use `authClient.signUp.email` / `authClient.signIn.email`.
 *
 * Do NOT edit `server.ts` for this — that file is frozen pre-wired config.
 */
export const emailAndPasswordEnabled = true;
