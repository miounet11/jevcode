---
title: "SDK JavaScript / TypeScript"
description: "Instale o @typesafe-ai/sdk e chame a API do System One usando um cliente com inferência automática de tipos."
section: sdk
order: 30
tags: ['javascript', 'typescript', 'sdk']
source: docs.typesafe.ai/sdk/javascript
translatedFrom: zh
---

## Instalação

É necessário ter o Node.js 20 ou uma versão mais recente:

```bash
npm install @typesafe-ai/sdk
```

Crie o cliente após definir as variáveis de ambiente:

```bash
export TYPESAFE_API_KEY="sk-..."
```

## Uso básico

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "Fui cobrado duas vezes. Por favor, resolva isso o mais rápido possível." },
  questions: {
    category: choice("Sobre o que é este chamado?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

## Inferência de tipos

Esta é a parte mais valiosa do SDK em TS: **os tipos das respostas são inferidos automaticamente com base nas perguntas que você fornece**.

```ts
questions: {
  category: choice("Sobre o que é este chamado?", {
    billing: null,
    technical: null,
    other: null,
  }),
}
```

Como as chaves de `criteria` são `billing` / `technical` / `other`, o tipo de `response.answers.category.choice` é a união desses três tipos literais. Escrever "bililng" resultará em um erro em tempo de compilação, em vez de retornar `undefined` em tempo de execução.

Da mesma forma, perguntas construídas com `score(...)` terão `score`, `legend`, `probabilities` e `confidence` nas respostas; enquanto perguntas construídas com `noul(...)` terão apenas `noul`.

Isso significa que **você não precisa definir manualmente os tipos das respostas** nem tratar o retorno da API como `any`.

## Estrutura da resposta

```ts
response.answers.category.choice;        // Opção selecionada
response.answers.category.probabilities; // Probabilidades de cada opção
response.answers.category.confidence;    // Confiança
```

Todos os tipos de perguntas são indexados pelo nome da pergunta dentro de `response.answers`, e os campos específicos dependem do tipo da pergunta.

## Estrutura do pacote

O SDK fornece produtos para ESM, CommonJS e arquivos de declaração TypeScript, permitindo seu uso direto em diversos ambientes de construção.

Para conhecer todas as opções e valores padrão, consulte o [client](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/client.ts) e os [types](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/types.ts) do SDK.

## Relacionados

- [Início rápido](/pt/quickstart/)
- [Primitivos de pergunta](/pt/primitives/) — Como construir os três tipos de perguntas
- [Fan-out paralelo](/pt/patterns/fan-out/) — Faça várias perguntas de uma vez
