---
title: "Salida estructurada de LLM: modo JSON, llamada a funciones y decisiones tipadas"
description: "Opciones de salida estructurada para aplicaciones de LLM comparadas: modo JSON, decodificación con restricciones de esquema, llamada de funciones y preguntas tipadas TypeSafe, con modos de fallo, coste y cuándo una primitiva de decisión de conjunto cerrado supera pedir a un modelo que emita JSON."
section: cases
order: 205
tags: ['structured-output', 'json-mode', 'function-calling', 'comparison']
translatedFrom: en
---
## El problema que toda aplicación de LLM enfrenta

Un LLM devuelve prosa. Tu aplicación necesita datos: una categoría, un número, un booleano, una
estructura. Todo lo que viene después — enrutamiento, almacenamiento, paneles, reintentos — depende de que esa
prosa se convierta en una salida parseable y válida **cada vez**, no la mayoría de las veces.

El nombre de la industria para esto es **salida estructurada**, y ahora hay cuatro formas principales de obtenerla. Difieren en lo que garantizan, lo que cuestan y lo que se rompe.

## Las cuatro opciones a un vistazo

| Enfoque | Cómo funciona | Garantía | Modo de fallo | Coste relativo |
| :--- | :--- | :--- | :--- | :--- |
| **Prompting for JSON** | Pide al modelo que "responda en JSON" | Ninguna: es una sugerencia | Comas finales, texto alrededor del JSON, campos inventados | 1x generación (puede ser largo) |
| **JSON mode / response_format** | Parámetro de la API que restringe la salida a JSON válido | Sintaxis JSON válida | JSON válido con la forma o tipos incorrectos; deriva de esquema | 1x generación |
| **Schema-constrained decoding** | Restricciones de gramática/expresión regular aplicadas durante el muestreo de tokens | La sintaxis y la forma coinciden con el esquema | Campos rellenados de forma plausible pero semánticamente incorrectos; requiere soporte del servidor | 1x generación + complejidad de servicio |
| **Function calling** | El modelo elige una función declarada y sus argumentos | Argumentos validados frente a tu firma | Valores de argumentos alucinados fuera de los enumerados; fragilidad en múltiples pasos | 1x generación |
| **Typed questions (TypeSafe)** | Preguntas de Elección/Cota/Noul de conjunto cerrado sobre tu estado | Respuesta tipada + distribución de probabilidades completa + confianza, en un solo paso | Solo lo que no preguntaste: las preguntas no hechas no pueden alucinar | Solo entrada de tokens; **la salida es gratuita** |

Los primeros cuatro comparten una propiedad que vale la pena ser honesto al respecto: **el modelo sigue generando la respuesta token por token.** Cada garantía anterior es un guardarronda alrededor de la generación, no un reemplazo para ella. La quinta reemplaza la generación con un único paso hacia adelante que emite una distribución sobre un conjunto cerrado que definiste.

## Por qué los conjuntos cerrados cambian el perfil de fallos

Con el modo JSON, un campo como `"priority": "high"` puede volver como `"High"`, `"HIGH"`,
`"priority_high"`, o `2`. Tú escribes el validador, el bucle de reintento y la alternativa.
Con la decodificación restringida por esquema, la forma es correcta, pero nada verifica que la *valoración*
sea la adecuada — una estructura perfectamente formateada aún puede contener una respuesta incorrecta,
y no tienes señal de cuán seguro estaba el modelo.

Una pregunta tipificada adopta el enfoque opuesto: el espacio de respuestas se fija antes de que exista la solicitud.

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state=ticket_text,
            questions={
                "priority": Choice(
                    instructions="Which priority does this ticket have?",
                    criteria={
                        "p0": "Outage or data loss, all users affected",
                        "p1": "Major feature broken, workaround exists",
                        "p2": "Minor issue, scheduled work",
                    },
                )
            },
        )

    answer = response.answers["priority"]
    print(answer.choice)                            # "p1"
    print(answer.confidence)                        # 0.93 — route on it directly
```

Lo que obtienes de vuelta no es una cadena para analizar. Es un **valor tipado con una distribución de probabilidad sobre exactamente las opciones que declaraste** — `p0: 0.02, p1: 0.93, p2: 0.05` —
más un número de confianza. No hay JSON que validar, no hay enum que normalizar, no hay bucle de reintento para una salida malformada, porque no se puede producir una salida malformada.

## Así se ve en la práctica

**Llamada a funciones con argumentos de enumeración.** Si las firmas de tus funciones ya utilizan
`Literal` tipos, esos conjuntos cerrados se mapean uno a uno sobre las preguntas de Choice — consulta el
[cookbook de llamada a funciones](/en/cases/function-calling/) para un ejemplo completo de asistente de trading
donde el lenguaje natural se convierte en llamadas tipadas con confianza por argumento.

**Pipelines de extracción.** Para extraer valores de los documentos, el mapa de preguntas *es*
el esquema: una entrada por campo, con la semántica definida exactamente una vez. El
[cascada de extracción de datos estructurados](/en/cases/sde-cascade/) muestra una versión de dos etapas
con una pasada de verificación.

**Guardrails y clasificación.** Las preguntas de sí/no (¿es esto un jailbreak? ¿contiene PII?) son preguntas Noul — una probabilidad, no una cadena analizada. Ver [guardrails para LLMs](/en/cases/llm-guardrails/).

**Manejo de la incertidumbre.** La distribución de probabilidad es la parte que el modo JSON no puede darte. [Clasificación usando confianza](/en/cases/classification-using-confidence/) y [enrutamiento con filtro de confianza](/en/patterns/confidence-routing/) muestran lo que habilita: aceptación automática por encima de un umbral, revisión humana por debajo, medido en tus propios datos.

## La tabla honesta de compensaciones

| | Modo JSON / llamada a funciones | Preguntas tipadas |
| :--- | :--- | :--- |
| Generación de texto abierto | Sí — el esquema puede contener cadenas libres | No — las respuestas provienen de conjuntos cerrados |
| Validez de la salida | Validada después de la generación | Garantizada por construcción |
| Señal de confianza | A veces (logprobs, si están expuestos) | Siempre — distribución completa por pregunta |
| Motor de costes | Tokens de salida generados | Solo tokens de entrada (salida gratuita) |
| Cambios en el esquema | Editar esquema JSON, volver a enviar solicitud | Editar mapa de preguntas, misma forma de solicitud |
| Ideal para | Borradores, resúmenes, texto creativo con algo de estructura | Decisiones: clasificación, enrutamiento, puntuación, verificación |

Los dos enfoques se complementan, no compiten. Una tubería que necesita un *brief* generado *y* una decisión de enrutamiento paga por la generación una vez, y toma la decisión con una pregunta tipada en lugar de analizarla a partir del mismo JSON.

## Empezando

- [Primitivas: visión general](/en/primitives/) — Choice, Score, Noul y cuándo aplicar cada uno
- [Referencia de la API HTTP](/en/sdk/http-api/) — las formas de solicitud/respuesta
- [Inicio rápido](/en/quickstart/) — primera pregunta tipificada en cinco minutos
- [Playground](/en/playground/) — prueba preguntas contra el estado en vivo, sin registro

## Relacionado

- [Llamada de funciones](/en/cases/function-calling/) — de lenguaje natural a llamadas de funciones tipadas
- [Extracción en cascada de datos estructurados](/en/cases/sde-cascade/) — extracción en dos etapas con verificación
- [Enrutamiento con control de confianza](/en/patterns/confidence-routing/) — el patrón que permite la distribución
- [Mapa de casos de uso](/en/cases/use-case-map/) — dónde aparece cada primitiva en producción