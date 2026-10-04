// Vérifie les mails décoratifs et la lettre, avec et sans serveur.
// Usage : node outils/verification-mails.cjs [http://127.0.0.1:8765]
const {createRequire} = require('node:module');
const {pathToFileURL} = require('node:url');
const {resolve, join} = require('node:path');
const {mkdtemp} = require('node:fs/promises');
const {tmpdir} = require('node:os');
let chromium;
try {({chromium} = require('playwright'));}
catch {({chromium} = createRequire(process.execPath)('playwright'));}
(async () => {
    const browser = await chromium.launch({headless:true,channel:'msedge'});
    const base = process.argv[2] || 'http://127.0.0.1:8765';
    const captures = await mkdtemp(join(tmpdir(),'dossier-mails-'));
    let checks=0;
    const check=(ok,label)=>{if(!ok)throw Error(label);checks++;};
    try {
        for(const mode of ['http','file','partiel']) {
            const page = await browser.newPage({viewport:{width:1440,height:1000}});
            const errors=[];
            page.on('pageerror',e=>errors.push(e.message));
            if(mode==='partiel') await page.route('**/textes/projets/mails/mail-20.md',route=>route.fulfill({status:404,body:''}));
            await page.goto(mode==='file'?pathToFileURL(resolve(__dirname,'../pages/projets.html')).href+'#outlook':base+'/pages/projets.html#outlook');
            await page.waitForFunction(()=>document.querySelectorAll('.custom-mail').length===12);
            const subjects=await page.locator('.custom-mail .mail-summary b').allTextContents();
            for(const expected of ['T-shirts','Facture n° 120312','(Sans objet)','Bilan 2040','45 %','Dossier moi','35 %','Site Web','Renouvellement','arts plastiques','Nouvelle collection','AirPods'])
                check(subjects.some(t=>t.includes(expected)),mode+': '+expected);
            check(await page.locator('.custom-mail .sender-avatar svg').count()===12,mode+': pictogramme pour chaque expéditeur');
            check(await page.locator('.custom-mail .sender-avatar').evaluateAll(elements=>elements.every(el=>!el.textContent.trim())),mode+': plus d’initiales');
            check(await page.locator('.sender-avatar use').evaluateAll(elements=>elements.every(el=>document.querySelector(el.getAttribute('href')))),mode+': tous les symboles existent');
            check((await page.locator('#custom-mails').innerText()).includes('Muffin@TeamMuffin.mlb'),mode+': Muffin et TeamMuffin');
            check(!/Meuph|Meufine/i.test(await page.locator('#custom-mails').innerText()),mode+': anciennes orthographes absentes');
            check(await page.locator('#mail-sync').count()===0,mode+': bandeau supprimé');
            check(await page.locator('#custom-mails button, #custom-mails a, #custom-mails [tabindex], #custom-mails [aria-expanded]').count()===0,mode+': aucun contrôle interactif');
            check(await page.locator('#custom-letter').count()===0,mode+': aucun panneau secondaire');
            await page.locator('[data-mail-id="mail-01"]').click();
            check(!await page.locator('#future-letter').isVisible(),mode+': clic sur Muffin sans effet');
            check(await page.locator('[data-mail-id="mail-01"]').evaluate(el=>getComputedStyle(el).cursor)==='default',mode+': curseur normal');
            await page.locator('#future-mail').click();
            check(await page.locator('#future-letter').isVisible(),mode+': lettre toujours ouvrable');
            await page.locator('#back-to-mails').click();
            if(mode==='partiel') {
                await page.route('**/textes/projets/mails/mail-01.md',route=>route.fulfill({body:'De: Muffin@TeamMuffin.mlb\nObjet: Essai actualisation\nDébut:'}));
                await page.waitForFunction(()=>document.querySelector('[data-mail-id="mail-01"]').textContent.includes('Essai actualisation'));
                check(await page.locator('.custom-mail').count()===12,'Un 404 ne bloque pas les autres mises à jour');
                await page.route('**/textes/projets/mails/mail-02.md',route=>route.fulfill({body:'De:\nObjet:\nDébut:'}));
                await page.waitForFunction(()=>!document.querySelector('[data-mail-id="mail-02"]'));
                check(await page.locator('.custom-mail').count()===11,'Fichier vidé masqué');
            }
            if(mode==='http') {
                await page.screenshot({path:join(captures,'boite-mails.png')});
                await page.locator('[data-mail-id="mail-12"]').scrollIntoViewIfNeeded();
                await page.screenshot({path:join(captures,'boite-mails-bas.png')});
                await page.setViewportSize({width:390,height:844});
                await page.locator('[data-mail-id="mail-01"]').scrollIntoViewIfNeeded();
                check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Pas de débordement mobile');
                await page.screenshot({path:join(captures,'boite-mails-mobile.png')});
            }
            check(!errors.length,mode+': aucune erreur JavaScript '+errors.join(';'));
            await page.close();
        }
        console.log(checks+' contrôles réussis. CAPTURES : '+captures);
    } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
