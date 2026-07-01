"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export type SessionData = {
  authenticated: boolean;
  rootAddress: string | null;
};

export const SESSION_QUERY_KEY = ["session"] as const;

const loggedOutSession: SessionData = {
  authenticated: false,
  rootAddress: null,
};

async function fetchSession(): Promise<SessionData> {
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    if (!res.ok) {
      return { authenticated: false, rootAddress: null };
    }
    const data = (await res.json()) as {
      authenticated?: boolean;
      rootAddress?: string;
    };
    if (data.authenticated && data.rootAddress) {
      return { authenticated: true, rootAddress: data.rootAddress };
    }
    return { authenticated: false, rootAddress: null };
  } catch {
    return { authenticated: false, rootAddress: null };
  }
}

export function useSession() {
  const queryClient = useQueryClient();
  const { data, isPending, refetch } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSession,
    staleTime: 30_000,
  });

  const refresh = useCallback(async () => {
    const result = await refetch();
    return result.data?.authenticated ?? false;
  }, [refetch]);

  const clearSession = useCallback(() => {
    queryClient.setQueryData<SessionData>(SESSION_QUERY_KEY, loggedOutSession);
    queryClient.cancelQueries({ queryKey: ["goclaim-status"] });
    queryClient.removeQueries({ queryKey: ["goclaim-status"] });
  }, [queryClient]);

  return {
    authenticated: data?.authenticated ?? false,
    rootAddress: data?.authenticated ? (data.rootAddress ?? null) : null,
    checked: !isPending,
    refresh,
    clearSession,
  };
}
