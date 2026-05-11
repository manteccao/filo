"use client";

import dynamic from "next/dynamic";

// Lazy-load non-critical client components so their JS is excluded from the
// initial parse. ssr:false is allowed here because this is a Client Component.
const OneSignalInit = dynamic(
  () => import("@/components/OneSignalInit").then((m) => ({ default: m.OneSignalInit })),
  { ssr: false }
);

export function DeferredShell() {
  return <OneSignalInit />;
}
