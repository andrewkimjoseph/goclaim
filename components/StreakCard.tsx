"use client";

import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";

const MODAL_EXIT_MS = 320;

type StreakModalProps = {
  streak: number;
  open: boolean;
  onClose: () => void;
};

export function StreakModal({ streak, open, onClose }: StreakModalProps) {
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

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-md overflow-hidden overscroll-none ${
        closing ? "animate-modalFadeOut" : "animate-modalFadeIn"
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`w-full max-w-[460px] px-4 pb-4 ${
          closing ? "animate-modalSlideDown" : "animate-modalSlideUp"
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="streak-modal-title"
        aria-modal="true"
      >
        <div className="card w-full">
          <div className="flex items-center gap-4 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/flame.svg"
              alt=""
              width={48}
              height={48}
              className="shrink-0"
              aria-hidden
            />
            <div>
              <h2
                id="streak-modal-title"
                className="font-display font-extrabold text-xl text-foreground"
              >
                {copy.dashboard.streakLabel}
              </h2>
              <p
                className={
                  streak > 0
                    ? "font-display font-extrabold text-3xl text-primary mt-1"
                    : "text-sm text-foreground/60 mt-1"
                }
              >
                {streak > 0
                  ? copy.dashboard.streakDays(streak)
                  : copy.dashboard.streakEmpty}
              </p>
            </div>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed">
            {copy.dashboard.streakDescription}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm mt-6 py-3"
          >
            {copy.dashboard.streakClose}
          </button>
        </div>
      </div>
    </div>
  );
};
