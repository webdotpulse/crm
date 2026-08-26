/**
 * PulseWork CRM — Progressive Web App Service Worker
 * Strategies: Cache-First for static bundles, Stale-While-Revalidate for app shell and GET requests
 */

const CACHE_NAME = 'pulsework-cache-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
]

// 1. Install & pre-cache critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      return self.skipWaiting()
    })
  )
})

// 2. Activate & cleanup outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// 3. Fetch interceptor
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Only handle GET requests with cache
  if (request.method !== 'GET') {
    return
  }

  // SSE stream bypass
  if (url.pathname.includes('/api/events.php')) {
    return
  }

  // Cache-First for static assets (JS, CSS, Fonts, Images)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return networkResponse
        })
      })
    )
    return
  }

  // Stale-While-Revalidate for application shell & GET API data
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // If offline and request is HTML navigation, return cached root/index.html
          if (request.mode === 'navigate') {
            return caches.match('/index.html')
          }
          return cachedResponse
        })

      return cachedResponse || fetchPromise
    })
  )
})
