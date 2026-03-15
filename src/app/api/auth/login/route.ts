import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/spotify";
import crypto from "crypto";

export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = getAuthUrl(state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
