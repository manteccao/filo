# Filo — Context Document

## Cos'è Filo

Filo è un social network della fiducia. L'idea centrale: trovare professionisti (dentisti, avvocati, commercialisti, idraulici…) non cercando su Google, ma chiedendo alla propria rete di contatti. Le raccomandazioni hanno valore solo se vengono da persone reali che conosci.

Il nome "Filo" evoca il filo che connette le persone — la catena di fiducia che porta da te al professionista giusto attraverso amici e conoscenti.

**URL produzione:** https://filo-kappa.vercel.app
**Repository:** https://github.com/manteccao/filo
**Stack deploy:** Vercel (frontend) + Supabase (backend)

---

## Stack Tecnico

| Layer | Tecnologia |
|---|---|
| Framework | Next.js 16.2.0 — App Router (server + client components, server actions) |
| Auth | Supabase Auth via `@supabase/ssr` (cookie-based SSR) |
| Database | Supabase (PostgreSQL) con Row Level Security |
| Storage | Supabase Storage — bucket `avatars` per foto profilo |
| Styling | Tailwind CSS v4 (PostCSS) |
| UI Components | shadcn/ui (Radix, nova preset) — Button, Card, Avatar, Badge, Sheet |
| Animazioni | Framer Motion — fade-in card, whileTap button, AnimatePresence menu |
| Language | TypeScript |

### Dipendenze principali
- `@supabase/ssr` `@supabase/supabase-js`
- `next` `react` `react-dom`
- `framer-motion`
- `shadcn` `radix-ui` `class-variance-authority` `tailwind-merge`
- `lucide-react`
- `vaul`

---

## Struttura File Chiave

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          — Login form (server action)
│   │   ├── register/page.tsx       — Registrazione (server action)
│   │   ├── forgot-password/page.tsx — Recupero password
│   │   └── actions.ts              — signIn, signUp server actions
│   ├── auth/
│   │   └── reset-password/page.tsx — Reset password post-email
│   ├── feed/
│   │   ├── page.tsx                — Server component: carica items, profili, follows
│   │   ├── FeedClient.tsx          — Client component: PostCard, FeedRequestCard, Sheets
│   │   └── actions.ts              — deleteRecommendation, updateRecommendation
│   ├── add/page.tsx                — Form aggiunta raccomandazione (server action)
│   ├── requests/page.tsx           — Sezione richieste (client component)
│   ├── profile/page.tsx            — Profilo utente (client component)
│   ├── settings/page.tsx           — Settings: avatar, password, inviti
│   ├── users/page.tsx              — Ricerca utenti / follow
│   ├── onboarding/page.tsx         — Onboarding 3 step per nuovi utenti
│   ├── invite/[username]/page.tsx  — Landing page invito virale pubblica
│   └── p/[username]/page.tsx       — Profilo pubblico condivisibile
├── components/
│   ├── BottomNav.tsx               — Navbar mobile 5 tab
│   └── ui/                         — Componenti shadcn (button, card, avatar, badge, sheet, drawer)
└── lib/
    ├── supabase/
    │   ├── browser.ts              — createBrowserClient
    │   └── server.ts               — createServerClient (cookie)
    └── utils.ts                    — cn() da shadcn
```

---

## Database Supabase

### Tabelle

| Tabella | Descrizione |
|---|---|
| `profiles` | id, full_name, city, username, avatar_url |
| `recommendations` | id, user_id, professional_name, category, city, note, address, price_range, created_at |
| `follows` | follower_id, following_id |
| `comments` | id, recommendation_id, user_id, content, created_at |
| `requests` | id, user_id, content, category, city, created_at |
| `request_replies` | id, request_id, user_id, content, recommendation_id (FK opzionale), created_at |

### View
- `comments_with_profile` — comments JOIN profiles (aggiunge full_name)
- `requests_with_profile` — requests JOIN profiles (aggiunge full_name)
- `request_replies_with_profile` — request_replies JOIN profiles JOIN recommendations

### Storage
- Bucket `avatars` — foto profilo in `avatars/{userId}/avatar.{ext}`

---

## Funzionalità Costruite

### Autenticazione
- Registrazione con email/password + nome + città
- Login con redirect post-login a `/feed`
- Recupero password via email (link a `/auth/reset-password`)
- Cambio password dal profilo con re-autenticazione

### Feed Unificato
- Scroll di raccomandazioni + richieste ordinate cronologicamente
- Filtro "Tutti" / "Seguiti"
- **PostCard** (raccomandazioni): avatar, nome, badge grado connessione (1°/2°/Community), nome professionista bold, categoria teal, città, indirizzo opzionale, fascia prezzo (€/€€/€€€ con colori), nota personale, like locale, commenti reali, condivisione
- **FeedRequestCard** (richieste): bordo viola, icona "?", "sta cercando…", testo richiesta, categoria/città viola, bottone "Rispondi"
- Badge gradi di connessione: verde 1° grado (follows diretti), arancione 2° grado (follows dei follows), grigio Community

### Commenti
- Drawer Sheet dal basso con lista commenti
- Avatar con iniziali e colori deterministici
- Input textarea con autofocus, invio con Enter
- Aggiornamento contatore real-time
- Dati da view `comments_with_profile`

### Raccomandazioni
- Form aggiunta: nome professionista, categoria, città, indirizzo (opzionale), fascia prezzo (opzionale), nota personale (max 300 caratteri)
- Edit inline nel feed (solo owner)
- Delete con conferma (solo owner)
- Categorie: dentista, medico, avvocato, commercialista, idraulico, elettricista, altro

### Richieste
- Sezione dedicata `/requests`
- Form creazione: testo "cosa cerchi" (max 200 car.), categoria, città
- Lista richieste ordinate per data
- Drawer risposte con possibilità di allegare una propria raccomandazione
- Delete richiesta (solo owner)

### Social Graph
- Follow/unfollow utenti
- Badge gradi di connessione calcolati da `follows`
- Pagina `/users` per ricerca e scoperta utenti

### Profilo
- Avatar caricabile (Supabase Storage)
- Contatori following/followers
- Lista raccomandazioni personali
- Pagina pubblica condivisibile `/p/[username]`

### Onboarding
- 3 step: benvenuto → prima raccomandazione → invita amici WhatsApp
- Progress bar, skippabile

### Inviti Virali
- Link invito personale `/invite/[username]`
- Landing page pubblica con nome invitante
- Bottone CTA → `/register`
- WhatsApp share sia in onboarding che in settings

### Settings
- Upload avatar con anteprima
- Cambio password con re-autenticazione
- Bottone condividi profilo
- Bottone invita amici (WhatsApp)
- Logout

---

## Design System

### Tema
- **Sempre dark** — `background: #0a0a0a`, card `#111111`, border `#1F2937`
- CSS variables Tailwind/shadcn impostate al dark di default (nessuna `.dark` class)
- Font: system-ui / -apple-system

### Palette
| Uso | Colore |
|---|---|
| Primario (raccomandazioni) | Teal gradient `#0D9488 → #06B6D4` |
| Secondario (richieste) | Violet `#8B5CF6` |
| Testo primario | `#ffffff` |
| Testo secondario | `#9CA3AF` |
| Border | `#1F2937` |
| Like attivo | Rosso `text-red-500` |
| 1° grado | `from-emerald-500 to-teal-500` |
| 2° grado | `from-amber-500 to-orange-400` |

### Layout
- Max width `430px` centrata (design mobile-first)
- `BottomNav` fissa a 5 tab: Home, Cerca, + (add), Richieste, Profilo
- Header sticky `h-12` su ogni pagina

### Componenti shadcn usati
- `Card`, `CardContent`, `CardFooter` — card feed
- `Avatar`, `AvatarFallback` — tutti gli avatar (gradient + iniziali)
- `Badge` — categorie, gradi connessione, fasce prezzo
- `Button` — CTA principali con varianti (default, outline, ghost)
- `Sheet` (side="bottom") — drawer commenti, richieste, form nuova richiesta

### Animazioni (Framer Motion)
- Card feed: `opacity 0→1, y 24→0` con stagger `index × 60ms`
- Menu tre puntini: `scale + opacity` con `AnimatePresence`
- Confirm delete: `height 0→auto`
- Bottoni CTA: `whileTap={{ scale: 0.97 }}`
- Bottoni icona: `whileTap={{ scale: 0.88 }}`

---

## Funzionalità da Costruire

### Alta priorità
- [ ] **Likes reali** — tabella `likes` su Supabase, contatore persistente
- [ ] **Notifiche** — tabella `notifications`, banner in-app quando qualcuno risponde a una richiesta o commenta
- [ ] **Ricerca avanzata** — filtro nel feed per categoria + città + fascia prezzo
- [ ] **Profilo professionista** — pagina aggregata con tutte le raccomandazioni per un professionista

### Media priorità
- [ ] **Onboarding migliorato** — suggerire persone da seguire dopo registrazione
- [ ] **Deep link richiesta** — URL diretto a una richiesta specifica
- [ ] **Paginazione/infinite scroll** — il feed ora carica tutto, serve limit + offset
- [ ] **Elimina commento** — bottone elimina sul proprio commento
- [ ] **Modifica richiesta** — edit del testo richiesta

### Bassa priorità / Futuro
- [ ] **Push notification** — tramite Supabase Realtime o servizio esterno
- [ ] **Hashtag/tag liberi** — oltre alle categorie predefinite
- [ ] **Mappa** — visualizzazione geografica dei professionisti
- [ ] **Verifica professionista** — badge "verificato" con link esterno
- [ ] **PWA** — manifest + service worker per installazione su mobile

---

## Decisioni di Design Prese

- **No light mode** — app sempre dark, CSS variables impostate di default al tema scuro
- **No ORM** — query Supabase dirette con il client JS
- **No Redux/Zustand** — stato locale con `useState`, dati fetchati al mount
- **Feed unificato** — raccomandazioni e richieste nello stesso scroll, mescolate per data
- **Drawer dal basso** — Sheet Radix `side="bottom"` per commenti/risposte, accessibile (focus trap, Escape) invece di div custom
- **Avatar deterministici** — colore calcolato da hash del nome, iniziali come fallback
- **Likes solo locali** (per ora) — toggle visuale senza persistenza DB, in attesa di tabella `likes`
- **Categorie fisse** — lista predefinita invece di tag liberi, per semplicità UX iniziale
- **Profilo sempre client component** — avatar upload e cambio password richiedono browser Supabase client
