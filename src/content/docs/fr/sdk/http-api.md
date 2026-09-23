---
title: "Référence de l'API HTTP"
description: "Appelez directement l’endpoint d’évaluation TypeSafe — forme de la requête, les types de questions noul / choice / score, formes de réponse, et gestion des erreurs."
section: sdk
order: 50
tags: ['api', 'http', 'reference']
source: docs.typesafe.ai/api
translatedFrom: en
---
## Point de terminaison

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Envoyez un `state` avec une carte de `questions` tapés, et recevez un `answer` par question.

Corps de la demande

```json
{
  "state": "Help! My payouts have been failing for 3 days.",
  "model": "jev-latest",
  "questions": {
    "is_urgent": {
      "type": "noul",
      "instructions": "Does this convey urgency?"
    }
  }
}
```

| Champ | Type | Requis | Description |
| :--- | :--- | :--- | :--- |
| `state` | string \| object \| array | Oui | Le contenu à évaluer. Une chaîne de caractères simple pour le texte, ou des données structurées pour les journaux de conversation, les enregistrements ou l'état actuel de votre application |
| `model` | string | Oui | Le modèle qui traite la demande. Utilisez `jev-latest`, le modèle phare de TypeSafe ; consultez la page officielle des modèles pour les autres modèles et alias |
| `questions` | map&lt;string, Question&gt; | Oui | Une carte de questions typées |

Vous choisissez les clés dans `questions`, et chaque réponse revient sous la **même clé**. Cette clé n'est pas envoyée au modèle sous-jacent et n'est pas utilisée lors de l'inférence, vous pouvez donc la nommer en fonction de votre domaine métier (`department`, `is_urgent`).

## Les trois types de questions

Un `Question` est discriminé par son champ `type` ; il y en a trois. Les trois partagent `type` et `instructions`, et chacun ajoute son propre `criteria`.

`instructions` a le type `string | object | array`.

### noul — une décision oui/non

Une question par oui ou par non. **Renvoie la probabilité que la réponse soit oui.**

```json
{
  "is_urgent": {
    "type": "noul",
    "instructions": "Does this convey urgency?",
    "criteria": {
      "true": "Explicitly time-sensitive",
      "false": "No urgency expressed"
    }
  }
}
```

`criteria` est optionnel et décrit ce que signifient « oui » et « non » :

| Clé | Description |
| :--- | :--- |
| `true` | Ce que signifie une valeur approchant 1 (« oui ») |
| `false` | Ce que signifie une valeur approchant 0 (« non ») |

### choice — choisir parmi les options

Choisissez une option parmi un ensemble que vous définissez, en renvoyant l'option choisie **ainsi que la distribution de probabilité complète**.

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this?",
    "criteria": {
      "billing": "Payments, invoicing, refunds",
      "technical": "Bugs, outages, integrations",
      "sales": "Pricing, upgrades, new accounts"
    }
  }
}
```

`criteria` est requis, de type `map<string, string | null>` : noms d'options mappés à une description de grille. Utilisez `null` comme valeur lorsqu'une option ne nécessite pas d'explication supplémentaire.

### score — évaluer selon une échelle

Évaluez `state` selon une grille que vous définissez, en renvoyant une **valeur pondérée par probabilité sur vos niveaux**.

```json
{
  "frustration": {
    "type": "score",
    "instructions": "How frustrated is the customer?",
    "criteria": ["Calm", "Frustrated", "Very angry"]
  }
}
```

`criteria` est obligatoire et constitue un **tableau ordonné** de descriptions de niveaux. Vous devez inclure au moins deux niveaux.

Corps de la réponse

Chaque question produit une réponse, indexée par l’id que vous avez fourni.

```json
{
  "model": "jev-latest",
  "answers": {
    "is_urgent": {
      "type": "noul",
      "noul": 0.92
    }
  },
  "usage": { "input_tokens": 312, "output_tokens": 48 }
}
```

| Champ | Type | Description |
| :--- | :--- | :--- |
| `model` | string | Le modèle qui a effectué l'évaluation |
| `answers` | map&lt;string, Answer&gt; | Une réponse par question, indexée de manière identique à `questions` |
| `usage` | object | Utilisation des jetons pour la requête : `input_tokens`, `output_tokens` |

### Formes de réponse par type

Chaque réponse porte un `type` correspondant à sa question. Les réponses `choice` et `score` portent également `confidence` (entre 0 et 1), dérivées de la distribution de probabilité de cette réponse (voir la page officielle Confidence).

**réponse noul**

| Champ | Type | Description |
| :--- | :--- | :--- |
| `noul` | number | La réponse oui/non, de 0 (non) à 1 (oui) |

```json
{ "type": "noul", "noul": 0.92 }
```

**réponse de choix**

| Champ | Type | Description |
| :--- | :--- | :--- |
| `choice` | string | L'option la plus probable |
| `probabilities` | map&lt;string, number&gt; | Probabilité par option ; la somme est égale à 1 |
| `confidence` | number | Degré de certitude du modèle, dérivé des probabilités |

```json
{
  "type": "choice",
  "choice": "technical",
  "probabilities": { "billing": 0.08, "technical": 0.85, "sales": 0.07 },
  "confidence": 0.82
}
```

**réponse du score**

| Champ | Type | Description |
| :--- | :--- | :--- |
| `score` | number | La valeur pondérée par la probabilité, qui **peut se situer entre les niveaux** |
| `legend` | map&lt;string, string&gt; | Associe chaque index de niveau à sa description |
| `probabilities` | map&lt;string, number&gt; | Probabilité par niveau (clés de type chaîne) ; la somme est égale à 1 |
| `confidence` | number | Le degré de certitude du modèle, dérivé des probabilités |

```json
{
  "type": "score",
  "score": 1.6,
  "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
  "probabilities": { "0": 0.05, "1": 0.3, "2": 0.65 },
  "confidence": 0.78
}
```

Notez comment `score` se rapporte à `probabilities` : les probabilités à trois niveaux sont de 0,05 / 0,3 / 0,65, ce qui donne une pondération vers un `score` de 1,6. Ainsi, `score` n’a pas besoin d’être un nombre entier — ce qui est précisément ce qui le distingue de `choice` : `choice` vous propose une option discrète, tandis que `score` peut exprimer « quelque part entre deux niveaux. »

## Erreurs

Les erreurs utilisent les codes de statut HTTP standard, avec un corps JSON décrivant ce qui s'est mal passé.

| Statut | Signification |
| :--- | :--- |
| `401 Unauthorized` | La clé API est manquante ou invalide. Vérifiez l'en-tête `Authorization` |
| `422 Unprocessable Entity` | Le corps de la requête a échoué à la validation, par exemple un champ requis manquant ou une question mal formée. Le corps indique le champ fautif |
| `429 Too Many Requests` | Vous avez dépassé votre limite de taux. Réessayez après un court délai |
| `529 Overloaded` | TypeSafe est temporairement surchargé. Réessayez après un court délai |

### Gestion des limites de taux

Sur `429` ou `529`, **réessayer avec une backoff exponentielle** plutôt que de réessayer immédiatement. Si vous utilisez un SDK officiel, sa politique de retry par défaut gère cela automatiquement, donc aucun code supplémentaire n'est nécessaire.