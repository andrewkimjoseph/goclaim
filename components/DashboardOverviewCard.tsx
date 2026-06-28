import { copy } from "@/lib/copy";

type DashboardOverviewCardProps = {
  lifetimeClaims: number;
  lifetimeGdClaimed: string;
  rootGdBalance: string | null;
  lastClaimedAt?: string | null;
};

export function DashboardOverviewCard({
  lifetimeClaims,
  lifetimeGdClaimed,
  rootGdBalance,
  lastClaimedAt,
}: DashboardOverviewCardProps) {
  return (
    <div className="card">
      <p className="text-xs font-display font-semibold text-shell">
        {copy.dashboard.rootGdBalance}
      </p>
      <p
        className="font-display font-extrabold text-4xl text-primary mt-2 truncate"
        title={rootGdBalance ?? undefined}
      >
        {rootGdBalance ?? "—"}
      </p>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t-2 border-black">
        <div>
          <p className="text-xs font-display font-semibold text-shell">
            {copy.dashboard.totalGoClaims}
          </p>
          <p className="font-display font-extrabold text-3xl text-primary mt-2">
            {lifetimeClaims}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-display font-semibold text-shell">
            {copy.dashboard.totalGGoClaimed}
          </p>
          <p
            className="font-display font-extrabold text-3xl text-primary mt-2 truncate"
            title={lifetimeGdClaimed}
          >
            {lifetimeGdClaimed}
          </p>
        </div>
      </div>
      {lastClaimedAt && (
        <p className="text-xs text-foreground/60 mt-3 whitespace-nowrap">
          {copy.dashboard.lastGoClaimed}:{" "}
          {new Date(lastClaimedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
