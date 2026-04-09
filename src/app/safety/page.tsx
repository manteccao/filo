import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Standard di Sicurezza per i Minori — Filo",
  description:
    "La politica di Filo sulla protezione dei minori: tolleranza zero, come segnalare contenuti inappropriati e come bloccare utenti.",
};

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-sm text-[#6b7280] transition hover:text-white"
          >
            ← Torna a Filo
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/filo-logo-3d.png"
            alt="Filo"
            className="h-8 w-auto object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Hero */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0D9488]/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-8 w-8 text-[#0D9488]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Standard di Sicurezza per i Minori
        </h1>
        <p className="mt-3 text-[#9ca3af]">
          Filo è una piattaforma dedicata alla condivisione di raccomandazioni
          professionali tra adulti di fiducia. La protezione dei minori è una
          priorità assoluta e non negoziabile.
        </p>

        {/* Zero tolerance */}
        <section className="mt-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15">
              <span className="text-sm font-bold text-red-400">0</span>
            </div>
            <h2 className="text-xl font-bold">Politica di tolleranza zero</h2>
          </div>

          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-sm font-semibold text-red-400">
              È severamente vietato pubblicare, condividere o promuovere:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#9ca3af]">
              {[
                "Qualsiasi contenuto sessuale o esplicito che coinvolga minori (CSAM)",
                "Contenuti che glorificano, normalizzano o promuovono abusi su minori",
                "Immagini, video o descrizioni che ritraggono minori in contesti inappropriati",
                "Messaggi che tentano di adescare, manipolare o sfruttare minori",
                "Qualsiasi forma di grooming o adescamento online di persone minorenni",
                "Contenuti che facilitino l'accesso di adulti malintenzionati a minori",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 font-bold text-red-500">
                    ×
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-sm text-[#9ca3af]">
            Le violazioni di questa politica comportano la{" "}
            <span className="font-semibold text-white">
              rimozione immediata del contenuto e la sospensione permanente
              dell&apos;account
            </span>
            , senza possibilità di appello. Ogni caso viene segnalato alle
            autorità competenti, incluso il Centro Nazionale per i Minori
            Scomparsi e Sfruttati (NCMEC) e la Polizia Postale italiana.
          </p>
        </section>

        {/* Report content */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Come segnalare contenuti inappropriati</h2>
          <p className="mt-2 text-sm text-[#9ca3af]">
            Se noti qualcosa che non va, agisci subito. Ogni segnalazione viene
            presa sul serio e trattata con la massima priorità.
          </p>

          <ol className="mt-5 space-y-4">
            {[
              {
                n: "1",
                title: "Segnala dall'app",
                body: 'Su ogni raccomandazione nel feed trovi il menu "⋯" → "Segnala contenuto". Seleziona il motivo e invia.',
              },
              {
                n: "2",
                title: "Segnala un utente",
                body: 'Sul profilo pubblico di un utente trovi il menu "Altro" → "Segnala utente". Puoi anche bloccarlo immediatamente.',
              },
              {
                n: "3",
                title: "Contatta il team direttamente",
                body: "Per segnalazioni urgenti o che coinvolgono minori, scrivi a filo.networks@gmail.com con oggetto \"SEGNALAZIONE URGENTE\".",
              },
              {
                n: "4",
                title: "Segnala alle autorità",
                body: "Per contenuti illegali che coinvolgono minori, contatta la Polizia Postale (commissariatodips.it) o chiama il 113.",
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
        </section>

        {/* Block users */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Come bloccare un utente</h2>
          <p className="mt-2 text-sm text-[#9ca3af]">
            Il blocco è immediato e impedisce all&apos;utente bloccato di
            interagire con i tuoi contenuti. I suoi post non appariranno più nel
            tuo feed.
          </p>

          <div className="mt-5 rounded-2xl border border-[#232340] bg-[#111111] p-5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/15 text-xs font-bold text-[#0D9488]">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Dal profilo pubblico
                  </p>
                  <p className="mt-0.5 text-xs text-[#9ca3af]">
                    Vai su /p/[username] → tocca il bottone "Altro" → "Blocca
                    [nome]". Il blocco è istantaneo.
                  </p>
                </div>
              </div>
              <div className="h-px bg-[#1a1a1a]" />
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/15 text-xs font-bold text-[#0D9488]">
                  B
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Cosa succede dopo il blocco
                  </p>
                  <p className="mt-0.5 text-xs text-[#9ca3af]">
                    I contenuti dell&apos;utente bloccato scompaiono dal tuo
                    feed. L&apos;utente non riceve notifica del blocco. Puoi
                    sbloccare in qualsiasi momento dallo stesso menu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal compliance */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">
            Conformità alle normative sulla protezione dei minori
          </h2>
          <p className="mt-2 text-sm text-[#9ca3af]">
            Filo opera in conformità con le seguenti normative italiane ed
            europee:
          </p>

          <div className="mt-5 space-y-3">
            {[
              {
                title: "D.Lgs. 196/2003 — Codice Privacy",
                body: "Protezione dei dati personali, con disposizioni specifiche per i dati di minori.",
              },
              {
                title: "Legge 269/1998 e 38/2006",
                body: "Norme contro lo sfruttamento sessuale dei minori e la pedopornografia, anche online.",
              },
              {
                title: "GDPR — Regolamento (UE) 2016/679",
                body: "Il trattamento dei dati di minori (sotto i 16 anni) richiede il consenso dei genitori. Filo è una piattaforma per adulti.",
              },
              {
                title: "Digital Services Act (DSA) — Regolamento (UE) 2022/2065",
                body: "Obbligo di rimozione rapida dei contenuti illegali, incluso il materiale pedopornografico, e cooperazione con le autorità.",
              },
              {
                title: "Direttiva (UE) 2011/93",
                body: "Lotta contro l'abuso e lo sfruttamento sessuale dei minori e la pornografia minorile.",
              },
            ].map((law) => (
              <div
                key={law.title}
                className="rounded-2xl border border-[#232340] bg-[#111111] p-4"
              >
                <p className="text-sm font-semibold text-[#0D9488]">
                  {law.title}
                </p>
                <p className="mt-1 text-sm text-[#9ca3af]">{law.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Age restriction */}
        <section className="mt-10">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-start gap-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-400">
                  Filo è riservato agli utenti di età pari o superiore a 16 anni
                </p>
                <p className="mt-1 text-sm text-[#9ca3af]">
                  In conformità con il GDPR (art. 8) e il Codice Privacy
                  italiano, gli utenti devono avere almeno 16 anni per
                  registrarsi. Gli account di utenti minorenni rilevati vengono
                  eliminati immediatamente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Contatti per la sicurezza</h2>
          <p className="mt-2 text-sm text-[#9ca3af]">
            Per segnalazioni urgenti legate alla sicurezza dei minori, il nostro
            team risponde entro 24 ore.
          </p>

          <div className="mt-4 rounded-2xl border border-[#0D9488]/20 bg-[#0D9488]/5 p-5">
            <div className="flex items-center gap-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-5 w-5 shrink-0 text-[#0D9488]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              <div>
                <p className="text-xs text-[#6b7280]">Email sicurezza</p>
                <a
                  href="mailto:filo.networks@gmail.com"
                  className="text-sm font-semibold text-[#0D9488] transition hover:underline"
                >
                  filo.networks@gmail.com
                </a>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#6b7280]">
              Per segnalazioni urgenti usa come oggetto:{" "}
              <span className="font-mono font-semibold text-white">
                SEGNALAZIONE URGENTE — MINORI
              </span>
            </p>
          </div>

          <p className="mt-4 text-sm text-[#6b7280]">
            Per contenuti illegali che coinvolgono minori, contatta direttamente
            la{" "}
            <a
              href="https://www.commissariatodips.it"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0D9488] transition hover:underline"
            >
              Polizia Postale (commissariatodips.it)
            </a>{" "}
            o chiama il <span className="font-semibold text-white">113</span>.
          </p>
        </section>

        {/* Footer links */}
        <div className="mt-12 flex flex-wrap gap-4 border-t border-white/5 pt-8 text-sm text-[#6b7280]">
          <Link href="/privacy" className="transition hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/delete-account" className="transition hover:text-white">
            Elimina account
          </Link>
          <a
            href="mailto:filo.networks@gmail.com"
            className="transition hover:text-white"
          >
            Contattaci
          </a>
        </div>
      </main>
    </div>
  );
}
