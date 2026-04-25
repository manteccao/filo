"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function OneSignalInit() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).OneSignalDeferred.push(async function (OneSignal: any) {
      await OneSignal.init({
        appId: "c710bc4b-ffaf-438a-8422-5ae7fb950e21",
        notifyButton: { enable: false },
        allowLocalhostAsSecureOrigin: true,
      });

      // Link OneSignal subscription to the Supabase user ID
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await OneSignal.login(user.id);
      }
    });
  }, []);

  return null;
}
