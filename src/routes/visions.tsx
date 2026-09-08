import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { isVisionId, VISION_BY_ID, type VisionId } from "@/lib/visions";

const VisionsTour = lazy(() =>
  import("@/game/visions/VisionsTour").then((m) => ({ default: m.VisionsTour })),
);

type VisionsSearch = { shot?: VisionId };

export const Route = createFileRoute("/visions")({
  validateSearch: (search: Record<string, unknown>): VisionsSearch => ({
    shot: isVisionId(typeof search.shot === "string" ? search.shot : undefined)
      ? (search.shot as VisionId)
      : undefined,
  }),
  component: VisionsPage,
  head: ({ match }) => {
    const shot = VISION_BY_ID[match.search.shot ?? "megacity"];
    return { meta: [{ title: `${shot.title} · The Dinoverse` }] };
  },
});

function VisionsPage() {
  const { shot } = Route.useSearch();
  const id = shot ?? "megacity";
  const still = VISION_BY_ID[id].still;

  return (
    <Suspense
      fallback={
        <main className="relative grid h-dvh place-items-center bg-black text-sm text-white/70">
          <img src={still} alt="" className="absolute inset-0 size-full object-cover opacity-50" />
          <p className="relative">Opening the vision…</p>
        </main>
      }
    >
      <VisionsTour shotId={id} />
    </Suspense>
  );
}
