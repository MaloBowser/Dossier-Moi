/* Brouillon de mise en scène uniquement : aucune réponse attribuée à l’amie.
   Voir README.md dans ce dossier pour ajouter les vrais échanges. */
window.DossierConversation = {
    contact: 'Muffin',
    draft: true,
    exchanges: [
        [
            { author: 'malo', draft: true, text: 'Dis, pour mon Dossier Moi, j’aimerais voir comment tu me décrirais 💬' },
            { author: 'malo', draft: true, text: 'On commence doucement… tu dirais quoi pour mes qualités ?' },
            { author: 'amie', placeholder: true, text: '[Sa vraie réponse sur mes qualités sera ajoutée ici.]' }
        ],
        [
            { author: 'malo', draft: true, text: '[Ma réaction à sa réponse sera ajoutée ici.]' },
            { author: 'malo', draft: true, text: 'Bon… maintenant il faut passer aux défauts 😭' },
            { author: 'amie', placeholder: true, text: '[Sa vraie réponse sur mes défauts sera ajoutée ici.]' }
        ],
        [
            { author: 'malo', draft: true, text: 'Alors là je suis pas totalement d’accord 😂' },
            { author: 'malo', draft: true, text: '[J’expliquerai ici ce que je reconnais dans son regard, et ce que je vois autrement.]' },
            { author: 'amie', placeholder: true, text: '[La suite de notre véritable échange sera ajoutée ici.]' }
        ]
    ]
};
