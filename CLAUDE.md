# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # start dev server (localhost:3000)
npm run build      # production build — run this after every non-trivial change to catch type/compile errors
npm run lint       # ESLint
```

There are no automated tests. Validate changes by running `npm run build` successfully.

## Architecture

**Filo** is an Italian social network for trusted professional recommendations. Users share and discover professionals (dentists, lawyers, plumbers…) through their social graph.

- **Stack:** Next.js 16.2 App Router · Supabase (Postgres + Auth + Storage) · Tailwind CSS v4 · Framer Motion · shadcn/ui
- **Deploy:** Vercel (frontend) + Supabase (backend). The `CAPACITOR_BUILD=1` env var switches to static export for iOS/Android builds via Capacitor.

### Supabase client selection — critical

Three clients exist and must be used in the right context:

| Client | File | When to use |
|---|---|---|
| Server (cookie-based, RLS active) | `@/lib/supabase/server` | Server Components, Server Actions, Route Handlers |
| Browser (cookie-based, RLS active) | `@/lib/supabase/browser` | Client Components (`"use client"`) |
| Admin (service role, bypasses RLS) | `@/lib/supabase/server` → `createAdminClient()` | Server-only, privileged ops only |

There is also `@/lib/supabase/client` which is an alias for the browser client used in older form components.

### Page architecture

Tab pages (`/feed`, `/cerca`, `/requests`, `/profile`) are kept permanently mounted in the DOM by **`TabShell`** (`src/components/TabShell.tsx`) using `display:none` to hide inactive tabs. This preserves state and avoids refetching when switching tabs. Non-tab routes (`/add`, `/settings`, `/p/[username]`…) render normally.

The root layout (`src/app/layout.tsx`) is a Server Component. `SplashScreen` and `OneSignalInit` are deferred via `DeferredShell` (a client component) to keep them out of the initial JS parse.

### Data fetching patterns

- **Feed (`/feed/page.tsx`):** Server Component that runs two parallel `Promise.all` batches (auth → core data → profiles+likes in one batch) then passes typed props to `FeedClient`.
- **Client components:** Fetch directly from Supabase browser client in `useEffect`, or call Server Actions for mutations.
- **In-memory cache:** `src/lib/page-cache.ts` provides `cacheGet/cacheSet/cacheInvalidate` with a 5-minute TTL for client-side caching of repeated reads.

### Performance patterns already in place

- `NotificationsDrawer` and `ReportDialog` in FeedClient are lazy-loaded with `next/dynamic`.
- **`CityAutocomplete`** lazy-loads `fuse.js` + `src/lib/cities.ts` (134 KB) on the first keystroke — do not revert to eager import.
- `next.config.ts` has `optimizePackageImports: ["framer-motion", "lucide-react"]`.
- `BottomNav` calls `router.prefetch()` for all tab routes on mount.

### Database schema (key tables)

| Table | Purpose |
|---|---|
| `profiles` | `id, full_name, city, username, avatar_url, account_type` |
| `recommendations` | `id, user_id, professional_id (nullable), professional_name, category, city, note, address, price_range` |
| `follows` | `follower_id, following_id` |
| `notifications` | `id, user_id, type, actor_id, recommendation_id, request_id, read` |
| `requests` | `id, user_id, content, category, city` |
| `request_replies` | `id, request_id, user_id, content, recommendation_id (nullable)` |
| `blocks` | `user_id, blocked_user_id` |
| `saves` | `user_id, recommendation_id` |
| `recommendation_likes` | `user_id, recommendation_id` |

Views: `comments_with_profile`, `requests_with_profile`, `request_replies_with_profile` — JOINs that add `full_name` and profile data.

Supabase Storage: bucket `avatars`, path `avatars/{userId}/avatar.{ext}`.

### Design system

- **Always dark** — no light mode, no `.dark` class toggle. Background `#0a0a0a`, cards `#111111`, borders `#1a1a1a`.
- Primary accent: teal `#0D9488`. Requests use violet `#8B5CF6`.
- Mobile-first, max-width `430px` centered. Fixed `BottomNav` (72px) + safe-area inset.
- Avatar colors are **deterministic** — hashed from the user's ID, not stored. Initials as fallback.
- Connection degree badges: 1° green (`emerald→teal`), 2° orange (`amber→orange`), Community grey.
- Framer Motion conventions: `whileTap={{ scale: 0.97 }}` for CTA buttons, `whileTap={{ scale: 0.88 }}` for icon buttons, `layoutId` for animated tab indicators.
