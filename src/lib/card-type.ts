export type CardInk = {
  id: string;
  label: string;
  color: string;
};

export type CardFace = {
  id: string;
  label: string;
  family: string;
  stack: string;
  weight: number;
  inks: readonly CardInk[];
};

export type CardTypeface = CardFace & {
  inkId: string;
  color: string;
};

export function withInk(face: CardFace, inkId?: string): CardTypeface {
  const ink = face.inks.find((item) => item.id === inkId) ?? face.inks[0];
  return { ...face, inkId: ink.id, color: ink.color };
}

export const CARD_TYPES: readonly CardFace[] = [
  {
    id: "vault",
    label: "Vault",
    family: "Unbounded",
    stack: "Unbounded, ui-sans-serif, sans-serif",
    weight: 700,
    inks: [
      { id: "ivory", label: "Ivory", color: "#fff8ee" },
      { id: "mint", label: "Mint", color: "#3ecf8e" },
      { id: "gold", label: "Gold", color: "#e8c36a" },
      { id: "sage", label: "Sage", color: "#9dd4b0" },
      { id: "frost", label: "Frost", color: "#e8eef2" },
    ],
  },
  {
    id: "exhibit",
    label: "Exhibit",
    family: "Cinzel",
    stack: "Cinzel, 'Times New Roman', serif",
    weight: 700,
    inks: [
      { id: "gilt", label: "Gilt", color: "#e8c36a" },
      { id: "bone", label: "Bone", color: "#f3e6c8" },
      { id: "copper", label: "Copper", color: "#c87a4a" },
      { id: "jade", label: "Jade", color: "#3ecf8e" },
      { id: "marble", label: "Marble", color: "#f4f1ea" },
    ],
  },
  {
    id: "metro",
    label: "Metro",
    family: "Oswald",
    stack: "Oswald, ui-sans-serif, sans-serif",
    weight: 700,
    inks: [
      { id: "moon", label: "Moon", color: "#e8eef2" },
      { id: "sodium", label: "Sodium", color: "#e8b86d" },
      { id: "steel", label: "Steel", color: "#c5cdd4" },
      { id: "ember", label: "Ember", color: "#e07a5f" },
      { id: "lagoon", label: "Lagoon", color: "#5ecfbc" },
    ],
  },
  {
    id: "amber",
    label: "Amber",
    family: "Fraunces",
    stack: "Fraunces, 'Times New Roman', serif",
    weight: 700,
    inks: [
      { id: "honey", label: "Honey", color: "#e8c36a" },
      { id: "resin", label: "Resin", color: "#d4a04a" },
      { id: "ivory", label: "Ivory", color: "#fff4e0" },
      { id: "moss", label: "Moss", color: "#7dbe8a" },
      { id: "pearl", label: "Pearl", color: "#f7efe0" },
    ],
  },
  {
    id: "signal",
    label: "Signal",
    family: "Syne",
    stack: "Syne, ui-sans-serif, sans-serif",
    weight: 700,
    inks: [
      { id: "mint", label: "Mint", color: "#3ecf8e" },
      { id: "champagne", label: "Champagne", color: "#f0d9a0" },
      { id: "lagoon", label: "Lagoon", color: "#4ecdc4" },
      { id: "blush", label: "Blush", color: "#d4a0b0" },
      { id: "porcelain", label: "Porcelain", color: "#f1f5f9" },
    ],
  },
  {
    id: "crest",
    label: "Crest",
    family: "Marcellus",
    stack: "Marcellus, 'Times New Roman', serif",
    weight: 400,
    inks: [
      { id: "gold", label: "Gold", color: "#e8c36a" },
      { id: "bone", label: "Bone", color: "#f3e6c8" },
      { id: "bronze", label: "Bronze", color: "#c4905a" },
      { id: "sage", label: "Sage", color: "#9dd4b0" },
      { id: "cream", label: "Cream", color: "#fff8ee" },
    ],
  },
  {
    id: "night",
    label: "Night",
    family: "Outfit",
    stack: "Outfit, ui-sans-serif, sans-serif",
    weight: 700,
    inks: [
      { id: "moonlight", label: "Moonlight", color: "#eef2f6" },
      { id: "mint", label: "Mint", color: "#3ecf8e" },
      { id: "gold", label: "Gold", color: "#e8c36a" },
      { id: "dusk", label: "Dusk", color: "#c4b5fd" },
      { id: "pearl", label: "Pearl", color: "#f4f1ea" },
    ],
  },
  {
    id: "cast",
    label: "Cast",
    family: "Space Grotesk",
    stack: "'Space Grotesk', ui-sans-serif, sans-serif",
    weight: 700,
    inks: [
      { id: "ivory", label: "Ivory", color: "#fff8ee" },
      { id: "mint", label: "Mint", color: "#3ecf8e" },
      { id: "brass", label: "Brass", color: "#d4af6a" },
      { id: "silver", label: "Silver", color: "#d0d5db" },
      { id: "rose", label: "Rose", color: "#e8b4a0" },
    ],
  },
] as const;

export const DEFAULT_TYPE = withInk(CARD_TYPES[0]);
