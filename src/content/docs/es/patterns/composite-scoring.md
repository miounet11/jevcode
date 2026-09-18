---
title: "Puntuación combinada"
description: "Descompone las decisiones complejas en puntuaciones atómicas y combínalas en el código utilizando pesos bajo tu control total."
section: patterns
order: 40
tags: ['score', 'ranking', 'weights']
source: docs.typesafe.ai/patterns/composite-scoring
translatedFrom: zh
---

## ¿Qué problema resuelve este patrón?

A menudo necesitamos ordenar un conjunto de elementos **simultáneamente según múltiples dimensiones**. Definir directamente una «puntuación global» como una única pregunta es contraproducente: la puntuación proporcionada por el modelo es ininterpretable y no sabes por qué ha realizado ese ordenamiento.

El enfoque de puntuación combinada consiste en desglosar el juicio en dimensiones independientes, puntuar cada una por separado y luego combinarlas en el código utilizando **pesos controlados por ti**.

## Ejemplo: Filtrado de currículums

Imagina que estás procesando currículums para puestos de ingeniería y deseas ordenar a los candidatos según varios criterios para seleccionar los primeros X que pasarán a la siguiente ronda.

### Paso 1: Puntuar cada dimensión de forma independiente

En una sola llamada, solicita cuatro Scores: `python_depth`, `team_leadership`, `system_design`, `generalist`, definiendo los rangos (tiers) de cada dimensión por separado.

### Paso 2: Combinar usando pesos

```python
py      = response.answers["python_depth"].score / 4
lead    = response.answers["team_leadership"].score / 4
arch    = response.answers["system_design"].score / 4
general = response.answers["generalist"].score / 4

# Senior IC (Contribuidor Individual Senior)
ic_score = (0.40 * py) + (0.10 * lead) + (0.40 * arch) + (0.10 * general)

# Engineering Manager (Gerente de Ingeniería)
em_score = (0.15 * py) + (0.40 * lead) + (0.20 * arch) + (0.25 * general)
```

Cada dimensión se normaliza primero a 0–1 y luego se aplica el peso.

## El verdadero valor de este patrón

Obtener un resultado ordenado mediante ponderación es solo un beneficio superficial. **El verdadero valor es la interpretabilidad.**

Observa cómo dos puestos diferentes utilizan **el mismo conjunto de puntuaciones, pero con pesos distintos**. Esto implica que:

- Una sola llamada sirve a dos direcciones de contratación simultáneamente, sin duplicar los costos;
- Si el resultado del ordenamiento no coincide con las expectativas, puedes ajustar los pesos directamente, sin necesidad de redefinir el prompt;
- Cuando alguien cuestiona «¿por qué este candidato está en primer lugar?», puedes mostrar la distribución de las puntuaciones por dimensión y los pesos aplicados.

**No se pierde ningún detalle de cada dimensión.** Un candidato con fuerte dominio de Python pero débil liderazgo de equipos quedará posicionado más alto para un puesto de IC y más bajo para un puesto de EM; esta diferencia está codificada en los pesos, no es una nueva evaluación del modelo.

## Depuración paso a paso

Los pesos ofrecen otra ventaja práctica: **puedes ordenar por una dimensión individual para investigar anomalías.** Si el ordenamiento global parece incorrecto, ordene primero solo por `python_depth` y verifique si coincide con la intuición. Si no coincide, el problema reside en la definición de los rangos de esa dimensión, no en los pesos. Esta capacidad de descomposición es algo que no se logra preguntando directamente al modelo por un «gran problema».

Si descubres que una dimensión tiene poca capacidad de distinción (todos los candidatos se concentran en el mismo rango), indica que la definición de los rangos debe reescribirse, no que los pesos deban ajustarse.

## Interacción con la confianza

Cada Score de dimensión incluye `confidence`. Una dimensión con baja confianza es una señal: o bien la definición de los rangos es ambigua, o bien falta información en el estado para realizar el juicio.

Una práctica útil es: si la confianza de una dimensión de alto peso está por debajo de un umbral, marcar al candidato como «requiere revisión humana» en lugar de permitir que una puntuación poco fiable domine el ordenamiento.

## Puntos clave de diseño

**Las dimensiones deben ser ortogonales.** Si dos dimensiones están altamente correlacionadas (por ejemplo, «Profundidad en Python» y «Habilidad de programación»), la ponderación calculará dos veces el mismo aspecto. Al diseñar las dimensiones, pregúntate: ¿puede variar esta dimensión de forma independiente?

**Normaliza los pesos para que sumen 1.** Facilita la comprensión y el ajuste.

**Normaliza antes de ponderar.** El número de rangos suele variar entre dimensiones; sin normalización, las dimensiones con más rangos tendrían una influencia desproporcionada.

**Los pesos son una decisión de negocio, no técnica.** ¿Quién decide la diferencia de pesos entre un puesto de IC y uno de EM? Debería ser el área de negocio (contratante), no el ingeniero. Configura los pesos como parámetros ajustables.

## Relacionado

- [Score](/zh/primitives/score/) — La primitiva base de este patrón
- [Fan-out paralelo](/zh/patterns/fan-out/) — Preguntar por todas las dimensiones en una sola llamada
- [Confianza](/zh/concepts/confidence/) — Manejo de puntuaciones de dimensión poco fiables
