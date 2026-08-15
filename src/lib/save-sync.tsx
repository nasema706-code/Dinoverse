import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadSave, mergeSaves, upsertSave } from "@/lib/saves";
import {
  applySave,
  getSaveSnapshot,
  saveFingerprint,
  useDinoverse,
} from "@/lib/store";

async function pushSave() {
  try {
    await upsertSave({ data: getSaveSnapshot() });
  } catch {
    // Gameplay must not block on a sync blip.
  }
}

export function SaveSync({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const [bagReady, setBagReady] = useState(false);
  const lastUserId = useRef<string | undefined>(undefined);
  const readyForUser = useRef<string | null>(null);
  const lastSent = useRef<string>("");

  useEffect(() => {
    const api = useDinoverse.persist;
    if (!api?.hasHydrated) {
      setBagReady(true);
      return;
    }
    if (api.hasHydrated()) {
      setBagReady(true);
      return;
    }
    return api.onFinishHydration(() => setBagReady(true));
  }, []);

  useEffect(() => {
    if (!bagReady || isPending) return;
    if (!user) return;

    const previous = lastUserId.current;
    lastUserId.current = user.id;
    readyForUser.current = null;

    let cancelled = false;
    const shouldMerge = previous === undefined || previous === user.id;

    void (async () => {
      try {
        const remote = await loadSave();
        if (cancelled) return;
        const local = getSaveSnapshot();
        if (!remote) {
          await pushSave();
          lastSent.current = saveFingerprint(local);
        } else if (shouldMerge) {
          const merged = mergeSaves(local, remote);
          applySave(merged);
          await pushSave();
          lastSent.current = saveFingerprint(merged);
        } else {
          applySave(remote);
          lastSent.current = saveFingerprint(remote);
        }
      } catch {
        // Keep local bag if the cloud read fails.
      }
      if (!cancelled) readyForUser.current = user.id;
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, isPending, bagReady]);

  useEffect(() => {
    if (!bagReady || isPending || !user) return;
    let timer = 0;
    const unsub = useDinoverse.subscribe(() => {
      if (readyForUser.current !== user.id) return;
      const snap = getSaveSnapshot();
      const key = saveFingerprint(snap);
      if (key === lastSent.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        lastSent.current = key;
        void pushSave();
      }, 400);
    });
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, [user?.id, isPending, bagReady]);

  return <>{children}</>;
}
