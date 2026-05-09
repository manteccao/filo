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
      try {
        await OneSignal.init({
          appId: "c710bc4b-ffaf-438a-8422-5ae7fb950e21",
          notifyButton: { enable: false },
          allowLocalhostAsSecureOrigin: true,
        });

        // Link to Supabase user
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await OneSignal.login(user.id);
        }
      } catch {
        // OneSignal is non-critical — fail silently
      }
    });

    // 2. Prompt for permission — only if the user hasn't decided yet
    w.OneSignalDeferred.push(async function (OneSignal: any) {
      try {
        // Use native Notification API to distinguish "default" from "denied"
        const nativePermission = typeof Notification !== "undefined" ? Notification.permission : "default";
        if (nativePermission === "default") {
          // Not yet decided — prompt immediately
          await OneSignal.Slidedown.promptPush();
        }
        // If "granted" or "denied" — do nothing
      } catch {
        // Permission prompt is non-critical — fail silently
      }
    });
  }, []);

  return null;
}
