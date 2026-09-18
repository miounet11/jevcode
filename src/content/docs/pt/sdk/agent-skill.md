---
title: "Habilidade do Agente"
description: "Integre o TypeSafe skill no Claude Code, Codex e outros agentes de codificação para que eles tenham acesso ao contexto completo da API, em vez de depender de suposições."
section: sdk
order: 40
tags: ['agent', 'claude-code', 'codex']
source: docs.typesafe.ai/agent-skill
translatedFrom: zh
---

## O que este skill resolve

O skill do agent TypeSafe fornece ao seu agente de codificação de IA o contexto completo da API TypeSafe: três tipos de [problemas](/zh/primitives/), padrões de arquitetura [patterns](/zh/patterns/), e melhores práticas para avaliação organizacional.

**Por que é necessário**: Agentes sem o skill tendem a escrever campos de requisição e resposta baseados em suposições, gerando chamadas de API que parecem plausíveis, mas não existem na realidade. Este é o padrão de falha mais comum ao integrar novas APIs com agentes de codificação.

## Instalação

### Claude Code

```bash
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai
```

### Outros agentes

```bash
npx skills add typesafe-ai/skills --skill typesafe-ai
```

Durante a instalação, selecione seu agente conforme solicitado. **A instalação padrão é local ao projeto**; adicione `-g` para instalar globalmente.

### Deixe o agente instalar por conta própria

Cole esta instrução diretamente no seu agente de codificação:

```text
Install the TypeSafe skill. If you're in Claude Code, run `claude plugin marketplace add typesafe-ai/skills`,
then `claude plugin install typesafe@typesafe-ai`. If you're in another agent, run
`npx skills add typesafe-ai/skills --skill typesafe-ai` and select your agent.
Use one installation method. You can read the skill directly at
https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
(raw: https://raw.githubusercontent.com/typesafe-ai/skills/main/skills/typesafe-ai/SKILL.md).
Then use the TypeSafe skill when working on this project.
```

Você também pode instalar manualmente: copie todo o diretório `skills/typesafe-ai` do GitHub (**incluindo seus arquivos de referência**) para o diretório de skills do seu agente.

> **Escolha apenas um método de instalação** para evitar cópias duplicadas.

## Atualização

Plugin do Claude Code:

```bash
claude plugin marketplace update typesafe-ai
claude plugin update typesafe@typesafe-ai
```

Em seguida, reinicie o Claude Code ou execute `/reload-plugins`. Para habilitar atualizações automáticas: abra `/plugin`, selecione **Marketplaces → typesafe-ai → Enable auto-update**.

Para instalações via skills.sh, use `npx skills update`. Para instalações manuais, substitua o diretório do skill pela versão mais recente do GitHub.

## Prompts úteis

Mencionar o prompt no seu prompt (「use the TypeSafe skill」) funciona em qualquer agente. Ao usar o plugin do Claude Code, você também pode chamar diretamente `/typesafe:typesafe-ai`.

**Buscando oportunidades de refatoração**:

```text
Using the TypeSafe skill, explore the project and find opportunities for using
intelligent judgement to stand in for complex parsing or other fragile code.
```

**Experimentando com uma chave de API real**:

```text
Using the TypeSafe skill, run some experiments using the TypeSafe API key that I've
exported to `TYPESAFE_API_KEY`. Propose changes based on the most promising results.
```

**Encontrando cookbooks de referência**:

```text
Using the TypeSafe skill, analyze my code and see if there are any applicable cookbooks
that show how I could refactor my code to be less fragile or complex.
```

## Princípios para colaborar com agentes

As quatro diretrizes oficiais valem a pena seguir:

1. **Discuta antes de agir.** Use os prompts acima para conversar com o agente e alinhar a direção.
2. **Revise o plano antes de implementar.** Confirme que o plano é razoável antes de pedir ao agente para escrever o código.
3. **Centralize as constantes.** Problemas e limiares devem ser definidos em um único arquivo para facilitar a revisão. **A capacidade do agente de escrever código é limitada**; espere colaborar com ele para fazer ajustes, em vez de esperar que ele entregue tudo de uma vez.
4. **Não aceite afirmações não verificadas.** Incentive o agente a validar suas próprias suposições.

## Perguntas frequentes

### O agente não está usando o skill

No plugin do Claude Code, chame diretamente `/typesafe:typesafe-ai`; em outros agentes, diga explicitamente 「use the TypeSafe skill」. Se ainda não carregar, confirme que o instalador selecionou o agente correto e reinicie.

### O comportamento das rotas não está conforme o esperado

Verifique os problemas e os limiares. Pode ser que o limiar esteja muito alto (falsos negativos) ou muito baixo (falsos positivos). Talvez seja necessário especificar melhor os problemas.

### Uso excessivo de limiares de confiança

Se você deseja apenas **selecionar a melhor opção**, basta escolher a opção com maior confiança, sem necessidade de definir um limiar. Se você tem um algoritmo estatístico específico em mente, o que você precisa são `probabilities` em vez de `confidence`.

### O código TypeSafe é difícil de revisar

O núcleo que precisa de revisão humana são as **definições de problemas** e as **constantes de limiar**. Defina-os centralizadamente em um único arquivo de código para evitar ter que procurar em vários lugares durante a revisão.

### O agente inventou campos de requisição ou resposta

Geralmente, isso ocorre porque o skill está desatualizado. Atualize conforme indicado acima e tente novamente.

## Relacionado

- [Visão geral do SDK](/zh/sdk/) — SDKs Python e JS
- [Primitivas de problemas](/zh/primitives/) — Os três tipos de problemas que os agentes precisam entender
- [Confiança](/zh/concepts/confidence/) — Como definir os limiares
