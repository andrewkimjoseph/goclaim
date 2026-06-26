"use client";

import { useCallback, useEffect, useState } from "react";

type SessionState = {
  authenticated: boolean;
  rootAddress: string | null;
  checked: boolean;
};

export function useSession() {
  const [session, setSession] = useState<SessionState>({
    authenticated: false,
    rootAddress: null,
    checked: false,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as {
          authenticated: boolean;
          rootAddress: string;
        };
        setSession({
          authenticated: data.authenticated,
          rootAddress: data.rootAddress,
          checked: true,
        });
        return true;
      }
    } catch {
      // ignore
    }
    setSession({ authenticated: false, rootAddress: null, checked: true });
    return false;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...session, refresh };
}
