"use client";

import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSiweAuth } from "@/lib/hooks/useSiweAuth";
import { useSession } from "@/lib/hooks/useSession";
import { copy } from "@/lib/copy";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type ConnectSignInProps = {
  onSuccess?: () => void;
  label?: string;
};

export function ConnectSignIn({
  onSuccess,
  label = copy.auth.connectWallet,
}: ConnectSignInProps) {
  const router = useRouter();
  const { signIn, isLoading, error, isConnected, address } = useSiweAuth();
  const { authenticated, rootAddress, checked, refresh } = useSession();

  const walletMatchesSession =
    authenticated &&
    address &&
    rootAddress &&
    address.toLowerCase() === rootAddress.toLowerCase();

  async function goToDashboard() {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/dashboard");
    }
  }

  if (!checked) {
    return <LoadingSpinner label={copy.auth.checkingSession} />;
  }

  if (authenticated) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button onClick={goToDashboard} className="btn-primary">
          {copy.auth.goToDashboard}
        </button>
        {isConnected && !walletMatchesSession && address && (
          <p className="text-foreground/60 text-xs text-center max-w-sm">
            {copy.auth.walletMismatch}
          </p>
        )}
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;
            if (!connected) {
              return (
                <button onClick={openConnectModal} className="btn-secondary text-sm">
                  {copy.auth.connectToFinishSetup}
                </button>
              );
            }
            return (
              <button onClick={openAccountModal} className="btn-secondary text-sm">
                {account.displayName}
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {!connected ? (
                <button onClick={openConnectModal} className="btn-primary">
                  {label}
                </button>
              ) : chain.unsupported ? (
                <button onClick={openChainModal} className="btn-secondary">
                  {copy.auth.wrongNetwork}
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <button onClick={openAccountModal} className="btn-secondary text-sm">
                    {account.displayName}
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={async () => {
                      const ok = await signIn();
                      if (ok) {
                        await refresh();
                        if (onSuccess) onSuccess();
                      }
                    }}
                    className="btn-primary disabled:opacity-50"
                  >
                    {isLoading ? copy.auth.signingIn : copy.auth.signIn}
                  </button>
                </div>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
      {error && (
        <p className="text-red-300 text-sm text-center max-w-sm">{error}</p>
      )}
      {isConnected && !error && (
        <p className="text-foreground/70 text-sm text-center max-w-sm">
          {copy.auth.signInHint}
        </p>
      )}
      {!isConnected && !error && (
        <p className="text-foreground/60 text-xs text-center max-w-sm">
          {copy.auth.sessionHint}
        </p>
      )}
    </div>
  );
}
