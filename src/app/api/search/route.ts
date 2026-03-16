import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { refreshAccessToken, isTokenExpired } from "@/lib/spotify";
import { cookies } from "next/headers";
import { SessionData } from "@/types/spotify";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ tracks: [] });
  }

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

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=6`,
    { headers: { Authorization: `Bearer ${session.tokens.access_token}` } }
  );

  const data = await res.json();
  return NextResponse.json({ tracks: data.tracks?.items ?? [] });
}
