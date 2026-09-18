---
title: "Confianza"
description: "La confianza es una estadística derivada de la distribución de probabilidad. Comprende su relación con las probabilidades y cómo escalar el umbral según el riesgo."
section: concepts
order: 30
tags: ['confidence', 'probabilities', 'threshold']
source: docs.typesafe.ai/confidence
translatedFrom: zh
---

## Relación entre los dos campos

Todas las respuestas de tipo `Choice` y `Score` incluyen un atributo `probabilities`, que representa la **distribución de probabilidad** sobre las distintas opciones (`Choice`) o niveles (`Score`).

La **forma** de esta distribución indica el nivel de certeza del modelo: una concentración en un resultado específico implica una respuesta segura, mientras que una distribución amplia sugiere incertidumbre.

El atributo `confidence` comprime esta forma en un único valor entre 0 y 1, lo que permite establecer umbrales directamente sin necesidad de realizar cálculos adicionales.

> **Nota**: Las respuestas de tipo `Noul` **no incluyen** `confidence`, ya que su valor en sí mismo es una probabilidad entre 0 y 1.

## Significado de la forma de la distribución

- **Baja confianza en Choice**: generalmente significa que ninguna opción destaca claramente sobre las demás.
- **Baja confianza en Score**: suele indicar que la definición de los niveles es ambigua, multidimensional o que la información en el `state` es insuficiente para tomar una decisión.

## «No lo sé» es una señal útil

Si un sistema inteligente, ya sea humano o máquina, no puede expresar honestamente su incertidumbre, dicho sistema no puede ser confiable.

La confianza proporciona al modelo un mecanismo integrado para decir «no estoy seguro de esto». Esto permite que tu código implemente comportamientos diferentes según el grado de certeza, lo cual es fundamental para construir sistemas verdaderamente robustos.

## Tres ramas

Un punto de partida práctico consiste en dividir la confianza en tres niveles, cada uno asociado a un comportamiento diferente del sistema:

- **Alta confianza**: ejecución automática. El modelo tiene una判断 clara y no requiere intervención humana.
- **Confianza media**: avance cauteloso. El modelo ofrece una respuesta razonable pero no está completamente seguro. Según el contexto, se puede solicitar confirmación al usuario, marcar la tarea para revisión o recopilar más información.
- **Baja confianza**: no ejecutar. Derivar a un agente humano, solicitar aclaraciones o recurrir a otros sistemas. El modelo indica que le falta información o que la pregunta no es adecuada para él.

**El lugar donde se trazan los límites depende del nivel de riesgo.**

## Los umbrales escalan según el riesgo

Este es el principio práctico más importante: **el umbral de confianza no es un número único.**

Dentro de un mismo sistema, diferentes acciones deben tener diferentes umbrales basados en las «consecuencias de cometer un error».

```python
response = client.system_one(
    state=user_message,
    questions={
        "action": Choice(
            instructions="What is the user trying to do?",
            criteria={
                "check_balance": "View account balance",
                "approve_transfer": "Approve the pending withdrawal request",
                "support": "Get help with an issue",
            },
        ),
    },
)

action = response.answers["action"]
confidence = action.confidence

if confidence < 0.5:
    # El modelo realmente no está seguro. No adivinar.
    route_to_human(user_message)

elif action.choice == "check_balance":
    # Bajo riesgo. Mostrar la pantalla incorrecta es recuperable.
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if confidence > 0.9:
        # Alto riesgo + alta confianza. Ejecutar con confirmación.
        confirm_then_execute(account_id)
    else:
        # Alto riesgo + confianza media. Verificar primero.
        ask_user_to_confirm(account_id)
```

En este código hay tres umbrales diferentes, cada uno correspondiente a un nivel de riesgo distinto:

| Acción | Riesgo | Umbral |
| :--- | :--- | :--- |
| Bloquear todo por debajo de 0.5 | — | Límite inferior fijo, captura los casos donde el modelo admite su propia incertidumbre |
| `check_balance` | Bajo, solo lectura y recuperable | Se puede ejecutar automáticamente si es superior a 0.5 |
| `approve_transfer` | Alto, implica fondos | Requiere > 0.9 y aún así necesita confirmación del usuario |

El límite inferior de `0.5` intercepta cuando el modelo reporta «realmente no estoy seguro». Por encima de este valor, el umbral necesario para ejecutar una acción destructiva es mucho más alto que para una acción de solo lectura. **Tu código codifica tu tolerancia al riesgo.**

> **Nota**: El valor correcto del umbral depende de tu dominio y del rendimiento real del modelo en tu caso de uso. Comienza con umbrales conservadores, prueba con tus propios datos y ajusta según los resultados observados.

## Puedes definir tus propias métricas

El `confidence` proporcionado por la API es una métrica conveniente adaptada a la mayoría de los casos de uso, pero no estás limitado por su definición. Dependiendo de lo que estés evaluando, otras métricas pueden ser más adecuadas; de ahí que también se devuelva `probabilities`: tienes la distribución completa y puedes calcular lo que necesites.

Por ejemplo, la diferencia de probabilidad (margen) entre dos opciones candidatas puede reflejar mejor en algunos escenarios si se debe ejecutar automáticamente que el grado de concentración. O puedes observar únicamente la probabilidad del top-1 e ignorar el resto. La elección es tuya.

## Relacionado

- [Choice](/zh/primitives/choice/) / [Score](/zh/primitives/score/) — Los dos primitivos que incluyen confidence
- [Noul](/zh/primitives/noul/) — No incluye confidence, su valor es la probabilidad en sí misma
- [Patrón de enrutamiento por confianza](/zh/patterns/confidence-routing/) — Utiliza la confianza como señal de enrutamiento en el flujo de trabajo
