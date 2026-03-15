import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/spotify";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";
import { SessionData } from "@/types/spotify";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${appUrl}/?error=access_denied`);
  }

  const storedState = req.cookies.get("spotify_oauth_state")?.value;

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/?error=state_mismatch`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/?error=no_code`);
  }

  try {
    const tokens = await exchangeCode(code);
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    session.tokens = tokens;
    await session.save();

    const response = NextResponse.redirect(`${appUrl}/player`);
    response.cookies.delete("spotify_oauth_state");
    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/?error=token_exchange_failed`);
  }
}
