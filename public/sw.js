// Minimal Service Worker - No API interference
// Only caches static assets, allows all API calls to pass through

const CACHE_NAME = 'kalakritam-static-v1';

// Only cache essential static assets
const STATIC_ASSETS = [
  '/',
  '/index.html'
];

// Install - cache minimal assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  event.waitUntil(self.clients.claim());
});

// Fetch - let all API calls pass through, only cache navigation
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip all API requests - let them go directly to network
  if (url.pathname.includes('/api/') || 
      url.hostname.includes('api.') ||
      url.hostname.includes('analytics') ||
      url.hostname.includes('google')) {
    return; // Let the request go to network
  }
  
  // For navigation requests, try network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html');
      })
    );
  }
});