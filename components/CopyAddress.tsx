"use client";

import { useState } from "react";

type CopyAddressProps = {
  address: string;
  label?: string;
  hint?: string;
};

function truncateAddress(address: string) {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function CopyAddress({ address, label, hint }: CopyAddressProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card">
      {label && (
        <p className="text-xs font-display font-semibold text-foreground/60 mb-1">
          {label}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <code
          className="text-xs font-mono text-foreground/90 truncate min-w-0 flex-1"
          title={address}
        >
          {truncateAddress(address)}
        </code>
        <button
          onClick={copy}
          className="shrink-0 text-xs font-display font-semibold text-primary hover:brightness-110 border-2 border-black px-2 py-1 rounded-brutal shadow-brutal-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {hint && <p className="text-xs text-foreground/60 mt-2">{hint}</p>}
    </div>
  );
}
