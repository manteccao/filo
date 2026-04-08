import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Filo",
  description: "Informativa sulla privacy di Filo, il social network del passaparola digitale.",
};

const h2 = "mt-10 text-lg font-bold text-white";
const h3 = "mt-6 text-base font-semibold text-white";
const p = "mt-3 text-sm leading-relaxed text-[#9ca3af]";
const li = "mt-1.5 text-sm leading-relaxed text-[#9ca3af]";

export default function PrivacyPage() {
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
          <img src="/filo-logo-3d.png" alt="Filo" className="h-8 w-auto object-contain" style={{ mixBlendMode: "screen" }} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-24 pt-10">
        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-white">Privacy Policy di Filo</h1>
        <p className={p}>
          Benvenuto nella privacy policy di Filo. Questa policy ti aiuterà a comprendere quali dati raccogliamo,
          perché li raccogliamo e quali sono i tuoi diritti in merito.
        </p>
        <p className="mt-3 text-xs text-[#6b7280]">Ultima modifica: 8 aprile 2026</p>

        {/* Sommario */}
        <h2 className={h2}>Sommario</h2>
        <ul className="mt-3 list-none space-y-1">
          {[
            "Titolare del Trattamento dei Dati",
            "Tipologie di Dati raccolti",
            "Modalità e luogo del trattamento dei Dati raccolti",
            "Finalità del Trattamento dei Dati raccolti",
            "Cookie Policy",
            "Ulteriori informazioni per gli utenti nell'Unione Europea",
            "Ulteriori informazioni sul trattamento",
            "Definizioni e riferimenti legali",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#9ca3af]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D9488]" />
              {item}
            </li>
          ))}
        </ul>

        {/* Titolare */}
        <h2 className={h2}>Titolare del Trattamento dei Dati</h2>
        <p className={p}>
          Carlo Mantecchini — Strada san Martino, 18. Castiglione torinese. 10090, Torino
        </p>
        <p className={p}>
          Indirizzo email del Titolare:{" "}
          <a href="mailto:filo.networks@gmail.com" className="text-[#0D9488] underline underline-offset-2 hover:text-teal-400">
            filo.networks@gmail.com
          </a>
        </p>

        {/* Tipo di dati */}
        <h2 className={h2}>Tipo di Dati che raccogliamo</h2>
        <p className={p}>Il Titolare non fornisce una lista di tipologie di Dati Personali raccolti.</p>
        <p className={p}>
          Dettagli completi su ciascuna tipologia di Dati Personali raccolti sono forniti nelle sezioni dedicate
          di questa privacy policy o mediante specifici testi informativi visualizzati prima della raccolta dei Dati.
        </p>
        <p className={p}>
          I Dati Personali possono essere liberamente forniti dall'Utente o, nel caso di Dati di Utilizzo, raccolti
          automaticamente durante l'uso di questa Applicazione.
        </p>
        <p className={p}>
          Se non diversamente specificato, tutti i Dati richiesti da questa Applicazione sono obbligatori. Se l'Utente
          rifiuta di comunicarli, potrebbe essere impossibile per questa Applicazione fornire il Servizio. Nei casi in
          cui questa Applicazione indichi alcuni Dati come facoltativi, gli Utenti sono liberi di astenersi dal
          comunicare tali Dati, senza che ciò abbia alcuna conseguenza sulla disponibilità del Servizio o sulla sua
          operatività.
        </p>
        <p className={p}>
          Gli Utenti che dovessero avere dubbi su quali Dati siano obbligatori sono incoraggiati a contattare il
          Titolare.
        </p>
        <p className={p}>
          L'eventuale utilizzo di Cookie — o di altri strumenti di tracciamento — da parte di questa Applicazione o
          dei titolari dei servizi terzi utilizzati da questa Applicazione ha la finalità di fornire il Servizio
          richiesto dall'Utente, oltre alle ulteriori finalità descritte nel presente documento e nella Cookie Policy.
        </p>
        <p className={p}>
          L'Utente si assume la responsabilità dei Dati Personali di terzi ottenuti, pubblicati o condivisi mediante
          questa Applicazione.
        </p>

        {/* Modalità e luogo */}
        <h2 className={h2}>Modalità e luogo del trattamento dei Dati raccolti</h2>

        <h3 className={h3}>Modalità di trattamento</h3>
        <p className={p}>
          Il Titolare adotta le opportune misure di sicurezza volte ad impedire l'accesso, la divulgazione, la
          modifica o la distruzione non autorizzate dei Dati Personali.
        </p>
        <p className={p}>
          Il trattamento viene effettuato mediante strumenti informatici e/o telematici, con modalità organizzative
          e con logiche strettamente correlate alle finalità indicate. Oltre al Titolare, in alcuni casi, potrebbero
          avere accesso ai Dati altri soggetti coinvolti nell'organizzazione di questa Applicazione (personale
          amministrativo, commerciale, marketing, legali, amministratori di sistema) ovvero soggetti esterni (come
          fornitori di servizi tecnici terzi, corrieri postali, hosting provider, società informatiche, agenzie di
          comunicazione) nominati anche, se necessario, Responsabili del Trattamento da parte del Titolare.
          L'elenco dei Responsabili potrà sempre essere richiesto al Titolare del Trattamento.
        </p>

        <h3 className={h3}>Luogo</h3>
        <p className={p}>
          I Dati sono trattati presso le sedi operative del Titolare ed in ogni altro luogo in cui le parti coinvolte
          nel trattamento siano localizzate. Per ulteriori informazioni, contatta il Titolare.
        </p>
        <p className={p}>
          I Dati Personali dell'Utente potrebbero essere trasferiti in un paese diverso da quello in cui l'Utente si
          trova. Per ottenere ulteriori informazioni sul luogo del trattamento l'Utente può fare riferimento alla
          sezione relativa ai dettagli sul trattamento dei Dati Personali.
        </p>

        <h3 className={h3}>Periodo di conservazione</h3>
        <p className={p}>
          Se non diversamente indicato in questo documento, i Dati Personali sono trattati e conservati per il tempo
          richiesto dalla finalità per la quale sono stati raccolti e potrebbero essere conservati per un periodo più
          lungo a causa di eventuali obbligazioni legali o sulla base del consenso degli Utenti.
        </p>

        {/* Cookie Policy */}
        <h2 className={h2}>Cookie Policy</h2>
        <p className={p}>
          Questa Applicazione fa utilizzo di Strumenti di Tracciamento. Per saperne di più, gli Utenti possono
          contattare il Titolare ai recapiti indicati in questo documento.
        </p>

        {/* UE */}
        <h2 className={h2}>Ulteriori informazioni per gli utenti nell'Unione Europea</h2>

        <h3 className={h3}>Base giuridica del trattamento</h3>
        <p className={p}>
          Il Titolare tratta Dati Personali relativi all'Utente in caso sussista una delle seguenti condizioni:
        </p>
        <ul className="mt-3 space-y-2">
          {[
            "l'Utente ha prestato il consenso per una o più finalità specifiche.",
            "il trattamento è necessario all'esecuzione di un contratto con l'Utente e/o all'esecuzione di misure precontrattuali;",
            "il trattamento è necessario per adempiere un obbligo legale al quale è soggetto il Titolare;",
            "il trattamento è necessario per l'esecuzione di un compito di interesse pubblico o per l'esercizio di pubblici poteri di cui è investito il Titolare;",
            "il trattamento è necessario per il perseguimento del legittimo interesse del Titolare o di terzi.",
          ].map((item, i) => (
            <li key={i} className={`flex items-start gap-2 ${li}`}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D9488]" />
              {item}
            </li>
          ))}
        </ul>
        <p className={p}>
          È comunque sempre possibile richiedere al Titolare di chiarire la concreta base giuridica di ciascun
          trattamento ed in particolare di specificare se il trattamento sia basato sulla legge, previsto da un
          contratto o necessario per concludere un contratto.
        </p>

        <h3 className={h3}>Ulteriori informazioni sulla conservazione</h3>
        <p className={p}>
          Se non diversamente indicato in questo documento, i Dati Personali sono trattati e conservati per il tempo
          richiesto dalla finalità per la quale sono stati raccolti e potrebbero essere conservati per un periodo più
          lungo a causa di eventuali obbligazioni legali o sulla base del consenso degli Utenti.
        </p>
        <p className="mt-3 text-sm text-[#9ca3af]">Pertanto:</p>
        <ul className="mt-3 space-y-2">
          {[
            "I Dati Personali raccolti per scopi collegati all'esecuzione di un contratto tra il Titolare e l'Utente saranno trattenuti sino a quando sia completata l'esecuzione di tale contratto.",
            "I Dati Personali raccolti per finalità riconducibili all'interesse legittimo del Titolare saranno trattenuti sino al soddisfacimento di tale interesse. L'Utente può ottenere ulteriori informazioni in merito all'interesse legittimo perseguito dal Titolare nelle relative sezioni di questo documento o contattando il Titolare.",
            "Quando il trattamento è basato sul consenso dell'Utente, il Titolare può conservare i Dati Personali più a lungo sino a quando detto consenso non venga revocato. Inoltre, il Titolare potrebbe essere obbligato a conservare i Dati Personali per un periodo più lungo per adempiere ad un obbligo di legge o per ordine di un'autorità.",
          ].map((item, i) => (
            <li key={i} className={`flex items-start gap-2 ${li}`}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D9488]" />
              {item}
            </li>
          ))}
        </ul>
        <p className={p}>
          Al termine del periodo di conservazione i Dati Personali saranno cancellati. Pertanto, allo spirare di tale
          termine il diritto di accesso, cancellazione, rettificazione ed il diritto alla portabilità dei Dati non
          potranno più essere esercitati.
        </p>

        {/* Diritti GDPR */}
        <h2 className={h2}>
          Diritti dell'Utente sulla base del Regolamento Generale sulla Protezione dei Dati (GDPR)
        </h2>
        <p className={p}>
          Gli Utenti possono esercitare determinati diritti con riferimento ai Dati trattati dal Titolare.
          In particolare, nei limiti previsti dalla legge, l'Utente ha il diritto di:
        </p>
        <ul className="mt-4 space-y-3">
          {[
            ["revocare il consenso in ogni momento.", "L'Utente può revocare il consenso al trattamento dei propri Dati Personali precedentemente espresso."],
            ["opporsi al trattamento dei propri Dati.", "L'Utente può opporsi al trattamento dei propri Dati quando esso avviene in virtù di una base giuridica diversa dal consenso."],
            ["accedere ai propri Dati.", "L'Utente ha diritto ad ottenere informazioni sui Dati trattati dal Titolare, su determinati aspetti del trattamento ed a ricevere una copia dei Dati trattati."],
            ["verificare e chiedere la rettificazione.", "L'Utente può verificare la correttezza dei propri Dati e richiederne l'aggiornamento o la correzione."],
            ["ottenere la limitazione del trattamento.", "L'Utente può richiedere la limitazione del trattamento dei propri Dati. In tal caso il Titolare non tratterà i Dati per alcun altro scopo se non la loro conservazione."],
            ["ottenere la cancellazione o rimozione dei propri Dati Personali.", "L'Utente può richiedere la cancellazione dei propri Dati da parte del Titolare."],
            ["ricevere i propri Dati o farli trasferire ad altro titolare.", "L'Utente ha diritto di ricevere i propri Dati in formato strutturato, di uso comune e leggibile da dispositivo automatico e, ove tecnicamente fattibile, di ottenerne il trasferimento senza ostacoli ad un altro titolare."],
            ["proporre reclamo.", "L'Utente può proporre un reclamo all'autorità di controllo della protezione dei dati personali competente o agire in sede giudiziale."],
          ].map(([title, desc], i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D9488]" />
              <p className="text-sm leading-relaxed text-[#9ca3af]">
                <span className="font-semibold text-white">{title}</span>{" "}{desc}
              </p>
            </li>
          ))}
        </ul>
        <p className={p}>
          Gli Utenti hanno diritto di ottenere informazioni in merito alla base giuridica per il trasferimento di
          Dati all'estero incluso verso qualsiasi organizzazione internazionale regolata dal diritto internazionale
          o costituita da due o più paesi, come ad esempio l'ONU, nonché in merito alle misure di sicurezza adottate
          dal Titolare per proteggere i loro Dati.
        </p>

        <h3 className={h3}>Dettagli sul diritto di opposizione</h3>
        <p className={p}>
          Quando i Dati Personali sono trattati nell'interesse pubblico, nell'esercizio di pubblici poteri di cui è
          investito il Titolare oppure per perseguire un interesse legittimo del Titolare, gli Utenti hanno diritto
          ad opporsi al trattamento per motivi connessi alla loro situazione particolare.
        </p>
        <p className={p}>
          Si fa presente agli Utenti che, ove i loro Dati fossero trattati con finalità di marketing diretto,
          possono opporsi al trattamento in qualsiasi momento, gratuitamente e senza fornire alcuna motivazione.
          Qualora gli Utenti si oppongano al trattamento per finalità di marketing diretto, i Dati Personali non
          saranno più oggetto di trattamento per tali finalità.
        </p>

        <h3 className={h3}>Come esercitare i diritti</h3>
        <p className={p}>
          Eventuali richieste di esercizio dei diritti dell'Utente possono essere indirizzate al Titolare attraverso
          i recapiti forniti in questo documento. La richiesta è gratuita e il Titolare risponderà nel più breve
          tempo possibile, in ogni caso entro un mese, fornendo all'Utente tutte le informazioni previste dalla
          legge. Eventuali rettifiche, cancellazioni o limitazioni del trattamento saranno comunicate dal Titolare
          a ciascuno dei destinatari, se esistenti, a cui sono stati trasmessi i Dati Personali, salvo che ciò si
          riveli impossibile o implichi uno sforzo sproporzionato.
        </p>

        {/* Ulteriori informazioni */}
        <h2 className={h2}>Ulteriori informazioni sul trattamento</h2>

        <h3 className={h3}>Difesa in giudizio</h3>
        <p className={p}>
          I Dati Personali dell'Utente possono essere utilizzati da parte del Titolare in giudizio o nelle fasi
          preparatorie alla sua eventuale instaurazione per la difesa da abusi nell'utilizzo di questa Applicazione
          o dei Servizi connessi da parte dell'Utente. L'Utente dichiara di essere consapevole che il Titolare
          potrebbe essere obbligato a rivelare i Dati per ordine delle autorità pubbliche.
        </p>

        <h3 className={h3}>Informative specifiche</h3>
        <p className={p}>
          Su richiesta dell'Utente, in aggiunta alle informazioni contenute in questa privacy policy, questa
          Applicazione potrebbe fornire all'Utente delle informative aggiuntive e contestuali riguardanti Servizi
          specifici, o la raccolta ed il trattamento di Dati Personali.
        </p>

        <h3 className={h3}>Log di sistema e manutenzione</h3>
        <p className={p}>
          Per necessità legate al funzionamento ed alla manutenzione, questa Applicazione e gli eventuali servizi
          terzi da essa utilizzati potrebbero raccogliere log di sistema, ossia file che registrano le interazioni
          e che possono contenere anche Dati Personali, quali l'indirizzo IP Utente.
        </p>

        <h3 className={h3}>Informazioni non contenute in questa policy</h3>
        <p className={p}>
          Ulteriori informazioni in relazione al trattamento dei Dati Personali potranno essere richieste in
          qualsiasi momento al Titolare del Trattamento utilizzando gli estremi di contatto.
        </p>

        <h3 className={h3}>Modifiche a questa privacy policy</h3>
        <p className={p}>
          Il Titolare del Trattamento si riserva il diritto di apportare modifiche alla presente privacy policy in
          qualunque momento notificandolo agli Utenti su questa pagina e, se possibile, su questa Applicazione
          nonché, qualora tecnicamente e legalmente fattibile, inviando una notifica agli Utenti attraverso uno
          degli estremi di contatto di cui è in possesso. Si prega dunque di consultare con frequenza questa pagina,
          facendo riferimento alla data di ultima modifica indicata in fondo.
        </p>
        <p className={p}>
          Qualora le modifiche interessino trattamenti la cui base giuridica è il consenso, il Titolare provvederà
          a raccogliere nuovamente il consenso dell'Utente, se necessario.
        </p>

        {/* Definizioni */}
        <h2 className={h2}>Definizioni e riferimenti legali</h2>

        {[
          ["Dati Personali (o Dati)", "Costituisce dato personale qualunque informazione che, direttamente o indirettamente, anche in collegamento con qualsiasi altra informazione, ivi compreso un numero di identificazione personale, renda identificata o identificabile una persona fisica."],
          ["Dati di Utilizzo", "Sono le informazioni raccolte automaticamente attraverso questa Applicazione (anche da applicazioni di parti terze integrate in questa Applicazione), tra cui: gli indirizzi IP o i nomi a dominio dei computer utilizzati dall'Utente che si connette con questa Applicazione, gli indirizzi in notazione URI (Uniform Resource Identifier), l'orario della richiesta, il metodo utilizzato nell'inoltrare la richiesta al server, la dimensione del file ottenuto in risposta, il codice numerico indicante lo stato della risposta dal server (buon fine, errore, ecc.) il paese di provenienza, le caratteristiche del browser e del sistema operativo utilizzati dal visitatore, le varie connotazioni temporali della visita (ad esempio il tempo di permanenza su ciascuna pagina) e i dettagli relativi all'itinerario seguito all'interno dell'Applicazione."],
          ["Utente", "L'individuo che utilizza questa Applicazione che, salvo ove diversamente specificato, coincide con l'Interessato."],
          ["Interessato", "La persona fisica cui si riferiscono i Dati Personali."],
          ["Responsabile del Trattamento (o Responsabile)", "La persona fisica, giuridica, la pubblica amministrazione e qualsiasi altro ente che tratta dati personali per conto del Titolare, secondo quanto esposto nella presente privacy policy."],
          ["Titolare del Trattamento (o Titolare)", "La persona fisica o giuridica, l'autorità pubblica, il servizio o altro organismo che, singolarmente o insieme ad altri, determina le finalità e i mezzi del trattamento di dati personali e gli strumenti adottati, ivi comprese le misure di sicurezza relative al funzionamento ed alla fruizione di questa Applicazione."],
          ["Questa Applicazione", "Lo strumento hardware o software nel quale sono raccolti e trattati i Dati Personali degli Utenti."],
          ["Servizio", "Il Servizio fornito da questa Applicazione così come definito nei relativi termini (se presenti) su questo sito/applicazione."],
          ["Unione Europea (o UE)", "Salvo ove diversamente specificato, ogni riferimento all'Unione Europea contenuto in questo documento si intende esteso a tutti gli attuali stati membri dell'Unione Europea e dello Spazio Economico Europeo."],
          ["Riferimenti legali", "Ove non diversamente specificato, questa policy riguarda esclusivamente questa Applicazione."],
        ].map(([term, def]) => (
          <div key={term} className="mt-5">
            <h3 className="text-sm font-semibold text-white">{term}</h3>
            <p className={p}>{def}</p>
          </div>
        ))}

        {/* Come possiamo aiutare */}
        <h2 className={h2}>Come possiamo aiutare?</h2>

        <h3 className={h3}>Cosa puoi fare — I tuoi dati</h3>
        <ul className="mt-3 space-y-2">
          {[
            "Chiedici di conoscere e accedere alle informazioni di cui disponiamo che ti riguardano",
            "Chiedici di correggere le informazioni di cui disponiamo che ti riguardano",
            "Chiedici di esercitare il diritto all'oblio (eliminando le informazioni di cui disponiamo che ti riguardano)",
            "Chiedici di trasferire i dati a un altro servizio",
            "Gestisci le tue preferenze sulla privacy",
          ].map((item, i) => (
            <li key={i} className={`flex items-start gap-2 ${li}`}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D9488]" />
              {item}
            </li>
          ))}
        </ul>

        <h3 className={h3}>In caso di problemi</h3>
        <p className={p}>
          Benché ci impegniamo a creare un'esperienza utente positiva, sappiamo che occasionalmente possono
          verificarsi problemi tra noi e i nostri utenti. In tal caso, non esitare a contattarci.
        </p>

        {/* Footer / Contatti */}
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
          Ultima modifica: 8 aprile 2026
        </p>
      </main>
    </div>
  );
}
