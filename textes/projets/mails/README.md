# Mes faux mails de 2040

Complète les fichiers `mail-01.md` à `mail-20.md` sans les renommer.
Chaque fichier devient un mail dans Outlook, dans l’ordre des numéros.
Les fichiers vides ne s’affichent pas. La lettre de Malo 2026 reste en premier,
avec son indicateur non lu ; elle seule est ouvrable. Les autres mails sont
des lignes de décor non cliquables, présentées comme déjà lues.

## Exemple à copier dans un fichier

```text
De: Club des constructeurs de demain
Objet: Ta collection de briques a encore grandi !
Début: On a retrouvé les instructions de ton tout premier modèle…
```

- `De:` : le nom fictif de l’expéditeur (pas besoin d’adresse e-mail).
- `Objet:` : le titre du mail.
- `Début:` : un aperçu facultatif dans la liste. Laisser vide pour afficher seulement l’expéditeur et l’objet, comme sur les photos fournies.
- Enregistre avec **Ctrl + S** : Outlook relit les fichiers toutes les cinq
  secondes quand il est ouvert, ainsi qu’au retour sur la page.
- Pour retirer un mail, efface les valeurs en laissant les trois lignes.
  Ne supprime pas le fichier.

## Liste fournie par Malo

Les fichiers 01 à 12 reprennent les mails des deux photos : Muffin / TeamMuffin,
farine, Olaf, comptabilité, LEGO (45 %), Dossier moi, réduction (35 %), Gabriel,
Amazon, Muffin (arts plastiques), Rolife et Apple. Les 13 à 20 restent vides.
Adresses confirmées : `JECKA@contact.com` (réduction de 35 %) et `Gabriel@viel.com` (Site Web).
Le nom entre guillemets après « Bilan 2040 » n’a pas été transcrit faute de lecture sûre.
L’objet du mail d’Olaf est vide sur la photo : aucun objet n’a été inventé.

Les adresses sont du texte d’illustration, jamais des liens ni des destinataires
réels. Aucun corps de mail secondaire n’est ouvert. La lettre principale garde
son contenu Markdown dans `textes/projets/contenu.md`.

Les initiales des expéditeurs sont remplacées par des pictogrammes SVG locaux
(muffin, blé, bonhomme de neige, calculatrice, briques…). Ils sont choisis
à partir du nom de l’expéditeur dans `senderIdentity`, dans `projets.js`.
Ils fonctionnent aussi hors ligne ; aucune image distante n’est chargée.

## Ouvrir le site

Double-clique sur `ouvrir-dossier.cmd` à la racine du site. Il utilise Python 3
(déjà installé sur cet ordinateur), ouvre le navigateur et sert uniquement le
dossier du site sur `127.0.0.1`. Garde la fenêtre du lanceur ouverte pendant
la présentation ; ferme-la ou fais Ctrl + C pour arrêter le serveur.

Un serveur de développement comme Live Server convient aussi. En ouvrant
directement `projets.html` en `file://`, les mails secondaires fournis restent
visibles grâce à une copie intégrée. Le navigateur ne peut pas relire les
Markdown dans ce mode : utilise le lanceur pour voir tes dernières modifications.

La copie `assets/mails-secours.js` est générée depuis les Markdown au lancement
du serveur. Pour l’actualiser avant de distribuer ou publier le site, utilise
`python outils/exporter_mails.py`. Ne modifie pas cette copie à la main.
Un fichier inaccessible ne masque plus les autres mails ; une copie déjà chargée
est conservée. Un fichier lu avec succès mais vidé retire bien le mail de la liste.

Tout est fictif : aucun message envoyé, aucun compte, aucune connexion Outlook.
