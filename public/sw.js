// Service Worker - DESHABILITADO EN DESARROLLO
// Este archivo se desregistra automáticamente en localhost
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1'

if (isDevelopment) {
  // En desarrollo: desregistrar inmediatamente
  self.addEventListener('install', (event) => {
    self.skipWaiting()
    event.waitUntil(
      self.registration.unregister().then(() => {
        console.log('Service Worker desregistrado en desarrollo')
      })
    )
  })
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      self.clients.claim().then(() => {
        return self.registration.unregister()
      })
    )
  })
  
  // Pasar todas las peticiones directamente a la red
  self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request))
  })
} else {
  // Código para producción
  const CACHE_NAME = 'agrotrack-futamaq-v3'
  const urlsToCache = [
    '/',
    '/dashboard',
    '/maquinarias',
    '/mantenimientos',
    '/combustible',
    '/repuestos',
    '/reportes',
    '/analisis',
    '/notificaciones',
    '/configuracion',
    '/usuarios',
    '/manifest.json'
  ]

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(urlsToCache)
        })
        .catch((error) => {
          console.error('Error al abrir cache:', error)
        })
    )
  })

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          })
        )
      })
    )
  })

  self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url)
    
    // Ignorar extensiones
    if (url.protocol === 'chrome-extension:' || 
        url.protocol === 'chrome:' || 
        url.protocol === 'moz-extension:' ||
        url.protocol === 'safari-extension:' ||
        url.protocol === 'edge-extension:') {
      return
    }

    // No cachear Next.js
    if (url.pathname.startsWith('/_next/') || 
        url.pathname.startsWith('/next/') ||
        url.pathname.startsWith('/api/')) {
      event.respondWith(fetch(event.request))
      return
    }

    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response
          }
          return fetch(event.request).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/next/')) {
              return response
            }
            if (url.origin !== location.origin) {
              return response
            }
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              try {
                if (event.request.method === 'GET' && event.request.url.startsWith('http')) {
                  cache.put(event.request, responseToCache)
                }
              } catch (error) {
                console.warn('Error al cachear:', error)
              }
            })
            return response
          })
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/offline.html')
          }
          return new Response('Network error', { status: 408 })
        })
    )
  })
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
