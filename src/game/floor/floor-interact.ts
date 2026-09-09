/** Click-to-talk / click-to-look from Floor meshes, read by the explorer HUD. */
export const floorInteract = {
  absorbClick: false,
  /** Pointer-locked look: raycast from view center on the next player frame. */
  lookClick: false,
  talkId: null as string | null,
  inspectId: null as string | null,
};

export function requestFloorTalk(id: string) {
  floorInteract.absorbClick = true;
  floorInteract.talkId = id;
}

export function requestFloorLook(id: string) {
  floorInteract.absorbClick = true;
  floorInteract.inspectId = id;
}
