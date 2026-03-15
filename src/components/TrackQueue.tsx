import Image from "next/image";
import { SpotifyTrack } from "@/types/spotify";
import styles from "./TrackQueue.module.css";

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

export function TrackQueue({
  tracks,
  currentTrackId,
}: {
  tracks: SpotifyTrack[];
  currentTrackId: string | null;
}) {
  return (
    <div className={styles.queue}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Up Next</span>
      </div>

      {tracks.map((track, i) => {
        const art = track.album?.images?.[2]?.url ?? track.album?.images?.[0]?.url;
        const isActive = track.id === currentTrackId;
        return (
          <div
            key={`${track.id}-${i}`}
            className={`${styles.item} ${isActive ? styles.active : ""}`}
          >
            <span className={styles.num}>{i + 1}</span>

            <div className={styles.art}>
              {art ? (
                <Image src={art} alt="" fill sizes="32px" style={{ objectFit: "cover" }} />
              ) : null}
            </div>

            <div className={styles.meta}>
              <span className={styles.title}>{track.name}</span>
              <span className={styles.artist}>
                {track.artists.map((a) => a.name).join(", ")}
              </span>
            </div>

            <span className={styles.duration}>{formatTime(track.duration_ms)}</span>
          </div>
        );
      })}
    </div>
  );
}
