// Usage : node outils/verification-acces.cjs URL MOT_DE_PASSE
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { join } = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = createRequire(process.execPath)('playwright')); }

(async () => {
    const base = process.argv[2];
    const password = process.argv[3];
    assert(base && password, 'Indiquer l’URL et le mot de passe de test.');
    const browser = await chromium.launch({ headless: true, channel: 'msedge' });
    try {
        const context = await browser.newContext({ reducedMotion: 'reduce' });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base + '/index.html');
        assert(await page.locator('#acces-entree').isVisible());
        assert(!await page.locator('#intro').isVisible());
        assert(!await page.locator('#home-world').isVisible());
        await page.locator('#password').fill('incorrect');
        await page.locator('#password').press('Enter');
        await page.locator('#message').filter({ hasText: 'incorrect' }).waitFor();
        assert(!await page.locator('#intro').isVisible());
        await page.screenshot({ path: join(__dirname, '../.qa-projets/acces-ordinateur.png') });
        await page.locator('#password').fill(password);
        await page.locator('#password').press('Enter');
        await page.locator('#acces-entree').waitFor({ state: 'detached' });
        assert(await page.locator('#intro').isVisible());
        await page.reload();
        assert.equal(await page.locator('#acces-entree').count(), 0);
        await page.locator('#enter-universe').click();
        await page.locator('a[href="pages/recits.html"]').click();
        assert.equal(await page.locator('#password').count(), 0);
        await page.locator('.journal-home').click();
        assert.equal(await page.locator('#acces-entree').count(), 0);
        assert(await page.locator('#home-world').isVisible());
        await page.close();

        const reopened = await context.newPage();
        await reopened.setViewportSize({ width: 390, height: 844 });
        await reopened.goto(base + '/index.html');
        assert(await reopened.locator('#acces-entree').isVisible());
        assert(!await reopened.locator('#intro').isVisible());
        assert(await reopened.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await reopened.screenshot({ path: join(__dirname, '../.qa-projets/acces-mobile.png') });
        // Une rubrique ouverte directement ne reçoit pas de nouveau verrou.
        await reopened.goto(base + '/pages/recits.html');
        assert.equal(await reopened.locator('#password').count(), 0);
        assert(await reopened.locator('#closed-journal').isVisible());
        assert.deepEqual(errors, []);
        console.log('OK : entrée avant intro, refus, connexion, actualisation, rubriques, retour, fermeture/réouverture et mobile.');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
