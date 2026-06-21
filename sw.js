const CACHE = 'perfume-note-v2';

const SHELL = [
  './',
  './index.html',
  './icons.png',
  './manifest.json',
  './bottles/perfume-01.png',
  './bottles/perfume-02.png',
  './bottles/perfume-03.png',
  './bottles/perfume-04.png',
  './bottles/perfume-05.png',
  './bottles/perfume-06.png',
  './bottles/perfume-07.png',
  './bottles/perfume-08.png',
  './bottles/perfume-09.png',
  './bottles/perfume-10.png',
  './bottles/perfume-11.png',
  './bottles/perfume-12.png',
  './bottles/perfume-13.png',
  './bottles/perfume-14.png',
  './bottles/perfume-15.png',
  './bottles/perfume-16.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API 請求永遠走網路，失敗就讓它失敗
  if (url.hostname.endsWith('workers.dev')) return;

  // Google Fonts 等外部資源：network first，失敗再找快取
  if (url.origin !== location.origin) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // App shell：cache first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
