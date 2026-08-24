import { RexRunner } from "./rex-runner";
import type { RunnerId } from "./run-state";
import type { Loadout } from "./shop";

export function PlayableRunner({
  getX,
  getY,
  getVy,
  running,
  getInvuln,
  loadout,
}: {
  id?: RunnerId;
  getX: () => number;
  getY?: () => number;
  getVy?: () => number;
  running: boolean;
  getInvuln?: () => boolean;
  loadout: Loadout;
}) {
  return (
    <RexRunner
      getX={getX}
      getY={getY}
      getVy={getVy}
      running={running}
      getInvuln={getInvuln}
      loadout={loadout}
    />
  );
}
