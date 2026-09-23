---
title: "Referencia de la API HTTP"
description: "Llama directamente al endpoint de evaluación de TypeSafe: forma de la solicitud, los tipos de pregunta noul / choice / score, formas de respuesta y manejo de errores."
section: sdk
order: 50
tags: ['api', 'http', 'reference']
source: docs.typesafe.ai/api
translatedFrom: en
---
## Endpoint

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Envía un `state` con un mapa de `questions` escritos y recibe un `answer` por pregunta.

## Cuerpo de la solicitud

```json
{
  "state": "Help! My payouts have been failing for 3 days.",
  "model": "jev-latest",
  "questions": {
    "is_urgent": {
      "type": "noul",
      "instructions": "Does this convey urgency?"
    }
  }
}
```

| Campo | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- |
| `state` | string \| object \| array | Sí | El contenido a evaluar. Una cadena de texto simple para texto, o datos estructurados para registros de chat, registros o el estado actual de tu aplicación |
| `model` | string | Sí | El modelo que maneja la solicitud. Usa `jev-latest`, el modelo insignia de TypeSafe; consulta la página oficial de Models para otros modelos y alias |
| `questions` | map&lt;string, Question&gt; | Sí | Un mapa de preguntas tipadas |

Tú eliges las claves en `questions`, y cada respuesta vuelve bajo la **misma clave**. Esa clave no se envía al modelo subyacente ni se usa en la inferencia, así que puedes nombrarla según tu dominio de negocio (`department`, `is_urgent`).

## Los tres tipos de preguntas

A `Question` se discrimina por su campo `type`; hay tres. Los tres comparten `type` y `instructions`, y cada uno añade su propio `criteria`.

`instructions` tiene el tipo `string | object | array`.

### noul — una decisión de sí/no

Una pregunta de sí/no. **Devuelve la probabilidad de que la respuesta sea sí.**

```json
{
  "is_urgent": {
    "type": "noul",
    "instructions": "Does this convey urgency?",
    "criteria": {
      "true": "Explicitly time-sensitive",
      "false": "No urgency expressed"
    }
  }
}
```

`criteria` es opcional y describe qué significan "sí" y "no":

| Clave | Descripción |
| :--- | :--- |
| `true` | Qué significa un valor que se acerca a 1 ("sí") |
| `false` | Qué significa un valor que se acerca a 0 ("no") |

### choice — elige entre opciones

Elige una opción de un conjunto que definas, devolviendo la opción elegida **más la distribución de probabilidades completa**.

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this?",
    "criteria": {
      "billing": "Payments, invoicing, refunds",
      "technical": "Bugs, outages, integrations",
      "sales": "Pricing, upgrades, new accounts"
    }
  }
}
```

`criteria` es obligatorio, de tipo `map<string, string | null>`: nombres de opciones mapeados a una descripción de rúbrica. Utiliza `null` como valor cuando una opción no requiere explicación adicional.

### score — califica a lo largo de una escala

Evalúa el `state` según una rúbrica que definas, devolviendo un **valor ponderado por probabilidad a través de tus niveles**.

```json
{
  "frustration": {
    "type": "score",
    "instructions": "How frustrated is the customer?",
    "criteria": ["Calm", "Frustrated", "Very angry"]
  }
}
```

`criteria` es obligatorio y es un **array ordenado** de descripciones de nivel. Debes incluir al menos dos niveles.

## Cuerpo de la respuesta

Cada pregunta produce una respuesta, identificada por el id que proporcionaste.

```json
{
  "model": "jev-latest",
  "answers": {
    "is_urgent": {
      "type": "noul",
      "noul": 0.92
    }
  },
  "usage": { "input_tokens": 312, "output_tokens": 48 }
}
```

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `model` | string | El modelo que realizó la evaluación |
| `answers` | map&lt;string, Answer&gt; | Una respuesta por pregunta, con claves idénticas a `questions` |
| `usage` | object | Uso de tokens para la solicitud: `input_tokens`, `output_tokens` |

### Formas de respuesta por tipo

Cada respuesta lleva un `type` que coincide con su pregunta. Las respuestas `choice` y `score` también llevan `confidence` (entre 0 y 1), derivadas de la distribución de probabilidad de esa respuesta (consulta la página oficial de Confidence).

**noul answer**

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `noul` | number | La respuesta sí/no, de 0 (no) a 1 (sí) |

```json
{ "type": "noul", "noul": 0.92 }
```

**respuesta de elección**

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `choice` | string | La opción con mayor probabilidad |
| `probabilities` | map&lt;string, number&gt; | Probabilidad por opción; suma 1 |
| `confidence` | number | Qué tan seguro está el modelo, derivado de las probabilidades |

```json
{
  "type": "choice",
  "choice": "technical",
  "probabilities": { "billing": 0.08, "technical": 0.85, "sales": 0.07 },
  "confidence": 0.82
}
```

**responder puntuación**

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `score` | number | El valor ponderado por probabilidad, que **puede situarse entre niveles** |
| `legend` | map&lt;string, string&gt; | Asocia cada índice de nivel con su descripción |
| `probabilities` | map&lt;string, number&gt; | Probabilidad por nivel (claves de tipo string); suma 1 |
| `confidence` | number | El grado de certeza del modelo, derivado de las probabilidades |

```json
{
  "type": "score",
  "score": 1.6,
  "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
  "probabilities": { "0": 0.05, "1": 0.3, "2": 0.65 },
  "confidence": 0.78
}
```

Observa cómo `score` se relaciona con `probabilities`: las tres probabilidades de nivel son 0.05 / 0.3 / 0.65, ponderando hacia un `score` de 1.6. Por lo tanto, `score` no tiene por qué ser un número entero, lo cual es precisamente lo que lo distingue de `choice`: `choice` te ofrece una opción discreta, mientras que `score` puede expresar «en algún lugar entre dos niveles».

## Errores

Los errores utilizan códigos de estado HTTP estándar, con un cuerpo JSON que describe lo que salió mal.

| Estado | Significado |
| :--- | :--- |
| `401 Unauthorized` | La clave API está ausente o es inválida. Comprueba el encabezado `Authorization` |
| `422 Unprocessable Entity` | El cuerpo de la solicitud no superó la validación, por ejemplo, un campo obligatorio faltante o una pregunta con formato incorrecto. El cuerpo señala el campo infractor |
| `429 Too Many Requests` | Has excedido tu límite de velocidad. Reintenta después de un breve retraso |
| `529 Overloaded` | TypeSafe está temporalmente sobrecargado. Reintenta después de un breve retraso |

### Manejo de límites de velocidad

En `429` o `529`, **reintenta con retroceso exponencial** en lugar de reintentar inmediatamente. Si usas un SDK oficial, su política de reintento predeterminada maneja esto automáticamente, por lo que no se necesita código adicional.