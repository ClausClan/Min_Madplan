// Definer et unikt navn og version til din cache
const CACHE_NAME = 'min-madplan-cache-v1';

// Definer de filer, der skal caches. 
// Da din app er én fil, er det bare rod-stien ('/') og selve filen.
const URLS_TO_CACHE = [
    '/',
    '/index.html' 
    // Hvis du havde ikoner til din PWA, ville de blive tilføjet her
    // f.eks. '/icon-192.png'
];

// --- 1. INSTALL Event: Henter og gemmer filerne i cachen ---
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installerer...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Åbner cache og gemmer filer');
                return cache.addAll(URLS_TO_CACHE);
            })
            .then(() => {
                // Tvinger den nye service worker til at blive aktiv med det samme
                return self.skipWaiting();
            })
    );
});

// --- 2. ACTIVATE Event: Rydder op i gamle caches ---
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Aktiverer...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Hvis en cache ikke er den nuværende (CACHE_NAME), slettes den
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Sletter gammel cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Tager kontrol over alle åbne sider med det samme
            return self.clients.claim();
        })
    );
});

// --- 3. FETCH Event: Intercepterer netværkskald ---
self.addEventListener('fetch', (event) => {
    // Vi bruger en "Cache First"-strategi
    // 1. Prøv at finde ressourcen i cachen
    // 2. Hvis ikke fundet, hent den fra netværket
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Hvis response findes i cachen, returner den
                if (response) {
                    console.log('Service Worker: Serverer fra cache:', event.request.url);
                    return response;
                }

                // Ellers, hent fra netværket
                console.log('Service Worker: Henter fra netværk:', event.request.url);
                return fetch(event.request);
            })
    );
});