---
title: "État"
description: "L'état correspond aux éléments que vous souhaitez que le modèle évalue. Découvrez ses trois formes, la manière d'organiser le contexte et les limitations liées au support linguistique."
section: concepts
order: 20
tags: ['state', 'context']
source: docs.typesafe.ai/concepts/state
translatedFrom: zh
---

## Qu'est-ce que le State

Le **State** (État) est ce que vous demandez au modèle System One d'évaluer. Il peut s'agir d'un message de service client, d'un extrait de texte ou de l'état actuel de votre application. Vous l'insérez dans le champ `state` de la requête API, conjointement avec la question que vous souhaitez poser.

Chaque requête évalue **un seul state** pour **une ou plusieurs questions**. Toutes les questions voient le même state et sont évaluées de manière **indépendante**. Vous pouvez mélanger les questions de type [Choice](/fr/primitives/choice/), [Score](/fr/primitives/score/) et [Noul](/fr/primitives/noul/) dans une seule requête.

## Trois formes

### Chaîne de caractères (String)

La forme la plus simple de state est une chaîne de caractères ordinaire :

```python
state = "My card was charged twice."
```

Convient aux scénarios simples où une seule section de texte est nécessaire.

### Objet

Lorsque la décision nécessite de comparer plusieurs parties, utilisez un objet pour regrouper les informations pertinentes, chaque partie portant un nom descriptif :

```json
{
  "ticket": {
    "subject": "Duplicate charge",
    "messages": [
      {"from": "customer", "text": "I was charged twice for order A-104. Please refund the duplicate."},
      {"from": "support", "text": "We are checking the charges."}
    ]
  },
  "order": {
    "id": "A-104",
    "charges": [
      {"amount_usd": 49, "status": "captured"},
      {"amount_usd": 49, "status": "captured"}
    ]
  },
  "refund_policy": "Duplicate charges are eligible for a refund."
}
```

Notez qu'il s'agit d'**un seul** state, bien qu'il contienne à la fois une conversation, une commande et une politique. La spécification recommande : **la plupart des requêtes utilisent des objets**, afin que chaque partie ait un nom descriptif et que les relations mutuelles restent claires.

### Tableau (Array)

Convient aux séquences de messages ou de dossiers :

```python
state = ["Hi", "My customer number is TS1337.", "My card was charged twice."]
```

| Format | Usage | Exemple |
| :--- | :--- | :--- |
| String | Un message, un article, un extrait de texte | `"My card was charged twice."` |
| Object | Champs nommés, dossiers connexes, état de l'application | Voir le JSON ci-dessus |
| Array | Séquence de messages ou de dossiers | Voir le tableau ci-dessus |

## Séparer le contenu des questions

C'est l'un des modèles mentaux les plus importants lors de l'utilisation de Jev :

- **Le State contient le contenu et les faits de soutien.** Les demandes de remboursement, les dossiers de commande et les politiques de remboursement doivent être placés dans le state.
- **Les questions définissent les jugements à porter.** « L'utilisateur demande-t-il un remboursement ? » et « La politique soutient-elle le remboursement ? » sont des questions.

N'écrivez pas la logique de jugement dans le state. Le state doit être ce que vous présentez lorsque vous exposez des matériaux à des experts — comme exposer des éléments à un groupe d'experts, puis leur demander de porter chacun leur propre jugement.

## Support linguistique

Jev accepte le **texte brut**. Le state doit être une chaîne de caractères, un objet JSON ou un tableau de texte.

- **Non pris en charge** : images, audio, vidéo.
- Les entrées non textuelles doivent être prétraitées en texte ou en champs structurés avant d'être transmises en tant que state.
- **La langue principale d'entraînement de Jev est l'anglais.** Les autres langues (y compris les caract chinois, japonais et coréens) sont acceptées, mais la précision est actuellement plus faible.

Ce dernier point est particulièrement important pour les utilisateurs chinois : si votre activité implique du contenu en chinois, il est recommandé de vérifier la précision avec des données réelles avant de décider si les chemins critiques doivent être déployés. Pour les décisions à haut risque, envisagez d'ajouter un résumé en anglais dans le state ou de transférer vers un opérateur humain en cas de faible niveau de confiance.

## Budget et limites

- Contexte par requête de 64k tokens : couvre le `state` ainsi que **toutes** les questions.
- 32k tokens : couvre le `state` ainsi que **la question la plus longue**.
- Le modèle lit le state une seule fois, puis évalue toutes les questions en parallèle. Par conséquent, regrouper plusieurs questions dans une seule requête n'entraîne pratiquement aucun coût supplémentaire en termes de latence — voir le [pattern Fan-out](/fr/patterns/fan-out/).
- La précision varie à mesure que le state grandit ; une discussion spécifique est menée dans la section `Jev 1.13 jaggedness`.

## Liens connexes

- [Primitives de question](/fr/primitives/) — Comment organiser les questions avec des instructions et des critères
- [Confiance](/fr/concepts/confidence/) — Contrôler le comportement à l'aide des valeurs de retour
- [Référence API](https://docs.typesafe.ai/api) — Schéma de requête
