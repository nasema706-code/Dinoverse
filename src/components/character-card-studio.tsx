import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Download, FlipHorizontal2, ImagePlus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DECORS,
  VINYLS,
  drawDecorKind,
  drawStickers,
  hitSticker,
  newSticker,
  type CardSticker,
  type DecorKind,
} from "@/lib/card-decor";
import { drawCardArt, drawCardCopy, drawCardPaper, drawFitted, loadCardWordmark, roundRect } from "@/lib/card-layouts";
import {
  CARD_TEMPLATES,
  DEFAULT_TEMPLATE,
  EMPTY_DRAFT,
  FIT_DEFAULT,
  PAPER,
  TELL_PLACEHOLDERS,
  hitArt,
  type ArtFit,
  type CardDraft,
  type CardTemplate,
} from "@/lib/card-templates";
import { CARD_SHEENS, DEFAULT_SHEEN, drawCardSheen, type CardSheen } from "@/lib/card-sheen";
import { CARD_THEMES, DEFAULT_THEME, hexAlpha, type CardTheme } from "@/lib/card-themes";
import { CARD_TYPES, DEFAULT_TYPE, withInk, type CardTypeface } from "@/lib/card-type";
import { cn } from "@/lib/utils";

export type { ArtFit, CardDraft };

export type BgMode = "paper" | "scene";

const fieldClass =
  "mt-1.5 h-11 w-full rounded-md border border-accent/25 bg-bg px-3 text-sm text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent";

type StampPackId = "foil" | "vinyl";

const STAMP_PACKS = [
  {
    id: "foil" as const,
    name: "Vault Foil",
    series: "Pack 01",
    blurb: "Vault medals. Gold rim, ivory cut.",
    items: DECORS,
    previews: ["rex", "fossil", "coin"] as const satisfies readonly DecorKind[],
  },
  {
    id: "vinyl" as const,
    name: "Hot Vinyl",
    series: "Pack 02",
    blurb: "Die-cut enamel. Loud colour, cream edge.",
    items: VINYLS,
    previews: ["poprex", "bloom", "bolt"] as const satisfies readonly DecorKind[],
  },
];

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

function canvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * canvas.width,
    y: ((clientY - rect.top) / rect.height) * canvas.height,
  };
}

export type CardRenderInput = {
  art: HTMLImageElement | null;
  draft: CardDraft;
  fit?: ArtFit;
  stickers?: CardSticker[];
  selectedId?: string | null;
  theme?: CardTheme;
  sheen?: CardSheen;
  type?: CardTypeface;
  bg?: HTMLImageElement | null;
  bgFit?: ArtFit;
  bgDim?: number;
  bgMode?: BgMode;
  template?: CardTemplate;
};

export async function renderCharacterCard({
  art,
  draft,
  fit = FIT_DEFAULT,
  stickers = [],
  selectedId = null,
  theme = DEFAULT_THEME,
  sheen = DEFAULT_SHEEN,
  type = DEFAULT_TYPE,
  bg = null,
  bgFit = FIT_DEFAULT,
  bgDim = 0.55,
  bgMode = "paper",
  template = DEFAULT_TEMPLATE,
}: CardRenderInput) {
  const mark = await loadCardWordmark();
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined);
    await document.fonts.load(`${type.weight} 56px "${type.family}"`).catch(() => undefined);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const wash = ctx.createRadialGradient(180, 80, 20, 450, 520, 820);
  wash.addColorStop(0, theme.wash0);
  wash.addColorStop(0.45, theme.wash1);
  wash.addColorStop(1, theme.wash2);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, 900, 1200);

  if (bg && bgMode === "paper") {
    ctx.save();
    roundRect(ctx, PAPER.x, PAPER.y, PAPER.w, PAPER.h, 28);
    ctx.clip();
    drawFitted(ctx, bg, PAPER, bgFit);
    ctx.fillStyle = hexAlpha(theme.wash2, clamp(bgDim, 0, 0.9));
    ctx.fillRect(0, 0, 900, 1200);
    ctx.restore();
  }

  drawCardPaper(ctx, theme);
  drawCardArt(ctx, template, theme, art, fit, bg, bgFit, bgDim, Boolean(bg && bgMode === "scene"));
  drawCardCopy(ctx, template, draft, theme, type, mark);

  ctx.save();
  roundRect(ctx, PAPER.x, PAPER.y, PAPER.w, PAPER.h, 28);
  ctx.clip();
  drawStickers(ctx, stickers, selectedId);
  ctx.restore();

  drawCardSheen(ctx, sheen, theme);

  return canvas;
}

export function CharacterCardStudio({ onReady }: { onReady: (dataUrl: string, draft: CardDraft) => void }) {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const fitRef = useRef(FIT_DEFAULT);
  const templateRef = useRef<CardTemplate>(DEFAULT_TEMPLATE);
  const stickersRef = useRef<CardSticker[]>([]);
  const selectedRef = useRef<string | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const stickerDragRef = useRef<{ id: string; x: number; y: number; sx: number; sy: number } | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const [artUrl, setArtUrl] = useState<string | null>(null);
  const [artEl, setArtEl] = useState<HTMLImageElement | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [bgEl, setBgEl] = useState<HTMLImageElement | null>(null);
  const [draft, setDraft] = useState<CardDraft>(EMPTY_DRAFT);
  const [fit, setFit] = useState<ArtFit>(FIT_DEFAULT);
  const [bgFit, setBgFit] = useState<ArtFit>(FIT_DEFAULT);
  const [bgDim, setBgDim] = useState(0.55);
  const [bgMode, setBgMode] = useState<BgMode>("paper");
  const [template, setTemplate] = useState<CardTemplate>(DEFAULT_TEMPLATE);
  const [stickers, setStickers] = useState<CardSticker[]>([]);
  const [theme, setTheme] = useState<CardTheme>(DEFAULT_THEME);
  const [sheen, setSheen] = useState<CardSheen>(DEFAULT_SHEEN);
  const [type, setType] = useState<CardTypeface>(DEFAULT_TYPE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decorPack, setDecorPack] = useState<StampPackId>("foil");
  const [busy, setBusy] = useState(false);
  const [grabbing, setGrabbing] = useState(false);

  fitRef.current = fit;
  templateRef.current = template;
  stickersRef.current = stickers;
  selectedRef.current = selectedId;
  const selected = stickers.find((s) => s.id === selectedId) ?? null;

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
    if (!bgUrl) {
      setBgEl(null);
      return;
    }
    const img = new Image();
    img.onload = () => setBgEl(img);
    img.src = bgUrl;
  }, [bgUrl]);

  const artUrlRef = useRef(artUrl);
  const bgUrlRef = useRef(bgUrl);
  artUrlRef.current = artUrl;
  bgUrlRef.current = bgUrl;
  useEffect(() => {
    return () => {
      if (artUrlRef.current) URL.revokeObjectURL(artUrlRef.current);
      if (bgUrlRef.current) URL.revokeObjectURL(bgUrlRef.current);
    };
  }, []);

  const look = () => ({
    art: artEl,
    draft,
    fit,
    stickers,
    selectedId,
    theme,
    sheen,
    type,
    bg: bgEl,
    bgFit,
    bgDim,
    bgMode,
    template,
  });

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    let cancelled = false;
    void renderCharacterCard({
      art: artEl,
      draft,
      fit,
      stickers,
      selectedId,
      theme,
      sheen,
      type,
      bg: bgEl,
      bgFit,
      bgDim,
      bgMode,
      template,
    }).then((src) => {
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
  }, [artEl, bgEl, draft, fit, bgFit, bgDim, bgMode, stickers, selectedId, theme, sheen, type, template]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const k = e.deltaY < 0 ? 1.07 : 1 / 1.07;
      const sel = selectedRef.current;
      if (sel) {
        setStickers((prev) =>
          prev.map((s) => (s.id === sel ? { ...s, scale: clamp(s.scale * k, 0.35, 2.4) } : s)),
        );
        return;
      }
      if (!artEl) return;
      const art = templateRef.current.art;
      const next = clamp(fitRef.current.scale * k, 0.4, 3.5);
      const { x: cx, y: cy } = canvasPoint(canvas, e.clientX, e.clientY);
      const f = fitRef.current;
      const px = art.x + art.w / 2 + f.ox * art.w;
      const py = art.y + art.h / 2 + f.oy * art.h;
      const ratio = next / f.scale;
      const nx = cx - (cx - px) * ratio;
      const ny = cy - (cy - py) * ratio;
      setFit({
        scale: next,
        ox: clamp((nx - art.x - art.w / 2) / art.w, -1.2, 1.2),
        oy: clamp((ny - art.y - art.h / 2) / art.h, -1.2, 1.2),
      });
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [artEl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key !== "Backspace" && e.key !== "Delete") || !selectedRef.current) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      const id = selectedRef.current;
      setStickers((prev) => prev.filter((s) => s.id !== id));
      setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const set = (key: keyof CardDraft) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDraft((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onFile = (file: File | undefined, kind: "art" | "bg") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast(kind === "bg" ? "Use a PNG or JPG for the background" : "Use a PNG or JPG for the portrait");
      return;
    }
    const url = URL.createObjectURL(file);
    if (kind === "bg") {
      setBgUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setBgFit(FIT_DEFAULT);
      return;
    }
    setArtUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setFit(FIT_DEFAULT);
  };

  const clearBg = () => {
    setBgUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setBgFit(FIT_DEFAULT);
  };

  const addDecor = (kind: DecorKind) => {
    if (stickers.length >= 14) {
      toast("That's a full jungle — delete one to add another");
      return;
    }
    const n = stickers.length;
    const art = template.art;
    const sticker = newSticker(
      kind,
      art.x + art.w * (0.28 + (n % 4) * 0.15),
      art.y + art.h * (0.28 + Math.floor(n / 4) * 0.18),
    );
    setStickers((prev) => [...prev, sticker]);
    setSelectedId(sticker.id);
  };

  const patchSelected = (patch: Partial<CardSticker>) => {
    if (!selectedId) return;
    setStickers((prev) => prev.map((s) => (s.id === selectedId ? { ...s, ...patch } : s)));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size >= 2) {
      const pts = [...pointersRef.current.values()];
      pinchRef.current = {
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        scale: fitRef.current.scale,
      };
      dragRef.current = null;
      stickerDragRef.current = null;
      setGrabbing(false);
      return;
    }
    const { x: cx, y: cy } = canvasPoint(canvas, e.clientX, e.clientY);
    const hit = [...stickersRef.current].reverse().find((s) => hitSticker(s, cx, cy));
    canvas.setPointerCapture(e.pointerId);
    if (hit) {
      setSelectedId(hit.id);
      stickerDragRef.current = { id: hit.id, x: e.clientX, y: e.clientY, sx: hit.x, sy: hit.y };
      dragRef.current = null;
      setGrabbing(true);
      return;
    }
    setSelectedId(null);
    if (!artEl) return;
    if (!hitArt(templateRef.current.art, cx, cy)) return;
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
    const stickerDrag = stickerDragRef.current;
    if (stickerDrag) {
      const rect = canvas.getBoundingClientRect();
      const dx = ((e.clientX - stickerDrag.x) / rect.width) * canvas.width;
      const dy = ((e.clientY - stickerDrag.y) / rect.height) * canvas.height;
      setStickers((prev) =>
        prev.map((s) =>
          s.id === stickerDrag.id
            ? {
                ...s,
                x: clamp(stickerDrag.sx + dx, 40, 860),
                y: clamp(stickerDrag.sy + dy, 40, 1160),
              }
            : s,
        ),
      );
      return;
    }
    const drag = dragRef.current;
    if (!drag) return;
    const rect = canvas.getBoundingClientRect();
    const dx = ((e.clientX - drag.x) / rect.width) * canvas.width;
    const dy = ((e.clientY - drag.y) / rect.height) * canvas.height;
    setFit({
      scale: fitRef.current.scale,
      ox: clamp(drag.ox + dx / templateRef.current.art.w, -1.2, 1.2),
      oy: clamp(drag.oy + dy / templateRef.current.art.h, -1.2, 1.2),
    });
  };

  const endDrag = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    stickerDragRef.current = null;
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
      const canvas = await renderCharacterCard({ ...look(), selectedId: null });
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

  const actions = (
    <>
      <Button type="button" size="sm" className="w-full md:w-auto" disabled={busy} onClick={() => void exportCard(true)}>
        <Download />
        <span className="md:hidden">Save</span>
        <span className="hidden md:inline">Download card</span>
      </Button>
      <Button type="button" size="sm" variant="tape" className="w-full md:w-auto" disabled={busy} onClick={() => void exportCard(false)}>
        <ImagePlus />
        <span className="md:hidden">Use</span>
        <span className="hidden md:inline">Use this card</span>
      </Button>
    </>
  );

  const preview = (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute -inset-1 rounded-2xl opacity-80 blur-[2px]"
        style={{
          background: `linear-gradient(135deg, ${theme.inner}, ${theme.border}, ${theme.inner})`,
        }}
      />
      <div className="relative overflow-hidden rounded-xl bg-black shadow-[0_20px_60px_rgba(62,207,142,0.18)] md:rounded-2xl">
        <canvas
          ref={previewRef}
          className={cn(
            "aspect-[3/4] h-auto w-full object-cover touch-none",
            grabbing ? "cursor-grabbing" : "cursor-grab",
          )}
          aria-label="Character card preview"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 md:grid md:h-auto md:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)] md:items-start md:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] lg:gap-6">
      <div
        className={cn(
          "z-20 shrink-0",
          "md:sticky md:order-2 md:w-full md:top-[calc(4rem+env(safe-area-inset-top,0px))]",
        )}
      >
        <div className="mx-auto w-[min(100%,calc(min(38svh,18rem)*0.75))] md:w-full">
          {preview}
        </div>
        <div className="mx-auto mt-1.5 grid w-[min(100%,calc(min(38svh,18rem)*0.75))] grid-cols-2 gap-2 md:hidden">
          {actions}
        </div>
        <p className="mt-2 hidden text-xs text-muted md:block">Click a stamp to add it. Drag it around the card.</p>
      </div>
      <div
        className="min-h-0 min-w-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain pr-0.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:order-1 md:space-y-4 md:overflow-visible md:pb-0"
        onFocusCapture={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) return;
          if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") return;
          const pane = event.currentTarget;
          window.setTimeout(() => {
            const paneBox = pane.getBoundingClientRect();
            const fieldBox = target.getBoundingClientRect();
            pane.scrollTop += fieldBox.top - paneBox.top - paneBox.height / 2 + fieldBox.height / 2;
          }, 80);
        }}
      >
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-3">
          <p className="text-xs tracking-[0.18em] text-gold uppercase">Template</p>
          <p className="mt-1 hidden text-xs text-muted sm:block">Pick a base. Colours, type, and stamps sit on top.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {CARD_TEMPLATES.map((item) => {
              const on = template.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTemplate(item);
                    setFit(FIT_DEFAULT);
                  }}
                  className={cn(
                    "overflow-hidden rounded-xl border text-left",
                    on ? "border-fg bg-surface-2 ring-2 ring-fg/70" : "border-border hover:border-gold/50",
                  )}
                  aria-pressed={on}
                  title={`${item.label} — ${item.hint}`}
                >
                  <TemplateThumb id={item.id} />
                  <span className="block px-2 py-1.5">
                    <span className="block text-[11px] font-semibold leading-tight text-fg">{item.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-tight text-subtle">{item.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-accent/50 bg-accent/5 p-3">
          <label className="block">
            <span className="text-xs tracking-[0.18em] text-accent uppercase">Portrait</span>
            <input
              type="file"
              accept="image/*"
              className="mt-1.5 block w-full min-w-0 text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2.5 file:text-xs file:font-medium file:text-accent-fg sm:text-sm sm:file:text-sm"
              onChange={(e) => onFile(e.target.files?.[0], "art")}
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
                      scale: coverScale(artEl, template.art.w, template.art.h),
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
        <div className="rounded-xl border border-dashed border-gold/45 bg-gold/5 p-3">
          <label className="block">
            <span className="text-xs tracking-[0.18em] text-gold uppercase">Background</span>
            <input
              type="file"
              accept="image/*"
              className="mt-1.5 block w-full min-w-0 text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-2.5 file:text-xs file:font-medium file:text-gold-fg sm:text-sm sm:file:text-sm"
              onChange={(e) => onFile(e.target.files?.[0], "bg")}
            />
          </label>
          <p className="mt-2 hidden text-xs text-muted sm:block">A city photo, jungle, bedroom, club — whatever their world looks like.</p>
          {bgEl ? (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant={bgMode === "paper" ? "tape" : "outline"} onClick={() => setBgMode("paper")}>
                  Card paper
                </Button>
                <Button type="button" size="sm" variant={bgMode === "scene" ? "tape" : "outline"} onClick={() => setBgMode("scene")}>
                  Behind portrait
                </Button>
              </div>
              <label className="block">
                <span className="flex items-center justify-between text-xs tracking-[0.18em] text-gold uppercase">
                  Dim
                  <span className="font-mono tracking-normal text-fg">{Math.round(bgDim * 100)}%</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={1}
                  value={Math.round(bgDim * 100)}
                  onChange={(e) => setBgDim(Number(e.target.value) / 100)}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-[#e8c36a]"
                />
              </label>
              <label className="block">
                <span className="flex items-center justify-between text-xs tracking-[0.18em] text-gold uppercase">
                  Size
                  <span className="font-mono tracking-normal text-fg">{Math.round(bgFit.scale * 100)}%</span>
                </span>
                <input
                  type="range"
                  min={40}
                  max={350}
                  step={1}
                  value={Math.round(bgFit.scale * 100)}
                  onChange={(e) => setBgFit((prev) => ({ ...prev, scale: Number(e.target.value) / 100 }))}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-[#e8c36a]"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="tape" onClick={() => setBgFit(FIT_DEFAULT)}>
                  Fit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setBgFit({
                      scale: coverScale(bgEl, bgMode === "scene" ? template.art.w : PAPER.w, bgMode === "scene" ? template.art.h : PAPER.h),
                      ox: 0,
                      oy: 0,
                    })
                  }
                >
                  Fill
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={clearBg}>
                  Clear
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-3">
          <p className="text-xs tracking-[0.18em] text-accent uppercase">Colours</p>
          <p className="mt-1 hidden text-xs text-muted sm:block">Pick a wash, then a sheen. Background photos sit under this colour.</p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {CARD_THEMES.map((item) => {
              const on = theme.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item)}
                  className={cn(
                    "flex min-w-0 flex-col items-center gap-1.5 rounded-lg border px-1 py-2 text-[10px] leading-tight",
                    on ? "border-fg text-fg" : "border-border text-muted hover:border-gold/50 hover:text-fg",
                  )}
                  aria-pressed={on}
                >
                  <span
                    className="size-8 rounded-full ring-2 ring-inset sm:size-9"
                    style={{
                      background: `radial-gradient(circle at 30% 25%, ${item.wash0}, ${item.wash2})`,
                      boxShadow: `inset 0 0 0 3px ${item.border}, 0 0 0 2px ${item.inner}`,
                    }}
                    aria-hidden
                  />
                  <span className="w-full truncate text-center">{item.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-[10px] tracking-[0.2em] text-gold uppercase">Sheen</p>
          <p className="mt-0.5 hidden text-xs text-muted sm:block">Overall finish. Foil, metal, or glow on top of the colour.</p>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {CARD_SHEENS.map((item) => {
              const on = sheen.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.hint}
                  onClick={() => setSheen(item)}
                  className={cn(
                    "flex min-w-0 flex-col items-center gap-1.5 rounded-lg border px-1 py-2 text-[10px] leading-tight",
                    on ? "border-fg text-fg" : "border-border text-muted hover:border-gold/50 hover:text-fg",
                  )}
                  aria-pressed={on}
                >
                  <span
                    className="size-8 rounded-full ring-2 ring-inset ring-white/10 sm:size-9"
                    style={{
                      background: item.swatch,
                      boxShadow: on ? "0 0 0 2px rgba(255,248,238,0.35)" : undefined,
                    }}
                    aria-hidden
                  />
                  <span className="w-full truncate text-center">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-bg/40 p-3">
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Type</p>
          <p className="mt-1 hidden text-xs text-muted sm:block">Names on the card. A face, then an ink that sits on the wash.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {CARD_TYPES.map((item) => {
              const on = type.id === item.id;
              const preview = on ? type.color : item.inks[0].color;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-left leading-tight",
                    on ? "border-fg bg-surface-2" : "border-border hover:border-gold/50",
                  )}
                >
                  <button type="button" className="w-full text-left" onClick={() => setType(withInk(item, on ? type.inkId : item.inks[0].id))} aria-pressed={on}>
                    <span className="block text-sm" style={{ fontFamily: item.stack, fontWeight: item.weight, color: preview }}>
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-subtle">{item.family}</span>
                  </button>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.inks.map((ink) => {
                      const picked = on && type.inkId === ink.id;
                      return (
                        <button
                          key={ink.id}
                          type="button"
                          title={ink.label}
                          aria-label={`${item.label}, ${ink.label}`}
                          aria-pressed={picked}
                          onClick={() => setType(withInk(item, ink.id))}
                          className={cn(
                            "size-6 rounded-full border border-black/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)] sm:size-5",
                            picked ? "ring-2 ring-fg ring-offset-1 ring-offset-bg" : "hover:scale-110",
                          )}
                          style={{ background: ink.color }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-gold/35 bg-gold/5 p-3">
          <p className="text-xs tracking-[0.18em] text-gold uppercase">Decorate</p>
          <p className="mt-1 hidden text-xs text-muted sm:block">Pick a pack, tap a stamp, then drag it on the card.</p>
          <Tabs value={decorPack} onValueChange={(value) => setDecorPack(value as StampPackId)} className="mt-3">
            <TabsList className="grid grid-cols-2 gap-2 border-0 bg-transparent p-0 sm:flex-nowrap">
              {STAMP_PACKS.map((pack) => {
                const onCard = stickers.filter((s) => pack.items.some((item) => item.id === s.kind)).length;
                return (
                  <TabsTrigger
                    key={pack.id}
                    value={pack.id}
                    className={cn(
                      "min-h-0 flex-none basis-auto overflow-hidden rounded-xl border p-0 text-left whitespace-normal shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-[transform,border-color,box-shadow] duration-150",
                      "data-[state=inactive]:translate-y-0.5 data-[state=inactive]:opacity-75",
                      pack.id === "foil"
                        ? "border-[#e8c36a]/30 bg-[#0c1612] data-[state=active]:border-[#e8c36a] data-[state=active]:bg-[#0c1612] data-[state=active]:shadow-[0_0_0_1px_rgba(232,195,106,0.35),0_12px_28px_rgba(0,0,0,0.35)]"
                        : "border-[#ff8cc8]/30 bg-[#1a1020] data-[state=active]:border-[#ff8cc8] data-[state=active]:bg-[#1a1020] data-[state=active]:shadow-[0_0_0_1px_rgba(255,140,200,0.35),0_12px_28px_rgba(0,0,0,0.35)]",
                    )}
                  >
                    <span
                      className={cn(
                        "block h-1.5 w-full",
                        pack.id === "foil"
                          ? "bg-[linear-gradient(90deg,#9a7030,#f4e2a8,#e8c36a,#9a7030)]"
                          : "bg-[linear-gradient(90deg,#845ef7,#ff8cc8,#3edbf5,#ffd166)]",
                      )}
                    />
                    <span className="flex items-end justify-center gap-1 px-2 pt-2.5">
                      {pack.previews.map((kind) => (
                        <DecorThumb key={kind} kind={kind} className="size-8" />
                      ))}
                    </span>
                    <span className="block px-2.5 pb-2.5 pt-1.5">
                      <span
                        className={cn(
                          "block text-[9px] font-medium tracking-[0.22em] uppercase",
                          pack.id === "foil" ? "text-[#e8c36a]" : "text-[#ff8cc8]",
                        )}
                      >
                        {pack.series}
                      </span>
                      <span className="mt-0.5 block text-sm font-semibold leading-tight text-fg">{pack.name}</span>
                      <span className="mt-0.5 block text-[10px] text-subtle">
                        {pack.items.length} stamps{onCard ? ` · ${onCard} on card` : ""}
                      </span>
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {STAMP_PACKS.map((pack) => (
              <TabsContent key={pack.id} value={pack.id} className="mt-3">
                <div
                  className={cn(
                    "rounded-xl border border-dashed p-2.5",
                    pack.id === "foil" ? "border-[#e8c36a]/30 bg-[#07110e]/70" : "border-[#ff8cc8]/30 bg-[#1a1020]/70",
                  )}
                >
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <p className="text-xs text-muted">{pack.blurb}</p>
                    <p
                      className={cn(
                        "shrink-0 text-[10px] tracking-[0.18em] uppercase",
                        pack.id === "foil" ? "text-[#e8c36a]" : "text-[#ff8cc8]",
                      )}
                    >
                      Open
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 xs:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
                    {pack.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addDecor(item.id)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2 text-[10px] font-medium uppercase tracking-[0.12em] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                          pack.id === "foil"
                            ? "border-[#e8c36a]/25 bg-[#07110e] text-[#e8d7b0]/80 hover:border-[#e8c36a]/70 hover:text-[#f4e2a8]"
                            : "border-[#ff8cc8]/30 bg-[#140c18] text-[#ffd6ea] hover:border-[#3edbf5]/70 hover:text-[#fff6e8]",
                        )}
                      >
                        <DecorThumb kind={item.id} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          {selected ? (
            <div className="mt-3 space-y-2 border-t border-gold/20 pt-3">
              <label className="block">
                <span className="flex items-center justify-between text-xs tracking-[0.18em] text-gold uppercase">
                  Stamp size
                  <span className="font-mono tracking-normal text-fg">{Math.round(selected.scale * 100)}%</span>
                </span>
                <input
                  type="range"
                  min={35}
                  max={240}
                  step={1}
                  value={Math.round(selected.scale * 100)}
                  onChange={(e) => patchSelected({ scale: Number(e.target.value) / 100 })}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-[#e8c36a]"
                />
              </label>
              <label className="block">
                <span className="flex items-center justify-between text-xs tracking-[0.18em] text-gold uppercase">
                  Turn
                  <span className="font-mono tracking-normal text-fg">{Math.round((selected.rot * 180) / Math.PI)}°</span>
                </span>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={Math.round((selected.rot * 180) / Math.PI)}
                  onChange={(e) => patchSelected({ rot: (Number(e.target.value) * Math.PI) / 180 })}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-[#e8c36a]"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => patchSelected({ flip: !selected.flip })}>
                  <FlipHorizontal2 />
                  Flip
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => patchSelected({ rot: 0, scale: 1, flip: false })}>
                  <RotateCcw />
                  Reset
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setStickers((prev) => prev.filter((s) => s.id !== selected.id));
                    setSelectedId(null);
                  }}
                >
                  <Trash2 />
                  Delete
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        <label className="block">
          <span className="text-xs tracking-[0.18em] text-accent uppercase">Name</span>
          <input className={fieldClass} maxLength={28} placeholder="e.g. Knox Ledger" value={draft.name} onChange={set("name")} />
        </label>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <label className="block min-w-0">
            <span className="text-xs tracking-[0.18em] text-gold uppercase">Title</span>
            <input className={fieldClass} maxLength={32} placeholder="Night Broker" value={draft.title} onChange={set("title")} />
          </label>
          <label className="block min-w-0">
            <span className="text-xs tracking-[0.18em] text-gold uppercase">Species</span>
            <input className={fieldClass} maxLength={32} placeholder="Ankylosaurus" value={draft.species} onChange={set("species")} />
          </label>
        </div>
        <div className={cn("grid gap-2 sm:gap-4", template.id === "spotlight" ? "grid-cols-2" : "grid-cols-1")}>
          {template.id === "spotlight" ? (
            <label className="block min-w-0">
              <span className="text-xs tracking-[0.18em] text-accent uppercase">Motto</span>
              <input className={fieldClass} maxLength={42} placeholder="Always takes the night window" value={draft.motto} onChange={set("motto")} />
            </label>
          ) : null}
          <label className="block min-w-0">
            <span className="text-xs tracking-[0.18em] text-accent uppercase">Tag</span>
            <input className={fieldClass} maxLength={18} placeholder="FLOOR CAST" value={draft.tag} onChange={set("tag")} />
          </label>
        </div>
        {template.id === "dossier" ? (
          <div>
            <p className="text-xs tracking-[0.18em] text-gold uppercase">Tells</p>
            <p className="mt-1 text-xs text-muted">Three chips on the dossier. City, night, lucky coin — or your own.</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {TELL_PLACEHOLDERS.map((placeholder, i) => (
                <input
                  key={placeholder}
                  className={fieldClass}
                  maxLength={16}
                  placeholder={placeholder}
                  value={draft.tells[i]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDraft((prev) => {
                      const tells: [string, string, string] = [...prev.tells];
                      tells[i] = value;
                      return { ...prev, tells };
                    });
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}
        <label className="block">
          <span className="text-xs tracking-[0.18em] text-accent uppercase">Bio</span>
          <textarea
            className={`${fieldClass} h-24 resize-y py-2 md:h-28`}
            maxLength={280}
            placeholder="Who they are. What they do in the city. One tell — coffee order, limp, lucky coin."
            value={draft.bio}
            onChange={set("bio")}
          />
        </label>
        <div className="hidden flex-wrap gap-2 md:flex">{actions}</div>
      </div>
    </div>
  );
}

function TemplateThumb({ id }: { id: CardTemplate["id"] }) {
  if (id === "dossier") {
    return (
      <span className="relative block h-14 w-full overflow-hidden bg-[#071611] md:h-[4.75rem]" aria-hidden>
        <span className="absolute inset-[8%] rounded-md border border-[#e8c36a]/80" />
        <span className="absolute bottom-[18%] left-[14%] top-[16%] w-[22%] rounded-sm bg-[#0d241c]" />
        <span className="absolute left-[18%] top-[42%] text-[10px] leading-none text-[#3ecf8e]">+</span>
        <span className="absolute right-[16%] top-[22%] h-2 w-10 rounded-full bg-[#3ecf8e]" />
        <span className="absolute right-[16%] top-[38%] h-2 w-[38%] rounded-sm bg-[#fff8ee]/80" />
        <span className="absolute right-[16%] top-[52%] h-1.5 w-[28%] rounded-sm bg-[#fff8ee]/40" />
        <span className="absolute bottom-[22%] right-[16%] h-1.5 w-[34%] rounded-full bg-[#3ecf8e]/50" />
      </span>
    );
  }
  return (
    <span className="relative block h-14 w-full overflow-hidden bg-[#071611] md:h-[4.75rem]" aria-hidden>
      <span className="absolute inset-[8%] rounded-md border border-[#e8c36a]/80" />
      <span className="absolute left-[18%] top-[14%] h-2 w-8 rounded-full bg-[#3ecf8e]" />
      <span className="absolute left-1/2 top-[42%] size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#3ecf8e]" />
      <span className="absolute left-1/2 top-[42%] h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-[#3ecf8e]" />
      <span className="absolute left-1/2 top-[42%] h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-[#3ecf8e]" />
      <span className="absolute inset-x-[18%] bottom-[18%] h-2 rounded-sm bg-[#fff8ee]/70" />
    </span>
  );
}

function DecorThumb({ kind, className }: { kind: DecorKind; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 96, 96);
    ctx.save();
    ctx.translate(48, 48);
    ctx.scale(0.92, 0.92);
    drawDecorKind(ctx, kind);
    ctx.restore();
  }, [kind]);
  return <canvas ref={ref} className={cn("size-12", className)} aria-hidden />;
}
