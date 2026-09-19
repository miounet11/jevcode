---
title: "Modèle d'architecture"
description: "Architectural patterns for building systems with TypeSafe. Learning to think in terms of \"discrete atomic decisions\" is key to unlocking its full potential."
section: patterns
order: 10
tags: ['patterns', 'architecture']
source: docs.typesafe.ai/patterns
translatedFrom: zh
---

## Concept fondamental

TypeSafe est conçu pour être **intégré à un système plus large** afin de prendre des décisions. La compétence clé réside dans la capacité à **penser en termes de décisions discrètes et atomiques**, puis à combiner ces décisions pour obtenir des comportements système complexes.

Cela signifie qu'il ne faut pas essayer de résoudre un problème métier complexe en une seule invocation, mais plutôt le décomposer en plusieurs jugements indépendants, puis les combiner via votre propre code. La logique de composition dans le code est déterministe, testable et ajustable : c'est là que réside la fiabilité.

Avant de lire cette section, veuillez vous assurer de comprendre les [Primitives de requête](/fr/primitives/) et la [Confiance](/fr/concepts/confidence/).

## Quatre modèles

| Modèle | Description | Avantages |
| :--- | :--- | :--- |
| [Fan-out parallèle](/fr/patterns/fan-out/) | Envoi d'un grand nombre de questions (y compris hypothétiques) en une seule invocation ; le code détermine lesquelles sont pertinentes | Coût, vitesse |
| [Routage par confiance](/fr/patterns/confidence-routing/) | Utilisation de la confiance comme deuxième axe de décision pour construire des systèmes plus sûrs | Fiabilité, sécurité |
| [Score composite](/fr/patterns/composite-scoring/) | Fusion de plusieurs dimensions d'analyse en un score unique | Coût, fiabilité, vitesse |
| [Routage par intention](/fr/patterns/intent-routing/) | Classification de l'intention de l'utilisateur et routage vers le processeur approprié | Coût, vitesse |

## Comment ils interagissent

Ces quatre modèles ne sont pas des options mutuellement exclusives, mais des composants qui peuvent être superposés. Un système de production typique utilise plusieurs de ces modèles simultanément :

```text
Requête utilisateur
   │
   ├─ [Routage par intention] Déterminer d'abord le type de requête ──┐
   │                                                                  │
   ├─ [Fan-out parallèle] Poser toutes les jugements nécessaires en une fois ┤
   │                                                                  │
   ├─ [Score composite] Noter et classer les résultats candidats selon plusieurs dimensions ┤
   │                                                                  │
   └─ [Routage par confiance] Exécution automatique pour haute confiance / Transfert vers un humain pour faible confiance ┘
```

Le **routage par intention** se situe généralement en premier, car il détermine quelles chaînes de traitement sont nécessaires par la suite. Le **fan-out parallèle** est présent tout au long du processus, car regrouper les questions en une seule invocation n'entraîne pratiquement aucun coût de latence supplémentaire. Le **score composite** est utilisé lorsqu'un classement est nécessaire. Le **routage par confiance** constitue la dernière barrière, déterminant si le résultat doit être exécuté automatiquement ou escaladé à un opérateur humain.

## Principes de conception

**Décomposition atomique.** Posez une seule question par interrogation. Les questions composées qui semblent « plus pratiques à poser en une fois » vous empêchent d'identifier la partie spécifique où le modèle a fait erreur et vous empêchent d'ajuster les paramètres individuellement.

**Le code gère la composition, le modèle gère le jugement.** Les pondérations, les seuils et la logique de branchement doivent être placés dans votre code. Ce sont des éléments que vous devez être capable de lire, de tester et d'ajuster.

**Rendre l'incertitude visible.** Au lieu de forcer le modèle à fournir une réponse, utilisez la confiance pour exposer l'« incertitude » au niveau du système, permettant à votre code de décider comment la gérer.

## Liens connexes

- [Primitives de requête](/fr/primitives/) — Connaissances préalables
- [Confiance](/fr/concepts/confidence/) — Connaissances préalables
- [Cas d'utilisation dans l'écosystème](/fr/cases/use-case-map/) — Comment ces modèles sont appliqués dans des projets réels
