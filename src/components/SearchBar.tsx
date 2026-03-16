"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./SearchBar.module.css";

interface Track {
  id: string;
  name: string;
  uri: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
}

interface Props {
  accessToken: string | null;
  deviceId: string | null;
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

export function SearchBar({ accessToken, deviceId }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setIsOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.tracks ?? []);
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  const playTrack = async (track: Track) => {
    if (!accessToken) return;
    setPlayingId(track.id);
    setIsOpen(false);
    setQuery("");
    setResults([]);
    try {
      // Add to queue first, then skip to it
      await fetch(
        `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(track.uri)}${deviceId ? `&device_id=${deviceId}` : ""}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      // Skip to next which will be our queued song
      await fetch(
        "https://api.spotify.com/v1/me/player/next",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch {
      // silently ignore
    } finally {
      setPlayingId(null);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputWrap}>
        <SearchIcon />
        <input
          className={styles.input}
          type="text"
          placeholder="Search songs, artists..."
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {loading && <div className={styles.spinner} />}
        {query && !loading && (
          <button className={styles.clear} onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}>✕</button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map((track) => {
            const art = track.album.images?.[2]?.url ?? track.album.images?.[0]?.url;
            return (
              <div
                key={track.id}
                className={`${styles.result} ${playingId === track.id ? styles.loading : ""}`}
                onClick={() => playTrack(track)}
              >
                <div className={styles.art}>
                  {art && <Image src={art} alt="" fill sizes="40px" style={{ objectFit: "cover" }} />}
                </div>
                <div className={styles.meta}>
                  <span className={styles.name}>{track.name}</span>
                  <span className={styles.artist}>{track.artists.map(a => a.name).join(", ")}</span>
                </div>
                <span className={styles.duration}>{formatTime(track.duration_ms)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  );
}
