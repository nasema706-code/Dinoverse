import type { ReactNode } from "react";

/**
 * App-wide client provider mounted once near the root (in `src/routes/__root.tsx`).
 * Sign-in is off; local store persist is enough for guide/bag.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
