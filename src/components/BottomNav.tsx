"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/feed",
    label: "Home",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="h-[22px] w-[22px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12L11.2 3.05a1.125 1.125 0 011.6 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: "/users",
    label: "Cerca",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} className="h-[22px] w-[22px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  { href: "/add", label: "", icon: null },
  {
    href: "/requests",
    label: "Richieste",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="h-[22px] w-[22px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profilo",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="h-[22px] w-[22px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1a1a1a] bg-[#0d0d0d]">
      <div className="mx-auto flex h-[72px] max-w-[430px] items-center justify-around px-3">
        {NAV.map((item, i) => {
          const isAdd = item.label === "";
          const active = pathname === item.href || (item.href !== "/feed" && pathname.startsWith(item.href));

          if (isAdd) {
            return (
              <Link key={i} href="/add" className="flex items-center justify-center" style={{ marginTop: -8 }}>
                <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#0D9488] shadow-[0_4px_20px_rgba(13,148,136,0.4)] transition-transform active:scale-95">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={i}
              href={item.href}
              className={`flex flex-col items-center gap-[3px] px-2 transition-colors ${
                active ? "text-[#0D9488]" : "text-[#6b7280] hover:text-[#9ca3af]"
              }`}
            >
              {item.icon!(active)}
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  );
}
