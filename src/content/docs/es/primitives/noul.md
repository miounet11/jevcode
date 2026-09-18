---
title: "Noul"
description: "Noul permite al modelo evaluar una pregunta de sí/no, devolviendo la probabilidad de que la respuesta sea «sí». Es en sí mismo un valor entre 0 y 1, sin incluir una confianza separada."
section: primitives
order: 40
tags: ['noul', 'verification', 'guardrails']
source: docs.typesafe.ai/primitives/noul
translatedFrom: zh
---

## Cuándo usarlo

Utiliza Noul cuando la respuesta sea **sí o no**. Por ejemplo:

- ¿Este mensaje está solicitando un reembolso?
- ¿Menciona este currículum experiencia en sistemas distribuidos?
- ¿Contiene este comentario información de identificación personal (PII)?

Si la respuesta es una de un conjunto de opciones, utiliza [Choice](/zh/primitives/choice/); si es una posición en un espectro, utiliza [Score](/zh/primitives/score/).

Ejemplos típicos de preguntas:

```text
"Is the customer requesting a refund?"
"Does this resume mention experience with distributed systems?"
"Does the message contain personally identifiable information?"
"Does the room have a minifridge?"
```

## Parámetros

| Campo | Obligatorio | Descripción |
| :--- | :--- | :--- |
| `type` | Sí | Debe ser `"noul"` |
| `instructions` | Sí | La pregunta o afirmación de sí/no a evaluar |
| `criteria` | No | Descripciones opcionales de `{ true, false }` para aclarar qué representan el «sí» y el «no» |

`criteria` es opcional. `instructions` suele ser suficiente para la mayoría de las preguntas Noul; úsalo solo para fijar el significado de ambos resultados cuando la frontera entre el «sí» y el «no» es sutil. **Se recomienda probar ambas formulaciones** para ver cuál funciona mejor con tus datos.

## Ejemplo de solicitud

```python
from typesafe_sdk import Noul, TypeSafeClient

client = TypeSafeClient()

response = client.system_one(
    state=ticket_conversation,
    questions={
        "is_human_escalation": Noul(
            instructions="Is the customer asking to speak to a human?",
        ),
        "is_repeat_contact": Noul(
            instructions="Has this customer contacted us about this issue before?",
        ),
    },
)

print(response.nouls["is_human_escalation"].noul)
```

## Valor de retorno

```json
{
  "model": "jev-latest",
  "answers": {
    "is_human_escalation": {
      "type": "noul",
      "noul": 0.99
    },
    "is_repeat_contact": {
      "type": "noul",
      "noul": 0.93
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

El valor de `noul` oscila entre 0 y 1, representando la probabilidad de que la respuesta sea **«sí»**. En el código, cuando se requiere una decisión binaria, suele convertirse a booleano aplicando un umbral.

## Noul no devuelve una confianza separada

Esta es una diferencia clave con los otros dos primitivos: **Noul es la probabilidad en sí misma**, por lo que no hay un campo `confidence` adicional.

- Cercano a 1: «Sí» fuerte
- Cercano a 0: «No» fuerte
- Cercano a 0.5: Probabilidades similares para sí y no

## La redacción lo es todo

**Haz que las altas probabilidades correspondan al «sí».** La recomendación oficial es formular las preguntas de manera que el significado del valor devuelto sea inequívoco. Si se formula como «¿No es esto urgente?», un valor de 0.9 significa «no urgente», lo que puede llevar fácilmente a los lectores del código a interpretarlo incorrectamente. Si se formula como «¿Es esto urgente?», 0.9 significa urgente.

**Define un criterio de juicio claro.** Por ejemplo, con «¿Es el candidato fuerte en Python?»: primero debes definir qué significa «fuerte». Una definición poco clara hará que las probabilidades sean difíciles de interpretar.

**0.5 no equivale a «nivel medio».** Este es el error más común: 0.5 indica que el modelo no puede distinguir entre sí o no, no que haya «la mitad de nivel». Para medir el grado de habilidad, debes usar [Score](/zh/primitives/score/) para puntuar en niveles definidos.

**Puedes formular las instrucciones como afirmaciones a evaluar.** Además de preguntas, también puedes escribir las instrucciones como una afirmación para que el modelo evalúe su veracidad. Por ejemplo, para el hecho de «el cliente está solicitando un reembolso», al formularlo como afirmación, un valor cercano a 1 indica que la afirmación es verdadera. **Se recomienda probar ambas formulaciones con tus propios datos.**

## Relacionado

- [Choice](/zh/primitives/choice/) — Opciones fijas no ordenadas
- [Score](/zh/primitives/score/) — Puntuación en una escala ordenada
- [Confianza](/zh/concepts/confidence/) — Por qué Noul no tiene confianza
- [Uso de Noul en guardrails](https://docs.typesafe.ai/patterns) — Biblioteca de patrones oficiales
