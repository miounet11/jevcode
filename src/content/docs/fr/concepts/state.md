---
title: État
description: L'état est le texte que clavue-jev juge. Dans cette API, c'est une chaîne de 8 à 4000 caractères, vue par chaque question du même appel.
section: concepts
order: 20
tags: ['state', 'clavue-jev']
---

## État

L'**état** est le texte que clavue-jev juge. Dans `POST /v1/judge`, c'est une chaîne de 8 à 4000 caractères. Chaque question de la même requête voit cette chaîne. Les questions ne lisent pas les réponses des autres.

Mettez dans cette chaîne les faits dont le jugement a besoin. Un fait absent n'existe pas pour le modèle. Les questions indépendantes voyagent ensemble, six au plus. Si une question a besoin de la réponse précédente, écrivez cette réponse dans un nouvel état et appelez une seconde fois.

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

- [System One](/fr/concepts/system-one/)
- [Assurance](/fr/concepts/confidence/)
- [API](/fr/api/)
