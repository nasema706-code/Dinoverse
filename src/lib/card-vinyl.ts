export const VINYLS = [
  { id: "poprex", label: "Pop Rex" },
  { id: "glowegg", label: "Candy" },
  { id: "neonprint", label: "Neon" },
  { id: "jelly", label: "Jelly" },
  { id: "comet", label: "Comet" },
  { id: "lava", label: "Lava" },
  { id: "bolt", label: "Bolt" },
  { id: "bloom", label: "Bloom" },
  { id: "wave", label: "Wave" },
  { id: "gem", label: "Gem" },
  { id: "sun", label: "Sun" },
  { id: "moon", label: "Moon" },
  { id: "cactus", label: "Cactus" },
  { id: "shroom", label: "Shroom" },
  { id: "coral", label: "Coral" },
  { id: "prism", label: "Prism" },
  { id: "pepper", label: "Chili" },
  { id: "frost", label: "Frost" },
  { id: "fizz", label: "Fizz" },
  { id: "meteor", label: "Meteor" },
] as const;

export type VinylKind = (typeof VINYLS)[number]["id"];

const CREAM = "#fff6e8";
const INK = "#1a1224";

export function isVinylKind(kind: string): kind is VinylKind {
  return VINYLS.some((item) => item.id === kind);
}

function enamel(
  ctx: CanvasRenderingContext2D,
  fill: string,
  line = CREAM,
  width = 4.2,
) {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = width;
  ctx.strokeStyle = line;
  ctx.fillStyle = fill;
  ctx.stroke();
  ctx.fill();
}

function gloss(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry = rx * 0.45) {
  const g = ctx.createLinearGradient(x - rx, y - ry, x + rx, y + ry);
  g.addColorStop(0, "rgba(255,255,255,0.62)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.7, 0, Math.PI * 2);
  ctx.fill();
}

function drawPoprex(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-18, 6);
  ctx.quadraticCurveTo(-20, -10, -4, -14);
  ctx.quadraticCurveTo(12, -18, 20, -8);
  ctx.lineTo(24, 0);
  ctx.quadraticCurveTo(16, 6, 6, 8);
  ctx.quadraticCurveTo(-8, 16, -18, 6);
  enamel(ctx, "#ff6b6b");
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(2, 2);
  ctx.lineTo(20, 2);
  ctx.lineTo(18, 7);
  ctx.lineTo(4, 7);
  ctx.fill();
  ctx.fillStyle = CREAM;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(6 + i * 4.2, 7);
    ctx.lineTo(7.6 + i * 4.2, 12);
    ctx.lineTo(9.4 + i * 4.2, 7);
    ctx.fill();
  }
  ctx.fillStyle = "#7bed9f";
  ctx.beginPath();
  ctx.ellipse(2, -8, 3.2, 1.6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  gloss(ctx, -4, -8, 8);
}

function drawGlowegg(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.ellipse(0, 1, 15, 20, 0, 0, Math.PI * 2);
  enamel(ctx, "#fff6e8");
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 1, 13, 18, 0, 0, Math.PI * 2);
  ctx.clip();
  ["#ff6b6b", "#ffd166", "#3ecf8e", "#4dabf7", "#845ef7"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.rotate(0.35);
    ctx.rect(-24, -20 + i * 8.2, 50, 6.4);
    ctx.fill();
    ctx.rotate(-0.35);
  });
  ctx.restore();
  gloss(ctx, -4, -8, 7);
}

function drawNeonprint(ctx: CanvasRenderingContext2D) {
  const toe = (x: number, y: number, rot: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 11, 0, 0, Math.PI * 2);
    enamel(ctx, "#f06595", CREAM, 3.4);
    ctx.restore();
  };
  toe(-12, -10, -0.4);
  toe(0, -14, 0);
  toe(12, -10, 0.4);
  ctx.beginPath();
  ctx.ellipse(0, 10, 13, 9, 0, 0, Math.PI * 2);
  enamel(ctx, "#845ef7", CREAM, 3.6);
  gloss(ctx, -3, 7, 6);
}

function drawJelly(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-10, 14);
  ctx.quadraticCurveTo(-18, 2, -8, -10);
  ctx.quadraticCurveTo(0, -20, 10, -10);
  ctx.quadraticCurveTo(20, 2, 12, 14);
  ctx.closePath();
  enamel(ctx, "#7bed9f");
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.ellipse(-2, -4, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f06595";
  ctx.beginPath();
  ctx.arc(-4, -2, 2.4, 0, Math.PI * 2);
  ctx.arc(5, -4, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 4, 3.2, 0.15, Math.PI - 0.15);
  ctx.stroke();
  gloss(ctx, -6, -8, 6);
}

function drawComet(ctx: CanvasRenderingContext2D) {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const tails = [
    { c: "#ff6b6b", w: 7, a: 0.15 },
    { c: "#ffd166", w: 5, a: 0 },
    { c: "#3edbf5", w: 4, a: -0.18 },
  ];
  tails.forEach(({ c, w, a }) => {
    ctx.save();
    ctx.rotate(a);
    ctx.strokeStyle = CREAM;
    ctx.lineWidth = w + 3.4;
    ctx.beginPath();
    ctx.moveTo(-4, 2);
    ctx.quadraticCurveTo(-16, 8, -24, 16);
    ctx.stroke();
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.stroke();
    ctx.restore();
  });
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const r = i % 2 ? 8 : 16;
    const x = 8 + Math.cos(a) * r;
    const y = -8 + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  enamel(ctx, "#ffd166");
  gloss(ctx, 6, -12, 5);
}

function drawLava(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-20, 16);
  ctx.lineTo(-8, -6);
  ctx.lineTo(0, 4);
  ctx.lineTo(8, -14);
  ctx.lineTo(22, 16);
  ctx.closePath();
  enamel(ctx, "#5c3317");
  ctx.beginPath();
  ctx.moveTo(2, -8);
  ctx.quadraticCurveTo(8, -2, 6, 8);
  ctx.quadraticCurveTo(2, 4, -2, 10);
  ctx.quadraticCurveTo(0, 0, 2, -8);
  enamel(ctx, "#ff9f43", CREAM, 3);
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(4, -12, 5, 0, Math.PI * 2);
  ctx.arc(-2, -2, 3.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawBolt(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(6, -22);
  ctx.lineTo(-4, -2);
  ctx.lineTo(6, -2);
  ctx.lineTo(-8, 22);
  ctx.lineTo(4, 4);
  ctx.lineTo(-4, 4);
  ctx.closePath();
  enamel(ctx, "#ffe066");
  gloss(ctx, 0, -10, 5, 2);
}

function drawBloom(ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i / 5) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -12, 8, 12, 0, 0, Math.PI * 2);
    enamel(ctx, i % 2 ? "#ff8cc8" : "#f06595", CREAM, 3.2);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  enamel(ctx, "#ffd166", CREAM, 3);
  gloss(ctx, -2, -2, 4);
}

function drawWave(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-22, 8);
  ctx.quadraticCurveTo(-10, -10, 0, 4);
  ctx.quadraticCurveTo(8, 14, 16, 0);
  ctx.quadraticCurveTo(20, -6, 22, -2);
  ctx.quadraticCurveTo(12, 18, 0, 12);
  ctx.quadraticCurveTo(-12, 20, -22, 8);
  enamel(ctx, "#3edbf5");
  ctx.beginPath();
  ctx.moveTo(-16, 2);
  ctx.quadraticCurveTo(-4, -12, 6, 0);
  ctx.quadraticCurveTo(12, 6, 18, -6);
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = CREAM;
  ctx.stroke();
  ctx.strokeStyle = "#4dabf7";
  ctx.lineWidth = 2;
  ctx.stroke();
  gloss(ctx, -6, 0, 7);
}

function drawGem(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(16, -6);
  ctx.lineTo(10, 18);
  ctx.lineTo(-10, 18);
  ctx.lineTo(-16, -6);
  ctx.closePath();
  enamel(ctx, "#845ef7");
  ctx.fillStyle = "#b197fc";
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(8, -6);
  ctx.lineTo(0, 2);
  ctx.lineTo(-8, -6);
  ctx.fill();
  ctx.fillStyle = "#3ecf8e";
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(8, -6);
  ctx.lineTo(10, 14);
  ctx.fill();
  gloss(ctx, -4, -8, 5);
}

function drawSun(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = CREAM;
  for (let i = 0; i < 10; i++) {
    ctx.save();
    ctx.rotate((i / 10) * Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(-3.2, -16);
    ctx.lineTo(0, -26);
    ctx.lineTo(3.2, -16);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#ff9f43";
  for (let i = 0; i < 10; i++) {
    ctx.save();
    ctx.rotate((i / 10) * Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(-2, -16);
    ctx.lineTo(0, -24);
    ctx.lineTo(2, -16);
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  enamel(ctx, "#ffd166");
  gloss(ctx, -4, -4, 6);
}

function drawMoon(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.arc(0, 2, 17, 0.55, Math.PI * 2 - 0.35);
  ctx.arc(9, -2, 13, Math.PI * 2 - 0.55, 0.85, true);
  ctx.closePath();
  enamel(ctx, "#ffe8a3");
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(-6, 8, 2, 0, Math.PI * 2);
  ctx.arc(-8, -2, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -16);
  ctx.lineTo(16.2, -11);
  ctx.lineTo(21, -13);
  ctx.lineTo(17.4, -8);
  ctx.lineTo(19.4, -3);
  ctx.lineTo(14, -7);
  ctx.lineTo(9, -3);
  ctx.lineTo(11.4, -8);
  ctx.closePath();
  enamel(ctx, "#4dabf7", CREAM, 2.4);
}

function drawCactus(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.roundRect(-7, -16, 14, 34, 7);
  enamel(ctx, "#3ecf8e");
  ctx.beginPath();
  ctx.roundRect(-20, -4, 14, 8, 4);
  enamel(ctx, "#3ecf8e", CREAM, 3.2);
  ctx.beginPath();
  ctx.roundRect(6, 2, 14, 8, 4);
  enamel(ctx, "#3ecf8e", CREAM, 3.2);
  ctx.beginPath();
  ctx.arc(0, -18, 5, 0, Math.PI * 2);
  enamel(ctx, "#f06595", CREAM, 3);
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(0, -18, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawShroom(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.roundRect(-7, 2, 14, 18, 5);
  enamel(ctx, "#fff6e8");
  ctx.beginPath();
  ctx.ellipse(0, -4, 20, 14, 0, Math.PI, 0, true);
  ctx.lineTo(20, 2);
  ctx.quadraticCurveTo(0, 8, -20, 2);
  ctx.closePath();
  enamel(ctx, "#ff6b6b");
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.arc(-6, -6, 3.2, 0, Math.PI * 2);
  ctx.arc(5, -8, 2.6, 0, Math.PI * 2);
  ctx.arc(8, -2, 2.2, 0, Math.PI * 2);
  ctx.fill();
  gloss(ctx, -6, -10, 7);
}

function drawCoral(ctx: CanvasRenderingContext2D) {
  const branch = (rot: number, fill: string, len = 22) => {
    ctx.save();
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(-4, -4, 0, -len);
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.strokeStyle = CREAM;
    ctx.stroke();
    ctx.strokeStyle = fill;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-8, -6, 4, 0, Math.PI * 2);
    ctx.arc(7, -12, 3.4, 0, Math.PI * 2);
    enamel(ctx, fill, CREAM, 2.6);
    ctx.restore();
  };
  branch(-0.45, "#f06595", 18);
  branch(0.4, "#ff9f43", 16);
  branch(0, "#ff6b6b", 22);
}

function drawPrism(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(20, 16);
  ctx.lineTo(-20, 16);
  ctx.closePath();
  enamel(ctx, CREAM, CREAM, 4);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(16, 14);
  ctx.lineTo(-16, 14);
  ctx.closePath();
  ctx.clip();
  ["#ff6b6b", "#ffd166", "#3ecf8e", "#4dabf7", "#845ef7"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(-20, -18 + i * 7.2, 40, 7.2);
  });
  ctx.restore();
  gloss(ctx, -2, -6, 6);
}

function drawPepper(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.rotate(0.35);
  ctx.beginPath();
  ctx.moveTo(-2, -16);
  ctx.bezierCurveTo(-18, -10, -16, 16, 2, 18);
  ctx.bezierCurveTo(14, 14, 12, -8, 2, -14);
  ctx.closePath();
  enamel(ctx, "#ff6b6b");
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(-2, -16);
  ctx.quadraticCurveTo(2, -24, 8, -18);
  ctx.lineWidth = 5;
  ctx.strokeStyle = CREAM;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.strokeStyle = "#3ecf8e";
  ctx.lineWidth = 2.6;
  ctx.stroke();
  gloss(ctx, -4, -2, 6);
}

function drawFrost(ctx: CanvasRenderingContext2D) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i / 6) * Math.PI * 2);
    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 5.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -22);
    ctx.moveTo(-6, -12);
    ctx.lineTo(0, -16);
    ctx.lineTo(6, -12);
    ctx.stroke();
    ctx.strokeStyle = "#74c0fc";
    ctx.lineWidth = 2.8;
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  enamel(ctx, "#e7f5ff", CREAM, 3);
}

function drawFizz(ctx: CanvasRenderingContext2D) {
  const bubble = (x: number, y: number, r: number, fill: string) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    enamel(ctx, fill, CREAM, 3.2);
    gloss(ctx, x - r * 0.25, y - r * 0.25, r * 0.4);
  };
  bubble(-8, 8, 12, "#ff8cc8");
  bubble(10, -2, 9, "#3edbf5");
  bubble(-2, -14, 7, "#ffd166");
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.arc(16, -16, 1.8, 0, Math.PI * 2);
  ctx.arc(20, -8, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawMeteor(ctx: CanvasRenderingContext2D) {
  ctx.lineCap = "round";
  [
    { c: "#ff6b6b", w: 10, y: 2 },
    { c: "#ff9f43", w: 7, y: 0 },
    { c: "#ffd166", w: 4, y: -2 },
  ].forEach(({ c, w, y }) => {
    ctx.strokeStyle = CREAM;
    ctx.lineWidth = w + 3;
    ctx.beginPath();
    ctx.moveTo(2, y);
    ctx.quadraticCurveTo(-10, y + 6, -22, y + 14);
    ctx.stroke();
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.ellipse(10, -8, 13, 11, 0.4, 0, Math.PI * 2);
  enamel(ctx, "#868e96");
  ctx.fillStyle = "#495057";
  ctx.beginPath();
  ctx.arc(6, -10, 3, 0, Math.PI * 2);
  ctx.arc(14, -6, 2.2, 0, Math.PI * 2);
  ctx.fill();
  gloss(ctx, 6, -12, 5);
}

const DRAWS: Record<VinylKind, (ctx: CanvasRenderingContext2D) => void> = {
  poprex: drawPoprex,
  glowegg: drawGlowegg,
  neonprint: drawNeonprint,
  jelly: drawJelly,
  comet: drawComet,
  lava: drawLava,
  bolt: drawBolt,
  bloom: drawBloom,
  wave: drawWave,
  gem: drawGem,
  sun: drawSun,
  moon: drawMoon,
  cactus: drawCactus,
  shroom: drawShroom,
  coral: drawCoral,
  prism: drawPrism,
  pepper: drawPepper,
  frost: drawFrost,
  fizz: drawFizz,
  meteor: drawMeteor,
};

export function drawVinylKind(ctx: CanvasRenderingContext2D, kind: VinylKind) {
  const draw = DRAWS[kind];
  if (!draw) return;
  ctx.save();
  ctx.shadowColor = "rgba(20, 8, 24, 0.35)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  draw(ctx);
  ctx.restore();
}
