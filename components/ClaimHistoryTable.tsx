type ClaimLog = {
  id: string;
  status: string;
  txHash: string | null;
  errorMsg: string | null;
  claimedAt: string;
};

type ClaimHistoryTableProps = {
  logs: ClaimLog[];
};

function statusClass(status: string) {
  if (status === "success") return "status-active";
  if (status === "failed") return "status-failed";
  return "status-pending";
}

export function ClaimHistoryTable({ logs }: ClaimHistoryTableProps) {
  if (logs.length === 0) {
    return (
      <div className="card text-center text-foreground/60 text-sm">
        No claims yet. Your first claim runs at 12 PM UTC after linking.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <h3 className="font-display font-bold text-lg mb-3">Claim History</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-foreground/60 border-b border-foreground/20">
            <th className="pb-2 pr-4">Date</th>
            <th className="pb-2 pr-4">Status</th>
            <th className="pb-2">Tx</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-foreground/10 last:border-0">
              <td className="py-2 pr-4 whitespace-nowrap">
                {new Date(log.claimedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="py-2 pr-4">
                <span className={statusClass(log.status)}>{log.status}</span>
              </td>
              <td className="py-2">
                {log.txHash ? (
                  <a
                    href={`https://celoscan.io/tx/${log.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-mono text-xs"
                  >
                    {log.txHash.slice(0, 10)}...
                  </a>
                ) : (
                  <span className="text-foreground/40 text-xs">
                    {log.errorMsg ?? "—"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
