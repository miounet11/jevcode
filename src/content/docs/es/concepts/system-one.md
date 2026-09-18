---
title: "Modelo System One"
description: "System One es una categoría de modelos diseñados para la toma de decisiones rápidas y estructuradas. Jev es el primero, y su salida puede ser consumida directamente por el software."
section: concepts
order: 10
tags: ['system-one', 'architecture']
source: docs.typesafe.ai/concepts/system-one
translatedFrom: zh
---

## Definición

Los modelos System One son una categoría de modelos de IA diseñados específicamente para **tomar decisiones rápidas y estructuradas que el software puede utilizar directamente**. Jev es el modelo insignia de TypeSafe y el primer modelo System One.

El problema central que resuelven es que los modelos de lenguaje tradicionales generan texto libre, mientras que el software requiere valores de tipos definidos. System One internaliza este proceso de conversión dentro del modelo: la declaración del problema especifica el tipo de salida, y el modelo devuelve resultados bajo restricciones.

## Responsabilidades entre System One y System Two

Esta nomenclatura se inspira en la teoría de los dos sistemas de la ciencia cognitiva, con un significado directo:

| | System One | System Two |
| :--- | :--- | :--- |
| Características | Rápido, intuitivo, enfocado | Lento, cauteloso, multi-paso |
| Tareas típicas | Juicio, clasificación, puntuación, validación | Razonamiento complejo, planificación en cadena larga |
| Latencia | Baja y predecible | Más alta, aumenta con la longitud del pensamiento |
| Salida | Tipada y restringida | Texto libre |
| Costo | Bajo | Alto |

No son relaciones de sustitución. La práctica típica en sistemas de producción consiste en delegar la mayoría de las decisiones de alta frecuencia a System One, y solo escalar a System Two o a intervención humana cuando realmente se requiere un razonamiento profundo.

## Ejemplo completo: Solicitud de reembolso

El flujo de trabajo descrito en la documentación oficial ilustra bien cómo colaboran estas dos capas:

1. **Construir el estado** — Empaquetar los mensajes del servicio al cliente, los registros de transacciones relevantes y la política de reembolsos en un estado.
2. **Consultas paralelas** — Hacer tres preguntas independientes simultáneamente: si el usuario solicita un reembolso, si las pruebas indican un cobro duplicado y si la política permite el reembolso.
3. **Combinación en el código** — Combinar las tres respuestas con verificaciones deterministas de negocio, y luego enrutar la ejecución hacia la acción automática o la revisión humana.

Observe la **independencia** de las preguntas en el paso 2: las tres preguntas no se interfieren entre sí y pueden enviarse en una sola solicitud. Esta es la premisa que permite empaquetarlas en una única llamada.

## Por qué las salidas tipadas son tan críticas

Dado que los modelos System One devuelven **salidas tipadas y restringidas en lugar de texto libre**, su código puede verificar y combinar directamente estas respuestas, construyendo flujos de trabajo predecibles.

Comparemos la complejidad del código en dos enfoques de integración:

```python
# Enfoque tradicional: requiere análisis, validación y manejo de excepciones de formato
raw = llm.complete("Is this ticket about billing? Answer yes or no.")
is_billing = raw.strip().lower().startswith("y")  # Frágil, muchos casos límite

# System One: el valor ya es tipado
response = client.system_one(
    state=ticket,
    questions={"billing": Noul(instructions="Is this ticket about billing?")},
)
is_billing = response.nouls["billing"].noul  # float, 0..1
```

El valor devuelto en el segundo caso es un tipo determinado dentro del dominio definido: `Choice` será siempre una de las opciones proporcionadas, `Score` caerá dentro del rango de niveles especificado, y `Noul` será siempre un número de punto flotante entre 0 y 1.

## Confianza: permitir que el modelo diga «No estoy seguro»

Las respuestas de los modelos System One incluyen [confidence](/es/concepts/confidence/), por lo que puede decidir cuándo ejecutar directamente y cuándo escalar a un humano o a un modelo de razonamiento. Esto es fundamental para construir sistemas confiables: **si un sistema no puede expresar honestamente su incertidumbre, no puede ser confiable**.

## Cómo llamar a la API

Llame a través del [SDK](/es/sdk/) o la API HTTP:

```http
POST https://api.typesafe.ai/v1/systemone
```

El campo `model` en la solicitud selecciona el modelo específico. El alias predeterminado es `jev-latest`.

## Lecturas adicionales

- [State](/es/concepts/state/) — Cómo organizar el contexto enviado al modelo
- [Primitivas de pregunta](/es/primitives/) — Tres tipos de preguntas tipadas
- [Patrones de arquitectura](/es/patterns/) — Cómo organizar estas llamadas en entornos de producción
- [Cómo construir sistemas System One](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — Guía oficial de flujo de trabajo completo
