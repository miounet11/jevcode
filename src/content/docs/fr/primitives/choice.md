---
title: "Choix"
description: "Choice permet de sélectionner une option parmi un ensemble d'options fixes. La réponse comprend l'option sélectionnée, la probabilité associée à chaque option, ainsi que le niveau de confiance."
section: primitives
order: 20
tags: ['choice', 'classification', 'routing']
source: docs.typesafe.ai/primitives/choice
translatedFrom: zh
---

## Quand l'utiliser

Utilisez `Choice` lorsque la réponse se situe dans **un ensemble fixe d'options mutuellement exclusives**. Par exemple :

- Quelle équipe traite ce ticket
- À quelle catégorie appartient un produit
- Dans quel langage est écrit ce code

Si la réponse correspond à une position sur un spectre continu, utilisez [Score](/zh/primitives/score/) ; s'il s'agit d'une réponse binaire (oui/non), utilisez [Noul](/zh/primitives/noul/).

Exemples de questions typiques :

```text
"What programming language is this code written in"
  → options: python, javascript, typescript, go, rust, other

"What type of meeting is this based on the title and description"
  → options: standup, planning, retrospective, one on one, brainstorm, none of the above
```

## Paramètres

| Paramètre | Obligatoire | Description |
| :--- | :--- | :--- |
| `type` | Oui | Doit être `"choice"` |
| `instructions` | Oui | La question elle-même, précisant la décision à prendre |
| `criteria` | Oui | Définition des options. Format objet `{ Nom de l'option: Description }`, la description pouvant être `null` |

Chaque élément dans `instructions` et `criteria` peut être une **chaîne de caractères, un objet ou un tableau**. Commencez par des chaînes de caractères ; passez à un objet lorsqu'une option nécessite plusieurs instructions (ce qu'elle couvre, ce qu'elle ne couvre pas, des exemples).

## Exemple de requête

Classer les tickets de support client par département :

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

## Valeur de retour

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

| Champ | Signification |
| :--- | :--- |
| `choice` | Nom de l'option sélectionnée |
| `probabilities` | Distribution de probabilité pour chaque option |
| `confidence` | Valeur résumant la concentration de cette distribution, comprise entre 0 et 1 |

`probabilities` constitue la matière première nécessaire pour définir des métriques plus utiles selon vos besoins — consultez la section [Confiance](/zh/concepts/confidence/) pour plus de détails.

## Points d'attention

**Fournissez toujours une option de repli.** Ajoutez une option `other` ou `none of the above` pour permettre au modèle de répondre lorsque aucune autre option ne convient, plutôt que de le forcer à choisir la moins mauvaise. Cela réduit considérablement les erreurs sur les cas limites.

**Décrivez les « frontières » des options.** La valeur des descriptions réside dans la clarification de ce qui est inclus et exclu. Dans l'exemple ci-dessus, `billing` est décrit comme « Charges, invoices, payment problems », et non de manière vague comme « Tout ce qui est lié à l'argent ».

**Lorsque les noms d'options sont suffisamment clairs, la description peut être `null`.** Par exemple, pour une classification en trois tonalités : `{ "calm": null, "frustrated": null, "angry": null }`. Le nom de l'option est déjà sans ambiguïté ; des descriptions superflues pourraient introduire du bruit.

**Les questions spéculatives n'ont pas de coût supplémentaire.** Dans l'exemple plus complexe ci-dessous, `return_reason` n'a de sens que si `department` est `returns`, et `shipping_issue` n'a de sens que si `department` est `shipping`. Les placer toutes en amont dans la même requête ne ralentit pas le traitement : le modèle évalue toutes les questions en parallèle. Ce type de questions est appelé **questions spéculatives** (speculative questions).

**Pour les classifications à plusieurs niveaux, utilisez des appels en chaîne.** Si vous devez classer des documents dans une hiérarchie profonde ou un grand système de catégories, enchaînez les questions `Choice` couche par couche. Un cookbook officiel explique comment exécuter une recherche par faisceaux (beam search) sur les probabilités de `Choice` : à chaque niveau, conservez les K meilleurs chemins candidats au lieu de sélectionner de manière gloutonne un seul chemin.

## Liens connexes

- [Score](/zh/primitives/score/) — Évaluation sur une échelle ordonnée
- [Noul](/zh/primitives/noul/) — Probabilité Oui/Non
- [Motif de routage d'intention](/zh/patterns/intent-routing/) — L'utilisation la plus courante de `Choice` en production
- [Confiance](/zh/concepts/confidence/) — Contrôle du comportement à l'aide de `probabilities` et `confidence`
