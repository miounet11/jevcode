---
title: "Vue d'ensemble des primitives de problème"
description: "Les trois types de questions typées : Choice, Score et Noul — ce que chacun retourne et comment choisir."
section: primitives
order: 10
tags: ['primitives', 'choice', 'score', 'noul']
source: docs.typesafe.ai/primitives
translatedFrom: zh
---

## Les primitives sont appariées

Les primitives TypeSafe sont des composants typés de petite taille que vous combinez dans votre code. Elles apparaissent par paires :

- **Question** : définit une décision que le modèle System One doit prendre sur l'**état**.
- **Réponse** : la valeur typée renvoyée par le modèle.

Vous combinez ces réponses dans votre code pour prendre des décisions. Il existe trois types de questions, chacun renvoyant des réponses de forme différente.

| Type | Ce qu'il évalue | Retourne |
| :--- | :--- | :--- |
| [Choice](/fr/primitives/choice/) | Quelle option choisir ? | `choice`, `probabilities`, `confidence` |
| [Score](/fr/primitives/score/) | Dans quelle catégorie se situe-t-il ? | `score`, `legend`, `probabilities`, `confidence` |
| [Noul](/fr/primitives/noul/) | Est-ce vrai ? | `noul` (de 0 à 1) |

Vous pouvez poser une seule question ou en envoyer plusieurs en une fois. Chaque question est évaluée indépendamment.

## Comment choisir une primitive

Le choix de la primitive dépend de la **forme de la décision**, et non du domaine métier :

- **L'ensemble des candidats est fini et mutuellement exclusif** → Choice. Par exemple, classification de tickets, identification d'intention, choix d'action.
- **Il existe un gradient ordonné de dimension ou de qualité** → Score. Par exemple, pertinence, gravité, satisfaction.
- **Vous avez besoin d'une simple vérification oui/non, avec une tolérance au flou** → Noul. Par exemple, « Ce contenu est-il non conforme ? », « L'utilisateur demande-t-il un remboursement ? ».

Une erreur courante consiste à utiliser Score pour des cas qui devraient utiliser Choice. S'il n'y a pas de véritable relation d'ordre entre les catégories (par exemple, « Facturation / Technique / Commercial »), utilisez Choice ; forcer l'utilisation de Score introduirait une sémantique ordinale fictive, rendant les seuils de décision ultérieurs sans objet.

À l'inverse, s'il existe effectivement un gradient continu, utiliser Score est plus pratique que d'assembler plusieurs Noul, car Score fournit directement la distribution complète.

## Deux propriétés clés des réponses

**Chaque réponse est contrainte par les options que vous avez fournies.** Le modèle renvoie une distribution de probabilités sur les options ou catégories que vous avez définies ; il ne produira jamais de valeurs en dehors de cet ensemble. Cela signifie qu'il n'est pas nécessaire de récupérer la valeur à partir d'un texte généré dans le code : c'est la différence fondamentale entre Jev et l'approche consistant à « demander à un LLM de produire du JSON puis de l'analyser ».

**Chaque réponse est indépendante.** La réponse à une question ne constitue pas un contexte implicite pour une autre question. Cette contrainte garantit :

- que l'ordre d'évaluation des questions n'affecte pas les résultats ;
- qu'il est sûr de poser de nombreuses questions en une seule fois (y compris celles qui ne sont pertinentes que dans certaines branches), sans craindre de contamination croisée ;
- que la sémantique de chaque réponse peut être testée et validée individuellement.

La deuxième propriété a une conséquence très pratique : **les questions spéculatives sont presque gratuites**. Par exemple, dans un scénario de gestion de tickets, `bug_severity` n'a de sens que si le ticket est un rapport de bug, et `refund_requested` n'a de sens que pour les questions liées à la facturation. Mais en les incluant toutes en amont dans une seule requête, vous ne subissez aucune perte de performance : le modèle évalue toutes les questions en parallèle, et vous ne lisez la réponse correspondante que lorsque cela est nécessaire.

## Poser plusieurs questions en une fois

```json
{
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
  "frustration": {
    "type": "score",
    "instructions": "How frustrated the user appears",
    "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
  },
  "refund_requested": {
    "type": "noul",
    "instructions": "The user is explicitly asking for a refund or credit"
  }
}
```

Un seul appel renvoie trois réponses indépendantes. Le code effectue un routage en fonction de `intent`, puis lit les champs nécessaires à partir des résultats déjà obtenus.

## Aller plus loin

- [Utilisations avancées des primitives](/fr/primitives/advanced/) — comment rédiger les critères, astuces de formulation, gestion des cas limites
- [Motif Fan-out](/fr/patterns/fan-out/) — comment regrouper un grand nombre de questions dans une seule requête
- [Confiance](/fr/concepts/confidence/) — comment utiliser `confidence` et `probabilities` pour contrôler le comportement
