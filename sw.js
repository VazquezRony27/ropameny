const CACHE='modaurbana-v1';
const ASSETS=['./','./index.html','./offline.html','./css/styles.css','./js/app.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{
    const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy));return res
  }).catch(()=>r.mode==='navigate'?caches.match('./offline.html'):Response.error())));
});
