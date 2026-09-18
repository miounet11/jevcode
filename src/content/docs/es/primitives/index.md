---
title: "Vista general de las primitivas de problema"
description: "Los tres tipos de preguntas tipadas: Choice, Score y Noul, qué devuelve cada uno y cómo elegir."
section: primitives
order: 10
tags: ['primitives', 'choice', 'score', 'noul']
source: docs.typesafe.ai/primitives
translatedFrom: zh
---

## Los primitivos aparecen en pares

Los primitivos de TypeSafe son pequeños componentes tipados que combinas en tu código. Aparecen en pares:

- **Pregunta (question)**: Define una decisión que el modelo de System One debe tomar sobre el **estado**.
- **Respuesta (answer)**: El valor tipado devuelto por el modelo.

Combinas estas respuestas en tu código para tomar decisiones. Existen tres tipos de preguntas, cada una devuelve respuestas con formas diferentes.

| Tipo | ¿Qué responde? | Devuelve |
| :--- | :--- | :--- |
| [Choice](/zh/primitives/choice/) | ¿Cuál de estas opciones? | `choice`, `probabilities`, `confidence` |
| [Score](/zh/primitives/score/) | ¿En qué categoría cae? | `score`, `legend`, `probabilities`, `confidence` |
| [Noul](/zh/primitives/noul/) | ¿Es esto verdadero? | `noul` (0 a 1) |

Puedes hacer una sola pregunta o enviar varias a la vez. Cada pregunta se evalúa de forma independiente.

## Cómo elegir el primitivo

La clave para elegir un primitivo es observar la **forma de la decisión**, no el dominio empresarial:

- **El conjunto de candidatos es finito y mutuamente excluyente** → Choice. Por ejemplo, clasificación de tickets, reconocimiento de intención, selección de acción.
- **Existe una dimensión o gradiente de calidad ordenado** → Score. Por ejemplo, relevancia, severidad, satisfacción.
- **Solo necesitas una decisión de sí/no, y permite ambigüedad** → Noul. Por ejemplo, «¿Este contenido viola las normas?», «¿El usuario está solicitando un reembolso?».

Un error común es usar Score para lo que debería ser Choice. Si no existe una relación de orden real entre las categorías (por ejemplo, «Facturación / Técnico / Ventas»), usa Choice; forzar el uso de Score introduce una semántica ordinal falsa, lo que hace que las decisiones basadas en umbrales posteriores pierdan sentido.

Por el contrario, si existe un gradiente continuo, usar Score es más eficiente que ensamblar múltiples Noul, ya que Score proporciona la distribución completa de una sola vez.

## Dos propiedades clave de las respuestas

**Cada respuesta está restringida a las opciones que proporcionas.** El modelo devuelve una distribución de probabilidad sobre las opciones o categorías que diste, y nunca genera valores fuera de ese conjunto. Esto significa que no necesitas extraer el valor a partir de texto generado en tu código: esta es la diferencia fundamental entre Jev y «hacer que un LLM genere JSON y luego analizarlo».

**Cada respuesta es independiente.** La respuesta de una pregunta no se convierte en un contexto oculto para otra pregunta. Esta restricción garantiza que:

- El orden de evaluación de las preguntas no afecta al resultado;
- Puedes hacer muchas preguntas a la vez de forma segura (incluidas aquellas que solo tienen sentido en ciertas ramas), sin preocuparte por la contaminación mutua;
- La semántica de cada respuesta puede probarse y validarse por separado.

La segunda propiedad tiene una consecuencia muy práctica: **las preguntas especulativas son casi gratuitas**. Por ejemplo, en un escenario de tickets, `bug_severity` solo tiene sentido si el ticket es un informe de error, y `refund_requested` solo tiene sentido si se trata de un problema de facturación. Pero colocarlos todos al principio en la misma solicitud no implica una pérdida de velocidad: el modelo evalúa todas las preguntas en paralelo, y tú solo lees la respuesta correspondiente cuando la necesitas.

## Hacer varias preguntas a la vez

```json
{
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
  "frustration": {
    "type": "score",
    "instructions": "How frustrated the user appears",
    "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
  },
  "refund_requested": {
    "type": "noul",
    "instructions": "The user is explicitly asking for a refund or credit"
  }
}
```

Una sola llamada devuelve tres respuestas independientes. El código dirige el flujo según `intent` y luego lee los campos necesarios de los resultados ya obtenidos.

## Avanzado

- [Uso avanzado de primitivos](/zh/primitives/advanced/) — Cómo escribir criterios, técnicas de redacción y manejo de casos límite
- [Patrón de dispersión (fan-out)](/zh/patterns/fan-out/) — Cómo agrupar muchas preguntas en una sola solicitud
- [Confianza](/zh/concepts/confidence/) — Controla el comportamiento usando `confidence` y `probabilities`
