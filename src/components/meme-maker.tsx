import { useCallback, useEffect, useRef, useState, type ChangeEvent, type RefObject } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Download, Heart, ImagePlus, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  listMemes,
  MEME_CANVAS,
  MEME_TEMPLATES,
  postMeme,
  toggleMemeLike,
  type MemeCard,
  type MemeView,
} from "@/lib/memes";
import { TOKEN } from "@/lib/token";
import { cn } from "@/lib/utils";

const FONT = '900 {size}px Anton, Impact, "Arial Black", sans-serif';

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.toUpperCase().split(/\s+/).filter(Boolean);
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

function paintCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  fromBottom: boolean,
) {
  if (!text.trim()) return;
  ctx.font = FONT.replace("{size}", String(size));
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.lineWidth = Math.max(2, size / 12);
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#fff";
  const lines = wrapLines(ctx, text, maxWidth);
  const leading = size * 1.1;
  lines.forEach((line, i) => {
    const yy = fromBottom ? y - (lines.length - 1 - i) * leading : y + i * leading;
    ctx.strokeText(line, x, yy);
    ctx.fillText(line, x, yy);
  });
}

async function drawMeme(
  canvas: HTMLCanvasElement,
  imageUrl: string,
  topText: string,
  bottomText: string,
  fontSize: number,
  watermark: boolean,
) {
  const size = MEME_CANVAS;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  try {
    await document.fonts.load(`900 ${Math.round((fontSize / 100) * size)}px Anton`);
  } catch {
    /* Impact / Arial Black still work */
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load that plate."));
    img.src = imageUrl;
  });

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, size, size);
  const scale = Math.max(size / image.width, size / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, (size - dw) / 2, (size - dh) / 2, dw, dh);

  const px = (fontSize / 100) * size;
  paintCaption(ctx, topText, size / 2, px * 1.05, size * 0.92, px, false);
  paintCaption(ctx, bottomText, size / 2, size - px * 0.35, size * 0.92, px, true);

  if (watermark) {
    ctx.font = `600 ${size * 0.026}px Figtree, system-ui, sans-serif`;
    ctx.textAlign = "right";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.strokeText(TOKEN.ticker, size - 18, size - 16);
    ctx.fillText(TOKEN.ticker, size - 18, size - 16);
  }
}

function canvasToJpeg(canvas: HTMLCanvasElement): string {
  let quality = 0.82;
  let data = canvas.toDataURL("image/jpeg", quality);
  while (data.length > 780_000 && quality > 0.45) {
    quality -= 0.08;
    data = canvas.toDataURL("image/jpeg", quality);
  }
  return data;
}

function MemeCanvas({
  canvasRef,
  imageUrl,
  topText,
  bottomText,
  fontSize,
  watermark,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  imageUrl: string;
  topText: string;
  bottomText: string;
  fontSize: number;
  watermark: boolean;
}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;
    let cancelled = false;
    void drawMeme(canvas, imageUrl, topText, bottomText, fontSize, watermark).catch((err) => {
      if (!cancelled) toast(err instanceof Error ? err.message : "Could not paint that plate.");
    });
    return () => {
      cancelled = true;
    };
  }, [canvasRef, imageUrl, topText, bottomText, fontSize, watermark]);

  return (
    <canvas
      ref={canvasRef}
      className="aspect-square w-full rounded-xl border border-border bg-surface-2 shadow-2xl"
    />
  );
}

function TemplatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const extras = uploadUrl ? [...MEME_TEMPLATES, { id: "upload", name: "Your upload", url: uploadUrl }] : MEME_TEMPLATES;

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Drop a picture, not a fossil file.");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const next = typeof reader.result === "string" ? reader.result : "";
      if (uploadUrl?.startsWith("blob:")) URL.revokeObjectURL(uploadUrl);
      setUploadUrl(next);
      onChange(next);
      setUploading(false);
    };
    reader.onerror = () => {
      setUploading(false);
      toast("Could not read that image.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <p className="text-[11px] font-medium tracking-[0.2em] text-muted uppercase">Template</p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {extras.map((plate) => (
          <button
            key={plate.id}
            type="button"
            title={plate.name}
            onClick={() => onChange(plate.url)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg border transition-all",
              value === plate.url
                ? "border-accent ring-2 ring-accent/40"
                : "border-border hover:border-muted",
            )}
          >
            <img src={plate.url} alt={plate.name} className="size-full object-cover" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted hover:border-muted hover:text-fg"
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          <span className="text-[10px] tracking-wide uppercase">Upload</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}

function Generator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { user } = useCurrentUserState();
  const [imageUrl, setImageUrl] = useState(MEME_TEMPLATES[0].url);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(8);
  const [watermark, setWatermark] = useState(true);
  const [posting, setPosting] = useState(false);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "dinoverse-meme.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const post = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPosting(true);
    try {
      await postMeme({
        data: {
          topText,
          bottomText,
          imageData: canvasToJpeg(canvas),
        },
      });
      toast("Posted to the wall.");
      void navigate({ to: "/memes", search: { view: "wall" } });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not post that meme.");
    } finally {
      setPosting(false);
    }
  };

  const field =
    "mt-1.5 h-11 w-full rounded-sm border border-border bg-bg px-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-accent";

  return (
    <div>
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
          Solana · {TOKEN.ticker}
        </p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-5xl">
          Make the meme. The city already clocked in.
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Pick a Dinoverse plate or drop your own image, write the tape, download, and post it to
          the wall.
        </p>
      </div>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.15fr_1fr]">
        <MemeCanvas
          canvasRef={canvasRef}
          imageUrl={imageUrl}
          topText={topText}
          bottomText={bottomText}
          fontSize={fontSize}
          watermark={watermark}
        />

        <div className="space-y-7 rounded-xl border border-border bg-surface p-5 sm:p-6">
          <TemplatePicker value={imageUrl} onChange={setImageUrl} />

          <label className="block text-xs tracking-wide text-muted uppercase">
            Top text
            <input
              className={field}
              value={topText}
              maxLength={140}
              placeholder="Bones are about to list"
              onChange={(event) => setTopText(event.target.value)}
            />
          </label>

          <label className="block text-xs tracking-wide text-muted uppercase">
            Bottom text
            <input
              className={field}
              value={bottomText}
              maxLength={140}
              placeholder="We built the city first"
              onChange={(event) => setBottomText(event.target.value)}
            />
          </label>

          <label className="block text-xs tracking-wide text-muted uppercase">
            Font size · {fontSize}
            <input
              type="range"
              min={4}
              max={14}
              step={1}
              value={fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
              className="mt-3 w-full accent-[var(--color-accent)]"
            />
          </label>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-muted">{TOKEN.ticker} watermark</span>
            <button
              type="button"
              role="switch"
              aria-checked={watermark}
              onClick={() => setWatermark((v) => !v)}
              className={cn(
                "relative h-7 w-12 rounded-full border transition-colors",
                watermark ? "border-accent bg-accent" : "border-border bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-5 rounded-full bg-bg transition-transform",
                  watermark ? "left-6" : "left-0.5",
                )}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button type="button" variant="secondary" className="h-12" onClick={download}>
              <Download />
              Download
            </Button>
            {authEnabled && !user ? (
              <Button asChild className="h-12">
                <Link to="/login" search={{ next: "/memes" }}>
                  <Upload />
                  Sign in to post
                </Link>
              </Button>
            ) : (
              <Button type="button" className="h-12" disabled={posting} onClick={() => void post()}>
                {posting ? <Loader2 className="animate-spin" /> : <Upload />}
                Post to wall
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Wall({ sort, empty }: { sort: "new" | "likes" | "mine"; empty: string }) {
  const { user } = useCurrentUserState();
  const [rows, setRows] = useState<MemeCard[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    void listMemes({ data: { sort } })
      .then(setRows)
      .catch(() => setRows([]));
  }, [sort]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const like = async (id: string) => {
    if (!user) {
      toast("Sign in to like a meme.");
      return;
    }
    setBusyId(id);
    try {
      const next = await toggleMemeLike({ data: { id } });
      setRows((prev) =>
        prev
          ? prev.map((row) => (row.id === id ? { ...row, likes: next.likes, liked: next.liked } : row))
          : prev,
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not like that.");
    } finally {
      setBusyId(null);
    }
  };

  if (!rows) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-24 text-center text-muted">
        {empty}{" "}
        {sort !== "new" ? (
          <Link to="/memes" search={{ view: "generator" }} className="text-accent hover:underline">
            Make one
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((meme) => (
        <li
          key={meme.id}
          className="overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-muted"
        >
          <a href={meme.imageData} target="_blank" rel="noreferrer">
            <img
              src={meme.imageData}
              alt={meme.topText || "Dinoverse meme"}
              className="aspect-square w-full object-cover"
            />
          </a>
          <div className="flex items-center justify-between gap-3 px-3 py-2.5">
            <span className="truncate text-xs text-muted">by {meme.creatorName}</span>
            <button
              type="button"
              disabled={busyId === meme.id}
              onClick={() => void like(meme.id)}
              className={cn(
                "inline-flex items-center gap-1 text-xs transition-colors",
                meme.liked ? "text-accent" : "text-muted hover:text-fg",
              )}
            >
              {busyId === meme.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Heart className={cn("size-3.5", meme.liked && "fill-accent")} />
              )}
              {meme.likes}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MemeMaker({ view }: { view: MemeView }) {
  const { user } = useCurrentUserState();

  if (view === "wall") {
    return (
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">The Meme Wall</h1>
        <p className="mt-3 text-muted">Everything the floor has posted.</p>
        <Wall sort="new" empty="Nothing on the wall yet." />
      </div>
    );
  }

  if (view === "trending") {
    return (
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">Trending memes</h1>
        <p className="mt-3 text-muted">The most-liked plates from the whole Dinoverse floor.</p>
        <Wall sort="likes" empty="No memes yet. Be the first to hit the wall." />
      </div>
    );
  }

  if (view === "mine") {
    return (
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">My creations</h1>
        <p className="mt-3 text-muted">
          Every meme you have saved to the floor
          {user?.displayName ? `, ${user.displayName}` : ""}.
        </p>
        {authEnabled && !user ? (
          <div className="mt-8">
            <Button asChild>
              <Link to="/login" search={{ next: "/memes" }}>
                Sign in to see yours
              </Link>
            </Button>
          </div>
        ) : (
          <Wall sort="mine" empty="Nothing saved yet." />
        )}
      </div>
    );
  }

  return <Generator />;
}
