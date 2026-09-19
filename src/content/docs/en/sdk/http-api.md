---
title: HTTP API reference
description: Call the TypeSafe evaluation endpoint directly — request shape, the noul / choice / score question types, response shapes, and error handling.
section: sdk
order: 50
tags: ['api', 'http', 'reference']
source: docs.typesafe.ai/api
---

## Endpoint

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Send a `state` with a map of typed `questions`, and get back one `answer` per question.

## Request body

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

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `state` | string \| object \| array | Yes | The content to evaluate. A plain string for text, or structured data for chat logs, records, or your application's current state |
| `model` | string | Yes | The model that handles the request. Use `jev-latest`, TypeSafe's flagship model; see the official Models page for other models and aliases |
| `questions` | map&lt;string, Question&gt; | Yes | A map of typed questions |

You choose the keys in `questions`, and each answer comes back under the **same key**. That key is not sent to the underlying model and is not used in inference, so you can name it after your business domain (`department`, `is_urgent`).

## The three question types

A `Question` is discriminated by its `type` field; there are three. All three share `type` and `instructions`, and each adds its own `criteria`.

`instructions` has type `string | object | array`.

### noul — a yes/no decision

A yes/no question. **Returns the probability that the answer is yes.**

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

`criteria` is optional and describes what "yes" and "no" mean:

| Key | Description |
| :--- | :--- |
| `true` | What a value approaching 1 ("yes") means |
| `false` | What a value approaching 0 ("no") means |

### choice — pick from options

Choose one option from a set you define, returning the chosen option **plus the full probability distribution**.

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

`criteria` is required, typed `map<string, string | null>`: option names mapped to a rubric description. Use `null` as the value when an option needs no extra explanation.

### score — rate along a scale

Rate the `state` along a rubric you define, returning a **probability-weighted value across your levels**.

```json
{
  "frustration": {
    "type": "score",
    "instructions": "How frustrated is the customer?",
    "criteria": ["Calm", "Frustrated", "Very angry"]
  }
}
```

`criteria` is required and is an **ordered array** of level descriptions. You must include at least two levels.

## Response body

Each question produces one answer, keyed by the id you supplied.

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

| Field | Type | Description |
| :--- | :--- | :--- |
| `model` | string | The model that performed the evaluation |
| `answers` | map&lt;string, Answer&gt; | One answer per question, keyed identically to `questions` |
| `usage` | object | Token usage for the request: `input_tokens`, `output_tokens` |

### Answer shapes by type

Every answer carries a `type` matching its question. `choice` and `score` answers also carry `confidence` (between 0 and 1), derived from that answer's probability distribution (see the official Confidence page).

**noul answer**

| Field | Type | Description |
| :--- | :--- | :--- |
| `noul` | number | The yes/no answer, from 0 (no) to 1 (yes) |

```json
{ "type": "noul", "noul": 0.92 }
```

**choice answer**

| Field | Type | Description |
| :--- | :--- | :--- |
| `choice` | string | The highest-probability option |
| `probabilities` | map&lt;string, number&gt; | Probability per option; sums to 1 |
| `confidence` | number | How certain the model is, derived from the probabilities |

```json
{
  "type": "choice",
  "choice": "technical",
  "probabilities": { "billing": 0.08, "technical": 0.85, "sales": 0.07 },
  "confidence": 0.82
}
```

**score answer**

| Field | Type | Description |
| :--- | :--- | :--- |
| `score` | number | The probability-weighted value, which **can land between levels** |
| `legend` | map&lt;string, string&gt; | Maps each level index back to its description |
| `probabilities` | map&lt;string, number&gt; | Probability per level (string keys); sums to 1 |
| `confidence` | number | How certain the model is, derived from the probabilities |

```json
{
  "type": "score",
  "score": 1.6,
  "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
  "probabilities": { "0": 0.05, "1": 0.3, "2": 0.65 },
  "confidence": 0.78
}
```

Note how `score` relates to `probabilities`: the three level probabilities are 0.05 / 0.3 / 0.65, weighting to a `score` of 1.6. So `score` need not be a whole number — which is exactly what separates it from `choice`: `choice` gives you one discrete option, while `score` can express "somewhere between two levels."

## Errors

Errors use standard HTTP status codes, with a JSON body describing what went wrong.

| Status | Meaning |
| :--- | :--- |
| `401 Unauthorized` | The API key is missing or invalid. Check the `Authorization` header |
| `422 Unprocessable Entity` | The request body failed validation, e.g. a missing required field or a malformed question. The body points at the offending field |
| `429 Too Many Requests` | You exceeded your rate limit. Retry after a short delay |
| `529 Overloaded` | TypeSafe is temporarily overloaded. Retry after a short delay |

### Handling rate limits

On `429` or `529`, **retry with exponential backoff** rather than retrying immediately. If you use an official SDK, its default retry policy handles this automatically, so no extra code is needed.
