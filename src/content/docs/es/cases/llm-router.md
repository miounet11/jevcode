---
title: "Enrutador LLM: elegir el manejador con una decisión tipada"
description: "Cómo enviar cada petición a un modelo o a una persona. Siempre el modelo más grande, reglas de palabras clave, un enrutador por embeddings, un modelo de chat que nombra una etiqueta, y un choice de clavue-jev más una pregunta de confidence. Se ramifica sobre esa opción."
section: cases
order: 235
tags: ['llm-router', 'model-routing', 'routing', 'comparison']
translatedFrom: en
---

## La decisión delante del modelo

Un enrutador LLM no responde al usuario. Elige el manejador que responde. El mismo buzón tiene una corrección de errata, una pregunta de diseño y un mensaje que debe ir a una persona. Enviar los tres al modelo más grande funciona. La corrección de errata paga el precio del modelo grande.

Esto se busca como **enrutador LLM** y **enrutado de modelos**. Lo que se elige es un conjunto cerrado que ya nombraste: un modelo pequeño, un modelo grande, una consulta, una persona. Esa elección es un valor sobre el que el programa puede ramificar.

## Cinco formas de obtener la ruta

| Enfoque | Cómo se elige la ruta | Qué puede fallar | Qué pagas |
| :--- | :--- | :--- | :--- |
| **Cada petición a un solo modelo** | No hay enrutador | Los trabajos pequeños pagan el precio del modelo grande | Ese modelo, cada vez |
| **Palabras clave o regex** | Una lista de palabras apunta a un manejador | Una paráfrasis no cae en la lista | Nada extra en el momento de la petición |
| **Enrutador por embeddings** | Gana la descripción de ruta más cercana | Las descripciones se alejan de los manejadores | Una llamada de embedding, más el índice |
| **Un modelo de chat nombra la etiqueta** | Le pides que conteste con un nombre | El nombre puede quedar fuera del conjunto, o llegar envuelto en prosa | La entrada y la salida de ese modelo |
| **Choice tipado (clavue-jev)** | Un `choice` sobre los manejadores listados, más una pregunta `confidence` | Solo puede devolver un manejador que listaste | Tokens de entrada tras una llamada correcta. La salida es gratis |

Las reglas de palabras clave bastan cuando las palabras no se mueven. Un enrutador por embeddings encaja si ya mantienes las descripciones de ruta. Un modelo de chat encaja cuando la ruta misma tiene que ser una frase. Un choice tipado encaja cuando la ruta es uno de pocos manejadores y la línea siguiente tiene que leerla.

## La petición que acepta este sitio

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

```json
{
  "state": "Rename this function and add a test. Do not change behavior.",
  "questions": {
    "route": {
      "type": "choice",
      "instructions": "Which handler should run this request?",
      "options": ["small_model", "large_model", "human"]
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that routing judgment?"
    }
  }
}
```

`state` es texto, de 8 a 4000 caracteres. `questions` tiene como mucho seis. Las claves empiezan con una letra minúscula. Un choice puede enviar `options` o un mapa `criteria`. Este servidor pliega `options` en criteria antes de que el modelo los vea.

Se cobra por tokens de entrada tras una llamada correcta. La salida es gratis. Las cifras están en [precios](/es/pricing/).

Una respuesta nombra el modelo y devuelve cada respuesta bajo la misma clave:

```json
{
  "model": "clavue-jev",
  "answers": {
    "route": { "choice": "small_model" },
    "sure": { "noul": 0.78 }
  }
}
```

`route.choice` es una de las opciones que enviaste. `sure.noul` es un número de 0 a 1 y viene de la pregunta de confidence. Esta API no esconde una confidence dentro del choice. El `0.78` de arriba muestra la forma del campo. No es una exactitud medida, y este sitio no publica un umbral único.

Ramifica sobre los dos campos. El umbral lo pones tú:

```python
route = body["answers"]["route"]["choice"]
sure = body["answers"]["sure"]["noul"]
cutoff = 0.8  # sustitúyelo por un umbral medido en tu propio tráfico

if sure < cutoff or route == "human":
    hand_to_human(state)
elif route == "small_model":
    call_small(state)
else:
    call_large(state)
```

Una ruta equivocada hacia una herramienta que gasta dinero pide un umbral más alto que una ruta equivocada hacia una línea de registro. Lee un lote de tu propio tráfico en [comparar](/es/compare/) o [probar](/es/try/) antes de fijar el número. El razonamiento está en [confidence](/es/concepts/confidence/).

La misma petición puede llevar cuatro preguntas más. Una ruta, una pregunta de confidence y algunas de sí/no caben bajo el tope de seis. [Fan-out](/es/patterns/fan-out/) tiene esa forma.

## Lo que el enrutador no hace

No escribe la respuesta. La escribe el manejador que elegiste.

No inventa un manejador. Si el correcto no está en `options`, el choice igual devuelve uno de los nombres que enviaste. Añade el manejador, o añade un `noul` que pregunte si algún manejador listado encaja, y manda el fallo a una persona.

La escritura abierta se queda en un modelo de texto. El enrutador decide qué modelo de texto corre, o si una persona debe ver la petición primero. Cuando el texto vuelve, otra llamada puede preguntar si es seguro actuar sobre él. Esa segunda llamada es una [barrera](/es/cases/llm-guardrails/), no parte de la ruta.

## Dónde ya aparece esta forma

El [mapa de casos de uso](/es/cases/use-case-map/) agrupa proyectos públicos que eligen un modelo con un choice de Jev: enrutadores de tareas de código, un enrutador basado en LiteLLM, un enrutador por petición para un agente de código, y un proxy local que elige modelo y nivel de esfuerzo. La forma común es un choice delante de la llamada cara. Esta página no añade puntuaciones para esos proyectos.

El [enrutado por intención](/es/patterns/intent-routing/) es la misma decisión, dirigida a una cola de soporte en lugar de a un modelo.

## Para empezar

- [API](/es/api/) — `POST /v1/judge`, la petición y la respuesta
- [Probar](/es/try/) — la vía anónima, sin clave
- [System One](/es/concepts/system-one/) — state, preguntas y el nombre del modelo en la respuesta
- [Confidence](/es/concepts/confidence/) — la segunda pregunta, y quién fija el umbral
- [Precios](/es/pricing/) — tokens de entrada, salida gratis

## Relacionado

- [Salida estructurada](/es/cases/structured-output/) — cuando lo que necesitas es un valor tipado, no una ruta
- [Fan-out](/es/patterns/fan-out/) — varias preguntas sobre un state
- [Barreras para LLM](/es/cases/llm-guardrails/) — la comprobación después de que un modelo de texto escribe
- [Mapa de casos de uso](/es/cases/use-case-map/) — los proyectos públicos
