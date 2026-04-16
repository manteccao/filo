"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";

const TABS = ["/feed", "/cerca", "/requests", "/profile"];

function isTab(path: string) {
  return TABS.some((t) => path === t || path.startsWith(t + "/"));
}

/**
 * Keeps tab pages permanently mounted in the DOM and uses CSS display:none
 * to hide inactive tabs instead of unmounting them. This preserves component
 * state and avoids re-fetching data when switching between tabs.
 */
export function TabShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cache = useRef(new Map<string, React.ReactNode>());

  // Update cache synchronously during render so the current route is always fresh
  if (isTab(pathname)) {
    cache.current.set(pathname, children);
  }

  // Non-tab routes (add, settings, p/[username], …) render normally
  if (!isTab(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      {Array.from(cache.current.entries()).map(([route, content]) => (
        <div
          key={route}
          style={pathname === route ? undefined : { display: "none" }}
          aria-hidden={pathname !== route ? true : undefined}
        >
          {content}
        </div>
      ))}
    </>
  );
}
