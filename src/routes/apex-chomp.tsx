import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import {
  apexBoard,
  apexBuyPower,
  apexCheckout,
  apexConfirmCheckout,
  apexLogin,
  apexLogout,
  apexRegister,
  apexSync,
  type ApexBoard,
  type ApexBoardRow,
} from "@/lib/apex-chomp";
import { formatPackPrice } from "@/lib/chomp-shop";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apex-chomp")({
  component: ApexChompPage,
  head: () => ({
    meta: [{ title: "Apex Chomp · The Dinoverse" }],
  }),
});

const emptyBoard: ApexBoard = {
  account: null,
  rows: [],
  history: [],
  progress: null,
  shop: { checkoutReady: false, coins: 0, packs: [], powers: [] },
};

function ApexChompPage() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boardRef = useRef<ApexBoard>(emptyBoard);
  const [board, setBoard] = useState<ApexBoard>(emptyBoard);
  boardRef.current = board;
  const [mode, setMode] = useState<"in" | "new">("in");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [kept, setKept] = useState<{ username: string; pin: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [shopError, setShopError] = useState("");
  const [shopBusy, setShopBusy] = useState("");
  const progressTimer = useRef<number | null>(null);

  const refresh = async () => {
    const next = await apexBoard();
    setBoard(next);
    return next;
  };

  const hydrate = (next: ApexBoard) => {
    const frame = frameRef.current?.contentWindow;
    if (!frame || !next.progress) return;
    frame.postMessage({ source: "dinoverse", type: "hydrate", progress: next.progress }, window.location.origin);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (params.get("coins") === "cancel") setNotice("Payment cancelled. No coins were added.");
    const pending =
      params.get("coins") === "success" && sessionId
        ? apexConfirmCheckout({ data: { sessionId } }).then((result) => {
            setNotice(
              result.granted
                ? `${result.coins.toLocaleString("en-GB")} Chomp Coins added.`
                : result.coins
                  ? "That payment was already collected."
                  : "Payment is still processing.",
            );
          })
        : Promise.resolve();
    if (params.has("coins") || params.has("session_id")) {
      window.history.replaceState({}, "", "/apex-chomp");
    }
    void pending.then(() => refresh().then(hydrate)).catch((err: unknown) => {
      setShopError(err instanceof Error ? err.message : "Could not collect those coins.");
    });
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const msg = event.data as {
        source?: string;
        progress?: ApexBoard["progress"];
        run?: { score: number; world: number; outcome: "over" | "won" } | null;
      };
      if (!msg || msg.source !== "apex-chomp" || !msg.progress) return;
      const send = () => {
        void apexSync({ data: { progress: msg.progress!, run: msg.run ?? null } })
          .then(async (saved) => {
            setNotice(
              saved.savedRun
                ? `${saved.username} · ${saved.best.toLocaleString("en-GB")} best · rank ${saved.rank}`
                : "",
            );
            const next = await refresh();
            if (msg.run) hydrate(next);
          })
          .catch(() => {});
      };
      if (msg.run) {
        if (progressTimer.current) window.clearTimeout(progressTimer.current);
        send();
        return;
      }
      if (progressTimer.current) window.clearTimeout(progressTimer.current);
      progressTimer.current = window.setTimeout(send, 1200);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "new") {
        const claimed = await apexRegister({ data: { username, pin } });
        setKept({ username: claimed.username, pin });
        setCopied(false);
      } else {
        await apexLogin({ data: { username, pin } });
        setNotice("Signed in.");
      }
      setPin("");
      const next = await refresh();
      hydrate(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await apexLogout();
    setNotice("");
    setKept(null);
    setBoard(await refresh());
  };

  const copyCode = async () => {
    if (!kept) return;
    await navigator.clipboard.writeText(`${kept.username}  ${kept.pin}`);
    setCopied(true);
  };

  const saveCode = () => {
    if (!kept) return;
    const note = `Apex Chomp\nUsername: ${kept.username}\nCode: ${kept.pin}\nSign in on the Apex Chomp page with this name and code.\n`;
    const file = new Blob([note], { type: "text/plain" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `apex-chomp-${kept.username}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const finishKeeping = () => {
    setKept(null);
    setCopied(false);
    setNotice("Name claimed. Your runs will save here.");
  };

  const buyPack = async (packId: string) => {
    setShopError("");
    setShopBusy(packId);
    try {
      const { url } = await apexCheckout({ data: { packId: packId as "snack" | "feast" | "apex" } });
      window.location.assign(url);
    } catch (err) {
      setShopError(err instanceof Error ? err.message : "Could not start checkout.");
      setShopBusy("");
    }
  };

  const buyPower = async (powerId: string) => {
    setShopError("");
    setShopBusy(powerId);
    try {
      const bought = await apexBuyPower({
        data: {
          powerId: powerId as "bite" | "speed" | "mega" | "magnet" | "shield" | "freeze" | "phase" | "stomp",
        },
      });
      setNotice(`${bought.power} ready. ${bought.charges} held. ${bought.coins.toLocaleString("en-GB")} coins left.`);
      await refresh();
    } catch (err) {
      setShopError(err instanceof Error ? err.message : "Could not buy that power-up.");
    } finally {
      setShopBusy("");
    }
  };

  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl min-w-0 px-4 py-4 sm:py-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-gold uppercase">Arcade</p>
            <h1 className="font-display text-xl font-medium tracking-tight sm:text-3xl">Apex Chomp</h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Eight worlds. One name each. Sign in with a username and a 4-digit code, then every run is
              kept under that name.
            </p>
          </div>
          <a href="/games/apex-chomp/index.html" target="_blank" rel="noopener noreferrer" className="text-sm text-gold hover:underline">
            Open in a new tab
          </a>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <iframe
            ref={frameRef}
            src="/games/apex-chomp/index.html"
            title="Play Apex Chomp"
            className="h-[1050px] w-full rounded-2xl border border-border bg-[#041416] sm:h-[1000px]"
            allow="autoplay; fullscreen"
            allowFullScreen
            onLoad={() => hydrate(boardRef.current)}
          />

          <aside className="space-y-4">
            <section className="rounded-2xl border border-gold/40 bg-surface p-4">
              {kept ? (
                <div>
                  <p className="text-xs tracking-[0.18em] text-gold uppercase">Save your code</p>
                  <p className="mt-1 font-display text-2xl">{kept.username}</p>
                  <p className="mt-3 flex justify-center gap-3 rounded-xl bg-bg/60 py-4 font-display text-4xl tabular-nums">
                    {kept.pin.split("").map((digit, index) => (
                      <span key={index}>{digit}</span>
                    ))}
                  </p>
                  <p className="mt-3 text-sm text-muted">
                    This is the only time this code is shown. Copy it or save a note before you continue. It cannot be looked up later.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={() => void copyCode()}>
                      <Copy className="size-4" />
                      {copied ? "Copied" : "Copy code"}
                    </Button>
                    <Button type="button" variant="outline" onClick={saveCode}>
                      <Download className="size-4" />
                      Save note
                    </Button>
                  </div>
                  <Button type="button" className="mt-2 w-full" onClick={finishKeeping}>
                    I&apos;ve saved it
                  </Button>
                </div>
              ) : board.account ? (
                <div>
                  <p className="text-xs tracking-[0.18em] text-gold uppercase">Signed in</p>
                  <p className="mt-1 font-display text-2xl">{board.account.username}</p>
                  <p className="mt-1 text-sm text-gold">{board.shop.coins.toLocaleString("en-GB")} Chomp Coins</p>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-xl bg-bg/60 px-2 py-2">
                      <dt className="text-[10px] tracking-wide text-muted uppercase">Best</dt>
                      <dd className="font-medium tabular-nums">{board.account.best.toLocaleString("en-GB")}</dd>
                    </div>
                    <div className="rounded-xl bg-bg/60 px-2 py-2">
                      <dt className="text-[10px] tracking-wide text-muted uppercase">Worlds</dt>
                      <dd className="font-medium tabular-nums">{board.account.worldsCleared}/8</dd>
                    </div>
                    <div className="rounded-xl bg-bg/60 px-2 py-2">
                      <dt className="text-[10px] tracking-wide text-muted uppercase">Runs</dt>
                      <dd className="font-medium tabular-nums">{board.account.runs}</dd>
                    </div>
                  </dl>
                  {notice ? <p className="mt-3 text-sm text-accent">{notice}</p> : null}
                  <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => void signOut()}>
                    Sign out
                  </Button>
                </div>
              ) : (
                <form onSubmit={(event) => void submit(event)}>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={cn("rounded-lg border px-3 py-2 text-sm", mode === "in" ? "border-fg bg-bg" : "border-border text-muted")}
                      onClick={() => setMode("in")}
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      className={cn("rounded-lg border px-3 py-2 text-sm", mode === "new" ? "border-fg bg-bg" : "border-border text-muted")}
                      onClick={() => setMode("new")}
                    >
                      Claim a name
                    </button>
                  </div>
                  <label className="mt-3 block text-xs tracking-[0.16em] text-muted uppercase">
                    Username
                    <input
                      className="mt-1 h-11 w-full rounded-md border border-accent/25 bg-bg px-3 text-sm tracking-normal text-fg normal-case outline-none focus:border-accent"
                      autoComplete="username"
                      maxLength={16}
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="RexHunter"
                      required
                    />
                  </label>
                  <label className="mt-3 block text-xs tracking-[0.16em] text-muted uppercase">
                    4-digit code
                    <input
                      className="mt-1 h-11 w-full rounded-md border border-accent/25 bg-bg px-3 text-sm tracking-[0.4em] text-fg outline-none focus:border-accent"
                      inputMode="numeric"
                      autoComplete={mode === "new" ? "new-password" : "current-password"}
                      maxLength={4}
                      pattern="\d{4}"
                      value={pin}
                      onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="••••"
                      required
                    />
                  </label>
                  <p className="mt-2 text-xs text-subtle">
                    Names are unique. Two hunters can never share one. After you claim a name, save the code before you continue. It is shown only once.
                  </p>
                  {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
                  <Button type="submit" className="mt-3 w-full" disabled={busy || pin.length !== 4}>
                    {mode === "new" ? "Claim name" : "Sign in"}
                  </Button>
                </form>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs tracking-[0.18em] text-gold uppercase">Leaderboard</p>
              <p className="mt-1 text-sm text-muted">Best score kept under each hunter.</p>
              {board.rows.length === 0 ? (
                <p className="mt-4 text-sm text-subtle">No scored runs yet. Claim a name and take the first bite.</p>
              ) : (
                <ol className="mt-3 space-y-2">
                  {board.rows.map((row) => (
                    <BoardLine key={row.username} row={row} />
                  ))}
                </ol>
              )}
            </section>

            {board.account ? (
              <section className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-xs tracking-[0.18em] text-gold uppercase">Run history</p>
                {board.history.length === 0 ? (
                  <p className="mt-3 text-sm text-subtle">Finish a maze or a life and it will show up here.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {board.history.map((run) => (
                      <li key={run.id} className="flex items-baseline justify-between gap-3 border-b border-border/70 pb-2 text-sm last:border-0">
                        <span>
                          <span className="font-medium">{run.worldName}</span>
                          <span className="ml-2 text-xs tracking-wide text-muted uppercase">
                            {run.outcome === "won" ? "Cleared" : "Down"}
                          </span>
                        </span>
                        <span className="tabular-nums">{run.score.toLocaleString("en-GB")}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            <section className="rounded-2xl border border-gold/30 bg-surface p-4">
              <p className="text-xs tracking-[0.18em] text-gold uppercase">Chomp Coins</p>
              <p className="mt-1 text-sm text-muted">Buy coins with a test card, then spend them on extra power-ups.</p>
              {board.account ? (
                <>
                  <div className="mt-3 space-y-2">
                    {board.shop.packs.map((pack) => (
                      <button
                        key={pack.id}
                        type="button"
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-left text-sm hover:border-gold/50 disabled:opacity-60"
                        disabled={!board.shop.checkoutReady || shopBusy === pack.id}
                        onClick={() => void buyPack(pack.id)}
                      >
                        <span>
                          <span className="font-medium">{pack.name}</span>
                          <span className="mt-0.5 block text-xs text-muted">{pack.coins.toLocaleString("en-GB")} coins</span>
                        </span>
                        <span className="tabular-nums">{formatPackPrice(pack.amount, pack.currency)}</span>
                      </button>
                    ))}
                  </div>
                  {!board.shop.checkoutReady ? (
                    <p className="mt-3 text-xs text-subtle">
                      Test checkout is waiting for a Stripe restricted key. Card numbers stay on Stripe&apos;s page.
                    </p>
                  ) : null}
                  <div className="mt-4 space-y-2">
                    {board.shop.powers.map((power) => (
                      <div key={power.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <PowerIcon sprite={power.sprite} />
                          <span className="min-w-0">
                            <span className="font-medium">{power.name}</span>
                            <span className="ml-2 text-xs text-muted">{power.charges} held</span>
                          </span>
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={shopBusy === power.id || board.shop.coins < power.cost}
                          onClick={() => void buyPower(power.id)}
                        >
                          {power.cost} coins
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-subtle">Sign in to buy coins and power-ups.</p>
              )}
              {shopError ? <p className="mt-3 text-sm text-danger">{shopError}</p> : null}
            </section>
          </aside>
        </div>
      </main>
    </SiteShell>
  );
}

function PowerIcon({ sprite }: { sprite: number }) {
  const chapter = sprite >= 16;
  const index = chapter ? sprite - 16 : sprite;
  const columns = 4;
  const rows = chapter ? 2 : 4;
  return (
    <span
      aria-hidden
      className="size-9 shrink-0 bg-no-repeat"
      style={{
        backgroundImage: `url('/games/apex-chomp/assets/${chapter ? "chapter2-sprites" : "sprites"}.webp')`,
        backgroundSize: `${columns * 100}% ${rows * 100}%`,
        backgroundPosition: `${(index % columns) * (100 / (columns - 1))}% ${Math.floor(index / columns) * (100 / (rows - 1))}%`,
      }}
    />
  );
}

function BoardLine({ row }: { row: ApexBoardRow }) {
  const medal = row.rank === 1 ? "text-gold" : row.rank === 2 ? "text-fg" : row.rank === 3 ? "text-[#c4845a]" : "text-muted";
  return (
    <li className={cn("flex items-center gap-3 rounded-xl px-2 py-2", row.isYou && "bg-accent/10 ring-1 ring-accent/40")}>
      <span className={cn("w-6 text-center font-display text-sm", medal)}>{row.rank}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{row.username}</span>
        <span className="text-xs text-muted">
          {row.worldsCleared}/8 worlds · {row.runs} {row.runs === 1 ? "run" : "runs"}
        </span>
      </span>
      <span className="font-medium tabular-nums">{row.best.toLocaleString("en-GB")}</span>
    </li>
  );
}
