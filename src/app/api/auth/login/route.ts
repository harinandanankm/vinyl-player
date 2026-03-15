import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/spotify";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
  // CSRF state token
  const state = crypto.randomBytes(16).toString("hex");

  // Store state in a short-lived cookie to verify on callback
  cookies().set("spotify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 min
    path: "/",
  });

  return NextResponse.redirect(getAuthUrl(state));
}
