const CACHE_NAME = 'musica-v1';

const ARCHIVOS = [
  '/dj/',
  '/dj/index.html',
  '/dj/manifest.json',

  // Páginas de canciones
  '/dj/anoyume.html',
  '/dj/aishite.html',
  '/dj/aitakute.html',
  '/dj/ashura.html',
  '/dj/bouquet.html',
  '/dj/crime.html',
  '/dj/dignity.html',
  '/dj/eien.html',
  '/dj/hikaru.html',
  '/dj/himawari.html',
  '/dj/jane.html',
  '/dj/kisskiss.html',
  '/dj/odo.html',
  '/dj/readysteady.html',
  '/dj/senbonzakura.html',
  '/dj/usseewa.html',
  '/dj/vivarium.html',
  '/dj/zero.html',

  // Páginas de letras (agrega las que tengas)
  '/dj/anoyume-letras.html',
  '/dj/aishite-letras.html',
  '/dj/aitakute-letras.html',
  '/dj/ashura-letras.html',
  '/dj/bouquet-letras.html',
  '/dj/crime-letras.html',
  '/dj/dignity-letras.html',
  '/dj/eien-letras.html',
  '/dj/hikaru-letras.html',
  '/dj/himawari-letras.html',
  '/dj/jane-letras.html',
  '/dj/kisskiss-letras.html',
  '/dj/odo-letras.html',
  '/dj/readysteady-letras.html',
  '/dj/senbonzakura-letras.html',
  '/dj/usseewa-letras.html',
  '/dj/vivarium-letras.html',
  '/dj/zero-letras.html',

  // Imágenes
  '/dj/0-p.png',
  '/dj/A-p.png',
  '/dj/Ai-p.png',
  '/dj/Ait-p.png',
  '/dj/As-p.png',
  '/dj/Bo-p.png',
  '/dj/C-p.png',
  '/dj/Di-p.png',
  '/dj/E-p.png',
  '/dj/H-p.png',
  '/dj/Hi-p.png',
  '/dj/Jane-imagen.png',
  '/dj/K-p.jpeg',
  '/dj/O-p.png',
  '/dj/R-p.png',
  '/dj/Se-p.png',
  '/dj/U-p.png',
  '/dj/vivarium-cover.jpg',

  // Audio
  '/dj/0-m.mp3',
  '/dj/A-m.mp3',
  '/dj/Ai-m.mp3',
  '/dj/Ait-m.mp3',
  '/dj/As-m.mp3',
  '/dj/Bo-m.mp3',
  '/dj/C-m.mp3',
  '/dj/Di-m.mp3',
  '/dj/E-m.mp3',
  '/dj/H-m.mp3',
  '/dj/Hi-m.mp3',
  '/dj/Jane Musica.mp3',
];

// Instalación: guarda todo en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

// Activación: elimina cachés viejas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: primero caché, si no hay internet igual funciona
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).catch(() => {
        // Si es un HTML y no hay internet, muestra el index
        if (e.request.destination === 'document') {
          return caches.match('/dj/');
        }
      });
    })
  );
});
