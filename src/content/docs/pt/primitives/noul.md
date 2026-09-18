---
title: "Noul"
description: "O Noul permite que o modelo avalie uma pergunta de sim/não, retornando a probabilidade da resposta ser «sim». Ele próprio é um valor entre 0 e 1, sem uma confiança separada."
section: primitives
order: 40
tags: ['noul', 'verification', 'guardrails']
source: docs.typesafe.ai/primitives/noul
translatedFrom: zh
---

## Quando usar

Use o Noul quando a resposta for **sim ou não**. Por exemplo:

- Esta mensagem está solicitando um reembolso?
- Este currículo menciona experiência com sistemas distribuídos?
- Este comentário contém informações de identificação pessoal?

Se a resposta for uma entre um conjunto de opções, use [Choice](/zh/primitives/choice/); se for uma posição em um espectro, use [Score](/zh/primitives/score/).

Exemplos típicos de perguntas:

```text
"Is the customer requesting a refund?"
"Does this resume mention experience with distributed systems?"
"Does the message contain personally identifiable information?"
"Does the room have a minifridge?"
```

## Parâmetros

| Campo | Obrigatório | Descrição |
| :--- | :--- | :--- |
| `type` | Sim | Deve ser `"noul"` |
| `instructions` | Sim | A pergunta ou afirmação a ser avaliada |
| `criteria` | Não | Descrição opcional de `{ true, false }` para esclarecer o que "sim" e "não" representam |

`criteria` é opcional. `instructions` já é suficiente para a maioria das perguntas Noul; use-o apenas para fixar o significado dos dois resultados quando a fronteira entre "sim" e "não" for sutil. **Recomenda-se testar ambas as abordagens** para ver qual funciona melhor com seus dados.

## Exemplo de solicitação

```python
from typesafe_sdk import Noul, TypeSafeClient

client = TypeSafeClient()

response = client.system_one(
    state=ticket_conversation,
    questions={
        "is_human_escalation": Noul(
            instructions="Is the customer asking to speak to a human?",
        ),
        "is_repeat_contact": Noul(
            instructions="Has this customer contacted us about this issue before?",
        ),
    },
)

print(response.nouls["is_human_escalation"].noul)
```

## Retorno

```json
{
  "model": "jev-latest",
  "answers": {
    "is_human_escalation": {
      "type": "noul",
      "noul": 0.99
    },
    "is_repeat_contact": {
      "type": "noul",
      "noul": 0.93
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

`noul` varia de 0 a 1, representando a probabilidade de a resposta ser **"sim"**. Em código, onde uma decisão binária é necessária, geralmente converte-se esse valor para booleano usando um limiar.

## Noul não retorna confiança separada

Esta é uma diferença importante entre o Noul e os outros dois primitivos: **o Noul é a própria probabilidade**, portanto, não há um campo `confidence` adicional.

- Próximo de 1: forte "sim"
- Próximo de 0: forte "não"
- Próximo de 0.5: probabilidades semelhantes para sim e não

## A formulação é tudo

**Faça com que altas probabilidades correspondam a "sim".** A recomendação oficial é formular as perguntas de modo que o significado do retorno seja inequívoco. Se você escrever "Is this not urgent?" (Isso não é urgente?), um valor de 0.9 significa "não urgente", o que pode levar os leitores do código a interpretar erroneamente. Escrevendo "Is this urgent?" (Isso é urgente?), 0.9 indica que é urgente.

**Defina um critério claro de julgamento.** Por exemplo, com "Is the candidate strong in Python?" (O candidato é forte em Python?): é necessário definir primeiro o que significa ser "forte". Uma definição vaga torna as probabilidades difíceis de interpretar.

**0.5 não equivale a "nível médio".** Este é o erro mais comum: 0.5 indica que o modelo não consegue distinguir entre sim ou não, e não "metade do nível". Para medir o grau de proficiência de uma habilidade, use [Score](/zh/primitives/score/) para pontuar em níveis bem definidos.

**Você pode formular as instruções como afirmações a serem avaliadas quanto à veracidade.** Além de perguntas, você também pode escrever as instruções como uma afirmação para que o modelo avalie sua veracidade. Por exemplo, para o fato de "o cliente estar solicitando um reembolso", ao escrever como uma afirmação, um valor próximo de 1 indica que a afirmação é verdadeira. **Vale a pena testar ambas as formulações com seus próprios dados.**

## Relacionado

- [Choice](/zh/primitives/choice/) — Opções fixas não ordenadas
- [Score](/zh/primitives/score/) — Pontuação em uma escala ordenada
- [Confiança](/zh/concepts/confidence/) — Por que o Noul não possui confidence
- [Uso do Noul em barreiras de segurança](https://docs.typesafe.ai/patterns) — Biblioteca de padrões oficiais
