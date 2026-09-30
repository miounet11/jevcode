---
title: Confiance
description: Dans cette API, la confiance est une question à part et renvoie un nombre de 0 à 1. Le seuil se règle sur le coût d'une erreur.
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## Deux nombres différents

Cette API ne cache pas de confiance dans chaque réponse. Vous demandez le nombre que vous voulez.

- Une question `noul` renvoie `{ "noul": 0.92 }`. C'est la force du « oui », pas un score de confiance distinct.
- Une question `confidence` renvoie `{ "noul": 0.78 }`. C'est à quel point ce jugement est solide. Posez-la à côté de la question que vous voulez laisser s'exécuter automatiquement.
- Une question `choice` renvoie `{ "choice": "billing" }`. L'une des options que vous avez envoyées.

Quand la bifurcation compte, posez les deux ensemble :

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

## Quand agir automatiquement

Ce site n'a pas de seuil universel. Se tromper sur un remboursement automatique coûte plus cher que se tromper sur une étiquette dans une ligne de log. Le chemin du remboursement attend donc un nombre plus élevé.

Un début pratique :

1. Choisissez l'action sûre qui s'exécute quand le nombre est élevé.
2. Choisissez le relais quand le nombre est bas (un humain, ou un second appel sur un état plus étroit).
3. Lisez un lot de votre propre trafic via [Comparer](/fr/compare/) ou [Essai](/fr/try/) avant de figer le seuil.

Ne laissez pas le modèle déplacer de l'argent ni effacer des données s'il ne peut pas dire « je ne suis pas sûr ». Posez une question `confidence` et bifurquez.

- [État](/fr/concepts/state/)
- [System One](/fr/concepts/system-one/)
- [API](/fr/api/)
