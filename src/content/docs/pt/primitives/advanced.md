---
title: "Problemas estruturados"
description: "instructions e criteria aceitam estruturas JSON. O modelo System One foi treinado para compreender essas estruturas; utilizá-las adequadamente pode melhorar significativamente a precisão de julgamentos complexos."
section: primitives
order: 90
tags: ['instructions', 'criteria', 'structure']
source: docs.typesafe.ai/primitives/advanced
translatedFrom: zh
---

## Onde a estrutura pode ser usada

Os seguintes campos aceitam `string`, `object`, `array` ou `null`:

| Campo | Aplicável a |
| :--- | :--- |
| `instructions` | Choice, Score, Noul |
| Valor de `criteria` (descrição das opções do Choice) | Choice |
| Entradas de `criteria` (descrição dos níveis do Score) | Score |
| `criteria.true` / `criteria.false` | Noul |

**Os modelos do System One são treinados para compreender estruturas.** Isso não é uma limitação que precisa ser contornada, mas uma capacidade que deve ser aproveitada ativamente.

## Quando usar a escrita estruturada

- **Quando ela melhora a clareza.** Quando uma pergunta contém várias partes, usar JSON para colocar cada parte em chaves nomeadas tem uma legibilidade muito superior a juntá-las em uma única string de modelo.
- **Quando a pergunta precisa de dados de suporte.** Esquemas, taxonomias e linhas de banco de dados são, por natureza, JSON. Envie-os como um todo ou passe apenas os subcampos relevantes, em vez de serializá-los como strings e injetá-los no modelo.

## Instructions estruturadas: uma descrição de campo reutilizável

Um padrão comum é usar um objeto `field` para descrever **o campo a ser verificado** e permitir que várias perguntas o referenciem por meio de chaves.

Veja o exemplo de validação de fatura. `state` é um texto de fatura:

```text
Invoice #4471 issued March 3, 2026 to Beaver Dam Logistics for $12,840.00, net 30.
```

Em seguida, **a mesma forma de `field`** orienta quatro tipos diferentes de julgamentos: um Noul para validar um valor numérico, um Choice para selecionar um valor entre candidatos e dois Scores para colocar o valor em uma escala:

```json
{
  "questions": {
    "invoice_number_is_correct": {
      "type": "noul",
      "instructions": {
        "field": {
          "name": "invoice_number",
          "type": "string",
          "description": "The identifier printed on the invoice."
        },
        "extracted_value": "4471",
        "question": "Does `extracted_value` match the `field` as it appears in `source_text`?"
      }
    },
    "customer_name": {
      "type": "choice",
      "instructions": {
        "field": {
          "name": "customer_name",
          "type": "string",
          "description": "The organization the invoice was issued to."
        },
        "question": "Which option is the value of `field` in `source_text`?"
      },
      "criteria": {
        "Beaver Logistics": null,
        "Dam Logistics": null,
        "Beaver Dam Logistics": null,
        "Beaver": null,
        "Dam": null
      }
    },
    "payment_terms": {
      "type": "score",
      "instructions": {
        "field": {
          "name": "payment_terms",
          "type": "integer",
          "unit": "days",
          "description": "Days allowed for payment, from terms such as \"net 30\"."
        },
        "question": "How many days does the `field` in `source_text` allow for payment?"
      },
      "criteria": ["Due on receipt", "Net 15", "Net 30", "Net 60", "Net 90 or longer"]
    }
  }
}
```

O valor deste exemplo reside em demonstrar a **reutilização da estrutura**: o nome, o tipo, a unidade e a descrição são declarados dentro de `field`, e cada pergunta precisa apenas especificar "qual julgamento deve ser feito". Para cenários de extração estruturada, isso é muito mais estável do que escrever um prompt de linguagem natural independente para cada pergunta, pois a semântica do campo é definida apenas uma vez.

Vale notar também o Choice `customer_name`: as opções são um conjunto de **strings aproximadas e facilmente confundíveis** (Beaver Logistics / Dam Logistics / Beaver Dam Logistics / Beaver / Dam). Esse tipo de "selecionar o correto entre candidatos semelhantes" é uma força típica do Choice; usar Noul para avaliar um por um seria mais lento e propenso a inconsistências.

## Critérios de Score estruturados

Cada item no array `criteria` do Score pode ser um objeto, usado para adicionar mais informações aos níveis (como intervalos numéricos ou exemplos).

## Critérios Noul estruturados

Os `criteria` do Noul são opcionais. Quando a fronteira entre "sim" e "não" é sutil, as descrições estruturadas de `true` e `false` permitem fornecer definições e exemplos em ambos os lados, fixando firmemente a fronteira.

## Classificação hierárquica: Choice em cadeia

Para realizar classificações em sistemas de taxonomia profunda, **chame o Choice em cadeia, camada por camada**, em vez de inserir toda a árvore de classificação nas opções de uma única pergunta de uma vez.

A abordagem é: na primeira camada, pergunte sobre o departamento de nível superior, com as opções sendo os próprios departamentos e os valores sendo a estrutura da **subárvore** desse departamento. Verifique o `probabilities` para determinar se a divisão é suficientemente próxima; se for, explore ambos os ramos.

Uma vez que um departamento é selecionado, a próxima camada usa os nós filhos desse departamento como opções e suas subárvores como valores, repetindo o processo até chegar aos nós folha. No código, isso pode ser um loop sobre um dicionário aninhado, onde os `criteria` de cada pergunta correspondem ao nó atual.

Há um cookbook oficial de Classificação Hierárquica que demonstra uma travessia de árvore semelhante, incluindo a estratégia de manter múltiplos caminhos candidatos usando beam search quando as probabilidades são próximas.

> **Dica**: As subárvores podem ficar grandes. Se um ramo for muito grande, corte os valores para incluir apenas seus nós filhos diretos e uma pequena amostra de nós folha.

## Relacionado

- [Choice](/pt/primitives/choice/) / [Score](/pt/primitives/score/) / [Noul](/pt/primitives/noul/)
- [Padrão Fan-out](/pt/patterns/fan-out/) — Agrupar muitas perguntas em uma única solicitação
- [Como construir sistemas System One](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — Fluxo de trabalho completo oficial
