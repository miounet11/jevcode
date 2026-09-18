---
title: "SDK Python"
description: "Instale o typesafe-sdk e chame a API do System One usando um cliente síncrono ou assíncrono."
section: sdk
order: 20
tags: ['python', 'sdk', 'async']
source: docs.typesafe.ai/sdk/python
translatedFrom: zh
---

## Instalação

```bash
# Com uv
uv add typesafe-sdk

# Ou com pip
pip install typesafe-sdk
```

Em seguida, defina a variável de ambiente (crie a chave no [console](https://console.typesafe.ai/)):

```bash
export TYPESAFE_API_KEY="sk-..."
```

O cliente lê automaticamente essa variável de ambiente e chama `jev-latest` por padrão.

## Cliente assíncrono (recomendado)

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state={"document": "Fui cobrado duas vezes. Por favor, resolva isso o mais rápido possível."},
            questions={
                "billing": Noul(instructions="Este ticket é sobre faturamento?"),
                "tone": Choice(
                    instructions="Qual é o tom do cliente?",
                    criteria={"calm": None, "frustrated": None, "angry": None},
                ),
                "urgency": Score(
                    instructions="Qual é a urgência deste ticket?",
                    criteria=["pode esperar", "esta semana", "hoje"],
                ),
            },
        )

    print(response.nouls["billing"].noul)
    print(response.choices["tone"].choice)
    print(response.scores["urgency"].score)
```

Observe três pontos:

1. `state` pode receber diretamente uma string, dicionário ou lista; o SDK cuida da serialização.
2. Os três tipos de perguntas são construídos com `Noul(...)` / `Choice(...)` / `Score(...)`; o campo `type` é preenchido automaticamente pelo SDK.
3. **A resposta é agrupada por tipo de pergunta** — `response.nouls`, `response.choices`, `response.scores`, cada um indexado pelo nome da pergunta.

## Construtores de perguntas

| Construtor | Parâmetros | Descrição |
| :--- | :--- | :--- |
| `Noul(instructions, criteria=None)` | `criteria` opcional, `{ true, false }` | Probabilidade de Sim/Não |
| `Choice(instructions, criteria)` | `criteria` é `{ opção: descrição ou None }` | Escolha uma opção de um conjunto fixo |
| `Score(instructions, criteria)` | `criteria` é uma **lista ordenada** | Pontuação em níveis ordenados |

## Cliente síncrono

Se o ambiente não suportar async, há também uma versão síncrona:

```python
from typesafe_sdk import TypeSafeClient, Noul

client = TypeSafeClient()

response = client.system_one(
    state="Fui cobrado duas vezes.",
    questions={"billing": Noul(instructions="Este ticket é sobre faturamento?")},
)

print(response.nouls["billing"].noul)
```

## Erros e retentativas

O SDK tenta novamente automaticamente com base em uma estratégia de backoff exponencial e respeita o cabeçalho `retry-after` retornado pelo servidor. Isso é muito mais conveniente do que chamar a API HTTP diretamente, pois a limitação de taxa (rate limiting) é ajustada dinamicamente; a equipe oficial deixa claro que os limites podem mudar a qualquer momento.

## Relacionados

- [Referência completa da API do SDK Python](https://docs.typesafe.ai/sdk/python/api/clients/async/client)
- [Introdução em 5 minutos](/pt/quickstart/)
- [Fan-out paralelo](/pt/patterns/fan-out/) — Faça várias perguntas de uma vez
