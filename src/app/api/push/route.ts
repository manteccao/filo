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

  await sendPush(targetUserId, message, url);
  return NextResponse.json({ ok: true });
}
