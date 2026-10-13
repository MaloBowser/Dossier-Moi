/* Les SMS apparaissent dans l’ordre fourni, sans modifier leur texte. */
(() => {
    const root = document.querySelector('.sms-scene');
    if (!root) return;
    const data = window.DossierConversation;
    const thread = root.querySelector('#sms-thread');
    const list = root.querySelector('#sms-messages');
    if (!data || !Array.isArray(data.exchanges) || !data.exchanges.length) {
        const empty = document.createElement('li');
        empty.textContent = 'La conversation sera ajoutée prochainement.';
        list.append(empty);
        return;
    }
    root.querySelector('#sms-contact-name').textContent = data.contact;
    root.querySelector('#sms-draft').hidden = !data.draft;
    const messages = data.exchanges.flat();
    const showAll = root.querySelector('#sms-show-all');
    let next = 0;
    let timer;
    let typing;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isAtBottom = () => thread.scrollHeight - thread.scrollTop - thread.clientHeight < 48;
    function beginTyping() {
        const message = messages[next];
        const atBottom = isAtBottom();
        const isMalo = message.author === 'malo';
        typing = document.createElement('li');
        typing.className = `sms-typing sms-message--${isMalo ? 'malo' : 'amie'}`;
        const status = document.createElement('span');
        status.className = 'sms-message-meta';
        status.setAttribute('role', 'status');
        const bubble = document.createElement('p');
        bubble.className = 'sms-bubble sms-typing-bubble';
        bubble.setAttribute('aria-hidden', 'true');
        for (let dot = 0; dot < 3; dot++) bubble.append(document.createElement('span'));
        typing.append(status, bubble);
        list.append(typing);
        status.textContent = `${isMalo ? 'Malo' : data.contact} écrit…`;
        if (atBottom) thread.scrollTop = thread.scrollHeight;
        // Les longs messages demandent plus de saisie qu’une courte réaction.
        timer = window.setTimeout(revealNext, Math.min(6000, Math.max(1400, message.text.length * 32)));
    }
    function appendMessage(message, animate = true) {
        const item = document.createElement('li');
        const author = message.author === 'malo' ? 'Malo' : data.contact;
        item.className = `sms-message sms-message--${message.author === 'malo' ? 'malo' : 'amie'}`;
        if (message.placeholder) item.classList.add('sms-message--placeholder');
        const meta = document.createElement('span');
        meta.className = 'sms-message-meta';
        meta.textContent = author + (message.placeholder ? ' · Réponse à venir' : message.draft ? ' · Brouillon' : '');
        const bubble = document.createElement('p');
        bubble.className = 'sms-bubble';
        bubble.textContent = message.text;
        item.append(meta, bubble);
        if (animate && !reducedMotion) item.classList.add('sms-message--new');
        list.append(item);
    }
    function revealNext() {
        // Laisser le lecteur remonter dans les SMS déjà reçus sans le déplacer.
        const atBottom = isAtBottom();
        typing?.remove();
        typing = null;
        const message = messages[next++];
        appendMessage(message);
        if (atBottom) thread.scrollTop = thread.scrollHeight;
        if (next < messages.length) {
            // Une petite pause pour lire la réponse avant de commencer à écrire.
            const pause = messages[next].author === message.author
                ? 450 : Math.min(1900, Math.max(850, message.text.length * 12));
            timer = window.setTimeout(beginTyping, pause);
        } else {
            showAll.hidden = true;
        }
    }
    showAll.hidden = false;
    showAll.addEventListener('click', () => {
        window.clearTimeout(timer);
        const scrollTop = thread.scrollTop;
        typing?.remove();
        typing = null;
        while (next < messages.length) appendMessage(messages[next++], false);
        thread.scrollTop = scrollTop;
        showAll.hidden = true;
        thread.focus({ preventScroll: true });
    });
    document.addEventListener('keydown', event => {
        if ((event.code !== 'Space' && event.key !== ' ') || event.defaultPrevented
            || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        // Garder le comportement normal des champs, liens et boutons au clavier.
        if (event.target instanceof Element && (event.target.isContentEditable
            || event.target.closest('input, textarea, select, button, a, [role="button"], [role="textbox"]'))) return;
        if (next >= messages.length) return;
        event.preventDefault();
        if (event.repeat) return;
        window.clearTimeout(timer);
        revealNext();
        thread.scrollTop = thread.scrollHeight;
    });
    beginTyping();
})();
