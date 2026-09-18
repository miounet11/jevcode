---
title: "Enrutamiento por confianza"
description: "Trata la confianza como un segundo eje de decisión. La respuesta te indica «qué es», mientras que la confianza te dice «si se debe ejecutar»."
section: patterns
order: 30
tags: ['confidence', 'routing', 'safety']
source: docs.typesafe.ai/patterns/confidence-routing
translatedFrom: zh
---

## ¿Qué problema resuelve este patrón?

La respuesta y la confianza son **dos dimensiones de información independientes**. Tomar decisiones basándose únicamente en la respuesta equivale a descartar la mitad de la información que el modelo te está proporcionando.

El enrutamiento por confianza consiste en obtener primero la respuesta y luego utilizar la confianza para determinar si dicha respuesta es lo suficientmente fiable como para ejecutarse. Esto constituye la base para construir sistemas que sean tanto fiables como seguros.

## Ejemplo: Instrucciones de voz para un banco

Imagina que estás desarrollando una interfaz bancaria por voz que permite a los usuarios gestionar sus cuentas mediante comandos de voz. Sin duda, deseas que la confianza en el reconocimiento de intenciones sea lo más alta posible, pero **el riesgo de diferentes acciones varía, por lo que se requieren umbrales de confianza distintos**.

### Paso 1: Determinar la intención del usuario

Una llamada a `Choice` devuelve la intención, con candidatos como `check_balance` (consultar saldo) o `approve_transfer` (aprobar transferencia), entre otros.

### Paso 2: Enrutamiento según la confianza

```python
action = response.answers["intent"]

# Para cualquier acción, si la confianza es inferior a 0.6, se deriva a un agente humano
if action.confidence < 0.6:
    route_to_support_agent(account_id)

elif action.choice == "check_balance":
    # Bajo riesgo. Una confianza de 0.6 es suficiente.
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if action.confidence > 0.85:
        # Alto riesgo, pero también alta confianza. Ejecutar.
        ...
    else:
        # Alto riesgo, confianza media. Solicitar confirmación.
        ask_user_to_confirm(account_id)
```

## Por qué los umbrales deben escalonarse

Observa los tres umbrales presentes en este código:

| Umbral | Función |
| :--- | :--- |
| `< 0.6` siempre bloqueado | Cuando el modelo indica incertidumbre, **no se ejecuta ninguna** acción |
| Umbral para `check_balance` de 0.6 | Operaciones de solo lectura; un error puede revertirse |
| Umbral para `approve_transfer` de 0.85 | Implica movimiento de fondos; un error es irreversible |

Esta es la expresión práctica de la idea de que **«los umbrales escalan según el riesgo»**. **Si todo el sistema utiliza un único umbral uniforme, o bien molestarás excesivamente al usuario en acciones de bajo riesgo, o bien no serás lo suficientemente cauteloso en acciones de alto riesgo.**

## Puntos clave de diseño

**Establece primero un límite mínimo estricto y luego los umbrales específicos para cada acción.** El límite mínimo (por ejemplo, 0.6 en el ejemplo anterior) bloquea aquellas situaciones en las que el modelo indica explícitamente «realmente no estoy seguro»; actúa como una red de seguridad. Los umbrales de acción se definen por encima de este límite, escalando según el riesgo.

**Convierte los umbrales en configuraciones explícitas, no en números mágicos dispersos.** Define los umbrales de cada acción en un solo lugar centralizado, lo que facilita su auditoría y ajuste. Cuando el equipo de negocio pregunte «¿por qué esta transferencia requiere confirmación manual?», podrás señalar un número concreto.

**No utilices la confianza como sustituto de la validación empresarial.** La confianza es una autoevaluación del modelo, no un reemplazo de las reglas de negocio. Las reglas deterministas, como los límites de importe o las verificaciones de permisos, deben seguir implementándose en el código.

**Calibra los umbrales con datos reales.** La documentación oficial advierte explícitamente: los umbrales correctos dependen de tu dominio y del rendimiento del modelo en tu caso de uso específico. Comienza con umbrales conservadores, prueba con tus propios datos y ajusta según los resultados observados.

## Cuándo no utilizarlo

Si una decisión **no tiene consecuencias negativas en caso de error** (por ejemplo, etiquetar registros de log), añadir un umbral de confianza solo aumentará la complejidad y los costos operativos. El valor del enrutamiento por confianza es proporcional al grado de irreversibilidad de la decisión.

## Relacionado

- [Confianza](/zh/concepts/confidence/) — relación entre la confianza y las probabilidades
- [Enrutamiento por intención](/zh/patterns/intent-routing/) — suele utilizarse junto con el enrutamiento por confianza
- [Puntuación compuesta](/zh/patterns/composite-scoring/) — manejo de la confianza en escenarios de clasificación
