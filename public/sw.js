const CACHE = 'last-lap-breakout-v4';
const SHELL = ['/', '/index.html', '/favicon.svg', '/assets/orbital-breakout.webp', '/assets/share-card.jpg', '/assets/silkscreen.ttf'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    const html = await (await fetch('/')).text();
    const builtAssets = [...html.matchAll(/(?:src|href)="(\/build\/[^"]+)"/g)].map(match => match[1]);
    await cache.addAll([...new Set(builtAssets)]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === 'navigate') {
      try {
        const response = await fetch(event.request);
        if (response.ok) await cache.put(url.pathname, response.clone());
        return response;
      } catch {
        return (await cache.match(url.pathname)) || (await cache.match('/index.html'));
      }
    }
    const cached = await cache.match(url.pathname, { ignoreVary: true });
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok) await cache.put(url.pathname, response.clone());
    return response;
  })());
});
