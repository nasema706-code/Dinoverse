import { useEffect, useState } from "react";
import { getFloorSession, type FloorUser } from "./floor-pass";

let cache: FloorUser | null | undefined;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function setFloorUserCache(pass: FloorUser | null) {
  cache = pass;
  emit();
}

export function useFloorUserState(): { user: FloorUser | null; isPending: boolean } {
  const [user, setUser] = useState<FloorUser | null>(() => (cache === undefined ? null : cache));
  const [isPending, setPending] = useState(cache === undefined);

  useEffect(() => {
    const sync = () => {
      setUser(cache === undefined ? null : cache);
      setPending(cache === undefined);
    };
    listeners.add(sync);
    if (cache === undefined) {
      void getFloorSession()
        .then((pass) => {
          cache = pass;
          emit();
        })
        .catch(() => {
          cache = null;
          emit();
        });
    }
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return { user, isPending };
}
