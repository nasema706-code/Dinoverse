/**
 * Sign-in emails allowed to open `/admin/members` and download the CSV.
 * Lowercase, exact match against `user.email`.
 *
 * Prefer Netlify env `ADMIN_EMAILS` (comma-separated) so you don't commit
 * addresses. This list is a fallback for local/dev.
 *
 * Server-only — do not import from client components.
 */
export const ADMIN_EMAILS: string[] = [
  // "you@gmail.com",
];
