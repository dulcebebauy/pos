const CACHE_NAME = "pos-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192x192.png"
];

// 🔥 instalación
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 🔥 activar y limpiar versiones viejas
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// 🔥 estrategia cache-first (rápido)
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // 👉 API (network first)
  if (url.search.includes("action=productos")) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(e.request, clone)
          );
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 👉 resto (cache first)
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
