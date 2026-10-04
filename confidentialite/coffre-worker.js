/* Serveur virtuel, uniquement en mémoire. Aucun fichier privé en cache persistant. */
'use strict';
const sessions = new Map();
const pending = new Map();
const revoked = new Set();
const base = new URL(self.registration.scope);
const privatePrefix = base.pathname + '_dossier/';
const noStore = {'Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const isGate = client => client && [base.href, new URL('index.html', base).href].includes(client.url.split('#')[0].split('?')[0]);
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('message', event => {
    const message = event.data;
    if (!isGate(event.source) || !message || !/^[a-f0-9-]{36}$/.test(message.token || '')) return;
    if (message.type === 'OPEN' && !revoked.has(message.token) && message.files?.['index.html']) {
        sessions.set(message.token, {owner: event.source.id, files: message.files});
        event.ports[0]?.postMessage({ok:true});
    }
    if (message.type === 'CLOSE' && (!sessions.has(message.token) || sessions.get(message.token).owner === event.source.id)) {
        revoked.add(message.token);
        sessions.delete(message.token);
    }
});

async function restore(token) {
    if (revoked.has(token)) return null;
    const current = sessions.get(token);
    if (current && isGate(await self.clients.get(current.owner))) return current;
    sessions.delete(token);
    if (pending.has(token)) return pending.get(token);
    const request = (async () => {
        const candidates = (await self.clients.matchAll({type:'window'})).filter(isGate);
        for (const client of candidates) {
            const data = await new Promise(resolve => {
                const channel = new MessageChannel();
                const timeout = setTimeout(() => {channel.port1.close();resolve(null);}, 1500);
                channel.port1.onmessage = event => {clearTimeout(timeout);channel.port1.close();resolve(event.data);};
                client.postMessage({type:'REQUEST_VAULT',token}, [channel.port2]);
            });
            if (!revoked.has(token) && data?.token === token && data.files?.['index.html']) {
                const session = {owner:client.id,files:data.files};
                sessions.set(token,session);
                return session;
            }
        }
        return null;
    })();
    pending.set(token,request);
    try {return await request;} finally {pending.delete(token);}
}

async function privateResponse(request, url) {
    if (!['GET','HEAD'].includes(request.method)) return new Response('',{status:405,headers:noStore});
    const route = url.pathname.slice(privatePrefix.length);
    const slash = route.indexOf('/');
    const token = route.slice(0,slash);
    if (slash < 0 || !/^[a-f0-9-]{36}$/.test(token)) return new Response('Carnet verrouillé.',{status:401,headers:noStore});
    const session = await restore(token);
    if (!session) return new Response('Le carnet est verrouillé. Revenez au lien principal et saisissez le mot de passe.', {status:401,headers:noStore});
    let path;
    try {path = decodeURIComponent(route.slice(slash+1)) || 'index.html';}
    catch {return new Response('',{status:400,headers:noStore});}
    if (!Object.hasOwn(session.files,path)) return new Response('Fichier absent.',{status:404,headers:noStore});
    const file = session.files[path];
    const data = Uint8Array.from(atob(file.data), char=>char.charCodeAt(0));
    const headers = {...noStore,'Content-Type':file.type,'Content-Length':String(data.byteLength),'Accept-Ranges':'bytes'};
    // Le lecteur vidéo doit pouvoir avancer/reculer dans une future vidéo MP4.
    const range = request.headers.get('Range');
    if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        let start = 0, end = data.length-1;
        if (!match || (!match[1] && !match[2])) return new Response('',{status:416,headers:{...noStore,'Content-Range':`bytes */${data.length}`}});
        if (!match[1]) start = Math.max(0,data.length-Number(match[2]));
        else {start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
        if (start > end || start >= data.length) return new Response('',{status:416,headers:{...noStore,'Content-Range':`bytes */${data.length}`}});
        headers['Content-Range']=`bytes ${start}-${end}/${data.length}`;
        headers['Content-Length']=String(end-start+1);
        return new Response(request.method==='HEAD'?null:data.slice(start,end+1),{status:206,headers});
    }
    return new Response(request.method==='HEAD'?null:data,{headers});
}
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (url.origin === base.origin && url.pathname.startsWith(privatePrefix)) {
        event.respondWith(privateResponse(event.request,url));
    }
});
