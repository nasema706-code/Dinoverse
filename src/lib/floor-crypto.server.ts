import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { normalizeFloorKey } from "./floor-name";

export function hashFloorKey(key: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(key, salt, 32);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function scryptMatches(secret: string, stored: string): boolean {
  if (!secret) return false;
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(secret, Buffer.from(saltHex, "hex"), 32);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

/** Player password, or a legacy minted Dino Floor key. */
export function verifyFloorKey(key: string, stored: string): boolean {
  const trimmed = key.trim();
  if (scryptMatches(trimmed, stored)) return true;
  const asLegacy = normalizeFloorKey(trimmed);
  if (asLegacy && asLegacy !== trimmed) return scryptMatches(asLegacy, stored);
  return false;
}
