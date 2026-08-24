import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { sanitizeRunnerName } from "@/lib/leaderboard";

export const MEME_WALL_LIMIT = 36;
export const MEME_MAX_PER_USER = 30;
export const MEME_IMAGE_MAX = 900_000;
export const MEME_CANVAS = 1000;

export type MemeView = "generator" | "wall" | "trending" | "mine";

export const MEME_VIEWS = ["generator", "wall", "trending", "mine"] as const;

export function isMemeView(value: string | null | undefined): value is MemeView {
  return MEME_VIEWS.includes(value as MemeView);
}

export type MemeTemplate = {
  id: string;
  name: string;
  url: string;
};

export const MEME_TEMPLATES: MemeTemplate[] = [
  { id: "floor", name: "Rex Volt · The Floor", url: "/life/corporate.jpg" },
  { id: "tape", name: "Trading Desk", url: "/life/finance.jpg" },
  { id: "ops", name: "Analyst Floor", url: "/life/analysis.jpg" },
  { id: "build", name: "Build Floor", url: "/life/office.jpg" },
  { id: "hq", name: "HQ Plaza", url: "/life/hq.jpg" },
  { id: "desk", name: "Dino-Sec", url: "/life/security.jpg" },
  { id: "mart", name: "Dino Mart", url: "/life/mart.jpg" },
  { id: "mac", name: "Dino Mac", url: "/life/mac-street.jpg" },
  { id: "coffee", name: "Jurassic Blend", url: "/life/coffee.jpg" },
  { id: "mall", name: "Mega Mall", url: "/life/mega-mall.jpg" },
  { id: "fit", name: "Dino Fit", url: "/life/gym.jpg" },
  { id: "coliseum", name: "Jurassic Coliseum", url: "/life/football.jpg" },
  { id: "rex", name: "Rex Volt", url: "/characters/rex/full.png" },
  { id: "rex-run", name: "Rex on the tape", url: "/game/rex-volt.jpg" },
];

export type MemeCard = {
  id: string;
  creatorName: string;
  topText: string;
  bottomText: string;
  imageData: string;
  likes: number;
  liked: boolean;
  isYours: boolean;
  createdAt: string;
};

const listSchema = z.object({
  sort: z.enum(["new", "likes", "mine"]),
});

const postSchema = z.object({
  topText: z.string().max(140),
  bottomText: z.string().max(140),
  imageData: z.string().min(64).max(MEME_IMAGE_MAX),
});

const likeSchema = z.object({
  id: z.string().min(8).max(80),
});

const withOptionalSession = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    return next({ context: { bearerToken: context.bearerToken as string | undefined } });
  });

function sanitizeCaption(raw: string): string {
  return raw.replace(/[<>]/g, "").replace(/[\n\r\t]/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);
}

function assertImageData(value: string): string {
  const trimmed = value.trim();
  if (!/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(trimmed)) {
    throw new Error("That image is not a valid JPEG or PNG.");
  }
  if (trimmed.length > MEME_IMAGE_MAX) {
    throw new Error("That meme is too heavy for the wall. Try a smaller image.");
  }
  return trimmed;
}

function asCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function asBool(value: unknown): boolean {
  return value === true || value === 1 || value === "t" || value === "true" || value === "1";
}

function asTime(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

export const listMemes = createServerFn({ method: "POST" })
  .middleware([withOptionalSession])
  .validator(listSchema)
  .handler(async ({ context, data }): Promise<MemeCard[]> => {
    const { getSql } = await import("@/lib/db");
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const sql = await getSql();
    const me = await getSessionUser(context.bearerToken);
    const meId = me?.id ?? "";

    const rows =
      data.sort === "mine"
        ? me
          ? await sql<{
              id: string;
              user_id: string;
              creator_name: string;
              top_text: string;
              bottom_text: string;
              image_data: string;
              likes: unknown;
              created_at: unknown;
              liked: unknown;
            }>`
              select
                m.id, m.user_id, m.creator_name, m.top_text, m.bottom_text,
                m.image_data, m.likes, m.created_at,
                exists(
                  select 1 from meme_likes l
                  where l.meme_id = m.id and l.user_id = ${meId}
                ) as liked
              from memes m
              where m.user_id = ${me.id}
              order by m.created_at desc
              limit ${MEME_WALL_LIMIT}
            `
          : []
        : data.sort === "likes"
          ? await sql<{
              id: string;
              user_id: string;
              creator_name: string;
              top_text: string;
              bottom_text: string;
              image_data: string;
              likes: unknown;
              created_at: unknown;
              liked: unknown;
            }>`
              select
                m.id, m.user_id, m.creator_name, m.top_text, m.bottom_text,
                m.image_data, m.likes, m.created_at,
                exists(
                  select 1 from meme_likes l
                  where l.meme_id = m.id and l.user_id = ${meId}
                ) as liked
              from memes m
              order by m.likes desc, m.created_at desc
              limit ${MEME_WALL_LIMIT}
            `
          : await sql<{
              id: string;
              user_id: string;
              creator_name: string;
              top_text: string;
              bottom_text: string;
              image_data: string;
              likes: unknown;
              created_at: unknown;
              liked: unknown;
            }>`
              select
                m.id, m.user_id, m.creator_name, m.top_text, m.bottom_text,
                m.image_data, m.likes, m.created_at,
                exists(
                  select 1 from meme_likes l
                  where l.meme_id = m.id and l.user_id = ${meId}
                ) as liked
              from memes m
              order by m.created_at desc
              limit ${MEME_WALL_LIMIT}
            `;

    return rows.map((row) => ({
      id: row.id,
      creatorName: sanitizeRunnerName(row.creator_name),
      topText: row.top_text,
      bottomText: row.bottom_text,
      imageData: row.image_data,
      likes: asCount(row.likes),
      liked: asBool(row.liked),
      isYours: Boolean(me && row.user_id === me.id),
      createdAt: asTime(row.created_at),
    }));
  });

export const postMeme = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(postSchema)
  .handler(async ({ context, data }): Promise<MemeCard> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const imageData = assertImageData(data.imageData);
    const account = await sql<{ name: string | null; email: string | null }>`
      select name, email from "user" where id = ${context.userId} limit 1
    `;
    const creatorName = sanitizeRunnerName(account[0]?.name, account[0]?.email);
    const countRows = await sql<{ n: unknown }>`
      select count(*)::int as n from memes where user_id = ${context.userId}
    `;
    if (asCount(countRows[0]?.n) >= MEME_MAX_PER_USER) {
      throw new Error("The floor already has your last thirty. Delete one first.");
    }
    const id = crypto.randomUUID();
    const topText = sanitizeCaption(data.topText);
    const bottomText = sanitizeCaption(data.bottomText);
    await sql`
      insert into memes
        (id, user_id, creator_name, top_text, bottom_text, image_data, likes, created_at)
      values (
        ${id},
        ${context.userId},
        ${creatorName},
        ${topText},
        ${bottomText},
        ${imageData},
        0,
        now()
      )
    `;
    return {
      id,
      creatorName,
      topText,
      bottomText,
      imageData,
      likes: 0,
      liked: false,
      isYours: true,
      createdAt: new Date().toISOString(),
    };
  });

export const toggleMemeLike = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(likeSchema)
  .handler(async ({ context, data }): Promise<{ likes: number; liked: boolean }> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const existing = await sql<{ meme_id: string }>`
      select meme_id from meme_likes
      where meme_id = ${data.id} and user_id = ${context.userId}
      limit 1
    `;
    if (existing[0]) {
      await sql`
        delete from meme_likes
        where meme_id = ${data.id} and user_id = ${context.userId}
      `;
      await sql`
        update memes set likes = greatest(likes - 1, 0) where id = ${data.id}
      `;
    } else {
      const found = await sql<{ id: string }>`
        select id from memes where id = ${data.id} limit 1
      `;
      if (!found[0]) throw new Error("That meme left the wall.");
      await sql`
        insert into meme_likes (meme_id, user_id, created_at)
        values (${data.id}, ${context.userId}, now())
      `;
      await sql`
        update memes set likes = likes + 1 where id = ${data.id}
      `;
    }
    const next = await sql<{ likes: unknown }>`
      select likes from memes where id = ${data.id} limit 1
    `;
    return {
      likes: asCount(next[0]?.likes),
      liked: !existing[0],
    };
  });
