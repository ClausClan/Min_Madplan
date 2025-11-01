// Definer et unikt navn og version til din cache
const CACHE_NAME = 'min-madplan-cache-v2'; // Opdateret version!

// RETTET: Alle stier skal være relative (./) og inkludere ALLE app-filer
const URLS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './Logo.png',
    './Logo1.png',
    './Logo2.png',
    './Flavicon.ico'
];

// --- 1. INSTALL Event: Henter og gemmer filerne i cachen ---
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installerer v2...');
    
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
    console.log('Service Worker: Aktiverer v2...');
    
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
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Hvis response findes i cachen, returner den
                if (response) {
                    return response;
                }

                // Ellers, hent fra netværket
                return fetch(event.request);
            })
    );
});