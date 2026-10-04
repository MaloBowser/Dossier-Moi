# Le carnet privé de Malo

## 1. Choisir le mot de passe

Ouvre **`securite.local.json`**, à la racine du projet. Écris ton mot de passe entre les guillemets après `mot_de_passe` :

```json
{
  "mot_de_passe": "123456789123456789"
}
```

Choisis une phrase longue et imprévisible (au moins 16 caractères, idéalement cinq mots sans lien entre eux). N’utilise pas simplement ton prénom, TeamMuffin ou une date connue. Aucun mot de passe par défaut n’a été créé. Évite les guillemets doubles et les antislashs dans le mot de passe, sauf si tu sais les échapper dans du JSON.

Ce fichier est privé et exclu de Git par `.gitignore`. **Ne le téléverse jamais**, même dans le dossier à publier. Cette exclusion ne rend pas privés des fichiers déjà publiés ou déjà suivis par Git.

## 2. Voir le site sur l’ordinateur

Double-clique sur **`ouvrir-dossier.cmd`**. Il prépare le dossier chiffré puis ouvre `http://127.0.0.1:…/index.html` avec le cadenas. Entre le mot de passe que tu viens de choisir.

Ne double-clique pas sur le fichier source `index.html` dans l’Explorateur Windows : cela l’ouvre en `file://`, sans serveur local, et un navigateur n’autorise pas le coffre chiffré dans ce mode. Le lanceur ouvre aussi un `index.html`, mais celui de la version protégée, via l’adresse locale.

- La visite reste ouverte pendant la navigation entre les rubriques, dans cet onglet.
- « Refermer le carnet », fermer l’onglet ou quitter la page redemande une clé à la prochaine visite.
- Le bouton « précédent » ne restaure pas une visite déverrouillée.
- Un rafraîchissement complet redemande aussi la clé. Aucun « se souvenir de moi ».
- Un nouvel onglet ouvert sur le lien principal demande sa propre clé.
- Le mot de passe n’est ni envoyé à GitHub, ni enregistré dans les cookies, localStorage ou sessionStorage. Le navigateur peut néanmoins proposer son propre gestionnaire de mots de passe.

Le lanceur nécessite Python 3 et `cryptography` (déjà disponible sur cet ordinateur). Sur un autre ordinateur : `py -3 -m pip install -r outils/requirements-confidentialite.txt`.

La version protégée est un instantané : après une modification de texte, d’image ou de code, relance le lanceur pour la régénérer. L’ancien serveur `outils/serveur-local.py` reste un outil de développement **sans protection**, uniquement sur cet ordinateur ; ne l’utilise pas pour publier.

## 3. Publier sur GitHub Pages

1. Double-clique sur **`preparer-publication.cmd`** après avoir défini ton mot de passe.
2. Un dossier **`publication-privee`** est généré. Il contient seulement l’écran d’entrée, ses scripts, une métadonnée cryptographique et le bloc `dossier.bin` chiffré.
3. Crée un **nouveau dépôt dédié à la publication**, sans y mettre les fichiers source du projet.
4. Téléverse **uniquement le contenu de `publication-privee`**, y compris `.nojekyll`, à la racine de ce nouveau dépôt.
5. Active GitHub Pages sur cette racine et utilise le lien HTTPS obtenu. Vérifie dans une fenêtre privée que le cadenas apparaît et qu’aucun texte n’est accessible avant le mot de passe.
6. Transmets le mot de passe à ta professeure séparément du lien public.

**Ne publie pas la racine actuelle du projet**, les dossiers originaux `textes`, `images`, `pages`, les captures `.qa-projets`, ni `securite.local.json`. Un dépôt public permet de lire ses sources même si l’accueil affiche un cadenas. Publier seulement un sous-dossier dans le même dépôt public ne protège pas les sources qui y restent.

Le site n’a pas été mis en ligne par cette modification. Les fichiers de travail restent lisibles sur ton propre ordinateur. Le chiffrement concerne la version exportée et publiée, pas les fichiers locaux originaux.

## 4. Ce que protège cette solution

Le contenu complet du site (HTML, CSS, JavaScript, Markdown, images et médias présents) est compressé puis chiffré avec AES-256-GCM. La clé est dérivée du mot de passe par PBKDF2-SHA-256, 600 000 itérations, avec un sel aléatoire. Chaque export a un nouveau sel et un nouvel IV. Le mot de passe et la clé ne sont pas dans l’export.

Après saisie de la bonne clé, les fichiers sont servis **en mémoire** par le navigateur. Aucun fichier privé n’est enregistré dans CacheStorage ou IndexedDB. Les adresses internes sont propres à la visite ; le serveur public ne contient pas leurs équivalents en clair. Les tests couvrent également une publication en sous-dossier, comme les projets GitHub Pages.

Cette protection ne remplace pas un hébergement avec comptes personnels pour des données très sensibles. Quelqu’un ayant le mot de passe peut lire, copier ou capturer le contenu et partager la clé. Le bloc chiffré étant téléchargeable, une personne peut essayer des mots de passe hors ligne : la longueur et l’imprévisibilité de ta clé sont importantes. La solution n’a pas fait l’objet d’un audit de sécurité indépendant.

Changer le mot de passe demande de régénérer et republier l’export. Cela ne retire pas les copies déjà déchiffrées ni les anciennes versions éventuellement présentes dans l’historique du dépôt. Les dépendances cartographiques externes restent utilisées après ouverture de la rubrique Carte.

La page d’entrée (son titre et ses illustrations génériques) est publique, mais pas les pages du dossier. Le champ `noindex` demande aux moteurs de ne pas l’indexer ; **ce n’est pas** une protection à lui seul.

## Références et vérifications

- [GitHub : les sites Pages sont normalement publics, même depuis un dépôt privé](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
- [MDN : dériver une clé avec PBKDF2](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey).
- [MDN : paramètres AES-GCM](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams).
- [MDN : fonctionnement des service workers en HTTPS ou sur localhost](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

Test automatisé : `outils/verification-confidentialite.cjs` (Playwright + Edge). Il utilise uniquement un mot de passe aléatoire de test, jamais ton mot de passe personnel.
