"use client";

import Image from "next/image";
import { SpotifyWebPlaybackTrack } from "@/types/spotify";
import styles from "./RecordPlayer.module.css";
import { EQBars } from "./EQBars";

interface Props {
  track: SpotifyWebPlaybackTrack | null;
  albumArt: string | null;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  sdkReady: boolean;
  sdkError: string | null;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (ms: number) => void;
  onVolumeChange: (vol: number) => void;
}

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RecordPlayer({
  track, albumArt, isPlaying, progressMs, durationMs,
  sdkReady, sdkError, onTogglePlay, onNext, onPrev, onSeek, onVolumeChange,
}: Props) {
  const progress = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    onSeek(Math.floor(pct * durationMs));
  };

  const trackName = track?.name ?? "Nothing Playing";
  const artistName = track?.artists?.map((a) => a.name).join(", ") ?? (sdkReady ? "Play something on Spotify" : "Connecting...");
  const albumName = track?.album?.name ?? "";
  const tonearmRotation = isPlaying ? "0deg" : "-28deg";

  return (
    <div className={styles.turntable}>
      <div className={styles.topShine} aria-hidden="true" />
      <div className={styles.topSection}>
        <div className={styles.platterArea}>
          <div className={styles.platter}>
            <div className={styles.vinyl} style={{ animationPlayState: isPlaying ? "running" : "paused" }}>
              <div className={styles.vinylGrooves} aria-hidden="true" />
              <div className={styles.vinylSheen} aria-hidden="true" />
              <div className={styles.artRing}>
                {albumArt ? (
                  <Image src={albumArt} alt={albumName} fill sizes="120px" className={styles.artImg} priority />
                ) : (
                  <div className={styles.artPlaceholder}>{trackName.substring(0, 4).toUpperCase()}</div>
                )}
              </div>
              <div className={styles.spindle} aria-hidden="true" />
            </div>
          </div>
          <div className={styles.tonearmWrap} aria-hidden="true">
            <div className={styles.tonearmPivot} />
            <svg className={styles.tonearmSvg} style={{ transform: "rotate(" + tonearmRotation + ")" }} viewBox="0 0 120 260" fill="none">
              <line x1="110" y1="20" x2="42" y2="210" stroke="#c8a86b" strokeWidth="4" strokeLinecap="round" />
              <line x1="42" y1="210" x2="28" y2="240" stroke="#a08840" strokeWidth="3" strokeLinecap="round" />
              <circle cx="26" cy="244" r="4" fill="#e0c98a" />
              <circle cx="26" cy="244" r="2" fill="white" />
              <line x1="111" y1="18" x2="43" y2="208" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className={styles.infoPanel}>
          <div className={styles.trackInfo}>
            {sdkError ? <p className={styles.sdkError}>{sdkError}</p> : (
              <>
                <div className={styles.nowPlayingLabel}>
                  <span className={styles.dot + (isPlaying ? " " + styles.dotActive : "")} />
                  Now Playing
                </div>
                <h1 className={styles.trackTitle}>{trackName}</h1>
                <p className={styles.trackArtist}>{artistName}</p>
                {albumName && <p className={styles.trackAlbum}>{albumName}</p>}
              </>
            )}
          </div>
          <div className={styles.infoBottom}>
            <EQBars active={isPlaying} />
            <div className={styles.rpmRow}>
              <span className={styles.rpmLabel}>33 rpm</span>
              <span className={styles.sdkStatus}>{sdkReady ? "SDK Ready" : "Connecting SDK..."}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.controls}>
        <div className={styles.progressWrap}>
          <div className={styles.progressTrack} onClick={handleSeek} role="slider" aria-label="Seek" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} tabIndex={0}>
            <div className={styles.progressFill} style={{ width: Math.min(progress, 100) + "%" }}>
              <div className={styles.progressThumb} />
            </div>
          </div>
          <div className={styles.progressTimes}>
            <span>{formatTime(progressMs)}</span>
            <span>{formatTime(durationMs)}</span>
          </div>
        </div>
        <div className={styles.btnRow}>
          <button className={styles.ctrlBtn} onClick={onPrev} aria-label="Previous">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
          </button>
          <button className={styles.playBtn} onClick={onTogglePlay} disabled={!sdkReady} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            }
          </button>
          <button className={styles.ctrlBtn} onClick={onNext} aria-label="Next">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
          </button>
        </div>
        <div className={styles.volumeRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
          <input type="range" min={0} max={1} step={0.01} defaultValue={0.75} className={styles.volumeSlider} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} aria-label="Volume" />
        </div>
      </div>
    </div>
  );
}
