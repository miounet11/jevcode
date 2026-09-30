---
title: Estado
description: El estado es el texto que juzga clavue-jev. En esta API es una cadena de 8 a 4000 caracteres, vista por cada pregunta de la misma llamada.
section: concepts
order: 20
tags: ['state', 'clavue-jev']
---

## Qué envías

El **estado** es el texto que juzga clavue-jev. En `POST /v1/judge` es una cadena de 8 a 4000 caracteres. Cada pregunta de la misma petición ve esa cadena. Las preguntas no leen las respuestas de las otras.

Mete en esa cadena los hechos que el juicio necesita: el mensaje, la línea de política, los dos nombres que quieres comparar. Un hecho que no está escrito no existe para el modelo.

```json
{
  "state": "Usuario: me cobraron dos veces. Política: un cargo duplicado dentro de 7 días se reembolsa. Filas: martes 18:02, martes 18:04, misma tarjeta, mismo importe.",
  "questions": {
    "duplicate": {
      "type": "noul",
      "instructions": "¿Muestran estas filas un cargo duplicado?"
    }
  }
}
```

## Un estado, varias preguntas

Las preguntas independientes viajan en la misma petición, seis como máximo. «¿Es un duplicado?» y «¿A qué cola?» pueden ir juntas. Una pregunta que necesita la respuesta anterior no puede: lánzala como segunda llamada, con la primera respuesta escrita en el estado nuevo.

Pon nombre a cada parte en el texto si envías más de un hecho. «Política: … Filas: …» se juzga más fácil que tres bloques sin etiqueta.

## Longitud

Menos de 8 caracteres se rechaza. Más de 4000 también. Si el material no cabe, recórtalo a las líneas que la pregunta realmente necesita, o divide el trabajo en dos llamadas.

- [System One](/es/concepts/system-one/)
- [Confianza](/es/concepts/confidence/)
- [API](/es/api/)
