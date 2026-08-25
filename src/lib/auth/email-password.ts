/**
 * Local email/password sign-in (this app's Better Auth DB — not the broker).
 *
 * Enabled so the Floor Board can store high scores on a runner account.
 * Sign-up / sign-in forms use `authClient.signUp.email` / `authClient.signIn.email`.
 * Password reset uses `sendResetPasswordEmail` from `./send-reset-email.server`
 * (wired in `server.ts`).
 *
 * Do NOT rewrite the rest of `server.ts` for this — that file is frozen pre-wired config.
 */
export const emailAndPasswordEnabled = true;
