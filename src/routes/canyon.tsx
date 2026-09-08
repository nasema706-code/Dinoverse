import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const SkullGateCanyon = lazy(() =>
  import("@/game/canyon/SkullGateCanyon").then((m) => ({ default: m.SkullGateCanyon })),
);

export const Route = createFileRoute("/canyon")({
  component: CanyonPage,
  head: () => ({
    meta: [{ title: "Skull Gate Canyon · The Dinoverse" }],
  }),
});

function CanyonPage() {
  return (
    <Suspense
      fallback={
        <main className="grid h-dvh place-items-center bg-[#e2b86a] text-sm text-[#5a3018]/80">
          Opening Skull Gate Canyon…
        </main>
      }
    >
      <SkullGateCanyon />
    </Suspense>
  );
}
