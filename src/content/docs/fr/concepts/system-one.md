---
title: System One
description: La page System One de JevCode. clavue-jev répond à un état avec noul, confidence et choice.
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## Écrit sur JevCode

Cette page est la nôtre. Elle décrit l'appel que **ce site** sert réellement.

JevCode est le foyer de Jev. Le modèle est **clavue-jev**, et nous le présentons comme le meilleur Jev du monde aujourd'hui. Un appel System One, ici, c'est un état, quelques questions typées, et une réponse qui se nomme `clavue-jev`.

## À quoi ça sert

Un logiciel a besoin d'une valeur dont le type est connu. La réponse d'un chat est une chaîne à analyser plus tard. clavue-jev place le type du côté de la question : la réponse est donc déjà un nombre, ou l'une de vos options.

Utilisez-le pour les jugements qui tournent toute la journée. Quelle file, si cette ligne est dans le périmètre, si cette action peut passer. Pour l'écriture libre, prenez un modèle de texte, et laissez clavue-jev juger si le texte peut s'exécuter.

## L'appel

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

`state` est du texte de 8 à 4000 caractères. `questions` en compte six au plus. Les noms commencent par une minuscule. Un choice arrive en `options` ou en `criteria` ; ce serveur replie `options` dans criteria avant d'appeler le modèle.

La réponse porte `"model": "clavue-jev"`. Après un appel réussi, la facturation se fait sur les tokens d'entrée. La sortie est gratuite. Les chiffres sont sur [Tarifs](/fr/pricing/).

## Pour continuer

- [État](/fr/concepts/state/)
- [Confiance](/fr/concepts/confidence/)
- [Choice, Noul et les autres](/fr/primitives/)
- [API](/fr/api/)
- [En direct](/fr/scenes/)
