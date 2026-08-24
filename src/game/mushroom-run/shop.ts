import { saveVault, type CharId, type Collected } from "./run-state";

export const OWNED_GEAR_KEY = "dino_run_gear";
export const LOADOUT_KEY = "dino_run_loadout";

export const ACCESSORIES = [
  { id: "tie-gold", slot: "tie", name: "Gold tape tie", cost: 14, blurb: "Close-of-day burgundy, now bullion." },
  { id: "tie-mint", slot: "tie", name: "Mint wire tie", cost: 16, blurb: "Neon edge. Same three-piece." },
  { id: "coffee", slot: "prop", name: "Desk coffee", cost: 18, blurb: "Left claw. Always hot." },
  { id: "visor", slot: "face", name: "Volt visor", cost: 24, blurb: "Signal glass over the headset." },
  { id: "chain", slot: "neck", name: "Floor chain", cost: 28, blurb: "Heavy. Sits on the collar." },
  { id: "shades", slot: "face", name: "Night shades", cost: 36, blurb: "After-hours tape." },
] as const;

export type AccId = (typeof ACCESSORIES)[number]["id"];
export type AccSlot = (typeof ACCESSORIES)[number]["slot"];

export type Loadout = {
  tie: "default" | "gold" | "mint";
  face: "none" | "visor" | "shades";
  chain: boolean;
  coffee: boolean;
};

export const DEFAULT_LOADOUT: Loadout = {
  tie: "default",
  face: "none",
  chain: false,
  coffee: false,
};

export function isAccId(value: string | null | undefined): value is AccId {
  return ACCESSORIES.some((a) => a.id === value);
}

export function loadOwnedGear(): AccId[] {
  try {
    const raw = localStorage.getItem(OWNED_GEAR_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is AccId => typeof id === "string" && isAccId(id));
  } catch {
    return [];
  }
}

function saveOwnedGear(ids: AccId[]) {
  localStorage.setItem(OWNED_GEAR_KEY, JSON.stringify(ids));
}

export function loadLoadout(): Loadout {
  try {
    const raw = localStorage.getItem(LOADOUT_KEY);
    if (!raw) return { ...DEFAULT_LOADOUT };
    const parsed = JSON.parse(raw) as Partial<Loadout>;
    return {
      tie: parsed.tie === "gold" || parsed.tie === "mint" ? parsed.tie : "default",
      face: parsed.face === "visor" || parsed.face === "shades" ? parsed.face : "none",
      chain: parsed.chain === true,
      coffee: parsed.coffee === true,
    };
  } catch {
    return { ...DEFAULT_LOADOUT };
  }
}

export function saveLoadout(next: Loadout) {
  localStorage.setItem(LOADOUT_KEY, JSON.stringify(next));
  return next;
}

export function accessoryById(id: AccId) {
  return ACCESSORIES.find((a) => a.id === id)!;
}

export function applyEquip(loadout: Loadout, id: AccId): Loadout {
  const next = { ...loadout };
  if (id === "tie-gold") next.tie = loadout.tie === "gold" ? "default" : "gold";
  if (id === "tie-mint") next.tie = loadout.tie === "mint" ? "default" : "mint";
  if (id === "visor") next.face = loadout.face === "visor" ? "none" : "visor";
  if (id === "shades") next.face = loadout.face === "shades" ? "none" : "shades";
  if (id === "chain") next.chain = !loadout.chain;
  if (id === "coffee") next.coffee = !loadout.coffee;
  return saveLoadout(next);
}

export function isEquipped(loadout: Loadout, id: AccId) {
  if (id === "tie-gold") return loadout.tie === "gold";
  if (id === "tie-mint") return loadout.tie === "mint";
  if (id === "visor") return loadout.face === "visor";
  if (id === "shades") return loadout.face === "shades";
  if (id === "chain") return loadout.chain;
  return loadout.coffee;
}

export function buyCharacter(
  _vault: number,
  _collected: Collected,
  _id: CharId,
):
  | { ok: false; reason: "owned" | "energy" }
  | { ok: true; vault: number; collected: Collected } {
  return { ok: false, reason: "owned" };
}

export function buyAccessory(
  vault: number,
  owned: AccId[],
  id: AccId,
):
  | { ok: false; reason: "owned" | "energy" }
  | { ok: true; vault: number; owned: AccId[]; loadout: Loadout } {
  const item = ACCESSORIES.find((a) => a.id === id);
  if (!item) return { ok: false, reason: "owned" };
  if (owned.includes(id)) return { ok: false, reason: "owned" };
  if (vault < item.cost) return { ok: false, reason: "energy" };
  const nextOwned = [...owned, id];
  saveOwnedGear(nextOwned);
  const nextVault = saveVault(vault - item.cost);
  const loadout = applyEquip(loadLoadout(), id);
  return { ok: true, vault: nextVault, owned: nextOwned, loadout };
}
