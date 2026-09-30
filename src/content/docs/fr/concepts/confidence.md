---
title: Assurance
description: Dans cette API, l'assurance est une question à part et renvoie un nombre de 0 à 1. Le seuil dépend du coût d'une erreur.
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## Assurance

Cette API ne cache pas une assurance dans chaque réponse. Vous demandez le nombre dont vous avez besoin.

- `noul` renvoie `{ "noul": 0.92 }`. C'est la force du oui, pas un second score d'assurance.
- `confidence` renvoie `{ "noul": 0.78 }`. C'est la solidité du jugement. Demandez-le à côté de la question sur laquelle vous pourriez agir.
- `choice` renvoie `{ "choice": "billing" }`, l'une des options envoyées.

```json
{
  "state": "The invoice was paid twice on Tuesday.",
  "questions": {
    "duplicate": {
      "type": "noul",
      "instructions": "Does this describe a duplicate charge?"
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that judgment?"
    },
    "lane": {
      "type": "choice",
      "instructions": "Which queue should take it?",
      "options": ["billing", "fraud", "ignore"]
    }
  }
}
```

Il n'y a pas de seuil universel ici. Un remboursement automatique faux coûte plus qu'une étiquette fausse sur une ligne de journal. Nombre haut : l'action sûre. Nombre bas : une personne, ou un second appel avec un état plus serré. Regardez votre propre trafic sur [comparer](/fr/compare/) ou [essayer](/fr/try/) avant de figer le seuil.

- [État](/fr/concepts/state/)
- [System One](/fr/concepts/system-one/)
- [API](/fr/api/)
