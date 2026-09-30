---
title: System One
description: A página de System One do JevCode. O clavue-jev responde a um estado com noul, confidence e choice.
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## Escrito no JevCode

Esta página é nossa. Ela descreve a chamada que **este site** realmente serve.

O JevCode é a casa do Jev. O modelo é o **clavue-jev**, e nós o apresentamos como o melhor Jev do mundo hoje. Uma chamada de System One, aqui, é um estado, algumas perguntas tipadas, e uma resposta que se chama `clavue-jev`.

## Para que serve

O software precisa de um valor de tipo conhecido. A resposta de um chat é uma string que você terá de analisar depois. O clavue-jev põe o tipo do lado da pergunta: a resposta já é um número, ou uma das suas opções.

Use para julgamentos que rodam o dia inteiro. Qual fila, se esta linha entra no escopo, se esta ação pode passar. Para escrita aberta, pegue um modelo de texto, e deixe o clavue-jev julgar se o texto pode ser executado.

## A chamada

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

```json
{
  "state": "The invoice was paid twice on Tuesday.",
  "questions": {
    "duplicate": {
      "type": "noul",
      "instructions": "Does this describe a duplicate charge?"
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that judgment?"
    },
    "lane": {
      "type": "choice",
      "instructions": "Which queue should take it?",
      "options": ["billing", "fraud", "ignore"]
    }
  }
}
```

`state` é texto de 8 a 4000 caracteres. `questions` são no máximo seis. Os nomes começam com minúscula. Um choice chega como `options` ou como `criteria`; este servidor reúne `options` em criteria antes de chamar o modelo.

A resposta traz `"model": "clavue-jev"`. Após uma chamada bem-sucedida, a cobrança é pelos tokens de entrada. A saída é grátis. Os números estão em [Preços](/pt/pricing/).

## Continuar lendo

- [Estado](/pt/concepts/state/)
- [Confiança](/pt/concepts/confidence/)
- [Choice, Noul e as demais](/pt/primitives/)
- [API](/pt/api/)
- [Ao vivo](/pt/scenes/)
