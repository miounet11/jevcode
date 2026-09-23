---
title: "Referência da API HTTP"
description: "Chame diretamente o endpoint de avaliação do TypeSafe — formato da solicitação, os tipos de pergunta noul / choice / score, formatos de resposta e tratamento de erros."
section: sdk
order: 50
tags: ['api', 'http', 'reference']
source: docs.typesafe.ai/api
translatedFrom: en
---
## Endpoint

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Envie um `state` com um mapa de `questions` tipados e receba um `answer` por pergunta.

## Corpo da solicitação

```json
{
  "state": "Help! My payouts have been failing for 3 days.",
  "model": "jev-latest",
  "questions": {
    "is_urgent": {
      "type": "noul",
      "instructions": "Does this convey urgency?"
    }
  }
}
```

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `state` | string \| object \| array | Sim | O conteúdo a ser avaliado. Uma string simples para texto, ou dados estruturados para logs de chat, registros ou o estado atual do seu aplicativo |
| `model` | string | Sim | O modelo que processa a solicitação. Use `jev-latest`, o modelo principal da TypeSafe; consulte a página oficial de Modelos para outros modelos e aliases |
| `questions` | map&lt;string, Question&gt; | Sim | Um mapa de perguntas tipadas |

Você escolhe as chaves em `questions`, e cada resposta retorna sob a **mesma chave**. Essa chave não é enviada ao modelo subjacente e não é usada na inferência, então você pode nomeá-la de acordo com seu domínio de negócio (`department`, `is_urgent`).

## Os três tipos de pergunta

A `Question` é discriminada pelo seu campo `type`; existem três. Todas as três compartilham `type` e `instructions`, e cada uma adiciona seu próprio `criteria`.

`instructions` tem o tipo `string | object | array`.

### noul — uma decisão sim/não

Uma pergunta de sim/não. **Retorna a probabilidade de a resposta ser sim.**

```json
{
  "is_urgent": {
    "type": "noul",
    "instructions": "Does this convey urgency?",
    "criteria": {
      "true": "Explicitly time-sensitive",
      "false": "No urgency expressed"
    }
  }
}
```

`criteria` é opcional e descreve o que "sim" e "não" significam:

| Key | Descrição |
| :--- | :--- |
| `true` | O que significa um valor próximo de 1 ("sim") |
| `false` | O que significa um valor próximo de 0 ("não") |

### escolha — selecione entre as opções

Escolha uma opção de um conjunto que você define, retornando a opção escolhida **mais a distribuição de probabilidade completa**.

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this?",
    "criteria": {
      "billing": "Payments, invoicing, refunds",
      "technical": "Bugs, outages, integrations",
      "sales": "Pricing, upgrades, new accounts"
    }
  }
}
```

`criteria` é obrigatório, digitado `map<string, string | null>`: nomes de opções mapeados para uma descrição de rubrica. Use `null` como o valor quando uma opção não precisar de explicação adicional.

### score — avaliar ao longo de uma escala

Avalie o `state` com base em uma rubrica que você definir, retornando um **valor ponderado por probabilidade entre seus níveis**.

```json
{
  "frustration": {
    "type": "score",
    "instructions": "How frustrated is the customer?",
    "criteria": ["Calm", "Frustrated", "Very angry"]
  }
}
```

`criteria` é obrigatório e é um **array ordenado** de descrições de nível. Você deve incluir pelo menos dois níveis.

## Corpo da resposta

Cada pergunta produz uma resposta, identificada pelo id que você forneceu.

```json
{
  "model": "jev-latest",
  "answers": {
    "is_urgent": {
      "type": "noul",
      "noul": 0.92
    }
  },
  "usage": { "input_tokens": 312, "output_tokens": 48 }
}
```

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `model` | string | O modelo que realizou a avaliação |
| `answers` | map&lt;string, Answer&gt; | Uma resposta por pergunta, com chave idêntica a `questions` |
| `usage` | object | Uso de tokens para a solicitação: `input_tokens`, `output_tokens` |

### Formas de resposta por tipo

Cada resposta carrega um `type` correspondente à sua pergunta. `choice` e `score` respostas também carregam `confidence` (entre 0 e 1), derivado da distribuição de probabilidade dessa resposta (consulte a página oficial de Confiança).

**resposta do Noul**

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `noul` | número | A resposta sim/não, de 0 (não) a 1 (sim) |

```json
{ "type": "noul", "noul": 0.92 }
```

**resposta da escolha**

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `choice` | string | A opção de maior probabilidade |
| `probabilities` | map&lt;string, number&gt; | Probabilidade por opção; soma 1 |
| `confidence` | number | O quão certo o modelo está, derivado das probabilidades |

```json
{
  "type": "choice",
  "choice": "technical",
  "probabilities": { "billing": 0.08, "technical": 0.85, "sales": 0.07 },
  "confidence": 0.82
}
```

**resposta do score**

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `score` | number | O valor ponderado pela probabilidade, que **pode cair entre níveis** |
| `legend` | map&lt;string, string&gt; | Mapeia cada índice de nível de volta à sua descrição |
| `probabilities` | map&lt;string, number&gt; | Probabilidade por nível (chaves como string); soma 1 |
| `confidence` | number | O quão certo o modelo está, derivado das probabilidades |

```json
{
  "type": "score",
  "score": 1.6,
  "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
  "probabilities": { "0": 0.05, "1": 0.3, "2": 0.65 },
  "confidence": 0.78
}
```

Observe como `score` se relaciona com `probabilities`: as probabilidades de três níveis são 0,05 / 0,3 / 0,65, ponderando para um `score` de 1,6. Portanto, `score` não precisa ser um número inteiro — o que é exatamente o que o separa de `choice`: `choice` oferece uma opção discreta, enquanto `score` pode expressar "em algum lugar entre dois níveis."

## Erros

Os erros usam códigos de status HTTP padrão, com um corpo JSON descrevendo o que deu errado.

| Status | Significado |
| :--- | :--- |
| `401 Unauthorized` | A chave da API está ausente ou inválida. Verifique o cabeçalho `Authorization` |
| `422 Unprocessable Entity` | O corpo da solicitação falhou na validação, por exemplo, um campo obrigatório ausente ou uma pergunta malformada. O corpo aponta para o campo ofensor |
| `429 Too Many Requests` | Você excedeu seu limite de taxa. Tente novamente após um curto atraso |
| `529 Overloaded` | TypeSafe está temporariamente sobrecarregado. Tente novamente após um curto atraso |

### Lidando com limites de taxa

Em `429` ou `529`, **retente com backoff exponencial** em vez de tentar novamente imediatamente. Se você usar um SDK oficial, a política de tentativa padrão dele lida com isso automaticamente, portanto, não é necessário código extra.