---
title: "Estado"
description: "State es lo que deseas que el modelo evalúe. Comprende sus tres formas, cómo organizar el contexto y las limitaciones en el soporte de idiomas."
section: concepts
order: 20
tags: ['state', 'context']
source: docs.typesafe.ai/concepts/state
translatedFrom: zh
---

## Qué es el Estado

**State** (Estado) es lo que le pides al modelo de System One que evalúe. Puede ser un mensaje de atención al cliente, un fragmento de texto o el estado actual de tu aplicación. Lo incluyes en el campo `state` de la solicitud de la API junto con las preguntas que deseas formular.

Cada solicitud evalúa **un solo state** contra **una o varias preguntas**. Todas las preguntas ven el mismo state y se evalúan de forma **independiente**. Puedes mezclar preguntas de tipo [Choice](/zh/primitives/choice/), [Score](/zh/primitives/score/) y [Noul](/zh/primitives/noul/) en una única solicitud.

## Tres formas

### Cadena de texto (String)

La forma más sencilla de state es una cadena de texto normal:

```python
state = "My card was charged twice."
```

Es adecuada para escenarios simples donde solo se necesita un fragmento de texto.

### Objeto

Cuando la decisión requiere comparar múltiples partes, utiliza un objeto para agrupar la información relevante, asignando a cada parte un nombre descriptivo:

```json
{
  "ticket": {
    "subject": "Duplicate charge",
    "messages": [
      {"from": "customer", "text": "I was charged twice for order A-104. Please refund the duplicate."},
      {"from": "support", "text": "We are checking the charges."}
    ]
  },
  "order": {
    "id": "A-104",
    "charges": [
      {"amount_usd": 49, "status": "captured"},
      {"amount_usd": 49, "status": "captured"}
    ]
  },
  "refund_policy": "Duplicate charges are eligible for a refund."
}
```

Ten en cuenta que esto es **un solo** state, aunque contenga simultáneamente una conversación, un pedido y una política. La especificación recomienda: **la mayoría de las solicitudes deben usar objetos**, de modo que cada parte tenga un nombre descriptivo y las relaciones entre ellas se mantengan claras.

### Array

Es adecuado para secuencias de mensajes o registros:

```python
state = ["Hi", "My customer number is TS1337.", "My card was charged twice."]
```

| Formato | Adecuado para | Ejemplo |
| :--- | :--- | :--- |
| String | Un mensaje, un artículo, un fragmento de texto | `"My card was charged twice."` |
| Object | Campos nombrados, registros relacionados, estado de la aplicación | Ver JSON anterior |
| Array | Secuencias de mensajes o registros | Ver array anterior |

## Separa el contenido de las preguntas

Este es uno de los modelos mentales más importantes al usar Jev:

- **State contiene el contenido y los hechos de apoyo.** Las solicitudes de reembolso, los registros de pedidos y las políticas de reembolso deben incluirse en el state.
- **Las preguntas definen los juicios que se deben realizar.** «¿Solicita el usuario un reembolso?» y «¿Apoya la política el reembolso?» son preguntas.

No escribas la lógica de juicio dentro del state. El state debería ser lo que presentas cuando pones el material ante un experto: como exponer los hechos a un grupo de expertos y pedirles que emitan sus respectivos juicios.

## Soporte de idiomas

Jev acepta **texto puro**. El state debe ser una cadena de texto, un objeto JSON o un array de texto.

- **No se admiten** imágenes, audio ni vídeo.
- Las entradas no textuales deben preprocesarse primero en texto o campos estructurados antes de transmitirse como state.
- **El idioma principal de entrenamiento de Jev es el inglés.** Se aceptan otros idiomas (incluidos los caracteres chinos, japoneses y coreanos), pero actualmente la precisión es menor.

Este último punto es especialmente importante para los usuarios chinos: si tu negocio implica contenido en chino, se recomienda validar primero la precisión con datos reales antes de decidir si se pone en producción la ruta crítica. Para decisiones de alto riesgo, considera añadir un resumen en inglés dentro del state o derivar a un agente humano cuando la confianza sea baja.

## Presupuesto y límites

- Contexto por solicitud de 64k tokens: cubre el `state` más **todas** las preguntas.
- 32k tokens: cubre el `state` más **la pregunta más larga**.
- El modelo lee el state una sola vez y luego evalúa todas las preguntas en paralelo. Por lo tanto, empaquetar varias preguntas en una sola solicitud tiene casi cero coste adicional en latencia; consulta el [patrón de fan-out](/zh/patterns/fan-out/).
- La precisión puede variar a medida que crece el state; hay una discusión específica al respecto en la sección `Jev 1.13 jaggedness`.

## Relacionado

- [Primitivas de pregunta](/zh/primitives/) — Cómo organizar las preguntas con instrucciones y criterios
- [Confianza](/zh/concepts/confidence/) — Controla el comportamiento mediante los valores devueltos
- [Referencia de la API](https://docs.typesafe.ai/api) — Esquema de la solicitud
