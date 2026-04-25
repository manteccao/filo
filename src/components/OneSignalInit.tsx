"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function OneSignalInit() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    w.OneSignalDeferred = w.OneSignalDeferred || [];

    // 1. Init + login
    w.OneSignalDeferred.push(async function (OneSignal: any) {
      await OneSignal.init({
        appId: "c710bc4b-ffaf-438a-8422-5ae7fb950e21",
        notifyButton: { enable: false },
        allowLocalhostAsSecureOrigin: true,
      });
      console.log("[OneSignal] initialized");

      // Link to Supabase user
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      console.log("[OneSignal] userId:", user?.id ?? "not authenticated");
      if (user) {
        await OneSignal.login(user.id);
      }
    });

    // 2. Prompt for permission — only if the user hasn't decided yet
    w.OneSignalDeferred.push(async function (OneSignal: any) {
      const permission = await OneSignal.Notifications.permission;
      console.log("[OneSignal] permission:", permission);

      // Use native Notification API to distinguish "default" from "denied"
      const nativePermission = typeof Notification !== "undefined" ? Notification.permission : "default";
      if (nativePermission === "default") {
        // Not yet decided — prompt immediately
        await OneSignal.Slidedown.promptPush();
      }
      // If "granted" or "denied" — do nothing
    });
  }, []);

  return null;
}
