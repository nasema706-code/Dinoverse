import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { isCharacterId } from "@/lib/characters";
import { isWorldId } from "@/lib/worlds";
import type { CloudSave } from "@/lib/store";

const saveSchema = z.object({
  characterId: z.enum(["rex", "vex", "tria", "ptera"]),
  collected: z.array(z.string()),
  visited: z.array(z.enum(["forum", "mart", "canopy", "crater"])),
  questDone: z.boolean(),
  hasOnboarded: z.boolean(),
});

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((id): id is string => typeof id === "string");
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

function rowToSave(row: Record<string, unknown>): CloudSave {
  const characterId = typeof row.character_id === "string" && isCharacterId(row.character_id)
    ? row.character_id
    : "rex";
  return {
    characterId,
    collected: asStringArray(row.collected),
    visited: asStringArray(row.visited).filter(isWorldId),
    questDone: Boolean(row.quest_done),
    hasOnboarded: Boolean(row.has_onboarded),
  };
}

export function mergeSaves(local: CloudSave, remote: CloudSave): CloudSave {
  return {
    characterId: local.hasOnboarded ? local.characterId : remote.characterId,
    collected: [...new Set([...remote.collected, ...local.collected])],
    visited: [...new Set([...remote.visited, ...local.visited])].filter(isWorldId),
    questDone: local.questDone || remote.questDone,
    hasOnboarded: local.hasOnboarded || remote.hasOnboarded,
  };
}

export const loadSave = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<CloudSave | null> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql`
      select character_id, collected, visited, quest_done, has_onboarded
      from dinoverse_saves
      where user_id = ${context.userId}
    `;
    const row = rows[0];
    return row ? rowToSave(row) : null;
  });

export const upsertSave = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(saveSchema)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into dinoverse_saves
        (user_id, character_id, collected, visited, quest_done, has_onboarded, updated_at)
      values (
        ${context.userId},
        ${data.characterId},
        ${JSON.stringify(data.collected)}::jsonb,
        ${JSON.stringify(data.visited)}::jsonb,
        ${data.questDone},
        ${data.hasOnboarded},
        now()
      )
      on conflict (user_id) do update set
        character_id = excluded.character_id,
        collected = excluded.collected,
        visited = excluded.visited,
        quest_done = excluded.quest_done,
        has_onboarded = excluded.has_onboarded,
        updated_at = now()
    `;
  });
