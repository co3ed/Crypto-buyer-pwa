const CACHE_NAME = "crypto-buyer-cache-v2"; // Versioned cache name
const urlsToCache = [
  "/",
  "index.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  // add other assets like CSS, JS, etc.
];

// Install the service worker and cache assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching assets");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate the service worker and clean up old caches
self.addEventListener("activate", (e) => {
  const cacheWhitelist = [CACHE_NAME]; // Keep only the latest cache

  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            // Delete old cache
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Serve cached files and update cache when necessary
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Serve from cache if available, else fetch from network
      return (
        cachedResponse ||
        fetch(e.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Update the cache with the new version of the file
            cache.put(e.request, response.clone());
            return response;
          });
        })
      );
    })
  );
});

// Handle update messages from the page
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting(); // Force the new version of the service worker to take control immediately
  }
});