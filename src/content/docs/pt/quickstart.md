---
title: "5 minutos para começar"
description: "Obtenha a chave da API, execute a primeira chamada Jev usando cURL ou SDK e compreenda a estrutura da resposta."
section: start
order: 20
tags: ['quickstart', 'api', 'sdk']
source: docs.typesafe.ai/introduction/quickstart
translatedFrom: zh
---

## Passo 1: Teste no Playground

Abra o [Playground](https://console.typesafe.ai/playground) e faça login. Cole qualquer texto no campo **state**:

```text
Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing.
I'm losing sales. Please help ASAP.
```

Em seguida, adicione uma pergunta Noul:

```json
{
  "urgency": {
    "type": "noul",
    "instructions": "Does this message express urgency?"
  }
}
```

Você receberá imediatamente um valor entre 0 e 1. Um valor próximo de 1 indica que o modelo considera a resposta como "sim".

O valor do Playground está na **experimentação rápida**: combine perguntas dos tipos Noul, Choice e Score e visualize todos os resultados em uma única chamada para verificar se a formulação das perguntas atende às suas expectativas.

## Passo 2: Obtenha a chave da API

Crie uma chave no [painel de controle](https://console.typesafe.ai/settings/keys) e defina a variável de ambiente:

```bash
export TYPESAFE_API_KEY="sk-..."
```

## Passo 3: Chame a API

Todos os modelos são servidos por um único endpoint:

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Exemplo mínimo executável em cURL:

```bash
curl -X POST https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": "Hi, I have been trying to connect my Stripe account for 3 days and it keeps failing. I am losing sales. Please help ASAP.",
    "questions": {
      "department": {
        "type": "choice",
        "instructions": "Which team should handle this",
        "criteria": {
          "billing": "Payment or subscription issues",
          "technical": "Bugs or integration problems",
          "sales": "Pricing or account questions"
        }
      },
      "frustration": {
        "type": "score",
        "instructions": "How frustrated the customer appears",
        "criteria": [
          "Calm, just stating facts",
          "Frustrated but civil",
          "Very angry, strong language"
        ]
      },
      "is_urgent": {
        "type": "noul",
        "instructions": "The message conveys urgency"
      }
    }
  }'
```

## Passo 4: Use o SDK (Recomendado)

O SDK lê `TYPESAFE_API_KEY` das variáveis de ambiente por padrão e chama `jev-latest` por padrão.

### Python

```bash
pip install typesafe-sdk     # ou uv add typesafe-sdk
```

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state={"document": "I was charged twice. Please fix this ASAP."},
            questions={
                "billing": Noul(instructions="Is this ticket about billing?"),
                "tone": Choice(
                    instructions="What is the customer's tone?",
                    criteria={"calm": None, "frustrated": None, "angry": None},
                ),
                "urgency": Score(
                    instructions="How urgent is this ticket?",
                    criteria=["can wait", "this week", "today"],
                ),
            },
        )

    print(response.nouls["billing"].noul)
    print(response.choices["tone"].choice)
    print(response.scores["urgency"].score)
```

### TypeScript / JavaScript

```bash
npm install @typesafe-ai/sdk    # requer Node.js 20+
```

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

Uma grande vantagem do SDK TypeScript é que **os tipos das respostas são inferidos automaticamente a partir das perguntas**: os `questions` passados determinam o tipo do valor de retorno, permitindo detectar erros de digitação nos nomes dos campos em tempo de compilação.

## Como são os valores de retorno

O tipo de cada resposta é determinado pelo `type` da pergunta:

| Tipo | Campo de retorno | Significado |
| :--- | :--- | :--- |
| `choice` | `choice` / `probabilities` / `confidence` | Opção selecionada, distribuição de probabilidades de cada opção, confiança |
| `score` | `score` / `legend` / `probabilities` / `confidence` | Posição da pontuação (pode estar entre duas categorias), descrição das categorias, distribuição de probabilidades, confiança |
| `noul` | `noul` | Probabilidade de a resposta ser "sim"; não contém `confidence` |

Restrição chave: **a resposta sempre cai dentro das opções fornecidas por você**. O modelo retorna uma distribuição de probabilidades sobre as opções definidas por você, não gerando valores fora desse conjunto. Portanto, não é necessário escrever parsers para recuperar a semântica no código.

## Armadilhas comuns

- **O `state` no estado é lido apenas uma vez**: o modelo lê o state uma vez e avalia todas as perguntas em paralelo. Por isso, agrupe várias perguntas na mesma solicitação o mais cedo possível; o custo de latência adicional é praticamente nulo.
- **Entradas não textuais devem ser convertidas primeiro**: imagens, áudio e vídeo precisam ser convertidos em texto ou campos estruturados antes de serem passados como state.
- **Retorno 429 ao exceder o limite**: o SDK oficial faz nova tentativa com backoff por padrão e respeita o cabeçalho `retry-after`; ao chamar a API HTTP diretamente, você precisa implementar isso manualmente.

## Próximos passos

- [Primitivo Choice](/pt/primitives/choice/) — Base para classificação e roteamento
- [Primitivo Score](/pt/primitives/score/) — Pontuação e ordenação
- [Primitivo Noul](/pt/primitives/noul/) — Validação e barreiras de segurança
- [Confiança](/pt/concepts/confidence/) — Controle do comportamento do sistema usando confiança
