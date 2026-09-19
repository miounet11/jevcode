---
title: "Puntuación"
description: "Score asigna una puntuación al contenido según niveles descriptivos ordenados. La respuesta incluye la puntuación, la probabilidad de cada nivel y el grado de confianza, y la puntuación puede situarse entre dos niveles."
section: primitives
order: 30
tags: ['score', 'ranking', 'rating']
source: docs.typesafe.ai/primitives/score
translatedFrom: zh
---

## Cuándo usarlo

Utiliza **Score** cuando la respuesta se sitúe en un **espectro continuo que puedas describir mediante varias categorías**. Por ejemplo:

- La gravedad de un error
- El nivel de satisfacción de un cliente
- La profundidad de la experiencia en Python de un candidato

Si la respuesta es un conjunto de opciones fijas y entre ellas **no existe una relación de orden**, utiliza [Choice](/es/primitives/choice/); si la respuesta es simplemente sí o no, utiliza [Noul](/es/primitives/noul/).

Ejemplos de preguntas típicas:

```text
"How severe is the bug being reported?"
  → 0: Cosmetic; no impact to functionality
  → 1: Broken or degraded feature, but workaround exists
  → 2: Blocking issue; no workaround exists

"How formal is this outfit based on the description"
  → 0: gym clothes
  → 1: casual
  → 2: business casual
  → 3: formal
  → 4: black tie
```

Observa que en el segundo ejemplo, las categorías van del 0 al 4 y están **ordenadas** —de lo más informal a lo más formal—. Este es el punto clave que diferencia a Score de Choice. Por el contrario, en `{ billing, technical, sales }` no existe una relación de orden real; forzar el uso de Score introduciría una semántica ordinal falsa.

## Parámetros

| Parámetro | Obligatorio | Descripción |
| :--- | :--- | :--- |
| `type` | Sí | Debe ser `"score"` |
| `instructions` | Sí | La pregunta en sí misma |
| `criteria` | Sí | **Array de categorías**, ordenadas de menor a mayor, donde la descripción de cada elemento define esa categoría |

A diferencia de `criteria` en Choice, que es un objeto, `criteria` en Score es un **array ordenado**. El orden del array determina la dirección de la escala.

Al igual que en Choice, cada elemento dentro de `criteria` puede ser una cadena, un objeto o un array; utiliza un objeto cuando una categoría requiere una explicación más detallada.

## Ejemplo de solicitud

```python
from typesafe_sdk import Score, TypeSafeClient

client = TypeSafeClient()

bug = "The export button throws a CORS error when saving to Google Sheets. It works in Chrome, but a few of our customers only use Safari."

response = client.system_one(
    state=bug,
    questions={
        "bug_severity": Score(
            instructions="How severe is the reported issue?",
            criteria=[
                "Cosmetic; no impact to functionality",
                "Broken or degraded feature, but workaround exists",
                "Blocking issue; no workaround exists",
            ],
        ),
    },
)

print(response.answers["bug_severity"].score)
```

## Respuesta

La característica clave de la respuesta de Score es que `score` **puede situarse entre dos categorías**; es una posición en la escala, no un índice de categoría.

| Campo | Significado |
| :--- | :--- |
| `score` | Posición en la escala, puede ser un número decimal |
| `legend` | Repite tus definiciones de categorías numeradas para facilitar el mapeo semántico en el código |
| `probabilities` | Distribución de probabilidad en cada categoría |
| `confidence` | Grado de concentración de la distribución, de 0 a 1 |

Supongamos que el ejemplo anterior devuelve `score: 1.4`: esto indica que el modelo considera que la gravedad del problema se encuentra entre «funcionalidad rota o degradada con solución alternativa» y «problema bloqueante», tendiendo hacia la primera categoría. Esta **continuidad es la ventaja principal de Score frente a la combinación de varios Noul** —se obtiene información completa de la distribución con una sola llamada, en lugar de varias decisiones independientes.

El propósito de `legend` es hacer que la respuesta sea autodescriptiva: no necesitas mantener una tabla de constantes de categorías en el código para traducir los números de vuelta a su significado semántico.

## Puntos clave de uso

**Las descripciones de las categorías deben ser discriminables.** La descripción de cada categoría debe permitir que otra persona juzgue los límites de manera consistente. Descripciones como `"Calm, matter-of-fact"` / `"Frustrated but civil"` / `"Very angry"` son discriminables; `"bajo / medio / alto"` no lo son.

**Mantén el número de categorías entre 3 y 5.** Demasiadas categorías pierden poder discriminatorio, mientras que demasiadas difuminan los límites entre categorías adyacentes, lo que reduce la confianza.

**Presta atención a `confidence` en lugar de solo mirar `score`.** Una baja confianza en Score suele significar que las definiciones de las categorías son ambiguas, que la escala es multidimensional o que la información del estado es insuficiente. En estos casos, la respuesta correcta es mejorar las definiciones de las categorías, en lugar de forzar un valor.

**Score es el primitivo principal para escenarios de clasificación.** El ordenamiento por relevancia, la evaluación de calidad y la clasificación de riesgos son adecuados para usar Score, combinado con el [patrón de puntuación compuesta](/es/patterns/composite-scoring/) para ponderar y combinar múltiples dimensiones.

## Relacionado

- [Choice](/es/primitives/choice/) — Opciones fijas sin orden
- [Noul](/es/primitives/noul/) — Probabilidad de sí/no
- [Patrón de puntuación compuesta](/es/patterns/composite-scoring/) — Síntesis ponderada de múltiples dimensiones
- [Confianza](/es/concepts/confidence/) — Qué significa una baja confianza
