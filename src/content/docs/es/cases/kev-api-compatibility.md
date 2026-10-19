---
title: "Compatibilidad de la API Kev: un informe de conformidad de terceros"
description: "Kev-0.8B (MLX, M1 Pro) supera los 32 requisitos MUST del conjunto de pruebas de conformidad de la API Jev de terceros — 255 opciones, 10 niveles de puntuación, baterías de preguntas mixtas, análisis de typesafe-sdk — con las dos notas de nivel SHOULD que el autor archivó."
section: cases
order: 225
tags: ['compatibility', 'conformance', 'kev', 'api']
translatedFrom: en
---
## Compatibilidad que puedes probar, no compatibilidad que afirmas

«Compatible con la API Jev» es fácil de decir y difícil de verificar. Así que un miembro de la comunidad lo escribió como una especificación comprobable: [jevcompat](https://github.com/mandu5/jevcompat)
— 48 requisitos para el contrato `POST /v1/systemone`, cada uno citando la documentación de TypeSafe, el archivo OpenAPI o el código fuente del SDK. Luego se ejecutó el conjunto de pruebas contra los ocho servidores de código abierto más destacados que implementan la API.

**Kev-0.8B (`2874258`, MLX, M1 Pro) es uno de los dos servidores que aprueban cada MUST: 32/32**, incluyendo:

- opciones de elección aceptadas hasta el límite de 255 opciones
- niveles de puntuación aceptados hasta el límite de 10 niveles
- resolución de alias `model: "jev-latest"`
- baterías mixtas — preguntas noul, choice y score en una sola solicitud, respuestas claveadas por tus ids
- ida y vuelta de texto no ASCII a través de los nombres de opciones
- el parsing oficial `typesafe-sdk` de cada tipo de respuesta sin modificaciones

Informe completo con cada intercambio registrado:
[results/kev/report.md](https://github.com/mandu5/jevcompat/blob/main/results/kev/report.md)
— servir comando y pesos en [RUN.md](https://github.com/mandu5/jevcompat/blob/main/results/kev/RUN.md),
reproducible en tu propia máquina.

## Lo que la conformidad no cubre

El suite también rastrea los requisitos de nivel SHOULD (Kev pasa 10 de 12; los dos
errores son respuestas de auth-error, no probadas porque la ejecución reportada se ejecutó con auth
apagado, y una verificación adicional no se ejercitó porque el servidor nunca produjo el
error que cubre). Las dos notas de nivel SHOULD que el autor archivó de vuelta son la parte
más interesante, porque ambos son lugares donde una respuesta idéntica en bytes puede
ser aún una respuesta peor:

**Normalización de la confianza de la puntuación.** Kev calcula la confianza de la puntuación como
`1 − E|level − mode| / (L − 1)`; los ejemplos documentados de TypeSafe calculan
`1 − E|level − mode| / D`, donde `D` es la dispersión de la distribución. Misma evidencia,
diferente denominador — medido en una pregunta de 3 niveles, Kev devolvió una confianza
de 0.7535 mientras que la fórmula de referencia da 0.260. Un cliente que compare números
de confianza entre diferentes backends verá distribuciones distintas para una calidad
de juicio idéntica. Si enrutas basándote en umbrales absolutos (el
patrón [confidence-routing](/en/patterns/confidence-routing/)), calibra por
backend — o enruta basándote en la distribución en bruto, que ambos backends exponen.

**La degradación de contexto largo es una propiedad del modelo, no una violación de la especificación.** El conjunto de pruebas pasa; la precisión más allá del contexto de entrenamiento de 384 tokens de Kev no se mantiene en la especificación. En las selecciones TypeSafe del conjunto, Kev-9B obtuvo 0.92 dentro del contexto de entrenamiento, pero 0.75–0.79 en documentos más largos (Kev-4B: 0.88 / 0.88 / 0.81); véase la [receta de contexto largo](https://github.com/jaredpalmer/kev/issues/48) para el desglose completo y las correcciones propuestas por el autor. La guía de [diseño de estado](/en/concepts/state/) se aplica a cualquier backend: mantén el estado del tamaño de la decisión, no del tamaño de la página.

## El punto más amplio

El especificación de 48 requisitos es independiente del backend. Si estás evaluando Kev frente a otros servidores de API Jev autoalojados, ejecuta el mismo conjunto de pruebas y compara los números en lugar de los READMEs. Las dos implementaciones conformes también discrepan de formas medibles fuera del especificación — forma de la distribución de confianza, retención de contexto largo —, lo cual es exactamente el tipo de cosas que un informe de conformidad hace visible y una cuadrícula de características oculta.

## Empezando

- [Kev en GitHub](https://github.com/jaredpalmer/kev) — la familia de modelos 0.8B–9B
- [especificación jevcompat](https://github.com/mandu5/jevcompat/blob/main/SPEC.md) — los 48 requisitos
- [referencia de la API HTTP](/en/sdk/http-api/) — el contrato oficial que se está probando
- [enrutamiento con umbral de confianza](/en/patterns/confidence-routing/) — enrutamiento basado en distribuciones, calibración por backend
- [pruebas de autoconsistencia](/en/cases/consistency-choice-cookbook/) — prueba de estrés de cualquier backend de la misma manera