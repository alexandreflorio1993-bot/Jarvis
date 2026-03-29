// JARVIS Service Worker v1.0
const CACHE = 'jarvis-v1';
const ASSETS = ['/JARVIS_FINAL.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() =>
      caches.match('/JARVIS_FINAL.html')
    ))
  );
});

// Notifications push
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  self.registration.showNotification(data.title || 'JARVIS', {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: data.actions || []
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
});

// Alarmes timer (message depuis l'app)
self.addEventListener('message', e => {
  if(e.data.type === 'TIMER_DONE'){
    self.registration.showNotification('⏱ JARVIS Timer', {
      body: e.data.phase === 'focus' ? '✓ Focus terminé ! Prends une pause.' : '⚡ Pause terminée — Retour au travail !',
      icon: '/icon-192.png',
      vibrate: [300, 100, 300, 100, 300],
    });
  }
  if(e.data.type === 'QUEST_REMINDER'){
    self.registration.showNotification('⚔️ Quêtes en attente', {
      body: e.data.count + ' quête(s) non accomplies aujourd\'hui.',
      icon: '/icon-192.png',
      vibrate: [200, 100, 200],
    });
  }
});
