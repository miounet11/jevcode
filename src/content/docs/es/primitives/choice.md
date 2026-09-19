---
title: "Elección"
description: "Choice selecciona una opción de un conjunto fijo de opciones. La respuesta incluye la opción seleccionada, la probabilidad de cada opción y la confianza."
section: primitives
order: 20
tags: ['choice', 'classification', 'routing']
source: docs.typesafe.ai/primitives/choice
translatedFrom: zh
---

## Cuándo usarlo

Utiliza `Choice` cuando la respuesta cae dentro de **un conjunto fijo de opciones mutuamente excluyentes**. Por ejemplo:

- Qué equipo debe gestionar este ticket
- A qué categoría pertenece un producto
- En qué lenguaje está escrito este fragmento de código

Si la respuesta es una posición en un espectro continuo, utiliza [Score](/es/primitives/score/); si es simplemente sí o no, utiliza [Noul](/es/primitives/noul/).

Ejemplos típicos de preguntas:

```text
"What programming language is this code written in"
  → options: python, javascript, typescript, go, rust, other

"What type of meeting is this based on the title and description"
  → options: standup, planning, retrospective, one on one, brainstorm, none of the above
```

## Parámetros

| Parámetro | Obligatorio | Descripción |
| :--- | :--- | :--- |
| `type` | Sí | Debe ser `"choice"` |
| `instructions` | Sí | La pregunta en sí, que explica la decisión a tomar |
| `criteria` | Sí | Definición de las opciones. Formato de objeto `{ NombreOpción: Descripción }`, donde la descripción puede ser `null` |

Cada elemento dentro de `instructions` y `criteria` puede ser una **cadena de texto, un objeto o un array**. Comienza con cadenas de texto; cuando una opción requiere múltiples instrucciones (qué cubre, qué no cubre, ejemplos), cambia a un objeto.

## Ejemplo de solicitud

Clasificar tickets de soporte por departamento:

```python
from typesafe_sdk import Choice, TypeSafeClient

client = TypeSafeClient()

ticket = "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing."

response = client.system_one(
    state=ticket,
    questions={
        "department": Choice(
            instructions="Which team should handle this ticket?",
            criteria={
                "returns": "Refunds, wrong or damaged items",
                "shipping": "Delivery status, delays, lost packages",
                "billing": "Charges, invoices, payment problems",
            },
        ),
    },
)

print(response.answers["department"].choice)
```

## Valor devuelto

```json
{
  "model": "jev-latest",
  "answers": {
    "department": {
      "type": "choice",
      "choice": "billing",
      "probabilities": {
        "returns": 0.02,
        "shipping": 0.05,
        "billing": 0.93
      },
      "confidence": 0.91
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

| Campo | Significado |
| :--- | :--- |
| `choice` | El nombre de la opción seleccionada |
| `probabilities` | La distribución de probabilidad para cada opción |
| `confidence` | Un valor resumido de la concentración de esa distribución, entre 0 y 1 |

`probabilities` es la materia prima necesaria para definir métricas más útiles por tu cuenta; consulta [Confianza](/es/concepts/confidence/) para más detalles.

## Puntos clave de uso

**Proporciona siempre una opción de respaldo.** Añade `other` o `none of the above` para permitir que el modelo tenga una salida cuando ninguna de las otras opciones sea adecuada, en lugar de obligarlo a elegir la menos incorrecta. Esto reduce significativamente los errores en casos extremos.

**Define los «límites» en las descripciones de las opciones.** El valor de la descripción radica en delimitar qué se incluye y qué no. En el ejemplo anterior, `billing` dice «Charges, invoices, payment problems», en lugar de la vaga «cosas relacionadas con el dinero».

**Si los nombres de las opciones son suficientemente claros, la descripción puede ser `null`.** Por ejemplo, para una clasificación de tono en tres categorías: `{ "calm": null, "frustrated": null, "angry": null }`. El propio nombre de la opción ya es inequívoco; una descripción adicional podría introducir ruido.

**Las preguntas especulativas no tienen un costo adicional.** En el siguiente ejemplo más complejo, `return_reason` solo tiene sentido si `department` es `returns`, y `shipping_issue` solo tiene sentido si es `shipping`. Sin embargo, colocarlos todos al principio en la misma solicitud no ralentiza el proceso: el modelo evalúa todas las preguntas en paralelo. A estas preguntas se les llama **preguntas especulativas** (speculative questions).

**Para clasificaciones jerárquicas profundas, usa llamadas en cadena.** Si necesitas clasificar documentos en una jerarquía profunda o un sistema de categorías amplio, encadena las preguntas `Choice` capa por capa. Existe un cookbook oficial que explica cómo ejecutar una búsqueda por haz (beam search) sobre las probabilidades de `Choice`: en cada capa, se conservan los K mejores caminos candidatos, en lugar de elegir greedymente solo uno.

## Relacionado

- [Score](/es/primitives/score/) — Puntuación en una escala ordenada
- [Noul](/es/primitives/noul/) — Probabilidad de sí/no
- [Patrón de enrutamiento de intenciones](/es/patterns/intent-routing/) — El uso más común de Choice en producción
- [Confianza](/es/concepts/confidence/) — Controla el comportamiento usando `probabilities` y `confidence`
