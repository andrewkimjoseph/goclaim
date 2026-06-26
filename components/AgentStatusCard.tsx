type AgentStatusCardProps = {
  status: "active" | "pending" | "linked_other" | "inactive";
};

const STATUS_MAP = {
  active: {
    label: "Active",
    className: "status-active",
    description: "Agent is linked and claiming daily at 12 PM UTC.",
  },
  pending: {
    label: "Pending link",
    className: "status-pending",
    description: "Link your simple smart account on-chain to start claiming.",
  },
  linked_other: {
    label: "Link mismatch",
    className: "status-failed",
    description: "Smart account is linked to a different root wallet.",
  },
  inactive: {
    label: "Inactive",
    className: "status-failed",
    description: "Agent is paused.",
  },
};

export function AgentStatusCard({ status }: AgentStatusCardProps) {
  const info = STATUS_MAP[status];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-bold text-lg">Agent Status</h3>
        <span className={info.className}>{info.label}</span>
      </div>
      <p className="text-sm text-foreground/70">{info.description}</p>
    </div>
  );
}
