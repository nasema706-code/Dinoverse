import { TOKEN } from "@/lib/token";

export const MEME_CANVAS = 1000;

export type MemePack = "floor" | "mart" | "arena" | "rex";
export type MemeLook = "impact" | "tape" | "quiet";

export type MemeCaption = {
  top: string;
  bottom: string;
};

export type MemeTemplate = {
  id: string;
  name: string;
  label: string;
  pack: MemePack;
  url: string;
  captions: MemeCaption[];
};

export const MEME_PACKS: { id: "all" | MemePack; label: string }[] = [
  { id: "all", label: "All" },
  { id: "floor", label: "The Floor" },
  { id: "mart", label: "Mart" },
  { id: "arena", label: "Arena" },
  { id: "rex", label: "Rex" },
];

export const MEME_LOOKS: { id: MemeLook; label: string; hint: string }[] = [
  { id: "impact", label: "Impact", hint: "Classic caps" },
  { id: "tape", label: "Tape", hint: "Green ticker" },
  { id: "quiet", label: "Quiet", hint: "No outline" },
];

export const DEFAULT_TOP_Y = 0.12;
export const DEFAULT_BOTTOM_Y = 0.9;
export const DEFAULT_FONT_SIZE = 8;
export const MIN_FONT_SIZE = 4;
export const MAX_FONT_SIZE = 16;

export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: "floor",
    name: "Rex Volt · The Floor",
    label: "The Floor",
    pack: "floor",
    url: "/life/corporate.jpg",
    captions: [
      { top: "Bones are about to list", bottom: "We built the city first" },
      { top: "Coffee in one claw", bottom: "The tape in the other" },
      { top: "I don't visit markets", bottom: "Markets visit me" },
      { top: "HQ is open", bottom: "The rest is still pouring" },
      { top: "The listing is a lifestyle", bottom: "Not a screenshot" },
    ],
  },
  {
    id: "tape",
    name: "Trading Desk",
    label: "The tape",
    pack: "floor",
    url: "/life/finance.jpg",
    captions: [
      { top: "Do not clap", bottom: "Just keep walking" },
      { top: "Q2 is not a speech", bottom: "It is a city that clocks in" },
      { top: "If it lags", bottom: "Kick the glass. Politely." },
      { top: "Zero tax", bottom: "The floor does not skim" },
      { top: "The tape is live", bottom: "Keep walking" },
    ],
  },
  {
    id: "ops",
    name: "Analyst Floor",
    label: "Ops",
    pack: "floor",
    url: "/life/analysis.jpg",
    captions: [
      { top: "Pretty hologram", bottom: "The real number is fresher" },
      { top: "Someone skipped lunch", bottom: "I can hear it from the desk" },
      { top: "Species index, live", bottom: "If it lags, kick the glass" },
      { top: "Q2 is a city", bottom: "Not a slide deck" },
    ],
  },
  {
    id: "build",
    name: "Build Floor",
    label: "Build",
    pack: "floor",
    url: "/life/office.jpg",
    captions: [
      { top: "They still work under plants", bottom: "The listing does not care" },
      { top: "Keep shipping", bottom: "Four desks. One city." },
      { top: "Unpatched node", bottom: "I left a note. Courtesy." },
      { top: "Four desks", bottom: "One city that clocks in" },
    ],
  },
  {
    id: "hq",
    name: "HQ Plaza",
    label: "HQ",
    pack: "floor",
    url: "/life/hq.jpg",
    captions: [
      { top: "The bird is on the east pad", bottom: "Someone important is already inside" },
      { top: "Global Headquarters", bottom: "The city already clocks in" },
      { top: "A good building", bottom: "Tells the wind where to go" },
      { top: "East pad is busy", bottom: "That is a good sign" },
    ],
  },
  {
    id: "desk",
    name: "Dino-Sec",
    label: "Dino-Sec",
    pack: "floor",
    url: "/life/security.jpg",
    captions: [
      { top: "The log already has my name", bottom: "It always does" },
      { top: "Bags on the scanner", bottom: "Especially the quiet ones" },
      { top: "Clearance is on your badge", bottom: "I still have to say it" },
      { top: "Dino-Sec does not blink", bottom: "You can try" },
    ],
  },
  {
    id: "mart",
    name: "Dino Mart",
    label: "Dino Mart",
    pack: "mart",
    url: "/life/mart.jpg",
    captions: [
      { top: "Keep your elbows in", bottom: "This floor already decided" },
      { top: "Smell that?", bottom: "Honesty, pepper, and a blender" },
      { top: "Eat first", bottom: "Then we talk tokenomics" },
      { top: "The aisle already decided", bottom: "Keep moving" },
    ],
  },
  {
    id: "mac",
    name: "Dino Mac",
    label: "Dino Mac",
    pack: "mart",
    url: "/life/mac-street.jpg",
    captions: [
      { top: "A city that lists a coin", bottom: "And still runs a combo board" },
      { top: "Mac after close", bottom: "Not a joke to him" },
      { top: "Too many roofs", bottom: "If the burger is good I forgive it" },
      { top: "Combo board is live", bottom: "The CA can wait" },
    ],
  },
  {
    id: "coffee",
    name: "Jurassic Blend",
    label: "Coffee",
    pack: "mart",
    url: "/life/coffee.jpg",
    captions: [
      { top: "Jurassic Blend", bottom: "Bitter enough to keep the open honest" },
      { top: "Hot. Good.", bottom: "The plaza wind will steal the rest" },
      { top: "The machine is offline-first", bottom: "A kettle with principles" },
      { top: "Bitter on purpose", bottom: "The open stays honest" },
    ],
  },
  {
    id: "mall",
    name: "Mega Mall",
    label: "Mega Mall",
    pack: "mart",
    url: "/life/mega-mall.jpg",
    captions: [
      { top: "Pretty lights. Pretty neighbors.", bottom: "Easy to forget who owns the lift" },
      { top: "This is my grid", bottom: "Step where I step" },
      { top: "If a mall can afford silence", bottom: "Someone is doing the books right" },
      { top: "Pretty neighbors", bottom: "I still own the lift" },
    ],
  },
  {
    id: "fit",
    name: "Dino Fit",
    label: "Dino Fit",
    pack: "arena",
    url: "/life/gym.jpg",
    captions: [
      { top: "Eat and lift", bottom: "On the same sidewalk" },
      { top: "This is the other listing", bottom: "Sweat, lights, a cup" },
      { top: "The city trains", bottom: "Sweat first. Tape later." },
      { top: "Sweat, lights, a cup", bottom: "The other listing" },
    ],
  },
  {
    id: "coliseum",
    name: "Jurassic Coliseum",
    label: "Coliseum",
    pack: "arena",
    url: "/life/football.jpg",
    captions: [
      { top: "The cleanest market in the basin", bottom: "If you can stand the noise" },
      { top: "A civic sport", bottom: "Should have weather" },
      { top: "When the hologram trophy goes up", bottom: "He claps anyway" },
      { top: "Weather on the field", bottom: "That is civic" },
    ],
  },
  {
    id: "rex",
    name: "Rex Volt",
    label: "Rex Volt",
    pack: "rex",
    url: "/characters/rex/full.png",
    captions: [
      { top: "Floor Chief", bottom: "Headset on. Always on the floor." },
      { top: "Charcoal three-piece", bottom: "Burgundy tie. Live tablet." },
      { top: "You already know the tape", bottom: "Walk it anyway" },
      { top: "$DINOVERSE", bottom: "Listed like it belongs here" },
      { top: "Headset on", bottom: "Always on the floor" },
    ],
  },
  {
    id: "rex-run",
    name: "Rex on the tape",
    label: "On the tape",
    pack: "rex",
    url: "/game/rex-volt.jpg",
    captions: [
      { top: "Bank energy", bottom: "The ticker lives elsewhere" },
      { top: "Three lanes", bottom: "The floor does not wait" },
      { top: "Jump the rocks", bottom: "Grazes count" },
      { top: "Bank energy", bottom: "Do not dump it on a rock" },
    ],
  },
];

export function templatesInPack(pack: "all" | MemePack): MemeTemplate[] {
  if (pack === "all") return MEME_TEMPLATES;
  return MEME_TEMPLATES.filter((plate) => plate.pack === pack);
}

export function slugPart(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
  return slug || "meme";
}

export function memeFileName(plate: MemeTemplate, topText: string): string {
  const seed = topText.trim() || plate.captions[0]?.top || plate.label;
  return `dinoverse-${slugPart(plate.id)}-${slugPart(seed)}.png`;
}

export function shareCopy(topText: string, bottomText: string): string {
  const lines = [topText.trim(), bottomText.trim()].filter(Boolean);
  const joke = lines.length ? lines.join(" / ") : TOKEN.ticker;
  return `${joke}\n\n${TOKEN.ticker}\nCA ${TOKEN.ca}\n${TOKEN.x}`;
}
