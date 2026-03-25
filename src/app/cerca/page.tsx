import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CercaClient } from "./CercaClient";

export default async function CercaPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?redirectTo=/cerca");
  return <CercaClient currentUserId={user.id} />;
}
