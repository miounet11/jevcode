---
title: "SDK JavaScript / TypeScript"
description: "Installez @typesafe-ai/sdk pour appeler l'API System One via un client bénéficiant de l'inférence de types automatique."
section: sdk
order: 30
tags: ['javascript', 'typescript', 'sdk']
source: docs.typesafe.ai/sdk/javascript
translatedFrom: zh
---

## Installation

Node.js 20 ou une version ultérieure est requis :

```bash
npm install @typesafe-ai/sdk
```

Créez le client après avoir défini les variables d'environnement :

```bash
export TYPESAFE_API_KEY="sk-..."
```

## Utilisation de base

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "J'ai été facturé deux fois. Veuillez corriger cela dès que possible." },
  questions: {
    category: choice("De quoi traite ce ticket ?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

## Inférence de types

C'est la partie la plus précieuse du SDK TypeScript : **les types des réponses sont déduits automatiquement à partir des questions que vous fournissez**.

```ts
questions: {
  category: choice("De quoi traite ce ticket ?", {
    billing: null,
    technical: null,
    other: null,
  }),
}
```

Puisque les clés de `criteria` sont `billing` / `technical` / `other`, le type de `response.answers.category.choice` est l'union de ces trois types littéraux. L'écriture de `"bililng"` entraînera une erreur à la compilation plutôt qu'une valeur `undefined` renvoyée au moment de l'exécution.

De même, les questions construites avec `score(...)` auront des réponses incluant `score`, `legend`, `probabilities`, `confidence` ; celles construites avec `noul(...)` n'auront que `noul`.

Cela signifie que **vous n'avez pas besoin de définir manuellement les types des réponses**, ni de traiter les réponses de l'API comme `any`.

## Structure de la réponse

```ts
response.answers.category.choice;        // Option sélectionnée
response.answers.category.probabilities; // Probabilités de chaque option
response.answers.category.confidence;    // Niveau de confiance
```

Tous les types de questions sont indexés sous `response.answers` par le nom de la question, et les champs spécifiques dépendent du type de la question.

## Structure du package

Le SDK fournit simultanément des artefacts ESM, CommonJS et des fichiers de déclaration TypeScript, ce qui permet une utilisation directe dans divers environnements de build.

Pour connaître toutes les options et leurs valeurs par défaut, consultez le [client](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/client.ts) et les [types](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/types.ts) du SDK.

## Liens connexes

- [Démarrage rapide](/zh/quickstart/)
- [Primitives de questions](/zh/primitives/) — Façons de construire les trois types de questions
- [Fan-out parallèle](/zh/patterns/fan-out/) — Poser plusieurs questions en une seule fois
