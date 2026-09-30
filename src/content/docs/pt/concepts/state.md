---
title: Estado
description: O estado é o texto que o clavue-jev julga. Nesta API é uma string de 8 a 4000 caracteres, vista por cada pergunta da mesma chamada.
section: concepts
order: 20
tags: ['state', 'clavue-jev']
---

## O que você envia

O **estado** é o texto que o clavue-jev julga. Em `POST /v1/judge` é uma string de 8 a 4000 caracteres. Cada pergunta do mesmo pedido vê essa string. As perguntas não leem as respostas umas das outras.

Coloque nessa string os fatos de que o julgamento precisa: a mensagem, a linha de política, os dois nomes que você quer comparar. Um fato que não está escrito não existe para o modelo.

```json
{
  "state": "Usuário: fui cobrado duas vezes. Política: uma cobrança duplicada em até 7 dias é reembolsada. Linhas: terça 18:02, terça 18:04, mesmo cartão, mesmo valor.",
  "questions": {
    "duplicate": {
      "type": "noul",
      "instructions": "Estas linhas mostram uma cobrança duplicada?"
    }
  }
}
```

## Um estado, várias perguntas

Perguntas independentes viajam no mesmo pedido, no máximo seis. "É duplicada?" e "Qual fila?" podem ir juntas. Uma pergunta que precisa da resposta anterior não pode: execute como segunda chamada, com a primeira resposta escrita no novo estado.

Dê nome a cada parte no texto se enviar mais de um fato. "Política: … Linhas: …" é mais fácil de julgar do que três blocos sem rótulo.

## Comprimento

Menos de 8 caracteres é recusado. Mais de 4000 também. Se o material não couber, corte-o até as linhas de que a pergunta realmente precisa, ou divida o trabalho em duas chamadas.

- [System One](/pt/concepts/system-one/)
- [Confiança](/pt/concepts/confidence/)
- [API](/pt/api/)
