"use client";

import { useEffect, useState } from "react";
import { type Address } from "viem";
import { ConnectAgentButton } from "@/components/ConnectAgentButton";
import { copy } from "@/lib/copy";

type OnboardingModalProps = {
  smartAccountAddress: string;
  rootAddress?: string;
  linkComplete?: boolean;
  onClose: () => void;
  onConnected?: () => void;
};

export function OnboardingModal({
  smartAccountAddress,
  rootAddress,
  linkComplete,
  onClose,
  onConnected,
}: OnboardingModalProps) {
  const [connectedLocally, setConnectedLocally] = useState(false);
  const linked = Boolean(linkComplete) || connectedLocally;

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  function handleConnected() {
    setConnectedLocally(true);
    onConnected?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-md overflow-hidden overscroll-none animate-modalFadeIn">
      <div
        className="w-full max-w-[460px] px-4 pb-4 animate-modalSlideUp"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="onboarding-modal-title"
        aria-modal="true"
      >
        <div className="card w-full max-h-[min(90dvh,90vh)] flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <h2
              id="onboarding-modal-title"
              className="font-display font-extrabold text-xl mb-4 text-foreground"
            >
              {copy.onboarding.title}
            </h2>

            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="step-badge-done">1</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground">
                    {copy.onboarding.step1.title}
                  </p>
                  <p className="text-sm text-foreground/70 mt-1">
                    {copy.onboarding.step1.body}
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className={linked ? "step-badge-done" : "step-badge-todo"}>
                  2
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground">
                    {copy.onboarding.step2.title}
                  </p>
                  <p className="text-sm text-foreground/70 mt-1">
                    {copy.onboarding.step2.body}
                  </p>
                  {!linked && (
                    <div className="mt-3">
                      <ConnectAgentButton
                        smartAccountAddress={smartAccountAddress as Address}
                        rootAddress={rootAddress as Address | undefined}
                        onConnected={handleConnected}
                        className="btn-primary text-sm"
                        label={copy.onboarding.step2.cta}
                      />
                    </div>
                  )}
                  {linked && (
                    <p className="text-sm text-foreground/70 font-display font-semibold mt-3">
                      {copy.connect.linked}
                    </p>
                  )}
                </div>
              </li>

              <li className="flex gap-3">
                <span className={linked ? "step-badge-done" : "step-badge-todo"}>
                  3
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground">
                    {copy.onboarding.step3.title}
                  </p>
                  <p className="text-sm text-foreground/70 mt-1">
                    {linked
                      ? copy.onboarding.step3.bodyLinked
                      : copy.onboarding.step3.bodyPending}
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <button onClick={onClose} className="btn-secondary shrink-0 mt-4">
            {copy.onboarding.goToDashboard}
          </button>
        </div>
      </div>
    </div>
  );
}
