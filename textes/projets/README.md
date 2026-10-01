# Page « Projet, ouverture sur l’avenir »

- Page : `pages/projets.html`.
- Présentation : `projets.css`.
- Applications, raccourcis et horloge : `projets.js`.
- Lettre : écris dans `textes/projets/contenu.md`. Le contenu s’affiche directement dans le corps du mail et se met à jour sous cinq secondes après enregistrement.
- Aperçu fictif dans VS Code : `pages/apercu-dossier.html`.
- Le bouton retour apparaît seulement sur le bureau. Cliquer à nouveau sur une
  icône de la barre des tâches ou appuyer sur Échap réduit l’application.
- Toutes les applications, y compris Outlook, ont une croix de fermeture et un
  bouton de réduction en haut à droite. La fermeture ramène au bureau.
- Le bureau de 2040 utilise des tuiles translucides et une barre flottante.
- Les 20 faux mails se remplissent dans `textes/projets/mails/mail-01.md` à
  `mail-20.md` : voir le README de ce dossier. Ils sont relus toutes les cinq
  secondes quand Outlook est visible. Les fichiers vides restent masqués.
- Lancer `ouvrir-dossier.cmd` à la racine (Python 3) ou utiliser Live Server
  pour permettre au navigateur de charger ces fichiers locaux.
- L’horloge suit l’heure locale de l’ordinateur ; la date utilise le jour et le
  mois courants, avec l’année 2040.
- Aucun compte, envoi de message ou service distant n’est utilisé.

## Fonds utilisés

Le bureau utilise `images/bureau-2040.png`, déjà présent dans le projet.
Le fond avec l’animal n’est plus utilisé.

Outlook utilise `images/outlook-montagnes.png`, reconstitué avec l’outil intégré
ImageGen à partir de la capture fournie. Il s’agit d’une reconstitution et non
d’une extraction exacte. Prompt final :

> Edit target: supplied Outlook screenshot. Produce ONLY the wallpaper landscape visible on the right, reconstructing a clean wide 16:9 wallpaper. Preserve the exact scenic character and composition: pale pointed snowy alpine mountain near center, soft blue sky, white mist, dense dark teal pine forest horizontal band, bright cyan blue lake with mountain reflections occupying lower half. Remove all Outlook interface, all text, icons, account/avatar, taskbar and panels; extend the landscape naturally into those areas. Match the blue daylight and misty atmosphere of this reference very closely. No city, no buildings, no people, no text. Intended asset is the background in a local simulated Outlook UI.
