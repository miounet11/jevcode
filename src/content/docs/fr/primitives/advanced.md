---
title: "Questions structurées"
description: "Les instructions et les critères acceptent tous deux une structure JSON. Le modèle System One est entraîné pour comprendre cette structure ; en tirer parti peut considérablement améliorer la précision des décisions complexes."
section: primitives
order: 90
tags: ['instructions', 'criteria', 'structure']
source: docs.typesafe.ai/primitives/advanced
translatedFrom: zh
---

## Où utiliser la structure

Les champs suivants acceptent les types `string`, `object`, `array` ou `null` :

| Champ | S'applique à |
| :--- | :--- |
| `instructions` | Choice, Score, Noul |
| Valeur de `criteria` (description des options de Choice) | Choice |
| Entrées de `criteria` (description des paliers de Score) | Score |
| `criteria.true` / `criteria.false` | Noul |

**Le modèle System One est entraîné pour comprendre la structure.** Il ne s'agit pas d'une limitation à contourner, mais d'une capacité qu'il convient d'exploiter activement.

## Quand utiliser une écriture structurée

- **Lorsqu'elle améliore la clarté.** Lorsqu'une question comporte plusieurs parties, utiliser JSON pour placer chaque partie dans des clés nommées offre une lisibilité bien supérieure à leur concaténation dans une chaîne de caractères modèle.
- **Lorsque la question nécessite des données de support.** Les schémas, les taxonomies et les lignes de base de données sont nativement du JSON. Transmettez-les globalement, ou uniquement les sous-champs pertinents, plutôt que de les sérialiser en chaîne de caractères pour les injecter dans le modèle.

## Instructions structurées : une description de champ réutilisable

Un pattern courant consiste à décrire le **champ vérifié** via un objet `field`, puis à permettre à plusieurs questions de s'y référer par clé.

Considérons l'exemple de vérification d'une facture. `state` contient le texte de la facture :

```text
Invoice #4471 issued March 3, 2026 to Beaver Dam Logistics for $12,840.00, net 30.
```

Ensuite, **la même forme de `field`** pilote quatre types de jugements différents : un Noul pour valider une valeur numérique, un Choice pour sélectionner une valeur parmi des candidats, et deux Scores pour placer la valeur sur une échelle :

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

La valeur de cet exemple réside dans la démonstration de la **réutilisabilité de la structure** : `field` déclare le nom, le type, l'unité et la description, puis chaque question se contente d'indiquer « quel jugement effectuer ». Pour les scénarios d'extraction structurée, cela est bien plus stable que de rédiger une invite en langage naturel indépendante pour chaque question, car la sémantique du champ n'est définie qu'une seule fois.

Le Choice `customer_name` mérite également une attention : les options sont un ensemble de **chaînes approximatives facilement confusables** (Beaver Logistics / Dam Logistics / Beaver Dam Logistics / Beaver / Dam). Ce type de tâche « sélectionner le bon candidat parmi des candidats similaires » est un point fort typique de Choice ; utiliser Noul pour les évaluer un par un serait à la fois plus lent et sujet à des incohérences.

## Paliers Score structurés

Chaque élément du tableau `criteria` de Score peut être un objet, permettant d'ajouter des informations supplémentaires aux paliers (par exemple, des intervalles numériques, des exemples).

## Critères Noul structurés

Les `criteria` de Noul sont optionnels. Lorsque la frontière entre le oui et le non est subtile, les descriptions structurées de `true` et `false` vous permettent de fournir des définitions et des exemples de chaque côté, fixant ainsi fermement la frontière.

## Classification hiérarchique : enchaînement de Choices

Pour effectuer un classement au sein d'un système de classification profond, **enchaînez les appels à Choice couche par couche**, au lieu d'injecter l'ensemble de l'arbre de classification dans les options d'une seule question.

La méthode consiste à interroger la couche supérieure pour le département racine, avec pour options les départements eux-mêmes et pour valeurs la structure de leur **sous-arbre**. Évaluez la probabilité de scission via `probabilities` : si elle est proche, explorez les deux branches.

Une fois qu'un département est sélectionné, la couche suivante prend les nœuds enfants de ce département comme options et leurs sous-arbres comme valeurs, et ainsi de suite jusqu'aux feuilles. Dans le code, cela peut se traduire par une boucle sur un dictionnaire imbriqué, où les `criteria` de chaque question correspondent au nœud actuel.

Un cookbook officiel sur la Classification Hiérarchique présente une traversal d'arbre similaire, incluant une stratégie de conservation de plusieurs chemins candidats via une recherche par faisceau (beam search) lorsque les probabilités sont proches.

> **Astuce** : Les sous-arbres peuvent devenir volumineux. Si une branche est trop grande, limitez la valeur à ses nœuds enfants directs et à un échantillon limité de feuilles.

## Liens connexes

- [Choice](/fr/primitives/choice/) / [Score](/fr/primitives/score/) / [Noul](/fr/primitives/noul/)
- [Pattern Fan-out](/fr/patterns/fan-out/) — Regrouper un grand nombre de questions dans une seule requête
- [Comment construire un système System One](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — Flux de travail complet officiel
