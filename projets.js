/* Simulation locale : aucun compte, stockage, service distant ou envoi.
   Ajouter/modifier les raccourcis dans DESKTOP_ITEMS et TASKBAR_ITEMS. */
(() => {
    'use strict';

    const DESKTOP_ITEMS = [
        { name: 'Corbeille', icon: 'bin', column: 0, row: 0 },
        { name: 'PDF-XChange Editor', icon: 'pdf', column: 1, row: 0 },
        { name: 'Visual Studio Code', icon: 'vscode', app: 'vscode', column: 0, row: 1 },
        { name: 'Power BI Desktop', icon: 'powerbi', column: 1, row: 1 },
        { name: 'SynologyDrive', icon: 'folder-yellow', column: 0, row: 2 },
        { name: 'Brother iPrint&Scan', icon: 'printer', column: 1, row: 2 },
        { name: 'Brother Utilities', icon: 'printer', column: 0, row: 3 },
        { name: 'NAS', icon: 'nas', column: 1, row: 3 },
        { name: 'Microsoft Edge', icon: 'edge', column: 0, row: 4 },
        { name: 'VLC media player', icon: 'vlc', column: 0, row: 5 },
        { name: 'Outlook', icon: 'outlook', app: 'outlook', column: 1, row: 4 },
        { name: 'BrickLink Studio', icon: 'bricklink', app: 'bricklink', column: 1, row: 5 },
        { name: 'Google Chrome', icon: 'chrome', column: 0, row: 0, right: true },
        { name: 'Adobe Acrobat', icon: 'adobe', column: 1, row: 0, right: true },
        { name: 'Synology Drive Client', icon: 'drive', column: 0, row: 1, right: true }
    ];
    const TASKBAR_ITEMS = [
        { name: 'Vue des tâches', icon: 'taskview' },
        { name: 'Google Chrome', icon: 'chrome' },
        { name: 'Outlook', icon: 'outlook', app: 'outlook' },
        { name: 'Visual Studio Code', icon: 'vscode', app: 'vscode' },
        { name: 'Explorateur de fichiers', icon: 'folder-yellow' },
        { name: 'Gestionnaire', icon: 'lock', extra: true },
        { name: 'Microsoft Edge', icon: 'edge' },
        { name: 'BrickLink Studio', icon: 'bricklink', app: 'bricklink' },
        { name: 'Imprimante', icon: 'printer', extra: true },
        { name: 'Teams', icon: 'teams', extra: true }
    ];
    const windows = new Map([...document.querySelectorAll('[data-window]')]
        .map(element => [element.dataset.window, element]));
    const runningApps = new Set();
    let activeApp = null;
    let unread = true;

    function icon(name) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        svg.classList.add('icon');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        use.setAttribute('href', '#' + name);
        svg.append(use);
        return svg;
    }
    function badge() {
        const element = document.createElement('span');
        element.className = 'notification-badge';
        element.textContent = '1';
        element.setAttribute('aria-hidden', 'true');
        return element;
    }
    function appElement(item, className) {
        const element = document.createElement(item.app ? 'button' : 'span');
        element.className = className;
        element.title = item.name;
        if (item.app) {
            element.type = 'button';
            element.dataset.app = item.app;
            element.setAttribute('aria-label', 'Ouvrir ' + item.name);
            element.setAttribute('aria-controls', 'window-' + item.app);
            element.addEventListener('click', () => {
                if (className === 'taskbar-button' && activeApp === item.app) {
                    minimizeApp(item.app);
                } else {
                    openApp(item.app);
                }
            });
        } else {
            element.setAttribute('aria-hidden', 'true');
        }
        return element;
    }

    const desktopShortcuts = document.querySelector('#desktop-shortcuts');
    DESKTOP_ITEMS.forEach(item => {
        const element = appElement(item, 'desktop-shortcut');
        element.style[item.right ? 'right' : 'left'] = (item.column * 96 + 2) + 'px';
        element.style.top = (item.row * 100) + 'px';
        if (item.right) element.classList.add('right-shortcut');
        const picture = document.createElement('span');
        picture.className = 'shortcut-picture';
        picture.append(icon(item.icon));
        if (item.icon !== 'bin') {
            const arrow = document.createElement('span');
            arrow.className = 'shortcut-arrow';
            arrow.textContent = '↗';
            picture.append(arrow);
        }
        if (item.app === 'outlook') picture.append(badge());
        const label = document.createElement('span');
        label.textContent = item.name;
        element.append(picture, label);
        desktopShortcuts.append(element);
    });

    const taskbar = document.querySelector('#taskbar-apps');
    TASKBAR_ITEMS.forEach(item => {
        const element = appElement(item, item.app ? 'taskbar-button' : 'taskbar-decoration');
        if (item.extra) element.classList.add('extra-icon');
        element.append(icon(item.icon));
        if (item.app === 'outlook') element.append(badge());
        taskbar.append(element);
    });
    document.querySelectorAll('[data-icon]').forEach(element => element.append(icon(element.dataset.icon)));

    function syncDesktopState() {
        document.body.classList.toggle('has-open-window', activeApp !== null);
        document.querySelectorAll('[data-app]').forEach(button => {
            const app = button.dataset.app;
            button.classList.toggle('is-active', app === activeApp);
            button.classList.toggle('is-running', runningApps.has(app));
            button.setAttribute('aria-expanded', String(app === activeApp));
        });
    }
    function openApp(app) {
        const target = windows.get(app);
        if (!target) return;
        windows.forEach(element => {
            element.hidden = true;
            element.classList.remove('is-opening');
        });
        target.hidden = false;
        target.classList.add('is-opening');
        activeApp = app;
        runningApps.add(app);
        syncDesktopState();
        target.focus({ preventScroll: true });
        document.querySelector('#desktop-status').textContent =
            ({ outlook: 'Outlook', vscode: 'Visual Studio Code', bricklink: 'BrickLink Studio' })[app] + ' ouvert.';
    }
    function minimizeApp(app) {
        const target = windows.get(app);
        if (!target) return;
        target.hidden = true;
        target.classList.remove('is-opening');
        activeApp = null;
        syncDesktopState();
        document.querySelector('.taskbar-button[data-app="' + app + '"]')?.focus();
    }
    function closeApp(app) {
        runningApps.delete(app);
        minimizeApp(app);
    }
    windows.forEach((element, app) => {
        element.querySelector('[data-close]')?.addEventListener('click', () => closeApp(app));
        element.querySelector('[data-minimize]')?.addEventListener('click', () => minimizeApp(app));
        element.addEventListener('animationend', () => element.classList.remove('is-opening'));
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && activeApp) minimizeApp(activeApp);
    });

    const mailButton = document.querySelector('#future-mail');
    const letter = document.querySelector('#future-letter');
    const customLetter = document.querySelector('#custom-letter');
    let selectedMail = null;
    function selectMail(button) {
        document.querySelectorAll('.mail-card').forEach(card => {
            card.classList.toggle('is-selected', card === button);
            card.setAttribute('aria-expanded', String(card === button));
        });
    }
    mailButton.addEventListener('click', () => {
        selectedMail = 'future';
        customLetter.hidden = true;
        selectMail(mailButton);
        unread = false;
        letter.hidden = false;
        windows.get('outlook').classList.add('mail-is-open');
        mailButton.classList.remove('is-unread');
        mailButton.setAttribute('aria-label', 'Lire le message de Malo 2026 : À mon moi de 2040');
        mailButton.querySelector('.unread-dot').style.visibility = 'hidden';
        document.querySelectorAll('.notification-badge, .unread-count').forEach(element => { element.hidden = !unread; });
        letter.querySelector('h2').focus({ preventScroll: true });
    });
    function backToMails() {
        letter.hidden = true;
        customLetter.hidden = true;
        windows.get('outlook').classList.remove('mail-is-open');
        const previous = document.querySelector('.mail-card.is-selected') || mailButton;
        selectedMail = null;
        selectMail(null);
        previous.focus();
    }
    document.querySelector('#back-to-mails').addEventListener('click', backToMails);
    document.querySelector('#back-from-custom').addEventListener('click', backToMails);

    // Un fichier par clin d’œil. Aucun HTML du fichier n’est exécuté.
    // Les 20 noms restent fixes : on remplit les fichiers, sans modifier le JS.
    function parseMail(text, id) {
        const fields = { de: '', objet: '', debut: '' };
        const lines = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
        let bodyStart = lines.length;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '---') { bodyStart = i + 1; break; }
            if (!line || line.startsWith('<!--') || line.startsWith('#')) continue;
            const field = line.match(/^(de|objet|début|debut|aperçu|apercu)\s*:\s*(.*)$/i);
            if (!field) { bodyStart = i; break; }
            const key = field[1].toLowerCase();
            fields[key === 'de' || key === 'objet' ? key : 'debut'] = field[2].trim();
        }
        const body = lines.slice(bodyStart).join('\n').trim();
        if (!fields.de && !fields.objet && !fields.debut && !body) return null;
        return { id, sender: fields.de || 'Expéditeur à compléter', subject: fields.objet || '(Sans objet)',
            preview: fields.debut || body.split('\n')[0] || '', body: body || fields.debut };
    }
    const customMails = document.querySelector('#custom-mails');
    const syncStatus = document.querySelector('#mail-sync');
    let lastMailSnapshot = '';
    let loadingMails = false;

    function displayCustomMail(mail, button, focus = true) {
        selectedMail = mail.id;
        letter.hidden = true;
        customLetter.hidden = false;
        windows.get('outlook').classList.add('mail-is-open');
        selectMail(button);
        customLetter.querySelector('h2').textContent = mail.subject;
        customLetter.querySelector('.letter-sender strong').textContent = mail.sender;
        customLetter.querySelector('.profile-avatar').textContent = mail.sender.slice(0, 2).toUpperCase();
        customLetter.querySelector('.letter-body').textContent = mail.body || 'Ce message n’a pas encore de contenu.';
        if (focus) {
            document.querySelector('.reading-pane').scrollTop = 0;
            customLetter.querySelector('h2').focus({ preventScroll: true });
        }
    }
    function renderCustomMails(mails) {
        const focusedId = document.activeElement?.dataset.mailId;
        const fragment = document.createDocumentFragment();
        mails.forEach((mail, index) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'mail-card custom-mail';
            card.dataset.mailId = mail.id;
            card.setAttribute('aria-label', mail.sender + ' : ' + mail.subject);
            card.setAttribute('aria-controls', 'custom-letter');
            card.setAttribute('aria-expanded', String(selectedMail === mail.id));
            // Seulement le squelette statique : toutes les valeurs passent par textContent.
            card.innerHTML = '<span class="mail-check" aria-hidden="true"></span><span class="profile-avatar"></span><span class="mail-summary"><strong></strong><b></b><small></small></span><span class="mail-meta">2040</span>';
            card.querySelector('.profile-avatar').textContent = mail.sender.slice(0, 2).toUpperCase();
            card.querySelector('.profile-avatar').style.background = ['#dbe9f5', '#eee3f2', '#deeee9', '#f4e8db'][index % 4];
            card.querySelector('strong').textContent = mail.sender;
            card.querySelector('b').textContent = mail.subject;
            card.querySelector('small').textContent = mail.preview;
            card.addEventListener('click', () => displayCustomMail(mail, card));
            fragment.append(card);
        });
        customMails.replaceChildren(fragment);
        const selected = mails.find(mail => mail.id === selectedMail);
        if (selected) displayCustomMail(selected, customMails.querySelector('[data-mail-id="' + selected.id + '"]'), false);
        else if (selectedMail && selectedMail !== 'future') backToMails();
        if (focusedId) customMails.querySelector('[data-mail-id="' + focusedId + '"]')?.focus({ preventScroll: true });
    }
    async function loadCustomMails() {
        if (location.protocol === 'file:') {
            syncStatus.textContent = 'Pour lire les fichiers .md, lance ouvrir-dossier.cmd à la racine du site.';
            syncStatus.classList.add('sync-warning');
            return;
        }
        if (loadingMails) return;
        loadingMails = true;
        try {
            const results = await Promise.all(Array.from({ length: 20 }, async (_, index) => {
                const id = 'mail-' + String(index + 1).padStart(2, '0');
                const response = await fetch('../textes/projets/mails/' + id + '.md', { cache: 'no-store' });
                if (!response.ok) throw new Error(id);
                return parseMail(await response.text(), id);
            }));
            const mails = results.filter(Boolean);
            const snapshot = JSON.stringify(mails);
            if (snapshot !== lastMailSnapshot) {
                renderCustomMails(mails);
                lastMailSnapshot = snapshot;
            }
            syncStatus.textContent = (mails.length + 1) + ' message' + (mails.length ? 's' : '') + ' · Tous les dossiers sont à jour';
            syncStatus.classList.remove('sync-warning');
        } catch {
            syncStatus.textContent = 'Actualisation impossible. Vérifie le serveur local et les 20 fichiers mails. Les messages déjà chargés sont conservés.';
            syncStatus.classList.add('sync-warning');
        } finally { loadingMails = false; }
    }
    loadCustomMails();
    window.setInterval(() => {
        if (activeApp === 'outlook' && !document.hidden) loadCustomMails();
    }, 5000);
    window.addEventListener('focus', loadCustomMails);

    function updateClock() {
        const now = new Date();
        document.querySelector('#desktop-time').textContent =
            now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        // L'heure suit l'ordinateur, mais la date appartient au bureau de 2040.
        document.querySelector('#desktop-date').textContent =
            now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + '/2040';
    }
    updateClock();
    window.setInterval(updateClock, 1000);
    document.addEventListener('visibilitychange', updateClock);

    // Liens pratiques pour ouvrir une application lors d'une présentation.
    const initialApp = window.location.hash.slice(1) || new URLSearchParams(window.location.search).get('app');
    if (initialApp === 'lettre') {
        openApp('outlook');
        mailButton.click();
    } else if (windows.has(initialApp)) {
        openApp(initialApp);
    }
})();
