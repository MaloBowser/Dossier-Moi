/* Tous les messages sont présents dès l’ouverture. Défilement natif uniquement. */
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
    const fragment = document.createDocumentFragment();
    data.exchanges.flat().forEach(message => {
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
        fragment.append(item);
    });
    list.append(fragment);
    // Animation visuelle seulement : aucune bulle masquée, aucun déplacement du scroll.
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('sms-message--new');
                observer.unobserve(entry.target);
            });
        }, { root: thread, threshold: 0.1 });
        [...list.children].forEach(item => observer.observe(item));
    }
})();
