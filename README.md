# 🎵 Vinyl — Spotify Record Player

A beautiful record player web app powered by Spotify. Album art spins on a vinyl record, with a tonearm, EQ bars, and full playback controls.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Spotify Web Playback SDK** — in-browser streaming
- **Spotify Web API** — queue, playback state, controls
- **iron-session** — encrypted server-side session cookies
- **next-pwa** — PWA / installable web app

---

## Setup

### 1. Create a Spotify App

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create App**
3. Set **Redirect URI** to `http://localhost:3000/api/auth/callback`
4. Enable **Web Playback SDK** under APIs used
5. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
SESSION_SECRET=generate_with__openssl_rand_-base64_32
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate a session secret:
```bash
openssl rand -base64 32
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How it Works

```
User clicks "Connect with Spotify"
  → /api/auth/login       — generates CSRF state, redirects to Spotify OAuth
  → Spotify OAuth page    — user approves
  → /api/auth/callback    — exchanges code for tokens, saves to encrypted cookie
  → /player               — server checks session, renders PlayerClient

PlayerClient (client component):
  1. useSpotifyToken      — fetches /api/auth/refresh, auto-refreshes before expiry
  2. useSpotifyPlayer     — loads Web Playback SDK, creates Player, gets device_id
  3. Transfers playback   — PUT /me/player with device_id
  4. RecordPlayer UI      — renders vinyl, tonearm, controls
  5. TrackQueue           — shows upcoming tracks
```

---

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Add all env vars in the Vercel dashboard. Update:
- `SPOTIFY_REDIRECT_URI` → `https://yourdomain.vercel.app/api/auth/callback`
- `NEXT_PUBLIC_APP_URL` → `https://yourdomain.vercel.app`
- Add the new redirect URI in your Spotify app dashboard

### Netlify

```bash
npm run build
```
Deploy the `.next` folder. Set env vars in Netlify dashboard.

### Railway / Render

Point to your repo, set env vars, done. Both support Next.js out of the box.

---

## PWA / Install as App

In production, `next-pwa` auto-generates a service worker. Users can:
- **Chrome/Android**: tap the install banner or "Add to Home Screen"
- **Safari/iOS**: Share → "Add to Home Screen"

Add real 192×192 and 512×512 PNG icons at `public/icons/icon-192.png` and `public/icons/icon-512.png`.

---

## Adding Apple Music (Phase 2)

See `src/lib/spotify.ts` — mirror the same pattern with MusicKit JS:
1. Register at [developer.apple.com](https://developer.apple.com)
2. Generate a MusicKit key
3. Add `<script src="https://js-cdn.music.apple.com/musickit/v3/musickit.js">` in layout
4. Auth with `MusicKit.configure()` + `getInstance().authorize()`

---

## Notes

- **Spotify Premium required** — the Web Playback SDK only works for Premium accounts
- Tokens are stored in an **httpOnly encrypted cookie** — never exposed to JavaScript
- The token auto-refreshes 60 seconds before expiry
- In development, PWA service worker is disabled (set `disable: false` in `next.config.js` to test it)
