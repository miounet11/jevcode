---
title: Confianza
description: En esta API la confianza es una pregunta aparte y devuelve un número de 0 a 1. El umbral se fija por el coste de un error.
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## Dos números distintos

Esta API no esconde una confianza dentro de cada respuesta. Pides el número que quieres.

- Una pregunta `noul` devuelve `{ "noul": 0.92 }`. Es la fuerza del «sí», no una puntuación de confianza aparte.
- Una pregunta `confidence` devuelve `{ "noul": 0.78 }`. Es cuán firme es este juicio. Pregúntala junto a la pregunta que quieres dejar ejecutar sola.
- Una pregunta `choice` devuelve `{ "choice": "billing" }`. Una de las opciones que enviaste.

Cuando la bifurcación importa, pregunta las dos juntas:

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

## Cuándo actuar solo

Este sitio no tiene un umbral universal. Equivocarse en un reembolso automático cuesta más que equivocarse en una etiqueta de una línea de log. Por eso la vía del reembolso espera un número más alto.

Un comienzo práctico:

1. Elige la acción segura que corre cuando el número es alto.
2. Elige el relevo cuando el número es bajo (una persona, o una segunda llamada con un estado más estrecho).
3. Lee un lote de tu propio tráfico con [Comparar](/es/compare/) o [Prueba](/es/try/) antes de fijar el umbral.

No dejes que el modelo mueva dinero ni borre datos si no puede decir «no estoy seguro». Haz una pregunta `confidence` y bifurca.

- [Estado](/es/concepts/state/)
- [System One](/es/concepts/system-one/)
- [API](/es/api/)
