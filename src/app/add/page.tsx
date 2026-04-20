import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { AddFormClient } from "./AddFormClient";

export default async function AddRecommendationPage() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/login?redirectTo=/add");

  return (
    <div className="min-h-svh bg-[#0d0d17] text-white">
      <header className="sticky top-0 z-40 bg-[#0d0d17]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[430px] items-center justify-center px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/filo-logo-new.png" alt="Filo" className="h-9 w-auto object-contain" />
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-28 pt-4">
        <h1 className="text-xl font-bold tracking-tight">Nuova raccomandazione</h1>
        <p className="mt-1 text-sm text-[#8b8fa8]">
          Consiglia un professionista di fiducia con una nota personale.
        </p>

        <AddFormClient userId={userData.user.id} />
      </main>

      <BottomNav />
    </div>
  );
}
