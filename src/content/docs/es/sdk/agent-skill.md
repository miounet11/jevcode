---
title: "Habilidad del Agente"
description: "Integra la habilidad TypeSafe en agentes de codificación como Claude Code y Codex, proporcionándoles el contexto completo de la API en lugar de depender de suposiciones."
section: sdk
order: 40
tags: ['agent', 'claude-code', 'codex']
source: docs.typesafe.ai/agent-skill
translatedFrom: zh
---

## ¿Qué problema resuelve esta habilidad

La habilidad de agente TypeSafe proporciona a tu agente de codificación de IA el contexto completo de la API TypeSafe: tres tipos de [problemas](/es/primitives/), [patrones](/es/patterns/) de arquitectura y mejores prácticas para la evaluación organizacional.

**Por qué es necesaria**: Un agente sin la habilidad escribirá campos de solicitud y respuesta basándose en suposiciones, generando llamadas a la API que parecen razonables pero que en realidad no existen. Este es el patrón de fallo más común al integrar una nueva API con agentes de codificación.

## Instalación

### Claude Code

```bash
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai
```

### Otros agentes

```bash
npx skills add typesafe-ai/skills --skill typesafe-ai
```

Selecciona tu agente según las indicaciones durante la instalación. La instalación es **local al proyecto por defecto**; añade `-g` para instalar globalmente.

### Deja que el agente se instale solo

Copia y pega este mensaje directamente a tu agente de codificación:

```text
Install the TypeSafe skill. If you're in Claude Code, run `claude plugin marketplace add typesafe-ai/skills`,
then `claude plugin install typesafe@typesafe-ai`. If you're in another agent, run
`npx skills add typesafe-ai/skills --skill typesafe-ai` and select your agent.
Use one installation method. You can read the skill directly at
https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
(raw: https://raw.githubusercontent.com/typesafe-ai/skills/main/skills/typesafe-ai/SKILL.md).
Then use the TypeSafe skill when working on this project.
```

También puedes instalarlo manualmente: copia todo el directorio `skills/typesafe-ai` desde GitHub (**incluyendo su archivo de referencia**) al directorio de habilidades de tu agente.

> **Elige solo un método de instalación** para evitar copias duplicadas.

## Actualización

Para el plugin de Claude Code:

```bash
claude plugin marketplace update typesafe-ai
claude plugin update typesafe@typesafe-ai
```

Luego reinicia Claude Code o ejecuta `/reload-plugins`. Para habilitar las actualizaciones automáticas: abre `/plugin`, selecciona **Marketplaces → typesafe-ai → Enable auto-update**.

Para los instalados con skills.sh, usa `npx skills update`. Para los instalados manualmente, reemplaza todo el directorio de la habilidad con la última versión de GitHub.

## Prompts útiles

Mencionar la habilidad en el prompt («use the TypeSafe skill») funciona en cualquier agente. Con el plugin de Claude Code, también puedes invocar directamente `/typesafe:typesafe-ai`.

**Buscar oportunidades de refactorización**:

```text
Using the TypeSafe skill, explore the project and find opportunities for using
intelligent judgement to stand in for complex parsing or other fragile code.
```

**Experimentar con una clave API real**:

```text
Using the TypeSafe skill, run some experiments using the TypeSafe API key that I've
exported to `TYPESAFE_API_KEY`. Propose changes based on the most promising results.
```

**Encontrar cookbooks de referencia**:

```text
Using the TypeSafe skill, analyze my code and see if there are any applicable cookbooks
that show how I could refactor my code to be less fragile or complex.
```

## Principios para colaborar con el agente

Las cuatro reglas oficiales merecen ser seguidas:

1. **Discute antes de actuar.** Usa los prompts anteriores para conversar con el agente y aclarar la dirección.
2. **Revisa el plan antes de implementar.** Confirma que el plan es razonable antes de pedirle que escriba código.
3. **Centraliza las constantes.** Los problemas y los umbrales deben definirse en un único archivo para facilitar la revisión. **La capacidad del agente para escribir código es limitada**; espera colaborar con él para realizar modificaciones, en lugar de esperar resultados perfectos a la primera.
4. **No aceptes afirmaciones no verificadas.** Anima al agente a validar sus propias suposiciones.

## Preguntas frecuentes

### El agente no está utilizando la habilidad

Con el plugin de Claude Code, invoca directamente `/typesafe:typesafe-ai`; en otros agentes, especifica claramente «use the TypeSafe skill». Si aún no se carga, confirma que el instalador seleccionó el agente correcto y reinicia.

### El comportamiento de las rutas no es el esperado

Revisa los problemas y los umbrales. Es posible que el umbral esté demasiado alto (falsos negativos) o demasiado bajo (falsos positivos). También podría ser necesario especificar el problema con mayor detalle.

### Uso excesivo de umbrales de confianza

Si solo quieres **seleccionar la mejor opción**, simplemente elige la de mayor confianza; no necesitas configurar un umbral. Si tienes un algoritmo estadístico específico en mente, lo que necesitas son `probabilities` en lugar de `confidence`.

### El código de TypeSafe es difícil de revisar

El núcleo que requiere revisión manual son las **definiciones de problemas** y las **constantes de umbral**. Defínelos centralizados en un único archivo de código para evitar tener que buscarlos por toda la base de código durante la revisión.

### El agente inventa campos de solicitud o respuesta

Normalmente se debe a que la habilidad está desactualizada. Actualiza siguiendo las instrucciones anteriores y vuelve a intentarlo.

## Relacionado

- [Resumen del SDK](/es/sdk/) — SDK de Python y JS
- [Primitivas de problemas](/es/primitives/) — Los tres tipos de problemas que el agente debe entender
- [Confianza](/es/concepts/confidence/) — Cómo configurar los umbrales
