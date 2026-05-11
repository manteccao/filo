import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/onesignal";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId, message, url } = await req.json() as {
    targetUserId: string;
    message: string;
    url?: string;
  };
  if (!targetUserId || !message) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }
  if (message.length > 200) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }
  if (url && (url.length > 500 || !/^https?:\/\//.test(url))) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  // Rate limit: max 50 push notifications per user per hour
  const since1h = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("actor_id", user.id)
    .gte("created_at", since1h);
  if ((recentCount ?? 0) >= 50) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  await sendPush(targetUserId, message, url);
  return NextResponse.json({ ok: true });
}
