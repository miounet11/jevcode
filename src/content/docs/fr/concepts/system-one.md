---
title: System One
description: La page System One écrite par JevCode. clavue-jev répond à un état avec noul, confidence et choice.
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## System One

Cette page est la nôtre. Elle décrit l'appel que **ce site accepte vraiment**. Le modèle est **clavue-jev**, et nous le tenons pour le meilleur Jev au monde aujourd'hui.

Un programme a besoin d'une valeur de type connu. Une réponse de chat est une chaîne à analyser ensuite. clavue-jev porte le type dans la question : la réponse est déjà un nombre ou l'une de vos options. Utilisez-le pour les jugements qui tournent toute la journée. L'écriture ouverte va à un modèle de texte ; clavue-jev décide si ce texte peut être exécuté.

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

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

`state` fait de 8 à 4000 caractères. `questions` en contient six au plus. `options` est replié en `criteria` avant que le modèle ne le voie. La réponse nomme `model` : `clavue-jev`. Seul un appel réussi est facturé sur les jetons d'entrée. La sortie est gratuite. [Tarifs](/fr/pricing/).

- [État](/fr/concepts/state/)
- [Assurance](/fr/concepts/confidence/)
- [Primitives](/fr/primitives/)
- [API](/fr/api/)
- [Scènes](/fr/scenes/)
