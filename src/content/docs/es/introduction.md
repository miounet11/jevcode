---
title: Conocer JevCode
description: JevCode es la casa de Jev. El modelo es clavue-jev, el mejor Jev del mundo hoy. Una llamada envía un estado y preguntas tipadas, y devuelve un juicio con el que el software puede ramificar.
section: start
order: 10
tags: ['overview', 'clavue-jev']
---

## La casa de Jev

JevCode es donde vive Jev. El modelo que sirve este sitio es **clavue-jev**. Lo construimos, lo servimos y lo sostenemos como el mejor Jev del mundo hoy.

jev-1.13.0 aparece en la página de comparación. Es el otro lado de la misma pregunta, para ponerlos en paralelo. No es el modelo que este sitio ofrece.

## Qué es una llamada

clavue-jev no es un modelo de chat. Envías **un estado** y hasta **seis preguntas tipadas**. Vuelven campos que un programa lee directamente:

| Pregunta | Retorno |
| :--- | :--- |
| `noul` | Un número de 0 a 1. Léelo como la fuerza del «sí». |
| `confidence` | Un número de 0 a 1. Léelo como: cuán firme es este juicio. |
| `choice` | Una de las opciones que diste. |

Un modelo de chat escribe prosa. clavue-jev devuelve un valor. Ese es el trabajo de System One, el trabajo de esta llamada.

## Seguir leyendo

- [System One](/es/concepts/system-one/) — la forma de una llamada
- [Estado](/es/concepts/state/) — el texto que envías
- [Confianza](/es/concepts/confidence/) — cuándo actuar solo, cuándo parar
- [Probar una vez](/es/try/) — anónimo, sin clave
- [API](/es/api/) — `POST /v1/judge` con una clave
