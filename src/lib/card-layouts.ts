import { hexAlpha, type CardTheme } from "@/lib/card-themes";
import {
  PAPER,
  TELL_PLACEHOLDERS,
  artCenter,
  type CardArt,
  type CardDraft,
  type CardTemplate,
} from "@/lib/card-templates";
import type { CardTypeface } from "@/lib/card-type";
import type { ArtFit } from "@/lib/card-templates";

const WORDMARK_SRC = "/brand/dinoverse-wordmark.jpg";

let wordmarkLoad: Promise<HTMLImageElement | null> | null = null;
let wordmarkCut: HTMLCanvasElement | null = null;

export function loadCardWordmark() {
  if (!wordmarkLoad) {
    wordmarkLoad = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = WORDMARK_SRC;
    });
  }
  return wordmarkLoad;
}

function cutWordmark(img: HTMLImageElement) {
  if (wordmarkCut) return wordmarkCut;
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.drawImage(img, 0, 0);
  const pix = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = pix.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (min > 228 || (min > 205 && max - min < 14)) d[i + 3] = 0;
  }
  ctx.putImageData(pix, 0, 0);

  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (d[(y * canvas.width + x) * 4 + 3] < 16) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX <= minX || maxY <= minY) {
    wordmarkCut = canvas;
    return canvas;
  }
  const pad = 6;
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  const sw = Math.min(canvas.width - sx, maxX - minX + 1 + pad * 2);
  const sh = Math.min(canvas.height - sy, maxY - minY + 1 + pad * 2);
  const trim = document.createElement("canvas");
  trim.width = sw;
  trim.height = sh;
  trim.getContext("2d")?.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  wordmarkCut = trim;
  return trim;
}

function drawWordmark(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, maxW = 248) {
  if (!img) return;
  const src = cutWordmark(img);
  const h = maxW * (src.height / src.width);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.drawImage(src, x, y, maxW, h);
  ctx.restore();
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function fitName(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, type: CardTypeface, start = 56) {
  let size = start;
  ctx.font = `${type.weight} ${size}px ${type.stack}`;
  while (size > 26 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${type.weight} ${size}px ${type.stack}`;
  }
  return size;
}

function clipArt(ctx: CanvasRenderingContext2D, art: CardArt, draw: () => void) {
  ctx.save();
  ctx.beginPath();
  if (art.clip === "circle") {
    const { cx, cy } = artCenter(art);
    ctx.arc(cx, cy, art.w / 2, 0, Math.PI * 2);
  } else {
    roundRect(ctx, art.x, art.y, art.w, art.h, art.r);
  }
  ctx.clip();
  draw();
  ctx.restore();
}

export function drawFitted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  frame: { x: number; y: number; w: number; h: number },
  fit: ArtFit,
) {
  const contain = Math.min(frame.w / img.width, frame.h / img.height);
  const dw = img.width * contain * fit.scale;
  const dh = img.height * contain * fit.scale;
  const dx = frame.x + (frame.w - dw) / 2 + fit.ox * frame.w;
  const dy = frame.y + (frame.h - dh) / 2 + fit.oy * frame.h;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPlus(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(3, s * 0.12);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.lineTo(x + s, y);
  ctx.moveTo(x, y - s);
  ctx.lineTo(x, y + s);
  ctx.stroke();
  ctx.restore();
}

function drawPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  fill: string,
  ink: string,
) {
  ctx.font = "700 13px Figtree, system-ui, sans-serif";
  const w = ctx.measureText(text).width + 32;
  roundRect(ctx, x, y, w, 34, 17);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.fillText(text, x + 16, y + 23);
  return w;
}

function strokeChip(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, theme: CardTheme, icon: (ix: number, iy: number) => void) {
  ctx.font = "600 18px Figtree, system-ui, sans-serif";
  const w = 44 + ctx.measureText(label).width + 22;
  roundRect(ctx, x, y, w, 40, 20);
  ctx.strokeStyle = hexAlpha(theme.inner, 0.55);
  ctx.lineWidth = 2;
  ctx.stroke();
  icon(x + 22, y + 20);
  ctx.fillStyle = theme.cream;
  ctx.fillText(label, x + 40, y + 27);
  return w;
}

function iconPerson(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - 5, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + 12, 9, Math.PI * 1.12, Math.PI * 1.88);
  ctx.stroke();
  ctx.restore();
}

function iconDino(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 6);
  ctx.lineTo(x - 2, y - 2);
  ctx.lineTo(x + 8, y - 6);
  ctx.lineTo(x + 12, y - 3);
  ctx.lineTo(x + 6, y);
  ctx.lineTo(x + 4, y + 7);
  ctx.lineTo(x - 4, y + 7);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function iconCity(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 8, y - 2, 7, 10);
  ctx.strokeRect(x, y - 7, 8, 15);
  ctx.restore();
}

function iconMoon(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 7, -0.55, Math.PI * 0.95);
  ctx.arc(x + 3.2, y - 1.4, 5.6, Math.PI * 0.9, -0.65, true);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function iconCoin(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 3.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawTheropod(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6 / scale;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-92, 18);
  ctx.bezierCurveTo(-70, 4, -28, -6, 6, 2);
  ctx.bezierCurveTo(22, -22, 48, -30, 70, -18);
  ctx.lineTo(92, -16);
  ctx.lineTo(72, -6);
  ctx.bezierCurveTo(64, 4, 52, 12, 38, 16);
  ctx.lineTo(50, 26);
  ctx.lineTo(36, 24);
  ctx.lineTo(18, 36);
  ctx.lineTo(24, 86);
  ctx.lineTo(12, 86);
  ctx.lineTo(8, 44);
  ctx.lineTo(-10, 86);
  ctx.lineTo(-22, 86);
  ctx.lineTo(-8, 40);
  ctx.bezierCurveTo(-36, 32, -64, 26, -92, 18);
  ctx.stroke();
  ctx.restore();
}

function drawSpotlightPlaceholder(ctx: CanvasRenderingContext2D, art: CardArt, theme: CardTheme) {
  const { cx, cy } = artCenter(art);
  const r = art.w / 2;
  clipArt(ctx, art, () => {
    ctx.fillStyle = theme.artVoid;
    ctx.fillRect(art.x, art.y, art.w, art.h);
    ctx.fillStyle = hexAlpha(theme.inner, 0.18);
    for (let row = 0; row < 18; row++) {
      for (let col = 0; col < 18; col++) {
        const x = cx - r + 18 + col * ((r * 2 - 36) / 17);
        const y = cy - r + 18 + row * ((r * 2 - 36) / 17);
        if ((x - cx) ** 2 + (y - cy) ** 2 > (r - 28) ** 2) continue;
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  ctx.save();
  ctx.strokeStyle = hexAlpha(theme.inner, 0.7);
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  drawPlus(ctx, cx, cy, 22, theme.inner);
}

function drawDossierPlaceholder(ctx: CanvasRenderingContext2D, art: CardArt, theme: CardTheme) {
  clipArt(ctx, art, () => {
    ctx.fillStyle = theme.artVoid;
    ctx.fillRect(art.x, art.y, art.w, art.h);
    drawTheropod(
      ctx,
      art.x + art.w * 0.58,
      art.y + art.h * 0.42,
      2.15,
      hexAlpha(theme.inner, 0.28),
    );
    drawPlus(ctx, art.x + art.w * 0.28, art.y + art.h * 0.42, 16, theme.inner);
  });
  ctx.fillStyle = hexAlpha(theme.inner, 0.9);
  ctx.font = "700 14px Figtree, system-ui, sans-serif";
  ctx.fillText("PORTRAIT", art.x + 18, art.y + art.h - 28);
  ctx.fillStyle = theme.inner;
  ctx.fillRect(art.x + 18, art.y + art.h - 18, 64, 3);
}

export function drawCardPaper(ctx: CanvasRenderingContext2D, theme: CardTheme) {
  roundRect(ctx, PAPER.x, PAPER.y, PAPER.w, PAPER.h, 28);
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2.4;
  ctx.stroke();
}

export function drawCardArt(
  ctx: CanvasRenderingContext2D,
  template: CardTemplate,
  theme: CardTheme,
  artImg: HTMLImageElement | null,
  fit: ArtFit,
  bg: HTMLImageElement | null,
  bgFit: ArtFit,
  bgDim: number,
  scene: boolean,
) {
  const { art } = template;
  clipArt(ctx, art, () => {
    if (scene && bg) {
      drawFitted(ctx, bg, art, bgFit);
      ctx.fillStyle = hexAlpha(theme.wash2, Math.max(0, Math.min(0.9, bgDim)) * 0.7);
      ctx.fillRect(art.x, art.y, art.w, art.h);
    } else if (artImg) {
      ctx.fillStyle = theme.artVoid;
      ctx.fillRect(art.x, art.y, art.w, art.h);
    }
    if (artImg) drawFitted(ctx, artImg, art, fit);
  });
  if (!artImg && !scene) {
    if (template.id === "spotlight") drawSpotlightPlaceholder(ctx, art, theme);
    else drawDossierPlaceholder(ctx, art, theme);
  } else if (template.id === "spotlight") {
    const { cx, cy } = artCenter(art);
    ctx.beginPath();
    ctx.arc(cx, cy, art.w / 2 - 2, 0, Math.PI * 2);
    ctx.strokeStyle = hexAlpha(theme.inner, 0.35);
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (template.id === "dossier") {
    roundRect(ctx, art.x, art.y, art.w, art.h, art.r);
    ctx.strokeStyle = hexAlpha(theme.inner, 0.22);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawSpotlightCopy(
  ctx: CanvasRenderingContext2D,
  draft: CardDraft,
  theme: CardTheme,
  type: CardTypeface,
  mark: HTMLImageElement | null,
) {
  const tag = (draft.tag.trim() || "FLOOR CAST").toUpperCase().slice(0, 18);
  drawPill(ctx, 64, 62, tag, theme.inner, theme.ribbonInk);

  if (!draft.name.trim()) {
    ctx.fillStyle = hexAlpha(theme.inner, 0.85);
    ctx.font = "500 16px Figtree, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Drop a portrait  ·  PNG/JPG  ·  full body", 450, 678);
    ctx.textAlign = "left";
  }

  const name = draft.name.trim() || "Your dinosaur";
  const nameSize = fitName(ctx, name, 760, type, 58);
  ctx.fillStyle = type.color;
  ctx.font = `${type.weight} ${nameSize}px ${type.stack}`;
  ctx.fillText(name, 64, 760);
  ctx.fillStyle = theme.inner;
  roundRect(ctx, 64, 778, 72, 4, 2);
  ctx.fill();

  let y = 808;
  const title = draft.title.trim() || "Title";
  const species = draft.species.trim() || "Species";
  ctx.font = "600 18px Figtree, system-ui, sans-serif";
  const tw = ctx.measureText(title).width + 36;
  roundRect(ctx, 64, y, tw, 38, 19);
  ctx.strokeStyle = hexAlpha(theme.inner, 0.55);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = theme.cream;
  ctx.fillText(title, 82, y + 26);
  const sw = ctx.measureText(species).width + 36;
  roundRect(ctx, 64 + tw + 12, y, sw, 38, 19);
  ctx.stroke();
  ctx.fillText(species, 82 + tw + 12, y + 26);

  const motto = draft.motto.trim();
  y = 868;
  if (motto) {
    ctx.fillStyle = theme.highlight;
    ctx.font = "600 18px Figtree, system-ui, sans-serif";
    ctx.fillText(motto.slice(0, 48), 64, y);
    y += 36;
  }

  ctx.fillStyle = hexAlpha(theme.inner, 0.9);
  ctx.font = "700 13px Figtree, system-ui, sans-serif";
  ctx.fillText("BIO", 64, y);
  y += 16;
  const bioH = Math.max(120, 1070 - y);
  roundRect(ctx, 64, y, 772, bioH, 18);
  ctx.strokeStyle = hexAlpha(theme.inner, 0.35);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = type.color;
  ctx.globalAlpha = 0.88;
  ctx.font = "500 20px Figtree, system-ui, sans-serif";
  const bio =
    draft.bio.trim() || "Who they are. What they do in the city. One tell — coffee order, limp, lucky coin.";
  wrapText(ctx, bio, 720, 4).forEach((line, i) => ctx.fillText(line, 86, y + 36 + i * 28));
  ctx.globalAlpha = 1;

  drawWordmark(ctx, mark, 64, 1078, 236);
}

function drawDossierCopy(
  ctx: CanvasRenderingContext2D,
  draft: CardDraft,
  theme: CardTheme,
  type: CardTypeface,
  mark: HTMLImageElement | null,
) {
  const col = 392;
  const tag = (draft.tag.trim() || "FLOOR CAST").toUpperCase().slice(0, 18);
  drawPill(ctx, col, 86, tag, theme.inner, theme.ribbonInk);

  const name = draft.name.trim() || "Your dinosaur";
  const bits = name.split(/\s+/);
  ctx.fillStyle = type.color;
  if (bits.length > 1) {
    const a = bits[0];
    const b = bits.slice(1).join(" ");
    const size = fitName(ctx, a.length > b.length ? a : b, 430, type, 54);
    ctx.font = `${type.weight} ${size}px ${type.stack}`;
    ctx.fillText(a, col, 200);
    ctx.fillText(b, col, 200 + size + 8);
  } else {
    const size = fitName(ctx, name, 430, type, 54);
    ctx.font = `${type.weight} ${size}px ${type.stack}`;
    ctx.fillText(name, col, 220);
  }

  const title = draft.title.trim() || "Title";
  const species = draft.species.trim() || "Species";
  const tW = strokeChip(ctx, col, 330, title, theme, (ix, iy) => iconPerson(ctx, ix, iy, theme.inner));
  strokeChip(ctx, col + tW + 10, 330, species, theme, (ix, iy) => iconDino(ctx, ix, iy, theme.inner));

  ctx.fillStyle = hexAlpha(theme.inner, 0.9);
  ctx.font = "700 13px Figtree, system-ui, sans-serif";
  ctx.fillText("BIO", col, 420);
  ctx.fillStyle = type.color;
  ctx.globalAlpha = 0.86;
  ctx.font = "500 22px Figtree, system-ui, sans-serif";
  const bio =
    draft.bio.trim() ||
    "nocturnal city raptor with a sharp eye for detail and a softer side brewed in every cup. Believes luck is earned, not found.";
  wrapText(ctx, bio, 430, 7).forEach((line, i) => ctx.fillText(line, col, 456 + i * 30));
  ctx.globalAlpha = 1;

  const tells = TELL_PLACEHOLDERS.map((fallback, i) => draft.tells[i]?.trim() || fallback);
  const icons = [iconCity, iconMoon, iconCoin];
  let x = col;
  const y = 720;
  tells.forEach((label, i) => {
    const w = strokeChip(ctx, x, y, label, theme, (ix, iy) => icons[i](ctx, ix, iy, theme.inner));
    x += w + 10;
  });

  drawWordmark(ctx, mark, 56, 1084, 236);
}

export function drawCardCopy(
  ctx: CanvasRenderingContext2D,
  template: CardTemplate,
  draft: CardDraft,
  theme: CardTheme,
  type: CardTypeface,
  mark: HTMLImageElement | null = null,
) {
  if (template.id === "spotlight") drawSpotlightCopy(ctx, draft, theme, type, mark);
  else drawDossierCopy(ctx, draft, theme, type, mark);
}
