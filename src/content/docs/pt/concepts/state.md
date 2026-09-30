---
title: Estado
description: O estado é o texto que o clavue-jev julga. Nesta API é uma string de 8 a 4000 caracteres, vista por cada pergunta da mesma chamada.
section: concepts
order: 20
tags: ['state', 'clavue-jev']
---

## Estado

O **estado** é o texto que o clavue-jev julga. Em `POST /v1/judge` é uma string de 8 a 4000 caracteres. Cada pergunta do mesmo pedido vê essa string. As perguntas não leem as respostas umas das outras.

Coloque nessa string os fatos de que o julgamento precisa. Fato que não está escrito, o modelo não tem. Perguntas independentes viajam juntas, no máximo seis. Se uma pergunta precisa da resposta anterior, escreva essa resposta num estado novo e chame de novo.

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

- [System One](/pt/concepts/system-one/)
- [Certeza](/pt/concepts/confidence/)
- [API](/pt/api/)
