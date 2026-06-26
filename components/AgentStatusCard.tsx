import { copy } from "@/lib/copy";

type AgentStatusCardProps = {
  status: "active" | "pending" | "linked_other" | "inactive";
};

const STATUS_MAP = {
  active: copy.agentStatus.active,
  pending: copy.agentStatus.pending,
  linked_other: copy.agentStatus.linked_other,
  inactive: copy.agentStatus.inactive,
};

export function AgentStatusCard({ status }: AgentStatusCardProps) {
  const info = STATUS_MAP[status];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-bold text-lg">{copy.agentStatus.cardTitle}</h3>
        <span
          className={
            status === "active"
              ? "status-active"
              : status === "pending"
                ? "status-pending"
                : "status-failed"
          }
        >
          {info.label}
        </span>
      </div>
      <p className="text-sm text-foreground/70">{info.description}</p>
    </div>
  );
}
