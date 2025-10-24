// Service Worker pour FAKTU PWA
// Version 1.0.0

const CACHE_NAME = 'faktu-v1';
const RUNTIME_CACHE = 'faktu-runtime-v1';

// Assets à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache ouvert');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Assets en cache');
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activé');
        return self.clients.claim();
      })
  );
});

// Stratégie de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les API calls (toujours aller au réseau)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Vous êtes hors ligne' }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
            }
          );
        })
    );
    return;
  }

  // Stratégie: Cache First, fallback Network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Depuis cache:', url.pathname);
          return cachedResponse;
        }

        // Pas en cache, récupérer du réseau
        return fetch(request)
          .then((response) => {
            // Ne mettre en cache que les réponses OK
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Cloner la réponse (peut être consommée qu'une fois)
            const responseToCache = response.clone();

            // Assets statiques → Cache principal
            // Pages/autres → Runtime cache
            const targetCache = isStaticAsset(url) ? CACHE_NAME : RUNTIME_CACHE;

            caches.open(targetCache)
              .then((cache) => {
                console.log('[SW] Ajout en cache:', url.pathname);
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Hors ligne et pas en cache
            console.log('[SW] Hors ligne, pas de cache pour:', url.pathname);
            
            // Page HTML → Afficher page offline
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html').then((response) => {
                return response || new Response('Vous êtes hors ligne', {
                  headers: { 'Content-Type': 'text/html' },
                  status: 503,
                });
              });
            }
            
            return new Response('Vous êtes hors ligne', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
      })
  );
});

// Helper: Vérifier si l'URL est un asset statique
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// Écouter les messages du client (ex: skip waiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notification de mise à jour disponible
self.addEventListener('updatefound', () => {
  console.log('[SW] Mise à jour trouvée!');
});

console.log('[SW] Service Worker chargé');
