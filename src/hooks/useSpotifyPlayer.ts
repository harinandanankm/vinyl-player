"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SpotifyPlayer, SpotifyWebPlaybackState } from "@/types/spotify";

interface PlayerState {
  player: SpotifyPlayer | null;
  deviceId: string | null;
  playbackState: SpotifyWebPlaybackState | null;
  ready: boolean;
  error: string | null;
}

export function useSpotifyPlayer(accessToken: string | null) {
  const [state, setState] = useState<PlayerState>({
    player: null,
    deviceId: null,
    playbackState: null,
    ready: false,
    error: null,
  });

  const tokenRef = useRef(accessToken);
  useEffect(() => { tokenRef.current = accessToken; }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    // Load SDK script
    const existing = document.getElementById("spotify-sdk");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "spotify-sdk";
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Vinyl Player 🎵",
        getOAuthToken: (cb) => {
          if (tokenRef.current) cb(tokenRef.current);
        },
        volume: 0.75,
      });

      // Error handling
      player.addListener("initialization_error", (e) => {
        setState((s) => ({ ...s, error: `Init error: ${(e as {message:string}).message}` }));
      });
      player.addListener("authentication_error", (e) => {
        setState((s) => ({ ...s, error: `Auth error: ${(e as {message:string}).message}` }));
      });
      player.addListener("account_error", (e) => {
        setState((s) => ({ ...s, error: `Account error: ${(e as {message:string}).message}` }));
      });

      // Ready
      player.addListener("ready", (data: unknown) => {
        const { device_id } = data as { device_id: string };
        console.log("Spotify SDK ready, device:", device_id);
        setState((s) => ({ ...s, deviceId: device_id as string, ready: true, player, error: null }));
      });

      player.addListener("not_ready", () => {
        setState((s) => ({ ...s, ready: false }));
      });

      // State changes
      player.addListener("player_state_changed", (pbState: unknown) => {
        setState((s) => ({ ...s, playbackState: pbState as SpotifyWebPlaybackState | null }));
      });

      player.connect();

      setState((s) => ({ ...s, player }));
    };

    // If SDK already loaded
    if (window.Spotify) {
      window.onSpotifyWebPlaybackSDKReady();
    }

    return () => {
      state.player?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const togglePlay = useCallback(async () => {
    await state.player?.togglePlay();
  }, [state.player]);

  const nextTrack = useCallback(async () => {
    await state.player?.nextTrack();
  }, [state.player]);

  const prevTrack = useCallback(async () => {
    await state.player?.previousTrack();
  }, [state.player]);

  const seek = useCallback(async (ms: number) => {
    await state.player?.seek(ms);
  }, [state.player]);

  const setVolume = useCallback(async (vol: number) => {
    await state.player?.setVolume(vol);
  }, [state.player]);

  return { ...state, togglePlay, nextTrack, prevTrack, seek, setVolume };
}
