import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import { SessionData } from "@/types/spotify";
import { PlayerClient } from "@/components/PlayerClient";

export default async function PlayerPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.tokens) {
    redirect("/");
  }
  return <PlayerClient />;
}
