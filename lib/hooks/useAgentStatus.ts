"use client";

import { useQuery } from "@tanstack/react-query";
import type { ClaimLog } from "@/components/ClaimHistoryTable";

export type AgentStatus = {
  hasAgent: boolean;
  rootAddress?: string;
  simpleSmartAccountAddress?: string;
  smartAccountAddress?: string;
  isCounterfactual?: boolean;
  isActive?: boolean;
  lastClaimedAt?: string | null;
  linkStatus?: "active" | "pending" | "linked_other";
  linkComplete?: boolean;
  lifetimeClaims?: number;
  lifetimeGdClaimed?: string;
  claimStreak?: number;
  rootGdBalance?: string | null;
  claimLogs?: ClaimLog[];
};

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

async function fetchAgentStatus(
  claimLogsLimit?: number
): Promise<AgentStatus> {
  const params = new URLSearchParams();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz) params.set("timezone", tz);
  if (claimLogsLimit !== undefined) {
    params.set("claimLogsLimit", String(claimLogsLimit));
  }

  const res = await fetch(`/api/agent/status?${params.toString()}`, {
    credentials: "include",
  });

  if (res.status === 401) {
    throw new UnauthorizedError();
  }
  if (!res.ok) {
    throw new Error("Failed to load status");
  }

  return (await res.json()) as AgentStatus;
}

export function useAgentStatus(
  claimLogsLimit?: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["agent-status", claimLogsLimit ?? null],
    queryFn: () => fetchAgentStatus(claimLogsLimit),
    enabled: options?.enabled ?? true,
    retry: (failureCount, error) => {
      if (error instanceof UnauthorizedError) return false;
      return failureCount < 2;
    },
  });
}
