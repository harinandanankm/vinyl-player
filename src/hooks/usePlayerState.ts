"use client";

import { useState, useCallback } from "react";
import { SpotifyTrack } from "@/types/spotify";

export function usePlayerState(accessToken: string | null) {
  const [queue, setQueue] = useState<SpotifyTrack[]>([]);

  const fetchQueue = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/queue", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setQueue((data.queue ?? []).slice(0, 10));
    } catch {
      // silently ignore
    }
  }, [accessToken]);

  return { queue, fetchQueue };
}
