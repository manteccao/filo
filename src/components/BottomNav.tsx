"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  {
    href: "/feed",
    label: "Home",
    match: "/feed",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12L11.2 3.05a1.125 1.125 0 011.6 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: "/users",
    label: "Cerca",
    match: "/users",
    icon: (_active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
      </svg>
    ),
  },
  {
    href: "/add",
    label: "",
    match: "/add",
    icon: (_active: boolean) => (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 shadow-[0_0_24px_rgba(13,148,136,0.5)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </span>
    ),
  },
  {
    href: "/requests",
    label: "Richieste",
    match: "/requests",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profilo",
    match: "/profile",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1F2937] bg-[#0a0a0a]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[430px] items-center justify-around px-2">
        {ITEMS.map((item, i) => {
          const isAdd = item.label === "";
          const active = item.match !== null && pathname === item.match;

          return (
            <Link
              key={i}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 transition ${
                isAdd ? "-mt-4" : active ? "text-teal-400" : "text-[#6B7280]"
              }`}
            >
              {item.icon(active)}
              {!isAdd && item.label ? (
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
