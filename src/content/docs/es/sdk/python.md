---
title: "SDK de Python"
description: "Instala typesafe-sdk y llama a la API de System One utilizando el cliente síncrono o asíncrono."
section: sdk
order: 20
tags: ['python', 'sdk', 'async']
source: docs.typesafe.ai/sdk/python
translatedFrom: zh
---

## Instalación

```bash
# Con uv
uv add typesafe-sdk

# O con pip
pip install typesafe-sdk
```

A continuación, configura la variable de entorno (crea una clave en [console](https://console.typesafe.ai/)):

```bash
export TYPESAFE_API_KEY="sk-..."
```

El cliente leerá automáticamente esta variable de entorno y llamará a `jev-latest` por defecto.

## Cliente asíncrono (recomendado)

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state={"document": "Me han cobrado dos veces. Por favor, arreglen esto lo antes posible."},
            questions={
                "billing": Noul(instructions="¿Este ticket trata sobre facturación?"),
                "tone": Choice(
                    instructions="¿Cuál es el tono del cliente?",
                    criteria={"calm": None, "frustrated": None, "angry": None},
                ),
                "urgency": Score(
                    instructions="¿Qué tan urgente es este ticket?",
                    criteria=["puede esperar", "esta semana", "hoy"],
                ),
            },
        )

    print(response.nouls["billing"].noul)
    print(response.choices["tone"].choice)
    print(response.scores["urgency"].score)
```

Ten en cuenta tres puntos:

1. `state` puede recibir directamente una cadena, un diccionario o una lista; el SDK se encarga de la serialización.
2. Los tres tipos de preguntas se construyen con `Noul(...)` / `Choice(...)` / `Score(...)`; el campo `type` se rellena automáticamente por el SDK.
3. **La respuesta se agrupa por tipo de pregunta** — `response.nouls`, `response.choices`, `response.scores`, indexados cada uno por el nombre de la pregunta.

## Constructores de preguntas

| Constructor | Parámetros | Descripción |
| :--- | :--- | :--- |
| `Noul(instructions, criteria=None)` | `criteria` opcional, `{ true, false }` | Probabilidad de Sí/No |
| `Choice(instructions, criteria)` | `criteria` es `{ Opción: descripción o None }` | Selecciona una opción de un conjunto fijo |
| `Score(instructions, criteria)` | `criteria` es un **array ordenado** | Puntuación en niveles ordenados |

## Cliente síncrono

Si tu entorno no permite el uso de async, también hay una versión síncrona:

```python
from typesafe_sdk import TypeSafeClient, Noul

client = TypeSafeClient()

response = client.system_one(
    state="Me han cobrado dos veces.",
    questions={"billing": Noul(instructions="¿Esto trata sobre facturación?")},
)

print(response.nouls["billing"].noul)
```

## Errores y reintentos

El SDK reintentará automáticamente siguiendo una estrategia de retroceso (backoff) y respetará el encabezado `retry-after` devuelto por el servidor. Esto es mucho más cómodo que llamar directamente a la API HTTP: la limitación de velocidad (rate limiting) se ajusta dinámicamente y la documentación oficial indica explícitamente que los límites pueden cambiar en cualquier momento.

## Relacionado

- [Referencia completa de la API del SDK de Python](https://docs.typesafe.ai/sdk/python/api/clients/async/client)
- [Inicio rápido en 5 minutos](/es/quickstart/)
- [Fan-out paralelo](/es/patterns/fan-out/) — Haz múltiples preguntas a la vez
