---
title: "Paralelismo fan-out"
description: "Enviar un gran número de preguntas (incluyendo las especulativas) en una sola llamada, y dejar que el código determine cuáles son relevantes."
section: patterns
order: 50
tags: ['fan-out', 'latency', 'cost']
source: docs.typesafe.ai/patterns/fan-out
translatedFrom: zh
---

## ¿Qué problema resuelve este patrón?

El enfoque tradicional consiste en «clasificar primero y luego decidir qué preguntar a continuación según el resultado de la clasificación». Esto requiere llamadas en serie: la primera llamada devuelve un resultado y solo entonces sabes qué preguntar en la segunda, lo que acumula latencia.

El patrón de fan-out paralelo invierte esto: **envía todas las preguntas posibles de una sola vez**, y tu código decide cuáles ignorar según los resultados de la clasificación. Dado que el modelo solo lee el estado una vez y evalúa todas las preguntas en paralelo, el costo marginal de hacer varias preguntas es extremadamente bajo.

## Mecanismos clave

Estos tres hechos son la base del patrón fan-out:

1. El modelo **lee el estado una sola vez** y luego evalúa todas las preguntas en paralelo.
2. **Cada respuesta es independiente**: la respuesta a una pregunta no se convierte en un contexto oculto para otra pregunta.
3. El presupuesto de contexto es de 64k tokens (estado + todas las preguntas) o 32k tokens (estado + la pregunta individual más larga).

El punto 2 es especialmente importante: garantiza que enviar preguntas no relacionadas junto con preguntas relevantes no contamine las respuestas de estas últimas.

## Ejemplo: distribución de tickets de soporte

Necesitas procesar tickets de atención al cliente, pero diferentes tipos de tickets requieren criterios de decisión completamente distintos. En lugar de clasificar primero y luego hacer preguntas de seguimiento, es mejor preguntar todo de una vez.

### Paso 1: hacer todas las preguntas en una sola solicitud

```json
{
  "questions": {
    "category": {
      "type": "choice",
      "instructions": "What kind of request is this?",
      "criteria": {
        "bug_report": "Reporting something broken",
        "billing": "Payment, invoice, or refund matters",
        "feature_request": "Asking for new functionality"
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

Aquí, `bug_severity` y `has_reproducible_steps` solo tienen sentido si el ticket es un informe de error; `refund_requested` solo tiene sentido si se trata de un problema de facturación. **Son preguntas especulativas**, pero dado que hacer más preguntas no tiene costo de velocidad, se pueden plantear todas por adelantado.

### Paso 2: enrutar con código

```python
category = response.answers["category"]
bug_severity = response.answers["bug_severity"]
bug_repro = response.answers["has_reproducible_steps"]
refund = response.answers["refund_requested"]
frustration = response.answers["frustration"]

if category.choice == "bug_report":
    if bug_severity.score > 1.5 and bug_repro.noul > 0.6:
        escalate_to_engineering(ticket_id, severity="high")
    else:
        add_to_bug_backlog(ticket_id)

elif category.choice == "billing":
    if refund.noul > 0.7:
        route_to_billing_with_flag(ticket_id, refund_likely=True)
    else:
        route_to_billing(ticket_id)

elif category.choice == "feature_request":
    log_feature_request(ticket_id)

# Independientemente de la categoría, frustration es útil
if frustration.score > 1.5:
    flag_for_priority_response(ticket_id)
```

**Toda la información necesaria para el árbol de decisión completo proviene de una sola llamada.** Las preguntas especulativas se ignoran cuando no son relevantes y, cuando lo son, ahorran una ida y vuelta.

## Puntos de diseño

**Preguntar todo primero, luego filtrar.** Retrasa la decisión sobre «qué preguntas vale la pena hacer» desde antes de la llamada hasta después de la llamada. Antes de la llamada no conoces el resultado de la clasificación, por lo que no puedes decidir; después de la llamada ya tienes las respuestas, y el filtrado se convierte en una simple bifurcación de código.

**Ten en cuenta el presupuesto de contexto.** Los 64k tokens incluyen el estado más **todas** las preguntas. Si vas a hacer fan-out de cientos de preguntas (por ejemplo, para puntuar un conjunto de documentos uno por uno), el estado crecerá rápidamente. En ese caso, deberías dividir la solicitud en varias llamadas o considerar [el uso por lotes de Score](https://docs.typesafe.ai/patterns).

**Distingue entre «especulativo» y «redundante».** Las preguntas especulativas son aquellas que tienen un **significado claro incluso bajo otras ramas**. Si la respuesta a una pregunta nunca la leerás en ninguna rama, no se llama especulativa, sino desperdicio: aunque el costo es bajo, desordena el código.

**Úsalo junto con el enrutamiento por confianza.** El fan-out resuelve «qué preguntar», y el enrutamiento por confianza resuelve «en qué creer». La combinación de ambos es una forma común en sistemas de producción: consulta el ejemplo de banco de voz en [enrutamiento por confianza](/es/patterns/confidence-routing/).

## Relacionado

- [Primitivas de pregunta](/es/primitives/) — Independencia y preguntas especulativas
- [State](/es/concepts/state/) — Presupuesto de contexto y organización del estado
- [Enrutamiento por confianza](/es/patterns/confidence-routing/) — El segundo eje de decisión
