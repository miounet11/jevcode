---
title: "Noul"
description: "Noul permet au modèle d'évaluer une question à réponse binaire (oui/non) et retourne la probabilité que la réponse soit « oui ». Il s'agit d'une valeur comprise entre 0 et 1, sans champ de confiance séparé."
section: primitives
order: 40
tags: ['noul', 'verification', 'guardrails']
source: docs.typesafe.ai/primitives/noul
translatedFrom: zh
---

## Quand l'utiliser

Utilisez Noul lorsque la réponse est **oui ou non**. Par exemple :

- Ce message demande-t-il un remboursement ?
- Ce CV mentionne-t-il une expérience en systèmes distribués ?
- Ce commentaire contient-il des informations d'identification personnelle ?

Si la réponse fait partie d'un ensemble d'options, utilisez [Choice](/zh/primitives/choice/) ; si elle correspond à une position sur un spectre, utilisez [Score](/zh/primitives/score/).

Exemples de questions typiques :

```text
"Is the customer requesting a refund?"
"Does this resume mention experience with distributed systems?"
"Does the message contain personally identifiable information?"
"Does the room have a minifridge?"
```

## Paramètres

| Champ | Obligatoire | Description |
| :--- | :--- | :--- |
| `type` | Oui | Doit être `"noul"` |
| `instructions` | Oui | La question ou l'énoncé à évaluer (oui/non) |
| `criteria` | Non | Descriptions optionnelles `{ true, false }` qui clarifient ce que signifient « oui » et « non » |

`criteria` est optionnel. Les `instructions` suffisent généralement pour la plupart des questions Noul ; utilisez-les uniquement pour fixer précisément la signification des deux résultats lorsque la frontière entre « oui » et « non » est subtile. **Il est recommandé d'essayer les deux formulations** pour voir laquelle fonctionne mieux avec vos données.

## Exemple de requête

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

## Valeur de retour

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

La valeur `noul` varie de 0 à 1 et représente la probabilité que la réponse soit **« oui »**. En cas de besoin de décision binaire dans le code, il est courant de convertir cette valeur en booléen en utilisant un seuil.

## Noul ne renvoie pas de confiance séparée

C'est une différence importante entre Noul et les deux autres primitives : **Noul est lui-même une probabilité**, il n'y a donc pas de champ `confidence` supplémentaire.

- Proche de 1 : un « oui » fort
- Proche de 0 : un « non » fort
- Proche de 0,5 : probabilités égales pour « oui » et « non »

## La formulation fait tout

**Associez une probabilité élevée à « oui ».** Il est recommandé de formuler les questions de manière à ce que la signification de la valeur de retour soit sans ambiguïté. Si vous posez la question « Is this not urgent? » (Ce n'est pas urgent, n'est-ce pas ?), une valeur de 0,9 signifie « non urgent », ce qui peut facilement prêter à confusion lors de la lecture du code. Avec « Is this urgent? » (Est-ce urgent ?), une valeur de 0,9 signifie « urgent ».

**Définissez un critère d'évaluation clair.** Prenons l'exemple de « Is the candidate strong in Python? » (Le candidat est-il fort en Python ?) : il faut d'abord définir ce que signifie « fort ». Une définition imprécise rendra les probabilités difficiles à interpréter.

**0,5 ne signifie pas « niveau moyen ».** C'est l'erreur la plus courante : 0,5 indique que le modèle ne parvient pas à distinguer entre « oui » et « non », et non qu'il y a « la moitié du niveau ». Pour mesurer le degré de maîtrise d'une compétence, utilisez [Score](/zh/primitives/score/) pour attribuer des points sur des paliers définis.

**Vous pouvez formuler les instructions sous forme d'énoncés à évaluer pour leur véracité.** Outre les questions, vous pouvez également rédiger les instructions sous forme d'énoncés que le modèle doit évaluer quant à leur véracité. Par exemple, pour l'énoncé « Le client demande un remboursement », une valeur proche de 1 indique que l'énoncé est vrai. **Il est conseillé d'essayer les deux formulations avec vos propres données.**

## Liés

- [Choice](/zh/primitives/choice/) — Options fixes non ordonnées
- [Score](/zh/primitives/score/) — Évaluation sur une échelle ordonnée
- [Confiance](/zh/concepts/confidence/) — Pourquoi Noul n'a pas de champ confidence
- [Application de Noul dans les garde-fous](https://docs.typesafe.ai/patterns) — Bibliothèque de modèles officiels
