import { getRequest, useSession } from "@tanstack/react-start/server";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getSql } from "@/lib/db";

export const APEX_WORLDS = [
  "Jungle Ruins",
  "Volcano",
  "Ice Caves",
  "Space Islands",
  "Sunken Temple",
  "Amber Dunes",
  "Glowspore Grove",
  "Storm Citadel",
] as const;

const SESSION_PASSWORD = (
  (typeof process !== "undefined" && process.env.BETTER_AUTH_SECRET?.trim()) ||
  "dinoverse-apex-chomp-session-v1-chomp!!"
).padEnd(32, "!");

type ApexSessionData = { id?: string; username?: string };

function sessionSecure() {
  try {
    return new URL(getRequest().url).protocol === "https:";
  } catch {
    return false;
  }
}

async function apexSession() {
  return useSession<ApexSessionData>({
    name: "dv-apex",
    password: SESSION_PASSWORD,
    maxAge: 60 * 60 * 24 * 400,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: sessionSecure(),
      path: "/",
    },
  });
}

export function hashApexPin(pin: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pin, salt, 32);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyApexPin(pin: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(pin, Buffer.from(saltHex, "hex"), 32);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export async function readApexSession(): Promise<{ id: string; username: string } | null> {
  if (!getRequest()) return null;
  const session = await apexSession();
  if (!session.data.id || !session.data.username) return null;
  const sql = await getSql();
  const rows = await sql<{ id: string }>`select id from apex_players where id = ${session.data.id} limit 1`;
  const row = rows[0];
  if (!row) {
    await session.clear();
    return null;
  }
  return { id: session.data.id, username: session.data.username };
}

export async function writeApexSession(id: string, username: string) {
  const session = await apexSession();
  await session.update({ id, username });
}

export async function clearApexSession() {
  if (!getRequest()) return;
  const session = await apexSession();
  await session.clear();
}

export function usernameKey(name: string) {
  return name.trim().toLowerCase();
}

export function worldName(index: number) {
  return APEX_WORLDS[index] ?? "Unknown";
}
