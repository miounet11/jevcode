---
title: "Estado"
description: "O estado é o que você deseja que o modelo avalie. Entenda suas três formas, como organizar o contexto e as limitações de suporte de linguagem."
section: concepts
order: 20
tags: ['state', 'context']
source: docs.typesafe.ai/concepts/state
translatedFrom: zh
---

## O que é o State

**State** (Estado) é o conteúdo que você solicita ao modelo System One para avaliar. Pode ser uma mensagem de atendimento ao cliente, um trecho de texto ou o estado atual do seu aplicativo. Você o insere no campo `state` da requisição da API, junto com as perguntas que deseja fazer.

Cada requisição avalia **um state** contra **uma ou mais perguntas**. Todas as perguntas veem o mesmo state e são avaliadas de forma **independente**. Você pode misturar perguntas do tipo [Choice](/pt/primitives/choice/), [Score](/pt/primitives/score/) e [Noul](/pt/primitives/noul/) em uma única requisição.

## Três formatos

### String

O state mais simples é uma string comum:

```python
state = "My card was charged twice."
```

Ideal para cenários simples, onde apenas um trecho de texto é necessário.

### Object

Quando a decisão requer a comparação de várias partes, use um object para agrupar informações relevantes, atribuindo nomes descritivos a cada parte:

```json
{
  "ticket": {
    "subject": "Duplicate charge",
    "messages": [
      {"from": "customer", "text": "I was charged twice for order A-104. Please refund the duplicate."},
      {"from": "support", "text": "We are checking the charges."}
    ]
  },
  "order": {
    "id": "A-104",
    "charges": [
      {"amount_usd": 49, "status": "captured"},
      {"amount_usd": 49, "status": "captured"}
    ]
  },
  "refund_policy": "Duplicate charges are eligible for a refund."
}
```

Note que este é **um** único state, embora contenha simultaneamente uma conversa, um pedido e uma política. A recomendação da especificação é: **use objects na maioria das requisições**, pois isso permite que cada parte tenha um nome descritivo e que as relações entre elas permaneçam claras.

### Array

Adequado para sequências de mensagens ou registros:

```python
state = ["Hi", "My customer number is TS1337.", "My card was charged twice."]
```

| Formato | Aplicável | Exemplo |
| :--- | :--- | :--- |
| String | Uma mensagem, um artigo, um trecho de texto | `"My card was charged twice."` |
| Object | Campos nomeados, registros relacionados, estado do aplicativo | Veja o JSON acima |
| Array | Sequência de mensagens ou registros | Veja o array acima |

## Separe o conteúdo das perguntas

Este é um dos modelos mentais mais importantes ao usar o Jev:

- **O State contém o conteúdo e os fatos de suporte.** Solicitações de reembolso, registros de pedidos e políticas de reembolso devem ser incluídas no state.
- **As perguntas definem as decisões a serem tomadas.** "O usuário está solicitando um reembolso?" e "A política apoia o reembolso?" são perguntas.

Não escreva a lógica de decisão dentro do state. O state deve ser o que você apresenta aos especialistas quando reúne o material — como apresentar evidências a um grupo de especialistas e pedir que cada um tome sua própria decisão.

## Suporte a idiomas

O Jev aceita **texto puro**. O state deve ser uma string, um object JSON ou uma matriz de texto.

- **Não são suportados** imagens, áudio ou vídeo.
- Entradas não textuais devem ser pré-processadas em texto ou campos estruturados antes de serem passadas como state.
- **O idioma principal de treinamento do Jev é o inglês.** Outros idiomas (incluindo chinês, japonês e coreano) são aceitos, mas a precisão atual é mais baixa.

Esta última observação é especialmente importante para usuários chineses: se o seu negócio envolve conteúdo em chinês, recomendamos validar a precisão com dados reais antes de decidir se as rotas críticas devem ser implementadas. Para decisões de alto risco, considere adicionar um resumo em inglês no state ou transferir para atendimento humano quando a confiança for baixa.

## Orçamento e limitações

- Contexto por requisição de até 64k tokens: cobre o `state` mais **todas** as perguntas.
- 32k tokens: cobre o `state` mais a **pergunta mais longa**.
- O modelo lê o state uma única vez e avalia todas as perguntas em paralelo. Portanto, empacotar várias perguntas em uma única requisição tem quase nenhum custo adicional de latência — consulte o [padrão Fan-out](/pt/patterns/fan-out/).
- A precisão varia conforme o tamanho do state; há uma discussão dedicada sobre isso na seção `Jev 1.13 jaggedness`.

## Relacionados

- [Primitivas de Pergunta](/pt/primitives/) — Como organizar perguntas com instruções e critérios
- [Confiança](/pt/concepts/confidence/) — Como controlar o comportamento usando os valores de retorno
- [Referência da API](https://docs.typesafe.ai/api) — Schema da requisição
