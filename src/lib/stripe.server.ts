import Stripe from "stripe";
import { coinPack } from "@/lib/chomp-shop";

const INTEGRATION_ID = "dinoverse_chomp_k7mqwpxr";

let stripeClient: Stripe | null = null;

export function stripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY?.trim() || "";
}

export function stripeCheckoutReady() {
  return stripeSecretKey().length > 0;
}

export function getStripe() {
  const key = stripeSecretKey();
  if (!key) return null;
  stripeClient ??= new Stripe(key);
  return stripeClient;
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return { granted: false as const, coins: 0 };
  const pack = coinPack(session.metadata?.packId ?? "");
  const playerId = session.metadata?.playerId ?? session.client_reference_id ?? "";
  const coins = Number(session.metadata?.coins);
  if (!pack || !playerId || coins !== pack.coins) throw new Error("This payment does not match a coin pack.");
  if (session.currency !== pack.currency || session.amount_total !== pack.amount) {
    throw new Error("This payment does not match the pack price.");
  }
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const credited = await sql<{ chomp_coins: unknown }>`
    with inserted as (
      insert into apex_coin_orders (id, player_id, pack_id, coins, amount, currency)
      values (${session.id}, ${playerId}, ${pack.id}, ${pack.coins}, ${pack.amount}, ${pack.currency})
      on conflict (id) do nothing
      returning player_id, coins
    )
    update apex_players
    set chomp_coins = chomp_coins + inserted.coins
    from inserted
    where apex_players.id = inserted.player_id
    returning apex_players.chomp_coins
  `;
  return { granted: Boolean(credited[0]), coins: pack.coins };
}
