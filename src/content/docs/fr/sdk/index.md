---
title: "SDK et intégration"
description: "Le choix entre le SDK client officiel et l'API HTTP, ainsi que les compétences pour les agents de codage IA."
section: sdk
order: 10
tags: ['sdk', 'api']
source: docs.typesafe.ai/sdk
translatedFrom: zh
---

## Trois méthodes d'intégration

| Méthode | Utilisation | Caractéristiques |
| :--- | :--- | :--- |
| [Python SDK](/fr/sdk/python/) | Services backend, pipelines de données, traitement par lots | Clients synchrones/asynchrones, entrées typées, retry automatique |
| [JavaScript SDK](/fr/sdk/javascript/) | Services Node.js, applications full-stack | Inférence de types TypeScript, le type de la réponse est déduit automatiquement à partir de la question |
| HTTP API | Autres langages, intégration légère | POST direct, gestion manuelle du retry et de la limitation de débit |

Si votre équipe utilise des agents de codage IA pour écrire le code d'intégration, il est recommandé d'installer au préalable [l'agent skill TypeSafe](/fr/sdk/agent-skill/). Cela permet à l'agent de connaître la forme exacte des requêtes et des réponses, évitant ainsi qu'il n'écrive du code par pure conjecture.

## Conventions communes

Tous les SDK partagent le même ensemble de conventions :

- **Endpoint** : `POST https://api.typesafe.ai/v1/systemone`
- **Authentification** : La clé est lue depuis la variable d'environnement `TYPESAFE_API_KEY`, aucun paramètre n'est nécessaire dans le code.
- **Modèle par défaut** : `jev-latest` (résout vers la dernière version stable)
- **Retry** : Le retry est effectué par défaut selon une stratégie d'atténuation exponentielle, et respecte l'en-tête `retry-after` présent dans la réponse.

## Exigences de version

- Python SDK : nom du package `typesafe-sdk`
- JS SDK : nom du package `@typesafe-ai/sdk`, nécessite Node.js 20 ou une version supérieure

Le JS SDK fournit trois types de livrables : ESM, CommonJS et fichiers de déclaration TypeScript.

## Appel direct de l'API HTTP

Si vous n'utilisez pas de SDK, vous devez gérer vous-même deux aspects que le SDK intègre nativement :

**Retry de la limitation de débit (Rate Limiting).** Une limite de 250 000 tokens/seconde ou 1 200 requêtes/minute entraîne une réponse `429 Too Many Requests`. La réponse peut inclure l'en-tête `retry-after`, auquel vous devez vous conformer pour appliquer une stratégie d'atténuation.

**Analyse de la réponse.** La structure de retour est un objet de réponses indexé par le nom de la question, chaque type de question ayant sa propre forme de champs. Voir la [référence de l'API](https://docs.typesafe.ai/api) pour plus de détails.

## Liens connexes

- [Python SDK](/fr/sdk/python/)
- [JavaScript SDK](/fr/sdk/javascript/)
- [Agent skill](/fr/sdk/agent-skill/)
- [Démarrage rapide en 5 minutes](/fr/quickstart/) — Exemples complets et fonctionnels
