const CACHE_NAME = 'musica-v1';
const urlsToCache = ['/dj/', '/dj/index.html', '/dj/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Recibir notificación push
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '🎵 Musica';
  const options = {
    body: data.body || 'Hay algo nuevo en la app',
    icon: '/dj/icon-192x192.png',
    badge: '/dj/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/dj/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Al tocar la notificación, abrir la app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
