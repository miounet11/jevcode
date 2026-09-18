---
title: "Mapa de capacidades y casos de uso del ecosistema"
description: "Mapa de capacidades de Jev organizado por escenarios, con casos reales de proyectos en producción. Descubre en qué contextos otros desarrolladores utilizan cada tipo de primitiva."
section: cases
order: 10
tags: ['use-cases', 'ecosystem', 'production']
source: docs.typesafe.ai/concepts/use-case-map + awesome-jev
translatedFrom: zh
---

## Cómo usar este mapa

Encuentra primero el escenario más cercano a tu negocio, observa qué primitivas utilizan otros en ese escenario y qué problemas resuelven, y luego aplícalo a tus propios documentos y acciones.

A continuación, para cada escenario se presenta: **¿Qué problema resuelve** → **Qué primitiva usar** → **Proyecto real**.

> Para ver el **índice completo de proyectos de la comunidad organizados por categoría** (con estrellas y etiquetas de idioma), consulta [Proyectos del ecosistema de la comunidad](/zh/ecosystem/).

## Clasificación y enrutamiento

**Problema**: Cuando llega una solicitud, es necesario determinar a qué categoría pertenece para luego enrutarla a diferentes cadenas de procesamiento.

**Primitiva**: Choice (Clasificación), la confianza se utiliza para el control de acceso (gatekeeping).

**Proyectos reales**:

- [Notra](https://github.com/usenotra/notra) — Análisis de marketing: Plataforma GEO en producción que utiliza el interruptor `NOTRA_JEV_CLASSIFIERS` para migrar el clasificador de visibilidad de marca desde LLM a la decisión booleana de Jev, con un umbral de 0.5.
- [jev-router](https://github.com/gargpratyush/jev-router) — Herramienta de desarrollo: Permite a Jev seleccionar entre modelos candidatos, enrutando así las tareas de Claude Code al modelo más económico y capaz.
- [jev-router (prismhq)](https://github.com/prismhq/jev-router) — Infraestructura LLM: Router de código abierto basado en LiteLLM que utiliza decisiones de Jev para seleccionar qué modelo atiende cada solicitud.
- [pi-jev-router](https://github.com/mejiasd3v/pi-jev-router) — Agente de codificación: Añade la capacidad de enrutamiento automático de modelos por solicitud al agente de codificación Pi, tomando decisiones a través de Jev en Vercel AI Gateway.
- [jcm-router](https://github.com/adarshmishra07/jcm-router) — Agente de codificación: Agente local que utiliza decisiones de Jev para seleccionar el modelo Claude y la intensidad de razonamiento para cada mensaje, manteniendo al mismo tiempo la caché de chat principal sin contaminación.

> **Observación**: El enrutamiento de modelos es la dirección de aplicación más densa en este escenario. El patrón común es «utilizar una decisión Choice económica para reemplazar una costosa llamada a modelo o un juicio humano».

## Puntuación y ordenación

**Problema**: Es necesario ordenar un conjunto de elementos según relevancia, calidad o criterios multidimensionales.

**Primitiva**: Score, combinado con [puntuación compuesta](/zh/patterns/composite-scoring/) para fusionar múltiples dimensiones.

**Proyectos reales**:

- [jev-bfs](https://github.com/komikat/jev-bfs) — Herramienta de búsqueda: Encuentra la ruta de enlaces entre dos entradas de Wikipedia en inglés haciendo que Jev ordene los enlaces salientes de cada página, mientras Python controla el proceso de búsqueda.
- [Jev Search](https://github.com/superagents-lab/jev-search) — Búsqueda web: Utiliza Noul de Jev para puntuar la relevancia de los títulos y resúmenes de los resultados de Search1API.

## Validación y barreras de seguridad

**Problema**: El trabajo generado por IA o agentes, las llamadas a herramientas y las entradas/salidas deben ser verificadas antes de avanzar.

**Primitiva**: Noul (Sí/No), conversión a booleano mediante umbral.

**Proyectos reales**:

- [jev-review](https://github.com/devagrawal09/jev-review) — Ingeniería de software: Flujo de trabajo de revisión de código por fases y tablero local. Jev actúa como filtro en cada fase de revisión; los cambios solo pueden avanzar una vez aprobados.
- [pi-jev](https://github.com/y0usaf/pi-jev) — Seguridad de agentes: Añade un umbral medible para las llamadas a herramientas al agente de codificación Pi, verificando las llamadas de riesgo a través de Jev antes de la ejecución.
- [OpenWork](https://github.com/different-ai/openwork) — Flujo de trabajo de ingeniería: Integra Jev en su kit de pruebas eval como árbitro de validación, asegurando que el trabajo generado por agentes esté sujeto a veredicios tipados en lugar de modelos de texto.
- [jev-guard](https://github.com/leepokai/jev-guard) — Seguridad de agentes: Protección contra inyección de prompts y acciones peligrosas para agentes como Claude Code, Codex, Pi y ACP. Jev decide qué interceptar.

## Toma de decisiones de agentes

**Problema**: Para cada paso de un agente, se necesita una capa de juicio rápida, tipada y explicable sobre qué hacer.

**Primitiva**: Choice (Selección de acción), Score/Noul como apoyo.

**Proyectos reales**:

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — Automatización de navegador: El agente ultra rápido de browser-use, donde Jev decide cada acción y qué elemento hacer clic, llamando al modelo de lenguaje solo cuando es necesario introducir texto.
- [pi-typesafe-jev](https://github.com/legacybridge-tech/pi-typesafe-jev) — Agente de codificación: Expone los juicios de System One como cinco herramientas Pi, permitiendo al modelo realizar juicios semánticos de ámbito reducido, mientras el código y los usuarios mantienen el control sobre umbrales, pesos y acciones.
- [jev-judgment](https://github.com/HyunjunJeon/jev-judgment) — Agente de codificación: Envía los juicios de agentes de codificación cerrados a Jev, manteniendo el veredicto tipado, económico y comparable entre diferentes entornos de ejecución.
- [limpet](https://github.com/noplan-inc/limpet) — Agente de codificación: Hook de detención (Stop hook). Previene que el agente termine prematuramente al utilizar el juicio de Jev para evaluar las condiciones de finalización en lenguaje natural.
- [robo-harness](https://github.com/grmkris/robo-harness) — Robótica: Mesa de trabajo para el brazo robótico SO-101. Jev decide qué pasos articulares acotados seleccionar de las acciones candidatas tipadas, sujeto a restricciones presupuestarias.

## Moderación de contenido y cumplimiento

**Problema**: Determinar si el contenido viola normas, contiene información sensible o cumple con las políticas.

**Primitiva**: Noul.

Hay pocos proyectos reales registrados (esta dirección aún está en etapas tempranas), pero la forma típica es consistente con el escenario de barreras de seguridad: formular preguntas como «¿contiene información de identificación personal?» o «¿viola las políticas?» como Noul, convertirlas a booleano según el umbral y proceder con un flujo determinista.

## Etiquetado de datos y evaluación

**Problema**: Etiquetar conjuntos de datos o evaluar la calidad de las salidas de los modelos.

**Primitiva**: Las tres clases.

**Proyectos reales**:

- Consulte los proyectos de evaluación en «Puntuación y ordenación» y «Validación y barreras de seguridad» (como el uso del kit de pruebas eval de OpenWork).

## Juegos y simulaciones

**Problema**: En entornos en tiempo real, cada fotograma o punto de decisión requiere una verificación rápida.

**Primitiva**: Choice (Selección de acción).

**Proyectos reales**:

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — Ver arriba.
- [jev-drone](https://github.com/RomanSlack/jev-drone) — Simulación de robótica: Dron autónomo con visión de cámara única en MuJoCo. Integra el modelo de juicio de Jev en el bucle de control, con una frecuencia de 2.5 Hz.
- [tsai-sc](https://github.com/phyous/tsai-sc) — Juego: Controla la versión compartida original de StarCraft mediante teclado y ratón, registrando las probabilidades de acción de Jev en cada decisión.

> **Observación**: Estos escenarios son los más sensibles a la latencia. El bucle de control de 2.5 Hz de `jev-drone` demuestra que la latencia de Jev ya es adecuada para entrar en cadenas de control en tiempo real.

## Investigación de modelos base

**Problema**: Replicar o investigar formas de modelo como System One, que «produce decisiones tipadas en una sola propagación hacia adelante».

**Proyectos reales**:

- [decider](https://github.com/Mapika/decider) — Modelo abierto: Fine-tuning de Qwen3.5-2B para replicar la forma de System One, produciendo decisiones tipadas con probabilidades calibradas en una sola propagación hacia adelante.
- [openjev](https://github.com/zhihz/openjev) — Investigación abierta: Vista previa local independiente que responde preguntas de probabilidad bilingüe basándose en el contexto, la pregunta y las respuestas candidatas, inspirado por TypeSafe Jev.
- [Parallel Constrained Decoding (Qwen2.5-1B-RLCD)](https://huggingface.co/spaces/drinkmoonshine/parallel-constrained-decoding) — Investigación abierta: Demo de Qwen2.5-1B entrenado con RLCD, explorando el uso de la decodificación paralela con restricciones de código abierto como alternativa a Jev.

## Infraestructura y SDK

**Problema**: Integrar Jev en pilas tecnológicas existentes.

**Proyectos reales**:

- Consulte la [categoría Infra / SDKs / Integrations de awesome-jev](https://github.com/yibie/awesome-jev/blob/main/categories/infra-sdks-integrations.md), que recopila enlaces a lenguajes, integraciones de agentes y adaptaciones de gateways.

## Las cuatro direcciones del mapa de capacidades oficial

TypeSafe clasifica oficialmente los casos de uso en cuatro grandes direcciones, que vale la pena consultar al diseñar escenarios:

**Software automatizado por IA** — Interleaving de IA y software confiable para que pueda ejecutarse en segundo plano millones de veces sin necesidad de un copiloto humano. **El código controla el flujo de ejecución, mientras TypeSafe maneja las decisiones semánticas y la comprensión del lenguaje.**

**Aplicaciones en tiempo real** — La inteligencia de vanguardia alcanza velocidades en tiempo real (150ms), lo que significa que las decisiones de IA pueden ser más rápidas que la percepción humana, siendo lo suficientemente rápidas para programarse en juegos o integrarse en la interfaz de usuario.

**AI Map Reduce sobre grandes datos** — Una reducción de costos de 100 veces permite procesar conjuntos de datos masivos: recuperar información relevante en grandes corpus, clasificar trayectorias masivas de agentes y extraer características para la predicción.

**Validación general de IA** — Validar prompts de entrada, resultados de extracción, trayectorias de razonamiento y llamadas a herramientas de cualquier otra IA. Detectar patrones de error como jailbreaks, errores de referencia y alucinaciones, con un costo que representa solo una pequeña fracción de las llamadas reales a LLM.

## Relacionado

- [Patrones de arquitectura](/zh/patterns/) — Los patrones generales detrás de estos casos
- [Primitivas de problemas](/zh/primitives/) — Cómo elegir las primitivas
- [Lista completa de awesome-jev](https://github.com/yibie/awesome-jev) — Lista actualizada continuamente de proyectos de la comunidad
