"use client";

import { useEffect, useRef, useState } from "react";
import { useSpotifyToken } from "@/hooks/useSpotifyToken";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { RecordPlayer } from "@/components/RecordPlayer";
import { TrackQueue } from "@/components/TrackQueue";
import { SearchBar } from "@/components/SearchBar";
import { LibrarySidebar } from "@/components/LibrarySidebar";
import { usePlayerState } from "@/hooks/usePlayerState";
import styles from "./PlayerClient.module.css";

export function PlayerClient() {
  const { accessToken, loading, error: tokenError } = useSpotifyToken();
  const {
    deviceId,
    playbackState,
    ready,
    error: sdkError,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
  } = useSpotifyPlayer(accessToken);

  const { queue, fetchQueue } = usePlayerState(accessToken);

  // Local progress ticker — interpolates between SDK updates
  const [localProgress, setLocalProgress] = useState(0);
  const tickerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);
  const progressRef = useRef(0);

  useEffect(() => {
    const sdkProgress = playbackState?.position ?? 0;
    const playing = playbackState ? !playbackState.paused : false;
    isPlayingRef.current = playing;
    progressRef.current = sdkProgress;
    setLocalProgress(sdkProgress);

    if (tickerRef.current) clearInterval(tickerRef.current);
    if (playing) {
      tickerRef.current = setInterval(() => {
        progressRef.current += 1000;
        setLocalProgress(progressRef.current);
      }, 1000);
    }
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, [playbackState]);

  // Transfer playback to this device once ready
  const transferred = useRef(false);
  useEffect(() => {
    if (!ready || !deviceId || !accessToken || transferred.current) return;
    transferred.current = true;
    fetch(`https://api.spotify.com/v1/me/player`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ device_ids: [deviceId], play: false }),
    }).catch(console.error);
    fetchQueue();
  }, [ready, deviceId, accessToken, fetchQueue]);

  // Refresh queue on track change
  const prevTrackId = useRef<string | null>(null);
  useEffect(() => {
    const trackId = playbackState?.track_window?.current_track?.id ?? null;
    if (trackId && trackId !== prevTrackId.current) {
      prevTrackId.current = trackId;
      fetchQueue();
    }
  }, [playbackState, fetchQueue]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingVinyl} />
        <p>Loading…</p>
      </div>
    );
  }

  if (tokenError === "unauthenticated") {
    return (
      <div className={styles.error}>
        <p>Session expired.</p>
        <a href="/api/auth/login" className={styles.relogin}>Reconnect Spotify →</a>
      </div>
    );
  }

  const track = playbackState?.track_window?.current_track ?? null;
  const isPlaying = playbackState ? !playbackState.paused : false;
  const progressMs = localProgress;
  const durationMs = playbackState?.duration ?? 0;
  const albumArt = track?.album?.images?.[0]?.url ?? null;

  return (
    <div className={styles.scene}>
      <div className={styles.layout}>
      <div className={styles.main}>
      <SearchBar accessToken={accessToken} deviceId={deviceId} />
      <RecordPlayer
        track={track}
        albumArt={albumArt}
        isPlaying={isPlaying}
        progressMs={progressMs}
        durationMs={durationMs}
        sdkReady={ready}
        sdkError={sdkError}
        onTogglePlay={togglePlay}
        onNext={nextTrack}
        onPrev={prevTrack}
        onSeek={seek}
        onVolumeChange={setVolume}
      />



      </div>
      <LibrarySidebar accessToken={accessToken} deviceId={deviceId} currentContextUri={playbackState?.context?.uri ?? null} />
      </div>
      <div className={styles.brandBadge}>
        <SpotifyIcon />
        Powered by Spotify
      </div>

      <a href="/api/auth/logout" className={styles.logoutBtn}>
        Disconnect
      </a>
    </div>
  );
}

function SpotifyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#1DB954" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}
