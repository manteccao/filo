const APP_ID = "c710bc4b-ffaf-438a-8422-5ae7fb950e21";

/**
 * Send a push notification via OneSignal REST API.
 * Fire-and-forget — never throws.
 */
export async function sendPush(
  targetUserId: string,
  message: string,
  url = "https://filo.network/feed",
): Promise<void> {
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!apiKey) return; // silently skip if not configured

  try {
    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: APP_ID,
        include_external_user_ids: [targetUserId],
        headings: { en: "Filo" },
        contents: { en: message },
        url,
      }),
    });
  } catch {
    // Never let push failures break the main flow
  }
}
