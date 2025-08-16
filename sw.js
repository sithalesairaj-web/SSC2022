const CACHE_NAME = 'ssc-batch-2022-cache-v1';
// Add any other assets that need to be cached for offline use.
// Note: Dynamic imports and external scripts (like tailwind) are fetched from the network.
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com'
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll to fetch and cache all the specified resources.
        // If any resource fails to fetch, the entire operation fails.
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If a cached version is found, return it.
        if (response) {
          return response;
        }
        // Otherwise, fetch the request from the network.
        return fetch(event.request).then(
          networkResponse => {
            // Optionally, you can cache the newly fetched resources here.
            // Be careful with what you cache, especially with third-party URLs.
            return networkResponse;
          }
        );
      })
  );
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
