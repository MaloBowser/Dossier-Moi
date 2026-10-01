/* Textes Markdown partagés : rendu local, nettoyé, et actualisé sans rechargement. */
(() => {
    'use strict';
    const sources = new Map();
    const clean = text => text.replace(/^\uFEFF/, '').replace(/<!--[\s\S]*?-->/g, '').trim();
    const slug = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

    function render(container, text, source = '', empty = '[Texte à ajouter]') {
        const markdown = clean(text);
        container.classList.add('markdown-content');
        container.classList.remove('is-loading', 'markdown-content--error', 'markdown-content--empty');
        container.innerHTML = DOMPurify.sanitize(marked.parse(markdown, { breaks: true }), {
            USE_PROFILES: { html: true }, FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe']
        });
        if (!container.textContent.trim() && !container.querySelector('img')) {
            container.textContent = empty;
            container.classList.add('markdown-content--empty');
        }
        // Les chemins d'images et de liens sont relatifs au fichier Markdown.
        const base = new URL(source || '.', location.href);
        container.querySelectorAll('img[src], a[href]').forEach(element => {
            const attr = element.tagName === 'IMG' ? 'src' : 'href';
            const value = element.getAttribute(attr);
            if (value.startsWith('#')) return;
            try {
                const url = new URL(value, base);
                if (['http:', 'https:', 'file:'].includes(url.protocol) || (attr === 'href' && url.protocol === 'mailto:')) {
                    element.setAttribute(attr, url.href);
                } else element.removeAttribute(attr);
            } catch { element.removeAttribute(attr); }
        });
        container.dataset.contentState = markdown ? 'ready' : 'empty';
    }

    async function refresh(source, entry) {
        entry.listeners = entry.listeners.filter(listener => !listener.element || listener.element.isConnected);
        if (!entry.listeners.length) { sources.delete(source); return; }
        if (entry.loading) return;
        entry.loading = true;
        try {
            const response = await fetch(source, { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const text = await response.text();
            const changed = entry.text !== text;
            entry.text = text;
            entry.listeners.forEach(listener => {
                if (changed || !listener.initialized) listener.update(text);
                listener.initialized = true;
                if (listener.element) listener.element.dataset.contentState = clean(text) ? 'ready' : 'empty';
            });
        } catch {
            entry.listeners.forEach(listener => {
                if (listener.initialized) return; // Conserver le texte déjà lu si la connexion est interrompue.
                if (listener.element) {
                    listener.element.dataset.contentState = 'error';
                    if (!listener.element.textContent.trim() || listener.element.textContent.includes('Chargement du texte')) {
                        listener.element.textContent = 'Le texte n’est pas disponible pour le moment. Veuillez actualiser la page.';
                        listener.element.classList.add('markdown-content--error');
                    }
                }
            });
        } finally { entry.loading = false; }
    }

    function watch(source, update, element) {
        let entry = sources.get(source);
        if (!entry) { entry = { listeners: [], loading: false, text: undefined }; sources.set(source, entry); }
        const listener = { update, element, initialized: false };
        entry.listeners.push(listener);
        if (entry.text !== undefined) { update(entry.text); listener.initialized = true; }
        return refresh(source, entry);
    }
    const refreshAll = () => { if (!document.hidden) sources.forEach((entry, source) => refresh(source, entry)); };
    window.setInterval(refreshAll, 5000);
    window.addEventListener('focus', refreshAll);
    document.addEventListener('visibilitychange', refreshAll);

    // Les titres ## répartissent les réponses dans les zones de la mise en scène.
    function sections(text, depth = 2) {
        const result = [{ title: '', body: '' }];
        marked.lexer(clean(text)).forEach(token => {
            if (token.type === 'heading' && token.depth === depth) result.push({ title: token.text, body: '' });
            else result[result.length - 1].body += token.raw;
        });
        return result;
    }
    function mount(container, source, empty) {
        return watch(source, text => render(container, text, source, empty), container);
    }
    window.DossierMarkdown = { render, watch, mount, clean, sections, slug };

    document.querySelectorAll('[data-markdown-source]').forEach(container => {
        mount(container, container.dataset.markdownSource, container.dataset.markdownEmpty || '[Texte à ajouter]');
    });
})();
