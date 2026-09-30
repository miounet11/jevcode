---
title: Certeza
description: En esta API la certeza es una pregunta aparte y devuelve un número de 0 a 1. El umbral depende del costo de equivocarse.
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## Certeza

Esta API no esconde una certeza dentro de cada respuesta. Pides el número que quieres.

- `noul` devuelve `{ "noul": 0.92 }`. Es cuánto es sí, no una segunda cifra de certeza.
- `confidence` devuelve `{ "noul": 0.78 }`. Es cuánto aguanta el juicio. Pídelo junto a la pregunta sobre la que podrías actuar.
- `choice` devuelve `{ "choice": "billing" }`, una de las opciones enviadas.

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

Aquí no hay un umbral universal. Un reembolso automático mal hecho cuesta más que una etiqueta mal puesta en una línea de registro. Número alto: la acción segura. Número bajo: una persona, o una segunda llamada con un estado más cerrado. Mira tu propio tráfico en [comparar](/es/compare/) o [probar](/es/try/) antes de fijar el umbral.

- [Estado](/es/concepts/state/)
- [System One](/es/concepts/system-one/)
- [API](/es/api/)
