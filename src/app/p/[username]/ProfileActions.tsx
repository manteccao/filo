"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { blockUser, reportContent, unblockUser } from "@/app/moderation/actions";
import { ReportDialog } from "@/components/ReportDialog";

export function ProfileActions({
  profileId,
  profileName,
  initialIsBlocked,
}: {
  profileId: string;
  profileName: string;
  initialIsBlocked: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(initialIsBlocked);
  const [blockLoading, setBlockLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  async function handleBlock() {
    setBlockLoading(true);
    setMenuOpen(false);
    if (isBlocked) {
      await unblockUser(profileId);
      setIsBlocked(false);
    } else {
      await blockUser(profileId);
      setIsBlocked(true);
    }
    setBlockLoading(false);
  }

  async function handleReport(reason: string) {
    await reportContent(profileId, "user", reason);
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          disabled={blockLoading}
          className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
          aria-label="Azioni utente"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
          {blockLoading ? "…" : "Altro"}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-10 z-20 min-w-[180px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
              >
                <button
                  type="button"
                  onClick={handleBlock}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="h-4 w-4 shrink-0 text-zinc-400"
                  >
                    {isBlocked ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    )}
                  </svg>
                  {isBlocked
                    ? `Sblocca ${profileName.split(" ")[0]}`
                    : `Blocca ${profileName.split(" ")[0]}`}
                </button>

                <div className="h-px bg-zinc-800" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setReportOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-red-400 hover:bg-zinc-800"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="h-4 w-4 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5"
                    />
                  </svg>
                  Segnala utente
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {isBlocked && (
        <p className="mt-2 text-xs text-zinc-500">
          Hai bloccato questo utente. I suoi contenuti non appariranno nel tuo feed.
        </p>
      )}

      <ReportDialog
        open={reportOpen}
        title="Segnala utente"
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
      />
    </>
  );
}
