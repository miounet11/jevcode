---
title: "Découvrez Jev"
description: "Jev est le modèle phare de TypeSafe et le premier modèle System One. Il transforme les états non structurés et les questions typées en décisions typées que le logiciel peut utiliser directement."
section: start
order: 10
tags: ['overview', 'system-one']
source: docs.typesafe.ai/introduction
translatedFrom: zh
---

## Comprendre en une phrase

Jev n'est pas un modèle de chat. Vous lui fournissez un **état** (state) et des **questions typées** (typed questions), et il retourne des **décisions typées** (typed decisions) — une option, un score ou une probabilité booléenne, chacun accompagné d'une **confiance** (confidence).

Cette positionnement définit la différence fondamentale avec les modèles conversationnels :

| Dimension | Modèle conversationnel | Jev |
| :--- | :--- | :--- |
| Sortie | Texte libre | Résultat structuré selon un schéma fixe |
| Usage | Génération, conversation, chaînes de raisonnement | Classification, routage, notation, validation, garde-fous |
| Intégration | Analyse de la sortie du modèle | Consommation directe de la valeur de retour, sans analyse regex |
| Confiance | Généralement absente | Présente pour chaque réponse |
| Latence | De l'ordre de la seconde, augmente avec la longueur de la sortie | Faible et stable |

## Pourquoi une « couche de décision » ?

Lorsqu'on intègre un LLM dans un système métier, le problème le plus courant est le suivant : le modèle produit un texte en langage naturel, et vous devez écrire un analyseur, gérer les cas limites et deviner si la réponse est correcte. Jev abstrait cette couche — la question elle-même déclare le type de sortie, et le modèle doit répondre selon le schéma.

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this",
    "criteria": {
      "billing": "Payment or subscription issues",
      "technical": "Bugs or integration problems",
      "sales": "Pricing or account questions"
    }
  }
}
```

La valeur de retour est l'une des suivantes : `billing` / `technical` / `sales`, accompagnée d'un niveau de confiance. Pas d'analyse, pas de format de repli.

## Trois primitives de question

Toutes les décisions se résument à trois types de questions. Il s'agit de l'abstraction centrale de Jev ; les comprendre, c'est comprendre l'ensemble du système :

- **[Choice](/zh/primitives/choice/)** — Sélectionner une option parmi un ensemble de candidats mutuellement exclusifs. Utilisé pour la reconnaissance d'intention, le routage des tickets, le choix d'actions.
- **[Score](/zh/primitives/score/)** — Noter selon une échelle ou des critères de notation. Utilisé pour le classement par pertinence, l'évaluation de la qualité, la catégorisation des risques.
- **[Noul](/zh/primitives/noul/)** — Répondre à une question par oui ou non, en retournant la probabilité que la réponse soit « oui ». Utilisé pour la validation de contenu, la vérification d'assertions, les garde-fous.

Une seule requête peut mélanger ces trois types de questions. Le modèle lit l'état une seule fois, puis évalue toutes les questions en parallèle.

## Positionnement de System One

System One est une catégorie de modèles conçus spécifiquement pour « prendre des décisions rapides et structurées directement exploitables par le logiciel ». Jev est le premier modèle de cette catégorie. Il ne remplace pas les modèles de raisonnement de type System Two, mais travaille en complémentarité :

- **System One** : Jugements fréquents, à faible latence et structurés. Ils constituent une version améliorée des instructions if/else dans les chaînes de traitement métier.
- **System Two** : Tâches complexes nécessitant un raisonnement multi-étapes et une réflexion approfondie.

Dans la pratique, il est courant d'utiliser massivement System One dans les chaînes de traitement pour un routage rapide, et de n'escalader vers des modèles plus puissants que lorsque un raisonnement approfondi est réellement nécessaire, permettant ainsi de réduire les coûts et la latence.

## Prochaines étapes

- [Démarrage rapide en 5 minutes](/zh/quickstart/) — Obtenir votre clé API et effectuer votre première invocation
- [Concepts clés](/zh/concepts/system-one/) — Comprendre System One et les modèles d'état
- [Architectures](/zh/patterns/) — Voir comment organiser ces invocations en environnement de production
