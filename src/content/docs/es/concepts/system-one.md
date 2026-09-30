---
title: System One
description: La página de System One de JevCode. clavue-jev responde a un estado con noul, confidence y choice.
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## Escrito en JevCode

Esta página es nuestra. Describe la llamada que **este sitio** sirve realmente.

JevCode es el hogar de Jev. El modelo es **clavue-jev**, y lo presentamos como el mejor Jev del mundo hoy. Una llamada de System One, aquí, es un estado, unas preguntas tipadas, y una respuesta que se llama `clavue-jev`.

## Para qué sirve

El software necesita un valor de tipo conocido. La respuesta de un chat es una cadena que habrá que analizar después. clavue-jev pone el tipo del lado de la pregunta: la respuesta ya es un número, o una de tus opciones.

Úsalo para juicios que corren todo el día. Qué cola, si esta fila entra en el alcance, si esta acción puede pasar. Para escritura abierta, toma un modelo de texto, y deja que clavue-jev juzgue si el texto puede ejecutarse.

## La llamada

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

`state` es texto de 8 a 4000 caracteres. `questions` son seis como máximo. Los nombres empiezan con minúscula. Un choice llega como `options` o como `criteria`; este servidor integra `options` en criteria antes de llamar al modelo.

La respuesta lleva `"model": "clavue-jev"`. Tras una llamada correcta, se factura por los tokens de entrada. La salida es gratis. Los números están en [Precios](/es/pricing/).

## Seguir leyendo

- [Estado](/es/concepts/state/)
- [Confianza](/es/concepts/confidence/)
- [Choice, Noul y las demás](/es/primitives/)
- [API](/es/api/)
- [En vivo](/es/scenes/)
