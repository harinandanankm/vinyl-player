import { SessionOptions } from "iron-session";
import { SessionData } from "@/types/spotify";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "vinyl_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

// Augment iron-session types
declare module "iron-session" {
  interface IronSessionData extends SessionData {}
}
