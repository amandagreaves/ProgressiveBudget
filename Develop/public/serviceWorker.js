const fileCache = 'file-v1'
const dataCache = 'data-v1'
const cacheFiles = [
    '/',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'db.js',
    'index.html',
    'index.js',
    'manifest.webmanifest',
    'serviceWorker.js',
    'styles.css'
];

self.addEventListener('install', event => {
    console.log("hit install");
    event.waitUntil(
        caches
            .open(fileCache)
            .then(cache => {
                return cache.addAll(cacheFiles);
            })
            .catch(err => console.log('Error caching files on install: ', err))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log("hit activate");
    event.waitUntil(
        caches
            .keys()
            .then(keyList => {
                return Promise.all(
                    keyList.map(key => {
                        if (key !== fileCache && key !== dataCache) {
                            console.log('Deleting cache: ', key);
                            return caches.delete(key);
                        }
                    })
                )
            })
            .catch(err => console.log('Activation error: ', err))
    );
    self.clients.claim();
});

//api caching
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api')) {
        return event.respondWith(
            caches
                .open(dataCache)
                .then(cache => {
                    return fetch(event.request)
                        .then(res => {
                            if (res.status === 200) {
                                cache.put(event.request.url, res.clone());
                            }
                            return res;
                        })
                        .catch(err => {
                            return cache.match(event.request);
                        })
                })
                .catch(err => console.log('Error fetching api: ', err))
        );
    }

    event.respondWith(
        caches
            .match(event.request)
            .then(res => {
                return res || fetch(event.request);
            })
            .catch(err => console.log(err))
    );
});
