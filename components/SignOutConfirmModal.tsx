"use client";

import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";

const MODAL_EXIT_MS = 320;

type SignOutConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirming?: boolean;
};

export function SignOutConfirmModal({
  open,
  onClose,
  onConfirm,
  confirming = false,
}: SignOutConfirmModalProps) {
  const [render, setRender] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setRender(true);
      setClosing(false);
      return;
    }

    if (!render) return;

    setClosing(true);
    const timer = window.setTimeout(() => {
      setRender(false);
      setClosing(false);
    }, MODAL_EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [open, render]);

  useEffect(() => {
    if (!render) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [render]);

  if (!render) return null;

  function handleBackdropClick() {
    if (!confirming) onClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-md overflow-hidden overscroll-none ${
        closing ? "animate-modalFadeOut" : "animate-modalFadeIn"
      }`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={`w-full max-w-[460px] px-4 pb-4 ${
          closing ? "animate-modalSlideDown" : "animate-modalSlideUp"
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="sign-out-modal-title"
        aria-modal="true"
      >
        <div className="card w-full">
          <h2
            id="sign-out-modal-title"
            className="font-display font-extrabold text-xl text-foreground"
          >
            {copy.dashboard.signOutConfirmTitle}
          </h2>

          <p className="text-sm text-foreground/80 leading-relaxed mt-3">
            {copy.dashboard.signOutConfirmBody}
          </p>

          <div className="flex flex-col gap-3 mt-6">
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirming}
              className="btn-primary text-sm py-3 disabled:opacity-50"
            >
              {confirming
                ? copy.dashboard.signOutConfirming
                : copy.dashboard.signOutConfirmCta}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={confirming}
              className="btn-secondary text-sm py-3 disabled:opacity-50"
            >
              {copy.dashboard.signOutCancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
