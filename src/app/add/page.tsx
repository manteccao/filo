import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { AddFormClient } from "./AddFormClient";

export default async function AddRecommendationPage() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/login");

  return (
    <div className="min-h-svh bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-40 border-b border-[#111111] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[430px] items-center justify-center px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/filo-logo-v2.png" alt="Filo" className="h-9 w-auto object-contain" />
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-28 pt-4">
        <h1 className="text-xl font-bold tracking-tight">Nuova raccomandazione</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Consiglia un professionista di fiducia con una nota personale.
        </p>

        <AddFormClient userId={userData.user.id} />
      </main>

      <BottomNav />
    </div>
  );
}
