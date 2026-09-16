import { TOKEN } from "@/lib/token";

export const COMPETITION = {
  kicker: "Open call · image campaign",
  title: "Floor Cast",
  headline: "Design a dinosaur character card",
  datesLabel: "15 Sep – 13 Oct 2026 (UTC)",
  start: "2026-09-15T00:00:00.000Z",
  end: "2026-10-13T23:59:59.000Z",
  type: "Image campaign",
  platform: "X",
  hashtag: "#DinoverseCast",
  handle: "@dinoversesol",
  maxEntries: 1,
  prize: "A 3D walkable character on The Floor",
  blurb:
    "The city already has a Floor Chief, a signal thief, a stall matron and a crater pilot. Now it needs the next dinosaur with a job, a tell, and a card that could hang in HQ. Design one character as a single image — name, personality, bio, the lot. The winning card is modelled in 3D and walks The Floor with the crew.",
  xCompose: (name: string) => {
    const text = `${name || "My dinosaur"} joins the Floor Cast. ${TOKEN.ticker} character card. #DinoverseCast @dinoversesol`;
    return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  },
} as const;

export const STEPS = [
  {
    n: "01",
    title: "Invent a dinosaur with a job",
    body: "Species, title, three personality traits, and a short bio. They should feel like they already clock in somewhere in the city — not a generic mascot.",
  },
  {
    n: "02",
    title: "Make one character card image",
    body: "A single portrait card: the dinosaur, their name, traits and bio on the art. Use the studio above, or design your own.",
  },
  {
    n: "03",
    title: "Post the card on X",
    body: `Standalone post from your own account. Add ${COMPETITION.hashtag} and tag ${COMPETITION.handle}. Caption: at least 30 words on who they are and why they belong on The Floor.`,
  },
] as const;

export const NEED = [
  { n: "1", title: "One card", detail: "Name, 3 traits, and a bio on the picture." },
  { n: "2", title: "Your dinosaur", detail: "Invent one. Not Rex, Vex, Tria, or Ptera." },
  { n: "3", title: "Post it on X", detail: `Public post. ${COMPETITION.hashtag} and ${COMPETITION.handle}.` },
  { n: "4", title: "30 words", detail: "Who they are, and where they work in the city." },
] as const;
