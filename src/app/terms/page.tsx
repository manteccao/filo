import Link from "next/link";

export const metadata = {
  title: "Termini e Condizioni — Filo",
  description: "Termini e condizioni d'uso di Filo, il social network del passaparola digitale.",
};

const h2 = "mt-10 text-lg font-bold text-white";
const h3 = "mt-6 text-base font-semibold text-white";
const p = "mt-3 text-sm leading-relaxed text-[#9ca3af]";
const li = "mt-1.5 text-sm leading-relaxed text-[#9ca3af]";

export default function TermsPage() {
  return (
    <div className="min-h-svh bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 text-sm text-[#6b7280] transition hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Torna a Filo
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/filo-logo-new.png" alt="Filo" className="h-8 w-auto object-contain" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-24 pt-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Termini e Condizioni di Filo</h1>
        <p className={p}>
          Benvenuto su Filo. Utilizzando la nostra applicazione accetti i presenti Termini e Condizioni.
          Ti invitiamo a leggerli attentamente prima di utilizzare il servizio.
        </p>
        <p className="mt-3 text-xs text-[#6b7280]">Ultima modifica: 23 aprile 2026</p>

        {/* Accettazione */}
        <h2 className={h2}>1. Accettazione dei Termini</h2>
        <p className={p}>
          Accedendo o utilizzando Filo (il "Servizio"), dichiari di aver letto, compreso e accettato
          i presenti Termini e Condizioni e la nostra{" "}
          <Link href="/privacy" className="text-[#0D9488] underline underline-offset-2 hover:text-teal-400">
            Privacy Policy
          </Link>
          . Se non accetti questi termini, non puoi utilizzare il Servizio.
        </p>

        {/* Il Servizio */}
        <h2 className={h2}>2. Descrizione del Servizio</h2>
        <p className={p}>
          Filo è un social network che consente agli utenti di condividere raccomandazioni di professionisti
          di fiducia (dentisti, avvocati, commercialisti, idraulici, ecc.) con la propria rete di contatti.
        </p>
        <p className={p}>
          Il Servizio è fornito da Carlo Mantecchini, con sede in Strada san Martino 18,
          Castiglione Torinese (TO), 10090, Italia. Contatto:{" "}
          <a href="mailto:filo.networks@gmail.com" className="text-[#0D9488] underline underline-offset-2 hover:text-teal-400">
            filo.networks@gmail.com
          </a>
          .
        </p>

        {/* Account */}
        <h2 className={h2}>3. Account e Registrazione</h2>
        <p className={p}>
          Per utilizzare Filo è necessario creare un account tramite autenticazione Google OAuth.
          Sei responsabile della sicurezza del tuo account e di tutte le attività che avvengono
          attraverso di esso.
        </p>
        <ul className="mt-3 space-y-2">
          {[
            "Devi avere almeno 16 anni per utilizzare il Servizio.",
            "Devi fornire informazioni accurate e aggiornate durante la registrazione.",
            "Non puoi cedere o trasferire il tuo account a terzi.",
            "Sei responsabile di mantenere riservate le credenziali di accesso.",
          ].map((item, i) => (
            <li key={i} className={`flex items-start gap-2 ${li}`}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D9488]" />
              {item}
            </li>
          ))}
        </ul>

        {/* Condotta */}
        <h2 className={h2}>4. Condotta degli Utenti</h2>
        <p className={p}>Utilizzando Filo ti impegni a:</p>
        <ul className="mt-3 space-y-2">
          {[
            "Pubblicare solo raccomandazioni veritiere e basate su esperienze personali reali.",
            "Non pubblicare contenuti falsi, fuorvianti, diffamatori o lesivi della reputazione altrui.",
            "Non impersonare altre persone o organizzazioni.",
            "Non utilizzare il Servizio per scopi commerciali non autorizzati o spam.",
            "Non violare i diritti di proprietà intellettuale di terzi.",
            "Non pubblicare contenuti illegali, offensivi, discriminatori o violenti.",
            "Rispettare la privacy degli altri utenti.",
          ].map((item, i) => (
            <li key={i} className={`flex items-start gap-2 ${li}`}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D9488]" />
              {item}
            </li>
          ))}
        </ul>

        {/* Contenuti */}
        <h2 className={h2}>5. Contenuti degli Utenti</h2>
        <p className={p}>
          Sei il solo responsabile dei contenuti che pubblichi su Filo (raccomandazioni, commenti,
          risposte, ecc.). Pubblicando contenuti su Filo concedi a Filo una licenza non esclusiva,
          gratuita e mondiale per utilizzare, visualizzare e distribuire tali contenuti nell'ambito
          del Servizio.
        </p>
        <p className={p}>
          Ci riserviamo il diritto di rimuovere qualsiasi contenuto che violi i presenti Termini
          o che riteniamo inappropriato, senza preavviso.
        </p>

        {/* Proprietà intellettuale */}
        <h2 className={h2}>6. Proprietà Intellettuale</h2>
        <p className={p}>
          Il Servizio Filo, inclusi logo, design, testi e software, è protetto da diritti di
          proprietà intellettuale e appartiene a Carlo Mantecchini. Non puoi copiare, modificare,
          distribuire o creare opere derivate senza autorizzazione scritta.
        </p>

        {/* Limitazione di responsabilità */}
        <h2 className={h2}>7. Limitazione di Responsabilità</h2>
        <p className={p}>
          Filo fornisce una piattaforma per la condivisione di raccomandazioni tra utenti. Non
          verifichiamo l'accuratezza o la qualità delle raccomandazioni pubblicate. Non siamo
          responsabili per:
        </p>
        <ul className="mt-3 space-y-2">
          {[
            "L'accuratezza, completezza o qualità delle raccomandazioni pubblicate dagli utenti.",
            "Eventuali danni derivanti dall'utilizzo delle informazioni presenti su Filo.",
            "Interruzioni temporanee del Servizio per manutenzione o cause tecniche.",
            "Perdita di dati causata da eventi al di fuori del nostro controllo.",
          ].map((item, i) => (
            <li key={i} className={`flex items-start gap-2 ${li}`}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D9488]" />
              {item}
            </li>
          ))}
        </ul>

        {/* Sospensione */}
        <h2 className={h2}>8. Sospensione e Terminazione</h2>
        <p className={p}>
          Ci riserviamo il diritto di sospendere o terminare il tuo account in qualsiasi momento,
          con o senza preavviso, in caso di violazione dei presenti Termini o per qualsiasi altra
          ragione che riteniamo giustificata.
        </p>
        <p className={p}>
          Puoi eliminare il tuo account in qualsiasi momento dalle Impostazioni dell'app. La
          cancellazione dell'account comporta l'eliminazione di tutti i tuoi dati personali e
          contenuti pubblicati, nei limiti previsti dalla legge.
        </p>

        {/* Privacy */}
        <h2 className={h2}>9. Privacy</h2>
        <p className={p}>
          Il trattamento dei tuoi dati personali è disciplinato dalla nostra{" "}
          <Link href="/privacy" className="text-[#0D9488] underline underline-offset-2 hover:text-teal-400">
            Privacy Policy
          </Link>
          , che fa parte integrante dei presenti Termini e Condizioni.
        </p>

        {/* Modifiche */}
        <h2 className={h2}>10. Modifiche ai Termini</h2>
        <p className={p}>
          Ci riserviamo il diritto di modificare i presenti Termini in qualsiasi momento.
          Le modifiche saranno pubblicate su questa pagina con l'indicazione della data di
          ultima modifica. L'uso continuato del Servizio dopo la pubblicazione delle modifiche
          costituisce accettazione dei nuovi Termini.
        </p>

        {/* Legge applicabile */}
        <h2 className={h2}>11. Legge Applicabile e Foro Competente</h2>
        <p className={p}>
          I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia
          derivante dall'utilizzo del Servizio, il foro competente è quello di Torino, Italia,
          salvo diversa disposizione di legge obbligatoria applicabile al consumatore.
        </p>

        {/* Contatti */}
        <div className="mt-12 rounded-2xl border border-[#1a1a1a] bg-[#111111] p-5">
          <p className="text-sm font-semibold text-white">Contattaci</p>
          <p className="mt-2 text-sm font-bold text-white">Filo</p>
          <p className="mt-1 text-sm text-[#9ca3af]">
            Carlo Mantecchini — Strada san Martino, 18. Castiglione torinese. 10090, Torino
          </p>
          <a
            href="mailto:filo.networks@gmail.com"
            className="mt-1 block text-sm text-[#0D9488] underline underline-offset-2 hover:text-teal-400"
          >
            filo.networks@gmail.com
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-[#4b5563]">
          Ultima modifica: 23 aprile 2026
        </p>
      </main>
    </div>
  );
}
