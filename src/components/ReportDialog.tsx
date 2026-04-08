"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "contenuto_inappropriato", label: "Contenuto inappropriato" },
  { value: "informazioni_false", label: "Informazioni false" },
];

export function ReportDialog({
  open,
  title,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("spam");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    await onSubmit(reason);
    setSubmitting(false);
    setDone(true);
    setTimeout(() => {
      setDone(false);
      onClose();
    }, 1500);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-[71] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[#232340] bg-[#111111] p-6 shadow-2xl"
          >
            {done ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0D9488]/15">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth={2}
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-white">
                  Segnalazione inviata
                </p>
                <p className="text-xs text-[#6b7280]">
                  Grazie, rivedremo il contenuto.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-base font-bold text-white">{title}</h2>
                <p className="mt-1 text-xs text-[#6b7280]">
                  Seleziona il motivo della segnalazione
                </p>

                <div className="mt-4 space-y-2">
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                        reason === r.value
                          ? "border-[#0D9488] bg-[#0D9488]/10"
                          : "border-[#1a1a1a] bg-[#0a0a0a]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="sr-only"
                      />
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          reason === r.value
                            ? "border-[#0D9488] bg-[#0D9488]"
                            : "border-[#3a3a3a]"
                        }`}
                      >
                        {reason === r.value && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm text-white">{r.label}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-11 flex-1 rounded-2xl border border-[#1a1a1a] text-sm text-[#6b7280] transition hover:text-white"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="h-11 flex-1 rounded-2xl bg-red-500 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    {submitting ? "Invio…" : "Segnala"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
