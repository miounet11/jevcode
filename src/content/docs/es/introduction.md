---
title: "Conoce Jev"
description: "Jev es el modelo insignia de TypeSafe y el primer modelo de System One. Convierte estados no estructurados y preguntas tipadas en decisiones tipadas que el software puede utilizar directamente."
section: start
order: 10
tags: ['overview', 'system-one']
source: docs.typesafe.ai/introduction
translatedFrom: zh
---

## Comprensión en una frase

Jev no es un modelo de chat. Le proporcionas **estado** (state) y **preguntas tipadas** (typed questions), y devuelve **decisiones tipadas** (typed decisions): una opción, una puntuación o una probabilidad booleana, cada una acompañada de una **confianza** (confidence).

Esta posición determina la diferencia fundamental con los modelos conversacionales:

| Dimensión | Modelo conversacional | Jev |
| :--- | :--- | :--- |
| Salida | Texto libre | Resultado estructurado con un esquema fijo |
| Uso | Generación, conversación, cadenas de razonamiento | Clasificación, enrutamiento, puntuación, validación, guardrails |
| Integración | Análisis de la salida del modelo | Consumo directo del valor devuelto, sin necesidad de análisis con expresiones regulares |
| Confianza | Generalmente ausente | Presente en cada respuesta |
| Latencia | Nivel de segundos, crece con la longitud de la salida | Baja y estable |

## Por qué se necesita una «capa de decisión»

Al integrar LLMs en sistemas empresariales, el dolor más común es que el modelo devuelve un texto en lenguaje natural, lo que obliga a escribir un analizador, gestionar casos límite y adivinar si la respuesta es correcta. Jev abstrae esta capa: la propia pregunta declara el tipo de salida, y el modelo debe responder según el esquema.

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this",
    "criteria": {
      "billing": "Payment or subscription issues",
      "technical": "Bugs or integration problems",
      "sales": "Pricing or account questions"
    }
  }
}
```

El valor devuelto es uno de `billing` / `technical` / `sales`, junto con un nivel de confianza. Sin análisis, sin formatos de respaldo.

## Tres primitivas de pregunta

Todas las decisiones se reducen a tres tipos de preguntas. Esta es la abstracción central de Jev; comprenderlas es comprender todo el sistema:

- **[Choice](/zh/primitives/choice/)** — Selecciona una opción de entre un conjunto de candidatos mutuamente excluyentes. Se utiliza para la identificación de intenciones, el enrutamiento de tickets y la selección de acciones.
- **[Score](/zh/primitives/score/)** — Asigna una puntuación según una escala o criterios de evaluación. Se utiliza para la clasificación por relevancia, la evaluación de calidad y la clasificación de riesgos.
- **[Noul](/zh/primitives/noul/)** — Responde a una pregunta de sí/no, devolviendo la probabilidad de que la respuesta sea «sí». Se utiliza para la validación de contenido, la verificación de afirmaciones y los guardrails.

En una sola solicitud se pueden combinar estos tres tipos de preguntas. El modelo lee el estado una sola vez y luego evalúa todas las preguntas en paralelo.

## Posicionamiento de System One

System One es una categoría de modelos diseñados específicamente para «tomar decisiones rápidas y estructuradas que el software pueda utilizar directamente». Jev es el primer modelo de esta categoría. No sustituye a los modelos de razonamiento tipo System Two, sino que complementa su分工 (división de trabajo):

- **System One**: Juicios de alta frecuencia, baja latencia y estructurados. Son una evolución de las instrucciones if/else en las cadenas de procesamiento empresarial.
- **System Two**: Tareas complejas que requieren razonamiento en múltiples pasos y cadenas de pensamiento largas.

En la práctica, es común utilizar System One en abundancia dentro de la cadena de procesamiento para realizar una distribución rápida, y solo escalar a modelos más potentes cuando realmente se necesita un razonamiento profundo, lo que reduce los costes y la latencia.

## Siguientes pasos

- [Inicio rápido en 5 minutos](/zh/quickstart/) — Obtén tu clave de API y realiza tu primera llamada
- [Conceptos clave](/zh/concepts/system-one/) — Comprende System One y los modelos de estado
- [Patrones de arquitectura](/zh/patterns/) — Descubre cómo organizar estas llamadas en entornos de producción
