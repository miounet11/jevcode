---
title: "Confiance"
description: "La confiance est une statistique dérivée de la distribution de probabilité. Comprendre sa relation avec les probabilités, ainsi que la manière dont le seuil s'adapte en fonction du risque."
section: concepts
order: 30
tags: ['confidence', 'probabilities', 'threshold']
source: docs.typesafe.ai/confidence
translatedFrom: zh
---

## Relation entre les deux champs

Toutes les réponses de type `Choice` et `Score` comportent une propriété `probabilities`, qui représente la **distribution de probabilité** sur les différentes options (`Choice`) ou les différentes tranches (`Score`).

La **forme** de cette distribution indique le niveau de certitude du modèle : une concentration autour d'un résultat signifie une réponse certaine, tandis qu'une répartition étalée signifie une incertitude.

La propriété `confidence` compresse cette forme en un nombre compris entre 0 et 1, vous permettant de définir des seuils directement sans avoir à effectuer de calculs mathématiques.

> **Note** : Les réponses `Noul` ne comportent **pas** de champ `confidence` ; elles sont elles-mêmes des valeurs de probabilité comprises entre 0 et 1.

## Signification de la forme de la distribution

- Une **faible confiance** pour un `Choice` signifie généralement qu'aucune option ne se distingue nettement des autres.
- Une **faible confiance** pour un `Score` signifie généralement que les tranches sont ambiguës, multidimensionnelles, ou que les informations dans l'état (`state`) sont insuffisantes pour prendre une décision.

## « Je ne sais pas » est un signal utile

Si un système intelligent — qu'il soit humain ou machine — ne peut pas exprimer honnêtement son incertitude, ce système ne peut pas être fiable.

La confiance offre au modèle un mécanisme intégré pour dire « je ne suis pas sûr de cela ». Cela permet à votre code d'implémenter des comportements différents selon le niveau de certitude, ce qui constitue la base de la construction de systèmes véritablement fiables.

## Trois branches

Un point de départ pratique consiste à diviser la confiance en trois segments, chacun correspondant à un comportement système différent :

- **Haute confiance** : Exécution automatique. Le modèle est clair, aucune intervention humaine n'est nécessaire.
- **Confiance moyenne** : Avancée prudente. Le modèle fournit une réponse raisonnable mais n'est pas certain. Selon le contexte, vous pouvez demander une confirmation à l'utilisateur, marquer l'élément pour examen, ou collecter davantage d'informations.
- **Faible confiance** : Ne pas exécuter. Transférer à un humain, demander des clarifications, ou revenir à un autre système. Le modèle vous indique qu'il lui manque des informations ou que cette question ne lui convient pas.

**L'emplacement des limites dépend du niveau de risque.**

## Les seuils s'adaptent au risque

C'est le principe pratique le plus important : **le seuil de confiance n'est pas un chiffre unique.**

Au sein d'un même système, différentes actions doivent avoir des seuils différents définis en fonction des « conséquences d'une erreur ».

```python
response = client.system_one(
    state=user_message,
    questions={
        "action": Choice(
            instructions="What is the user trying to do?",
            criteria={
                "check_balance": "View account balance",
                "approve_transfer": "Approve the pending withdrawal request",
                "support": "Get help with an issue",
            },
        ),
    },
)

action = response.answers["action"]
confidence = action.confidence

if confidence < 0.5:
    # Le modèle n'est vraiment pas sûr. Ne devinez pas.
    route_to_human(user_message)

elif action.choice == "check_balance":
    # Risque faible. Afficher un écran incorrect est récupérable.
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if confidence > 0.9:
        # Risque élevé + haute confiance. Exécuter avec confirmation.
        confirm_then_execute(account_id)
    else:
        # Risque élevé + confiance moyenne. Vérifier d'abord.
        ask_user_to_confirm(account_id)
```

Ce code contient trois seuils différents, chacun correspondant à un niveau de risque différent :

| Action | Risque | Seuil |
| :--- | :--- | :--- |
| Blocage systématique en dessous de 0,5 | — | Plancher dur, capture les cas où le modèle s'auto-évalue comme incertain |
| `check_balance` | Faible, lecture seule et récupérable | Exécution automatique dès qu'il est supérieur à 0,5 |
| `approve_transfer` | Élevé, implique des fonds | Nécessite > 0,9, et nécessite toujours une confirmation utilisateur |

Le plancher de `0,5` intercepte l'auto-déclaration du modèle indiquant « je ne suis vraiment pas sûr ». Au-dessus de ce seuil, le seuil requis pour exécuter une opération destructrice est bien plus élevé que pour une opération en lecture seule. **Votre code encode votre tolérance au risque.**

> **Note** : La valeur correcte du seuil dépend de votre domaine et des performances réelles du modèle sur votre cas d'utilisation. Commencez par des seuils conservateurs, testez avec vos propres données, puis ajustez en fonction de vos observations.

## Vous pouvez définir vos propres métriques

La `confidence` fournie par défaut est une métrique pratique adaptée à la plupart des cas d'utilisation, mais vous n'êtes pas lié par sa définition. Selon ce que vous évaluez, d'autres métriques peuvent être plus appropriées — c'est précisément pour cela que `probabilities` est également renvoyé : vous disposez de la distribution complète et pouvez calculer vous-même.

Par exemple, la marge de probabilité entre deux options candidates peut être plus révélatrice de la « décision d'exécuter automatiquement » que le degré de concentration dans certains scénarios. Ou vous pouvez ne regarder que la probabilité du top-1, en ignorant le reste. Le choix vous appartient.

## Liens connexes

- [Choice](/fr/primitives/choice/) / [Score](/fr/primitives/score/) — Les deux primitives avec confiance
- [Noul](/fr/primitives/noul/) — Sans confiance, c'est une probabilité en soi
- [Motif de routage par confiance](/fr/patterns/confidence-routing/) — Utilisation de la confiance comme signal de routage dans le pipeline
