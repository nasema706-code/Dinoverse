import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { Copy, Download, Dices, RotateCcw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_BOTTOM_Y,
  DEFAULT_FONT_SIZE,
  DEFAULT_TOP_Y,
  MAX_FONT_SIZE,
  MEME_CANVAS,
  MEME_LOOKS,
  MEME_PACKS,
  MEME_TEMPLATES,
  MIN_FONT_SIZE,
  memeFileName,
  shareCopy,
  templatesInPack,
  type MemeLook,
  type MemePack,
  type MemeTemplate,
} from "@/lib/memes";
import { TOKEN } from "@/lib/token";
import { cn } from "@/lib/utils";

type LookStyle = {
  family: string;
  weight: string;
  uppercase: boolean;
  fill: string;
  stroke: string | null;
  sizeMul: number;
};

const LOOK_STYLE: Record<MemeLook, LookStyle> = {
  impact: {
    family: 'Anton, Impact, "Arial Black", sans-serif',
    weight: "900",
    uppercase: true,
    fill: "#fff",
    stroke: "#000",
    sizeMul: 1,
  },
  tape: {
    family: '"IBM Plex Mono", ui-monospace, monospace',
    weight: "500",
    uppercase: true,
    fill: "#3ecf8e",
    stroke: "#0b0b0c",
    sizeMul: 0.72,
  },
  quiet: {
    family: "Figtree, ui-sans-serif, sans-serif",
    weight: "500",
    uppercase: false,
    fill: "#ece8df",
    stroke: null,
    sizeMul: 0.58,
  },
};

type DrawOpts = {
  imageUrl: string;
  topText: string;
  bottomText: string;
  topSize: number;
  bottomSize: number;
  look: MemeLook;
  topY: number;
  bottomY: number;
  ghostTop: string;
  ghostBottom: string;
  showGhost: boolean;
};

const plateCache = new Map<string, Promise<HTMLImageElement>>();

function loadPlate(url: string): Promise<HTMLImageElement> {
  const hit = plateCache.get(url);
  if (hit) return hit;
  const pending = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      plateCache.delete(url);
      reject(new Error("Could not load that plate."));
    };
    img.src = url;
  });
  plateCache.set(url, pending);
  return pending;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(next).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function fontFor(look: LookStyle, px: number): string {
  return `${look.weight} ${px}px ${look.family}`;
}

function captionPx(size: number, look: LookStyle): number {
  return (size / 100) * MEME_CANVAS * look.sizeMul;
}

function clampFont(size: number): number {
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(size * 10) / 10));
}

type CaptionBox = { x: number; y: number; w: number; h: number; cx: number; cy: number };

function captionBox(
  raw: string,
  yNorm: number,
  size: number,
  lookId: MemeLook,
  fromBottom: boolean,
): CaptionBox {
  const look = LOOK_STYLE[lookId];
  const px = captionPx(size, look);
  let maxW = px * 8;
  let lineCount = Math.max(1, raw.trim().split(/\s+/).length > 6 ? 2 : 1);
  if (typeof document !== "undefined") {
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) {
      const text = (look.uppercase ? raw.toUpperCase() : raw).trim() || " ";
      ctx.font = fontFor(look, px);
      const lines = wrapLines(ctx, text, MEME_CANVAS * 0.92);
      lineCount = Math.max(1, lines.length);
      maxW = Math.max(px * 2.2, ...lines.map((line) => ctx.measureText(line).width));
    }
  }
  const leading = px * 1.1;
  const blockH = lineCount * leading;
  const pad = Math.max(22, px * 0.4);
  const yFirst = yNorm * MEME_CANVAS;
  const firstBaseline = fromBottom ? yFirst - (lineCount - 1) * leading : yFirst;
  const top = firstBaseline - px * 0.82;
  const w = Math.min(MEME_CANVAS - 16, maxW + pad * 2);
  const h = blockH + pad;
  const x = Math.max(8, (MEME_CANVAS - w) / 2);
  const y = Math.max(8, Math.min(MEME_CANVAS - h - 8, top - pad * 0.35));
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}

function paintCaption(
  ctx: CanvasRenderingContext2D,
  raw: string,
  yFirst: number,
  px: number,
  look: LookStyle,
  ghost: boolean,
  fromBottom: boolean,
) {
  if (!raw.trim()) return;
  const text = look.uppercase ? raw.toUpperCase() : raw;
  ctx.font = fontFor(look, px);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.globalAlpha = ghost ? 0.42 : 1;
  ctx.lineWidth = Math.max(2, px / 12);
  ctx.strokeStyle = look.stroke ?? "transparent";
  ctx.fillStyle = look.fill;
  const lines = wrapLines(ctx, text, MEME_CANVAS * 0.92);
  const leading = px * 1.1;
  lines.forEach((line, i) => {
    const yy = fromBottom ? yFirst - (lines.length - 1 - i) * leading : yFirst + i * leading;
    if (look.stroke) ctx.strokeText(line, MEME_CANVAS / 2, yy);
    ctx.fillText(line, MEME_CANVAS / 2, yy);
  });
  ctx.globalAlpha = 1;
}

async function loadFont(look: LookStyle, px: number) {
  try {
    await document.fonts.load(fontFor(look, px));
  } catch {
    /* system fallback */
  }
}

async function drawMeme(canvas: HTMLCanvasElement, opts: DrawOpts, cancelled?: { current: boolean }) {
  const size = MEME_CANVAS;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const look = LOOK_STYLE[opts.look];
  const topPx = captionPx(opts.topSize, look);
  const bottomPx = captionPx(opts.bottomSize, look);
  const image = await loadPlate(opts.imageUrl);
  await Promise.all([loadFont(look, topPx), loadFont(look, bottomPx)]);
  if (cancelled?.current) return;
  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, size, size);
  const scale = Math.max(size / image.width, size / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, (size - dw) / 2, (size - dh) / 2, dw, dh);

  const top = opts.topText.trim();
  const bottom = opts.bottomText.trim();
  paintCaption(
    ctx,
    top || (opts.showGhost ? opts.ghostTop : ""),
    opts.topY * size,
    topPx,
    look,
    !top && opts.showGhost,
    false,
  );
  paintCaption(
    ctx,
    bottom || (opts.showGhost ? opts.ghostBottom : ""),
    opts.bottomY * size,
    bottomPx,
    look,
    !bottom && opts.showGhost,
    true,
  );

  ctx.font = `600 ${size * 0.026}px Figtree, system-ui, sans-serif`;
  ctx.textAlign = "right";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.strokeText(TOKEN.ticker, size - 18, size - 16);
  ctx.fillText(TOKEN.ticker, size - 18, size - 16);
}

function canvasPoint(el: HTMLElement, event: PointerEvent | ReactPointerEvent | WheelEvent) {
  const box = el.getBoundingClientRect();
  return {
    x: ((event.clientX - box.left) / box.width) * MEME_CANVAS,
    y: ((event.clientY - box.top) / box.height) * MEME_CANVAS,
  };
}

type CaptionWhich = "top" | "bottom";

type Gesture =
  | { kind: "move"; which: CaptionWhich; startY: number }
  | { kind: "resize"; which: CaptionWhich; originSize: number; originDist: number; cx: number; cy: number }
  | { kind: "pinch"; which: CaptionWhich; originSize: number; originDist: number };

function MemeCanvas({
  canvasRef,
  opts,
  onMoveY,
  onResize,
  onTap,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  opts: DrawOpts;
  onMoveY: (which: CaptionWhich, y: number) => void;
  onResize: (which: CaptionWhich, size: number) => void;
  onTap: (which: CaptionWhich) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const moved = useRef(false);
  const [active, setActive] = useState<CaptionWhich>("top");

  const topText = opts.topText.trim() || (opts.showGhost ? opts.ghostTop : "");
  const bottomText = opts.bottomText.trim() || (opts.showGhost ? opts.ghostBottom : "");
  const topBox = captionBox(topText, opts.topY, opts.topSize, opts.look, false);
  const bottomBox = captionBox(bottomText, opts.bottomY, opts.bottomSize, opts.look, true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !opts.imageUrl) return;
    const token = { current: false };
    void drawMeme(canvas, opts, token).catch((err) => {
      if (!token.current) toast(err instanceof Error ? err.message : "Could not paint that plate.");
    });
    return () => {
      token.current = true;
    };
  }, [canvasRef, opts]);

  const sizeOf = (which: CaptionWhich) => (which === "top" ? opts.topSize : opts.bottomSize);

  const whichAt = (x: number, y: number): CaptionWhich => {
    const inTop =
      x >= topBox.x && x <= topBox.x + topBox.w && y >= topBox.y && y <= topBox.y + topBox.h;
    const inBottom =
      x >= bottomBox.x &&
      x <= bottomBox.x + bottomBox.w &&
      y >= bottomBox.y &&
      y <= bottomBox.y + bottomBox.h;
    if (inTop && !inBottom) return "top";
    if (inBottom && !inTop) return "bottom";
    const topDist = Math.hypot(x - topBox.cx, y - topBox.cy);
    const bottomDist = Math.hypot(x - bottomBox.cx, y - bottomBox.cy);
    return topDist <= bottomDist ? "top" : "bottom";
  };

  const boxOf = (which: CaptionWhich) => (which === "top" ? topBox : bottomBox);

  const startResize = (which: CaptionWhich, x: number, y: number) => {
    const box = boxOf(which);
    const dist = Math.hypot(x - box.cx, y - box.cy) || 1;
    gesture.current = {
      kind: "resize",
      which,
      originSize: sizeOf(which),
      originDist: dist,
      cx: box.cx,
      cy: box.cy,
    };
    setActive(which);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.setPointerCapture(event.pointerId);
    const pt = canvasPoint(stage, event);
    pointers.current.set(event.pointerId, pt);
    moved.current = false;
    const which = whichAt(pt.x, pt.y);
    setActive(which);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const midY = (a.y + b.y) / 2;
      const midX = (a.x + b.x) / 2;
      const pinchWhich = whichAt(midX, midY);
      gesture.current = {
        kind: "pinch",
        which: pinchWhich,
        originSize: sizeOf(pinchWhich),
        originDist: dist,
      };
      setActive(pinchWhich);
      return;
    }

    const handle = (event.target as HTMLElement).closest("[data-handle]") as HTMLElement | null;
    const handleWhich = handle?.dataset.which;
    if (handleWhich === "top" || handleWhich === "bottom") {
      startResize(handleWhich, pt.x, pt.y);
      return;
    }
    gesture.current = { kind: "move", which, startY: pt.y };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    const activeGesture = gesture.current;
    if (!stage || !activeGesture) return;
    const pt = canvasPoint(stage, event);
    pointers.current.set(event.pointerId, pt);

    if (activeGesture.kind === "pinch" && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      onResize(activeGesture.which, clampFont(activeGesture.originSize * (dist / activeGesture.originDist)));
      moved.current = true;
      return;
    }

    if (activeGesture.kind === "resize") {
      const dist = Math.hypot(pt.x - activeGesture.cx, pt.y - activeGesture.cy) || 1;
      if (Math.abs(dist - activeGesture.originDist) > 6) moved.current = true;
      onResize(activeGesture.which, clampFont(activeGesture.originSize * (dist / activeGesture.originDist)));
      return;
    }

    if (activeGesture.kind !== "move") return;
    if (Math.abs(pt.y - activeGesture.startY) > 8) moved.current = true;
    if (!moved.current) return;
    const next = Math.min(0.94, Math.max(0.08, pt.y / MEME_CANVAS));
    onMoveY(activeGesture.which, next);
  };

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const activeGesture = gesture.current;
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) {
      if (activeGesture && !moved.current && activeGesture.kind === "move") {
        onTap(activeGesture.which);
      }
      gesture.current = null;
    }
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const pt = canvasPoint(stage, event);
      const which = whichAt(pt.x, pt.y);
      setActive(which);
      const delta = event.deltaY > 0 ? -0.45 : 0.45;
      onResize(which, clampFont(sizeOf(which) + delta));
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  });

  const frame = (which: CaptionWhich, box: CaptionBox) => (
    <div
      className={cn(
        "absolute border border-dashed",
        active === which ? "border-accent/80" : "border-white/25 hover:border-white/50",
      )}
      style={{
        left: `${(box.x / MEME_CANVAS) * 100}%`,
        top: `${(box.y / MEME_CANVAS) * 100}%`,
        width: `${(box.w / MEME_CANVAS) * 100}%`,
        height: `${(box.h / MEME_CANVAS) * 100}%`,
      }}
    >
      {(["nw", "ne", "sw", "se"] as const).map((corner) => (
        <span
          key={corner}
          data-handle={corner}
          data-which={which}
          role="button"
          aria-label={`Resize ${which} caption`}
          className={cn(
            "absolute z-10 size-4 rounded-[2px] border border-bg bg-accent before:absolute before:-inset-3 before:content-['']",
            corner === "nw" && "-top-2 -left-2 cursor-nwse-resize",
            corner === "ne" && "-top-2 -right-2 cursor-nesw-resize",
            corner === "sw" && "-bottom-2 -left-2 cursor-nesw-resize",
            corner === "se" && "-bottom-2 -right-2 cursor-nwse-resize",
          )}
        />
      ))}
    </div>
  );

  return (
    <div
      ref={stageRef}
      className="relative touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Meme preview. Drag a caption to move it. Drag a corner or pinch to resize."
        className="aspect-square w-full rounded-xl border border-border bg-surface-2 shadow-2xl"
      />
      <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
        {frame("top", topBox)}
        {frame("bottom", bottomBox)}
      </div>
    </div>
  );
}

function ActionBar({
  className,
  onDownload,
  onCopy,
  onShareX,
}: {
  className?: string;
  onDownload: () => void;
  onCopy: () => void;
  onShareX: () => void;
}) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      <Button type="button" variant="secondary" className="h-12" onClick={onCopy}>
        <Copy />
        Copy
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="h-12"
        aria-label="Share to X"
        title="Share to X"
        onClick={onShareX}
      >
        <Share2 />
        Share
      </Button>
      <Button type="button" className="h-12" onClick={onDownload}>
        <Download />
        Download
      </Button>
    </div>
  );
}

export function MemeMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportRef = useRef<HTMLCanvasElement>(null);
  const exportBlob = useRef<Blob | null>(null);
  const topInput = useRef<HTMLInputElement>(null);
  const bottomInput = useRef<HTMLInputElement>(null);
  const [pack, setPack] = useState<"all" | MemePack>(MEME_TEMPLATES[0].pack);
  const [plate, setPlate] = useState<MemeTemplate>(MEME_TEMPLATES[0]);
  const [packOpen, setPackOpen] = useState(false);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [look, setLook] = useState<MemeLook>("impact");
  const [topY, setTopY] = useState(DEFAULT_TOP_Y);
  const [bottomY, setBottomY] = useState(DEFAULT_BOTTOM_Y);
  const [topSize, setTopSize] = useState(DEFAULT_FONT_SIZE);
  const [bottomSize, setBottomSize] = useState(DEFAULT_FONT_SIZE);

  const plates = templatesInPack(pack);
  const ghost = plate.captions[0] ?? { top: "Bones are about to list", bottom: "We built the city first" };

  useEffect(() => {
    const next = templatesInPack(pack);
    if (next.some((item) => item.id === plate.id)) return;
    setPlate(next[0] ?? MEME_TEMPLATES[0]);
  }, [pack, plate.id]);

  const opts = useMemo<DrawOpts>(
    () => ({
      imageUrl: plate.url,
      topText,
      bottomText,
      topSize,
      bottomSize,
      look,
      topY,
      bottomY,
      ghostTop: ghost.top,
      ghostBottom: ghost.bottom,
      showGhost: true,
    }),
    [plate.url, topText, bottomText, topSize, bottomSize, look, topY, bottomY, ghost.top, ghost.bottom],
  );

  const pickPlate = (next: MemeTemplate) => {
    setPlate(next);
    setPack(next.pack);
  };

  const applyCaption = (caption: { top: string; bottom: string }) => {
    setTopText(caption.top);
    setBottomText(caption.bottom);
  };

  const surprise = () => {
    const pool = plates.length ? plates : MEME_TEMPLATES;
    const next = pool[Math.floor(Math.random() * pool.length)] ?? MEME_TEMPLATES[0];
    const caption = next.captions[Math.floor(Math.random() * next.captions.length)] ?? next.captions[0];
    const looks: MemeLook[] = ["impact", "tape", "quiet"];
    setPlate(next);
    if (caption) applyCaption(caption);
    setLook(looks[Math.floor(Math.random() * looks.length)] ?? "impact");
    setTopY(DEFAULT_TOP_Y);
    setBottomY(DEFAULT_BOTTOM_Y);
    setTopSize(DEFAULT_FONT_SIZE);
    setBottomSize(DEFAULT_FONT_SIZE);
  };

  const reset = () => {
    setPack(MEME_TEMPLATES[0].pack);
    setPackOpen(false);
    setPlate(MEME_TEMPLATES[0]);
    setTopText("");
    setBottomText("");
    setLook("impact");
    setTopY(DEFAULT_TOP_Y);
    setBottomY(DEFAULT_BOTTOM_Y);
    setTopSize(DEFAULT_FONT_SIZE);
    setBottomSize(DEFAULT_FONT_SIZE);
  };

  useEffect(() => {
    const canvas = exportRef.current;
    if (!canvas) return;
    const token = { current: false };
    void drawMeme(canvas, { ...opts, showGhost: false }, token).then(() => {
      if (token.current) return;
      canvas.toBlob((blob) => {
        if (!token.current) exportBlob.current = blob;
      }, "image/png");
    });
    return () => {
      token.current = true;
    };
  }, [opts]);

  const copyFallback = async () => {
    try {
      await navigator.clipboard.writeText(shareCopy(topText, bottomText));
      toast("Caption copied. Image copy needs a secure browser.");
    } catch {
      toast("Could not copy. Download the PNG instead.");
    }
  };

  const download = () => {
    const canvas = exportRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = memeFileName(plate, topText);
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const copyImage = () => {
    const blob = exportBlob.current;
    if (!blob) {
      void copyFallback();
      return;
    }
    void navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).then(
      () => toast("Copied"),
      () => void copyFallback(),
    );
  };

  const shareX = () => {
    const text = shareCopy(topText, bottomText);
    const blob = exportBlob.current;
    const file = blob ? new File([blob], memeFileName(plate, topText), { type: "image/png" }) : null;
    if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
      void navigator.share({ files: [file], text, title: TOKEN.ticker }).catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
          "_blank",
          "noopener,noreferrer",
        );
      });
      return;
    }
    if (blob) {
      void navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).then(
        () => toast("Image copied. Paste it into the post."),
        () => {},
      );
    }
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const onMoveY = (which: CaptionWhich, y: number) => {
    if (which === "top") {
      setTopY(Math.min(y, bottomY - 0.12));
    } else {
      setBottomY(Math.max(y, topY + 0.12));
    }
  };

  const onResize = (which: CaptionWhich, size: number) => {
    if (which === "top") setTopSize(size);
    else setBottomSize(size);
  };

  const field =
    "mt-1.5 h-11 w-full rounded-sm border border-border bg-bg px-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-accent";

  return (
    <div>
      <div className="flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.18em] text-gold uppercase">
            Solana · {TOKEN.ticker}
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-5xl">
            Make the meme. The city already clocked in.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Tap a caption, drag the lines, pull a corner to resize, or surprise yourself. Plates
            only — no uploads.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={surprise}>
            <Dices />
            Surprise me
          </Button>
          <Button type="button" variant="ghost" onClick={reset}>
            <RotateCcw />
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <MemeCanvas
            canvasRef={canvasRef}
            opts={opts}
            onMoveY={onMoveY}
            onResize={onResize}
            onTap={(which) => {
              const el = which === "top" ? topInput.current : bottomInput.current;
              el?.focus();
              el?.select();
            }}
          />
          <canvas ref={exportRef} className="hidden" aria-hidden width={MEME_CANVAS} height={MEME_CANVAS} />
          <p className="mt-2 text-xs text-subtle">
            Drag a line to move it. Drag a corner or pinch to resize. Tap a line to edit. Ghost text
            is a preview — it will not download.
          </p>
          <ActionBar
            className="sticky bottom-3 z-20 mt-4 rounded-xl border border-border bg-bg/95 p-2 backdrop-blur lg:hidden"
            onDownload={download}
            onCopy={copyImage}
            onShareX={shareX}
          />
        </div>

        <div className="space-y-6 rounded-xl border border-border bg-surface p-5 pb-24 sm:p-6 lg:pb-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium tracking-[0.2em] text-muted uppercase">Template</p>
              <button
                type="button"
                onClick={() => setPackOpen((open) => !open)}
                className="text-xs font-medium text-gold hover:underline"
              >
                {packOpen ? "Hide packs" : "Browse packs"}
              </button>
            </div>
            {packOpen ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {MEME_PACKS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPack(item.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium",
                      pack === item.id
                        ? "border-gold bg-gold text-gold-fg"
                        : "border-border text-muted hover:text-fg",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {plates.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  title={item.name}
                  onClick={() => pickPlate(item)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg border text-left transition-all",
                    plate.id === item.id
                      ? "border-gold ring-2 ring-gold/40"
                      : "border-border hover:border-muted",
                  )}
                >
                  <img src={item.url} alt={item.label} className="size-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 truncate bg-bg/80 px-1.5 py-1 text-[10px] font-medium text-fg">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium tracking-[0.2em] text-muted uppercase">One-tap captions</p>
            <div className="mt-2 flex flex-col gap-1.5">
              {plate.captions.map((caption) => {
                const active = topText === caption.top && bottomText === caption.bottom;
                return (
                  <button
                    key={`${caption.top}-${caption.bottom}`}
                    type="button"
                    onClick={() => applyCaption(caption)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-sm leading-snug",
                      active
                        ? "border-gold bg-gold/10 text-fg"
                        : "border-border text-muted hover:border-muted hover:text-fg",
                    )}
                  >
                    <span className="block font-medium text-fg">{caption.top}</span>
                    <span>{caption.bottom}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium tracking-[0.2em] text-muted uppercase">Look</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {MEME_LOOKS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLook(item.id)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-center",
                    look === item.id
                      ? "border-gold bg-gold/10"
                      : "border-border hover:border-muted",
                  )}
                >
                  <span className="block text-sm font-medium text-fg">{item.label}</span>
                  <span className="text-[10px] text-subtle">{item.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="block text-xs tracking-wide text-muted uppercase">
            Top text
            <input
              ref={topInput}
              className={field}
              value={topText}
              maxLength={140}
              placeholder={ghost.top}
              onChange={(event) => setTopText(event.target.value)}
            />
          </label>

          <label className="block text-xs tracking-wide text-muted uppercase">
            Bottom text
            <input
              ref={bottomInput}
              className={field}
              value={bottomText}
              maxLength={140}
              placeholder={ghost.bottom}
              onChange={(event) => setBottomText(event.target.value)}
            />
          </label>

          <p className="text-xs text-subtle">
            Every meme is stamped {TOKEN.ticker} in the corner.
          </p>

          <ActionBar
            className="hidden lg:grid"
            onDownload={download}
            onCopy={copyImage}
            onShareX={shareX}
          />
        </div>
      </div>
    </div>
  );
}
