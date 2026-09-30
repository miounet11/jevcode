---
title: Certeza
description: Nesta API a certeza é uma pergunta à parte e devolve um número de 0 a 1. O limiar depende do custo de errar.
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## Certeza

Esta API não esconde uma certeza dentro de cada resposta. Você pede o número que quer.

- `noul` devolve `{ "noul": 0.92 }`. É o quanto a resposta é sim, não uma segunda nota de certeza.
- `confidence` devolve `{ "noul": 0.78 }`. É o quanto o julgamento se sustenta. Peça-o ao lado da pergunta sobre a qual você pode agir.
- `choice` devolve `{ "choice": "billing" }`, uma das opções enviadas.

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

Não há um limiar universal neste site. Um reembolso automático errado custa mais do que uma etiqueta errada numa linha de log. Número alto: a ação segura. Número baixo: uma pessoa, ou uma segunda chamada com um estado mais estreito. Olhe o seu próprio tráfego em [comparar](/pt/compare/) ou [experimentar](/pt/try/) antes de fixar o limiar.

- [Estado](/pt/concepts/state/)
- [System One](/pt/concepts/system-one/)
- [API](/pt/api/)
