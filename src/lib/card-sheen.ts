import { roundRect } from "@/lib/card-layouts";
import { PAPER } from "@/lib/card-templates";
import { hexAlpha, type CardTheme } from "@/lib/card-themes";

export type CardSheen = {
  id: string;
  label: string;
  hint: string;
  swatch: string;
};

export const CARD_SHEENS: readonly CardSheen[] = [
  {
    id: "matte",
    label: "Matte",
    hint: "Flat print. No foil.",
    swatch: "linear-gradient(145deg,#1a2420,#0c1411)",
  },
  {
    id: "metallic",
    label: "Metallic",
    hint: "Brushed steel over the wash.",
    swatch: "linear-gradient(135deg,#f4f4f5,#8b9198 38%,#e8eaed 55%,#5c636b 78%,#d4d6d9)",
  },
  {
    id: "neon",
    label: "Neon",
    hint: "Electric rim. Night-club glow.",
    swatch: "linear-gradient(135deg,#22d3ee,#3ecf8e 40%,#f0abfc 72%,#22d3ee)",
  },
  {
    id: "gold",
    label: "Gold",
    hint: "Warm vault foil.",
    swatch: "linear-gradient(135deg,#fff4c4,#e8c36a 32%,#8a6418 58%,#f4e2a8 78%,#c4922c)",
  },
  {
    id: "bronze",
    label: "Bronze",
    hint: "Copper coin finish.",
    swatch: "linear-gradient(135deg,#f3c19d,#c47a4a 34%,#6b3a1c 58%,#e0a06a 80%,#8d4f28)",
  },
  {
    id: "silver",
    label: "Silver",
    hint: "Cold platinum edge.",
    swatch: "linear-gradient(135deg,#ffffff,#d4d8de 30%,#8d949c 55%,#f2f4f6 76%,#a8aeb6)",
  },
  {
    id: "holo",
    label: "Holo",
    hint: "Prism flash. Collectable.",
    swatch: "linear-gradient(135deg,#fb7185,#facc15 22%,#3ecf8e 44%,#22d3ee 66%,#c084fc 86%,#fb7185)",
  },
] as const;

export type CardSheenId = (typeof CARD_SHEENS)[number]["id"];

export const DEFAULT_SHEEN = CARD_SHEENS[0];

export function sheenById(id: string) {
  return CARD_SHEENS.find((s) => s.id === id) ?? DEFAULT_SHEEN;
}

function clipPaper(ctx: CanvasRenderingContext2D) {
  roundRect(ctx, PAPER.x, PAPER.y, PAPER.w, PAPER.h, 28);
  ctx.clip();
}

function band(
  ctx: CanvasRenderingContext2D,
  stops: ReadonlyArray<readonly [number, string]>,
  mode: GlobalCompositeOperation,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  for (const [t, c] of stops) g.addColorStop(t, c);
  ctx.globalCompositeOperation = mode;
  ctx.fillStyle = g;
  ctx.fillRect(PAPER.x, PAPER.y, PAPER.w, PAPER.h);
  ctx.globalCompositeOperation = "source-over";
}

function rim(ctx: CanvasRenderingContext2D, colors: readonly string[], width = 8) {
  const g = ctx.createLinearGradient(PAPER.x, PAPER.y, PAPER.x + PAPER.w, PAPER.y + PAPER.h);
  colors.forEach((c, i) => g.addColorStop(i / Math.max(1, colors.length - 1), c));
  roundRect(ctx, PAPER.x, PAPER.y, PAPER.w, PAPER.h, 28);
  ctx.strokeStyle = g;
  ctx.lineWidth = width;
  ctx.stroke();
  roundRect(ctx, PAPER.x + 5.5, PAPER.y + 5.5, PAPER.w - 11, PAPER.h - 11, 23);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1.3;
  ctx.stroke();
}

function drawMatte(_ctx: CanvasRenderingContext2D, _theme: CardTheme) {
  /* print stock — no extra finish */
}

function drawMetallic(ctx: CanvasRenderingContext2D, _theme: CardTheme) {
  ctx.save();
  clipPaper(ctx);
  band(
    ctx,
    [
      [0, "rgba(255,255,255,0.22)"],
      [0.22, "rgba(160,168,176,0.08)"],
      [0.48, "rgba(255,255,255,0.2)"],
      [0.7, "rgba(90,96,104,0.16)"],
      [1, "rgba(230,234,238,0.12)"],
    ],
    "overlay",
    PAPER.x,
    PAPER.y,
    PAPER.x + PAPER.w,
    PAPER.y + PAPER.h,
  );
  band(
    ctx,
    [
      [0, "rgba(255,255,255,0)"],
      [0.42, "rgba(255,255,255,0)"],
      [0.5, "rgba(255,255,255,0.28)"],
      [0.58, "rgba(255,255,255,0)"],
      [1, "rgba(255,255,255,0)"],
    ],
    "soft-light",
    PAPER.x - 80,
    PAPER.y + 200,
    PAPER.x + PAPER.w + 80,
    PAPER.y + PAPER.h - 160,
  );
  ctx.restore();
  rim(ctx, ["#f4f4f5", "#8b9198", "#e8eaed", "#5c636b", "#d4d6d9"], 7.5);
}

function drawNeon(ctx: CanvasRenderingContext2D, theme: CardTheme) {
  ctx.save();
  clipPaper(ctx);
  const glow = ctx.createRadialGradient(450, 200, 40, 450, 600, 780);
  glow.addColorStop(0, hexAlpha(theme.inner, 0.18));
  glow.addColorStop(0.55, "rgba(34,211,238,0.06)");
  glow.addColorStop(1, "rgba(240,171,252,0.1)");
  ctx.fillStyle = glow;
  ctx.fillRect(PAPER.x, PAPER.y, PAPER.w, PAPER.h);
  ctx.restore();

  ctx.save();
  ctx.shadowColor = theme.inner;
  ctx.shadowBlur = 22;
  roundRect(ctx, PAPER.x + 3, PAPER.y + 3, PAPER.w - 6, PAPER.h - 6, 26);
  ctx.strokeStyle = theme.inner;
  ctx.lineWidth = 3.2;
  ctx.stroke();
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 16;
  ctx.strokeStyle = "#22d3ee";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = hexAlpha("#f0abfc", 0.7);
  ctx.lineWidth = 1.2;
  roundRect(ctx, PAPER.x + 11, PAPER.y + 11, PAPER.w - 22, PAPER.h - 22, 20);
  ctx.stroke();
  ctx.restore();
}

function drawGold(ctx: CanvasRenderingContext2D, _theme: CardTheme) {
  ctx.save();
  clipPaper(ctx);
  band(
    ctx,
    [
      [0, "rgba(255,244,196,0.28)"],
      [0.28, "rgba(232,195,106,0.14)"],
      [0.52, "rgba(138,100,24,0.16)"],
      [0.74, "rgba(244,226,168,0.2)"],
      [1, "rgba(196,146,44,0.12)"],
    ],
    "overlay",
    PAPER.x,
    PAPER.y,
    PAPER.x + PAPER.w,
    PAPER.y + PAPER.h,
  );
  band(
    ctx,
    [
      [0, "rgba(255,244,196,0)"],
      [0.46, "rgba(255,244,196,0)"],
      [0.52, "rgba(255,248,220,0.42)"],
      [0.58, "rgba(255,244,196,0)"],
      [1, "rgba(255,244,196,0)"],
    ],
    "soft-light",
    PAPER.x + 40,
    PAPER.y - 40,
    PAPER.x + PAPER.w - 40,
    PAPER.y + PAPER.h + 40,
  );
  ctx.restore();
  rim(ctx, ["#fff4c4", "#e8c36a", "#8a6418", "#f4e2a8", "#c4922c"], 8.5);
}

function drawBronze(ctx: CanvasRenderingContext2D, _theme: CardTheme) {
  ctx.save();
  clipPaper(ctx);
  band(
    ctx,
    [
      [0, "rgba(243,193,157,0.26)"],
      [0.3, "rgba(196,122,74,0.14)"],
      [0.55, "rgba(107,58,28,0.18)"],
      [0.78, "rgba(224,160,106,0.16)"],
      [1, "rgba(141,79,40,0.12)"],
    ],
    "overlay",
    PAPER.x,
    PAPER.y + PAPER.h,
    PAPER.x + PAPER.w,
    PAPER.y,
  );
  ctx.restore();
  rim(ctx, ["#f3c19d", "#c47a4a", "#6b3a1c", "#e0a06a", "#8d4f28"], 8.5);
}

function drawSilver(ctx: CanvasRenderingContext2D, _theme: CardTheme) {
  ctx.save();
  clipPaper(ctx);
  band(
    ctx,
    [
      [0, "rgba(255,255,255,0.26)"],
      [0.24, "rgba(212,216,222,0.1)"],
      [0.5, "rgba(141,148,156,0.16)"],
      [0.72, "rgba(242,244,246,0.2)"],
      [1, "rgba(168,174,182,0.1)"],
    ],
    "overlay",
    PAPER.x,
    PAPER.y,
    PAPER.x + PAPER.w,
    PAPER.y + PAPER.h,
  );
  band(
    ctx,
    [
      [0, "rgba(255,255,255,0)"],
      [0.5, "rgba(255,255,255,0.34)"],
      [1, "rgba(255,255,255,0)"],
    ],
    "soft-light",
    PAPER.x + PAPER.w,
    PAPER.y,
    PAPER.x,
    PAPER.y + PAPER.h,
  );
  ctx.restore();
  rim(ctx, ["#ffffff", "#d4d8de", "#8d949c", "#f2f4f6", "#a8aeb6"], 8);
}

function drawHolo(ctx: CanvasRenderingContext2D, _theme: CardTheme) {
  ctx.save();
  clipPaper(ctx);
  band(
    ctx,
    [
      [0, "rgba(251,113,133,0.2)"],
      [0.2, "rgba(250,204,21,0.16)"],
      [0.4, "rgba(62,207,142,0.16)"],
      [0.6, "rgba(34,211,238,0.16)"],
      [0.8, "rgba(192,132,252,0.18)"],
      [1, "rgba(251,113,133,0.12)"],
    ],
    "overlay",
    PAPER.x - 40,
    PAPER.y + 80,
    PAPER.x + PAPER.w + 40,
    PAPER.y + PAPER.h - 40,
  );
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    ctx.fillStyle = `rgba(255,255,255,${0.035 + (i % 2) * 0.02})`;
    ctx.fillRect(PAPER.x + t * PAPER.w - 18, PAPER.y, 14, PAPER.h);
  }
  ctx.restore();
  rim(ctx, ["#fb7185", "#facc15", "#3ecf8e", "#22d3ee", "#c084fc", "#fb7185"], 8);
}

const DRAWS: Record<CardSheenId, (ctx: CanvasRenderingContext2D, theme: CardTheme) => void> = {
  matte: drawMatte,
  metallic: drawMetallic,
  neon: drawNeon,
  gold: drawGold,
  bronze: drawBronze,
  silver: drawSilver,
  holo: drawHolo,
};

export function drawCardSheen(ctx: CanvasRenderingContext2D, sheen: CardSheen, theme: CardTheme) {
  const draw = DRAWS[sheen.id as CardSheenId];
  if (!draw) return;
  draw(ctx, theme);
}
