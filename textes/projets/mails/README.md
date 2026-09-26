# Mes faux mails de 2040

Complète les fichiers `mail-01.md` à `mail-20.md` sans les renommer.
Chaque fichier devient un mail dans Outlook, dans l’ordre des numéros.
Les fichiers vides ne s’affichent pas. La lettre de Malo 2026 reste en premier,
avec son indicateur non lu ; les clins d’œil sont présentés comme déjà lus.

## Exemple à copier dans un fichier

```text
De: Club des constructeurs de demain
Objet: Ta collection de briques a encore grandi !
Début: On a retrouvé les instructions de ton tout premier modèle…
```

- `De:` : le nom fictif de l’expéditeur (pas besoin d’adresse e-mail).
- `Objet:` : le titre du mail.
- `Début:` : la phrase visible dans la liste et à l’ouverture du mail.
- Enregistre avec **Ctrl + S** : Outlook relit les fichiers toutes les cinq
  secondes quand il est ouvert, ainsi qu’au retour sur la page.
- Pour retirer un mail, efface les valeurs en laissant les trois lignes.
  Ne supprime pas le fichier.

## Facultatif : écrire un mail plus long

Après les trois champs, ajoute une ligne `---`, puis le contenu complet.
Le champ `Début:` reste l’aperçu dans la liste. Exemple :

```text
De: Club des constructeurs de demain
Objet: Une invitation pour 2040
Début: Tu te souviens de ta première construction ?
---
Bonjour Malo,

Voici le contenu complet de mon faux mail.

À bientôt !
```

Le texte est affiché tel quel, avec ses retours à la ligne. Les balises HTML
et la mise en forme Markdown ne sont pas interprétées : aucun code n’est exécuté.

## Ouvrir le site

Double-clique sur `ouvrir-dossier.cmd` à la racine du site. Il utilise Python 3
(déjà installé sur cet ordinateur), ouvre le navigateur et sert uniquement le
dossier du site sur `127.0.0.1`. Garde la fenêtre du lanceur ouverte pendant
la présentation ; ferme-la ou fais Ctrl + C pour arrêter le serveur.

Un serveur de développement comme Live Server convient aussi. En ouvrant
directement `projets.html` en `file://`, le navigateur bloque la lecture des
fichiers : une indication apparaît alors en bas de la liste des messages.

Tout est fictif : aucun message envoyé, aucun compte, aucune connexion Outlook.
