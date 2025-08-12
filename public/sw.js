// Service Worker for Kalakritam - SEO and Performance Optimization
const CACHE_NAME = 'kalakritam-v1.0.0';
const RUNTIME_CACHE = 'kalakritam-runtime';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/src/index.css',
  '/src/App.css',
  '/src/responsive-utilities.css',
  '/src/assets/fonts/samarkan.ttf',
  '/intro-video.mp4',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png'
];

// Routes to cache with Network First strategy
const NETWORK_FIRST_ROUTES = [
  '/api/',
  '/admin/',
  '/contact',
  '/workshops',
  '/events'
];

// Routes to cache with Cache First strategy
const CACHE_FIRST_ROUTES = [
  '/about',
  '/gallery',
  '/artists',
  '/blogs'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Take control of all clients
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different routes with appropriate strategies
  if (NETWORK_FIRST_ROUTES.some(route => url.pathname.startsWith(route))) {
    // Network First for dynamic content
    event.respondWith(networkFirst(request));
  } else if (CACHE_FIRST_ROUTES.some(route => url.pathname.startsWith(route))) {
    // Cache First for static content
    event.respondWith(cacheFirst(request));
  } else if (isStaticAsset(request)) {
    // Cache First for static assets
    event.respondWith(cacheFirst(request));
  } else {
    // Stale While Revalidate for everything else
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Network First strategy
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

// Cache First strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {
      // Ignore network errors in background
    });
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Return cached response if network fails
    return cachedResponse;
  });
  
  return cachedResponse || networkResponsePromise;
}

// Check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|mp4|webm)$/);
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForms());
  }
});

// Sync contact forms when back online
async function syncContactForms() {
  const cache = await caches.open('form-submissions');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      await fetch(request.clone());
      await cache.delete(request);
      console.log('Form submission synced:', request.url);
    } catch (error) {
      console.error('Failed to sync form submission:', error);
    }
  }
}

// Push notifications for workshop updates
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-72x72.png',
    image: data.image,
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    const url = event.notification.data.url || '/';
    
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Handle navigation requests with custom offline page
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html') || 
                 caches.match('/') ||
                 new Response('You are offline', { 
                   status: 503,
                   statusText: 'Service Unavailable',
                   headers: new Headers({
                     'Content-Type': 'text/plain'
                   })
                 });
        })
    );
  }
});

// Preload critical routes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRELOAD_ROUTES') {
    const routes = event.data.routes || [];
    
    event.waitUntil(
      preloadRoutes(routes)
    );
  }
});

// Preload specific routes
async function preloadRoutes(routes) {
  const cache = await caches.open(RUNTIME_CACHE);
  const preloadedRoutes = new Set();
  
  for (const route of routes) {
    // Avoid duplicate preloading
    if (preloadedRoutes.has(route)) {
      continue;
    }
    
    try {
      const response = await fetch(route);
      if (response.ok) {
        await cache.put(route, response);
        preloadedRoutes.add(route);
        console.log('Preloaded route:', route);
      }
    } catch (error) {
      console.error('Failed to preload route:', route, error);
    }
  }
}

// SEO-specific optimizations
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Cache sitemap and robots.txt aggressively
  if (url.pathname === '/sitemap.xml' || url.pathname === '/robots.txt') {
    event.respondWith(cacheFirst(event.request));
  }
  
  // Ensure manifest is always available
  if (url.pathname === '/manifest.json') {
    event.respondWith(cacheFirst(event.request));
  }
});

console.log('Kalakritam Service Worker loaded and ready for SEO optimization!');
