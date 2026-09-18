---
title: "5 minutes pour commencer"
description: "Obtenez la clé API, effectuez votre premier appel Jev à l’aide de cURL ou du SDK, et comprenez la structure de la réponse."
section: start
order: 20
tags: ['quickstart', 'api', 'sdk']
source: docs.typesafe.ai/introduction/quickstart
translatedFrom: zh
---

## Étape 1 : Tester dans le Playground

Ouvrez le [Playground](https://console.typesafe.ai/playground) et connectez-vous. Collez n'importe quel texte dans le champ **state** :

```text
Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing.
I'm losing sales. Please help ASAP.
```

Ajoutez ensuite une question de type Noul :

```json
{
  "urgency": {
    "type": "noul",
    "instructions": "Does this message express urgency?"
  }
}
```

Vous obtiendrez immédiatement une valeur comprise entre 0 et 1. Une valeur proche de 1 indique que le modèle estime que la réponse est « oui ».

La valeur du Playground réside dans l'**itération rapide** : mélangez les questions de type Noul, Choice et Score, et observez tous les résultats en un seul appel pour vérifier que la formulation des questions atteint l'objectif souhaité.

## Étape 2 : Obtenir la clé API

Créez une clé sur le [dashboard](https://console.typesafe.ai/settings/keys), puis définissez la variable d'environnement :

```bash
export TYPESAFE_API_KEY="sk-..."
```

## Étape 3 : Appeler l'API

Tous les modèles sont servis par le même point de terminaison :

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Exemple cURL minimal fonctionnel :

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

## Étape 4 : Utiliser le SDK (recommandé)

Le SDK lit par défaut la clé `TYPESAFE_API_KEY` depuis les variables d'environnement et appelle `jev-latest` par défaut.

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
npm install @typesafe-ai/sdk    # nécessite Node.js 20+
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

L'un des grands avantages du SDK TypeScript est que **les types des réponses sont déduits automatiquement à partir des questions** : les `questions` transmises déterminent le type de la valeur de retour, permettant de détecter les erreurs de nom de champ dès la compilation.

## À quoi ressemblent les réponses

Le type de chaque réponse est déterminé par le `type` de la question :

| Type | Champ de retour | Signification |
| :--- | :--- | :--- |
| `choice` | `choice` / `probabilities` / `confidence` | Option sélectionnée, distribution de probabilité des options, niveau de confiance |
| `score` | `score` / `legend` / `probabilities` / `confidence` | Position du score (peut se situer entre deux niveaux), légende des niveaux, distribution de probabilité, niveau de confiance |
| `noul` | `noul` | Probabilité que la réponse soit « oui », ne contient pas de champ `confidence` |

Contrainte clé : **la réponse se situe toujours dans les options que vous avez fournies**. Le modèle renvoie une distribution de probabilité sur les options que vous avez définies ; il ne génère jamais de valeurs en dehors de cet ensemble. Il n'est donc pas nécessaire d'écrire de code pour restaurer la sémantique lors de l'analyse des réponses.

## Pièges courants

- **Le `state` dans l'état n'est lu qu'une seule fois** : Le modèle lit le state une fois, puis évalue toutes les questions en parallèle. Regroupez donc plusieurs questions dans une seule requête dès que possible, car le coût de latence supplémentaire est quasi nul.
- **Les entrées non textuelles doivent être converties** : Les images, l'audio et la vidéo doivent d'abord être convertis en texte ou en champs structurés avant d'être transmis en tant que state.
- **Retour 429 en cas de dépassement de limite** : Le SDK officiel réessaie par défaut avec une stratégie de backoff et respecte l'en-tête `retry-after` ; si vous appelez l'API HTTP directement, vous devez implémenter cette logique vous-même.

## Prochaines étapes

- [Primitif Choice](/zh/primitives/choice/) — Base de la classification et du routage
- [Primitif Score](/zh/primitives/score/) — Évaluation et classement
- [Primitif Noul](/zh/primitives/noul/) — Validation et garde-fou
- [Confiance](/zh/concepts/confidence/) — Utilisation de la confiance pour contrôler le comportement du système
