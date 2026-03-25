#!/usr/bin/env node
/**
 * Filo — Demo Seed Script
 * Run: node scripts/seed.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Get it from: Supabase Dashboard → Project Settings → API → service_role key
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env.local ──────────────────────────────────────────────────────────

function readEnvFile() {
  try {
    const raw = readFileSync(join(__dirname, "../.env.local"), "utf8");
    return Object.fromEntries(
      raw.split("\n")
        .filter((l) => l.includes("=") && !l.startsWith("#"))
        .map((l) => {
          const idx = l.indexOf("=");
          return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
        })
    );
  } catch {
    return {};
  }
}

const env = readEnvFile();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL ?? "https://uikmkkwqmmigukwjzwum.supabase.co";
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("\n❌  SUPABASE_SERVICE_ROLE_KEY mancante.\n");
  console.error("    Aggiungila a .env.local:");
  console.error("    SUPABASE_SERVICE_ROLE_KEY=<la tua chiave da Supabase Dashboard → Project Settings → API → service_role>\n");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const USERS = [
  // 0 — protagonista
  { email: "marco.rossi.filo@gmail.com", password: "Demo1234!", full_name: "Marco Rossi",       username: "marcorossi",       city: "Torino" },
  // 1–20 — utenti fittizi
  { email: "sofia.ferretti@filo.demo",    password: "Demo1234!", full_name: "Sofia Ferretti",     username: "sofiaferretti",    city: "Torino" },
  { email: "luca.marino@filo.demo",       password: "Demo1234!", full_name: "Luca Marino",        username: "lucamarino",       city: "Milano" },
  { email: "giulia.conti@filo.demo",      password: "Demo1234!", full_name: "Giulia Conti",       username: "giuliaconti",      city: "Torino" },
  { email: "alessandro.bruno@filo.demo",  password: "Demo1234!", full_name: "Alessandro Bruno",   username: "alessandrobruno",  city: "Genova" },
  { email: "valentina.ricci@filo.demo",   password: "Demo1234!", full_name: "Valentina Ricci",    username: "valentinaricci",   city: "Torino" },
  { email: "matteo.esposito@filo.demo",   password: "Demo1234!", full_name: "Matteo Esposito",    username: "matteoesposito",   city: "Bologna" },
  { email: "chiara.lombardi@filo.demo",   password: "Demo1234!", full_name: "Chiara Lombardi",    username: "chiaralombardi",   city: "Torino" },
  { email: "federico.gallo@filo.demo",    password: "Demo1234!", full_name: "Federico Gallo",     username: "federicogallo",    city: "Milano" },
  { email: "martina.costa@filo.demo",     password: "Demo1234!", full_name: "Martina Costa",      username: "martinacosta",     city: "Torino" },
  { email: "davide.fontana@filo.demo",    password: "Demo1234!", full_name: "Davide Fontana",     username: "davidefontana",    city: "Torino" },
  { email: "irene.moretti@filo.demo",     password: "Demo1234!", full_name: "Irene Moretti",      username: "irenemoretti",     city: "Milano" },
  { email: "stefano.caruso@filo.demo",    password: "Demo1234!", full_name: "Stefano Caruso",     username: "stefanocaruso",    city: "Torino" },
  { email: "elena.bassi@filo.demo",       password: "Demo1234!", full_name: "Elena Bassi",        username: "elenabassi",       city: "Torino" },
  { email: "roberto.greco@filo.demo",     password: "Demo1234!", full_name: "Roberto Greco",      username: "robertogreco",     city: "Genova" },
  { email: "francesca.mancini@filo.demo", password: "Demo1234!", full_name: "Francesca Mancini",  username: "francescamancini", city: "Bologna" },
  { email: "andrea.ferrero@filo.demo",    password: "Demo1234!", full_name: "Andrea Ferrero",     username: "andreaferrero",    city: "Torino" },
  { email: "laura.pieri@filo.demo",       password: "Demo1234!", full_name: "Laura Pieri",        username: "laurapieri",       city: "Torino" },
  { email: "nicola.marini@filo.demo",     password: "Demo1234!", full_name: "Nicola Marini",      username: "nicolamarini",     city: "Milano" },
  { email: "serena.vitali@filo.demo",     password: "Demo1234!", full_name: "Serena Vitali",      username: "serenavitali",     city: "Torino" },
  { email: "emanuele.rizzo@filo.demo",    password: "Demo1234!", full_name: "Emanuele Rizzo",     username: "emanuelerizzo",    city: "Torino" },
];

// Recommendations: user_idx references USERS array index
const RECS = [
  // ── DENTISTI (8) ──
  { user_idx: 1,  professional_name: "Dr. Paolo Bianchi",             category: "dentista",      city: "Torino",  price_range: "€€",  address: "Via Roma 23",             note: "Lo frequento da 5 anni, sempre preciso e disponibile. Studio pulito e moderno, prezzi giusti per la qualità." },
  { user_idx: 2,  professional_name: "Studio Dentistico Ferraro",     category: "dentista",      city: "Torino",  price_range: "€€€", address: "Corso Vittorio 142",      note: "Eccellente, il dottor Ferraro è il migliore che abbia mai trovato. Costoso ma ne vale davvero la pena." },
  { user_idx: 3,  professional_name: "Dr.ssa Giovanna Pacci",         category: "dentista",      city: "Torino",  price_range: "€€",  address: "Via Garibaldi 8",         note: "Super gentile e bravissima con i bambini. La consiglio a tutti quelli che hanno i figli piccoli." },
  { user_idx: 0,  professional_name: "Dr. Marco Ruggeri",             category: "dentista",      city: "Torino",  price_range: "€€€", address: "Piazza San Carlo 5",      note: "Il mio dentista da 10 anni. Preciso, professionale, non mente mai sui costi. Uno studio di alto livello." },
  { user_idx: 5,  professional_name: "Studio Dentistico Azzurro",     category: "dentista",      city: "Torino",  price_range: "€€",  address: "Corso Dante 67",          note: "Bravi e veloci, la segreteria è organizzatissima. Prezzi nella media con qualità decisamente superiore." },
  { user_idx: 7,  professional_name: "Dr. Giuseppe Cavallo",          category: "dentista",      city: "Milano",  price_range: "€€",  address: "Via Brera 12",            note: "Ottimo professionista, mi ha risolto un problema ai denti del giudizio in modo indolore. Consigliato!" },
  { user_idx: 9,  professional_name: "Dr.ssa Francesca Denti",        category: "dentista",      city: "Torino",  price_range: "€",   address: "Via Nizza 45",            note: "Conveniente e brava, ideale per controlli di routine. Rispetta sempre gli orari degli appuntamenti." },
  { user_idx: 13, professional_name: "Studio Odontoiatrico Salute",   category: "dentista",      city: "Torino",  price_range: "€€",  address: "Corso Orbassano 122",     note: "Professionali e attenti. Ho fatto l'apparecchio qui da adulta e sono stata seguita benissimo." },
  // ── AVVOCATI (6) ──
  { user_idx: 4,  professional_name: "Avv. Maria Conti",              category: "avvocato",      city: "Torino",  price_range: "€€€", address: "Via Pietro Micca 18",     note: "L'ho contattata per una questione di lavoro complessa e l'ha risolta in 3 mesi. Competente e diretta." },
  { user_idx: 0,  professional_name: "Studio Legale Martinelli",      category: "avvocato",      city: "Torino",  price_range: "€€€", address: "Corso Re Umberto 22",     note: "Studio serio e affidabile per pratiche societarie. Un po' caro ma danno sempre risposte chiare e veloci." },
  { user_idx: 10, professional_name: "Avv. Roberto Testa",            category: "avvocato",      city: "Torino",  price_range: "€€",  address: "Via Lagrange 30",         note: "Bravo avvocato civile, disponibile e non ti lascia mai senza risposta. Ha gestito il mio divorzio con tatto." },
  { user_idx: 8,  professional_name: "Studio Legale Ventura",         category: "avvocato",      city: "Milano",  price_range: "€€€", address: "Piazza Duomo 2",          note: "Specializzati in diritto commerciale. Ho firmato un accordo importante con la loro assistenza, tutto perfetto." },
  { user_idx: 11, professional_name: "Avv. Claudia Neri",             category: "avvocato",      city: "Torino",  price_range: "€€",  address: "Via Po 45",               note: "Precisa e puntuale, gestisce tutto via email senza perderti in lunghe telefonate. Apprezzatissima." },
  { user_idx: 12, professional_name: "Avv. Lorenzo Poli",             category: "avvocato",      city: "Genova",  price_range: "€€",  address: "Via XX Settembre 81",     note: "L'ho trovato tramite un amico, non mi ha deluso. Gestisce pratiche immobiliari in modo impeccabile." },
  // ── COMMERCIALISTI (6) ──
  { user_idx: 0,  professional_name: "Dott. Roberto Sala",            category: "commercialista",city: "Torino",  price_range: "€€",  address: "Via Cavour 12",           note: "Il mio commercialista da 6 anni. Ha ottimizzato le mie tasse il primo anno del 30%. Risponde sempre rapidamente." },
  { user_idx: 1,  professional_name: "Studio Fiscale Brero",          category: "commercialista",city: "Torino",  price_range: "€€€", address: "Corso Filippo Turati 15", note: "Studio professionale con tre commercialisti, coprono tutti gli ambiti. Ottimi per partite IVA e srl." },
  { user_idx: 3,  professional_name: "Dott.ssa Anna Marro",           category: "commercialista",city: "Torino",  price_range: "€€",  address: "Via Lagrange 5",          note: "Gentile e preparata, mi aiuta con la dichiarazione dei redditi ogni anno. Non mi ha mai fatto pagare sanzioni." },
  { user_idx: 14, professional_name: "Studio Commercialisti Uniti",   category: "commercialista",city: "Bologna", price_range: "€€",  address: "Via Rizzoli 10",          note: "Affidabili per piccole imprese. Ho aperto la mia srl con loro, hanno fatto tutto in tempo record." },
  { user_idx: 15, professional_name: "Dott. Filippo Gamba",           category: "commercialista",city: "Milano",  price_range: "€€",  address: "Corso Buenos Aires 44",   note: "Lo uso da quando ho aperto la mia partita IVA. Prezzi onesti e sempre disponibile per domande urgenti." },
  { user_idx: 16, professional_name: "Dott. Carlo Vigna",             category: "commercialista",city: "Torino",  price_range: "€€",  address: "Via Santa Teresa 18",     note: "Serio e competente, mi ha seguito in una fusione aziendale complessa. Risultato ottimo." },
  // ── MEDICI (5) ──
  { user_idx: 0,  professional_name: "Dr. Enrico Ferrari",            category: "medico",        city: "Torino",  price_range: "€€",  address: "Via Bertola 22",          note: "Il mio medico di base da 8 anni. Preciso nella diagnosi, non prescrive mai esami inutili. Difficile trovare appuntamento ma ne vale la pena." },
  { user_idx: 5,  professional_name: "Dr.ssa Luisa Botto",            category: "medico",        city: "Torino",  price_range: "€",   address: "Corso Racconigi 78",      note: "Disponibilissima, risponde anche ai messaggi la sera. La consiglio come medico di base per famiglie con bambini." },
  { user_idx: 7,  professional_name: "Dr. Maurizio Galli",            category: "medico",        city: "Milano",  price_range: "€€",  address: "Via Montenapoleone 3",    note: "Specialista in medicina interna. L'ho visto per una diagnosi difficile e ha individuato il problema subito." },
  { user_idx: 17, professional_name: "Dr.ssa Paola Ricci",            category: "medico",        city: "Torino",  price_range: "€",   address: "Via Nizza 100",           note: "Bravissima, paziente e ascolta davvero. Non ti manda via dopo 5 minuti come spesso capita." },
  { user_idx: 20, professional_name: "Dr. Giovanni Bosco",            category: "medico",        city: "Torino",  price_range: "€€",  address: "Corso Montevecchio 10",   note: "Cardiologo di grande esperienza. Mi ha seguito dopo un intervento e la sua attenzione è stata fondamentale." },
  // ── IDRAULICI (4) ──
  { user_idx: 6,  professional_name: "Idraulico Express Torino",      category: "idraulico",     city: "Torino",  price_range: "€€",  address: null,                      note: "Arriva davvero in giornata come promette. Ho avuto una perdita il sabato mattina e in 2 ore era già risolto." },
  { user_idx: 10, professional_name: "Mario Plumber",                 category: "idraulico",     city: "Torino",  price_range: "€",   address: null,                      note: "Economico e veloce. Ha sistemato il mio bagno in un weekend, non ha lasciato disordine. Lo richiamerò sicuro." },
  { user_idx: 18, professional_name: "Termoidraulica Russo",          category: "idraulico",     city: "Milano",  price_range: "€€",  address: "Via Padova 22",           note: "Bravi per caldaie e riscaldamento. Mi hanno installato una pompa di calore risparmiando il 40% sui consumi." },
  { user_idx: 19, professional_name: "Idraulici Torinesi",            category: "idraulico",     city: "Torino",  price_range: "€€",  address: null,                      note: "Hanno rifatto tutti i tubi di casa mia vecchia. Lavoro pulito, prezzi concordati e rispettati." },
  // ── ELETTRICISTI (4) ──
  { user_idx: 8,  professional_name: "Elettricista Rosario",          category: "elettricista",  city: "Torino",  price_range: "€€",  address: null,                      note: "Veloce, preciso e con prezzi onesti. Mi ha rifatto l'impianto del salotto in mezza giornata. Chiedo sempre a lui." },
  { user_idx: 0,  professional_name: "Studio Elettrico Fiat",         category: "elettricista",  city: "Torino",  price_range: "€€",  address: "Via Lingotto 4",          note: "Professionali e puntuali. Hanno installato pannelli fotovoltaici a casa mia, lavoro impeccabile con garanzia decennale." },
  { user_idx: 11, professional_name: "Elettricisti Lombardi",         category: "elettricista",  city: "Milano",  price_range: "€€",  address: "Via Monza 55",            note: "Li ho usati per un ufficio commerciale. Sanno fare certificazioni CE e pratiche INAIL. Consigliati per professionisti." },
  { user_idx: 12, professional_name: "Pronto Intervento Elettrico",   category: "elettricista",  city: "Torino",  price_range: "€",   address: null,                      note: "Il numero da avere sempre in rubrica. Reperibili 24/7, non applicano supplementi esagerati per le urgenze." },
  // ── RISTORANTI (4) ──
  { user_idx: 13, professional_name: "Ristorante Piemonte Autentico", category: "altro",         city: "Torino",  price_range: "€€€", address: "Via Monferrato 6",        note: "La miglior cucina piemontese che abbia mai assaggiato. Il brasato al Barolo è una roba da altri pianeti. Prenotare con anticipo." },
  { user_idx: 17, professional_name: "Osteria del Borgo",             category: "altro",         city: "Torino",  price_range: "€€",  address: "Strada del Nobile 16",    note: "Ambiente rustico e caldo, piatti della nonna a prezzi giusti. Ideale per una serata tranquilla con gli amici." },
  { user_idx: 19, professional_name: "Chef Diego Bruni",              category: "altro",         city: "Torino",  price_range: "€€€", address: null,                      note: "Chef privato per cene a casa. Ne è valsa ogni centesimo: 8 portate, ingredienti selezionati, presentazione da stellato." },
  { user_idx: 14, professional_name: "Trattoria da Nonno",            category: "altro",         city: "Torino",  price_range: "€",   address: "Corso Casale 45",         note: "Trattoria di quartiere con pasta fatta a mano ogni giorno. I ravioli del plin sono i migliori della città." },
  // ── PALESTRE / PT (3) ──
  { user_idx: 1,  professional_name: "PT Marco Ferrante",             category: "altro",         city: "Torino",  price_range: "€€",  address: "Via Sacchi 12",           note: "Personal trainer bravissimo, mi ha preparato un programma ad hoc. In 4 mesi ho perso 8 kg e mi sento benissimo." },
  { user_idx: 20, professional_name: "Palestra FitTorino",            category: "altro",         city: "Torino",  price_range: "€€",  address: "Corso Unità d'Italia 100",note: "Attrezzatura moderna, istruttori competenti e orari comodi. Ho il mensile da 2 anni e non cambierei." },
  { user_idx: 16, professional_name: "Coach Simona Vigna",            category: "altro",         city: "Milano",  price_range: "€€",  address: null,                      note: "Online coach straordinaria. Segue dieta e allenamento insieme, i risultati arrivano davvero. Seriosissima." },
];

// Follows: {fr: follower_idx, fg: following_idx}
// Marco(0) followers: Sofia(1), Giulia(3), Valentina(5), Chiara(7), Martina(9), Davide(10), Irene(11), Andrea(16)
// Marco(0) follows: Sofia(1), Luca(2), Giulia(3), Chiara(7), Matteo(6), Davide(10)
// Second degree via Marco's follows:
//   Sofia(1) → Alessandro(4), Federico(8), Elena(13), Valentina(5)
//   Luca(2)  → Alessandro(4), Roberto(14), Nicola(18)
//   Giulia(3)→ Valentina(5), Martina(9), Laura(17)
//   Chiara(7)→ Irene(11), Serena(19), Elena(13)
//   Matteo(6)→ Emanuele(20), Nicola(18), Stefano(12)
//   Davide(10)→Federico(8), Francesca(15), Stefano(12)
const FOLLOWS = [
  // Marco's followers
  { fr: 1,  fg: 0 }, { fr: 3,  fg: 0 }, { fr: 5,  fg: 0 }, { fr: 7,  fg: 0 },
  { fr: 9,  fg: 0 }, { fr: 10, fg: 0 }, { fr: 11, fg: 0 }, { fr: 16, fg: 0 },
  // Marco follows
  { fr: 0, fg: 1 }, { fr: 0, fg: 2 }, { fr: 0, fg: 3 },
  { fr: 0, fg: 7 }, { fr: 0, fg: 6 }, { fr: 0, fg: 10 },
  // Second degree (those 6 follow others)
  { fr: 1,  fg: 4  }, { fr: 1,  fg: 8  }, { fr: 1,  fg: 13 }, { fr: 1,  fg: 5  },
  { fr: 2,  fg: 4  }, { fr: 2,  fg: 14 }, { fr: 2,  fg: 18 },
  { fr: 3,  fg: 5  }, { fr: 3,  fg: 9  }, { fr: 3,  fg: 17 },
  { fr: 7,  fg: 11 }, { fr: 7,  fg: 19 }, { fr: 7,  fg: 13 },
  { fr: 6,  fg: 20 }, { fr: 6,  fg: 18 }, { fr: 6,  fg: 12 },
  { fr: 10, fg: 8  }, { fr: 10, fg: 15 }, { fr: 10, fg: 12 },
  // Extra connections to make the graph richer
  { fr: 4,  fg: 8  }, { fr: 5,  fg: 9  }, { fr: 8,  fg: 15 },
  { fr: 9,  fg: 17 }, { fr: 13, fg: 16 }, { fr: 17, fg: 19 },
];

// Likes: per recommendation index, array of user indices that liked it
// rec_idx → [user_idx, ...]
const LIKES = [
  [1,2,3,5,7,8,10,11,13,14,16],           // 0  — 11 likes
  [0,1,3,4,6,8,10,12,13,15,16,17,18,20],  // 1  — 14 likes
  [0,2,4,5,9,11,14,17],                   // 2  — 8 likes
  [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], // 3 — 18 likes
  [0,2,3,7,9,11,13,15,17,19,20],          // 4  — 11 likes
  [1,4,6,8,10,14,18],                     // 5  — 7 likes
  [0,3,5,9,13],                           // 6  — 5 likes
  [2,4,6,10,12,16,18,20,1],               // 7  — 9 likes
  [0,1,3,5,7,9,10,12,14,16,17,18,19,20], // 8  — 14 likes
  [1,2,4,5,6,8,10,11,13,14,15,16,17,18,19,20], // 9 — 16 likes
  [0,3,7,9,11,17],                        // 10 — 6 likes
  [1,2,4,6,8,9,12,14,16,18,20,3,5],       // 11 — 13 likes
  [0,2,5,7,9,11,13,15,17,19],             // 12 — 10 likes
  [1,3,6,10,14],                          // 13 — 5 likes (wait this should be 8)
  [0,1,2,3,4,5,6,7,8,9,10,11,12,14,15,17,19], // 14 — 17 likes
  [0,2,4,6,8,10,12,14,16,18,20,1],        // 15 — 12 likes
  [1,3,5,7,11,13,17,19,9],                // 16 — 9 likes
  [0,2,4,6,8,12,14,16,18,20,3],           // 17 — 11 likes
  [1,3,5,9,13,17,19],                     // 18 — 7 likes
  [0,2,6,10,14,18,20,4],                  // 19 — 8 likes
  [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17], // 20 — 16 likes
  [0,3,5,7,9,13,16,18,20,4],              // 21 — 10 likes
  [1,2,4,6,10,14,18],                     // 22 — 7 likes
  [0,3,7,11,15,19,2],                     // 23 — 7 likes
  [1,4,6,8,10,13,16,18,20,2,5],           // 24 — 11 likes
  [0,1,2,3,5,7,8,9,10,11,12,13,14],       // 25 — 13 likes
  [1,3,5,9,11,15,17,19,4],                // 26 — 9 likes
  [0,2,4,6,10,14,18,2],                   // 27 — 7 likes (dedup later)
  [1,3,5,7,9,11,13,15,17,19,20],          // 28 — 11 likes
  [0,2,4,6,8,10,12,14,16,18,20,3,5],      // 29 — 13 likes
  [1,3,5,7,9,11,14,16,18,20],             // 30 — 10 likes
  [0,2,4,6,10,14,18],                     // 31 — 7 likes
  [1,3,7,11,15,2],                        // 32 — 6 likes
  [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], // 33 — 17 likes
  [0,1,3,5,7,9,11,13,14,16,18,20,2,4,6],  // 34 — 15 likes
  [1,2,4,6,8,10,14,16,18,5],              // 35 — 10 likes
  [0,1,3,5,7,9,11,15,17,19,20,4],         // 36 — 12 likes
  [0,2,3,4,5,6,7,8,9,10,11,13,14,16,18,20], // 37 — 16 likes
  [0,1,2,3,5,7,9,11,13,15,17,19,20,4],    // 38 — 14 likes
  [0,2,4,6,8,10,14,16,18,20,1],           // 39 — 11 likes
];

// Comments: rec_idx → [{user_idx, content}]
const COMMENTS = {
  0:  [
    { user_idx: 0,  content: "Confermo! Lo conosco da anni, uno dei migliori dentisti di Torino." },
    { user_idx: 3,  content: "Grazie per il consiglio, l'ho già chiamato e ho preso appuntamento per la settimana prossima!" },
  ],
  3:  [
    { user_idx: 1,  content: "Anch'io ci vado da lui, è davvero eccezionale. Mai avuto problemi." },
    { user_idx: 7,  content: "Lo uso da quando mi sono trasferita a Torino, ottima raccomandazione!" },
    { user_idx: 5,  content: "Mi dai il numero? Non riesco a trovarlo online" },
  ],
  9:  [
    { user_idx: 3,  content: "Studio Legale Martinelli mi ha salvato in una vertenza con un fornitore. Confermo assolutamente." },
    { user_idx: 10, content: "Un po' cari ma quando hai un problema serio non guardi il prezzo, eh." },
  ],
  14: [
    { user_idx: 1,  content: "Confermo! Sala è il migliore per le partite IVA, lo uso anch'io da 3 anni." },
    { user_idx: 7,  content: "L'ho contattato la settimana scorsa, in attesa del primo appuntamento. Sembra molto disponibile." },
    { user_idx: 10, content: "Ho risparmiato un sacco sulle tasse grazie a lui il primo anno. Vale ogni centesimo." },
  ],
  15: [
    { user_idx: 0,  content: "Studio Brero è ottimo, li ho usati per la mia srl. Professionali e veloci." },
    { user_idx: 3,  content: "Un po' cari ma ne vale la pena per la qualità del servizio." },
  ],
  20: [
    { user_idx: 1,  content: "Impossibile trovare appuntamento ma quando ci riesci vale tutto, confermo." },
    { user_idx: 3,  content: "È davvero bravo, concordo pienamente. Finalmente un medico che ti ascolta." },
    { user_idx: 5,  content: "Ho aspettato 2 mesi per il primo appuntamento ma poi è diventato il mio medico fisso." },
  ],
  25: [
    { user_idx: 0,  content: "Li ho chiamati stamattina, arrivano domani. Grazie mille per il consiglio!" },
    { user_idx: 3,  content: "Confermato, intervengono davvero in giornata. Ottimo servizio soprattutto nei weekend." },
  ],
  26: [
    { user_idx: 1,  content: "Mario è una persona serissima. Prezzo onesto e lavoro fatto bene." },
    { user_idx: 5,  content: "Lo conosco di persona, è davvero affidabile. Consigliato a tutti." },
  ],
  29: [
    { user_idx: 1,  content: "Rosario è il mio punto di riferimento da anni per tutto ciò che riguarda l'elettricità." },
    { user_idx: 10, content: "Grazie! L'ho chiamato e viene giovedì per un preventivo." },
  ],
  33: [
    { user_idx: 0,  content: "Ci sono stato il mese scorso per una cena importante, fantastico davvero." },
    { user_idx: 3,  content: "Il tajarin al tartufo è leggendario, un piatto che non dimentichi." },
    { user_idx: 7,  content: "Prenotate con almeno 2 settimane di anticipo, specialmente nel weekend!" },
    { user_idx: 10, content: "Uno dei migliori ristoranti di Torino senza dubbio. Ci si torna sempre." },
  ],
  34: [
    { user_idx: 3,  content: "Osteria del Borgo è il mio posto preferito per le serate informali. Atmosfera perfetta." },
    { user_idx: 9,  content: "I prezzi sono ottimi per la qualità! Ci vado almeno una volta al mese." },
  ],
  37: [
    { user_idx: 0,  content: "Marco Ferrante è fantastico! Anche io ho ottenuto risultati pazzeschi in soli 3 mesi." },
    { user_idx: 7,  content: "Che bei risultati! Devo assolutamente contattarlo, ho bisogno di un trainer serio." },
    { user_idx: 3,  content: "Seguo già Marco da 6 mesi, trasforma letteralmente il tuo fisico. Super consigliato." },
  ],
  38: [
    { user_idx: 1,  content: "FitTorino è la palestra migliore della zona, confermo tutto quello che hai scritto." },
    { user_idx: 5,  content: "Il prezzo del mensile è davvero competitivo rispetto alle altre palestre di Torino." },
  ],
  1:  [
    { user_idx: 0,  content: "Lo studio Ferraro è di altissimo livello, vale ogni euro." },
    { user_idx: 5,  content: "Concordo, il dottor Ferraro è il migliore che abbia mai provato." },
  ],
  8:  [
    { user_idx: 0,  content: "L'avvocata Conti ha seguito anche me, assolutamente d'accordo con questa raccomandazione!" },
    { user_idx: 3,  content: "Grazie, ho proprio bisogno di un avvocato del lavoro. La contatto questa settimana." },
  ],
};

// Requests
const REQUESTS = [
  { user_idx: 0,  content: "Cerco un buon commercialista a Torino per aprire una partita IVA, qualcuno ha consigli?", category: "commercialista", city: "Torino" },
  { user_idx: 1,  content: "Mi serve un avvocato per una controversia con il proprietario di casa a Torino. Consigli?", category: "avvocato",       city: "Torino" },
  { user_idx: 3,  content: "Qualcuno conosce un buon idraulico a Torino? Ho un problema con il riscaldamento che perde.", category: "idraulico",    city: "Torino" },
  { user_idx: 2,  content: "Cerco un dentista a Milano che faccia sbiancamento dentale a prezzi ragionevoli.", category: "dentista",       city: "Milano" },
  { user_idx: 10, content: "Sto cercando un personal trainer a Torino per allenamento funzionale, avete consigli?", category: "altro",         city: "Torino" },
  { user_idx: 5,  content: "Mi serve un buon elettricista a Torino per rifare l'impianto di casa, preventivo entro fine mese.", category: "elettricista", city: "Torino" },
  { user_idx: 7,  content: "Consigli per un bravo medico di base a Milano? Il mio si è ritirato e non so da dove iniziare.", category: "medico",     city: "Milano" },
  { user_idx: 6,  content: "Cerco consiglio per una cena di lavoro a Torino, massimo 10 persone, cucina piemontese tradizionale.", category: "altro", city: "Torino" },
];

// Replies: {req_idx, user_idx, content, rec_idx (optional, references RECS array)}
const REPLIES = [
  { req_idx: 0, user_idx: 1,  content: "Ti consiglio assolutamente il Dott. Roberto Sala in Via Cavour! Lo uso io da anni, ottimo per le partite IVA.", rec_idx: 14 },
  { req_idx: 0, user_idx: 3,  content: "Anche la Dott.ssa Anna Marro è bravissima e molto disponibile, puoi contattarla direttamente.", rec_idx: 16 },
  { req_idx: 2, user_idx: 0,  content: "Prova Idraulici Torinesi, li hanno usati i miei vicini e sono rimasti contentissimi. Lavoro pulito!", rec_idx: 28 },
  { req_idx: 4, user_idx: 1,  content: "Marco Ferrante è eccezionale! Io ho ottenuto risultati pazzeschi in soli 4 mesi. Contattalo subito!", rec_idx: 37 },
  { req_idx: 6, user_idx: 0,  content: "La Dr.ssa Luisa Botto in Corso Racconigi è disponibilissima e accetta nuovi pazienti, chiamala!", rec_idx: 21 },
  { req_idx: 7, user_idx: 13, content: "Il Ristorante Piemonte Autentico in Via Monferrato è perfetto per cene di lavoro. Cucina raffinata, ambiente elegante.", rec_idx: 33 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ago(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function ok(label, error) {
  if (error) {
    console.error(`  ✗ ${label}:`, error.message ?? error);
    return false;
  }
  console.log(`  ✓ ${label}`);
  return true;
}

// ─── Seed functions ───────────────────────────────────────────────────────────

async function createUsers() {
  console.log("\n👤 Creazione utenti...");
  const ids = [];

  for (let i = 0; i < USERS.length; i++) {
    const u = USERS[i];

    // Check if user already exists
    const { data: existingList } = await db.auth.admin.listUsers();
    const existing = existingList?.users?.find((x) => x.email === u.email);

    let userId;
    if (existing) {
      userId = existing.id;
      console.log(`  ↩ ${u.full_name} (già esistente)`);
    } else {
      const { data, error } = await db.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });
      if (!ok(`Crea ${u.full_name}`, error)) { ids.push(null); continue; }
      userId = data.user.id;
    }

    ids.push(userId);

    // Upsert profile
    const { error: profErr } = await db.from("profiles").upsert({
      id: userId,
      full_name: u.full_name,
      username: u.username,
      city: u.city,
    }, { onConflict: "id" });
    ok(`  Profilo ${u.username}`, profErr);
  }

  return ids;
}

async function createRecommendations(userIds) {
  console.log("\n📋 Creazione raccomandazioni...");
  const recIds = [];

  // Spread over past 3 months
  const totalDays = 90;

  for (let i = 0; i < RECS.length; i++) {
    const r = RECS[i];
    const uid = userIds[r.user_idx];
    if (!uid) { recIds.push(null); continue; }

    const daysAgo = Math.round((totalDays / RECS.length) * (RECS.length - i - 1)) + 2;

    const { data, error } = await db.from("recommendations").insert({
      user_id: uid,
      professional_name: r.professional_name,
      category: r.category,
      city: r.city,
      note: r.note,
      address: r.address ?? null,
      price_range: r.price_range,
      created_at: ago(daysAgo),
    }).select("id").single();

    ok(`${r.professional_name}`, error);
    recIds.push(data?.id ?? null);
  }

  return recIds;
}

async function createFollows(userIds) {
  console.log("\n🔗 Creazione follows...");
  const rows = FOLLOWS
    .filter(({ fr, fg }) => userIds[fr] && userIds[fg])
    .map(({ fr, fg }) => ({ follower_id: userIds[fr], following_id: userIds[fg] }));

  const { error } = await db.from("follows").upsert(rows, { onConflict: "follower_id,following_id", ignoreDuplicates: true });
  ok(`${rows.length} follow inseriti`, error);
}

async function createLikes(userIds, recIds) {
  console.log("\n❤️  Creazione likes...");
  const rows = [];

  for (let recIdx = 0; recIdx < LIKES.length; recIdx++) {
    const recId = recIds[recIdx];
    if (!recId) continue;

    const seen = new Set();
    for (const userIdx of LIKES[recIdx]) {
      const uid = userIds[userIdx];
      if (!uid || seen.has(uid)) continue;
      seen.add(uid);
      rows.push({ recommendation_id: recId, user_id: uid });
    }
  }

  // Insert in batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await db.from("recommendation_likes").upsert(batch, { onConflict: "recommendation_id,user_id", ignoreDuplicates: true });
    if (error) console.error("  ✗ Likes batch:", error.message);
  }
  console.log(`  ✓ ${rows.length} likes inseriti`);
}

async function createComments(userIds, recIds) {
  console.log("\n💬 Creazione commenti...");
  const rows = [];
  let delay = 0;

  for (const [recIdxStr, commentList] of Object.entries(COMMENTS)) {
    const recId = recIds[parseInt(recIdxStr)];
    if (!recId) continue;

    for (const c of commentList) {
      const uid = userIds[c.user_idx];
      if (!uid) continue;
      rows.push({
        recommendation_id: recId,
        user_id: uid,
        content: c.content,
        created_at: ago(Math.max(1, 30 - delay++)),
      });
    }
  }

  const { error } = await db.from("comments").insert(rows);
  ok(`${rows.length} commenti inseriti`, error);
}

async function createRequests(userIds) {
  console.log("\n❓ Creazione richieste...");
  const reqIds = [];

  for (let i = 0; i < REQUESTS.length; i++) {
    const r = REQUESTS[i];
    const uid = userIds[r.user_idx];
    if (!uid) { reqIds.push(null); continue; }

    const { data, error } = await db.from("requests").insert({
      user_id: uid,
      content: r.content,
      category: r.category,
      city: r.city,
      created_at: ago(20 - i * 2),
    }).select("id").single();

    ok(`Richiesta: "${r.content.slice(0, 50)}…"`, error);
    reqIds.push(data?.id ?? null);
  }

  return reqIds;
}

async function createReplies(userIds, reqIds, recIds) {
  console.log("\n↩️  Creazione risposte alle richieste...");
  const rows = [];

  for (const rep of REPLIES) {
    const reqId = reqIds[rep.req_idx];
    const uid   = userIds[rep.user_idx];
    const recId = rep.rec_idx != null ? recIds[rep.rec_idx] : null;
    if (!reqId || !uid) continue;

    rows.push({
      request_id: reqId,
      user_id: uid,
      content: rep.content,
      recommendation_id: recId ?? null,
    });
  }

  const { error } = await db.from("request_replies").insert(rows);
  ok(`${rows.length} risposte inserite`, error);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Filo — Seed Demo Database");
  console.log("━".repeat(40));

  const userIds = await createUsers();
  const recIds  = await createRecommendations(userIds);
  await createFollows(userIds);
  await createLikes(userIds, recIds);
  await createComments(userIds, recIds);
  const reqIds  = await createRequests(userIds);
  await createReplies(userIds, reqIds, recIds);

  console.log("\n✅ Seed completato!");
  console.log(`   Utenti: ${userIds.filter(Boolean).length}`);
  console.log(`   Raccomandazioni: ${recIds.filter(Boolean).length}`);
  console.log(`   Richieste: ${reqIds.filter(Boolean).length}`);
  console.log("\n   Protagonista: marco.rossi.filo@gmail.com / Demo1234!");
}

main().catch((e) => { console.error(e); process.exit(1); });
