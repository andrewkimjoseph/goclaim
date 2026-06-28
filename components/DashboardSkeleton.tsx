function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`card animate-pulse ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="h-3 w-24 bg-black/10 rounded-brutal" />
      <div className="h-9 w-40 bg-black/10 rounded-brutal mt-3" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <SkeletonCard />
      <div className="card animate-pulse">
        <div className="h-3 w-28 bg-black/10 rounded-brutal" />
        <div className="h-9 w-32 bg-black/10 rounded-brutal mt-3" />
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t-2 border-black">
          <div>
            <div className="h-3 w-20 bg-black/10 rounded-brutal" />
            <div className="h-9 w-16 bg-black/10 rounded-brutal mt-2" />
          </div>
          <div>
            <div className="h-3 w-20 bg-black/10 rounded-brutal" />
            <div className="h-9 w-16 bg-black/10 rounded-brutal mt-2" />
          </div>
        </div>
      </div>
      <SkeletonCard />
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="card animate-pulse" role="status" aria-label="Loading" aria-hidden>
      <div className="h-4 w-32 bg-black/10 rounded-brutal" />
      <div className="space-y-3 mt-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-full bg-black/10 rounded-brutal" />
        ))}
      </div>
    </div>
  );
}
