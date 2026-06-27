"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useSession } from "@/lib/hooks/useSession";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { copy } from "@/lib/copy";

export function SessionWalletGuard() {
  const router = useRouter();
  const { authenticated, rootAddress, checked, refresh } = useSession();
  const { address, isConnected, isReconnecting, isConnecting } = useAccount();
  const [signingOut, setSigningOut] = useState(false);
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    if (!checked || !authenticated || !rootAddress) return;
    if (isReconnecting || isConnecting) return;
    if (!isConnected || !address) return;
    if (address.toLowerCase() === rootAddress.toLowerCase()) return;

    hasFired.current = true;
    setSigningOut(true);

    (async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // best-effort: still clear client session and redirect
      }
      await refresh();
      router.replace("/");
    })();
  }, [
    checked,
    authenticated,
    rootAddress,
    address,
    isConnected,
    isReconnecting,
    isConnecting,
    refresh,
    router,
  ]);

  if (!signingOut) return null;

  return (
    <div className="app-shell items-center justify-center fixed inset-0 z-50">
      <LoadingSpinner label={copy.auth.walletChangedSigningOut} />
    </div>
  );
}
