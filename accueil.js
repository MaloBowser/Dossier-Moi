/* Lu avant le CSS : aucun flash de l'introduction lors d'un retour au dossier.
   Seul un indicateur de visite est enregistré, localement dans ce navigateur. */
(() => {
    const root = new URL('.', window.location.href).pathname;
    const key = `dossier-moi:entree:${root}`;
    const stores = ['localStorage', 'sessionStorage'];
    const seen = () => stores.some(name => {
        try { return window[name].getItem(key) === 'oui'; }
        catch { return false; }
    });
    const remember = () => stores.forEach(name => {
        try { window[name].setItem(key, 'oui'); }
        catch { /* Les liens #accueil assurent aussi le retour sans introduction. */ }
    });
    const skip = window.location.hash === '#accueil' || seen();
    document.documentElement.classList.toggle('has-entered', skip);
    window.dossierEntrance = { skip, remember };
})();
