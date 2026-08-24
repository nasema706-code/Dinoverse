import type { ReactNode } from "react";

/**
 * App-wide client provider mounted once near the root (in `src/routes/__root.tsx`).
 * Session state lives on the Better Auth client; this wrapper is the required mount point.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
