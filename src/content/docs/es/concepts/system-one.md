---
title: System One
description: La página de System One escrita por JevCode. clavue-jev responde a un estado con noul, confidence y choice.
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## System One

Esta página es nuestra. Describe la llamada que **este sitio acepta de verdad**. El modelo es **clavue-jev**, y lo sostenemos como el mejor Jev del mundo hoy.

Un programa necesita un valor de tipo conocido. Una respuesta de chat es una cadena que luego hay que analizar. clavue-jev lleva el tipo en la pregunta: la respuesta ya es un número o una de tus opciones. Úsalo para los juicios que corren todo el día. La escritura abierta va a un modelo de texto; clavue-jev decide si ese texto se puede ejecutar.

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

`state` tiene de 8 a 4000 caracteres. `questions` lleva seis como máximo. `options` se pliega en `criteria` antes de llegar al modelo. La respuesta nombra `model` como `clavue-jev`. Solo una llamada que sale bien se cobra por tokens de entrada. La salida es gratis. [Precios](/es/pricing/).

- [Estado](/es/concepts/state/)
- [Certeza](/es/concepts/confidence/)
- [Primitivas](/es/primitives/)
- [API](/es/api/)
- [Escenas](/es/scenes/)
