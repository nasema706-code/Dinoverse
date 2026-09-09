export type VisionId = "megacity" | "racetrack" | "jungle" | "coliseum";

export type Vision = {
  id: VisionId;
  title: string;
  kicker: string;
  body: string;
  still: string;
  fog: string;
  follow?: boolean;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
    minDistance: number;
    maxDistance: number;
    maxPolarAngle: number;
  };
};

export const VISIONS: Vision[] = [
  {
    id: "megacity",
    title: "Floating Fossil Megacity",
    kicker: "Establishing · dusk",
    body: "A T-Rex skull mountain split into a vertical city. Magma in the sockets. Bone bridges. Look up from the ferns.",
    still: "/visions/fossil-megacity.jpg",
    fog: "#1a0b18",
    camera: {
      position: [12, 2.6, 46],
      target: [0, 16, -8],
      fov: 50,
      minDistance: 14,
      maxDistance: 96,
      maxPolarAngle: 1.5,
    },
  },
  {
    id: "racetrack",
    title: "Crystal Canyon Racetrack",
    kicker: "Tracking · late sun",
    body: "Amethyst and teal walls. Bone-and-chrome chariots. Scarred Carnotaurus kicking rainbow dust.",
    still: "/visions/crystal-racetrack.jpg",
    fog: "#12081a",
    follow: true,
    camera: {
      position: [0.5, 2.6, 14],
      target: [0, 1.1, -6],
      fov: 58,
      minDistance: 4,
      maxDistance: 40,
      maxPolarAngle: 1.4,
    },
  },
  {
    id: "jungle",
    title: "Night Jungle That Shouldn't Exist",
    kicker: "High angle · night",
    body: "Truck-sized pitcher plants. Electric-blue ferns. A Spinosaurus wades black water under mixed moonlight.",
    still: "/visions/night-jungle.jpg",
    fog: "#061018",
    camera: {
      position: [12, 18, 16],
      target: [0, 1.2, 0],
      fov: 50,
      minDistance: 14,
      maxDistance: 58,
      maxPolarAngle: 1.15,
    },
  },
  {
    id: "coliseum",
    title: "Volcanic Bone Coliseum",
    kicker: "Three-quarter · eruption",
    body: "Skull stands. Obsidian floor. Two champions circle while lava curtains fall.",
    still: "/visions/bone-coliseum.jpg",
    fog: "#140808",
    camera: {
      position: [20, 12, 24],
      target: [0, 2.2, 0],
      fov: 46,
      minDistance: 12,
      maxDistance: 56,
      maxPolarAngle: 1.32,
    },
  },
];

export const VISION_BY_ID: Record<VisionId, Vision> = {
  megacity: VISIONS[0],
  racetrack: VISIONS[1],
  jungle: VISIONS[2],
  coliseum: VISIONS[3],
};

export function isVisionId(value: string | null | undefined): value is VisionId {
  return value === "megacity" || value === "racetrack" || value === "jungle" || value === "coliseum";
}
