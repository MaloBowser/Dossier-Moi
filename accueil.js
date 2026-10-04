/* Une nouvelle visite commence par l'introduction.
   Seul le retour à une entrée d'historique déjà ouverte évite de la rejouer. */
(() => {
    const navigation = performance.getEntriesByType('navigation')[0]?.type;
    const restoring = navigation === 'reload' || navigation === 'back_forward';
    const skip = location.hash === '#accueil' || (restoring && history.state?.dossierHome === true);
    const remember = () => {
        try {
            // Garder un lien partageable sans #accueil, afin de revoir l'intro à la prochaine visite.
            const url = location.hash === '#accueil' ? location.pathname + location.search : location.href;
            history.replaceState({ ...history.state, dossierHome: true }, '', url);
        } catch { /* Les liens de retour restent utilisables si l'historique est indisponible. */ }
    };
    if (skip) remember();
    document.documentElement.classList.toggle('has-entered', skip);
    window.dossierEntrance = { skip, remember };
})();
