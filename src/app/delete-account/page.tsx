import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Elimina il tuo account Filo",
  description:
    "Istruzioni per eliminare il tuo account Filo e tutti i dati associati.",
  alternates: { canonical: "https://filo.network/delete-account" },
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-svh bg-background text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Torna a Filo
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/filo-logo-v2.png"
            alt="Filo"
            className="h-8 w-auto object-contain"
          />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-24 pt-10">

        {/* Icon + title */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-8 w-8 text-red-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Elimina il tuo account Filo
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-subdued">
          Se desideri eliminare il tuo account Filo e tutti i dati associati,
          puoi farlo direttamente dall&apos;app:
        </p>

        {/* Steps */}
        <ol className="mt-8 space-y-5">
          {[
            { n: "1", text: "Apri Filo" },
            { n: "2", text: "Vai su Profilo → Impostazioni (icona ingranaggio)" },
            { n: "3", text: "Scorri in fondo e tocca \u2018Elimina account\u2019" },
            { n: "4", text: "Conferma l\u2019eliminazione" },
          ].map((step) => (
            <li key={step.n} className="flex items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {step.n}
              </div>
              <p className="text-sm text-white">{step.text}</p>
            </li>
          ))}
        </ol>

        {/* What gets deleted */}
        <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-sm font-semibold text-red-400">
            Tutti i tuoi dati verranno eliminati permanentemente entro 30
            giorni, inclusi:
          </p>
          <ul className="mt-3 space-y-1.5">
            {[
              "Profilo e foto",
              "Raccomandazioni pubblicate",
              "Commenti e like",
              "Lista di persone seguite",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-subdued">
                <span className="mt-0.5 shrink-0 text-red-500">×</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Email fallback */}
        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-white">
            Non riesci ad accedere all&apos;app?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-subdued">
            Puoi richiedere l&apos;eliminazione inviando un&apos;email a{" "}
            <a
              href="mailto:filo.networks@gmail.com"
              className="text-primary underline underline-offset-2 hover:text-teal-400"
            >
              filo.networks@gmail.com
            </a>{" "}
            dal tuo indirizzo email registrato.
          </p>
        </div>

        {/* Contact */}
        <p className="mt-8 text-center text-sm text-subdued">
          Per qualsiasi domanda scrivi a{" "}
          <a
            href="mailto:filo.networks@gmail.com"
            className="text-primary underline underline-offset-2 hover:text-teal-400"
          >
            filo.networks@gmail.com
          </a>
        </p>
      </main>
    </div>
  );
}
