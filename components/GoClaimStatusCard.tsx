import { copy } from "@/lib/copy";

type GoClaimStatusCardProps = {
  status: "active" | "pending" | "linked_other" | "inactive";
};

const STATUS_MAP = {
  active: copy.goclaimStatus.active,
  pending: copy.goclaimStatus.pending,
  linked_other: copy.goclaimStatus.linked_other,
  inactive: copy.goclaimStatus.inactive,
};

export function GoClaimStatusCard({ status }: GoClaimStatusCardProps) {
  const info = STATUS_MAP[status];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-bold text-lg">{copy.goclaimStatus.cardTitle}</h3>
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
