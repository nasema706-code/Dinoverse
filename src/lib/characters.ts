export type CharacterId = "rex" | "vex" | "tria" | "ptera";

export type WalkBeat = {
  title: string;
  body: string;
};

export type Character = {
  id: CharacterId;
  name: string;
  title: string;
  species: string;
  tagline: string;
  blurb: string;
  portrait: string;
  figure?: string;
  walkSheet: string;
  homeKicker: string;
  homeLead: string;
};

export const CHARACTERS: Character[] = [
  {
    id: "rex",
    name: "Rex Volt",
    title: "Floor Chief",
    species: "Velociraptor",
    tagline: "I don't visit markets. Markets visit me.",
    blurb:
      "Runs Dinoverse Financial with a handshake and a live tablet. Charcoal three-piece, burgundy tie, coffee in one claw, the tape on glass in the other. Headset on. Always on the floor.",
    portrait: "/characters/rex/full.png?v=3",
    figure: "/characters/rex/full.png?v=3",
    walkSheet: "/characters/rex/walk.png",
    homeKicker: "Seen through the Floor Chief",
    homeLead:
      "The Dinoverse is not a rumor. It is a city that already clocks in — coffee, gyms, the floor. I keep the tape honest.",
  },
  {
    id: "vex",
    name: "Vex Pulse",
    title: "Signal Thief",
    species: "Velociraptor",
    tagline: "If the lights blink, I already read the packet.",
    blurb:
      "A mall ghost who treats holo-tags like a keyboard. Notices the seams everyone else walks past.",
    portrait: "/characters/vex/portrait.jpg",
    walkSheet: "/characters/vex/walk.png",
    homeKicker: "Seen through the Signal Thief",
    homeLead:
      "This city runs on two grids: the one tourists photograph, and the quiet one that moves $DINOVERSE between coffee and the close.",
  },
  {
    id: "tria",
    name: "Tria Goldleaf",
    title: "Stall Matron",
    species: "Triceratops",
    tagline: "Eat first. Then we talk tokenomics.",
    blurb:
      "Keeps Dino Mart honest and the broth pots full. Reads a crowd the way others read a chart.",
    portrait: "/characters/tria/portrait.jpg",
    walkSheet: "/characters/tria/walk.png",
    homeKicker: "Seen through the Stall Matron",
    homeLead:
      "A universe is only hidden until someone hangs a lantern and starts selling breakfast. Welcome to Dino Mart.",
  },
  {
    id: "ptera",
    name: "Ptera Drift",
    title: "Crater Pilot",
    species: "Pteranodon",
    tagline: "Maps lie. Wind does not.",
    blurb:
      "Flies the HQ pad and treats the Coliseum as a second home. Collects horizons the way others collect coins.",
    portrait: "/characters/ptera/portrait.jpg",
    walkSheet: "/characters/ptera/walk.png",
    homeKicker: "Seen through the Crater Pilot",
    homeLead:
      "From the air the Dinoverse looks like a city that never needed hiding. On the ground it feels like a listing.",
  },
];

export const CHARACTER_BY_ID: Record<CharacterId, Character> = {
  rex: CHARACTERS[0],
  vex: CHARACTERS[1],
  tria: CHARACTERS[2],
  ptera: CHARACTERS[3],
};

export function isCharacterId(value: string | null | undefined): value is CharacterId {
  return value === "rex" || value === "vex" || value === "tria" || value === "ptera";
}
