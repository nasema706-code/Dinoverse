import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { SignedIn } from "@/lib/auth/gates";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listLeaderboard, type BoardPayload } from "@/lib/leaderboard";
import { TOKEN } from "@/lib/token";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  loader: async () => {
    try {
      return await listLeaderboard();
    } catch {
      return { rows: [], you: null } satisfies BoardPayload;
    }
  },
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const initial = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const [board, setBoard] = useState<BoardPayload>(initial);

  useEffect(() => {
    let cancelled = false;
    void listLeaderboard()
      .then((next) => {
        if (cancelled) return;
        setBoard(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl min-w-0 px-4 py-8 sm:py-12">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Floor Board</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-5xl">
          Mushroom Run leaderboard
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Claim a unique runner name and password, run the floor, and your best score is stored on that Floor pass.
          Rank is highest score first. Ties go to whoever posted it first.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/play">Play Mushroom Run</Link>
          </Button>
          {authEnabled && !user ? (
            <Button asChild variant="secondary">
              <Link to="/login" search={{ next: "/leaderboard" }}>
                Claim a name
              </Link>
            </Button>
          ) : null}
        </div>

        {authEnabled && !isPending ? (
          <SignedIn>
            <div className="mt-8 rounded-xl border border-border bg-surface/80 p-4">
              <p className="text-[10px] tracking-[0.18em] text-gold uppercase">Floor pass</p>
              <p className="mt-2 font-display text-xl">{user?.displayName ?? board.you?.displayName}</p>
              <p className="mt-1 text-sm text-muted">
                This name is locked to your password. Nobody else can take it.
              </p>
            </div>
            {board.you ? (
              <p className="mt-3 text-sm text-muted">
                You are rank{" "}
                <span className="font-medium text-accent tabular-nums">{board.you.rank}</span> with{" "}
                <span className="font-medium text-fg tabular-nums">{board.you.score}</span>.
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted">No posted run yet. Finish a run on Play to land on the board.</p>
            )}
          </SignedIn>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-[3rem_1fr_5.5rem_7rem] gap-2 border-b border-border bg-surface-2 px-3 py-2 text-[10px] tracking-wide text-subtle uppercase sm:grid-cols-[4rem_1fr_6rem_8rem] sm:px-4">
            <span>Rank</span>
            <span>Runner</span>
            <span className="text-right">Score</span>
            <span className="text-right">Track</span>
          </div>
          {board.rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">
              The board is empty. Be the first {TOKEN.ticker} runner to post a score.
            </p>
          ) : (
            <ol>
              {board.rows.map((row) => (
                <li
                  key={`${row.rank}-${row.displayName}`}
                  className={cn(
                    "grid grid-cols-[3rem_1fr_5.5rem_7rem] items-center gap-2 border-b border-border/70 px-3 py-3 last:border-b-0 sm:grid-cols-[4rem_1fr_6rem_8rem] sm:px-4",
                    row.isYou ? "bg-accent/10" : "bg-surface/40",
                  )}
                >
                  <span
                    className={cn(
                      "font-display text-lg tabular-nums",
                      row.rank === 1
                        ? "text-accent"
                        : row.rank === 2
                          ? "text-fg"
                          : "text-muted",
                    )}
                  >
                    {row.rank}
                  </span>
                  <span className="min-w-0 truncate font-medium">
                    {row.displayName}
                    {row.isYou ? <span className="ml-2 text-[10px] tracking-wide text-accent uppercase">You</span> : null}
                  </span>
                  <span className="text-right font-display tabular-nums text-accent">{row.score}</span>
                  <span className="truncate text-right text-xs text-subtle">{row.stageName}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
    </SiteShell>
  );
}
