import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Download, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TOKEN } from "@/lib/token";
import { cn } from "@/lib/utils";

export type CardDraft = {
  name: string;
  title: string;
  species: string;
  traitA: string;
  traitB: string;
  traitC: string;
  bio: string;
};

const EMPTY: CardDraft = {
  name: "",
  title: "",
  species: "",
  traitA: "",
  traitB: "",
  traitC: "",
  bio: "",
};

const MINT = "#3ecf8e";
const GOLD = "#e8c36a";
const CREAM = "#fff8ee";
const INK = "#06140f";
const PANEL = "#0b1c16";

const fieldClass =
  "mt-1.5 h-11 w-full rounded-md border border-accent/25 bg-bg px-3 text-sm text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent";

const PILL = [
  { fill: MINT, text: INK },
  { fill: GOLD, text: "#1a1408" },
  { fill: "#b8ff6a", text: INK },
] as const;

const ART = { x: 56, y: 56, w: 788, h: 582 } as const;
const FIT_DEFAULT = { scale: 1, ox: 0, oy: 0 };

export type ArtFit = { scale: number; ox: number; oy: number };

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function containScale(img: HTMLImageElement, w: number, h: number) {
  return Math.min(w / img.width, h / img.height);
}

function coverScale(img: HTMLImageElement, w: number, h: number) {
  const contain = containScale(img, w, h);
  return Math.max(w / img.width, h / img.height) / contain;
}

function drawArt(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  frame: typeof ART,
  fit: ArtFit,
) {
  const contain = containScale(img, frame.w, frame.h);
  const dw = img.width * contain * fit.scale;
  const dh = img.height * contain * fit.scale;
  const dx = frame.x + (frame.w - dw) / 2 + fit.ox * frame.w;
  const dy = frame.y + (frame.h - dh) / 2 + fit.oy * frame.h;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
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

function roundRect(
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

function fitName(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  let size = 56;
  ctx.font = `700 ${size}px Unbounded, ui-sans-serif, sans-serif`;
  while (size > 28 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `700 ${size}px Unbounded, ui-sans-serif, sans-serif`;
  }
  return size;
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(a + Math.PI / 4) * r * 0.32, Math.sin(a + Math.PI / 4) * r * 0.32);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, "#0a2a1e");
  g.addColorStop(0.55, "#123d2c");
  g.addColorStop(1, "#0b1f18");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "rgba(62,207,142,0.22)";
  for (let i = 0; i < 24; i++) {
    ctx.beginPath();
    ctx.arc(x + 48 + (i % 8) * 96, y + 48 + Math.floor(i / 8) * 110, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const cx = x + w / 2;
  const cy = y + h / 2 - 24;
  ctx.strokeStyle = "rgba(232,195,106,0.75)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 112, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = MINT;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, 94, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(62,207,142,0.12)";
  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.fill();
  drawStar(ctx, cx, cy, 16, GOLD);

  ctx.fillStyle = CREAM;
  ctx.font = "700 26px Unbounded, ui-sans-serif, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Drop a portrait", cx, cy + 148);
  ctx.fillStyle = MINT;
  ctx.font = "500 16px Figtree, system-ui, sans-serif";
  ctx.fillText("PNG or JPG  ·  full body looks best", cx, cy + 178);
  ctx.textAlign = "left";
}

function drawPills(
  ctx: CanvasRenderingContext2D,
  traits: string[],
  x: number,
  y: number,
  maxWidth: number,
) {
  const gap = 10;
  const h = 40;
  const padX = 16;
  let px = x;
  let py = y;
  ctx.font = "600 17px Figtree, system-ui, sans-serif";
  ctx.textAlign = "left";
  for (let i = 0; i < traits.length; i++) {
    const label = traits[i].slice(0, 22);
    const w = Math.ceil(ctx.measureText(label).width) + padX * 2;
    if (px + w > x + maxWidth && px > x) {
      px = x;
      py += h + gap;
    }
    const pal = PILL[i % PILL.length];
    roundRect(ctx, px, py, w, h, 20);
    ctx.fillStyle = pal.fill;
    ctx.fill();
    ctx.fillStyle = pal.text;
    ctx.fillText(label, px + padX, py + 26);
    px += w + gap;
  }
  return py + h;
}

export async function renderCharacterCard(
  art: HTMLImageElement | null,
  draft: CardDraft,
  fit: ArtFit = FIT_DEFAULT,
) {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const wash = ctx.createRadialGradient(180, 80, 20, 450, 520, 820);
  wash.addColorStop(0, "#164c38");
  wash.addColorStop(0.45, "#0b241c");
  wash.addColorStop(1, INK);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, 900, 1200);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 18;
  roundRect(ctx, 18, 18, 864, 1164, 42);
  ctx.stroke();
  ctx.strokeStyle = MINT;
  ctx.lineWidth = 5;
  roundRect(ctx, 32, 32, 836, 1136, 34);
  ctx.stroke();

  drawStar(ctx, 70, 70, 10, GOLD);
  drawStar(ctx, 830, 78, 8, MINT);
  drawStar(ctx, 848, 1128, 9, GOLD);
  drawStar(ctx, 56, 1134, 7, MINT);

  const px = ART.x;
  const py = ART.y;
  const pw = ART.w;
  const ph = ART.h;
  ctx.save();
  roundRect(ctx, px, py, pw, ph, 28);
  ctx.clip();
  if (art) {
    ctx.fillStyle = "#0b1f18";
    ctx.fillRect(px, py, pw, ph);
    drawArt(ctx, art, ART, fit);
  } else {
    drawPlaceholder(ctx, px, py, pw, ph);
  }
  const fade = ctx.createLinearGradient(0, py + ph - 140, 0, py + ph);
  fade.addColorStop(0, "rgba(6,20,15,0)");
  fade.addColorStop(1, INK);
  ctx.fillStyle = fade;
  ctx.fillRect(px, py + ph - 140, pw, 140);
  ctx.restore();

  roundRect(ctx, px, py, pw, ph, 28);
  ctx.strokeStyle = "rgba(62,207,142,0.45)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = "700 13px Figtree, system-ui, sans-serif";
  const ribbon = "FLOOR CAST";
  const rw = ctx.measureText(ribbon).width + 28;
  roundRect(ctx, 76, 76, rw, 32, 16);
  ctx.fillStyle = MINT;
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.fillText(ribbon, 90, 97);

  const name = draft.name.trim() || "Your dinosaur";
  const nameSize = fitName(ctx, name, 788);
  ctx.shadowColor = "rgba(62,207,142,0.45)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = CREAM;
  ctx.font = `700 ${nameSize}px Unbounded, ui-sans-serif, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(name, 56, 702);
  ctx.shadowBlur = 0;

  roundRect(ctx, 56, 716, 56, 5, 3);
  ctx.fillStyle = MINT;
  ctx.fill();

  ctx.fillStyle = GOLD;
  ctx.font = "600 20px Figtree, system-ui, sans-serif";
  const role = [draft.title.trim() || "Title", draft.species.trim() || "Species"].join("  ·  ");
  ctx.fillText(role.slice(0, 52), 56, 756);

  const traits = [draft.traitA, draft.traitB, draft.traitC].map((t) => t.trim()).filter(Boolean);
  const pillsBottom = traits.length ? drawPills(ctx, traits.slice(0, 3), 56, 778, 788) : 768;

  const bioTop = pillsBottom + 22;
  const bioH = 1108 - bioTop;
  roundRect(ctx, 56, bioTop, 788, Math.max(bioH, 120), 22);
  ctx.fillStyle = PANEL;
  ctx.fill();
  ctx.fillStyle = MINT;
  ctx.fillRect(56, bioTop + 18, 6, Math.max(bioH, 120) - 36);

  ctx.fillStyle = "rgba(62,207,142,0.9)";
  ctx.font = "700 12px Figtree, system-ui, sans-serif";
  ctx.fillText("BIO", 80, bioTop + 28);
  ctx.fillStyle = CREAM;
  ctx.font = "400 20px Figtree, system-ui, sans-serif";
  const bio =
    draft.bio.trim() || "Who they are. What they do in the city. One tell — coffee order, limp, lucky coin.";
  wrapText(ctx, bio, 730, 5).forEach((line, i) => ctx.fillText(line, 80, bioTop + 56 + i * 28));

  roundRect(ctx, 56, 1126, 200, 36, 18);
  ctx.fillStyle = MINT;
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = "700 15px Unbounded, ui-sans-serif, sans-serif";
  ctx.fillText(TOKEN.ticker, 76, 1150);

  ctx.fillStyle = GOLD;
  ctx.font = "600 14px Figtree, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("WIN A SPOT ON THE FLOOR", 844, 1150);
  ctx.textAlign = "left";

  return canvas;
}

export function CharacterCardStudio({ onReady }: { onReady: (dataUrl: string, draft: CardDraft) => void }) {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const fitRef = useRef(FIT_DEFAULT);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const [artUrl, setArtUrl] = useState<string | null>(null);
  const [artEl, setArtEl] = useState<HTMLImageElement | null>(null);
  const [draft, setDraft] = useState<CardDraft>(EMPTY);
  const [fit, setFit] = useState<ArtFit>(FIT_DEFAULT);
  const [busy, setBusy] = useState(false);
  const [grabbing, setGrabbing] = useState(false);

  fitRef.current = fit;

  useEffect(() => {
    if (!artUrl) {
      setArtEl(null);
      return;
    }
    const img = new Image();
    img.onload = () => setArtEl(img);
    img.src = artUrl;
  }, [artUrl]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    let cancelled = false;
    void renderCharacterCard(artEl, draft, fit).then((src) => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = src.width;
      canvas.height = src.height;
      ctx.drawImage(src, 0, 0);
    });
    return () => {
      cancelled = true;
    };
  }, [artEl, draft, fit]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !artEl) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const k = e.deltaY < 0 ? 1.07 : 1 / 1.07;
      const next = clamp(fitRef.current.scale * k, 0.4, 3.5);
      const rect = canvas.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const cy = ((e.clientY - rect.top) / rect.height) * canvas.height;
      const f = fitRef.current;
      const px = ART.x + ART.w / 2 + f.ox * ART.w;
      const py = ART.y + ART.h / 2 + f.oy * ART.h;
      const ratio = next / f.scale;
      const nx = cx - (cx - px) * ratio;
      const ny = cy - (cy - py) * ratio;
      setFit({
        scale: next,
        ox: clamp((nx - ART.x - ART.w / 2) / ART.w, -1.2, 1.2),
        oy: clamp((ny - ART.y - ART.h / 2) / ART.h, -1.2, 1.2),
      });
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [artEl]);

  const set = (key: keyof CardDraft) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDraft((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Use a PNG or JPG for the portrait");
      return;
    }
    const url = URL.createObjectURL(file);
    setArtUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setFit(FIT_DEFAULT);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!artEl) return;
    const canvas = e.currentTarget;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size >= 2) {
      const pts = [...pointersRef.current.values()];
      pinchRef.current = {
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        scale: fitRef.current.scale,
      };
      dragRef.current = null;
      setGrabbing(false);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const cy = ((e.clientY - rect.top) / rect.height) * canvas.height;
    if (cx < ART.x || cy < ART.y || cx > ART.x + ART.w || cy > ART.y + ART.h) return;
    canvas.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: fit.ox, oy: fit.oy };
    setGrabbing(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    const pinch = pinchRef.current;
    if (pinch && pointersRef.current.size >= 2) {
      const pts = [...pointersRef.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinch.dist > 0) {
        setFit((prev) => ({
          ...prev,
          scale: clamp(pinch.scale * (dist / pinch.dist), 0.4, 3.5),
        }));
      }
      return;
    }
    const drag = dragRef.current;
    if (!drag) return;
    const rect = canvas.getBoundingClientRect();
    const dx = ((e.clientX - drag.x) / rect.width) * canvas.width;
    const dy = ((e.clientY - drag.y) / rect.height) * canvas.height;
    setFit({
      scale: fitRef.current.scale,
      ox: clamp(drag.ox + dx / ART.w, -1.2, 1.2),
      oy: clamp(drag.oy + dy / ART.h, -1.2, 1.2),
    });
  };

  const endDrag = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (!dragRef.current) return;
    dragRef.current = null;
    setGrabbing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const exportCard = async (share: boolean) => {
    setBusy(true);
    try {
      const canvas = await renderCharacterCard(artEl, draft, fit);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      onReady(dataUrl, draft);
      if (share) {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${(draft.name.trim() || "dinoverse-card").replace(/\s+/g, "-").toLowerCase()}.jpg`;
        a.click();
        toast("Card downloaded — post it on X to enter");
      }
    } catch {
      toast("Could not build the card");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-start">
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed border-accent/50 bg-accent/5 p-3">
          <label className="block">
            <span className="text-xs tracking-[0.18em] text-accent uppercase">Portrait</span>
            <input
              type="file"
              accept="image/*"
              className="mt-1.5 block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent-fg"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          {artEl ? (
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="flex items-center justify-between text-xs tracking-[0.18em] text-accent uppercase">
                  Size
                  <span className="font-mono tracking-normal text-fg">{Math.round(fit.scale * 100)}%</span>
                </span>
                <input
                  type="range"
                  min={40}
                  max={350}
                  step={1}
                  value={Math.round(fit.scale * 100)}
                  onChange={(e) => setFit((prev) => ({ ...prev, scale: Number(e.target.value) / 100 }))}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-[#3ecf8e]"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="tape" onClick={() => setFit(FIT_DEFAULT)}>
                  Fit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setFit({
                      scale: coverScale(artEl, ART.w, ART.h),
                      ox: 0,
                      oy: 0,
                    })
                  }
                >
                  Fill
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setFit(FIT_DEFAULT)}>
                  Reset
                </Button>
              </div>
              <p className="text-xs text-muted">Drag the picture to move it. Scroll or pinch to zoom, or use Size.</p>
            </div>
          ) : null}
        </div>
        <label className="block">
          <span className="text-xs tracking-[0.18em] text-accent uppercase">Name</span>
          <input className={fieldClass} maxLength={28} placeholder="e.g. Knox Ledger" value={draft.name} onChange={set("name")} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="text-xs tracking-[0.18em] text-gold uppercase">Title</span>
            <input className={fieldClass} maxLength={32} placeholder="Night Broker" value={draft.title} onChange={set("title")} />
          </label>
          <label className="block min-w-0">
            <span className="text-xs tracking-[0.18em] text-gold uppercase">Species</span>
            <input className={fieldClass} maxLength={32} placeholder="Ankylosaurus" value={draft.species} onChange={set("species")} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["traitA", "traitB", "traitC"] as const).map((key, i) => (
            <label key={key} className="block min-w-0">
              <span className="text-xs tracking-[0.18em] text-accent uppercase">Trait {i + 1}</span>
              <input
                className={fieldClass}
                maxLength={22}
                placeholder={i === 0 ? "Unflappable" : i === 1 ? "Night owl" : "Soft laugh"}
                value={draft[key]}
                onChange={set(key)}
              />
            </label>
          ))}
        </div>
        <label className="block">
          <span className="text-xs tracking-[0.18em] text-accent uppercase">Bio</span>
          <textarea
            className={`${fieldClass} h-28 resize-y py-2`}
            maxLength={280}
            placeholder="Who they are. What they do in the city. One tell — coffee order, limp, lucky coin."
            value={draft.bio}
            onChange={set("bio")}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={busy} onClick={() => void exportCard(true)}>
            <Download />
            Download card
          </Button>
          <Button type="button" variant="tape" disabled={busy} onClick={() => void exportCard(false)}>
            <ImagePlus />
            Use this card
          </Button>
        </div>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent via-gold to-accent opacity-70 blur-[2px]" />
        <div className="relative overflow-hidden rounded-2xl bg-black shadow-[0_20px_60px_rgba(62,207,142,0.18)]">
          <canvas
            ref={previewRef}
            className={cn(
              "aspect-[3/4] w-full object-cover touch-none",
              artEl ? (grabbing ? "cursor-grabbing" : "cursor-grab") : "",
            )}
            aria-label="Character card preview"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        </div>
      </div>
    </div>
  );
}
