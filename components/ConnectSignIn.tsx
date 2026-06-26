"use client";

import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useSiweAuth } from "@/lib/hooks/useSiweAuth";
import { useSession } from "@/lib/hooks/useSession";
import { copy } from "@/lib/copy";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type ConnectSignInProps = {
  onSuccess?: () => void;
  label?: string;
  variant?: "default" | "hero";
};

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectSignIn({
  onSuccess,
  label = copy.auth.connectWallet,
  variant = "default",
}: ConnectSignInProps) {
  const router = useRouter();
  const { signIn, isLoading, error, isConnected, address } = useSiweAuth();
  const { authenticated, rootAddress, checked, refresh } = useSession();
  const { address: walletAddress } = useAccount();

  const walletMatchesSession =
    authenticated &&
    address &&
    rootAddress &&
    address.toLowerCase() === rootAddress.toLowerCase();

  const displayAddress = walletAddress ?? address;

  async function goToDashboard() {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/dashboard");
    }
  }

  const isHero = variant === "hero";
  const primaryBtn = isHero ? "btn-hero-primary" : "btn-primary";
  const secondaryBtn = isHero ? "btn-hero-secondary" : "btn-secondary";
  const ghostBtn = isHero ? "btn-hero-secondary" : "btn-ghost";

  if (!checked) {
    return <LoadingSpinner label={copy.auth.checkingSession} />;
  }

  if (authenticated) {
    return (
      <div className="flex flex-col gap-3 w-full">
        <button onClick={goToDashboard} className={primaryBtn}>
          {copy.auth.goToDashboard}
        </button>
        {isConnected && !walletMatchesSession && address && (
          <p className={`text-xs text-center ${isHero ? "text-red-200" : "text-red-600"}`}>
            {copy.auth.walletMismatch}
          </p>
        )}
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;
            if (!connected) {
              return (
                <button onClick={openConnectModal} className={`${secondaryBtn} text-sm`}>
                  {copy.auth.connectToFinishSetup}
                </button>
              );
            }
            return (
              <button onClick={openAccountModal} className={`${ghostBtn} text-sm`}>
                {account.displayName}
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
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
              className="w-full"
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
                <>
                  {isHero && (
                    <div className="card-paper mb-3">
                      <p className="text-xs font-display font-semibold uppercase tracking-wider text-black/50">
                        {copy.auth.walletCardLabel}
                      </p>
                      <p className="font-display font-bold text-lg mt-1 text-black">
                        {copy.auth.walletCardHint}
                      </p>
                    </div>
                  )}
                  <button onClick={openConnectModal} className={primaryBtn}>
                    {label}
                  </button>
                </>
              ) : chain.unsupported ? (
                <button onClick={openChainModal} className={secondaryBtn}>
                  {copy.auth.wrongNetwork}
                </button>
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  {isHero && (
                    <div className="card-paper">
                      <p className="text-xs font-display font-semibold uppercase tracking-wider text-black/50">
                        {copy.auth.walletCardLabel}
                      </p>
                      <p className="font-display font-bold text-lg mt-1 text-black">
                        {displayAddress
                          ? truncateAddress(displayAddress)
                          : account.displayName}
                      </p>
                    </div>
                  )}
                  {!isHero && (
                    <button onClick={openAccountModal} className="btn-secondary text-sm">
                      {account.displayName}
                    </button>
                  )}
                  <button
                    disabled={isLoading}
                    onClick={async () => {
                      const ok = await signIn();
                      if (ok) {
                        await refresh();
                        if (onSuccess) onSuccess();
                      }
                    }}
                    className={`${primaryBtn} disabled:opacity-50`}
                  >
                    {isLoading ? copy.auth.signingIn : copy.auth.signIn}
                  </button>
                  {isHero && (
                    <button onClick={openAccountModal} className={`${secondaryBtn} text-sm`}>
                      {copy.auth.changeWallet}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
      {error && (
        <p className={`text-sm text-center ${isHero ? "text-red-200" : "text-red-600"}`}>
          {error}
        </p>
      )}
      {isConnected && !error && !isHero && (
        <p className="text-foreground/70 text-sm text-center">
          {copy.auth.signInHint}
        </p>
      )}
      {!isConnected && !error && !isHero && (
        <p className="text-foreground/60 text-xs text-center">
          {copy.auth.sessionHint}
        </p>
      )}
    </div>
  );
}
