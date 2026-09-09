import { createServerFn } from "@tanstack/react-start";
import { TOKEN } from "@/lib/token";

export type MarketTape = {
  price: string;
  marketCap: string;
  liquidity: string;
  volume: string;
  change: string;
  changePositive: boolean | null;
  txns: string;
  pairUrl: string;
  fetchedAt: number;
};

function money(n: number | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toPrecision(3)}`;
}

function compactPrice(n: number | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1) return `$${n.toFixed(2)}`;
  const digits = n >= 0.0001 ? 6 : 8;
  return `$${n.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "")}`;
}

type DexPair = {
  dexId?: string;
  url?: string;
  priceUsd?: string;
  marketCap?: number;
  fdv?: number;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
};

export const loadMarketTape = createServerFn({ method: "GET" }).handler(async (): Promise<MarketTape | null> => {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN.ca}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { pairs?: DexPair[] };
  const pairs = body.pairs ?? [];
  const pair =
    pairs.find((item) => item.dexId === "pumpswap") ??
    pairs.find((item) => item.url?.includes("d4ej9orc39h6yjyglhppamjtncxkn4ty6fyn3vnbkyqp")) ??
    pairs[0];
  if (!pair) return null;
  const buys = pair.txns?.h24?.buys ?? 0;
  const sells = pair.txns?.h24?.sells ?? 0;
  const change = pair.priceChange?.h24;
  return {
    price: compactPrice(pair.priceUsd ? Number(pair.priceUsd) : undefined),
    marketCap: money(pair.marketCap ?? pair.fdv),
    liquidity: money(pair.liquidity?.usd),
    volume: money(pair.volume?.h24),
    change: change == null || !Number.isFinite(change) ? "—" : `${change > 0 ? "+" : ""}${change.toFixed(2)}%`,
    changePositive: change == null ? null : change >= 0,
    txns: String(buys + sells),
    pairUrl: pair.url ?? TOKEN.dexscreener,
    fetchedAt: Date.now(),
  };
});
