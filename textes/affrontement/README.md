# Conversation SMS — Affrontement du jugement d’autrui

`conversation.js` contient les 53 SMS fournis par Malo, dans leur ordre exact,
sans ajout ni modification du texte : 33 messages de Malo et 20 de Muffin.

- `author: 'malo'` : bulle bleue à droite, pour les questions comme les réactions.
- `author: 'amie'` : bulle à gauche, pour toutes les réponses de Muffin.
- `text` : texte exact du SMS, affiché comme du texte simple.

Avant chaque SMS, une bulle de trois points indique « Malo écrit… » à droite ou
« Muffin écrit… » à gauche. La durée de saisie dépend de la longueur du message,
avec une pause de lecture entre les interventions. La bulle de saisie disparaît
quand le SMS arrive, ou quand le lecteur choisit « Tout afficher ».

Les SMS apparaissent progressivement. Le téléphone suit les nouveaux messages
uniquement si le lecteur est déjà en bas ; il peut remonter librement pour relire.
Le bouton « Tout afficher » permet de lire immédiatement la conversation entière
sans perdre sa position de lecture. Les animations respectent les mouvements réduits.
La barre d’espace affiche immédiatement le SMS suivant, pendant la saisie ou une
pause, puis la lecture automatique reprend. Un appui maintenu ne saute pas plusieurs
messages. Les champs et les boutons conservent leur fonctionnement clavier habituel.

Aucun fichier audio ni pièce jointe n’est associé à la conversation.
Le bandeau de brouillon est masqué (`draft: false`).
