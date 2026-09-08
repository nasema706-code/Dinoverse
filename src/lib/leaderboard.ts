import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { STAGES, isStageId, type StageId } from "@/game/mushroom-run/levels";

export const BOARD_LIMIT = 50;
export const MAX_RUN_SCORE = 9_999_999;

export type BoardRow = {
  rank: number;
  displayName: string;
  score: number;
  stage: StageId;
  stageName: string;
  isYou: boolean;
};

export type BoardYou = {
  rank: number;
  score: number;
  displayName: string;
  stage: StageId;
};

export type BoardPayload = {
  rows: BoardRow[];
  you: BoardYou | null;
};

export type SubmitResult = {
  best: number;
  improved: boolean;
  rank: number;
  displayName: string;
};

const submitSchema = z.object({
  score: z.number().int().min(0).max(MAX_RUN_SCORE),
  stage: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

const nameSchema = z.object({
  displayName: z.string().min(1).max(48),
});

function asStage(value: unknown): StageId {
  const n = typeof value === "number" ? value : Number(value);
  return isStageId(n) ? n : 1;
}

function asScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(MAX_RUN_SCORE, Math.floor(n));
}

export function sanitizeRunnerName(raw: string | null | undefined, email?: string | null): string {
  const cleaned = (raw ?? "")
    .replace(/[<>]/g, "")
    .replace(/[\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
  if (cleaned.length >= 1) return cleaned;
  const local = (email ?? "").split("@")[0]?.replace(/[<>]/g, "").trim().slice(0, 24);
  if (local && local.length >= 1) return local;
  return "Runner";
}

const withOptionalSession = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    return next({ context: { bearerToken: context.bearerToken as string | undefined } });
  });

async function loadAccountName(userId: string): Promise<{ name: string | null; email: string | null }> {
  const { getPassById } = await import("@/lib/floor-store.server");
  const pass = await getPassById(userId);
  if (pass) return { name: pass.name, email: null };
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ name: string | null; email: string | null }>`
    select name, email from "user" where id = ${userId} limit 1
  `;
  const row = rows[0];
  return { name: row?.name ?? null, email: row?.email ?? null };
}

async function rankFor(userId: string): Promise<BoardYou | null> {
  const { getFloorScore, rankFloorScore } = await import("@/lib/floor-store.server");
  const row = await getFloorScore(userId);
  if (!row || row.bestScore <= 0) return null;
  const rank = (await rankFloorScore(userId)) ?? 1;
  const stage = asStage(row.stage);
  return {
    rank,
    score: asScore(row.bestScore),
    displayName: sanitizeRunnerName(row.displayName),
    stage,
  };
}

export const listLeaderboard = createServerFn({ method: "GET" })
  .middleware([withOptionalSession])
  .handler(async ({ context }): Promise<BoardPayload> => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const { listFloorScores } = await import("@/lib/floor-store.server");
    const me = await getSessionUser(context.bearerToken);
    const rows = await listFloorScores(BOARD_LIMIT);
    const you = me ? await rankFor(me.id) : null;
    return {
      rows: rows.map((row, i) => {
        const stage = asStage(row.stage);
        return {
          rank: i + 1,
          displayName: sanitizeRunnerName(row.displayName),
          score: asScore(row.bestScore),
          stage,
          stageName: STAGES[stage].name,
          isYou: Boolean(me && row.userId === me.id),
        };
      }),
      you,
    };
  });

export const submitRunScore = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(submitSchema)
  .handler(async ({ context, data }): Promise<SubmitResult> => {
    const { upsertFloorScore, getFloorScore } = await import("@/lib/floor-store.server");
    const account = await loadAccountName(context.userId);
    const existing = await getFloorScore(context.userId);
    const previous = existing ? asScore(existing.bestScore) : 0;
    const displayName = sanitizeRunnerName(existing?.displayName ?? account.name, account.email);
    const improved = data.score > previous;
    await upsertFloorScore({
      userId: context.userId,
      displayName,
      bestScore: data.score,
      stage: data.stage,
      updatedAt: new Date().toISOString(),
    });
    const you = await rankFor(context.userId);
    return {
      best: you?.score ?? Math.max(previous, data.score),
      improved,
      rank: you?.rank ?? 1,
      displayName,
    };
  });

export const updateRunnerName = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(nameSchema)
  .handler(async ({ context }) => {
    const account = await loadAccountName(context.userId);
    const displayName = sanitizeRunnerName(account.name, account.email);
    return { displayName, locked: true as const };
  });
