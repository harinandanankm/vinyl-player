"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TokenState {
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

export function useSpotifyToken() {
  const [state, setState] = useState<TokenState>({
    accessToken: null,
    loading: true,
    error: null,
  });

  const expiresAtRef = useRef<number | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchToken = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/refresh");
      if (res.status === 401) {
        setState({ accessToken: null, loading: false, error: "unauthenticated" });
        return null;
      }
      const data = await res.json();
      expiresAtRef.current = data.expires_at;
      setState({ accessToken: data.access_token, loading: false, error: null });

      // Schedule next refresh 60s before expiry
      const msUntilRefresh = data.expires_at - Date.now() - 60_000;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(fetchToken, Math.max(msUntilRefresh, 0));

      return data.access_token as string;
    } catch {
      setState({ accessToken: null, loading: false, error: "fetch_failed" });
      return null;
    }
  }, []);

  useEffect(() => {
    fetchToken();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [fetchToken]);

  return { ...state, refetch: fetchToken };
}
