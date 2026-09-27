import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const sameSite = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  assertSameSiteRequest();
  return next();
});

const usernameSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_]{3,16}$/, "Use 3–16 letters, numbers, or underscores.");

const pinSchema = z.string().regex(/^\d{4}$/, "The code is 4 digits.");

const authSchema = z.object({
  username: usernameSchema,
  pin: pinSchema,
});

const progressSchema = z.object({
  best: z.number().int().min(0).max(9_999_999),
  completed: z.array(z.number().int().min(0).max(7)).max(8),
  skin: z.number().int().min(0).max(7),
  world: z.number().int().min(0).max(7),
  sound: z.boolean(),
});

const packSchema = z.object({
  packId: z.enum(["snack", "feast", "apex"]),
});

const confirmSchema = z.object({
  sessionId: z.string().startsWith("cs_").max(255),
});

const powerBuySchema = z.object({
  powerId: z.enum(["bite", "speed", "mega", "magnet", "shield", "freeze", "phase", "stomp"]),
});

const syncSchema = z.object({
  progress: progressSchema,
  run: z
    .object({
      score: z.number().int().min(0).max(9_999_999),
      world: z.number().int().min(0).max(7),
      outcome: z.enum(["over", "won"]),
    })
    .nullable(),
});

export type ApexAccount = {
  id: string;
  username: string;
  best: number;
  worldsCleared: number;
  runs: number;
  coins: number;
};

export type ApexShop = {
  checkoutReady: boolean;
  coins: number;
  packs: { id: string; name: string; coins: number; amount: number; currency: string }[];
  powers: { id: string; name: string; cost: number; charges: number; sprite: number }[];
};

export type ApexBoardRow = {
  rank: number;
  username: string;
  best: number;
  worldsCleared: number;
  runs: number;
  isYou: boolean;
};

export type ApexRunRow = {
  id: string;
  score: number;
  worldIndex: number;
  worldName: string;
  outcome: "over" | "won";
  at: string;
};

export type ApexBoard = {
  account: ApexAccount | null;
  rows: ApexBoardRow[];
  history: ApexRunRow[];
  shop: ApexShop;
  progress: {
    best: number;
    completed: number[];
    skin: number;
    world: number;
    sound: boolean;
  } | null;
};

function num(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asAccount(row: {
  id: string;
  username: string;
  best_score: unknown;
  worlds_cleared: unknown;
  runs: unknown;
  chomp_coins?: unknown;
}): ApexAccount {
  return {
    id: row.id,
    username: row.username,
    best: num(row.best_score),
    worldsCleared: num(row.worlds_cleared),
    runs: num(row.runs),
    coins: num(row.chomp_coins),
  };
}

export const apexBoard = createServerFn({ method: "GET" }).handler(async (): Promise<ApexBoard> => {
  const { readApexSession, worldName } = await import("./apex-session.server");
  const { getSql } = await import("@/lib/db");
  const me = await readApexSession();
  const sql = await getSql();
  const ranked = await sql<{
    id: string;
    username: string;
    best_score: unknown;
    worlds_cleared: unknown;
    runs: unknown;
  }>`
    select id, username, best_score, worlds_cleared, runs
    from apex_players
    where runs > 0
    order by best_score desc, last_seen_at asc
    limit 20
  `;
  let history: ApexRunRow[] = [];
  let account: ApexAccount | null = null;
  let progress: ApexBoard["progress"] = null;
  if (me) {
    const mine = await sql<{
      id: string;
      username: string;
      best_score: unknown;
      worlds_cleared: unknown;
      runs: unknown;
      chomp_coins: unknown;
      progress_json: string;
    }>`select id, username, best_score, worlds_cleared, runs, chomp_coins, progress_json from apex_players where id = ${me.id} limit 1`;
    const row = mine[0];
    if (row) {
      account = asAccount(row);
      try {
        const parsed = progressSchema.safeParse(JSON.parse(row.progress_json));
        progress = parsed.success ? parsed.data : null;
      } catch {
        progress = null;
      }
    }
    const runs = await sql<{
      id: string;
      score: unknown;
      world_index: unknown;
      world_name: string;
      outcome: string;
      created_at: string | Date;
    }>`
      select id, score, world_index, world_name, outcome, created_at
      from apex_runs
      where player_id = ${me.id}
      order by created_at desc
      limit 40
    `;
    history = runs.map((run) => ({
      id: run.id,
      score: num(run.score),
      worldIndex: num(run.world_index),
      worldName: run.world_name || worldName(num(run.world_index)),
      outcome: run.outcome === "won" ? "won" : "over",
      at: new Date(run.created_at).toISOString(),
    }));
  }
  const { COIN_PACKS, POWER_SHOP } = await import("./chomp-shop");
  const { stripeCheckoutReady } = await import("./stripe.server");
  const held = new Map<string, number>();
  if (me) {
    const stock = await sql<{ power_id: string; charges: unknown }>`
      select power_id, charges from apex_powerups where player_id = ${me.id}
    `;
    for (const item of stock) held.set(item.power_id, num(item.charges));
  }
  return {
    account,
    progress,
    history,
    shop: {
      checkoutReady: stripeCheckoutReady(),
      coins: account?.coins ?? 0,
      packs: COIN_PACKS.map((pack) => ({ ...pack })),
      powers: POWER_SHOP.map((power) => ({ ...power, charges: held.get(power.id) ?? 0 })),
    },
    rows: ranked.map((row, i) => ({
      rank: i + 1,
      username: row.username,
      best: num(row.best_score),
      worldsCleared: num(row.worlds_cleared),
      runs: num(row.runs),
      isYou: Boolean(me && row.id === me.id),
    })),
  };
});

export const apexRegister = createServerFn({ method: "POST" })
  .middleware([sameSite])
  .validator(authSchema)
  .handler(async ({ data }): Promise<ApexAccount> => {
    const { hashApexPin, usernameKey, writeApexSession } = await import("./apex-session.server");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const key = usernameKey(data.username);
    const taken = await sql<{ id: string }>`select id from apex_players where username_key = ${key} limit 1`;
    if (taken[0]) throw new Error("That name is already taken.");
    const id = crypto.randomUUID();
    const username = data.username.trim();
    try {
      await sql`
        insert into apex_players (id, username, username_key, pin_hash)
        values (${id}, ${username}, ${key}, ${hashApexPin(data.pin)})
      `;
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("apex_players_username_key") || message.includes("duplicate") || message.includes("unique")) {
        throw new Error("That name is already taken.");
      }
      throw new Error("Could not create that hunter.");
    }
    await writeApexSession(id, username);
    return { id, username, best: 0, worldsCleared: 0, runs: 0, coins: 0 };
  });

export const apexLogin = createServerFn({ method: "POST" })
  .middleware([sameSite])
  .validator(authSchema)
  .handler(async ({ data }): Promise<ApexAccount> => {
    const { usernameKey, verifyApexPin, writeApexSession } = await import("./apex-session.server");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      username: string;
      pin_hash: string;
      best_score: unknown;
      worlds_cleared: unknown;
      runs: unknown;
      chomp_coins: unknown;
      fail_count: unknown;
      locked_until: string | Date | null;
    }>`
      select id, username, pin_hash, best_score, worlds_cleared, runs, chomp_coins, fail_count, locked_until
      from apex_players where username_key = ${usernameKey(data.username)} limit 1
    `;
    const row = rows[0];
    if (!row) throw new Error("That name and code do not match.");
    if (row.locked_until && new Date(row.locked_until).getTime() > Date.now()) {
      throw new Error("Too many tries. Wait a few minutes, then use your code again.");
    }
    if (!verifyApexPin(data.pin, row.pin_hash)) {
      const fails = num(row.fail_count) + 1;
      const lock = fails >= 8 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
      await sql`
        update apex_players
        set fail_count = ${fails}, locked_until = ${lock}
        where id = ${row.id}
      `;
      throw new Error("That name and code do not match.");
    }
    await sql`
      update apex_players
      set fail_count = 0, locked_until = null, last_seen_at = now()
      where id = ${row.id}
    `;
    await writeApexSession(row.id, row.username);
    return asAccount(row);
  });

export const apexLogout = createServerFn({ method: "POST" })
  .middleware([sameSite])
  .handler(async () => {
    const { clearApexSession } = await import("./apex-session.server");
    await clearApexSession();
    return { ok: true as const };
  });

export const apexSync = createServerFn({ method: "POST" })
  .middleware([sameSite])
  .validator(syncSchema)
  .handler(async ({ data }) => {
    const { readApexSession, worldName } = await import("./apex-session.server");
    const { getSql } = await import("@/lib/db");
    const me = await readApexSession();
    if (!me) throw new Error("Sign in to save this run.");
    const sql = await getSql();
    const current = await sql<{ best_score: unknown; worlds_cleared: unknown; runs: unknown; progress_json: string }>`
      select best_score, worlds_cleared, runs, progress_json from apex_players where id = ${me.id} limit 1
    `;
    const row = current[0];
    if (!row) throw new Error("Sign in to save this run.");
    const completed = [...new Set(data.progress.completed)].sort((a, b) => a - b);
    const best = Math.max(num(row.best_score), data.progress.best, data.run?.score ?? 0);
    const worlds = Math.max(num(row.worlds_cleared), completed.length);
    const runs = num(row.runs) + (data.run ? 1 : 0);
    const progress = { ...data.progress, best, completed };
    await sql`
      update apex_players
      set best_score = ${best},
          worlds_cleared = ${worlds},
          runs = ${runs},
          progress_json = ${JSON.stringify(progress)},
          last_seen_at = now()
      where id = ${me.id}
    `;
    if (data.run) {
      await sql`
        insert into apex_runs (id, player_id, score, world_index, world_name, outcome)
        values (
          ${crypto.randomUUID()},
          ${me.id},
          ${data.run.score},
          ${data.run.world},
          ${worldName(data.run.world)},
          ${data.run.outcome}
        )
      `;
    }
    const rankRows = await sql<{ rank: unknown }>`
      select count(*) + 1 as rank
      from apex_players
      where runs > 0 and best_score > ${best}
    `;
    return {
      username: me.username,
      best,
      worldsCleared: worlds,
      runs,
      rank: num(rankRows[0]?.rank) || 1,
      savedRun: Boolean(data.run),
    };
  });

export const apexCheckout = createServerFn({ method: "POST" })
  .middleware([sameSite])
  .validator(packSchema)
  .handler(async ({ data }) => {
    const { readApexSession } = await import("./apex-session.server");
    const { coinPack } = await import("./chomp-shop");
    const { getStripe } = await import("./stripe.server");
    const { getRequest } = await import("@tanstack/react-start/server");
    const me = await readApexSession();
    if (!me) throw new Error("Sign in before buying Chomp Coins.");
    const stripe = getStripe();
    if (!stripe) throw new Error("Add a Stripe restricted test key before checkout can start.");
    const pack = coinPack(data.packId);
    if (!pack) throw new Error("That coin pack is not for sale.");
    const origin = new URL(getRequest().url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: me.id,
      metadata: { playerId: me.id, packId: pack.id, coins: String(pack.coins) },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: pack.currency,
            unit_amount: pack.amount,
            product_data: {
              name: `${pack.coins} Chomp Coins`,
              description: `${pack.name} pack. Spend coins on Apex Chomp power-ups.`,
            },
          },
        },
      ],
      success_url: `${origin}/apex-chomp?coins=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/apex-chomp?coins=cancel`,
      integration_identifier: "dinoverse_chomp_k7mqwpxr",
    });
    if (!session.url) throw new Error("Stripe did not start checkout.");
    return { url: session.url };
  });

export const apexConfirmCheckout = createServerFn({ method: "POST" })
  .middleware([sameSite])
  .validator(confirmSchema)
  .handler(async ({ data }) => {
    const { readApexSession } = await import("./apex-session.server");
    const { getStripe, fulfillCheckoutSession } = await import("./stripe.server");
    const me = await readApexSession();
    if (!me) throw new Error("Sign in to collect these coins.");
    const stripe = getStripe();
    if (!stripe) throw new Error("Stripe is not ready.");
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    const playerId = session.metadata?.playerId ?? session.client_reference_id;
    if (playerId !== me.id) throw new Error("This payment belongs to another hunter.");
    return fulfillCheckoutSession(session);
  });

export const apexBuyPower = createServerFn({ method: "POST" })
  .middleware([sameSite])
  .validator(powerBuySchema)
  .handler(async ({ data }) => {
    const { readApexSession } = await import("./apex-session.server");
    const { powerOffer } = await import("./chomp-shop");
    const { getSql } = await import("@/lib/db");
    const me = await readApexSession();
    if (!me) throw new Error("Sign in to spend Chomp Coins.");
    const power = powerOffer(data.powerId);
    if (!power) throw new Error("That power-up is not for sale.");
    const sql = await getSql();
    const paid = await sql<{ chomp_coins: unknown }>`
      update apex_players
      set chomp_coins = chomp_coins - ${power.cost}
      where id = ${me.id} and chomp_coins >= ${power.cost}
      returning chomp_coins
    `;
    if (!paid[0]) throw new Error("Not enough Chomp Coins.");
    const stock = await sql<{ charges: unknown }>`
      insert into apex_powerups (player_id, power_id, charges)
      values (${me.id}, ${power.id}, 1)
      on conflict (player_id, power_id)
      do update set charges = apex_powerups.charges + 1
      returning charges
    `;
    return { coins: num(paid[0].chomp_coins), charges: num(stock[0]?.charges), power: power.name };
  });
