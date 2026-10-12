# Conversation SMS — Affrontement du jugement d’autrui

La conversation se prépare dans `conversation.js`. Les messages actuels sont des
brouillons de mise en scène, pas une retranscription. Aucune réponse de l’amie
n’est inventée. Le surnom est « Muffin » et son logo fourni est dans `images/muffin-avatar.png`.

Chaque tableau dans `exchanges` regroupe un petit échange. Tous sont affichés dès l’ouverture.
On peut ajouter autant d’échanges et de messages que nécessaire. Un message contient :

- `author: 'malo'` (droite) ou `author: 'amie'` (gauche) ;
- `text` : le texte exact, avec `\n` pour un retour à la ligne ;
- `draft: true` pour les propositions de Malo à valider ;
- `placeholder: true` uniquement pour un emplacement en attente de réponse.

Remplacer les emplacements avec les réponses fournies par Malo, puis retirer leurs
indicateurs `placeholder` / `draft` après validation. Retirer le bandeau général
en passant `draft` à `false` seulement lorsque tout le dialogue est définitif.
Modifier `contact` pour afficher le vrai prénom ou surnom choisi. Les textes sont
affichés comme du texte simple, sans interprétation HTML.

Les exemples de réaction ne sont pas des réactions définitives : les ajuster à
la vraie réponse reçue. Conserver l’alternance entre son regard, ma réaction et,
si elle existe, sa réponse à ma réaction.

Sujets en réserve, à intégrer naturellement une fois les réponses reçues : cinq
qualités, cinq défauts, caractère, principale qualité, pire défaut, attitude avec
les amis et les personnes moins connues, calme/énergie, parole/réserve, rire et
humour, ce qui me fait rire, agacement et colère, patience, organisation.
Cette liste ne génère aucun message automatiquement.

La lecture n’est jamais temporisée. Tous les messages restent dans le téléphone.
Le défilement est natif, à la molette, avec la barre de défilement, au doigt ou au clavier.
Aucun bouton de lecture ni défilement automatique. Les bulles s’animent une seule
fois quand elles entrent dans la zone visible ; les mouvements réduits sont respectés.
Les anciens encadrés « Leur jugement » et « Ma réaction » sous le téléphone ont
été retirés : le regard de Muffin et les réactions de Malo figurent dans la conversation.
