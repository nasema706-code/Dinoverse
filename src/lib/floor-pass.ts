import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  FLOOR_NAME_MAX,
  FLOOR_PASSWORD_MAX,
  floorNameError,
  floorNameKey,
  floorPasswordError,
  normalizeFloorName,
} from "./floor-name";

const sameSite = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  assertSameSiteRequest();
  return next();
});

const claimSchema = z.object({
  name: z.string().min(1).max(FLOOR_NAME_MAX + 8),
  password: z.string().min(1).max(FLOOR_PASSWORD_MAX),
});

const enterSchema = z.object({
  name: z.string().min(1).max(FLOOR_NAME_MAX + 8),
  password: z.string().min(1).max(FLOOR_PASSWORD_MAX),
});

export type FloorUser = {
  id: string;
  name: string;
};

export const getFloorSession = createServerFn({ method: "GET" }).handler(async (): Promise<FloorUser | null> => {
  const { readFloorSessionUser } = await import("./floor-session.server");
  const user = await readFloorSessionUser();
  if (!user) return null;
  return { id: user.id, name: user.displayName };
});

export const claimFloorPass = createServerFn({ method: "POST" })
  .middleware([sameSite])
  .validator(claimSchema)
  .handler(async ({ data }): Promise<FloorUser> => {
    const error = floorNameError(data.name);
    if (error) throw new Error(error);
    const secretError = floorPasswordError(data.password, data.name);
    if (secretError) throw new Error(secretError);
    const { hashFloorKey } = await import("./floor-crypto.server");
    const { createFloorPass } = await import("./floor-store.server");
    const { writeFloorSession } = await import("./floor-session.server");
    try {
      const pass = await createFloorPass(data.name, hashFloorKey(data.password.trim()));
      await writeFloorSession(pass.id, pass.name);
      return { id: pass.id, name: pass.name };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Could not claim that name.");
    }
  });

export const enterFloorPass = createServerFn({ method: "POST" })
  .middleware([sameSite])
  .validator(enterSchema)
  .handler(async ({ data }): Promise<FloorUser> => {
    const name = normalizeFloorName(data.name);
    const password = data.password.trim();
    if (floorNameError(name)) throw new Error("Check the runner name.");
    if (!password) throw new Error("Check the password.");
    const { getPassByNameKey, touchFloorPass } = await import("./floor-store.server");
    const { verifyFloorKey } = await import("./floor-crypto.server");
    const { writeFloorSession } = await import("./floor-session.server");
    const pass = await getPassByNameKey(floorNameKey(name));
    if (!pass || !verifyFloorKey(password, pass.keyHash)) {
      throw new Error("No Floor pass matches that name and password.");
    }
    await touchFloorPass(pass.id);
    await writeFloorSession(pass.id, pass.name);
    return { id: pass.id, name: pass.name };
  });

export const leaveFloorPass = createServerFn({ method: "POST" })
  .middleware([sameSite])
  .handler(async () => {
    const { clearFloorSession } = await import("./floor-session.server");
    await clearFloorSession();
    return { ok: true as const };
  });
