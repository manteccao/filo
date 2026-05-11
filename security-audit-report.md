# Security Audit Report — Filo
**Data:** 2026-05-11
**Scope:** Full pre-launch security audit (Next.js 16.2 + Supabase + Vercel)
**Auditor:** Security Auditor Agent

---

## Riepilogo Esecutivo

| Categoria | Stato | Note |
|---|---|---|
| Autenticazione | ✅ PASS | Google OAuth PKCE, sessione cookie-based |
| Autorizzazione | ✅ PASS | Tutti i Server Action verificati |
| Protezione rotte | ✅ FIXED | Aggiunto proxy edge (era assente) |
| Data Exposure | ✅ FIXED | Messaggi errore auth sanitizzati |
| Injection (SQL/XSS) | ✅ PASS | Nessuna vulnerabilità trovata |
| Rate Limiting | ✅ FIXED | Aggiunto rate limit su /api/push |
| Security Headers | ✅ PASS | Aggiunti nella sessione precedente |
| Segreti | ✅ PASS | .env.local gitignored |

---

## 1. AUTENTICAZIONE

### 1.1 Google OAuth
**Stato: ✅ PASS**

- Implementato via `supabase.auth.signInWithOAuth({ provider: "google" })`
- `redirectTo` hardcoded a `https://filo.network/auth/callback` (non user-supplied → no open redirect)
- `prompt: "select_account"` forza la scelta account Google
- GDPR consent gate (checkbox obbligatorio) prima del login
- Il callback (`/auth/callback`) gestisce sia il flusso PKCE (`exchangeCodeForSession`) sia il flusso implicit (hash-based), con validazione via `supabase.auth.getUser()` prima del redirect finale

**⚠️ WARNING (non bloccante):** Il fallback implicit usa un `setTimeout(1000)` come attesa — fragile. Supabase consiglia di usare esclusivamente PKCE. Non è un rischio immediato perché Supabase gestisce il token, ma vale la pena migrare a PKCE-only in futuro.

### 1.2 Gestione Sessione
**Stato: ✅ PASS**

- Sessione gestita via cookie HTTP dal package `@supabase/ssr`
- Il proxy edge (`src/proxy.ts`) chiama `supabase.auth.getUser()` ad ogni richiesta alle rotte private, refreshando automaticamente il token JWT
- `createAdminClient()` usa `persistSession: false` — nessuna sessione privilegiata persistita

### 1.3 Logout
**Stato: ✅ PASS**

- `supabase.auth.signOut()` lato client (Settings) revoca la sessione lato Supabase
- `/auth/signout` (POST route) fa lo stesso lato server
- Dopo il signout, redirect a `/login` — nessun dato residuo nella memoria del browser oltre a quanto gestito da Supabase

---

## 2. AUTORIZZAZIONE

### 2.1 Server Actions — Verifica auth.uid()
**Stato: ✅ PASS — 13/13 actions verificate**

Tutti i Server Action chiamano `supabase.auth.getUser()` prima di qualsiasi operazione su DB:

| File | Actions verificate |
|---|---|
| `add/actions.ts` | `addRecommendation` |
| `feed/actions.ts` | `deleteRecommendation`, `toggleLike`, `toggleSave`, `loadMoreFeedItems`, `updateRecommendation` |
| `settings/actions.ts` | `deleteAccount` |
| `moderation/actions.ts` | `blockUser`, `unblockUser`, `reportContent` |
| `users/actions.ts` | `followUser`, `unfollowUser` |
| `notifications/actions.ts` | `getUnreadCount` |

### 2.2 Ownership Enforcement
**Stato: ✅ PASS**

Tutte le mutation verificano che l'utente possieda il dato prima di modificarlo:
- `deleteRecommendation`: `.eq("user_id", user.id)` — un utente non può cancellare raccomandazioni altrui
- `updateRecommendation`: `.eq("user_id", user.id)` — idem per modifica
- `deleteAccount`: usa `uid = user.id` per tutte le deletion
- `blockUser/unblockUser`: `.eq("user_id", user.id)`
- `deleteComment` (client-side): `.eq("user_id", currentUserId)`

### 2.3 Admin Client (Service Role)
**Stato: ✅ PASS**

`createAdminClient()` (bypassa RLS) è usato solo in `deleteAccount()`, chiamato da un Server Action dopo verifica `auth.getUser()`. Non è mai esposto lato client né in route handler pubblici.

### 2.4 RLS Supabase
**Stato: ⚠️ WARNING — Non verificabile da codebase**

Le RLS policy sono definite su Supabase (non nel codebase). I pattern di query nel codice suggeriscono che le RLS siano presenti per le tabelle principali. Prima del lancio verificare su Supabase Dashboard che esistano policy su:

| Tabella | Policy attesa |
|---|---|
| `profiles` | SELECT pubblico; UPDATE solo `auth.uid() = id` |
| `recommendations` | SELECT pubblico (anon); INSERT/UPDATE/DELETE solo owner |
| `follows` | INSERT solo `auth.uid() = follower_id` |
| `notifications` | SELECT solo `auth.uid() = user_id` |
| `blocks` | INSERT/DELETE solo `auth.uid() = user_id` |
| `saves` | INSERT/DELETE solo `auth.uid() = user_id` |
| `recommendation_likes` | INSERT/DELETE solo `auth.uid() = user_id` |
| `reports` | INSERT solo `auth.uid() = user_id` |
| `comments` | UPDATE (soft-delete) solo `auth.uid() = user_id` |

---

## 3. PROTEZIONE ROTTE

### 3.1 Proxy Edge Middleware
**Stato: ✅ FIXED** *(era: ❌ FAIL)*

**Problema identificato:** Nessun `middleware.ts`/`proxy.ts` era presente. Le rotte private (`/feed`, `/cerca`, `/add`, `/settings`, `/profile`, `/requests`, `/onboarding`) erano protette solo a livello di Server Component (via `redirect()`) o client-side (`useEffect`). Senza protezione edge, un utente non autenticato poteva ricevere l'HTML shell di una pagina privata.

**Fix applicato:** Creato `src/proxy.ts` (Next.js 16.2) che:
- Intercetta ogni richiesta alle rotte private
- Chiama `supabase.auth.getUser()` per validare la sessione JWT
- Redirige a `/login` se non autenticato
- Refresha il token di sessione se necessario (pattern consigliato Supabase SSR)

---

## 4. DATA EXPOSURE

### 4.1 Chiavi segrete
**Stato: ✅ PASS**

- `SUPABASE_SERVICE_ROLE_KEY` è in `.env.local`, che è coperto da `.gitignore` (regola `.env*`)
- Nessun segreto è stato trovato in file sorgente versionati
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` è correttamente prefissata `NEXT_PUBLIC_` (anon key, sicura da esporre)

### 4.2 Email di altri utenti
**Stato: ✅ PASS**

Le query non espongono email di altri utenti nel feed o in nessun componente pubblico. La `profiles` table usa `full_name`, `username`, `city` — nessun campo email.

### 4.3 dangerouslySetInnerHTML
**Stato: ✅ PASS**

Tre usi trovati, tutti sicuri:
- `layout.tsx`: Google Analytics script (stringa hardcoded)
- `layout.tsx`: Service Worker registration (stringa hardcoded)
- `page.tsx`: JSON-LD schema `orgJsonLd` (oggetto server-side hardcoded, nessun input utente)

Nessun `dangerouslySetInnerHTML` con user input.

### 4.4 Messaggi di errore
**Stato: ✅ FIXED** *(era: ⚠️ WARNING)*

**Problema identificato:** `(auth)/actions.ts` passava `error.message` raw da Supabase in query params, rischiando di esporre messaggi interni (es. PostgreSQL constraint violations). Idem `profileError.message` per errori di creazione profilo.

**Fix applicato:**
- Errori `signIn`: mappati a `"Credenziali non valide. Riprova."`
- Errori `signUp`: mappati a messaggi user-friendly (`"Email già registrata."` o `"Registrazione non riuscita."`)
- Errori profilo (non-duplicate): mappati a `"Errore durante la registrazione. Riprova."`

---

## 5. INJECTION

### 5.1 SQL Injection
**Stato: ✅ PASS**

Supabase usa il layer PostgREST con query parametrizzate. Nessuna concatenazione di stringhe nelle query. Non vulnerabile a SQL injection.

### 5.2 XSS
**Stato: ✅ PASS**

- React JSX auto-escapa tutto il contenuto text (nomi, note, commenti, categorie)
- Nessun `dangerouslySetInnerHTML` con user input
- Error messages visualizzati come JSX children (auto-escaped)
- `toProSlug()`, `encodeURIComponent()` usati correttamente per URL

### 5.3 Open Redirect
**Stato: ✅ PASS**

- `/auth/signout` redirige a `/login` hardcoded
- `errorRedirect()` usa path hardcoded (`"/register"`, `"/login"`)
- OAuth `redirectTo` hardcoded a `https://filo.network/auth/callback`

---

## 6. RATE LIMITING

| Endpoint/Action | Limite | Stato |
|---|---|---|
| `addRecommendation` | 10 rec/24h per utente | ✅ PASS |
| `toggleLike` | 100 like/24h per utente | ✅ PASS |
| `reportContent` | 20 segnalazioni/24h per utente | ✅ PASS |
| `/api/push` | 50 push/ora per utente | ✅ FIXED |
| Auth (signIn/signUp) | Gestito da Supabase | ✅ PASS |
| `followUser` | Nessun limite | ⚠️ WARNING |

**Fix applicato su `/api/push`:** Aggiunto rate limit basato su `notifications.actor_id` (max 50 notifiche generate/ora). Restituisce `429 Too Many Requests` se superato.

**⚠️ WARNING (followUser):** Nessun rate limit su `followUser`/`unfollowUser`. Un bot autenticato potrebbe inviare follow/unfollow in loop generando spam di notifiche. Raccomandato aggiungere un limite (es. 100 follow/24h) prima di una crescita significativa della base utenti.

---

## 7. SECURITY HEADERS

**Stato: ✅ PASS** *(aggiunti in sessione precedente)*

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**⚠️ WARNING — Header mancanti:**
- **Content-Security-Policy (CSP):** Non presente. Aggiungerebbe protezione XSS in-depth. Complesso da configurare con Next.js (nonce per script inline), ma consigliato per il futuro.
- **Strict-Transport-Security (HSTS):** Non nel codebase, ma Vercel lo aggiunge automaticamente su domini custom con HTTPS. Verificare tramite `curl -I https://filo.network`.

---

## 8. GDPR / COMPLIANCE

**Stato: ✅ PASS**

- Checkbox di consenso obbligatoria prima del login Google
- Link a Privacy Policy e Termini e Condizioni nella login page
- `deleteAccount` elimina completamente tutti i dati utente (profilo, raccomandazioni, commenti, follow, like, notifiche, blocchi, segnalazioni) + utente auth
- Pagine `/privacy` e `/terms` presenti

---

## Azioni Consigliate Post-Lancio

| Priorità | Azione |
|---|---|
| Alta | Verificare RLS policy su Supabase Dashboard per tutte le tabelle elencate sopra |
| Alta | Aggiungere rate limit su `followUser` (100 follow/24h) |
| Media | Migrare auth callback a PKCE-only (rimuovere fallback implicit + setTimeout) |
| Media | Aggiungere Content-Security-Policy header |
| Bassa | Configurare Supabase Auth Rate Limits nel Dashboard (email OTP, magic link) |
| Bassa | Attivare Supabase Leaked Password Detection |

---

## Fix Applicati in Questo Audit

| File | Cambiamento |
|---|---|
| `src/proxy.ts` (NUOVO) | Proxy edge per protezione server-side di tutte le rotte private |
| `src/app/api/push/route.ts` | Rate limit 50 push/ora per utente autenticato |
| `src/app/(auth)/actions.ts` | Messaggi errore sanitizzati (no leakage di errori interni Supabase/PostgreSQL) |
