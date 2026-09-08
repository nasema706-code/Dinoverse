import { randomUUID } from "node:crypto";
import { floorNameError, floorNameKey, normalizeFloorName } from "./floor-name";

export class FloorNameTakenError extends Error {
  constructor() {
    super("That runner name is already on the Floor.");
    this.name = "FloorNameTakenError";
  }
}

export class FloorPassMissingError extends Error {
  constructor() {
    super("No Floor pass matches that name and password.");
    this.name = "FloorPassMissingError";
  }
}

export type FloorPass = {
  id: string;
  name: string;
  nameKey: string;
  keyHash: string;
};

export type FloorScore = {
  userId: string;
  displayName: string;
  bestScore: number;
  stage: number;
  updatedAt: string;
};

type Adapter = {
  getById: (id: string) => Promise<FloorPass | null>;
  getByNameKey: (nameKey: string) => Promise<FloorPass | null>;
  insert: (pass: FloorPass) => Promise<void>;
  touch: (id: string) => Promise<void>;
  getScore: (userId: string) => Promise<FloorScore | null>;
  upsertScore: (row: FloorScore) => Promise<FloorScore>;
  listScores: (limit: number) => Promise<FloorScore[]>;
  rank: (userId: string) => Promise<number | null>;
};

async function blobsAdapter(): Promise<Adapter | null> {
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("dinoverse-floor", { consistency: "strong" });
    const namePath = (nameKey: string) => `pass/name/${encodeURIComponent(nameKey)}`;
    const idPath = (id: string) => `pass/id/${id}`;
    const scorePath = (userId: string) => `score/${userId}`;
    return {
      async getById(id) {
        return ((await store.get(idPath(id), { type: "json" })) as FloorPass | null) ?? null;
      },
      async getByNameKey(nameKey) {
        return ((await store.get(namePath(nameKey), { type: "json" })) as FloorPass | null) ?? null;
      },
      async insert(pass) {
        const created = await store.setJSON(namePath(pass.nameKey), pass, { onlyIfNew: true });
        if (!created.modified) throw new FloorNameTakenError();
        await store.setJSON(idPath(pass.id), pass);
      },
      async touch(id) {
        const pass = ((await store.get(idPath(id), { type: "json" })) as FloorPass | null) ?? null;
        if (!pass) return;
        await store.setJSON(idPath(id), pass);
        await store.setJSON(namePath(pass.nameKey), pass);
      },
      async getScore(userId) {
        return ((await store.get(scorePath(userId), { type: "json" })) as FloorScore | null) ?? null;
      },
      async upsertScore(row) {
        await store.setJSON(scorePath(row.userId), row);
        return row;
      },
      async listScores(limit) {
        const listed = await store.list({ prefix: "score/" });
        const rows: FloorScore[] = [];
        for (const blob of listed.blobs) {
          const row = (await store.get(blob.key, { type: "json" })) as FloorScore | null;
          if (row && row.bestScore > 0) rows.push(row);
        }
        return rows
          .sort((a, b) => b.bestScore - a.bestScore || a.updatedAt.localeCompare(b.updatedAt))
          .slice(0, limit);
      },
      async rank(userId) {
        const mine = ((await store.get(scorePath(userId), { type: "json" })) as FloorScore | null) ?? null;
        if (!mine || mine.bestScore <= 0) return null;
        const listed = await store.list({ prefix: "score/" });
        let ahead = 0;
        for (const blob of listed.blobs) {
          const row = (await store.get(blob.key, { type: "json" })) as FloorScore | null;
          if (!row || row.bestScore <= 0) continue;
          if (
            row.bestScore > mine.bestScore ||
            (row.bestScore === mine.bestScore && row.updatedAt < mine.updatedAt)
          ) {
            ahead += 1;
          }
        }
        return ahead + 1;
      },
    };
  } catch {
    return null;
  }
}

async function sqlAdapter(): Promise<Adapter> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  return {
    async getById(id) {
      const rows = await sql<FloorPass>`
        select id, name, name_key as "nameKey", key_hash as "keyHash"
        from floor_passes where id = ${id} limit 1
      `;
      return rows[0] ?? null;
    },
    async getByNameKey(nameKey) {
      const rows = await sql<FloorPass>`
        select id, name, name_key as "nameKey", key_hash as "keyHash"
        from floor_passes where name_key = ${nameKey} limit 1
      `;
      return rows[0] ?? null;
    },
    async insert(pass) {
      try {
        await sql`
          insert into floor_passes (id, name, name_key, key_hash, created_at, last_seen_at)
          values (${pass.id}, ${pass.name}, ${pass.nameKey}, ${pass.keyHash}, now(), now())
        `;
      } catch (err) {
        const code = typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : "";
        const text = err instanceof Error ? err.message : "";
        if (code === "23505" || /unique|duplicate/i.test(text)) throw new FloorNameTakenError();
        throw err;
      }
    },
    async touch(id) {
      await sql`update floor_passes set last_seen_at = now() where id = ${id}`;
    },
    async getScore(userId) {
      const rows = await sql<{
        user_id: string;
        display_name: string;
        best_score: number;
        stage: number;
        updated_at: string | Date;
      }>`
        select user_id, display_name, best_score, stage, updated_at
        from mushroom_run_scores where user_id = ${userId} limit 1
      `;
      const row = rows[0];
      if (!row) return null;
      return {
        userId: row.user_id,
        displayName: row.display_name,
        bestScore: Number(row.best_score) || 0,
        stage: Number(row.stage) || 1,
        updatedAt: typeof row.updated_at === "string" ? row.updated_at : row.updated_at.toISOString(),
      };
    },
    async upsertScore(row) {
      await sql`
        insert into mushroom_run_scores
          (user_id, display_name, best_score, stage, updated_at)
        values (
          ${row.userId},
          ${row.displayName},
          ${row.bestScore},
          ${row.stage},
          ${row.updatedAt}::timestamptz
        )
        on conflict (user_id) do update set
          display_name = excluded.display_name,
          best_score = greatest(mushroom_run_scores.best_score, excluded.best_score),
          stage = case
            when excluded.best_score > mushroom_run_scores.best_score then excluded.stage
            else mushroom_run_scores.stage
          end,
          updated_at = case
            when excluded.best_score > mushroom_run_scores.best_score then excluded.updated_at
            else mushroom_run_scores.updated_at
          end
      `;
      return row;
    },
      async listScores(limit) {
        const rows = await sql<{
          user_id: string;
          display_name: string;
          best_score: number;
          stage: number;
          updated_at: string | Date;
        }>`
          select user_id, display_name, best_score, stage, updated_at
          from mushroom_run_scores
          where best_score > 0
          order by best_score desc, updated_at asc
          limit ${limit}
        `;
        return rows.map((row) => ({
          userId: row.user_id,
          displayName: row.display_name,
          bestScore: Number(row.best_score) || 0,
          stage: Number(row.stage) || 1,
          updatedAt: typeof row.updated_at === "string" ? row.updated_at : row.updated_at.toISOString(),
        }));
      },
      async rank(userId) {
        const rows = await sql<{ rank: number }>`
          with me as (
            select best_score, updated_at
            from mushroom_run_scores
            where user_id = ${userId} and best_score > 0
          )
          select (
            select count(*)::int
            from mushroom_run_scores s, me
            where s.best_score > me.best_score
               or (s.best_score = me.best_score and s.updated_at < me.updated_at)
          ) + 1 as rank
          from me
        `;
        return rows[0]?.rank ?? null;
      },
  };
}

async function adapter(): Promise<Adapter> {
  const blobs = await blobsAdapter();
  if (blobs) return blobs;
  return sqlAdapter();
}

export async function getPassById(id: string): Promise<FloorPass | null> {
  return (await adapter()).getById(id);
}

export async function getPassByNameKey(nameKey: string): Promise<FloorPass | null> {
  return (await adapter()).getByNameKey(nameKey);
}

export async function createFloorPass(rawName: string, keyHash: string): Promise<FloorPass> {
  const name = normalizeFloorName(rawName);
  const error = floorNameError(name);
  if (error) throw new Error(error);
  const pass: FloorPass = {
    id: `fl_${randomUUID()}`,
    name,
    nameKey: floorNameKey(name),
    keyHash,
  };
  await (await adapter()).insert(pass);
  return pass;
}

export async function touchFloorPass(id: string): Promise<void> {
  await (await adapter()).touch(id);
}

export async function getFloorScore(userId: string): Promise<FloorScore | null> {
  return (await adapter()).getScore(userId);
}

export async function upsertFloorScore(row: FloorScore): Promise<FloorScore> {
  const store = await adapter();
  const existing = await store.getScore(row.userId);
  const next: FloorScore = existing
    ? {
        userId: row.userId,
        displayName: row.displayName,
        bestScore: Math.max(existing.bestScore, row.bestScore),
        stage: row.bestScore > existing.bestScore ? row.stage : existing.stage,
        updatedAt: row.bestScore > existing.bestScore ? row.updatedAt : existing.updatedAt,
      }
    : row;
  return store.upsertScore(next);
}

export async function listFloorScores(limit: number): Promise<FloorScore[]> {
  return (await adapter()).listScores(limit);
}

export async function rankFloorScore(userId: string): Promise<number | null> {
  return (await adapter()).rank(userId);
}
