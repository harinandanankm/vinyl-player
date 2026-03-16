"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./LibrarySidebar.module.css";

interface Playlist {
  id: string;
  name: string;
  tracks: { total: number };
  images: { url: string }[];
  uri: string;
}

interface Props {
  accessToken: string | null;
  deviceId: string | null;
  currentContextUri: string | null;
}

export function LibrarySidebar({ accessToken, deviceId, currentContextUri }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedTotal, setLikedTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/library")
      .then((r) => r.json())
      .then((data) => {
        setPlaylists(data.playlists ?? []);
        setLikedTotal(data.likedTotal ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const playContext = async (uri: string) => {
    if (!accessToken) return;
    await fetch(
      `https://api.spotify.com/v1/me/player/play${deviceId ? `?device_id=${deviceId}` : ""}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context_uri: uri }),
      }
    ).catch(() => {});
  };

  if (loading) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.label}>Your library</div>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.label}>Your library</div>

      {/* Liked Songs */}
      <VinylItem
        name="Liked songs"
        count={likedTotal}
        uri="spotify:collection:tracks"
        currentContextUri={currentContextUri}
        onPlay={playContext}
        isLiked
      />

      <div className={styles.divider} />
      <div className={styles.label}>Playlists</div>

      {playlists.map((p) => (
        <VinylItem
          key={p.id}
          name={p.name}
          count={p.tracks.total}
          uri={p.uri}
          currentContextUri={currentContextUri}
          onPlay={playContext}
          imageUrl={p.images?.[0]?.url}
        />
      ))}
    </div>
  );
}

function VinylItem({
  name,
  count,
  uri,
  currentContextUri,
  onPlay,
  imageUrl,
  isLiked,
}: {
  name: string;
  count: number;
  uri: string;
  currentContextUri: string | null;
  onPlay: (uri: string) => void;
  imageUrl?: string;
  isLiked?: boolean;
}) {
  const isActive = currentContextUri === uri;

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ""}`}
      onClick={() => onPlay(uri)}
    >
      {/* Sleeve */}
      <div className={styles.sleeve}>
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill sizes="80px" style={{ objectFit: "cover" }} />
        ) : isLiked ? (
          <div className={styles.likedSleeve}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#1DB954" style={{ opacity: 0.6 }}>
              <path d="M12 21.35l-1.45-1.
cat > ~/Downloads/vinyl-player/src/components/LibrarySidebar.tsx << 'ENDOFFILE'
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./LibrarySidebar.module.css";

interface Playlist {
  id: string;
  name: string;
  tracks: { total: number };
  images: { url: string }[];
  uri: string;
}

interface Props {
  accessToken: string | null;
  deviceId: string | null;
  currentContextUri: string | null;
}

export function LibrarySidebar({ accessToken, deviceId, currentContextUri }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedTotal, setLikedTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/library")
      .then((r) => r.json())
      .then((data) => {
        setPlaylists(data.playlists ?? []);
        setLikedTotal(data.likedTotal ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const playContext = async (uri: string) => {
    if (!accessToken) return;
    await fetch(
      `https://api.spotify.com/v1/me/player/play${deviceId ? `?device_id=${deviceId}` : ""}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context_uri: uri }),
      }
    ).catch(() => {});
  };

  if (loading) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.label}>Your library</div>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.label}>Your library</div>

      {/* Liked Songs */}
      <VinylItem
        name="Liked songs"
        count={likedTotal}
        uri="spotify:collection:tracks"
        currentContextUri={currentContextUri}
        onPlay={playContext}
        isLiked
      />

      <div className={styles.divider} />
      <div className={styles.label}>Playlists</div>

      {playlists.map((p) => (
        <VinylItem
          key={p.id}
          name={p.name}
          count={p.tracks.total}
          uri={p.uri}
          currentContextUri={currentContextUri}
          onPlay={playContext}
          imageUrl={p.images?.[0]?.url}
        />
      ))}
    </div>
  );
}

function VinylItem({
  name,
  count,
  uri,
  currentContextUri,
  onPlay,
  imageUrl,
  isLiked,
}: {
  name: string;
  count: number;
  uri: string;
  currentContextUri: string | null;
  onPlay: (uri: string) => void;
  imageUrl?: string;
  isLiked?: boolean;
}) {
  const isActive = currentContextUri === uri;

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ""}`}
      onClick={() => onPlay(uri)}
    >
      {/* Sleeve */}
      <div className={styles.sleeve}>
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill sizes="80px" style={{ objectFit: "cover" }} />
        ) : isLiked ? (
          <div className={styles.likedSleeve}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#1DB954" style={{ opacity: 0.6 }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        ) : (
          <div className={styles.blankSleeve}>
            <span>{name.substring(0, 4).toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Record peeking out */}
      <div className={styles.record}>
        <div className={styles.recordLabel} style={{ background: isLiked ? "#1a3a1a" : "#1a1a1a" }}>
          <div className={styles.recordHole} />
        </div>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.count}>{count} songs</span>
        {isActive && <div className={styles.activeDot} />}
      </div>
    </div>
  );
}
