import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isCharacterId, type CharacterId } from "./characters";
import { isWorldId, type WorldId } from "./worlds";

export type CloudSave = {
  characterId: CharacterId;
  collected: string[];
  visited: WorldId[];
  questDone: boolean;
  hasOnboarded: boolean;
};

type DinoverseState = CloudSave & {
  setCharacter: (id: CharacterId) => void;
  collectShard: (id: string) => void;
  visitWorld: (id: WorldId) => void;
  completeQuest: () => void;
  markOnboarded: () => void;
  resetRun: () => void;
};

export const useDinoverse = create<DinoverseState>()(
  persist(
    (set, get) => ({
      characterId: "rex",
      collected: [],
      visited: [],
      questDone: false,
      hasOnboarded: false,
      setCharacter: (id) => set({ characterId: id, hasOnboarded: true }),
      collectShard: (id) => {
        if (get().collected.includes(id)) return;
        set({ collected: [...get().collected, id] });
      },
      visitWorld: (id) => {
        if (get().visited.includes(id)) return;
        set({ visited: [...get().visited, id] });
      },
      completeQuest: () => set({ questDone: true }),
      markOnboarded: () => set({ hasOnboarded: true }),
      resetRun: () => set({ collected: [], visited: [], questDone: false }),
    }),
    {
      name: "dinoverse-save-v1",
      partialize: (s) => ({
        characterId: s.characterId,
        collected: s.collected,
        visited: s.visited,
        questDone: s.questDone,
        hasOnboarded: s.hasOnboarded,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<DinoverseState>;
        return {
          ...current,
          ...p,
          characterId: isCharacterId(p.characterId) ? p.characterId : "rex",
          collected: Array.isArray(p.collected) ? p.collected.filter((id) => typeof id === "string") : [],
          visited: Array.isArray(p.visited) ? p.visited.filter(isWorldId) : [],
          questDone: Boolean(p.questDone),
          hasOnboarded: Boolean(p.hasOnboarded),
        };
      },
    },
  ),
);

export function getSaveSnapshot(): CloudSave {
  const s = useDinoverse.getState();
  return {
    characterId: s.characterId,
    collected: s.collected,
    visited: s.visited,
    questDone: s.questDone,
    hasOnboarded: s.hasOnboarded,
  };
}

export function applySave(save: CloudSave) {
  useDinoverse.setState({
    characterId: save.characterId,
    collected: save.collected,
    visited: save.visited,
    questDone: save.questDone,
    hasOnboarded: save.hasOnboarded,
  });
}

export function saveFingerprint(save: CloudSave) {
  return JSON.stringify(save);
}
