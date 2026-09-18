---
title: "Patrones de arquitectura"
description: "Patrones de arquitectura para construir sistemas con TypeSafe. Aprender a pensar en «decisiones atómicas discretas» es clave para desbloquear todo su valor."
section: patterns
order: 10
tags: ['patterns', 'architecture']
source: docs.typesafe.ai/patterns
translatedFrom: zh
---

## Idea central

TypeSafe está diseñado para ser **incorporado en sistemas más amplios** con el fin de tomar decisiones. La habilidad clave es: **pensar en términos de decisiones discretas y atómicas**, y luego combinar esas decisiones para generar comportamientos de sistema complejos.

Esto significa que no debes intentar resolver un problema empresarial complejo con una sola llamada; en su lugar, divídelo en varias decisiones independientes y combínalas mediante tu propio código. La lógica de combinación en el código es determinista, testeable y ajustable; esta es precisamente la fuente de la fiabilidad.

Antes de leer esta sección, asegúrate de comprender los [Primitivos de Prompt](/zh/primitives/) y la [Confianza](/zh/concepts/confidence/).

## Cuatro patrones

| Patrón | Qué hace | Beneficio |
| :--- | :--- | :--- |
| [Fan-out paralelo](/zh/patterns/fan-out/) | Envía muchas preguntas (incluyendo especulativas) en una sola llamada; el código determina cuáles son relevantes | Coste, velocidad |
| [Enrutamiento por confianza](/zh/patterns/confidence-routing/) | Utiliza la confianza como un segundo eje de decisión para construir sistemas más seguros | Fiabilidad, seguridad |
| [Puntuación compuesta](/zh/patterns/composite-scoring/) | Combina múltiples dimensiones de análisis en una única puntuación | Coste, fiabilidad, velocidad |
| [Enrutamiento por intención](/zh/patterns/intent-routing/) | Clasifica la intención del usuario y la enruta hacia el procesador adecuado | Coste, velocidad |

## Cómo interactúan

Estos cuatro patrones no son opciones mutuamente excluyentes, sino componentes que se pueden superponer. Un sistema de producción típico utilizará varios de ellos simultáneamente:

```text
Solicitud del usuario
   │
   ├─ [Enrutamiento por intención] Primero determina qué tipo de solicitud es ──┐
   │                                                                        │
   ├─ [Fan-out paralelo] Realiza todas las decisiones necesarias de una vez ──┤
   │                                                                        │
   ├─ [Puntuación compuesta] Clasifica y ordena los resultados candidatos según múltiples dimensiones ┤
   │                                                                        │
   └─ [Enrutamiento por confianza] Ejecución automática si la confianza es alta / Escalado a humano si es baja ┘
```

El **enrutamiento por intención** suele ir al principio, ya que determina qué cadenas de procesamiento son necesarias posteriormente. El **fan-out paralelo** se mantiene a lo largo de todo el proceso, ya que agrupar preguntas en una sola llamada tiene casi cero costo de latencia adicional. La **puntuación compuesta** se utiliza cuando es necesario ordenar los resultados. El **enrutamiento por confianza** actúa como la última barrera, decidiendo si el resultado se ejecuta automáticamente o se escala a un humano.

## Principios de diseño

**Descomposición atómica.** Haz una sola pregunta por cada aspecto. Las preguntas compuestas que parecen «más convenientes de hacer de una vez» te impedirán identificar en qué parte falla el modelo y evitarán que puedas ajustar cada parte por separado.

**El código se encarga de la combinación, el modelo de la decisión.** Los pesos, los umbrales y la lógica de ramificación deben estar en tu código. Estas son las partes que necesitas poder leer, probar y ajustar.

**Haz visible la incertidumbre.** En lugar de forzar al modelo a dar una respuesta, utiliza la confianza para exponer la «incertidumbre» a nivel de sistema, permitiendo que tu código decida cómo manejarla.

## Relacionado

- [Primitivos de Prompt](/zh/primitives/) — Conocimiento previo
- [Confianza](/zh/concepts/confidence/) — Conocimiento previo
- [Casos de uso en el ecosistema](/zh/cases/use-case-map/) — Cómo se utilizan estos patrones en proyectos reales
