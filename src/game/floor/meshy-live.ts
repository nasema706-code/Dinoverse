/** Live bridge between the explorer player and the Meshy avatar. */
export type MeshyEmote =
  | "Big_Wave_Hello"
  | "Listening_Gesture"
  | "Alert"
  | "Walk_Slowly_and_Look_Around";

export const MESHY_EMOTES: { id: MeshyEmote; label: string }[] = [
  { id: "Big_Wave_Hello", label: "Wave" },
  { id: "Listening_Gesture", label: "Listen" },
  { id: "Alert", label: "Alert" },
  { id: "Walk_Slowly_and_Look_Around", label: "Look around" },
];

export const meshyLive = {
  ready: false,
  /** Third-person chase cam (playable body visible). */
  thirdPerson: true,
  x: 0,
  y: 0,
  z: 24,
  yaw: 0,
  speed: 0,
  /** 0–1 move input; keyboard WASD is 1. */
  drive: 0,
  sprint: false,
  seated: false,
  visible: true,
  emote: null as MeshyEmote | null,
  /** Click absorbed so the canvas does not steal pointer lock. */
  absorbClick: false,
  /** Request open of the emote tray from a body click. */
  openEmotes: false,
};

export function requestMeshyEmote(id: MeshyEmote) {
  meshyLive.emote = id;
}
