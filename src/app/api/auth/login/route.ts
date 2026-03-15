import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/spotify";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("spotify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  return NextResponse.redirect(getAuthUrl(state));
}
