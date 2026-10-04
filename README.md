# Textes Markdown du Dossier Moi

## Accès privé — à lire avant publication

Le mot de passe se définit dans **`securite.local.json`**, champ **`mot_de_passe`**. Ce fichier doit rester privé. `ouvrir-dossier.cmd` prépare et ouvre désormais `index.html` de la version protégée ; il refuse de démarrer tant que le mot de passe est vide ou trop court. Ne double-clique pas sur le `index.html` source : il s’ouvre en `file://` et ne peut pas utiliser cette protection.

Pour GitHub Pages, utilise `preparer-publication.cmd` et publie **uniquement le contenu de `publication-privee` dans un nouveau dépôt séparé**. Ne publie pas les fichiers source de ce dossier. Voir [CONFIDENTIALITE.md](CONFIDENTIALITE.md) pour les étapes et les limites de la protection.

Chaque rubrique du site possède son propre dossier :

- `recits/contenu.md`
- `souvenirs/` : un fichier par lieu de la carte
- `evaluation/contenu.md`
- `projets/contenu.md`
- `affrontement/contenu.md`
- `reverie/contenu.md`
- `conclusion/contenu.md`

Écris dans le fichier du dossier `textes/` correspondant. La version protégée est un instantané : après enregistrement, relance `ouvrir-dossier.cmd` pour régénérer le contenu chiffré. Pour le développement local sans protection seulement, Live Server ou `python outils/serveur-local.py` permettent l’actualisation sous cinq secondes. Les fichiers Markdown ne peuvent pas être chargés en ouvrant simplement le HTML en `file://`.

La lettre de `textes/projets/contenu.md` devient le corps du mail « À mon moi de 2040 ». Il n’y a rien à recopier dans le HTML. Les mails secondaires restent des aperçus non cliquables : leurs champs `De`, `Objet` et `Début` remplissent uniquement la liste.

Les paragraphes, **gras**, *italiques*, listes et images sont conservés. Les chemins d’images sont relatifs au fichier `.md` : depuis un `contenu.md`, `![Légende](../../images/ma-photo.jpg)` pointe vers le dossier `images` du site. Les commentaires HTML ne sont pas affichés. Le contenu est nettoyé avant affichage pour ne pas exécuter de scripts.

## Répartir les textes dans les pages

Un texte libre est affiché dans la zone principale. Pour choisir précisément les emplacements, utilise les titres suivants, précédés de `##` dans le Markdown :

- **Récits** : trois titres de ton choix, un par partie du carnet. Dans chaque partie, un sous-titre `### Photos` permet de mettre les images et légendes sur la page droite. Sans ces titres, les blocs du récit sont répartis automatiquement sur les trois parties.
- **Évaluation** : `Mise en route`, `Utilisation recommandée`, `Performances optimales`, `Risque de bug`, `Dépannage`, `Évolution`. Une liste sous « Mise en route » devient les pièces colorées de la notice.
- **Affrontement** : `Leur jugement`, `Ma réaction`.
- **Conclusion** : `Ce que j’ai aimé`, `Ce que j’ai moins aimé`, `Ce que je retiens`.
- **Rêverie** : tout le fichier apparaît dans l’univers du rêve.
- **Souvenirs** : chaque fichier du lieu apparaît dans sa fiche sur la carte.

Les sections non reconnues restent visibles au début de la rubrique : aucun texte n’est supprimé. Aucun texte personnel n’est créé automatiquement.

Le rendu Markdown utilise les bibliothèques locales de `assets/vendor/` ; aucune connexion extérieure n’est nécessaire pour lire les textes. La carte conserve ses dépendances cartographiques habituelles.

La version chiffrée reste statique et compatible avec GitHub Pages : **ne publie pas les dossiers originaux**, seulement l’export `publication-privee`. En ligne, seules les modifications exportées puis publiées sont visibles.

Vérification des branchements et de l’actualisation : `outils/verification-contenus.cjs` (Playwright + Edge). Les exemples de test sont simulés dans le navigateur : les textes personnels ne sont pas modifiés.

## Entrée et carnet

Chaque nouvelle ouverture du lien principal affiche d’abord le carnet verrouillé, puis l’introduction après le mot de passe. Le lanceur `ouvrir-dossier.cmd` ouvre cette entrée protégée, pas directement la boîte mail. L’ancienne mémorisation permanente du navigateur n’est plus utilisée.

Après l’entrée, un rafraîchissement ou un retour dans l’historique conserve le bureau. Les liens de retour des rubriques utilisent `index.html#accueil` pour éviter de rejouer l’introduction ; ce marqueur est ensuite retiré de l’adresse pour garder un lien partageable qui commence par l’introduction. Le bouton « Revoir l’introduction », sous les rubriques, reste disponible.

Le mur s’écarte en deux pans pendant environ 2,25 secondes. Avec les mouvements réduits, l’accès est immédiat.

Dans `pages/recits.html`, chaque valeur de `data-journal-page` (1, 2 ou 3) correspond à deux blocs : le récit à gauche et les photos/légendes à droite. Ils changent ensemble avec les boutons ou les flèches du clavier. Sur mobile, les photos s’affichent sous le récit.

Vérification de ces comportements : `outils/verification-parcours.cjs` (outil de développement utilisant Playwright et Edge, non requis pour consulter ou publier le site).
