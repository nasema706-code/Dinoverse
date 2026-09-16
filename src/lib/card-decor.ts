import { VINYLS, drawVinylKind, isVinylKind, type VinylKind } from "@/lib/card-vinyl";

export { VINYLS, isVinylKind };
export type { VinylKind };

export const DECORS = [
  { id: "fern", label: "Fern" },
  { id: "leaf", label: "Leaf" },
  { id: "palm", label: "Palm" },
  { id: "tree", label: "Tree" },
  { id: "bone", label: "Bone" },
  { id: "ribs", label: "Ribs" },
  { id: "fossil", label: "Fossil" },
  { id: "print", label: "Print" },
  { id: "coin", label: "Coin" },
  { id: "egg", label: "Egg" },
  { id: "hatch", label: "Hatch" },
  { id: "rex", label: "Rex" },
  { id: "raptor", label: "Raptor" },
  { id: "stego", label: "Stego" },
  { id: "trike", label: "Trike" },
  { id: "neck", label: "Titan" },
  { id: "ptero", label: "Ptero" },
  { id: "sail", label: "Sail" },
  { id: "anky", label: "Anky" },
  { id: "claw", label: "Claw" },
  { id: "tooth", label: "Tooth" },
  { id: "nest", label: "Nest" },
  { id: "roar", label: "Jaws" },
  { id: "heart", label: "Sigil" },
  { id: "crest", label: "Crest" },
  { id: "baby", label: "Cub" },
  { id: "amber", label: "Amber" },
  { id: "dilop", label: "Fan" },
  { id: "mosa", label: "Mosa" },
] as const;

export type MetallicKind = (typeof DECORS)[number]["id"];
export type DecorKind = MetallicKind | VinylKind;

export type CardSticker = {
  id: string;
  kind: DecorKind;
  x: number;
  y: number;
  scale: number;
  rot: number;
  flip: boolean;
};

const GOLD = "#e8c36a";
const GOLD_LT = "#f4e2a8";
const GOLD_DK = "#9a7030";
const BONE = "#e8d7b0";
const BONE_DK = "#b8965a";
const MINT = "#3ecf8e";
const INK = "#07110e";

type Seal = "disc" | "hex" | "shield";

const SEALS: Record<MetallicKind, { wash0: string; wash1: string; shape: Seal }> = {
  fern: { wash0: "#145c3a", wash1: "#062016", shape: "disc" },
  leaf: { wash0: "#1a6b3c", wash1: "#07180e", shape: "disc" },
  palm: { wash0: "#0f5c52", wash1: "#041816", shape: "hex" },
  tree: { wash0: "#164a2e", wash1: "#06140c", shape: "disc" },
  bone: { wash0: "#4a3a22", wash1: "#16100a", shape: "disc" },
  ribs: { wash0: "#3a3228", wash1: "#12100c", shape: "hex" },
  fossil: { wash0: "#5a4820", wash1: "#1a1408", shape: "disc" },
  print: { wash0: "#5a2818", wash1: "#160806", shape: "disc" },
  coin: { wash0: "#6a5018", wash1: "#1c1406", shape: "disc" },
  egg: { wash0: "#6a4a1c", wash1: "#1a1006", shape: "disc" },
  hatch: { wash0: "#5a3814", wash1: "#160e06", shape: "hex" },
  rex: { wash0: "#6a1c1c", wash1: "#180808", shape: "shield" },
  raptor: { wash0: "#3a1860", wash1: "#10081c", shape: "hex" },
  stego: { wash0: "#2a4a20", wash1: "#0c1408", shape: "disc" },
  trike: { wash0: "#16485a", wash1: "#061418", shape: "shield" },
  neck: { wash0: "#1c4a38", wash1: "#081410", shape: "disc" },
  ptero: { wash0: "#18305a", wash1: "#080e1c", shape: "hex" },
  sail: { wash0: "#4a1840", wash1: "#140810", shape: "shield" },
  anky: { wash0: "#4a3818", wash1: "#141008", shape: "disc" },
  claw: { wash0: "#5a1428", wash1: "#16080c", shape: "hex" },
  tooth: { wash0: "#4a4030", wash1: "#14120c", shape: "disc" },
  nest: { wash0: "#4a2c14", wash1: "#140c08", shape: "disc" },
  roar: { wash0: "#6a2410", wash1: "#180a06", shape: "shield" },
  heart: { wash0: "#4a1428", wash1: "#14080e", shape: "disc" },
  crest: { wash0: "#1c2860", wash1: "#080c1c", shape: "hex" },
  baby: { wash0: "#2a4038", wash1: "#0c1412", shape: "disc" },
  amber: { wash0: "#6a3a10", wash1: "#1a1004", shape: "hex" },
  dilop: { wash0: "#3a2050", wash1: "#100818", shape: "disc" },
  mosa: { wash0: "#0e3a48", wash1: "#041218", shape: "hex" },
};

export function stickerRadius(s: CardSticker) {
  return 56 * s.scale;
}

export function hitSticker(s: CardSticker, x: number, y: number) {
  return Math.hypot(x - s.x, y - s.y) <= stickerRadius(s);
}

export function newSticker(kind: DecorKind, x: number, y: number): CardSticker {
  return {
    id: `${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    x,
    y,
    scale: 1,
    rot: 0,
    flip: false,
  };
}

function sealPath(ctx: CanvasRenderingContext2D, shape: Seal, r: number) {
  ctx.beginPath();
  if (shape === "hex") {
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 6) + (i * Math.PI) / 3;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    return;
  }
  if (shape === "shield") {
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.95, -r * 0.86, r * 0.88, -r * 0.18);
    ctx.quadraticCurveTo(r * 0.7, r * 0.42, 0, r);
    ctx.quadraticCurveTo(-r * 0.7, r * 0.42, -r * 0.88, -r * 0.18);
    ctx.quadraticCurveTo(-r * 0.95, -r * 0.86, 0, -r);
    ctx.closePath();
    return;
  }
  ctx.arc(0, 0, r, 0, Math.PI * 2);
}

function drawSeal(ctx: CanvasRenderingContext2D, kind: MetallicKind) {
  const { wash0, wash1, shape } = SEALS[kind];
  const r = 40;
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  sealPath(ctx, shape, r + 2.2);
  ctx.fill();
  const metal = ctx.createLinearGradient(-r, -r, r, r);
  metal.addColorStop(0, GOLD_LT);
  metal.addColorStop(0.28, GOLD);
  metal.addColorStop(0.55, GOLD_DK);
  metal.addColorStop(0.78, GOLD);
  metal.addColorStop(1, GOLD_LT);
  sealPath(ctx, shape, r);
  ctx.fillStyle = metal;
  ctx.fill();
  const well = ctx.createRadialGradient(-8, -10, 3, 2, 4, r - 6);
  well.addColorStop(0, wash0);
  well.addColorStop(0.62, wash1);
  well.addColorStop(1, "#050806");
  sealPath(ctx, shape, r - 5);
  ctx.fillStyle = well;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,244,210,0.28)";
  ctx.lineWidth = 1;
  sealPath(ctx, shape, r - 7.2);
  ctx.stroke();
  ctx.save();
  ctx.strokeStyle = GOLD_DK;
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (r - 1.2), Math.sin(a) * (r - 1.2));
    ctx.lineTo(Math.cos(a) * (r - 3.6), Math.sin(a) * (r - 3.6));
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(-9, -11, r * 0.5, -2.45, -0.35);
  ctx.stroke();
}

function fillIcon(ctx: CanvasRenderingContext2D, color: string, stroke = GOLD_DK) {
  ctx.fillStyle = color;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = "round";
  ctx.fill();
  ctx.stroke();
}

function drawFern(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = MINT;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.quadraticCurveTo(-2, -2, 1, -20);
  ctx.stroke();
  ctx.fillStyle = BONE;
  ctx.strokeStyle = GOLD_DK;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const y = 14 - t * 32;
    const w = 13 * (1 - t * 0.4);
    ctx.beginPath();
    ctx.ellipse(w * 0.55, y, w, 3.2, -0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-w * 0.5, y - 2, w * 0.9, 3, 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawLeaf(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.rotate(-0.4);
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.bezierCurveTo(16, 8, 18, -6, 2, -20);
  ctx.bezierCurveTo(-4, -6, -16, 6, 0, 18);
  fillIcon(ctx, BONE);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.quadraticCurveTo(3, 0, 1, -18);
  ctx.stroke();
  ctx.restore();
}

function drawPalm(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = GOLD_DK;
  ctx.beginPath();
  ctx.moveTo(-4, 18);
  ctx.lineTo(4, 18);
  ctx.lineTo(2.4, -2);
  ctx.lineTo(-2.2, -2);
  ctx.fill();
  ctx.fillStyle = BONE;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI + (i / 6) * Math.PI;
    ctx.save();
    ctx.translate(0, -4);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(10, -6, 22, 2);
    ctx.quadraticCurveTo(8, 3, 0, 0);
    ctx.fill();
    ctx.restore();
  }
}

function drawTree(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = GOLD_DK;
  ctx.beginPath();
  ctx.moveTo(-5, 18);
  ctx.lineTo(5, 18);
  ctx.lineTo(3, 2);
  ctx.lineTo(-3, 2);
  ctx.fill();
  ctx.fillStyle = BONE;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(16, 6);
  ctx.lineTo(-16, 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(10, 2);
  ctx.lineTo(-10, 2);
  ctx.closePath();
  ctx.fill();
}

function drawBone(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.rotate(-0.55);
  ctx.beginPath();
  ctx.roundRect(-5, -14, 10, 28, 4);
  fillIcon(ctx, BONE);
  const knob = (x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    fillIcon(ctx, BONE);
  };
  knob(-6, -16);
  knob(6, -16);
  knob(-6, 16);
  knob(6, 16);
  ctx.restore();
}

function drawRibs(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = BONE;
  ctx.strokeStyle = GOLD_DK;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) {
    const y = -10 + i * 10;
    ctx.beginPath();
    ctx.moveTo(-16, y);
    ctx.quadraticCurveTo(0, y - 12, 16, y + 2);
    ctx.quadraticCurveTo(0, y - 4, -16, y);
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.roundRect(-4, -18, 6, 36, 3);
  fillIcon(ctx, BONE);
}

function drawFossil(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = GOLD;
  ctx.lineCap = "round";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  let r = 3;
  for (let a = 0; a < Math.PI * 3.8; a += 0.14) {
    r = 3 + a * 2.35;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = BONE;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = GOLD_LT;
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawPrint(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = BONE;
  ctx.strokeStyle = GOLD_DK;
  ctx.lineWidth = 1.4;
  const toe = (x: number, y: number, rot: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  toe(-10, -8, -0.4);
  toe(0, -12, 0);
  toe(10, -8, 0.4);
  ctx.beginPath();
  ctx.ellipse(0, 8, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawCoin(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GOLD_DK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = "700 16px Unbounded, ui-sans-serif, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("D", 0, 1);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function drawEgg(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.ellipse(0, 1, 13, 17, 0, 0, Math.PI * 2);
  fillIcon(ctx, BONE);
  ctx.fillStyle = GOLD_DK;
  ctx.beginPath();
  ctx.ellipse(-4, -4, 2.4, 1.8, 0.4, 0, Math.PI * 2);
  ctx.ellipse(5, 2, 2.8, 2, -0.2, 0, Math.PI * 2);
  ctx.ellipse(-2, 8, 2.2, 1.6, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawHatch(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = GOLD_DK;
  ctx.beginPath();
  ctx.ellipse(0, 10, 16, 8, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = BONE;
  ctx.beginPath();
  ctx.moveTo(-16, 10);
  ctx.lineTo(-8, 2);
  ctx.lineTo(-2, 10);
  ctx.lineTo(4, 0);
  ctx.lineTo(10, 10);
  ctx.lineTo(16, 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = BONE_DK;
  ctx.beginPath();
  ctx.moveTo(-2, -2);
  ctx.quadraticCurveTo(8, -14, 14, -4);
  ctx.lineTo(6, 2);
  ctx.closePath();
  ctx.fill();
}

function drawRex(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-16, 6);
  ctx.quadraticCurveTo(-18, -8, -4, -12);
  ctx.quadraticCurveTo(10, -16, 18, -8);
  ctx.lineTo(22, -2);
  ctx.quadraticCurveTo(16, 4, 6, 6);
  ctx.quadraticCurveTo(-6, 14, -16, 6);
  fillIcon(ctx, BONE);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(4, 2);
  ctx.lineTo(18, 2);
  ctx.lineTo(16, 6);
  ctx.lineTo(6, 6);
  ctx.fill();
  ctx.fillStyle = BONE;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(7 + i * 4, 6);
    ctx.lineTo(8.4 + i * 4, 10);
    ctx.lineTo(10 + i * 4, 6);
    ctx.fill();
  }
}

function drawRaptor(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.quadraticCurveTo(-10, -8, 4, -10);
  ctx.quadraticCurveTo(16, -12, 20, -4);
  ctx.lineTo(22, 2);
  ctx.quadraticCurveTo(10, 6, 2, 10);
  ctx.quadraticCurveTo(-10, 14, -14, 8);
  fillIcon(ctx, BONE);
  ctx.beginPath();
  ctx.moveTo(2, 10);
  ctx.lineTo(16, 18);
  ctx.lineTo(6, 12);
  fillIcon(ctx, GOLD);
}

function drawStego(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.ellipse(0, 8, 18, 8, 0, 0, Math.PI * 2);
  fillIcon(ctx, BONE);
  ctx.fillStyle = GOLD;
  const plates = [-10, -2, 6, 13];
  plates.forEach((x, i) => {
    ctx.beginPath();
    ctx.moveTo(x - 4, 6);
    ctx.lineTo(x, -12 - (i % 2) * 3);
    ctx.lineTo(x + 4, 6);
    ctx.fill();
  });
}

function drawTrike(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.ellipse(0, -4, 16, 12, 0, Math.PI * 1.15, Math.PI * 1.85);
  ctx.lineTo(8, 6);
  ctx.lineTo(-8, 6);
  ctx.closePath();
  fillIcon(ctx, GOLD);
  ctx.beginPath();
  ctx.ellipse(0, 8, 9, 8, 0, 0, Math.PI * 2);
  fillIcon(ctx, BONE);
  ctx.fillStyle = BONE;
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(-18, -12);
  ctx.lineTo(-6, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(18, -12);
  ctx.lineTo(6, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(2.4, 18);
  ctx.lineTo(-2.4, 18);
  ctx.fill();
}

function drawNeck(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = BONE;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-12, 16);
  ctx.quadraticCurveTo(-4, -2, 10, -12);
  ctx.stroke();
  ctx.strokeStyle = GOLD_DK;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(14, -14, 7, 5.5, 0.4, 0, Math.PI * 2);
  fillIcon(ctx, BONE);
}

function drawPtero(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = BONE;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.quadraticCurveTo(-22, -14, -18, 4);
  ctx.quadraticCurveTo(-8, 2, 0, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.quadraticCurveTo(22, -14, 18, 4);
  ctx.quadraticCurveTo(8, 2, 0, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 4, 5, 6, 0, 0, Math.PI * 2);
  fillIcon(ctx, GOLD);
  ctx.fillStyle = BONE;
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(16, -4);
  ctx.lineTo(6, 4);
  ctx.fill();
}

function drawSail(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(-8, 6);
  ctx.lineTo(-4, -18);
  ctx.lineTo(4, -20);
  ctx.lineTo(9, -10);
  ctx.lineTo(6, 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = GOLD_LT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2, 4);
  ctx.lineTo(0, -16);
  ctx.moveTo(3, 4);
  ctx.lineTo(5, -12);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 10, 14, 7, 0, 0, Math.PI * 2);
  fillIcon(ctx, BONE);
}

function drawAnky(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.ellipse(-2, 2, 13, 9, 0, 0, Math.PI * 2);
  fillIcon(ctx, BONE);
  ctx.fillStyle = GOLD;
  [
    [-8, -4],
    [2, -7],
    [8, -2],
    [-8, 6],
  ].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.beginPath();
  ctx.arc(16, 8, 6, 0, Math.PI * 2);
  fillIcon(ctx, GOLD);
}

function drawClaw(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.rotate(-0.55);
  ctx.beginPath();
  ctx.moveTo(-4, 14);
  ctx.quadraticCurveTo(-8, -4, 3, -18);
  ctx.quadraticCurveTo(8, -2, 5, 14);
  ctx.closePath();
  fillIcon(ctx, BONE);
  ctx.fillStyle = GOLD_LT;
  ctx.beginPath();
  ctx.moveTo(2, -16);
  ctx.quadraticCurveTo(10, -22, 5, -10);
  ctx.fill();
  ctx.restore();
}

function drawTooth(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-8, -12);
  ctx.lineTo(8, -12);
  ctx.quadraticCurveTo(9, 4, 0, 18);
  ctx.quadraticCurveTo(-9, 4, -8, -12);
  ctx.closePath();
  fillIcon(ctx, BONE);
  ctx.fillStyle = "rgba(255,244,220,0.45)";
  ctx.beginPath();
  ctx.moveTo(-3, -8);
  ctx.quadraticCurveTo(0, 4, 0, 14);
  ctx.quadraticCurveTo(-4, 2, -3, -8);
  ctx.fill();
}

function drawNest(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = GOLD_DK;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 6, 6 + Math.sin(a) * 3);
    ctx.quadraticCurveTo(0, 12, Math.cos(a) * 16, 12 + Math.sin(a) * 5);
    ctx.stroke();
  }
  ctx.fillStyle = BONE;
  ctx.beginPath();
  ctx.ellipse(-5, 0, 4.5, 6, -0.2, 0, Math.PI * 2);
  ctx.ellipse(5, -1, 4.2, 5.6, 0.15, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoar(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-12, -6);
  ctx.quadraticCurveTo(0, -16, 14, -4);
  ctx.lineTo(12, 8);
  ctx.quadraticCurveTo(0, 2, -10, 8);
  ctx.closePath();
  fillIcon(ctx, BONE);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.quadraticCurveTo(0, -6, 8, 0);
  ctx.lineTo(6, 6);
  ctx.quadraticCurveTo(0, 2, -5, 6);
  ctx.fill();
  ctx.fillStyle = BONE;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-3 + i * 5, 5);
    ctx.lineTo(-1.6 + i * 5, 10);
    ctx.lineTo(0.4 + i * 5, 5);
    ctx.fill();
  }
}

function drawHeart(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.bezierCurveTo(-16, 2, -12, -14, 0, -4);
  ctx.bezierCurveTo(12, -14, 16, 2, 0, 14);
  fillIcon(ctx, GOLD);
  ctx.fillStyle = BONE;
  ctx.beginPath();
  ctx.ellipse(-3, 0, 2.2, 5.5, -0.35, 0, Math.PI * 2);
  ctx.ellipse(3, -1, 2.2, 5.5, 0.2, 0, Math.PI * 2);
  ctx.ellipse(0, 6, 4, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCrest(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, 6);
  ctx.quadraticCurveTo(6, -16, 16, -12);
  ctx.stroke();
  ctx.strokeStyle = BONE;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-4, 10, 9, 7, 0.15, 0, Math.PI * 2);
  fillIcon(ctx, BONE);
}

function drawBaby(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.ellipse(0, 4, 11, 9, 0, 0, Math.PI * 2);
  fillIcon(ctx, BONE);
  ctx.beginPath();
  ctx.ellipse(0, -6, 8.5, 7.5, 0, 0, Math.PI * 2);
  fillIcon(ctx, BONE);
}

function drawAmber(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.bezierCurveTo(14, -10, 14, 8, 4, 16);
  ctx.bezierCurveTo(-2, 12, -14, 8, -12, -2);
  ctx.bezierCurveTo(-10, -14, -6, -16, 0, -16);
  fillIcon(ctx, GOLD);
  ctx.fillStyle = GOLD_LT;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.bezierCurveTo(8, -8, 8, 6, 2, 12);
  ctx.bezierCurveTo(-2, 8, -8, 4, -6, -2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(-3, 2);
  ctx.quadraticCurveTo(1, -8, 6, -4);
  ctx.lineTo(7, 2);
  ctx.quadraticCurveTo(1, 2, 0, 10);
  ctx.lineTo(-2, 10);
  ctx.closePath();
  ctx.fill();
}

function drawDilop(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = GOLD;
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + (i / 4) * 1.8;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.quadraticCurveTo(8, -8, 2, -18);
    ctx.quadraticCurveTo(0, -6, 0, 4);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = BONE;
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + (i / 4) * 1.8;
    ctx.save();
    ctx.rotate(a);
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.quadraticCurveTo(5, -6, 1, -14);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.ellipse(0, 10, 8, 6.5, 0, 0, Math.PI * 2);
  fillIcon(ctx, BONE);
}

function drawMosa(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = BONE;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.bezierCurveTo(-2, -10, 6, 12, 14, -2);
  ctx.stroke();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(14, -4, 7, 5.5, 0.3, 0, Math.PI * 2);
  fillIcon(ctx, BONE);
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(-2, -2);
  ctx.quadraticCurveTo(2, -12, 6, -2);
  ctx.fill();
}

const DRAWS: Record<MetallicKind, (ctx: CanvasRenderingContext2D) => void> = {
  fern: drawFern,
  leaf: drawLeaf,
  palm: drawPalm,
  tree: drawTree,
  bone: drawBone,
  ribs: drawRibs,
  fossil: drawFossil,
  print: drawPrint,
  coin: drawCoin,
  egg: drawEgg,
  hatch: drawHatch,
  rex: drawRex,
  raptor: drawRaptor,
  stego: drawStego,
  trike: drawTrike,
  neck: drawNeck,
  ptero: drawPtero,
  sail: drawSail,
  anky: drawAnky,
  claw: drawClaw,
  tooth: drawTooth,
  nest: drawNest,
  roar: drawRoar,
  heart: drawHeart,
  crest: drawCrest,
  baby: drawBaby,
  amber: drawAmber,
  dilop: drawDilop,
  mosa: drawMosa,
};

export function drawDecorKind(ctx: CanvasRenderingContext2D, kind: DecorKind) {
  if (isVinylKind(kind)) {
    drawVinylKind(ctx, kind);
    return;
  }
  const draw = DRAWS[kind];
  if (!draw) return;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;
  drawSeal(ctx, kind);
  ctx.shadowColor = "transparent";
  ctx.save();
  sealPath(ctx, SEALS[kind].shape, 31);
  ctx.clip();
  ctx.scale(0.78, 0.78);
  draw(ctx);
  ctx.restore();
  ctx.restore();
}

export function drawSticker(ctx: CanvasRenderingContext2D, s: CardSticker, selected = false) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.rot);
  ctx.scale(s.flip ? -s.scale : s.scale, s.scale);
  drawDecorKind(ctx, s.kind);
  ctx.restore();
  if (selected) {
    ctx.save();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(s.x, s.y, stickerRadius(s) + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawStickers(
  ctx: CanvasRenderingContext2D,
  stickers: CardSticker[],
  selectedId?: string | null,
) {
  for (const s of stickers) {
    drawSticker(ctx, s, s.id === selectedId);
  }
}
