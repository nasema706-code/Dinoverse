import { createFileRoute } from "@tanstack/react-router";
import { MemeMaker } from "@/components/meme-maker";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/memes")({
  component: MemesPage,
});

function MemesPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl min-w-0 px-4 py-8 sm:py-12">
        <MemeMaker />
      </main>
    </SiteShell>
  );
}
