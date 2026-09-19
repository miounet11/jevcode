---
title: "Escolha"
description: "Choice seleciona uma opção de um conjunto fixo de alternativas. A resposta consiste na opção selecionada, na probabilidade de cada opção e no nível de confiança."
section: primitives
order: 20
tags: ['choice', 'classification', 'routing']
source: docs.typesafe.ai/primitives/choice
translatedFrom: zh
---

## Quando usar

Use o Choice quando a resposta estiver dentro de **um conjunto fixo de opções mutuamente exclusivas**. Por exemplo:

- Qual equipe deve processar este chamado
- A qual categoria um produto pertence
- Qual linguagem de programação foi usada neste código

Se a resposta for uma posição em um espectro contínuo, use [Score](/pt/primitives/score/); se for apenas sim ou não, use [Noul](/pt/primitives/noul/).

Exemplos típicos de perguntas:

```text
"What programming language is this code written in"
  → options: python, javascript, typescript, go, rust, other

"What type of meeting is this based on the title and description"
  → options: standup, planning, retrospective, one on one, brainstorm, none of the above
```

## Parâmetros

| Parâmetro | Obrigatório | Descrição |
| :--- | :--- | :--- |
| `type` | Sim | Deve ser `"choice"` |
| `instructions` | Sim | A pergunta em si, explicando a decisão a ser tomada |
| `criteria` | Sim | Definição das opções. Formato de objeto `{ Nome da opção: Descrição }`, onde a descrição pode ser `null` |

Cada item em `instructions` e `criteria` pode ser uma **string, objeto ou array**. Comece com strings; quando uma opção precisar de múltiplas diretrizes (o que cobrir, o que não cobrir, alguns exemplos), mude para um objeto.

## Exemplo de solicitação

Classificar chamados de atendimento ao cliente por departamento:

```python
from typesafe_sdk import Choice, TypeSafeClient

client = TypeSafeClient()

ticket = "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing."

response = client.system_one(
    state=ticket,
    questions={
        "department": Choice(
            instructions="Which team should handle this ticket?",
            criteria={
                "returns": "Refunds, wrong or damaged items",
                "shipping": "Delivery status, delays, lost packages",
                "billing": "Charges, invoices, payment problems",
            },
        ),
    },
)

print(response.answers["department"].choice)
```

## Resposta

```json
{
  "model": "jev-latest",
  "answers": {
    "department": {
      "type": "choice",
      "choice": "billing",
      "probabilities": {
        "returns": 0.02,
        "shipping": 0.05,
        "billing": 0.93
      },
      "confidence": 0.91
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

| Campo | Significado |
| :--- | :--- |
| `choice` | Nome da opção selecionada |
| `probabilities` | Distribuição de probabilidade para cada opção |
| `confidence` | Valor agregado da concentração dessa distribuição, de 0 a 1 |

`probabilities` é o material bruto necessário para você definir métricas mais úteis — consulte [Confiança](/pt/concepts/confidence/) para mais detalhes.

## Boas práticas

**Sempre forneça uma opção "outro".** Adicione `other` ou `none of the above` para permitir que o modelo tenha uma saída quando nenhuma das outras opções for adequada, em vez de forçá-lo a escolher a menos pior. Isso reduz significativamente erros em casos extremos.

**Defina os "limites" nas descrições das opções.** O valor da descrição está em delimitar o que está incluído e o que não está. No exemplo acima, `billing` diz "Charges, invoices, payment problems", em vez de algo vago como "coisas relacionadas a dinheiro".

**Se o nome da opção for claro o suficiente, a descrição pode ser `null`.** Por exemplo, uma classificação de tom em três categorias `{ "calm": null, "frustrated": null, "angry": null }` — o próprio nome da opção já é inequívoco, e descrições extras podem introduzir ruído.

**Perguntas especulativas não têm custo adicional.** No exemplo mais complexo abaixo, `return_reason` só faz sentido se `department` for `returns`, e `shipping_issue` só faz sentido se for `shipping`. No entanto, colocá-los todos antecipadamente na mesma solicitação não reduz a velocidade — o modelo avalia todas as perguntas em paralelo. Essas perguntas são chamadas de **perguntas especulativas** (speculative questions).

**Use chamadas em cadeia para classificações em níveis profundos.** Se precisar classificar documentos em uma hierarquia profunda ou em um sistema de categorias amplo, encadeie as perguntas Choice camada por camada. Há um cookbook oficial que explica como executar beam search sobre as probabilidades do Choice: manter as K melhores caminhos candidatos em cada camada, em vez de escolher apenas um caminho de forma gulosa.

## Relacionado

- [Score](/pt/primitives/score/) — Pontuação em uma dimensão ordenada
- [Noul](/pt/primitives/noul/) — Probabilidade de sim/não
- [Padrão de roteamento de intenção](/pt/patterns/intent-routing/) — O uso mais comum de Choice em produção
- [Confiança](/pt/concepts/confidence/) — Controle de comportamento usando `probabilities` e `confidence`
