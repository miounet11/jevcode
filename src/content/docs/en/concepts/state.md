---
title: State
description: State is what you ask the model to evaluate. Its three shapes, how to organise context, and the language-support caveat.
section: concepts
order: 20
tags: ['state', 'context']
source: docs.typesafe.ai/concepts/state
---

## What state is

**State** is the content you ask a System One model to evaluate. It might be a support message, a passage of text, or the current state of your application. You pass it in the `state` field of an API request, alongside the questions you want answered.

Each request evaluates **one state** against **one or more questions**. All questions see the same state and are evaluated **independently**. You can mix [Choice](/en/primitives/choice/), [Score](/en/primitives/score/), and [Noul](/en/primitives/noul/) questions in one request.

## Three shapes

### String

The simplest state is a plain string:

```python
state = "My card was charged twice."
```

Use it when the use case is simple and needs only one piece of text.

### Object

When a decision requires comparing several parts, put the related information together in an object, with a descriptive name for each part:

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

This is **one** state, even though it contains a conversation, an order, and a policy. The guidance is to use an object for most requests, so each part has a descriptive name and its relationships stay clear.

### Array

For a sequence of messages or records:

```python
state = ["Hi", "My customer number is TS1337.", "My card was charged twice."]
```

| Format | Useful for | Example |
| :--- | :--- | :--- |
| String | A message, article, or passage | `"My card was charged twice."` |
| Object | Named fields, related records, application state | see the JSON above |
| Array | A sequence of messages or records | see the array above |

## Separate content from questions

This is one of the most important mental models when using Jev:

- **State holds the content and supporting facts.** The refund request, the order records, the refund policy.
- **Questions define the judgements to make.** "Was a refund requested?", "Does the policy support a refund?"

Do not put judgement logic into the state. State is the material you would present to a panel of experts before asking them to make a judgement.

## Language support

Jev accepts **text only**. State must be a string, JSON object, or array of text values.

- Images, audio, and video are **not supported**.
- Non-text input must be pre-processed into text or structured fields before being sent as state.
- **Jev's primary training language is English.** Other languages, including CJK scripts, are accepted but currently have lower accuracy.

The last point matters if your content is not English: validate accuracy against your own data before putting Jev on a critical path. For high-stakes decisions, consider supplementing the state with an English summary, or escalating to a human when confidence is low.

## Budgets and limits

- 64k tokens per request: covers `state` plus **all** questions.
- 32k tokens: covers `state` plus the **single longest** question.
- The model reads the state once, then evaluates every question in parallel, so packing many questions into one request costs almost nothing in latency — see [Speculative fan-out](/en/patterns/fan-out/).
- Accuracy shifts as the state grows; the official `Jev 1.13 jaggedness` section covers this.

## Related

- [Primitives](/en/primitives/) — structuring questions with instructions and criteria
- [Confidence](/en/concepts/confidence/) — using the return value to control behaviour
- [API reference](https://docs.typesafe.ai/api) — the request schema
