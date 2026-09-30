---
title: Estado
description: El estado es el texto que juzga clavue-jev. En esta API es una cadena de 8 a 4000 caracteres, vista por cada pregunta de la misma llamada.
section: concepts
order: 20
tags: ['state', 'clavue-jev']
---

## Estado

El **estado** es el texto que juzga clavue-jev. En `POST /v1/judge` es una cadena de 8 a 4000 caracteres. Cada pregunta de la misma petición ve esa cadena. Las preguntas no leen las respuestas de las otras.

Mete en esa cadena los hechos que el juicio necesita. Lo que no está escrito, el modelo no lo tiene. Las preguntas independientes van juntas, seis como máximo. Si una pregunta necesita la respuesta anterior, escribe esa respuesta en un estado nuevo y llama por segunda vez.

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

- [System One](/es/concepts/system-one/)
- [Certeza](/es/concepts/confidence/)
- [API](/es/api/)
