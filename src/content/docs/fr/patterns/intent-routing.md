---
title: "Routage d'intention"
description: "Les requêtes classées sont routées vers le processeur le plus adapté : logique déterministe, LLM dédié ou humain."
section: patterns
order: 20
tags: ['routing', 'classification', 'cost']
source: docs.typesafe.ai/patterns/intent-routing
translatedFrom: zh
---

## Ce problème que ce模式 résout

Toutes les requêtes des utilisateurs n'ont pas besoin du même processeur. Certaines peuvent être répondues par une simple requête de base de données ; d'autres nécessitent un LLM (Large Language Model) avec un contexte métier ; et d'autres encore doivent être traitées par un humain.

TypeSafe peut être placé **devant** tous ces processeurs, agissant comme une couche de classificateur rapide et peu coûteuse pour décider lequel appeler.

**Motivation principale liée aux coûts** : Au lieu d'envoyer chaque message dans un LLM coûteux pour déterminer le type de requête, il vaut mieux classifier d'abord, puis router selon le type.

## Exemple : Routage du service client

Imaginez un système de service client où les messages entrants doivent être acheminés vers le bon processeur.

### Étape 1 : Classifier l'intention et la complexité

Une seule requête permet de déterminer simultanément l'intention, la complexité et plusieurs autres critères d'aide à la décision :

```json
{
  "questions": {
    "intent": {
      "type": "choice",
      "instructions": "The primary intent of this customer message",
      "criteria": {
        "order_status": "Asking about an existing order",
        "product_question": "Asking about a product before buying",
        "return_exchange": "Wants to return or exchange something",
        "complaint": "Unhappy about an experience"
      }
    },
    "bug_severity": {
      "type": "score",
      "instructions": "How severe is the reported issue",
      "criteria": [
        "Cosmetic; no impact to functionality",
        "Broken or degraded feature; workaround exists",
        "Blocking issue; no workaround exists"
      ]
    },
    "has_reproducible_steps": {
      "type": "noul",
      "instructions": "The user describes specific steps to reproduce the issue"
    },
    "refund_requested": {
      "type": "noul",
      "instructions": "The user is explicitly asking for a refund or credit"
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated the user appears",
      "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
    }
  }
}
```

### Étape 2 : Router selon les résultats de la classification

```python
intent = response.answers["intent"]

if intent.choice == "order_status":
    # Une logique déterministe suffit : interroger la base de données
    lookup_order_status(state["order_id"])

elif intent.choice == "product_question":
    # Nécessite un contexte métier : confier au LLM avec base de connaissances
    answer_with_catalog_llm(state)

elif intent.choice == "return_exchange":
    start_return_flow(state["order_id"])

elif intent.choice == "complaint":
    # Risque élevé : transférer à un agent humain
    route_to_human_agent(state)
```

## Pourquoi la classification préalable permet d'économiser

La clé réside dans le fait de **réserver les traitements coûteux aux requêtes qui en ont réellement besoin**.

Supposons que 70 % des messages du service client soient de type `order_status`, qui peuvent être résolus par une simple requête de base de données. Si tous les messages sont envoyés au modèle de langage (LLM) en premier, vous payez le coût élevé du LLM pour ces 70 %, alors qu'ils n'en avaient pas besoin. Effectuer une classification Choice peu coûteuse en premier permet de dévier ce trafic.

C'est ici qu'intervient le [pattern Fan-out](/fr/patterns/fan-out/) : on pose toutes les questions nécessaires (classification, sévérité, demande de remboursement, émotion, etc.) en une seule fois, car poser plusieurs questions n'impacte pas la vitesse.

## Points de conception

**La sortie de la classification doit être directement exploitable.** La valeur de `intent.choice` doit pouvoir servir directement de clé dans la table de routage, sans nécessiter de traitement supplémentaire des chaînes de caractères.

**La granularité de la classification détermine la complexité du système.** Trop de catégories rendent le routage indistinct ; trop peu réduit le nombre d'échantillons par catégorie, ce qui diminue la précision. Commencez par 4 à 6 catégories.

**Envoyez les jugements spéculatifs en parallèle.** Dans l'exemple ci-dessus, `bug_severity` et `has_reproducible_steps` ne sont pertinents que pour certaines intentions, et `refund_requested` ne l'est que dans le contexte des remboursements. Les envoyer tous en amont a un coût quasi nul. C'est là toute la valeur du [Fan-out parallèle](/fr/patterns/fan-out/).

**Utilisez la confiance pour un contrôle secondaire.** Si `intent.confidence` est faible, cela signifie que la classification elle-même est peu fiable. Dans ce cas, il ne faut pas router aveuglément, mais plutôt transférer à un humain ou demander des clarifications. Voir [Routage basé sur la confiance](/fr/patterns/confidence-routing/).

**Conservez une catégorie de repli.** Ajoutez une option telle que `other` à la classification pour que les requêtes ne correspondant à aucun type de processeur aient une destination, au lieu d'être forcées dans la catégorie la plus proche.

## Liés

- [Choice](/fr/primitives/choice/) — La primitive de base de ce pattern
- [Fan-out parallèle](/fr/patterns/fan-out/) — Poser toutes les questions d'aide en une seule fois
- [Routage basé sur la confiance](/fr/patterns/confidence-routing/) — Que faire lorsque la classification est peu fiable
- [Composite Scoring](/fr/patterns/composite-scoring/) — Pattern complémentaire pour les besoins de classement
