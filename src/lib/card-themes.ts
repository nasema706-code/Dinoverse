export type CardTheme = {
  id: string;
  label: string;
  wash0: string;
  wash1: string;
  wash2: string;
  border: string;
  inner: string;
  ink: string;
  cream: string;
  panel: string;
  artVoid: string;
  highlight: string;
  ribbonInk: string;
  pills: readonly [{ fill: string; text: string }, { fill: string; text: string }, { fill: string; text: string }];
};

export const CARD_THEMES: readonly CardTheme[] = [
  {
    id: "mint",
    label: "Mint floor",
    wash0: "#164c38",
    wash1: "#0b241c",
    wash2: "#06140f",
    border: "#e8c36a",
    inner: "#3ecf8e",
    ink: "#06140f",
    cream: "#fff8ee",
    panel: "#0b1c16",
    artVoid: "#0b1f18",
    highlight: "#e8c36a",
    ribbonInk: "#06140f",
    pills: [
      { fill: "#3ecf8e", text: "#06140f" },
      { fill: "#e8c36a", text: "#1a1408" },
      { fill: "#b8ff6a", text: "#06140f" },
    ],
  },
  {
    id: "teal",
    label: "Teal lagoon",
    wash0: "#155e75",
    wash1: "#0b3a44",
    wash2: "#062028",
    border: "#5eead4",
    inner: "#2dd4bf",
    ink: "#042f2e",
    cream: "#ecfeff",
    panel: "#0a2e32",
    artVoid: "#08343a",
    highlight: "#fde68a",
    ribbonInk: "#042f2e",
    pills: [
      { fill: "#2dd4bf", text: "#042f2e" },
      { fill: "#fde68a", text: "#1c1504" },
      { fill: "#67e8f9", text: "#083344" },
    ],
  },
  {
    id: "lavender",
    label: "Violet dusk",
    wash0: "#5b21b6",
    wash1: "#2e1065",
    wash2: "#1a0b2e",
    border: "#e9d5ff",
    inner: "#c4b5fd",
    ink: "#1e1033",
    cream: "#faf5ff",
    panel: "#2a1848",
    artVoid: "#24143c",
    highlight: "#f0abfc",
    ribbonInk: "#1e1033",
    pills: [
      { fill: "#c4b5fd", text: "#1e1033" },
      { fill: "#f0abfc", text: "#3b0764" },
      { fill: "#ddd6fe", text: "#2e1065" },
    ],
  },
  {
    id: "sunset",
    label: "Sunset punch",
    wash0: "#9f1239",
    wash1: "#4c0519",
    wash2: "#1c0a10",
    border: "#fb7185",
    inner: "#fbbf24",
    ink: "#1c0a10",
    cream: "#fff7ed",
    panel: "#3f0d1a",
    artVoid: "#2a0c14",
    highlight: "#fdba74",
    ribbonInk: "#1c0a10",
    pills: [
      { fill: "#fb7185", text: "#1c0a10" },
      { fill: "#fbbf24", text: "#1c1404" },
      { fill: "#fdba74", text: "#1c0a10" },
    ],
  },
  {
    id: "mango",
    label: "Mango volt",
    wash0: "#854d0e",
    wash1: "#3f2a08",
    wash2: "#140f06",
    border: "#facc15",
    inner: "#84cc16",
    ink: "#140f06",
    cream: "#fffbeb",
    panel: "#2a220c",
    artVoid: "#1f1908",
    highlight: "#fde047",
    ribbonInk: "#140f06",
    pills: [
      { fill: "#facc15", text: "#1c1504" },
      { fill: "#a3e635", text: "#14532d" },
      { fill: "#fb923c", text: "#1c0a04" },
    ],
  },
  {
    id: "candy",
    label: "Candy reef",
    wash0: "#9d174d",
    wash1: "#3b0764",
    wash2: "#12081f",
    border: "#fb64b6",
    inner: "#22d3ee",
    ink: "#12081f",
    cream: "#fff1f2",
    panel: "#2a1040",
    artVoid: "#1c0a2e",
    highlight: "#67e8f9",
    ribbonInk: "#12081f",
    pills: [
      { fill: "#fb64b6", text: "#12081f" },
      { fill: "#22d3ee", text: "#083344" },
      { fill: "#c084fc", text: "#1e1033" },
    ],
  },
] as const;

export type CardThemeId = (typeof CARD_THEMES)[number]["id"];

export const DEFAULT_THEME = CARD_THEMES[0];

export function themeById(id: string) {
  return CARD_THEMES.find((t) => t.id === id) ?? DEFAULT_THEME;
}

export function hexAlpha(hex: string, a: number) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
