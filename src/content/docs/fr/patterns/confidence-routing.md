---
title: "Routage par confiance"
description: "Traitez la confiance comme un deuxième axe de décision. La réponse vous indique « ce qui est », tandis que la confiance vous indique « s’il faut exécuter »."
section: patterns
order: 30
tags: ['confidence', 'routing', 'safety']
source: docs.typesafe.ai/patterns/confidence-routing
translatedFrom: zh
---

## Ce problème que ce pattern résout

La réponse et la confiance sont **deux dimensions d'information indépendantes**. Se baser uniquement sur la réponse pour prendre une décision revient à ignorer la moitié des informations que le modèle vous fournit.

L'approche du routage par confiance consiste à d'abord obtenir la réponse, puis à utiliser la confiance pour déterminer si cette réponse est suffisamment fiable pour être exécutée. C'est la base de la construction de systèmes à la fois fiables et sécurisés.

## Exemple : instructions vocales pour une banque

Imaginez que vous développez une interface bancaire vocale permettant aux utilisateurs de gérer leur compte par la voix. Vous souhaitez bien sûr que la confiance de l'identification de l'intention soit la plus élevée possible, mais **le risque associé à chaque action varie, ce qui nécessite des seuils de confiance différents**.

### Étape 1 : Déterminer l'intention de l'utilisateur

Un appel à `Choice` permet d'obtenir l'intention, avec des candidats tels que `check_balance` (vérifier le solde) ou `approve_transfer` (approuver un virement).

### Étape 2 : Routage selon la confiance

```python
action = response.answers["intent"]

# Pour toute action, si la confiance est inférieure à 0.6, rediriger vers un agent humain
if action.confidence < 0.6:
    route_to_support_agent(account_id)

elif action.choice == "check_balance":
    # Risque faible. Une confiance de 0.6 suffit.
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if action.confidence > 0.85:
        # Risque élevé, mais la confiance est également élevée. Exécuter.
        ...
    else:
        # Risque élevé, mais confiance moyenne. Demander une confirmation.
        ask_user_to_confirm(account_id)
```

## Pourquoi les seuils doivent être échelonnés

Regardez les trois seuils dans ce code :

| Seuil | Rôle |
| :--- | :--- |
| `< 0.6` blocage systématique | Lorsqu'il s'auto-évalue comme incertain, le modèle **n'exécute aucune** action |
| Seuil `check_balance` à 0.6 | Opération en lecture seule ; une erreur peut être corrigée |
| Seuil `approve_transfer` à 0.85 | Implique des fonds ; une erreur est irréversible |

C'est l'expression technique du « seuil qui s'adapte au risque ». **Si tout le système utilise un seuil unique, vous soit dérangez excessivement l'utilisateur pour des actions à faible risque, soit manquez de prudence pour des actions à haut risque.**

## Points de conception

**Définissez d'abord une limite inférieure stricte, puis des seuils par action.** La limite inférieure stricte (par exemple 0.6 dans l'exemple) intercepte les cas où le modèle s'auto-évalue comme « vraiment incertain », servant ainsi de filet de sécurité. Les seuils d'action sont ensuite classés par niveau de risque au-dessus de cette limite.

**Faites des seuils une configuration explicite, plutôt que des nombres magiques dispersés.** Centralisez la définition des seuils pour chaque action à un seul endroit, ce qui facilite l'audit et les ajustements. Lorsque les responsables métier demandent « pourquoi ce virement nécessite-t-il une confirmation humaine ? », vous pouvez pointer vers un chiffre précis.

**N'utilisez pas la confiance pour remplacer la validation métier.** La confiance est l'auto-évaluation du modèle et ne remplace pas les règles métier. Les règles déterministes telles que les plafonds de montant ou les vérifications d'autorisation doivent toujours être écrites dans le code.

**Calibrez les seuils avec des données réelles.** Il est explicitement recommandé que les seuils corrects dépendent de votre domaine et des performances du modèle sur votre cas d'utilisation. Commencez par des seuils conservateurs, testez avec vos propres données et ajustez en fonction des observations.

## Quand ne pas l'utiliser

Si une décision **n'a aucune conséquence en cas d'erreur** (par exemple, étiqueter des journaux), ajouter un seuil de confiance n'augmente que la complexité et les coûts humains. La valeur du routage par confiance est proportionnelle au caractère irréversible de la décision.

## Liés

- [Confiance](/fr/concepts/confidence/) — Relation entre la confiance et les probabilités
- [Routage d'intention](/fr/patterns/intent-routing/) — Souvent utilisé conjointement avec le routage par confiance
- [Score composite](/fr/patterns/composite-scoring/) — Gestion de la confiance dans les scénarios de classement
