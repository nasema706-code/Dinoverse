export type CardDraft = {
  name: string;
  title: string;
  species: string;
  motto: string;
  tag: string;
  bio: string;
  tells: [string, string, string];
};

export const EMPTY_DRAFT: CardDraft = {
  name: "",
  title: "",
  species: "",
  motto: "",
  tag: "",
  bio: "",
  tells: ["", "", ""],
};

export const TELL_PLACEHOLDERS = ["City", "Night", "Lucky coin"] as const;

export type ArtFit = { scale: number; ox: number; oy: number };

export const FIT_DEFAULT: ArtFit = { scale: 1, ox: 0, oy: 0 };

export type CardArt = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  clip: "circle" | "rect";
};

export const CARD_TEMPLATES = [
  {
    id: "spotlight",
    label: "Spotlight",
    hint: "Round portrait",
    art: { x: 188, y: 128, w: 524, h: 524, r: 262, clip: "circle" as const },
  },
  {
    id: "dossier",
    label: "Dossier",
    hint: "Side portrait",
    art: { x: 56, y: 72, w: 308, h: 896, r: 26, clip: "rect" as const },
  },
] as const;

export type CardTemplate = (typeof CARD_TEMPLATES)[number];
export type CardTemplateId = CardTemplate["id"];

export const DEFAULT_TEMPLATE = CARD_TEMPLATES[0];

export const PAPER = { x: 40, y: 40, w: 820, h: 1120 } as const;

export function templateById(id: string) {
  return CARD_TEMPLATES.find((t) => t.id === id) ?? DEFAULT_TEMPLATE;
}

export function artCenter(art: CardArt) {
  return { cx: art.x + art.w / 2, cy: art.y + art.h / 2 };
}

export function hitArt(art: CardArt, x: number, y: number) {
  if (art.clip === "circle") {
    const { cx, cy } = artCenter(art);
    const r = art.w / 2;
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  }
  return x >= art.x && y >= art.y && x <= art.x + art.w && y <= art.y + art.h;
}
