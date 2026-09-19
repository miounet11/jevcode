---
title: "Score"
description: "Score attribue une note au contenu en fonction de niveaux descriptifs ordonnés. La réponse comprend la note, la probabilité de chaque niveau et le degré de confiance, et la note peut se situer entre deux niveaux."
section: primitives
order: 30
tags: ['score', 'ranking', 'rating']
source: docs.typesafe.ai/primitives/score
translatedFrom: zh
---

## Quand l'utiliser

Utilisez `Score` lorsque la réponse se situe sur un **spectre continu que vous pouvez décrire à l'aide de plusieurs niveaux**. Par exemple :

- La gravité d'un bug
- Le niveau de satisfaction d'un client
- La profondeur de l'expertise Python d'un candidat

Si la réponse est un ensemble d'options fixes et que ces options n'ont **aucune relation d'ordre** entre elles, utilisez [Choice](/fr/primitives/choice/) ; s'il s'agit simplement d'un oui/non, utilisez [Noul](/fr/primitives/noul/).

Exemples de questions typiques :

```text
"How severe is the bug being reported?"
  → 0: Cosmetic; no impact to functionality
  → 1: Broken or degraded feature, but workaround exists
  → 2: Blocking issue; no workaround exists

"How formal is this outfit based on the description"
  → 0: gym clothes
  → 1: casual
  → 2: business casual
  → 3: formal
  → 4: black tie
```

Notez que dans le deuxième exemple, les niveaux vont de 0 à 4 et sont **ordonnés** — du plus décontracté au plus formel. C'est précisément la ligne de démarcation entre `Score` et `Choice`. À l'inverse, il n'existe pas de véritable relation d'ordre entre `{ billing, technical, sales }` ; forcer l'utilisation de `Score` introduirait une sémantique ordinale fictive.

## Paramètres

| Paramètre | Obligatoire | Description |
| :--- | :--- | :--- |
| `type` | Oui | Doit être `"score"` |
| `instructions` | Oui | La question elle-même |
| `criteria` | Oui | **Tableau de niveaux**, classés du plus bas au plus élevé ; la description de chaque élément définit ce niveau |

Contrairement à `criteria` de `Choice` qui est un objet, `criteria` de `Score` est un **tableau ordonné**. L'ordre du tableau correspond à la direction de la dimension.

Comme pour `Choice`, chaque élément de `criteria` peut être une chaîne de caractères, un objet ou un tableau ; utilisez un objet lorsqu'un niveau nécessite davantage d'explications.

## Exemple de requête

```python
from typesafe_sdk import Score, TypeSafeClient

client = TypeSafeClient()

bug = "The export button throws a CORS error when saving to Google Sheets. It works in Chrome, but a few of our customers only use Safari."

response = client.system_one(
    state=bug,
    questions={
        "bug_severity": Score(
            instructions="How severe is the reported issue?",
            criteria=[
                "Cosmetic; no impact to functionality",
                "Broken or degraded feature, but workaround exists",
                "Blocking issue; no workaround exists",
            ],
        ),
    },
)

print(response.answers["bug_severity"].score)
```

## Valeur de retour

La caractéristique clé de la réponse `Score` est que le `score` **peut se situer entre deux niveaux** — il représente une position sur la dimension, et non un index de niveau.

| Champ | Signification |
| :--- | :--- |
| `score` | Position sur la dimension, peut être une valeur décimale |
| `legend` | Vos définitions de niveaux répétées par numéro, facilitant la correspondance sémantique dans le code |
| `probabilities` | Distribution de probabilité sur chaque niveau |
| `confidence` | Degré de concentration de la distribution, de 0 à 1 |

Supposons que l'exemple ci-dessus retourne `score: 1.4` : cela signifie que le modèle estime que la gravité du problème se situe entre « fonctionnalité endommagée mais avec une solution de contournement » et « problème bloquant », en se rapprochant du premier niveau. Cette **continuité est l'avantage fondamental de `Score` par rapport à l'assemblage de « plusieurs Noul »** — un seul appel fournit les informations de distribution complètes, plutôt que plusieurs jugements indépendants.

Le rôle de `legend` est de rendre la valeur de retour auto-explicative : vous n'avez pas besoin de maintenir une table de constantes de niveau séparée dans votre code pour traduire les chiffres en sémantique.

## Points d'attention

**Les descriptions des niveaux doivent être discernables.** La description de chaque niveau doit permettre à une autre personne d'identifier les limites de manière cohérente. Des descriptions telles que `"Calm, matter-of-fact"` / `"Frustrated but civil"` / `"Very angry"` sont discernables ; `"Low / Medium / High"` ne le sont pas.

**Limitez le nombre de niveaux à 3 ou 5.** Trop peu de niveaux entraînent une perte de distinction, tandis que trop de niveaux rendent les frontières entre les niveaux adjacents floues, ce qui réduit la confiance.

**Concentrez-vous sur `confidence` plutôt que de ne regarder que `score`.** Une faible confiance dans le Score indique généralement que les définitions des niveaux sont ambiguës, que la dimension est multidimensionnelle, ou que les informations d'état (`state`) sont insuffisantes. Dans ce cas, la bonne réaction est d'améliorer les définitions des niveaux, plutôt que de forcer la prise d'une valeur.

**Dans les scénarios de classement, `Score` est le prisme principal.** Le classement par pertinence, l'évaluation de la qualité et la catégorisation des risques conviennent bien à l'utilisation de `Score`, combiné au [pattern de score composite](/fr/patterns/composite-scoring/) pour fusionner pondéralement plusieurs dimensions.

## Liens connexes

- [Choice](/fr/primitives/choice/) — Options fixes non ordonnées
- [Noul](/fr/primitives/noul/) — Probabilités oui/non
- [Pattern de score composite](/fr/patterns/composite-scoring/) — Synthèse pondérée multidimensionnelle
- [Confiance](/fr/concepts/confidence/) — Que signifie une faible confiance
