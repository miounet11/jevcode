---
title: Primitives overview
description: The three typed question types — Choice, Score, Noul — what each returns, and how to choose between them.
section: primitives
order: 10
tags: ['primitives', 'choice', 'score', 'noul']
source: docs.typesafe.ai/primitives
---

## Primitives come in pairs

TypeSafe's primitives are small, typed building blocks you compose in code. They come in pairs:

- A **question** defines one judgement for a System One model to make about a **state**.
- Its **answer** is the typed value that comes back.

You compose the answers in your code to make decisions. There are three question types, each returning a different shape of answer.

| Type | Answers | Returns |
| :--- | :--- | :--- |
| [Choice](/en/primitives/choice/) | Which of these options? | `choice`, `probabilities`, `confidence` |
| [Score](/en/primitives/score/) | Which level? | `score`, `legend`, `probabilities`, `confidence` |
| [Noul](/en/primitives/noul/) | Is this true? | `noul` (0 to 1) |

You can ask one question or send several together. Every question is evaluated independently.

## Choosing a primitive

Choose by the **shape of the decision**, not by business domain:

- **The candidate set is finite and mutually exclusive** → Choice. Ticket categories, intents, actions.
- **There is an ordered scale or quality gradient** → Score. Relevance, severity, satisfaction.
- **Only a yes/no judgement is needed, and fuzziness is acceptable** → Noul. "Is this content violating policy?", "Is the user asking for a refund?"

A common mistake is using Score for something that should be a Choice. If the levels have no real ordering (say `billing` / `technical` / `sales`), use Choice — forcing a Score introduces a bogus ordinal semantics that makes downstream thresholds meaningless.

Conversely, when a genuine gradient exists, one Score beats assembling several Nouls: you get the whole distribution in a single call.

## Two properties that make answers composable

**Every answer is constrained to the options you supplied.** The model returns a probability distribution over your options or levels, never a value outside them. Your code never has to recover a value from generated prose — this is the essential difference between Jev and "ask an LLM for JSON, then parse it".

**Every answer is independent.** One question's answer is not hidden context for another. This guarantees:

- evaluation order does not affect the result;
- you can safely ask many questions at once — including ones that only matter on certain branches — without cross-contamination;
- each answer's semantics can be tested and validated in isolation.

The second property yields a very practical corollary: **speculative questions are nearly free.** A `bug_severity` question only matters if the ticket is a bug report; `refund_requested` only matters for billing. Sending them all up front costs nothing in speed — the model evaluates every question in parallel and you read the answers you need.

## Asking several questions at once

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

One call returns three independent answers. Your code branches on `intent` and then reads the fields it needs from results it already holds.

## Going further

- [Structured questions](/en/primitives/advanced/) — criteria shapes, wording technique, boundary handling
- [Fan-out](/en/patterns/fan-out/) — packing many questions into one request
- [Confidence](/en/concepts/confidence/) — using `confidence` and `probabilities` to control behaviour
