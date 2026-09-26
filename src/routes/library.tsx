import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Film, ImageIcon } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import assets from "virtual:dinoverse-assets";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
});

function LibraryPage() {
  const images = assets.filter((file) => file.kind === "image");
  const videos = assets.filter((file) => file.kind === "video");

  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl min-w-0 px-4 py-10 sm:py-14">
        <p className="text-xs font-medium tracking-[0.18em] text-gold uppercase">Library</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">Assets</h1>
        <p className="mt-3 max-w-2xl text-muted">
          One folder for every picture and clip you want on the site. Drop files into{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-fg">public/assets</code>, refresh,
          and they show up here. Use the path under a file anywhere in Dinoverse.
        </p>
        <p className="mt-2 text-sm text-muted">
          Images: jpg, png, webp, gif, svg. Videos: mp4, webm, mov.
        </p>

        {assets.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <ImageIcon className="mx-auto size-8 text-gold" />
            <p className="mt-4 font-display text-xl">The folder is empty</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Add a file such as <span className="text-fg">public/assets/plaza-night.jpg</span>. It
              will be ready at <span className="text-fg">/assets/plaza-night.jpg</span>.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {images.length > 0 ? (
              <section>
                <h2 className="flex items-center gap-2 font-display text-2xl">
                  <ImageIcon className="size-5 text-gold" />
                  Images
                  <span className="text-base text-muted">{images.length}</span>
                </h2>
                <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {images.map((file) => (
                    <li key={file.src}>
                      <AssetCard file={file} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {videos.length > 0 ? (
              <section>
                <h2 className="flex items-center gap-2 font-display text-2xl">
                  <Film className="size-5 text-gold" />
                  Videos
                  <span className="text-base text-muted">{videos.length}</span>
                </h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {videos.map((file) => (
                    <li key={file.src}>
                      <AssetCard file={file} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </main>
    </SiteShell>
  );
}

async function copyPath(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
}

function AssetCard({ file }: { file: (typeof assets)[number] }) {
  const [copied, setCopied] = useState(false);

  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-surface">
      {file.kind === "image" ? (
        <img src={file.src} alt={file.name} className="aspect-[4/3] w-full object-cover" />
      ) : (
        <video src={file.src} controls preload="metadata" className="aspect-video w-full bg-black" />
      )}
      <figcaption className="space-y-2 p-3">
        <p className="truncate text-sm" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded bg-surface-2 px-2 py-1 text-xs text-muted">
            {file.src}
          </code>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            aria-label={`Copy ${file.src}`}
            onClick={() => {
              void copyPath(file.src).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              });
            }}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </figcaption>
    </figure>
  );
}
