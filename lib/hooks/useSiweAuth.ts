"use client";

import { createSiweMessage } from "viem/siwe";
import { useAccount, useSignMessage } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { celo } from "wagmi/chains";
import { friendlySignInError } from "@/lib/friendlyTxError";

export function useSiweAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [address]);

  const signIn = useCallback(async () => {
    if (!address) {
      setError("Connect wallet first");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nonceRes = await fetch(
        `/api/auth/nonce?address=${encodeURIComponent(address)}`,
        { credentials: "include" }
      );
      if (!nonceRes.ok) {
        throw new Error("Failed to fetch nonce");
      }
      const { nonce } = (await nonceRes.json()) as { nonce: string };

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const domain = new URL(appUrl).host;

      const message = createSiweMessage({
        address,
        chainId: celo.id,
        domain,
        nonce,
        uri: appUrl,
        version: "1",
        statement: "Sign in to GoClaim",
      });

      const signature = await signMessageAsync({ message });

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyRes.ok) {
        const body = (await verifyRes.json()) as { error?: string };
        throw new Error(body.error ?? "Sign-in failed");
      }

      return true;
    } catch (err) {
      setError(friendlySignInError(err as { message?: string }));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address, signMessageAsync]);

  return { signIn, isLoading, error, isConnected, address };
}
