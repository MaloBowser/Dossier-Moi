// Test de navigation avec Playwright, sur un serveur statique local.
// Usage : node outils/verification-parcours.cjs [http://127.0.0.1:8765]
const { createRequire } = require('node:module');
const { mkdtemp } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = createRequire(process.execPath)('playwright')); }

(async () => {
    const browser = await chromium.launch({ headless: true, channel: 'msedge' });
    const base = process.argv[2] || 'http://127.0.0.1:8765';
    const captures = await mkdtemp(join(tmpdir(), 'dossier-parcours-captures-'));
    try {
        const results = [];
        for (const config of [
            { name: 'ordinateur', viewport: { width: 1440, height: 1000 } },
            { name: 'mobile', viewport: { width: 390, height: 844 } },
            { name: 'mouvements-reduits', viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' }
        ]) {
            const { name, ...options } = config;
            try {
            const context = await browser.newContext(options);
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            page.on('requestfailed', request => errors.push(request.url() + ': ' + request.failure()?.errorText));
            let count = 0;
            const check = (ok, label) => { if (!ok) throw new Error(name + ': ' + label); count++; };
            const spread = () => page.locator('.journal-paper--right').innerText();
            try {
                await page.goto(`${base}/index.html`);
                await page.waitForTimeout(900);
                check(await page.locator('#intro').isVisible(), 'Introduction visible à la première visite');
                check(await page.locator('#home-world').evaluate(el => el.inert), 'Bureau protégé pendant l’entrée');
                check(await page.locator('.brick-wall__half').count() === 2, 'Deux pans de mur');
                check(await page.locator('.brick-door').count() === 0, 'Aucune porte');
                check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Pas de débordement horizontal');
                await page.screenshot({ path: join(captures, `${name}-intro.png`) });
                await page.locator('#enter-universe').click();
                if (options.reducedMotion !== 'reduce') {
                    await page.waitForTimeout(1050);
                    await page.screenshot({ path: join(captures, `${name}-mur.png`) });
                }
                await page.locator('#intro').waitFor({state:'hidden', timeout:3000});
                check(!await page.locator('#home-world').evaluate(el => el.inert), 'Bureau accessible');
                check(await page.evaluate(() => localStorage.getItem(`dossier-moi:entree:${new URL('.',location.href).pathname}`)) === 'oui', 'Entrée mémorisée');
                await page.reload();
                check(!await page.locator('#intro').isVisible(), 'Introduction masquée après rechargement');
                await page.locator('#replay-intro').click();
                check(await page.locator('#intro').isVisible(), 'Relecture volontaire');
                await page.locator('#enter-universe').click();
                await page.locator('#intro').waitFor({state:'hidden'});
                await page.goto(`${base}/pages/recits.html`);
                check(!await page.locator('#open-journal').isVisible(), 'Carnet initialement fermé');
                await page.locator('#journal-lock').click();
                await page.locator('#open-journal').waitFor({state:'visible'});
                await page.waitForTimeout(800);
                const first = await spread();
                check(await page.locator('[data-journal-page="1"]:visible').count() === 2, 'Première double page');
                await page.screenshot({path:join(captures,`${name}-journal1.png`),fullPage:true});
                await page.locator('#journal-next').click();
                if (options.reducedMotion !== 'reduce') await page.locator('#journal-next').dispatchEvent('click');
                await page.waitForTimeout(750);
                check(await page.locator('#journal-page-number').textContent() === '2', 'Navigation sans saut de partie');
                check(await page.locator('[data-journal-page="2"]:visible').count() === 2, 'Les deux pages changent ensemble');
                const second = await spread();
                check(first !== second && second.includes('Les moments de l’histoire'), 'Photos et légendes différentes');
                check(await page.locator('.journal-paper--right').isVisible(), 'Page droite visible aussi sur mobile');
                check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Carnet sans débordement');
                await page.screenshot({path:join(captures,`${name}-journal2.png`),fullPage:true});
                await page.locator('#journal-next').click();
                await page.waitForTimeout(750);
                check(await page.locator('[data-journal-page="3"]:visible').count() === 2, 'Troisième double page');
                check((await spread()).includes('Une dernière image'), 'Troisième contenu de droite');
                check(await page.locator('#journal-next').isDisabled(), 'Limite de fin');
                await page.locator('#journal-prev').click();
                await page.waitForTimeout(750);
                check(await spread() === second, 'Retour restaure la deuxième double page');
                await page.keyboard.press('ArrowLeft');
                await page.waitForTimeout(750);
                check(await spread() === first, 'Retour clavier restaure la première double page');
                check(await page.locator('#journal-prev').isDisabled(), 'Limite de début');
                await page.locator('.journal-home').click();
                await page.waitForURL('**/index.html#accueil');
                check(!await page.locator('#intro').isVisible(), 'Retour du journal directement au bureau');
                await page.evaluate(() => { const key=`dossier-moi:entree:${new URL('.',location.href).pathname}`; localStorage.removeItem(key); sessionStorage.removeItem(key); });
                await page.reload();
                check(!await page.locator('#intro').isVisible(), 'Retour #accueil fonctionne sans mémoire');
                check(!errors.length, 'Aucune erreur JavaScript : ' + errors.join('; '));
                console.log(`${name} : ${count} contrôles réussis.`);
            } catch (error) {
                console.log(name, await page.evaluate(() => ({width:innerWidth, scroll:document.documentElement.scrollWidth, wide:[...document.querySelectorAll('body > *, .intro-card, .brick-scene, .chapter')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).map(el=>[el.className,el.getBoundingClientRect().right])})));
                await page.screenshot({path:join(captures,`${name}-erreur.png`),fullPage:true});
                throw error;
            } finally { await context.close(); }
            } catch (error) { results.push({ status: 'rejected', reason: error }); }
        }
        console.log(`CAPTURES: ${captures}`);
        const failures = results.filter(result => result.status === 'rejected');
        if (failures.length) throw new AggregateError(failures.map(result=>result.reason), 'Échecs du parcours');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
