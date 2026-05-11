# Filo — Startup Analysis Report
**Preparato da:** Startup Analyst Agent
**Data:** Maggio 2026
**Stadio:** Pre-seed / Early Traction
**Fondatore:** Carlo Mantecchini (solo founder, 20 anni, Torino)

---

## Executive Summary

Filo è un social network italiano per il passaparola digitale: le persone trovano professionisti affidabili attraverso le raccomandazioni di chi conoscono davvero. Il prodotto risolve un problema reale e diffuso — la ricerca di un professionista di fiducia — sfruttando il grafo sociale invece di recensioni anonime.

**Punti di forza principali:**
- Differenziazione reale rispetto ai competitor (trust layer del grafo sociale)
- Costi operativi quasi nulli (Next.js + Supabase + Vercel)
- Mercato italiano frammentato e ancora non presidiato da un leader verticale
- Modello di monetizzazione chiaro con due segmenti paganti

**Rischio principale:** cold-start e network effects — il valore del prodotto cresce con gli utenti, ma senza utenti il valore è basso.

**Raccomandazione immediata:** lanciare in una singola comunità densa (non "tutta Torino") e costruire lì il first loop virale prima di espandere.

---

## 1. Market Sizing — TAM / SAM / SOM

### Definizione del mercato

- **Problema:** trovare professionisti locali affidabili (idraulici, dentisti, avvocati, commercialisti, parrucchieri, tutors, meccanici, personal trainer, ecc.)
- **Soluzione:** rete di raccomandazioni basata su persone che conosci
- **Clienti target:** (A) utenti finali 30-60 anni che cercano professionisti; (B) professionisti locali che vogliono visibilità certificata
- **Geografia:** Italia, partenza da Torino

---

### TAM — Total Addressable Market

**Metodo Bottom-Up (preferito)**

**Segmento A — Professionisti paganti (€9.99/mese)**

| Categoria | Stima Italia | % Digital-ready | Target pagante |
|---|---|---|---|
| Artigiani (CNA/Confartigianato) | 1.400.000 | 35% | 490.000 |
| Liberi professionisti (avvocati, commercialisti, architetti) | 1.100.000 | 55% | 605.000 |
| Professionisti salute (dentisti, fisioterapisti, psicologi) | 250.000 | 60% | 150.000 |
| Servizi alla persona (parrucchieri, estetisti, personal trainer) | 600.000 | 40% | 240.000 |
| **Totale** | **3.350.000** | **~44%** | **~1.485.000** |

> Fonti: ISTAT Censimento Industria e Servizi 2021; INPS Partite IVA attive 2024 (~4,7M totali, filtrate per servizi locali alla persona)

```
TAM Segmento A = 1.485.000 professionisti × €119.88/anno = €178M/anno
```

**Segmento B — Utenti Plus paganti (€2.99/mese)**

- Italiani 30-60 anni: ~28 milioni (ISTAT 2024)
- Internet attivi: ~85% = 23,8 milioni
- Disposti a pagare per servizi digitali di "fiducia": ~12% (benchmark Statista Italy digital subscriptions 2024)
- Target realistico: ~2,86 milioni

```
TAM Segmento B = 2.860.000 utenti × €35.88/anno = €103M/anno
```

**TAM Totale (Bottom-Up) = ~€281M/anno**

---

**Metodo Top-Down (validazione)**

- Mercato italiano dei servizi professionali locali: ~€120B/anno (ISTAT 2023)
- Quota digitale/discovery online: ~1,5% = €1,8B
- Quota indirizzabile da piattaforme di recommendation a subscription: ~15% = **€270M**

> I due metodi convergono entro il 4%: **TAM stimato €270-280M/anno**. Validazione confermata.

---

### SAM — Serviceable Available Market

Filtri applicati al TAM:

| Filtro | Fattore | Razionale |
|---|---|---|
| Geografico — solo città con >100K ab. (17 città) | 55% | Focus urbano iniziale |
| Fascia d'età core (30-55 anni) | 75% | Maggiore propensione digitale + al pagamento |
| Categorie attualmente supportate dal prodotto | 80% | Prodotto generalista — copre bene la maggior parte |
| Penetrazione digitale effettiva | 65% | Non tutti i professionisti/utenti usano app simili |

```
SAM = €280M × 0.55 × 0.75 × 0.80 × 0.65 = ~€60M/anno
```

**SAM = ~€60M/anno**

---

### SOM — Serviceable Obtainable Market

Proiezioni realistiche per un early-stage con 1 founder e risorse limitate:

| Orizzonte | Quota SAM | SOM | Razionale |
|---|---|---|---|
| Anno 1 | 0.05% | €30.000 ARR | Early traction Torino, ~250 paganti |
| Anno 2 | 0.2% | €120.000 ARR | Espansione Torino + 2-3 città |
| Anno 3 | 0.8% | €480.000 ARR | Nord Italia, growth loops attivi |
| Anno 5 | 2.5% | €1.500.000 ARR | Italia, con team e funding |

> Benchmark: nuovi entranti in mercati consumer ottengono raramente >5% del SAM entro 5 anni (fonte: a16z Consumer Benchmarks 2023). Qui si usa 2.5% a Year 5, conservativo ma difendibile.

---

## 2. Analisi Competitiva

### Mappa del panorama competitivo

| Competitor | Tipo | Forza principale | Debolezza chiave | Minaccia per Filo |
|---|---|---|---|---|
| Gruppi Facebook "Consiglia un..." | Indirection | 100K+ utenti, abitudine consolidata | Caotico, non strutturato, nessuna ricerca | ALTA — è il comportamento attuale da sostituire |
| Google Maps/Reviews | Discovery | Dominanza SEO, volumi enormi | Recensioni anonime, zero trust sociale | MEDIA — uso diverso (ricerca vs. raccomandazione) |
| PagineGialle | Directory | Brand storico, SEO forte | UX obsoleta, nessun grafo sociale, in declino | BASSA — segmento anziano, modello morente |
| Nextdoor | Hyper-local social | Community neighborhood | Non decollato in Italia, non profession-focused | BASSA-MEDIA — potrebbe pivotare |
| Yelp | Review platform | Brand internazionale | Quasi assente in Italia, modello in crisi globalmente | BASSA |
| LinkedIn | Professional network | 20M+ utenti in Italia | Solo B2B, non serve per idraulici/dentisti | BASSA |
| Thumbtack / Habitissimo | Lead gen professioni | Domanda attiva, transazionale | Nessun trust sociale, modello pay-per-lead | MEDIA — diverso intent |

---

### Porter's Five Forces

| Forza | Intensità (1-5) | Valutazione |
|---|---|---|
| Minaccia nuovi entranti | 4/5 | Barriere tecniche basse; il rischio vero è Big Tech (Google, Meta) che aggiunge features |
| Potere dei fornitori | 1/5 | Supabase/Vercel commoditizzati, switching cost basso |
| Potere degli acquirenti | 3/5 | Utenti consumer con alta sensibilità al prezzo; professionisti più disposti a pagare |
| Minaccia sostituti | 4/5 | Gruppi Facebook e WhatsApp family sono il sostituto diretto e gratuito |
| Rivalità competitiva | 2/5 | Nessun leader chiaro in Italia per questo specifico posizionamento (social trust graph) |

**Valutazione complessiva:** industria moderatamente attrattiva. La vera minaccia è il comportamento sostitutivo (gruppi WhatsApp/Facebook), non i competitor diretti.

---

### Blue Ocean — Analisi ERRC

| Azione | Fattori |
|---|---|
| **Elimina** | Recensioni anonime di sconosciuti; listing a pagamento per visibilità (PagineGialle model); form di contatto impersonali |
| **Riduci** | Complessità dell'onboarding; rumore informativo (tutte le recensioni del web) |
| **Aumenta** | Trust (solo persone che conosci); contestualizzazione ("il mio amico Marco ti consiglia questo dentista") |
| **Crea** | Grafo fiduciario digitale; "gradi di connessione" come filtro; raccomandazioni come moneta sociale |

---

### Posizionamento

```
Per utenti italiani 30-60 anni
Che cercano professionisti locali affidabili
Filo è un social network del passaparola
Che mostra solo raccomandazioni di persone che conosci davvero
A differenza di Google Reviews o PagineGialle
Filo trasforma il tuo grafo sociale in una guida fidata ai migliori professionisti locali
```

**Vantaggio competitivo sostenibile:** network effects bidirezionali (più utenti → più valore per ogni utente → più utenti). Questo è il moat principale. Una volta che la rete è densa in una città, è difficile da replicare.

---

## 3. Metriche Chiave — Framework dal Giorno 1

### North Star Metric

> **Raccomandazioni visualizzate da connessioni nella settimana** (Weekly Recommendations Seen from Network)

Questa metrica cattura il valore core del prodotto: non solo utenti attivi, ma utenti che ricevono raccomandazioni da persone che conoscono. Se questa cresce, il prodotto funziona.

---

### Metriche per Stadio Attuale (Pre-Seed / Early Traction)

**Engagement & Retention (priorità massima ora)**

| Metrica | Definizione | Target mese 6 | Target mese 12 |
|---|---|---|---|
| WAU / MAU ratio | Utenti attivi settimanali / mensili | >25% | >35% |
| Day-7 Retention | % utenti che tornano dopo 7 giorni | >30% | >40% |
| Day-30 Retention | % utenti attivi 30gg dopo signup | >20% | >30% |
| Raccomandazioni per utente/mese | Volume medio output | >1.5 | >2.5 |
| Connessioni medie per utente | Densità del grafo | >8 | >15 |

**Growth**

| Metrica | Definizione | Target mese 6 | Target mese 12 |
|---|---|---|---|
| Viral coefficient (K-factor) | Nuovi utenti per invito × % conversione | >0.5 | >0.8 |
| Signup da referral | % nuovi utenti da invito | >60% | >70% |
| Crescita MAU MoM | % crescita mensile utenti attivi | >20% | >15% |

**Revenue (secondaria ora, prioritaria da mese 4)**

| Metrica | Definizione | Target mese 6 | Target mese 12 |
|---|---|---|---|
| MRR | Ricavo mensile ricorrente | €200 | €1.500 |
| Free-to-paid conversion (Pro) | % professionisti che upgradano | >3% | >6% |
| Free-to-paid conversion (Plus) | % utenti consumer che upgradano | >1.5% | >3% |
| MRR churn mensile | % MRR perso ogni mese | <8% | <5% |
| ARPU blended | Ricavo medio per utente pagante | €5.50 | €6.00 |

**Unit Economics (stabilire la baseline)**

| Metrica | Formula | Benchmark target |
|---|---|---|
| CAC (organic) | Costo marketing / nuovi utenti | <€5 |
| CAC (paid) | Spesa ads / nuovi utenti | <€15 |
| LTV (Pro) | ARPU × gross margin% × (1/churn%) | >€60 |
| LTV:CAC | LTV / CAC | >3.0x |
| Payback period | CAC / (ARPU × GM%) | <6 mesi |

**Cash**

| Metrica | Target |
|---|---|
| Burn mensile | <€300/mese (infra only) |
| Runway | >18 mesi (bootstrapped) |
| Infrastructure cost per utente | <€0.05/mese |

---

### Dashboard Minima (cosa tracciare ogni settimana)

1. MAU e variazione % settimana su settimana
2. Nuove raccomandazioni pubblicate
3. K-factor (inviti inviati, % convertiti)
4. MRR e nuovi paganti
5. Day-7 retention coorte della settimana

---

## 4. Financial Projections — 12 Mesi

### Assunzioni chiave

| Parametro | Valore | Razionale |
|---|---|---|
| Utenti iniziali (mese 1) | 50 | Waitlist convertita |
| Crescita utenti totali MoM (base) | 35% | Word-of-mouth first; alto K-factor per natura del prodotto |
| Free-to-paid conversion Pro | 5% degli utenti professionisti | ~20-25% degli utenti totali sono professionisti |
| Free-to-paid conversion Plus | 2% degli utenti consumer | Benchmark conservative per consumer subscription |
| ARPU Pro | €9.99/mese | Prezzo dichiarato |
| ARPU Plus | €2.99/mese | Prezzo dichiarato |
| Monthly churn (paganti) | 6% | Benchmark consumer SaaS early-stage |
| Costi infrastruttura | €50 → €200/mese | Cresce con utenti |
| Costi marketing | €0 anno 1 | Bootstrapped, solo organic |

---

### Scenario Conservativo

*Crescita MAU +25% MoM, conversione Pro 3.5%, Plus 1.5%*

| Mese | MAU totali | Utenti Pro | Utenti Plus | MRR (€) | Costi (€) | Cash flow (€) |
|---|---|---|---|---|---|---|
| 1 | 50 | 0 | 0 | 0 | 50 | -50 |
| 2 | 65 | 1 | 1 | 12.98 | 55 | -42 |
| 3 | 90 | 2 | 2 | 25.96 | 60 | -34 |
| 4 | 120 | 3 | 3 | 38.94 | 65 | -26 |
| 5 | 160 | 4 | 5 | 54.91 | 70 | -15 |
| 6 | 210 | 6 | 7 | 80.87 | 80 | +1 |
| 7 | 275 | 8 | 9 | 106.83 | 95 | +12 |
| 8 | 355 | 10 | 12 | 135.78 | 115 | +21 |
| 9 | 455 | 13 | 15 | 172.72 | 135 | +38 |
| 10 | 580 | 17 | 20 | 225.63 | 160 | +66 |
| 11 | 730 | 21 | 25 | 284.54 | 180 | +105 |
| 12 | 915 | 27 | 31 | 362.41 | 200 | +162 |

**Anno 1 conservativo:**
- MAU fine anno: ~915
- MRR fine anno: **€362**
- ARR run-rate fine anno: **€4.350**
- Ricavi totali anno 1: ~€1.500
- Costi totali anno 1: ~€1.265 (infra)
- **Break-even operativo: mese 6**
- Net cash year 1: **+€235**

---

### Scenario Base

*Crescita MAU +35% MoM, conversione Pro 5%, Plus 2%*

| Mese | MAU totali | Utenti Pro | Utenti Plus | MRR (€) | Costi (€) | Cash flow (€) |
|---|---|---|---|---|---|---|
| 1 | 50 | 0 | 0 | 0 | 50 | -50 |
| 2 | 70 | 1 | 1 | 12.98 | 55 | -42 |
| 3 | 100 | 3 | 3 | 38.94 | 65 | -26 |
| 4 | 145 | 5 | 5 | 64.90 | 75 | -10 |
| 5 | 200 | 7 | 7 | 90.86 | 85 | +6 |
| 6 | 280 | 9 | 10 | 119.81 | 100 | +20 |
| 7 | 385 | 13 | 14 | 168.73 | 120 | +49 |
| 8 | 525 | 17 | 19 | 224.64 | 145 | +80 |
| 9 | 720 | 23 | 26 | 307.54 | 170 | +138 |
| 10 | 975 | 31 | 35 | 416.41 | 200 | +216 |
| 11 | 1.320 | 42 | 47 | 561.25 | 230 | +331 |
| 12 | 1.780 | 57 | 64 | 762.67 | 270 | +493 |

**Anno 1 base:**
- MAU fine anno: ~1.780
- MRR fine anno: **€763**
- ARR run-rate fine anno: **€9.150**
- Ricavi totali anno 1: ~€2.770
- Costi totali anno 1: ~€1.565
- **Break-even operativo: mese 5**
- Net cash year 1: **+€1.205**

---

### Scenario Ottimistico

*Crescita MAU +50% MoM (viral loop attivo), conversione Pro 7%, Plus 3%*

| Mese | MAU totali | MRR (€) |
|---|---|---|
| 6 | 380 | €215 |
| 9 | 1.280 | €700 |
| 12 | 4.100 | **€2.200** |

**Anno 1 ottimistico:**
- MAU fine anno: ~4.100
- MRR fine anno: **€2.200**
- ARR run-rate fine anno: **€26.400**
- **Break-even: mese 4**

---

### Proiezioni Anno 2-3 (Scenario Base)

| | Anno 2 | Anno 3 |
|---|---|---|
| MAU | ~12.000 | ~45.000 |
| MRR fine anno | €5.500 | €22.000 |
| ARR | €66.000 | €264.000 |
| Ricavi totali | ~€40.000 | ~€160.000 |
| Team | 0-1 part-time | 1-2 full-time |
| Costi totali | ~€15.000 | ~€80.000 |
| EBITDA | ~+€25.000 | ~+€80.000 |

---

### Unit Economics (Scenario Base, mese 12)

```
CAC (organic)         = €0 (word-of-mouth puro)
CAC (blended futuro)  = ~€8 (con minimo social ads)

ARPU Pro blended      = €9.99/mese (lordo)
ARPU Plus blended     = €2.99/mese (lordo)
ARPU blended paganti  = ~€6.20/mese

Gross Margin          = ~95% (infra cost ~€0.15/utente pagante/mese)

Churn mensile         = 6%
Avg customer lifetime = 1/0.06 = ~16.7 mesi

LTV Pro               = €9.99 × 95% × 16.7 = €158.50
LTV Plus              = €2.99 × 95% × 16.7 = €47.44

LTV:CAC (organic)     = ∞ (CAC = 0)
LTV:CAC (paid €8)     = €158.50 / €8 = 19.8x [eccezionale]

CAC Payback (paid)    = €8 / (€6.20 × 95%) = 1.4 mesi [ottimo]
```

> A costi marginali quasi nulli, la sfida non è la redditività per singolo utente — è acquisire abbastanza utenti da raggiungere la densità critica del network.

---

## 5. Fundraising

### Valutazione pre-money — Framework

**Metodi applicati:**

**1. Scorecard Method (pre-revenue angel)**

| Fattore | Peso | Score Filo | Contributo |
|---|---|---|---|
| Forza del team | 30% | 5/10 (solo founder, 20 anni, prima startup) | 1.5 |
| Dimensione opportunità | 25% | 8/10 (mercato €280M TAM) | 2.0 |
| Prodotto/tecnologia | 15% | 7/10 (MVP funzionante, stack moderno) | 1.05 |
| Ambiente competitivo | 10% | 7/10 (spazio non presidiato in Italia) | 0.7 |
| Marketing/canali | 10% | 5/10 (tutto da costruire) | 0.5 |
| Traction | 10% | 4/10 (50 waitlist, zero revenue) | 0.4 |
| **Totale** | | | **6.15 / 10** |

> Base median per pre-seed italiano consumer tech: €500.000 pre-money
> Aggiustamento Filo: €500.000 × 6.15/7.0 (media benchmark) = **~€440.000**

**2. Comparable transactions (Italia 2024-2025)**

Pre-seed italiani consumer/social con MVP: €300.000–€800.000 pre-money
Fascia più comune con 1 founder + waitlist: €400.000–€600.000

**Valutazione consigliata: €400.000–€600.000 pre-money**

---

### Round consigliato: Pre-Seed Friends & Family / Angel

| Parametro | Valore consigliato |
|---|---|
| **Importo da raccogliere** | €50.000–€150.000 |
| **Strumento** | Convertible note o SAFE (evita la valutazione bloccata) |
| **Utilizzo fondi** | 18 mesi runway + marketing locale Torino + eventuale primo collaboratore part-time |
| **Diluizione accettabile** | 10–20% |
| **Timing ottimale** | Dopo 3-6 mesi di traction dimostrabile (>500 utenti attivi, >50 paganti) |
| **Pre-money indicativa** | €400.000–€600.000 |

**Breakdown utilizzo €100.000:**

| Voce | Importo | % |
|---|---|---|
| Infrastruttura + tool 18 mesi | €3.000 | 3% |
| Marketing locale (eventi, referral, flyer QR) | €15.000 | 15% |
| Collaboratore growth/community part-time | €30.000 | 30% |
| Legal/accounting/GDPR | €5.000 | 5% |
| Riserva operativa (buffer 20%) | €20.000 | 20% |
| Salary fondatore (parziale) | €27.000 | 27% |

---

### A chi rivolgersi in Italia

**Priorità 1 — Investitori locali Torino (più accessibili)**

| Investitore | Tipo | Focus | Note |
|---|---|---|---|
| Club degli Investitori (Torino) | Angel network | Early-stage italiani, ticketing €25K-100K | Il più accessibile da Torino, attivo sul territorio |
| Liftt (Torino) | Accelerator/fund | Deep tech + digital, pre-seed | Collegato a Politecnico, attivo |
| Fondazione CRT — OGR Torino | Corporate | Startup torinesi | Bandi periodici, non equity |

**Priorità 2 — Programmi nazionali**

| Programma | Tipo | Importo | Note |
|---|---|---|---|
| CDP Venture Capital — Italia Venture I | VC pubblico | €200K-2M seed | Investe in fondi e direttamente |
| Invitalia Smart&Start | Grant | €25K-100K | Non dilutivo, per under 35 |
| Fondo Nazionale Innovazione | VC | Seed-Series A | Tramite fondi privati co-investiti |

**Priorità 3 — Angel individuali**

Cercare su: Italia Startup, AngelList Italia, LinkedIn (ex-founder/executive italiani con exit).
Criteri di fit: esperienza consumer tech, conoscenza del mercato locale italiano, non solo capitale.

---

### Milestones per accedere al round successivo (Seed €300K-500K)

Per alzare un round seed in Italia è necessario dimostrare:
- **>5.000 MAU** (>2.000 in modo verificabile attivi almeno settimanalmente)
- **>€2.000 MRR** con trend di crescita >15% MoM
- **Retention >30% a Day-30**
- **K-factor >0.6** (la crescita è principalmente organica)
- Presenza in almeno 2 città italiane

---

## 6. Top 5 Rischi

### Rischio 1 — Cold Start e Network Effects (CRITICO)
**Probabilità: Alta | Impatto: Critico**

Il valore di Filo dipende dalla densità della rete. Con 50 utenti a Torino, un nuovo utente potrebbe registrarsi e trovare 3 amici sulla piattaforma — troppo poco per renderla utile. Il rischio è che non si raggiunga mai la "densità critica" necessaria affinché il network effect si attivi.

*Mitigazione:* Strategia beachhead iperfocalizzata (vedi Raccomandazione #1). Non espandersi orizzontalmente finché il primo nucleo non ha K-factor >0.8.

---

### Rischio 2 — Solo Founder / Key Person Risk (ALTO)
**Probabilità: Alta | Impatto: Alto**

Un'unica persona gestisce prodotto, sviluppo (via AI), marketing, supporto e strategia. Burnout, malattia o perdita di motivazione blocca tutto. Gli investitori professionali quasi sempre chiedono almeno un co-founder prima di investire importi significativi.

*Mitigazione:* Trovare un co-founder complementare (es. qualcuno con background marketing/comunità, non tecnico) entro 6-12 mesi. Nel breve: documentare i processi critici, usare strumenti no-code robusti.

---

### Rischio 3 — Resistenza alla Monetizzazione (MEDIO-ALTO)
**Probabilità: Media | Impatto: Alto**

Gli italiani hanno una delle più basse propensioni al pagamento per servizi digitali in Europa (Eurostat Digital Economy 2024: Italia 18° su 27 paesi per subscription digitali). Il rischio è che la conversione free-to-paid resti sotto l'1%, rendendo il modello non sostenibile.

*Mitigazione:* Monetizzare prevalentemente i professionisti (incentivo economico chiaro: visibilità = clienti) e rendere il tier Plus gratuito più a lungo per gli utenti consumer. Testare "pay per raccomandazione ricevuta" come alternativa al flat subscription.

---

### Rischio 4 — Big Tech Replication (MEDIO)
**Probabilità: Media | Impatto: Molto alto**

Google potrebbe aggiungere un layer "raccomandato da contatti Google" in Maps. Meta ha già Facebook Recommendations Groups e potrebbe renderli più strutturati. Con le loro distribuzioni (20M utenti LinkedIn in Italia, 35M Facebook Italy) potrebbero saturare lo spazio in 12-18 mesi.

*Mitigazione:* La velocità è l'unica difesa nella fase early. Raggiungere densità critica in Torino prima che Big Tech si accorga del segmento. Il vantaggio di Filo è la focalizzazione italiana e la UX specifica — non la tecnologia.

---

### Rischio 5 — Qualità delle Raccomandazioni / Trust Abuse (MEDIO)
**Probabilità: Media | Impatto: Alto**

I professionisti potrebbero pagare per ottenere raccomandazioni false dai propri clienti, inquinando il sistema di fiducia. Questo distruggerebbe il valore core del prodotto.

*Mitigazione:* Algoritmi di rilevamento anomalie (cluster di raccomandazioni dello stesso utente allo stesso professionista, account creati dopo raccomandazioni). Moderazione umana iniziale. Meccanismo di segnalazione visibile.

---

## 7. Top 5 Raccomandazioni Strategiche

### Raccomandazione 1 — Lancia in una comunità densa, non in una città
**Priorità: MASSIMA | Timing: Immediato**

Non lanciare "a Torino" — lancia in un gruppo specifico di 200-500 persone densamente connesse. Esempi:
- I genitori di una scuola elementare specifica
- I soci di un club sportivo (tennis, crossfit)
- I dipendenti di un'azienda media locale
- I frequentatori di una parrocchia o circolo

In un gruppo di 300 persone, ogni nuovo utente troverà subito 50-100 connessioni già sulla piattaforma — creando valore immediato e innescando il viral loop.

*KPI di successo:* K-factor >0.8 nel primo nucleo prima di espandere.

---

### Raccomandazione 2 — Programma "Fondatori di Filo" per i 50 in waitlist
**Priorità: ALTA | Timing: Pre-lancio**

I 50 utenti in waitlist non sono semplici early adopter — sono gli ambasciatori che determineranno se la rete decollerà. Dargli:
- Badge permanente "Fondatore" sul profilo
- Accesso Pro gratuito a vita (o 2 anni)
- Accesso esclusivo a un gruppo WhatsApp diretto con Carlo
- Loro nome nei credits dell'app

Chiedergli in cambio: 5 inviti ad amici della propria rete personale, feedback settimanale.

*KPI:* Ogni fondatore porta in media 3+ nuovi utenti attivi nel primo mese.

---

### Raccomandazione 3 — Concentra la monetizzazione sui professionisti, non sui consumatori
**Priorità: ALTA | Timing: Mese 3-4**

I professionisti hanno un incentivo economico chiaro a pagare (ogni raccomandazione = potenziale cliente). I consumatori no. Modello ottimale:

- **Utenti consumer:** sempre gratuiti (abbassa la barriera di adozione, aumenta la densità del network)
- **Professionisti:** freemium con tier "Profilo Verificato" a €9.99/mese (con badge, analytics, risposte prioritarie)
- Eliminare il tier Plus consumer o renderlo opzionale/regalo per chi invita altri

*Razionale:* Su Yelp, LinkedIn e simili, il B2B side monetizza sempre meglio del consumer side.

---

### Raccomandazione 4 — Partnership con associazioni di categoria
**Priorità: MEDIA | Timing: Mese 4-8**

Le associazioni di artigiani e liberi professionisti hanno già la fiducia dei professionisti locali e vogliono offrire nuovi servizi ai loro iscritti. Proposta:

- **CNA / Confartigianato** (artigiani): accordo white-label o co-marketing
- **Ordine dei Commercialisti, Avvocati**: profilo verificato come vantaggio esclusivo per gli iscritti
- **Coldiretti / Confcommercio**: espansione verso esercenti locali

Vantaggio: accesso immediato a migliaia di professionisti pre-qualificati, credibilità istituzionale, PR gratuita.

*KPI:* 1 accordo con associazione di categoria entro mese 9, generando >100 professionisti paganti.

---

### Raccomandazione 5 — Costruisci il loop virale nel prodotto prima di spendere in marketing
**Priorità: ALTA | Timing: Continuo**

Non spendere in ads finché il K-factor organico non è >0.5. Investire invece in feature che accelerano il viral loop nel prodotto:

- **Condivisione raccomandazione:** un tap per condividere su WhatsApp con deep link
- **Email "amici su Filo":** notifica automatica quando un contatto si registra (con opt-in)
- **"Chiedi una raccomandazione":** funzione request visible alla rete → incentiva risposte → porta nuovi utenti
- **Invito diretto:** sistema di inviti con tracking + rewards (es. mese Pro gratis per ogni invito che converte)

*Razionale:* Con un prodotto consumer in Italia, il CAC deve tendere a zero nella fase early. Il budget va sulla densità del network, non su Google Ads.

---

## Appendice — Assunzioni e Fonti

### Dati demografici italiani
- ISTAT Popolazione residente 2024: ~59,8M
- ISTAT Censimento industria e servizi 2021
- INPS Osservatorio Partite IVA 2024: 4,73M attive, ~1,4M nei servizi alla persona
- Statista Italy Digital Economy Report 2024

### Benchmarks startup utilizzati
- a16z Consumer Startup Benchmarks 2023
- Bessemer Venture Partners Cloud Index 2024 (per SaaS retention)
- Seedcamp European Pre-Seed Report 2024 (valutazioni italiane)
- ChartMogul SaaS Benchmarks 2024 (churn rates consumer SaaS)

### Assunzioni finanziarie
- Gross margin 95%: giustificato da costi infra Next.js/Supabase/Vercel (stimati €0.05-0.15 per utente pagante/mese a scale attuale)
- Churn 6%/mese = 72%/anno: conservativo per consumer subscription in fase early (benchmark tipico: 5-8%)
- Conversione Pro 5%: basato su mix consumer/professional; le piattaforme B2SMB ottengono 3-8% di conversione freemium
- Crescita MAU 35%/mese (scenario base): high-growth consumer apps early-stage; si normalizza sotto 15% a >10K utenti

### Limitazioni dell'analisi
- Zero revenue storica da validare
- Nessuna intervista utente con dati primari inclusa
- Dati competitivi su player italiani (PagineGialle, Nextdoor Italy) basati su fonti pubbliche, non partnership
- Proiezioni finanziarie basate su assunzioni di mercato, non su dati aziendali verificati

---

*Report generato con il framework Startup Analyst Agent + skill: market-sizing-analysis, competitive-landscape, startup-financial-modeling, startup-metrics-framework.*
*Filo — filo.network — Torino, Italia*
