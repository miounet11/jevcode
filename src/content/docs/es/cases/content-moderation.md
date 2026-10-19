---
title: "API de moderación de contenido: construir una a partir de preguntas tipadas"
description: "Cómo construir una API de moderación de contenido en TypeSafe preguntas tipadas — verificaciones Noul por política, puntuación de severidad, enrutamiento por categoría, gobernanza de umbrales bajo tu control — en comparación con puntos finales de moderación de talla única."
section: cases
order: 215
tags: ['moderation', 'content-moderation', 'guardrails', 'cookbook']
translatedFrom: en
---
## Por qué "un punto final de moderación" es la unidad de compra incorrecta

La mayoría de las plataformas venden la moderación como un único punto final con etiquetas fijas: toxicidad, odio,
violencia, sexual, autolesiones. Eso es conveniente hasta la primera vez que la definición
de una violación de tu producto difiere de la del proveedor: un mercado que debe señalar
intentos de pago fuera de la plataforma, un chat de juegos donde se permite el "trash talk" pero
no el doxxing, un foro de salud donde las preguntas sobre dosis son el punto central.

Tu política de moderación es una **decisión de producto**. La API que compras no debería codificarla de forma rígida. Lo que realmente necesitas es una forma de *expresar* la política — y de cambiarla cuando la política cambie, sin tener que volver a entrenar nada y sin esperar a un proveedor.

Esta página muestra cómo construir la moderación a partir de preguntas tipadas: cada regla de política es una
pregunta, cada respuesta lleva una probabilidad, y los umbrales — la política real —
viven en tu código, versionados como código.

## La forma: una solicitud por mensaje, preguntas por regla

Entra un mensaje; una solicitud lleva una pregunta de Noul por cada regla de política, más una puntuación de gravedad; salen las decisiones. No hay una segunda llamada ni un punto final por regla para distribuir.

```python
from typesafe_sdk import AsyncTypeSafeClient, Noul, Score

MODERATION_RULES = {
    "spam": Noul(instructions="Is this message spam or bulk advertising?"),
    "scam": Noul(instructions="Does this message try to defraud or phish the reader?"),
    "pii": Noul(instructions="Does this message contain personal data such as addresses, phone numbers, or IDs?"),
    "offsite_payment": Noul(instructions="Does this message try to move the transaction off the platform (external payment, direct email)?"),
    "severity": Score(
        instructions="If a policy is violated, how much harm would acting on it do?",
        criteria=["none", "minor", "moderate", "severe"],
    ),
}

async def moderate(client: AsyncTypeSafeClient, message: str) -> dict:
    async with client:
        response = await client.system_one(state=message, questions=MODERATION_RULES)
    return {rule: response.answers[rule] for rule in MODERATION_RULES}
```

La política es la dict. Añadir "no consejos médicos" a un foro de salud es una línea;
se envía con tu próximo despliegue, no con la tarjeta del siguiente modelo de tu proveedor.

## Los umbrales son la política: manténlos en tu código

Cada respuesta de Noul es una probabilidad. Lo que cuenta como una violación es el umbral que aplicas a ella, y diferentes reglas pueden tener diferentes umbrales:

```python
THRESHOLDS = {"spam": 0.90, "scam": 0.85, "pii": 0.70, "offsite_payment": 0.95}
SEVERITY_ESCALATE = 2.5  # between "moderate" and "severe" on the 4-point scale

def decide(answers: dict) -> str:
    if answers["severity"].score >= SEVERITY_ESCALATE:
        return "escalate"    # legal / trust-and-safety queue
    for rule, threshold in THRESHOLDS.items():
        if answers[rule].noul >= threshold:
            return "block"
    if any(answers[rule].noul >= 0.60 for rule in THRESHOLDS):
        return "review"      # send to the human queue
    return "pass"
```

Cuatro resultados, cada uno de tu propiedad:

- **pass** — entregar el mensaje
- **review** — cola humana, la forma más económica de reducir los falsos positivos
- **block** — hacer cumplir
- **escalate** — el puntaje de gravedad superó su límite, p. ej. legal o confianza y seguridad

Compara eso con un punto de control de moderación que devuelve sus propias etiquetas de categoría y una
bandera. Puedes ajustar exactamente una cosa: el umbral de la bandera. Las etiquetas, sus definiciones,
y su calibración son implementación de otra persona.

## Por qué las probabilidades importan más que las etiquetas

Una bandera booleana descarta la información que necesitas para operar un sistema de moderación:

**Puedes medir el límite.** La proporción de decisiones que caen entre 0.6 y 0.9
*es* tu carga de trabajo de revisión humana. Ese número es legible antes del lanzamiento, no después de
una pila de escalaciones. [Pruebas de autoconsistencia](/en/cases/consistency-choice-cookbook/)
amplía esto: pasa los posts fronterizos por el baremo repetidamente y verifica si
las etiquetas se mantienen estables — la oscilación de etiquetas es el asesino silencioso de la moderación automatizada.

**Puedes filtrar por confianza como cualquier otra decisión en la canalización.** El mismo
patrón [confidence-routing](/en/patterns/confidence-routing/) utilizado para la clasificación
se aplica sin cambios: las acciones de alta probabilidad, las revisiones de baja probabilidad, y la división es un
número que elegiste.

**Puedes verificar al verificador.** Dado que cada regla es una pregunta independiente con una distribución, puedes reservar ejemplos etiquetados por regla y medir la precisión por regla, en lugar de descubrir a través de un ciclo de noticias que una categoría oculta estaba fallando.

## Dónde se sitúa junto a las protecciones de entrada

[Guardrails for LLMs](/en/cases/llm-guardrails/) cubre el caso específico de los LLM:
el cribado de prompts y respuestas de jailbreaks y salidas dañinas alrededor de una llamada
de modelo. El sistema de moderación descrito aquí es la superficie de producto más amplia — los mensajes
de los usuarios, perfiles, listados, reseñas — donde las reglas provienen de tus términos de
servicio en lugar de la seguridad del modelo. La misma primitiva, diferente autor de reglas. Muchos
productos terminan ejecutando ambos: moderación de producto en el contenido del usuario, guardrails alrededor
del modelo.

## Sistemas de moderación real construidos de esta manera

- [Jev-Moderation-Bot](https://github.com/brainstormity/Jev-Moderation-Bot) — un bot de Discord donde Jev verifica enlaces de spam y estafas, con reglas de escalado de advertencia y tiempo de espera mantenidas localmente
- [mastra-jev-moderation](https://github.com/CodeAlive-AI/mastra-jev-moderation) — moderación de entrada para agentes de Mastra en TypeSafe Jev, en un solo archivo

## Constrúyelo

- [Primitives overview](/en/primitives/) — Noul y Score en detalle
- [HTTP API reference](/en/sdk/http-api/) — formas de solicitud/respuesta
- [Guardrails for LLMs](/en/cases/llm-guardrails/) — la variante orientada al modelo
- [Self-consistency: choices](/en/cases/consistency-choice-cookbook/) — prueba de estrés de la estabilidad de las etiquetas
- [Use-case map](/en/cases/use-case-map/) — moderación y cumplimiento entre los demás escenarios