"use client";

import { useEffect, useState } from "react";
import { type Address } from "viem";
import { ConnectAgentButton } from "@/components/ConnectAgentButton";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

type OnboardingModalProps = {
  smartAccountAddress: string;
  rootAddress?: string;
  isCounterfactual?: boolean;
  linkComplete?: boolean;
  onClose: () => void;
  onConnected?: () => void;
};

export function OnboardingModal({
  smartAccountAddress,
  rootAddress,
  isCounterfactual,
  linkComplete,
  onClose,
  onConnected,
}: OnboardingModalProps) {
  const [linked, setLinked] = useState(linkComplete ?? false);

  useEffect(() => {
    if (linkComplete) setLinked(true);
  }, [linkComplete]);

  function handleConnected() {
    setLinked(true);
    onConnected?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 p-4">
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="font-display font-extrabold text-xl mb-4 text-foreground">
          Set up your agent
        </h2>

        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="step-badge-done">1</span>
            <div>
              <p className="font-display font-bold text-foreground">
                Simple smart account created
              </p>
              <p className="text-sm text-foreground/70 mt-1">
                GoClaim created an ERC-4337 agent for you. This is not your root
                wallet — it is the contract that will claim UBI on your behalf.
              </p>
              <p className="text-xs font-display font-semibold text-foreground/60 mt-2">
                Simple smart account
              </p>
              <code className="text-xs break-all block mt-1 bg-foreground/5 p-2 rounded text-foreground">
                {smartAccountAddress}
              </code>
              {isCounterfactual && (
                <p className="text-xs text-foreground/60 mt-2">
                  Not deployed yet — Celoscan may show no contract code until the
                  first claim. That does not mean this is your agent signer EOA.
                </p>
              )}
            </div>
          </li>

          <li className="flex gap-3">
            <span className={linked ? "step-badge-done" : "step-badge-todo"}>
              2
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-foreground">
                Link simple smart account
              </p>
              <p className="text-sm text-foreground/70 mt-1">
                Sign one transaction from your root wallet. GoodDollar Identity
                will call{" "}
                <span className="font-mono font-semibold text-foreground">
                  connectAccount({truncateAddress(smartAccountAddress)})
                </span>{" "}
                — linking this smart account, not your root wallet and not the
                hidden agent signer.
              </p>
              <div className="mt-3">
                <ConnectAgentButton
                  smartAccountAddress={smartAccountAddress as Address}
                  rootAddress={rootAddress as Address | undefined}
                  onConnected={handleConnected}
                  className="btn-primary text-sm w-full"
                  label="Connect simple smart account"
                />
              </div>
            </div>
          </li>

          <li className="flex gap-3">
            <span className={linked ? "step-badge-done" : "step-badge-todo"}>
              3
            </span>
            <div>
              <p className="font-display font-bold text-foreground">
                You&apos;re set
              </p>
              <p className="text-sm text-foreground/70 mt-1">
                {linked
                  ? "Claiming starts tomorrow at 12 PM UTC. G$ will be forwarded to your root wallet automatically."
                  : "Complete step 2 to enable daily claims at 12 PM UTC."}
              </p>
            </div>
          </li>
        </ol>

        <button onClick={onClose} className="btn-primary w-full mt-6">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
