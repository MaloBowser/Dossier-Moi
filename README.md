# Textes Markdown du Dossier Moi

Chaque rubrique du site possède son propre dossier :

- `recits/contenu.md`
- `souvenirs/` : un fichier par lieu de la carte
- `evaluation/contenu.md`
- `projets/contenu.md`
- `affrontement/contenu.md`
- `reverie/contenu.md`
- `conclusion/contenu.md`

Ouvre le site avec `ouvrir-dossier.cmd` (ou Live Server), puis écris dans le fichier du dossier `textes/` correspondant. Enregistre avec Ctrl + S : le texte apparaît directement dans la mise en scène et s’actualise sous cinq secondes, sans recharger la page. Les fichiers Markdown ne peuvent pas être chargés en ouvrant simplement le HTML en `file://`.

La lettre de `textes/projets/contenu.md` devient le corps du mail « À mon moi de 2040 ». Il n’y a rien à recopier dans le HTML. Les mails secondaires interprètent également le Markdown après leur ligne `---`.

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

Le site reste entièrement statique et compatible avec GitHub Pages : publie les dossiers `textes` et `assets` avec les pages. En ligne, seules les modifications publiées sont visibles ; le navigateur ne lit pas les fichiers restés sur ton ordinateur.

Vérification des branchements et de l’actualisation : `outils/verification-contenus.cjs` (Playwright + Edge). Les exemples de test sont simulés dans le navigateur : les textes personnels ne sont pas modifiés.

## Entrée et carnet

L’introduction est mémorisée après le clic sur « Entrer dans mon univers », dans ce navigateur et pour l’adresse du site. Le bouton « Revoir l’introduction », sous les rubriques, permet de la rejouer volontairement. Les liens de retour utilisent `index.html#accueil`, même si le navigateur refuse le stockage local.

Le mur s’écarte en deux pans pendant environ 2,25 secondes. Avec les mouvements réduits, l’accès est immédiat.

Dans `pages/recits.html`, chaque valeur de `data-journal-page` (1, 2 ou 3) correspond à deux blocs : le récit à gauche et les photos/légendes à droite. Ils changent ensemble avec les boutons ou les flèches du clavier. Sur mobile, les photos s’affichent sous le récit.

Vérification de ces comportements : `outils/verification-parcours.cjs` (outil de développement utilisant Playwright et Edge, non requis pour consulter ou publier le site).
