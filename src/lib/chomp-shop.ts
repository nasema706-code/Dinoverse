export const COIN_PACKS = [
  { id: "snack", name: "Snack", coins: 100, amount: 199, currency: "gbp" },
  { id: "feast", name: "Feast", coins: 550, amount: 799, currency: "gbp" },
  { id: "apex", name: "Apex", coins: 1400, amount: 1499, currency: "gbp" },
] as const;

export const POWER_SHOP = [
  { id: "bite", name: "Super bite", cost: 40, sprite: 8 },
  { id: "speed", name: "Speed boost", cost: 30, sprite: 9 },
  { id: "mega", name: "Mega score", cost: 50, sprite: 10 },
  { id: "magnet", name: "Magnet", cost: 45, sprite: 11 },
  { id: "shield", name: "Tide shield", cost: 60, sprite: 20 },
  { id: "freeze", name: "Time freeze", cost: 60, sprite: 21 },
  { id: "phase", name: "Phase veil", cost: 70, sprite: 22 },
  { id: "stomp", name: "Thunder stomp", cost: 80, sprite: 23 },
] as const;

export type CoinPackId = (typeof COIN_PACKS)[number]["id"];
export type PowerShopId = (typeof POWER_SHOP)[number]["id"];

export function coinPack(id: string) {
  return COIN_PACKS.find((pack) => pack.id === id) ?? null;
}

export function powerOffer(id: string) {
  return POWER_SHOP.find((power) => power.id === id) ?? null;
}

export function formatPackPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}
