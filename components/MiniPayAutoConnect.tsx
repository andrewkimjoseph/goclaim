"use client";

import { useEffect } from "react";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { isMiniPay } from "@/lib/wagmi";

export function MiniPayAutoConnect() {
  const { connect } = useConnect();

  useEffect(() => {
    if (isMiniPay()) {
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, [connect]);

  return null;
}
