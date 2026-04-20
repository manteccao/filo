import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Elimina account — Filo",
  description:
    "Istruzioni per eliminare il tuo account Filo e tutti i dati associati.",
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm text-[#6b7280] transition hover:text-white">
            ← Torna a Filo
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/filo-logo-new.png"
            alt="Filo"
            className="h-8 w-auto object-contain"
           
          />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Hero */}
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
          Elimina il tuo account
        </h1>
        <p className="mt-3 text-[#9ca3af]">
          Puoi eliminare il tuo account Filo in qualsiasi momento direttamente
          dall&apos;app. L&apos;eliminazione è permanente e rimuove tutti i
          dati associati al tuo profilo.
        </p>

        {/* Warning box */}
        <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-sm font-semibold text-red-400">
            Cosa viene eliminato definitivamente:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-[#9ca3af]">
            {[
              "Il tuo profilo e tutte le informazioni personali",
              "Tutte le raccomandazioni che hai pubblicato",
              "Commenti, like e contenuti salvati",
              "Le connessioni (seguiti e follower)",
              "Richieste di consiglio e risposte",
              "Notifiche e dati di utilizzo",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-red-500">×</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold">Come eliminare l&apos;account</h2>
          <ol className="mt-4 space-y-4">
            {[
              {
                n: "1",
                title: "Accedi a Filo",
                body: 'Apri l\'app e accedi con il tuo account.',
              },
              {
                n: "2",
                title: "Vai alle Impostazioni",
                body: 'Dal tuo profilo, tocca l\'icona ⚙ in alto a destra per aprire le Impostazioni.',
              },
              {
                n: "3",
                title: 'Tocca "Elimina account"',
                body: 'Scorri fino in fondo alla pagina delle Impostazioni e tocca il bottone rosso "Elimina account".',
              },
              {
                n: "4",
                title: "Conferma l'eliminazione",
                body: 'Leggi il messaggio di avviso e tocca "Elimina tutto" per confermare. L\'operazione è irreversibile.',
              },
            ].map((step) => (
              <li key={step.n} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/15 text-sm font-bold text-[#0D9488]">
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-white">{step.title}</p>
                  <p className="mt-0.5 text-sm text-[#9ca3af]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl border border-[#232340] bg-[#111111] p-6 text-center">
          <p className="text-sm text-[#9ca3af]">
            Hai già un account e vuoi eliminarlo adesso?
          </p>
          <Link
            href="/settings"
            className="mt-4 inline-flex h-12 items-center justify-center rounded-2xl bg-red-600 px-8 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Vai alle Impostazioni → Elimina account
          </Link>
        </div>

        {/* Contact */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#6b7280]">
            Hai bisogno di aiuto?{" "}
            <a
              href="mailto:filo.networks@gmail.com"
              className="text-[#0D9488] transition hover:underline"
            >
              filo.networks@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
