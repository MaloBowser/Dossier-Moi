// Usage : node outils/verification-contenus.cjs [http://127.0.0.1:8765]
const { createRequire } = require('node:module');
const { mkdtemp, readFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = createRequire(process.execPath)('playwright')); }
(async () => {
    const browser = await chromium.launch({headless:true, channel:'msedge'});
    const base = process.argv[2] || 'http://127.0.0.1:8765';
    const captures = await mkdtemp(join(tmpdir(), 'dossier-contenus-'));
    let count = 0;
    const check = (ok, label) => { if (!ok) throw Error(label); count++; };
    const context = await browser.newContext({viewport:{width:1440,height:1000}, reducedMotion:'reduce'});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const ready = selector => page.waitForFunction(sel => document.querySelector(sel)?.dataset.contentState === 'ready', selector);
    try {
        await page.goto(base+'/pages/projets.html#lettre');
        await ready('#future-letter .letter-body');
        const actual = await readFile(join(__dirname,'../textes/projets/contenu.md'),'utf8');
        const expected = await page.evaluate(text => DOMPurify.sanitize(marked.parse(DossierMarkdown.clean(text),{breaks:true})), actual);
        check(await page.locator('#future-letter .letter-body').innerHTML() === expected, 'Lettre réelle affichée intégralement');
        check(await page.locator('#future-letter').isVisible(), 'Lettre visible dans Outlook');
        await page.screenshot({path:join(captures,'lettre.png'),fullPage:true});
        let letterText = 'Bonjour **Malo**.\n\n- Première idée\n- Seconde idée\n\n![Photo](../../images/favicon.svg)';
        await page.route('**/textes/projets/contenu.md', route => route.fulfill({body:letterText,contentType:'text/plain'}));
        await page.waitForFunction(() => document.querySelector('#future-letter .letter-body strong')?.textContent === 'Malo', {timeout:8000});
        check(await page.locator('#future-letter .letter-body li').count() === 2, 'Listes formatées dans le mail');
        check((await page.locator('#future-letter .letter-body img').getAttribute('src')) === base+'/images/favicon.svg','Image relative au Markdown');
        letterText = 'Texte actualisé **en direct**.<script>window.injection=true</script><img src=x onerror="window.injection=true">';
        await page.waitForFunction(() => document.querySelector('#future-letter .letter-body strong')?.textContent === 'en direct', {timeout:8000});
        check(!await page.evaluate(()=>window.injection),'Scripts et événements neutralisés');
        check(!await page.locator('#future-letter .letter-body script, #future-letter .letter-body [onerror]').count(),'HTML dangereux retiré');
        await page.route('**/textes/projets/mails/mail-01.md',route=>route.fulfill({body:'De: Exemple\nObjet: Essai\nDébut: Aperçu\n---\nCorps **formaté**\n\n![Photo](../../../images/favicon.svg)'}));
        await page.locator('#back-to-mails').click();
        await page.waitForFunction(()=>document.querySelector('[data-mail-id="mail-01"]')?.textContent.includes('Exemple'), {timeout:8000});
        await page.locator('[data-mail-id="mail-01"]').click();
        check(!await page.locator('#future-letter').isVisible(), 'Un mail secondaire ne s’ouvre pas');
        check(await page.locator('#custom-mails button, #custom-mails a').count() === 0, 'Aucun lien ni bouton dans les mails secondaires');
        for (const [name, text, selectors] of [
            ['evaluation','## Mise en route\n- énergie\n## Utilisation recommandée\n1. écouter\n## Performances optimales\nperformance\n## Risque de bug\nfatigue\n## Dépannage\nrepos\n## Évolution\nprogrès', {'#manual-start':'énergie','#manual-use':'écouter','#manual-performance':'performance','#manual-bugs':'fatigue','#manual-repair':'repos','#manual-update':'progrès'}],
            ['affrontement','## Leur jugement\nTémoignage test\n## Ma réaction\nRéaction test', {'#interview-testimony':'Témoignage test','#interview-reaction':'Réaction test'}],
            ['conclusion','## Ce que j’ai aimé\n- plaisir\n## Ce que j’ai moins aimé\n- difficulté\n## Ce que je retiens\nbilan test', {'#conclusion-liked':'plaisir','#conclusion-disliked':'difficulté','#conclusion-reflection':'bilan test'}],
            ['reverie','Un rêve **lumineux**.',{'.dream-copy':'lumineux'}]
        ]) {
            await page.route(`**/textes/${name}/contenu.md`,route=>route.fulfill({body:text}));
            await page.goto(`${base}/pages/${name}.html`);
            await ready(Object.keys(selectors)[0]);
            for(const [selector, expectedText] of Object.entries(selectors)) check((await page.locator(selector).textContent()).includes(expectedText),name+' : '+selector);
            if(name==='evaluation') await page.screenshot({path:join(captures,'notice.png'),fullPage:true});
        }
        await page.route('**/textes/recits/contenu.md',route=>route.fulfill({body:'## Première histoire\nRécit un.\n### Photos\n![Photo un](../../images/favicon.svg)\nLégende un.\n## Deuxième histoire\nRécit deux.\n### Photos\nLégende deux.\n## Troisième histoire\nRécit trois.\n### Photos\nLégende trois.'}));
        await page.goto(base+'/pages/recits.html');
        await ready('#open-journal');
        await page.locator('#journal-lock').click();
        await page.locator('#open-journal').waitFor({state:'visible'});
        for(let i=1;i<=3;i++) {
            check((await page.locator(`.journal-paper--left [data-journal-page="${i}"]`).innerText()).includes(['','Récit un','Récit deux','Récit trois'][i]),'Récit partie '+i);
            check((await page.locator(`.journal-paper--right [data-journal-page="${i}"]`).innerText()).includes(['','Légende un','Légende deux','Légende trois'][i]),'Photo partie '+i);
            if(i<3) {await page.locator('#journal-next').click(); await page.waitForTimeout(150);}
        }
        await page.screenshot({path:join(captures,'journal.png'),fullPage:true});
        // Même point de montage que les fiches de la carte, sans dépendre des CDN cartographiques.
        await page.evaluate(async () => {const box=document.createElement('div');box.id='memory-test';document.body.append(box);await renderMarkdownFile(box,'../textes/projets/contenu.md');});
        check((await page.locator('#memory-test').textContent()).includes('Texte actualisé'),'Chargement et rendu des fiches souvenirs');
        await page.setViewportSize({width:390,height:844});
        await page.goto(base+'/pages/projets.html#lettre');
        await ready('#future-letter .letter-body');
        check(await page.locator('#future-letter').isVisible(),'Mail sur mobile');
        check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mail sans débordement mobile');
        await page.screenshot({path:join(captures,'mail-mobile.png'),fullPage:true});
        check(!errors.length,'Aucune erreur JavaScript : '+errors.join('; '));
        console.log(`${count} contrôles réussis. CAPTURES: ${captures}`);
    } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
