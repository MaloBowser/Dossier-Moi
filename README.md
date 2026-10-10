# Textes Markdown du Dossier Moi

## Écran d’entrée du site

L’accueil affiche une page de connexion avant l’introduction. `acces.js` compare
l’empreinte SHA-256 du mot de passe, puis mémorise l’accès dans `sessionStorage`
pour cet onglet : les changements de rubrique et les retours à l’accueil ne le
demandent plus. Un rafraîchissement verrouille à nouveau le site ; depuis une
rubrique, il ramène à l’écran d’entrée. Fermer l’onglet et ouvrir une nouvelle visite rétablit la demande (la fonction
« restaurer les onglets » du navigateur peut toutefois restaurer la session).
Les rubriques n’ont pas d’écran de connexion supplémentaire.

Cet écran constitue un verrou visuel : il ne chiffre pas les fichiers et ne bloque
pas leurs adresses directes. Il est indépendant de l’ancien export privé ci-dessous.
Pour consulter le site avec cet écran, lancer `python outils/serveur-local.py`.

## Entrée et carnet

Chaque nouvelle ouverture du lien principal affiche d’abord le carnet verrouillé, puis l’introduction après le mot de passe. Le lanceur `ouvrir-dossier.cmd` ouvre cette entrée protégée, pas directement la boîte mail. L’ancienne mémorisation permanente du navigateur n’est plus utilisée.

Après l’entrée, un rafraîchissement ou un retour dans l’historique conserve le bureau. Les liens de retour des rubriques utilisent `index.html#accueil` pour éviter de rejouer l’introduction ; ce marqueur est ensuite retiré de l’adresse pour garder un lien partageable qui commence par l’introduction. Le bouton « Revoir l’introduction », sous les rubriques, reste disponible.

Le mur s’écarte en deux pans pendant environ 2,25 secondes. Avec les mouvements réduits, l’accès est immédiat.

Dans `pages/recits.html`, chaque valeur de `data-journal-page` (1, 2 ou 3) correspond à deux blocs : le récit à gauche et les photos/légendes à droite. Ils changent ensemble avec les boutons ou les flèches du clavier. Sur mobile, les photos s’affichent sous le récit.

Vérification de ces comportements : `outils/verification-parcours.cjs` (outil de développement utilisant Playwright et Edge, non requis pour consulter ou publier le site).
