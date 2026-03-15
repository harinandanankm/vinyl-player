// ─── Spotify API Types ────────────────────────────────────────────────────────

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  uri: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  uri: string;
  is_playable?: boolean;
}

export interface SpotifyPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
  device: {
    id: string;
    name: string;
    volume_percent: number;
  } | null;
  shuffle_state: boolean;
  repeat_state: "off" | "track" | "context";
}

export interface SpotifyQueue {
  currently_playing: SpotifyTrack | null;
  queue: SpotifyTrack[];
}

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix timestamp ms
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface SessionData {
  tokens?: SpotifyTokens;
}

// ─── Web Playback SDK ─────────────────────────────────────────────────────────

export interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: string, cb: (data: unknown) => void): boolean;
  removeListener(event: string, cb?: (data: unknown) => void): boolean;
  getCurrentState(): Promise<SpotifyWebPlaybackState | null>;
  setName(name: string): Promise<void>;
  getVolume(): Promise<number>;
  setVolume(volume: number): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(position_ms: number): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
}

export interface SpotifyWebPlaybackState {
  context: { uri: string; metadata: unknown };
  disallows: Record<string, boolean>;
  paused: boolean;
  position: number;
  duration: number;
  repeat_mode: number;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyWebPlaybackTrack;
    previous_tracks: SpotifyWebPlaybackTrack[];
    next_tracks: SpotifyWebPlaybackTrack[];
  };
}

export interface SpotifyWebPlaybackTrack {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  artists: Array<{ name: string; uri: string }>;
  album: {
    name: string;
    uri: string;
    images: SpotifyImage[];
  };
}

declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}
