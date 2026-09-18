---
title: "SDK de JavaScript / TypeScript"
description: "Instala @typesafe-ai/sdk para llamar a la API de System One con un cliente que utiliza inferencia de tipos automática."
section: sdk
order: 30
tags: ['javascript', 'typescript', 'sdk']
source: docs.typesafe.ai/sdk/javascript
translatedFrom: zh
---

## Instalación

Se requiere Node.js 20 o una versión posterior:

```bash
npm install @typesafe-ai/sdk
```

Crea el cliente después de configurar las variables de entorno:

```bash
export TYPESAFE_API_KEY="sk-..."
```

## Uso básico

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "Me han cobrado dos veces. Por favor, arreglen esto lo antes posible." },
  questions: {
    category: choice("¿De qué trata este ticket?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

## Inferencia de tipos

Esta es la parte más valiosa del SDK de TS: **los tipos de las respuestas se infieren automáticamente a partir de las preguntas que proporcionas**.

```ts
questions: {
  category: choice("¿De qué trata este ticket?", {
    billing: null,
    technical: null,
    other: null,
  }),
}
```

Dado que las claves de `criteria` son `billing` / `technical` / `other`, el tipo de `response.answers.category.choice` es la unión de estos tres tipos literales. Escribir `"bililng"` generará un error en tiempo de compilación, en lugar de devolver `undefined` en tiempo de ejecución.

De manera similar, las preguntas construidas con `score(...)` tendrán `score`, `legend`, `probabilities` y `confidence` en sus respuestas; mientras que las construidas con `noul(...)` solo tendrán `noul`.

Esto significa que **no necesitas definir manualmente los tipos de las respuestas** ni tratar lo que devuelve la API como `any`.

## Estructura de la respuesta

```ts
response.answers.category.choice;        // Opción seleccionada
response.answers.category.probabilities; // Probabilidades de cada opción
response.answers.category.confidence;    // Nivel de confianza
```

Todos los tipos de preguntas se indexan de forma unificada bajo `response.answers` por el nombre de la pregunta, y los campos específicos dependen del tipo de pregunta.

## Estructura del paquete

El SDK proporciona simultáneamente tres tipos de artefactos: ESM, CommonJS y archivos de declaración de TypeScript, por lo que puede usarse directamente en diversos entornos de compilación.

Si deseas conocer todas las opciones y sus valores predeterminados, consulta el [client](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/client.ts) y los [types](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/types.ts) del SDK.

## Relacionado

- [Inicio rápido en 5 minutos](/zh/quickstart/)
- [Primitivas de preguntas](/zh/primitives/) — Formas de construir los tres tipos de preguntas
- [Fan-out paralelo](/zh/patterns/fan-out/) — Realizar múltiples preguntas en una sola llamada
