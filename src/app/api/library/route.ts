import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { refreshAccessToken, isTokenExpired } from "@/lib/spotify";
import { cookies } from "next/headers";
import { SessionData } from "@/types/spotify";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.tokens) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (isTokenExpired(session.tokens)) {
    const newTokens = await refreshAccessToken(session.tokens.refresh_token);
    session.tokens = newTokens;
    await session.save();
  }

  const token = session.tokens.access_token;

  const [playlistsRes, likedRes] = await Promise.all([
    fetch("https://api.spotify.com/v1/me/playlists?limit=20", {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch("https://api.spotify.com/v1/me/tracks?limit=1", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  const [playlistsData, likedData] = await Promise.all([
    playlistsRes.json(),
    likedRes.json(),
  ]);

  return NextResponse.json({
    playlists: playlistsData.items ?? [],
    likedTotal: likedData.total ?? 0,
  });
}
