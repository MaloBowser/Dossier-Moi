/* Distribution des textes dans le carnet, la notice, l'interview et le bilan. */
(() => {
    const md = window.DossierMarkdown;
    if (!md) return;

    const journal = document.querySelector('#open-journal');
    if (journal) {
        const source = '../textes/recits/contenu.md';
        const originals = [...journal.querySelectorAll('[data-journal-page]')].map(element => [element, element.innerHTML]);
        md.watch(source, text => {
            if (!md.clean(text)) { originals.forEach(([element, html]) => { element.innerHTML = html; }); return; }
            const parts = md.sections(text);
            let pages;
            if (parts.length > 1) {
                pages = parts.slice(1);
                if (parts[0].body.trim()) pages[0].body = parts[0].body + '\n\n' + pages[0].body;
                // Ne jamais perdre du contenu : les éventuelles sections supplémentaires restent à la fin.
                if (pages.length > 3) pages[2].body += '\n\n' + pages.slice(3).map(part => `## ${part.title}\n\n${part.body}`).join('\n\n');
            } else {
                // Sans titres de page : répartir les blocs entiers, sans couper les phrases.
                pages = [0, 1, 2].map(() => ({ title: '', body: '' }));
                const blocks = marked.lexer(md.clean(text)).filter(token => token.type !== 'space');
                const total = blocks.reduce((sum, token) => sum + token.raw.length, 0);
                let consumed = 0;
                blocks.forEach(token => {
                    const index = Math.min(2, Math.floor(consumed / Math.max(1, total / 3)));
                    pages[index].body += token.raw + '\n\n';
                    consumed += token.raw.length;
                });
            }
            [1, 2, 3].forEach((number, index) => {
                const left = journal.querySelector(`.journal-paper--left [data-journal-page="${number}"]`);
                const right = journal.querySelector(`.journal-paper--right [data-journal-page="${number}"]`);
                const part = pages[index] || { title: '', body: '' };
                const photoSections = md.sections(part.body, 3);
                let copy = '', photos = '';
                photoSections.forEach(section => {
                    if (/^photos?\b|^images?\b/.test(md.slug(section.title))) photos += section.body;
                    else copy += (section.title ? `### ${section.title}\n\n` : '') + section.body;
                });
                md.render(left, (part.title ? `## ${part.title}\n\n` : '') + copy, source);
                if (photos.trim()) md.render(right, photos, source, '[Photo à ajouter]');
                else right.innerHTML = originals.find(([element]) => element === right)[1];
            });
        }, journal);
    }

    function bindSections(root, source, targets) {
        if (!root) return;
        const slots = targets.map(target => ({ ...target, element: root.querySelector(target.selector) }));
        const introduction = document.createElement('div');
        introduction.className = 'markdown-content section-introduction';
        introduction.hidden = true;
        root.querySelector('header')?.after(introduction);
        md.watch(source, text => {
            const parts = md.sections(text);
            const assigned = slots.map(() => '');
            const unmatched = [parts[0].body];
            parts.slice(1).forEach(section => {
                const title = md.slug(section.title);
                const index = slots.findIndex(slot => slot.matches.test(title));
                if (index < 0) unmatched.push(`## ${section.title}\n\n${section.body}`);
                else assigned[index] += section.body + '\n\n';
            });
            // Un texte libre va directement dans l'emplacement principal de la rubrique.
            if (parts.length === 1) { assigned[0] = parts[0].body; unmatched.length = 0; }
            slots.forEach((slot, index) => md.render(slot.element, assigned[index], source, slot.empty || '[Texte à ajouter]'));
            const extra = unmatched.join('\n\n').trim();
            introduction.hidden = !extra;
            if (extra) md.render(introduction, extra, source);
        }, root);
    }

    bindSections(document.querySelector('.manual'), '../textes/evaluation/contenu.md', [
        { selector: '#manual-start', matches: /mise en route|^etape 1/ },
        { selector: '#manual-use', matches: /utilisation|^etape 2/ },
        { selector: '#manual-performance', matches: /performances?|^etape 3/ },
        { selector: '#manual-bugs', matches: /risque|bug|^etape 4/ },
        { selector: '#manual-repair', matches: /depannage|solutions?|^etape 5/ },
        { selector: '#manual-update', matches: /evolution|mises? a jour|^etape 6/ }
    ]);
    bindSections(document.querySelector('.interview-shell'), '../textes/affrontement/contenu.md', [
        { selector: '#interview-testimony', matches: /jugement|temoignage|leur avis/, empty: '[Témoignage à ajouter]' },
        { selector: '#interview-reaction', matches: /reaction|mon avis/ }
    ]);
    bindSections(document.querySelector('.conclusion-sheet'), '../textes/conclusion/contenu.md', [
        { selector: '#conclusion-reflection', matches: /bilan|retiens|ressenti/ },
        { selector: '#conclusion-liked', matches: /^(?!.*moins).*aime/ },
        { selector: '#conclusion-disliked', matches: /moins aime/ }
    ]);
})();
