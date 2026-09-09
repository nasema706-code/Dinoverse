import { getRequest, useSession } from "@tanstack/react-start/server";
import { getPassById } from "./floor-store.server";

const SESSION_PASSWORD = (
  (typeof process !== "undefined" && process.env.FLOOR_PASS_SECRET?.trim()) ||
  (typeof process !== "undefined" && process.env.BETTER_AUTH_SECRET?.trim()) ||
  "dinoverse-floor-session-v1-c9a45a-rex-volt-key!!"
).padEnd(32, "!");

type FloorSessionData = { id?: string; name?: string };

async function floorSession() {
  return useSession<FloorSessionData>({
    name: "dv-floor",
    password: SESSION_PASSWORD,
    maxAge: 60 * 60 * 24 * 400,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    },
  });
}

export async function readFloorSessionUser(): Promise<{
  id: string;
  email: null;
  displayName: string;
} | null> {
  if (!getRequest()) return null;
  const session = await floorSession();
  const id = session.data.id;
  const name = session.data.name;
  if (!id || !name) return null;
  const pass = await getPassById(id);
  if (!pass) {
    await session.clear();
    return null;
  }
  return { id: pass.id, email: null, displayName: pass.name };
}

export async function writeFloorSession(id: string, name: string): Promise<void> {
  const session = await floorSession();
  await session.update({ id, name });
}

export async function clearFloorSession(): Promise<void> {
  if (!getRequest()) return;
  const session = await floorSession();
  await session.clear();
}
