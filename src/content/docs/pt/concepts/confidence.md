---
title: Confiança
description: Nesta API a confiança é uma pergunta separada e devolve um número de 0 a 1. O limite se define pelo custo de um erro.
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## Dois números diferentes

Esta API não esconde uma confiança dentro de cada resposta. Você pergunta o número que quer.

- Uma pergunta `noul` devolve `{ "noul": 0.92 }`. É a força do "sim", não uma pontuação de confiança separada.
- Uma pergunta `confidence` devolve `{ "noul": 0.78 }`. É quão firme é este julgamento. Pergunte junto à pergunta que você quer deixar executar sozinha.
- Uma pergunta `choice` devolve `{ "choice": "billing" }`. Uma das opções que você enviou.

Quando a bifurcação importa, pergunte as duas juntas:

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

## Quando agir sozinho

Este site não tem um limite universal. Errar num reembolso automático custa mais do que errar uma etiqueta numa linha de log. Por isso o caminho do reembolso espera um número mais alto.

Um começo prático:

1. Escolha a ação segura que roda quando o número é alto.
2. Escolha o repasse quando o número é baixo (uma pessoa, ou uma segunda chamada com um estado mais estreito).
3. Leia um lote do seu próprio tráfego em [Comparar](/pt/compare/) ou [Teste](/pt/try/) antes de fixar o limite.

Não deixe o modelo mover dinheiro nem apagar dados se ele não puder dizer "não tenho certeza". Faça uma pergunta `confidence` e bifurque.

- [Estado](/pt/concepts/state/)
- [System One](/pt/concepts/system-one/)
- [API](/pt/api/)
