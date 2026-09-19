---
title: "Problemas estructurados"
description: "Tanto instructions como criteria aceptan estructuras JSON. El modelo System One está entrenado para comprender estas estructuras; aprovecharlas adecuadamente puede mejorar significativamente la precisión de las decisiones complejas."
section: primitives
order: 90
tags: ['instructions', 'criteria', 'structure']
source: docs.typesafe.ai/primitives/advanced
translatedFrom: zh
---

## Dónde se pueden usar las estructuras

Los siguientes campos aceptan valores de tipo `string`, `object`, `array` o `null`:

| Campo | Aplica a |
| :--- | :--- |
| `instructions` | Choice, Score, Noul |
| Valores de `criteria` (descripciones de opciones de Choice) | Choice |
| Entradas de `criteria` (descripciones de rangos de Score) | Score |
| `criteria.true` / `criteria.false` | Noul |

**El modelo System One está entrenado para comprender estructuras.** Esto no es una limitación que deba sortearse, sino una capacidad que debe aprovecharse activamente.

## Cuándo usar estructuras

- **Cuando mejoran la claridad.** Cuando una pregunta tiene múltiples partes, usar JSON para colocar cada parte en claves con nombre mejora significativamente la legibilidad frente a concatenar todo en una cadena de plantilla.
- **Cuando la pregunta requiere datos de soporte.** Los esquemas, taxonomías y filas de bases de datos ya son JSON. Envíelos completos o solo los subcampos relevantes, en lugar de serializarlos como cadenas y pasarlos al modelo.

## Instrucciones estructuradas: una descripción de campo reutilizable

Un patrón común consiste en usar un objeto `field` para describir el **campo que se está verificando**, y luego permitir que múltiples preguntas lo referencien mediante claves.

Considere el siguiente ejemplo de validación de facturas. `state` es un texto de factura:

```text
Invoice #4471 issued March 3, 2026 to Beaver Dam Logistics for $12,840.00, net 30.
```

Luego, la **misma forma de `field`** impulsa cuatro tipos diferentes de juicios: un Noul para validar un valor numérico, un Choice para seleccionar un valor de entre candidatos, y dos Scores para colocar el valor en una escala:

```json
{
  "questions": {
    "invoice_number_is_correct": {
      "type": "noul",
      "instructions": {
        "field": {
          "name": "invoice_number",
          "type": "string",
          "description": "The identifier printed on the invoice."
        },
        "extracted_value": "4471",
        "question": "Does `extracted_value` match the `field` as it appears in `source_text`?"
      }
    },
    "customer_name": {
      "type": "choice",
      "instructions": {
        "field": {
          "name": "customer_name",
          "type": "string",
          "description": "The organization the invoice was issued to."
        },
        "question": "Which option is the value of `field` in `source_text`?"
      },
      "criteria": {
        "Beaver Logistics": null,
        "Dam Logistics": null,
        "Beaver Dam Logistics": null,
        "Beaver": null,
        "Dam": null
      }
    },
    "payment_terms": {
      "type": "score",
      "instructions": {
        "field": {
          "name": "payment_terms",
          "type": "integer",
          "unit": "days",
          "description": "Days allowed for payment, from terms such as \"net 30\"."
        },
        "question": "How many days does the `field` in `source_text` allow for payment?"
      },
      "criteria": ["Due on receipt", "Net 15", "Net 30", "Net 60", "Net 90 or longer"]
    }
  }
}
```

El valor de este ejemplo radica en mostrar la **reutilización de la estructura**: se declaran el nombre, el tipo, la unidad y la descripción dentro de `field`, y luego cada pregunta solo necesita especificar «qué juicio realizar». Para escenarios de extracción estructurada, esto es mucho más robusto que escribir una instrucción de lenguaje natural independiente para cada pregunta, ya que la semántica del campo se define solo una vez.

También es digno de mención el Choice `customer_name`: las opciones son un conjunto de **cadenas aproximadas fácilmente confusibles** (Beaver Logistics / Dam Logistics / Beaver Dam Logistics / Beaver / Dam). Este tipo de «seleccionar el correcto entre candidatos similares» es una fortaleza típica de Choice; usar Noul para juzgar uno por uno sería más lento y propenso a inconsistencias.

## Rangos de Score estructurados

Cada elemento del array `criteria` de Score puede ser un objeto para adjuntar información adicional a los rangos (por ejemplo, intervalos numéricos, ejemplos).

## Criterios Noul estructurados

Los `criteria` de Noul son opcionales. Cuando los límites entre sí/no son sutiles, las descripciones estructuradas de `true` y `false` permiten proporcionar definiciones y ejemplos en ambos lados, fijando así los límites con precisión.

## Clasificación jerárquica: Choice en cadena

Para realizar clasificaciones en sistemas de taxonomía profundos, **llame a Choice en cadena capa por capa**, en lugar de cargar todo el árbol de clasificación en las opciones de una sola pregunta.

El procedimiento es: en la primera capa, pregunte por el departamento de nivel superior, donde las opciones son los departamentos y los valores son la estructura del **subárbol** de ese departamento. Consulte `probabilities` para determinar si la división es lo suficientemente cercana; si lo es, explore ambas ramas.

Una vez seleccionado un departamento, la siguiente capa utiliza los hijos de ese departamento como opciones y sus subárboles como valores, repitiendo el proceso hasta llegar a los nodos hoja. En el código, esto puede implementarse como un bucle sobre un diccionario anidado, donde los `criteria` de cada pregunta corresponden al nodo actual.

Existe un cookbook oficial de Clasificación Jerárquica que muestra un recorrido de árbol similar, incluyendo estrategias para mantener múltiples rutas candidatas mediante búsqueda de haz (beam search) cuando las probabilidades son cercanas.

> **Consejo**: Los subárboles pueden volverse muy grandes. Si una rama es demasiado extensa, recorte los valores a sus hijos directos más una pequeña muestra de nodos hoja.

## Relacionado

- [Choice](/es/primitives/choice/) / [Score](/es/primitives/score/) / [Noul](/es/primitives/noul/)
- [Patrón de fan-out](/es/patterns/fan-out/) — Agrupar muchas preguntas en una sola solicitud
- [Cómo construir sistemas con System One](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — Flujo de trabajo completo oficial
