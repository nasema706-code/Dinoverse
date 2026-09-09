export const FLOOR_NAME_MIN = 3;
export const FLOOR_NAME_MAX = 20;
export const FLOOR_PASSWORD_MIN = 8;
export const FLOOR_PASSWORD_MAX = 64;

const RESERVED = new Set(["admin", "guest", "dev-user", "dinoverse", "floor", "runner"]);

export function normalizeFloorName(raw: string): string {
  return raw.replace(/[<>]/g, "").replace(/[\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
}

export function floorNameKey(name: string): string {
  return normalizeFloorName(name).toLowerCase();
}

export function floorNameError(raw: string): string | null {
  const name = normalizeFloorName(raw);
  if (name.length < FLOOR_NAME_MIN) return "Pick a name of at least 3 characters.";
  if (name.length > FLOOR_NAME_MAX) return "Keep the name to 20 characters.";
  if (!/^[\p{L}\p{N} _.-]+$/u.test(name)) {
    return "Use letters, numbers, spaces, dots, hyphens or underscores.";
  }
  if (RESERVED.has(floorNameKey(name))) return "That name is reserved.";
  return null;
}

export function normalizeFloorKey(raw: string): string {
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = compact.startsWith("DINO") ? compact.slice(4) : compact;
  if (body.length !== 12) return "";
  return `DINO-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

export function floorPasswordError(raw: string, runnerName = ""): string | null {
  const password = raw.trim();
  if (password.length < FLOOR_PASSWORD_MIN) return "Use at least 8 characters.";
  if (password.length > FLOOR_PASSWORD_MAX) return "Keep the password to 64 characters.";
  if (/\s/.test(password)) return "Skip spaces in the password.";
  const name = floorNameKey(runnerName);
  if (name && password.toLowerCase() === name) return "Don't use your runner name as the password.";
  return null;
}
