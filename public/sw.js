const CACHE_NAME = "filo-v2";

const PRECACHE_ASSETS = [
  "/filo-logo-new.png",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
];

// ─── Install: precache asset statici ─────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(PRECACHE_ASSETS.map((url) => cache.add(url)))
      )
  );
  self.skipWaiting();
});

// ─── Activate: rimuovi vecchie cache ─────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = request.url;

  // Ignora richieste non-GET
  if (request.method !== "GET") return;

  // Ignora API Supabase (sempre network, mai cache)
  if (url.includes("supabase.co")) return;
  if (url.includes("mapbox.com") || url.includes("mapbox.cn")) return;
  if (url.includes("googleapis.com") || url.includes("googletagmanager.com")) return;

  // Asset statici Next.js (_next/static): cache-first (sono immutabili, hash nel nome)
  if (url.includes("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // Immagini e font: cache-first con fallback network
  if (
    url.includes("/_next/image") ||
    /\.(png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf|otf)(\?|$)/.test(url)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // Navigazione (pagine HTML): network-first, fallback cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Tutto il resto: network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
