import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { refreshAccessToken, isTokenExpired } from "@/lib/spotify";
import { cookies } from "next/headers";
import { SessionData } from "@/types/spotify";

export async function GET() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.tokens) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Refresh if needed
  if (isTokenExpired(session.tokens)) {
    try {
      const newTokens = await refreshAccessToken(session.tokens.refresh_token);
      session.tokens = newTokens;
      await session.save();
    } catch {
      session.destroy();
      return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    }
  }

  return NextResponse.json({
    access_token: session.tokens.access_token,
    expires_at: session.tokens.expires_at,
  });
}
