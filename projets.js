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
    mailButton.addEventListener('click', () => {
        unread = false;
        letter.hidden = false;
        windows.get('outlook').classList.add('mail-is-open');
        mailButton.classList.remove('is-unread');
        mailButton.setAttribute('aria-label', 'Lire le message de Malo 2026 : À mon moi de 2040');
        mailButton.querySelector('.unread-dot').style.visibility = 'hidden';
        document.querySelectorAll('.notification-badge, .unread-count').forEach(element => { element.hidden = !unread; });
        letter.querySelector('h2').focus({ preventScroll: true });
    });
    document.querySelector('#back-to-mails').addEventListener('click', () => {
        letter.hidden = true;
        windows.get('outlook').classList.remove('mail-is-open');
        mailButton.focus();
    });

    function updateClock() {
        const now = new Date();
        document.querySelector('#desktop-time').textContent =
            now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        document.querySelector('#desktop-date').textContent =
            now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    updateClock();
    window.setInterval(updateClock, 1000);
    document.addEventListener('visibilitychange', updateClock);

    // Liens pratiques pour ouvrir une application lors d'une présentation.
    const initialApp = window.location.hash.slice(1);
    if (initialApp === 'lettre') {
        openApp('outlook');
        mailButton.click();
    } else if (windows.has(initialApp)) {
        openApp(initialApp);
    }
})();
