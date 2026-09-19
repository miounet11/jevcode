---
title: "5 minutos para empezar"
description: "Obtén la clave de la API, realiza la primera llamada a Jev usando cURL o el SDK y comprende la estructura de la respuesta."
section: start
order: 20
tags: ['quickstart', 'api', 'sdk']
source: docs.typesafe.ai/introduction/quickstart
translatedFrom: zh
---

## Paso 1: Prueba en el Playground

Abre [Playground](https://console.typesafe.ai/playground) e inicia sesión. Pega cualquier texto en el campo **state**:

```text
Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing.
I'm losing sales. Please help ASAP.
```

A continuación, añade una pregunta de tipo Noul:

```json
{
  "urgency": {
    "type": "noul",
    "instructions": "Does this message express urgency?"
  }
}
```

Obtendrás inmediatamente un valor entre 0 y 1. Un valor cercano a 1 indica que el modelo considera que la respuesta es «sí».

El valor del Playground radica en la **prueba rápida**: combina preguntas de los tres tipos (Noul, Choice, Score) y observa todos los resultados en una sola llamada para confirmar que la redacción de las preguntas cumple tus expectativas.

## Paso 2: Obtén la clave de API

Crea una clave en el [panel de control](https://console.typesafe.ai/settings/keys) y configura la variable de entorno:

```bash
export TYPESAFE_API_KEY="sk-..."
```

## Paso 3: Llama a la API

Todos los modelos se sirven desde el mismo punto de conexión:

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Ejemplo mínimo ejecutable con cURL:

```bash
curl -X POST https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": "Hi, I have been trying to connect my Stripe account for 3 days and it keeps failing. I am losing sales. Please help ASAP.",
    "questions": {
      "department": {
        "type": "choice",
        "instructions": "Which team should handle this",
        "criteria": {
          "billing": "Payment or subscription issues",
          "technical": "Bugs or integration problems",
          "sales": "Pricing or account questions"
        }
      },
      "frustration": {
        "type": "score",
        "instructions": "How frustrated the customer appears",
        "criteria": [
          "Calm, just stating facts",
          "Frustrated but civil",
          "Very angry, strong language"
        ]
      },
      "is_urgent": {
        "type": "noul",
        "instructions": "The message conveys urgency"
      }
    }
  }'
```

## Paso 4: Usa el SDK (recomendado)

El SDK lee `TYPESAFE_API_KEY` de las variables de entorno de forma predeterminada y llama a `jev-latest` por defecto.

### Python

```bash
pip install typesafe-sdk     # o uv add typesafe-sdk
```

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state={"document": "I was charged twice. Please fix this ASAP."},
            questions={
                "billing": Noul(instructions="Is this ticket about billing?"),
                "tone": Choice(
                    instructions="What is the customer's tone?",
                    criteria={"calm": None, "frustrated": None, "angry": None},
                ),
                "urgency": Score(
                    instructions="How urgent is this ticket?",
                    criteria=["can wait", "this week", "today"],
                ),
            },
        )

    print(response.nouls["billing"].noul)
    print(response.choices["tone"].choice)
    print(response.scores["urgency"].score)
```

### TypeScript / JavaScript

```bash
npm install @typesafe-ai/sdk    # requiere Node.js 20+
```

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

Una gran ventaja del SDK de TypeScript es que **los tipos de respuesta se derivan automáticamente de las preguntas**: los `questions` que pasas determinan el tipo de valor devuelto, lo que permite detectar errores en los nombres de los campos durante la compilación.

## Aspecto de la respuesta

El tipo de cada respuesta está determinado por el `type` de la pregunta:

| Tipo | Campo devuelto | Significado |
| :--- | :--- | :--- |
| `choice` | `choice` / `probabilities` / `confidence` | Opción seleccionada, distribución de probabilidades de cada opción, confianza |
| `score` | `score` / `legend` / `probabilities` / `confidence` | Posición de la puntuación (puede caer entre dos niveles), descripción de los niveles, distribución de probabilidades, confianza |
| `noul` | `noul` | Probabilidad de que la respuesta sea «sí»; no incluye `confidence` |

Restricción clave: **la respuesta siempre se encuentra dentro de las opciones que proporcionaste**. El modelo devuelve una distribución de probabilidades sobre las opciones que definiste, por lo que no genera valores fuera de ese conjunto. Por ello, no necesitas escribir analizadores para recuperar el significado en tu código.

## Errores comunes

- **El `state` solo se lee una vez**: el modelo lee el state una vez y luego evalúa todas las preguntas en paralelo. Por lo tanto, agrupa varias preguntas en una sola solicitud lo antes posible; el costo de latencia adicional es prácticamente nulo.
- **Las entradas no textuales deben convertirse primero**: las imágenes, el audio y el vídeo deben convertirse a texto o a campos estructurados antes de pasarlos como state.
- **Límites que devuelven 429**: el SDK oficial reintenta automáticamente con backoff y respeta la cabecera `retry-after`; si llamas directamente a la API HTTP, debes implementar esta lógica tú mismo.

## Siguientes pasos

- [Primitiva Choice](/es/primitives/choice/) — Base para clasificación y enrutamiento
- [Primitiva Score](/es/primitives/score/) — Puntuación y ordenación
- [Primitiva Noul](/es/primitives/noul/) — Validación y barreras de seguridad
- [Confianza](/es/concepts/confidence/) — Controla el comportamiento del sistema mediante la confianza
