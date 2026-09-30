---
title: System One
description: A página de System One escrita pela JevCode. O clavue-jev responde a um estado com noul, confidence e choice.
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## System One

Esta página é nossa. Ela descreve a chamada que **este site realmente aceita**. O modelo é **clavue-jev**, e nós o colocamos como o melhor Jev do mundo hoje.

Um programa precisa de um valor de tipo conhecido. Uma resposta de chat é uma string que ainda precisa ser lida. O clavue-jev carrega o tipo na pergunta: a resposta já é um número ou uma das suas opções. Use-o nos julgamentos que rodam o dia inteiro. Escrita aberta vai para um modelo de texto; o clavue-jev decide se esse texto pode ser executado.

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

`state` tem de 8 a 4000 caracteres. `questions` leva no máximo seis. `options` é dobrado em `criteria` antes de chegar ao modelo. A resposta nomeia `model` como `clavue-jev`. Só uma chamada bem-sucedida é cobrada por tokens de entrada. A saída é grátis. [Preços](/pt/pricing/).

- [Estado](/pt/concepts/state/)
- [Certeza](/pt/concepts/confidence/)
- [Primitivas](/pt/primitives/)
- [API](/pt/api/)
- [Cenas](/pt/scenes/)
