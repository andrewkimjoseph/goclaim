"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { type Address, zeroAddress } from "viem";
import { identityAbi } from "@/lib/onchain/abis/identity";
import { IDENTITY_CONNECT_TARGET } from "@/lib/onchain/connectAgent";
import {
  browserPublicClient,
  sendTaggedConnectAccount,
} from "@/lib/onchain/browserWallet";
import { friendlyConnectError } from "@/lib/friendlyTxError";
import { copy } from "@/lib/copy";

type ConnectAgentButtonProps = {
  smartAccountAddress: Address;
  rootAddress?: Address;
  onConnected?: () => void;
  className?: string;
  label?: string;
};

export function ConnectAgentButton({
  smartAccountAddress,
  rootAddress,
  onConnected,
  className = "btn-primary",
  label = copy.connect.cta,
}: ConnectAgentButtonProps) {
  const { address, isConnected } = useAccount();

  const { data: connectedTo, refetch: refetchConnected } = useReadContract({
    address: IDENTITY_CONNECT_TARGET,
    abi: identityAbi,
    functionName: "connectedAccounts",
    args: [smartAccountAddress],
  });

  const [localError, setLocalError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const expectedRoot = rootAddress?.toLowerCase();
  const connectedRoot =
    connectedTo && connectedTo !== zeroAddress
      ? (connectedTo as Address).toLowerCase()
      : null;

  const alreadyLinked =
    connectedRoot !== null &&
    (!expectedRoot || connectedRoot === expectedRoot);

  const wrongWallet =
    isConnected &&
    expectedRoot &&
    address &&
    address.toLowerCase() !== expectedRoot;

  async function handleConnect() {
    setLocalError(null);

    if (!isConnected || !address) {
      setLocalError(copy.connect.connectWalletFirst);
      return;
    }

    if (wrongWallet) {
      setLocalError(copy.connect.switchWallet);
      return;
    }

    setIsPending(true);

    try {
      const hash = await sendTaggedConnectAccount({
        account: address,
        smartAccountAddress,
      });

      setIsPending(false);
      setIsConfirming(true);

      await browserPublicClient.waitForTransactionReceipt({ hash });

      try {
        const res = await fetch("/api/agent/connect-log", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txHash: hash }),
        });
        if (!res.ok) {
          console.error("Failed to log connectAccount:", await res.text());
        }
      } catch (err) {
        console.error("Failed to log connectAccount:", err);
      }

      await refetchConnected();
      onConnected?.();
    } catch (err) {
      setLocalError(friendlyConnectError(err as { message?: string }));
    } finally {
      setIsPending(false);
      setIsConfirming(false);
    }
  }

  if (alreadyLinked) {
    return (
      <p className="text-sm text-foreground/70 font-display font-semibold">
        {copy.connect.linked}
      </p>
    );
  }

  const isBusy = isPending || isConfirming;

  return (
    <div className="min-w-0 space-y-2">
      <button
        type="button"
        onClick={handleConnect}
        disabled={isBusy || !!wrongWallet}
        className={`${className} disabled:opacity-50 w-full`}
      >
        {isBusy
          ? isConfirming
            ? copy.connect.confirming
            : copy.connect.confirmInWallet
          : label}
      </button>
      {localError && (
        <p className="text-red-600 text-xs text-left break-words leading-snug">
          {localError}
        </p>
      )}
      {wrongWallet && !localError && (
        <p className="text-red-600 text-xs text-left break-words leading-snug">
          {copy.connect.wrongWallet}
        </p>
      )}
    </div>
  );
}
