"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AgentStatusCard } from "@/components/AgentStatusCard";
import { ClaimHistoryTable } from "@/components/ClaimHistoryTable";
import { CopyAddress } from "@/components/CopyAddress";
import { OnboardingModal } from "@/components/OnboardingModal";
import { ConnectAgentButton } from "@/components/ConnectAgentButton";
import { type Address } from "viem";

type AgentStatus = {
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
  claimLogs?: Array<{
    id: string;
    status: string;
    txHash: string | null;
    errorMsg: string | null;
    claimedAt: string;
  }>;
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/status", { credentials: "include" });
      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load status");
      }
      const data = (await res.json()) as AgentStatus;
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    const sa = status?.simpleSmartAccountAddress ?? status?.smartAccountAddress;
    if (searchParams.get("onboarding") === "1" && sa) {
      setShowOnboarding(true);
    }
  }, [searchParams, status?.simpleSmartAccountAddress, status?.smartAccountAddress]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/70 font-display">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-300">{error ?? "Something went wrong"}</p>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    );
  }

  if (!status.hasAgent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-foreground/70 text-center">No agent wallet yet.</p>
        <button
          onClick={async () => {
            await fetch("/api/agent/create", {
              method: "POST",
              credentials: "include",
            });
            fetchStatus();
          }}
          className="btn-primary"
        >
          Create Agent
        </button>
      </div>
    );
  }

  const linkStatus = status.linkStatus ?? "pending";
  const simpleSmartAccount =
    status.simpleSmartAccountAddress ?? status.smartAccountAddress;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[460px] mx-auto min-h-screen flex flex-col">
        <header className="px-4 py-4 flex items-center justify-between border-b border-foreground/20">
          <Link
            href="/"
            className="font-display font-extrabold text-xl text-foreground"
          >
            GoClaim
          </Link>
          <button
            onClick={handleLogout}
            className="text-foreground/70 text-sm hover:text-foreground"
          >
            Sign out
          </button>
        </header>

        <main className="flex-1 px-4 py-6 space-y-4">
          <div>
            <p className="text-foreground/70 text-sm">Welcome back</p>
            <h1 className="font-display font-extrabold text-2xl text-foreground tracking-tight">
              Dashboard
            </h1>
          </div>

          <AgentStatusCard
            status={
              linkStatus === "active"
                ? "active"
                : linkStatus === "linked_other"
                  ? "linked_other"
                  : status.isActive
                    ? "pending"
                    : "inactive"
            }
          />

          <div className="card">
            <p className="text-xs text-foreground/60">Lifetime successful claims</p>
            <p className="font-display font-extrabold text-3xl text-primary">
              {status.lifetimeClaims ?? 0}
            </p>
            {status.lastClaimedAt && (
              <p className="text-xs text-foreground/60 mt-1">
                Last claimed:{" "}
                {new Date(status.lastClaimedAt).toLocaleString()}
              </p>
            )}
          </div>

          {simpleSmartAccount && (
            <CopyAddress
              address={simpleSmartAccount}
              label="Simple smart account (connectAccount target)"
              hint={
                status.isCounterfactual
                  ? "This ERC-4337 account is not deployed yet — no contract code on Celoscan until the first claim. That is normal; it is still not the agent signer EOA."
                  : "This is your deployed ERC-4337 agent — not your root wallet or agent signer."
              }
            />
          )}

          {status.rootAddress && (
            <CopyAddress address={status.rootAddress} label="Root wallet" />
          )}

          {!status.linkComplete && simpleSmartAccount && (
            <ConnectAgentButton
              smartAccountAddress={simpleSmartAccount as Address}
              rootAddress={status.rootAddress as Address | undefined}
              onConnected={fetchStatus}
              className="btn-primary block text-center w-full"
              label="Connect simple smart account"
            />
          )}

          <ClaimHistoryTable logs={status.claimLogs ?? []} />
        </main>
      </div>

      {showOnboarding && simpleSmartAccount && (
        <OnboardingModal
          smartAccountAddress={simpleSmartAccount}
          isCounterfactual={status.isCounterfactual}
          rootAddress={status.rootAddress}
          linkComplete={status.linkComplete}
          onConnected={fetchStatus}
          onClose={() => {
            setShowOnboarding(false);
            router.replace("/dashboard");
          }}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-foreground/70 font-display">Loading...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
