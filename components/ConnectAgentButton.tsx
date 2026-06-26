"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { celo } from "wagmi/chains";
import { type Address, zeroAddress } from "viem";
import { identityAbi } from "@/lib/onchain/abis/identity";
import { IDENTITY_CONNECT_TARGET } from "@/lib/onchain/connectAgent";
import { friendlyConnectError } from "@/lib/friendlyTxError";
import { copy } from "@/lib/copy";

type ConnectAgentButtonProps = {
  smartAccountAddress: Address;
  rootAddress?: Address;
  onConnected?: () => void;
  className?: string;
  label?: string;
  showTechnicalDetails?: boolean;
};

export function ConnectAgentButton({
  smartAccountAddress,
  rootAddress,
  onConnected,
  className = "btn-primary",
  label = copy.connect.cta,
  showTechnicalDetails = false,
}: ConnectAgentButtonProps) {
  const { address, chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContract, data: txHash, isPending, error: writeError, reset } =
    useWriteContract();

  const { data: connectedTo, refetch: refetchConnected } = useReadContract({
    address: IDENTITY_CONNECT_TARGET,
    abi: identityAbi,
    functionName: "connectedAccounts",
    args: [smartAccountAddress],
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [localError, setLocalError] = useState<string | null>(null);

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

  useEffect(() => {
    if (isSuccess) {
      refetchConnected();
      onConnected?.();
      reset();
    }
  }, [isSuccess, onConnected, refetchConnected, reset]);

  useEffect(() => {
    if (writeError) {
      setLocalError(friendlyConnectError(writeError));
    }
  }, [writeError]);

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

    try {
      if (chainId !== celo.id) {
        await switchChainAsync({ chainId: celo.id });
      }

      writeContract({
        address: IDENTITY_CONNECT_TARGET,
        abi: identityAbi,
        functionName: "connectAccount",
        args: [smartAccountAddress],
        chainId: celo.id,
      });
    } catch (err) {
      setLocalError(friendlyConnectError(err as { message?: string }));
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
    <div className="space-y-2">
      {showTechnicalDetails && (
        <details className="text-xs text-foreground/60">
          <summary className="cursor-pointer">{copy.connect.technicalDetails}</summary>
          <p className="font-mono break-all mt-1">
            {copy.connect.technicalLinking(smartAccountAddress)}
          </p>
        </details>
      )}
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
        <p className="text-red-400 text-sm text-center">{localError}</p>
      )}
      {wrongWallet && !localError && (
        <p className="text-red-400 text-sm text-center">{copy.connect.wrongWallet}</p>
      )}
    </div>
  );
}
