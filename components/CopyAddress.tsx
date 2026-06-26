"use client";

import { useState } from "react";

type CopyAddressProps = {
  address: string;
  label?: string;
  hint?: string;
};

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
      <div className="flex items-center justify-between gap-2">
        <code className="text-sm break-all font-mono">{address}</code>
        <button
          onClick={copy}
          className="shrink-0 text-xs font-display font-semibold text-primary hover:text-primary/80"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {hint && <p className="text-xs text-foreground/60 mt-2">{hint}</p>}
    </div>
  );
}
