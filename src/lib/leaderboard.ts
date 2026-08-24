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

async function loadAccountName(
  sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>,
  userId: string,
): Promise<{ name: string | null; email: string | null }> {
  const rows = await sql<{ name: string | null; email: string | null }>`
    select name, email from "user" where id = ${userId} limit 1
  `;
  const row = rows[0];
  return { name: row?.name ?? null, email: row?.email ?? null };
}

async function rankFor(
  sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>,
  userId: string,
): Promise<BoardYou | null> {
  const rows = await sql<{
    best_score: unknown;
    display_name: string;
    stage: unknown;
    rank: unknown;
  }>`
    with me as (
      select best_score, display_name, stage, updated_at
      from mushroom_run_scores
      where user_id = ${userId}
    )
    select
      m.best_score,
      m.display_name,
      m.stage,
      (
        select count(*)::int
        from mushroom_run_scores s
        where s.best_score > m.best_score
           or (s.best_score = m.best_score and s.updated_at < m.updated_at)
      ) + 1 as rank
    from me m
  `;
  const row = rows[0];
  if (!row) return null;
  const stage = asStage(row.stage);
  return {
    rank: asScore(row.rank) || 1,
    score: asScore(row.best_score),
    displayName: sanitizeRunnerName(row.display_name),
    stage,
  };
}

export const listLeaderboard = createServerFn({ method: "GET" })
  .middleware([withOptionalSession])
  .handler(async ({ context }): Promise<BoardPayload> => {
    const { getSql } = await import("@/lib/db");
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const sql = await getSql();
    const me = await getSessionUser(context.bearerToken);
    const rows = await sql<{
      user_id: string;
      display_name: string;
      best_score: unknown;
      stage: unknown;
    }>`
      select user_id, display_name, best_score, stage
      from mushroom_run_scores
      where best_score > 0
      order by best_score desc, updated_at asc
      limit ${BOARD_LIMIT}
    `;
    const you = me ? await rankFor(sql, me.id) : null;
    return {
      rows: rows.map((row, i) => {
        const stage = asStage(row.stage);
        return {
          rank: i + 1,
          displayName: sanitizeRunnerName(row.display_name),
          score: asScore(row.best_score),
          stage,
          stageName: STAGES[stage].name,
          isYou: Boolean(me && row.user_id === me.id),
        };
      }),
      you,
    };
  });

export const submitRunScore = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(submitSchema)
  .handler(async ({ context, data }): Promise<SubmitResult> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const account = await loadAccountName(sql, context.userId);
    const existing = await sql<{ best_score: unknown; display_name: string }>`
      select best_score, display_name from mushroom_run_scores where user_id = ${context.userId}
    `;
    const previous = existing[0] ? asScore(existing[0].best_score) : 0;
    const displayName = sanitizeRunnerName(
      existing[0]?.display_name ?? account.name,
      account.email,
    );
    const improved = data.score > previous;
    const nextScore = Math.max(previous, data.score);
    await sql`
      insert into mushroom_run_scores
        (user_id, display_name, best_score, stage, updated_at)
      values (
        ${context.userId},
        ${displayName},
        ${data.score},
        ${data.stage},
        now()
      )
      on conflict (user_id) do update set
        display_name = excluded.display_name,
        best_score = greatest(mushroom_run_scores.best_score, excluded.best_score),
        stage = case
          when excluded.best_score > mushroom_run_scores.best_score then excluded.stage
          else mushroom_run_scores.stage
        end,
        updated_at = case
          when excluded.best_score > mushroom_run_scores.best_score then now()
          else mushroom_run_scores.updated_at
        end
    `;
    const you = await rankFor(sql, context.userId);
    return {
      best: you?.score ?? nextScore,
      improved,
      rank: you?.rank ?? 1,
      displayName,
    };
  });

export const updateRunnerName = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(nameSchema)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const account = await loadAccountName(sql, context.userId);
    const displayName = sanitizeRunnerName(data.displayName, account.email);
    const existing = await sql<{ best_score: unknown }>`
      select best_score from mushroom_run_scores where user_id = ${context.userId}
    `;
    if (!existing[0]) {
      await sql`
        insert into mushroom_run_scores (user_id, display_name, best_score, stage, updated_at)
        values (${context.userId}, ${displayName}, 0, 1, now())
      `;
    } else {
      await sql`
        update mushroom_run_scores
        set display_name = ${displayName}
        where user_id = ${context.userId}
      `;
    }
    return { displayName };
  });
