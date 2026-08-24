import { Link } from "@tanstack/react-router";
import { authEnabled, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "./ui/button";

export function AccountChip() {
  const { user, isPending } = useCurrentUserState();
  if (!authEnabled) return null;
  if (isPending) {
    return <span className="hidden text-xs text-subtle sm:inline">…</span>;
  }
  if (!user) {
    return (
      <Button asChild size="sm" variant="secondary">
        <Link to="/login" search={{ next: "/play" }}>
          Sign in
        </Link>
      </Button>
    );
  }
  const label = user.displayName ?? user.primaryEmail ?? "Runner";
  return (
    <div className="flex items-center gap-2">
      <Link
        to="/leaderboard"
        className="flex max-w-[9rem] items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3 pl-1"
        title={label}
      >
        {user.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="size-7 rounded-full object-cover" />
        ) : (
          <span className="grid size-7 place-items-center rounded-full bg-accent/20 text-xs font-medium text-accent">
            {label.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="truncate text-xs font-medium">{label}</span>
      </Link>
      <button
        type="button"
        onClick={() => void signOut("/")}
        className="text-xs text-muted hover:text-fg"
      >
        Sign out
      </button>
    </div>
  );
}
