import { SpotifyTokens, SpotifyPlaybackState, SpotifyQueue } from "@/types/spotify";

const SPOTIFY_ACCOUNTS = "https://accounts.spotify.com";
const SPOTIFY_API = "https://api.spotify.com/v1";

const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "playlist-read-private",
  "playlist-read-collaborative",
].join(" ");

// ─── Auth URLs ────────────────────────────────────────────────────────────────

export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope: SCOPES,
    state,
    show_dialog: "false",
  });
  return `${SPOTIFY_ACCOUNTS}/authorize?${params}`;
}

// ─── Token Exchange ───────────────────────────────────────────────────────────

export async function exchangeCode(code: string): Promise<SpotifyTokens> {
  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

// ─── Token Refresh ────────────────────────────────────────────────────────────

export async function refreshAccessToken(
  refresh_token: string
): Promise<SpotifyTokens> {
  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });

  if (!res.ok) throw new Error("Token refresh failed");

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

export function isTokenExpired(tokens: SpotifyTokens): boolean {
  // Refresh 60s before actual expiry
  return Date.now() > tokens.expires_at - 60_000;
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

async function spotifyFetch<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T | null> {
  const res = await fetch(`${SPOTIFY_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 204 || res.status === 202) return null;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify API ${path} failed [${res.status}]: ${err}`);
  }

  return res.json();
}

export async function getPlaybackState(
  token: string
): Promise<SpotifyPlaybackState | null> {
  return spotifyFetch<SpotifyPlaybackState>("/me/player", token);
}

export async function getQueue(token: string): Promise<SpotifyQueue | null> {
  return spotifyFetch<SpotifyQueue>("/me/player/queue", token);
}

export async function play(token: string, deviceId?: string): Promise<void> {
  const path = deviceId
    ? `/me/player/play?device_id=${deviceId}`
    : "/me/player/play";
  await spotifyFetch(path, token, { method: "PUT" });
}

export async function pause(token: string): Promise<void> {
  await spotifyFetch("/me/player/pause", token, { method: "PUT" });
}

export async function skipNext(token: string): Promise<void> {
  await spotifyFetch("/me/player/next", token, { method: "POST" });
}

export async function skipPrevious(token: string): Promise<void> {
  await spotifyFetch("/me/player/previous", token, { method: "POST" });
}

export async function seek(token: string, position_ms: number): Promise<void> {
  await spotifyFetch(
    `/me/player/seek?position_ms=${position_ms}`,
    token,
    { method: "PUT" }
  );
}

export async function setVolume(
  token: string,
  volume_percent: number
): Promise<void> {
  await spotifyFetch(
    `/me/player/volume?volume_percent=${volume_percent}`,
    token,
    { method: "PUT" }
  );
}

export async function setShuffle(
  token: string,
  state: boolean
): Promise<void> {
  await spotifyFetch(`/me/player/shuffle?state=${state}`, token, {
    method: "PUT",
  });
}

export async function setRepeat(
  token: string,
  state: "off" | "track" | "context"
): Promise<void> {
  await spotifyFetch(`/me/player/repeat?state=${state}`, token, {
    method: "PUT",
  });
}
