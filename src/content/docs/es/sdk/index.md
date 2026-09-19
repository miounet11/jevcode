---
title: "SDK e integración"
description: "SDKs de cliente oficiales, la elección de la API HTTP y las habilidades para agentes de codificación de IA."
section: sdk
order: 10
tags: ['sdk', 'api']
source: docs.typesafe.ai/sdk
translatedFrom: zh
---

## Tres formas de integración

| Método | Adecuado para | Características |
| :--- | :--- | :--- |
| [Python SDK](/es/sdk/python/) | Servicios backend, pipelines de datos, procesamiento por lotes | Clientes síncronos/asíncronos, entrada tipada, reintento automático |
| [JavaScript SDK](/es/sdk/javascript/) | Servicios Node.js, aplicaciones full-stack | Inferencia de tipos TypeScript, el tipo de respuesta se deriva automáticamente de la pregunta |
| HTTP API | Otros lenguajes, integración ligera | POST directo, requiere gestionar manualmente los reintentos y la limitación de tasa |

Si tu equipo cuenta con un agente de codificación con IA que escribe el código de integración, se recomienda instalar primero la [habilidad para agentes TypeSafe](/es/sdk/agent-skill/), para que el agente conozca la forma exacta de las solicitudes y respuestas, evitando que escriba código basándose en suposiciones.

## Convenciones comunes

Todos los SDK comparten el mismo conjunto de convenciones:

- **Endpoint**: `POST https://api.typesafe.ai/v1/systemone`
- **Autenticación**: Se lee desde la variable de entorno `TYPESAFE_API_KEY`, no es necesario pasarla en el código
- **Modelo predeterminado**: `jev-latest` (resuelto a la última versión estable)
- **Reintento**: Por defecto, reintenta según una estrategia de retroceso exponencial y respeta la cabecera `retry-after` en la respuesta

## Requisitos de versión

- Python SDK: nombre del paquete `typesafe-sdk`
- JS SDK: nombre del paquete `@typesafe-ai/sdk`, requiere Node.js 20 o posterior

El JS SDK ofrece tres tipos de artefactos: ESM, CommonJS y archivos de declaración de TypeScript.

## Llamada directa a la API HTTP

Si no utilizas un SDK, debes gestionar por tu cuenta dos aspectos que los SDK ya incluyen de forma integrada:

**Reintento por limitación de tasa.** Se devuelve `429 Too Many Requests` si se superan los 250.000 tokens/segundo o 1.200 solicitudes/minuto. La respuesta puede incluir la cabecera `retry-after`, la cual debes respetar para aplicar el retroceso.

**Análisis de la respuesta.** La estructura del valor devuelto es un objeto de respuestas indexado por el nombre de la pregunta, donde cada tipo de pregunta tiene su propia forma de campos. Consulta la [referencia de la API](https://docs.typesafe.ai/api) para más detalles.

## Relacionado

- [Python SDK](/es/sdk/python/)
- [JavaScript SDK](/es/sdk/javascript/)
- [Agent skill](/es/sdk/agent-skill/)
- [Inicio rápido en 5 minutos](/es/quickstart/) — Ejemplo completo y funcional
