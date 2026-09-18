---
title: "Enrutamiento de intenciones"
description: "Las solicitudes clasificadas se enrutan al procesador más adecuado: lógica determinista, LLM especializado o intervención humana."
section: patterns
order: 20
tags: ['routing', 'classification', 'cost']
source: docs.typesafe.ai/patterns/intent-routing
translatedFrom: zh
---

## ¿Qué problema resuelve este patrón?

No todas las solicitudes de los usuarios requieren el mismo procesador. Algunas pueden responderse con una sola consulta a la base de datos; otras necesitan un LLM con contexto de dominio; y otras deben ser procesadas manualmente.

TypeSafe puede colocarse **delante** de todos estos procesadores, actuando como una capa rápida y económica de clasificador que decide cuál debe invocarse.

**Motivación principal de costos**: En lugar de enviar cada mensaje a un LLM costoso para determinar qué tipo de solicitud es, primero se clasifica y luego se enruta según el tipo.

## Ejemplo: Enrutamiento de atención al cliente

Imagina un sistema de atención al cliente donde los mensajes entrantes deben ser dirigidos al procesador correcto.

### Paso 1: Clasificar intención y complejidad

Una solicitud puede preguntar simultáneamente por la intención, la complejidad y varias decisiones auxiliares:

```json
{
  "questions": {
    "intent": {
      "type": "choice",
      "instructions": "The primary intent of this customer message",
      "criteria": {
        "order_status": "Asking about an existing order",
        "product_question": "Asking about a product before buying",
        "return_exchange": "Wants to return or exchange something",
        "complaint": "Unhappy about an experience"
      }
    },
    "bug_severity": {
      "type": "score",
      "instructions": "How severe is the reported issue",
      "criteria": [
        "Cosmetic; no impact to functionality",
        "Broken or degraded feature; workaround exists",
        "Blocking issue; no workaround exists"
      ]
    },
    "has_reproducible_steps": {
      "type": "noul",
      "instructions": "The user describes specific steps to reproduce the issue"
    },
    "refund_requested": {
      "type": "noul",
      "instructions": "The user is explicitly asking for a refund or credit"
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated the user appears",
      "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
    }
  }
}
```

### Paso 2: Enrutamiento según los resultados de la clasificación

```python
intent = response.answers["intent"]

if intent.choice == "order_status":
    # La lógica determinista es suficiente: consultar la base de datos
    lookup_order_status(state["order_id"])

elif intent.choice == "product_question":
    # Se necesita contexto de dominio: enviar al LLM con conocimiento del catálogo
    answer_with_catalog_llm(state)

elif intent.choice == "return_exchange":
    start_return_flow(state["order_id"])

elif intent.choice == "complaint":
    # Alto riesgo: derivar a un agente humano
    route_to_human_agent(state)
```

## Por qué la clasificación previa ahorra dinero

La clave es **reservar el procesamiento costoso solo para las solicitudes que realmente lo necesitan**.

Supongamos que el 70 % de los mensajes de atención al cliente son del tipo `order_status`, que pueden resolverse con una única consulta a la base de datos. Si todos los mensajes se envían primero al modelo grande, estás pagando el costo del LLM para ese 70 %, cuando en realidad no lo necesitan. Realizar una clasificación económica mediante Choice permite desviar ese tráfico.

Aquí es donde entra en juego el [patrón de fan-out](/zh/patterns/fan-out/): se formulan todas las preguntas de clasificación, severidad, solicitud de reembolso y estado emocional de una vez, ya que hacer más preguntas no añade costos de latencia.

## Puntos clave de diseño

**La salida de la clasificación debe ser directamente utilizable.** El valor de `intent.choice` debe poder usarse directamente como clave en la tabla de enrutamiento, sin necesidad de procesamiento adicional de cadenas.

**La granularidad de la clasificación determina la complejidad del sistema.** Si hay pocas categorías, el enrutamiento carece de distinción; si hay demasiadas, el número de muestras por categoría disminuye y la precisión baja. Comienza con 4–6 categorías.

**Envía las inferencias especulativas en paralelo.** En el ejemplo anterior, `bug_severity` y `has_reproducible_steps` solo tienen sentido bajo ciertas intenciones, y `refund_requested` solo es relevante en escenarios de reembolso. Enviarlas todas por adelantado tiene un costo casi nulo. Este es el valor del [fan-out paralelo](/zh/patterns/fan-out/).

**Usa la confianza como puerta de validación secundaria.** Si `intent.confidence` es baja, indica que la clasificación en sí no es fiable. En ese caso, no se debe enrutar ciegamente, sino derivar a un agente humano o solicitar aclaraciones. Consulta [enrutamiento por confianza](/zh/patterns/confidence-routing/) para más detalles.

**Mantén una categoría de respaldo.** Añade una opción como `other` a la clasificación para que las solicitudes que no coincidan con ningún tipo de procesador tengan un destino adecuado, en lugar de ser forzadas a la categoría más cercana.

## Relacionado

- [Choice](/zh/primitives/choice/) — El primitivo base de este patrón
- [Fan-out paralelo](/zh/patterns/fan-out/) — Realizar todas las preguntas auxiliares de una sola vez
- [Enrutamiento por confianza](/zh/patterns/confidence-routing/) — Qué hacer cuando la clasificación no es fiable
- [Puntuación compuesta](/zh/patterns/composite-scoring/) — Patrón complementario cuando se requiere ordenación
