const CACHE_NAME = "filo-v1";

const PRECACHE_URLS = [
  "/feed",
  "/cerca",
  "/requests",
  "/profile",
  "/filo-logo-3d.png",
  "/filo-logo-square.svg",
];

// ─── Install: precache le pagine principali ───────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
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
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignora richieste non-GET e API Supabase
  if (request.method !== "GET") return;
  if (request.url.includes("supabase.co")) return;
  if (request.url.includes("mapbox.com") || request.url.includes("mapbox.cn")) return;

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

  // Asset statici: cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
