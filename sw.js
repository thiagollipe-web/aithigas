const CACHE='aithigas-v3';
const ASSETS=[
 './','./index.html','./manifest.json','./sw.js','./engine.js','./assets/icon.svg',
 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.6.1/esm/index.js',
 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.6.1/esm/wasm/wllama.wasm'
];
self.addEventListener('install',event=>event.waitUntil(
 caches.open(CACHE).then(async cache=>{
   for(const asset of ASSETS){try{await cache.add(asset)}catch(error){console.warn('Cache ignorou',asset,error)}}
 }).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET') return;
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
   const copy=response.clone();
   caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
   return response;
 }).catch(()=>caches.match('./index.html'))));
});