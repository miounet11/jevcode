---
title: "SDK Python"
description: "Installez typesafe-sdk et appelez l'API System One à l'aide d'un client synchrone ou asynchrone."
section: sdk
order: 20
tags: ['python', 'sdk', 'async']
source: docs.typesafe.ai/sdk/python
translatedFrom: zh
---

## Installation

```bash
# Avec uv
uv add typesafe-sdk

# Ou avec pip
pip install typesafe-sdk
```

Définissez ensuite la variable d'environnement (créez une clé sur la [console](https://console.typesafe.ai/)) :

```bash
export TYPESAFE_API_KEY="sk-..."
```

Le client lit automatiquement cette variable d'environnement et appelle par défaut `jev-latest`.

## Client asynchrone (recommandé)

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

Notez les trois points suivants :

1. `state` peut être une chaîne de caractères, un dictionnaire ou une liste ; le SDK gère la sérialisation.
2. Les trois types de questions sont construits avec `Noul(...)` / `Choice(...)` / `Score(...)` ; le champ `type` est rempli automatiquement par le SDK.
3. **La réponse est regroupée par type de question** — `response.nouls`, `response.choices`, `response.scores`, indexés chacun par le nom de la question.

## Constructeurs de questions

| Constructeur | Paramètres | Description |
| :--- | :--- | :--- |
| `Noul(instructions, criteria=None)` | `criteria` optionnel, `{ true, false }` | Probabilité Oui/Non |
| `Choice(instructions, criteria)` | `criteria` est `{ option: description ou None }` | Sélectionne une option parmi une liste fixe |
| `Score(instructions, criteria)` | `criteria` est un **tableau ordonné** | Attribue un score sur des niveaux ordonnés |

## Client synchrone

Si l'environnement ne permet pas facilement l'utilisation de l'asynchrone, une version synchrone est également disponible :

```python
from typesafe_sdk import TypeSafeClient, Noul

client = TypeSafeClient()

response = client.system_one(
    state="I was charged twice.",
    questions={"billing": Noul(instructions="Is this about billing?")},
)

print(response.nouls["billing"].noul)
```

## Erreurs et nouvelles tentatives

Le SDK tente automatiquement de nouvelles requêtes selon une stratégie de backoff exponentiel, et respecte l'en-tête `retry-after` renvoyé par le serveur. Cela simplifie considérablement l'usage par rapport à un appel direct à l'API HTTP : la limitation de débit (rate limiting) est ajustée dynamiquement, et les limites peuvent évoluer à tout moment, comme l'indique explicitement la documentation officielle.

## Liens connexes

- [Référence complète de l'API du SDK Python](https://docs.typesafe.ai/sdk/python/api/clients/async/client)
- [Démarrage rapide en 5 minutes](/fr/quickstart/)
- [Fan-out parallèle](/fr/patterns/fan-out/) — Posez plusieurs questions en une seule fois
