/* La clé et les fichiers déchiffrés restent en mémoire, jamais dans un stockage du navigateur. */
(() => {
    'use strict';
    const form = document.querySelector('#unlock-form');
    const passwordInput = document.querySelector('#password');
    const status = document.querySelector('#status');
    const submit = document.querySelector('#unlock');
    const threshold = document.querySelector('#threshold');
    const visit = document.querySelector('#visit');
    const host = document.querySelector('#frame-host');
    const toggle = document.querySelector('#show-password');
    let vault = null;
    let token = null;
    let busy = false;
    let generation = 0;

    function say(message, error = false) {
        status.textContent = message;
        status.classList.toggle('error', error);
    }
    function resetPassword() {
        passwordInput.value = '';
        passwordInput.type = 'password';
        toggle.setAttribute('aria-pressed', 'false');
        toggle.setAttribute('aria-label', 'Afficher le mot de passe');
    }
    toggle.addEventListener('click', () => {
        const visible = passwordInput.type === 'password';
        passwordInput.type = visible ? 'text' : 'password';
        toggle.setAttribute('aria-pressed', String(visible));
        toggle.setAttribute('aria-label', visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
    });

    async function setupWorker() {
        if (!window.isSecureContext || !crypto.subtle || !('serviceWorker' in navigator) || !window.DecompressionStream) {
            throw new Error('Ouvrez ce carnet avec un navigateur récent, via son lien HTTPS ou ouvrir-dossier.cmd.');
        }
        await navigator.serviceWorker.register('coffre-worker.js', { scope: './', updateViaCache: 'none' });
        const registration = await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) {
            await new Promise((resolve, reject) => {
                const timer = setTimeout(() => { navigator.serviceWorker.removeEventListener('controllerchange', changed); reject(new Error('Veuillez actualiser cette page puis réessayer.')); }, 10000);
                function changed() {
                    if (!navigator.serviceWorker.controller) return;
                    clearTimeout(timer);
                    navigator.serviceWorker.removeEventListener('controllerchange', changed);
                    resolve();
                }
                navigator.serviceWorker.addEventListener('controllerchange', changed);
                changed();
            });
        }
        return registration.active;
    }
    const ready = setupWorker().catch(error => { say(error.message, true); submit.disabled = true; return null; });

    function send(worker, message) {
        return new Promise((resolve, reject) => {
            const channel = new MessageChannel();
            const timer = setTimeout(() => { channel.port1.close(); reject(new Error('Le carnet n’a pas pu s’ouvrir. Veuillez réessayer.')); }, 15000);
            channel.port1.onmessage = event => {
                clearTimeout(timer);
                channel.port1.close();
                if (event.data?.ok) resolve();
                else reject(new Error('Le carnet n’a pas pu s’ouvrir. Veuillez réessayer.'));
            };
            worker.postMessage(message, [channel.port2]);
        });
    }

    function closeVault(message = '', focus = false) {
        generation++;
        const oldToken = token;
        token = null;
        vault = null;
        host.replaceChildren();
        visit.hidden = true;
        threshold.hidden = false;
        threshold.classList.remove('is-opening');
        resetPassword();
        busy = false;
        submit.disabled = false;
        form.removeAttribute('aria-busy');
        if (oldToken) navigator.serviceWorker.controller?.postMessage({ type: 'CLOSE', token: oldToken });
        say(message);
        if (focus) passwordInput.focus();
    }
    document.querySelector('#close-vault').addEventListener('click', () => closeVault('Le carnet est refermé.', true));
    window.addEventListener('pagehide', () => closeVault());
    window.addEventListener('pageshow', event => { if (event.persisted) closeVault(); });
    navigator.serviceWorker?.addEventListener('message', event => {
        if (event.source?.scriptURL !== new URL('coffre-worker.js', location.href).href) return;
        // Un service worker peut être arrêté par le navigateur : seule la page encore ouverte
        // peut lui restituer sa propre visite. Rien n'est écrit dans CacheStorage/IndexedDB.
        if (event.data?.type === 'REQUEST_VAULT' && event.ports[0]) {
            event.ports[0].postMessage(vault && event.data.token === token ? { token, files: vault.files } : null);
        }
    });

    const bytes = text => Uint8Array.from(atob(text), char => char.charCodeAt(0));
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (busy) return;
        busy = true;
        submit.disabled = true;
        form.setAttribute('aria-busy', 'true');
        const attempt = ++generation;
        let password = passwordInput.value;
        try {
            say('Un instant… je cherche la bonne clé.');
            const worker = await ready;
            if (!worker) throw new Error('Veuillez ouvrir ce carnet via son lien HTTPS ou le lanceur local.');
            const responses = await Promise.all(['dossier.json', 'dossier.bin'].map(path => fetch(path, {cache:'no-store'})));
            if (responses.some(response => !response.ok)) throw new Error('Cette version du carnet n’est pas prête. Préparez sa publication avant de l’ouvrir.');
            const [meta, ciphertext] = await Promise.all([responses[0].json(), responses[1].arrayBuffer()]);
            if (meta.format !== 'dossier-moi-v1' || meta.iterations !== 600000) throw new Error('Version du carnet non reconnue.');
            const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
            password = null;
            resetPassword();
            const key = await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:bytes(meta.salt),iterations:meta.iterations}, material, {name:'AES-GCM',length:256}, false, ['decrypt']);
            let plaintext;
            try {
                plaintext = await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(meta.iv),additionalData:new TextEncoder().encode(meta.format),tagLength:128}, key, ciphertext);
            } catch {
                throw new Error('Cette clé ne convient pas. Vérifiez le mot de passe et réessayez.');
            }
            const decompressed = new Blob([plaintext]).stream().pipeThrough(new DecompressionStream('gzip'));
            const unlocked = await new Response(decompressed).json();
            if (unlocked.format !== meta.format || !unlocked.files?.['index.html']) throw new Error('Le carnet est incomplet.');
            if (attempt !== generation) return;
            token = crypto.randomUUID();
            vault = unlocked;
            await send(worker, {type:'OPEN',token,files:vault.files});
            if (attempt !== generation) return;
            say('La bonne clé. Bienvenue dans mon univers.');
            threshold.classList.add('is-opening');
            if (!matchMedia('(prefers-reduced-motion: reduce)').matches) await new Promise(resolve => setTimeout(resolve, 650));
            if (attempt !== generation) return;
            const frame = document.createElement('iframe');
            frame.title = 'Dossier Moi de Malo';
            frame.allow = 'fullscreen';
            frame.referrerPolicy = 'no-referrer';
            frame.src = `_dossier/${token}/index.html`;
            const sessionPath = new URL(`_dossier/${token}/`, location.href).pathname;
            frame.addEventListener('load', () => {
                try {
                    const destination = frame.contentWindow.location;
                    if (destination.origin !== location.origin || !destination.pathname.startsWith(sessionPath)) closeVault('Le carnet a été refermé.');
                } catch { closeVault('Le carnet a été refermé.'); }
            });
            host.replaceChildren(frame);
            threshold.hidden = true;
            visit.hidden = false;
            frame.focus();
        } catch (error) {
            if (attempt !== generation) return;
            if (token) closeVault();
            say(error.message || 'Impossible d’ouvrir le carnet pour le moment.', true);
            passwordInput.focus();
        } finally {
            password = null;
            resetPassword();
            busy = false;
            submit.disabled = false;
            form.removeAttribute('aria-busy');
        }
    });
})();
