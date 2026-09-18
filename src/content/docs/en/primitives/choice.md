---
title: Choice
description: A Choice selects one option from a defined set. The answer includes the selected option, a probability for each option, and confidence.
section: primitives
order: 20
tags: ['choice', 'classification', 'routing']
source: docs.typesafe.ai/primitives/choice
---

## When to use it

Use a Choice when the answer is **one of a fixed set of mutually exclusive options**. For example:

- which team handles a ticket
- which category a product belongs to
- which language a code snippet is written in

If the answer is a position on a spectrum, use [Score](/en/primitives/score/). If it's yes or no, use [Noul](/en/primitives/noul/).

Example questions:

```text
"What programming language is this code written in"
  → options: python, javascript, typescript, go, rust, other

"What type of meeting is this based on the title and description"
  → options: standup, planning, retrospective, one on one, brainstorm, none of the above
```

## Parameters

| Field | Required | Description |
| :--- | :--- | :--- |
| `type` | Yes | Must be `"choice"` |
| `instructions` | Yes | The question itself, stating the judgement to make |
| `criteria` | Yes | Option definitions. An object `{ option: description }`, where a description may be `null` |

`instructions` and each entry in `criteria` can be a **string, an object, or an array**. Start with a string; switch to an object when an option needs several kinds of guidance (what it covers, what it does not, and some examples).

## Request example

Classifying a support ticket by department:

```python
from typesafe_sdk import Choice, TypeSafeClient

client = TypeSafeClient()

ticket = "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing."

response = client.system_one(
    state=ticket,
    questions={
        "department": Choice(
            instructions="Which team should handle this ticket?",
            criteria={
                "returns": "Refunds, wrong or damaged items",
                "shipping": "Delivery status, delays, lost packages",
                "billing": "Charges, invoices, payment problems",
            },
        ),
    },
)

print(response.answers["department"].choice)
```

## Response

```json
{
  "model": "jev-latest",
  "answers": {
    "department": {
      "type": "choice",
      "choice": "billing",
      "probabilities": {
        "returns": 0.02,
        "shipping": 0.05,
        "billing": 0.93
      },
      "confidence": 0.91
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

| Field | Meaning |
| :--- | :--- |
| `choice` | The selected option |
| `probabilities` | Distribution across every option |
| `confidence` | Summary of how peaked that distribution is, 0 to 1 |

`probabilities` is the raw material for computing a measure that suits you better — see [Confidence](/en/concepts/confidence/).

## Practice notes

**Always provide an escape hatch.** Add an `other` or `none of the above` option so the model has somewhere to go when nothing fits, rather than being forced into the least-bad choice. This measurably reduces misclassification in edge cases.

**Write boundaries into the descriptions.** An option description earns its place by drawing both what it covers and what it does not. In the example, `billing` says "Charges, invoices, payment problems" rather than a vague "money stuff".

**When option names are self-evident, pass `null` descriptions.** Tone triage as `{ "calm": null, "frustrated": null, "angry": null }` is clearer than adding redundant descriptions that may introduce noise.

**Speculative questions cost nothing.** In a larger support system, `return_reason` only matters when `department` is `returns`, and `shipping_issue` only when it is `shipping`. Sending them all up front does not slow the call down — the model evaluates every question in parallel. These are **speculative questions**.

**Chain Choices for deep taxonomies.** To classify documents through a deep hierarchy or a large taxonomy, chain Choice questions level by level. The official Hierarchical Classification cookbook shows how to run a beam search over Choice probabilities, keeping the best `K` candidate paths at each level instead of committing to a single greedy path.

## Related

- [Score](/en/primitives/score/) — rating along an ordered scale
- [Noul](/en/primitives/noul/) — yes/no probability
- [Intent routing](/en/patterns/intent-routing/) — the most common production use of Choice
- [Confidence](/en/concepts/confidence/) — acting on `probabilities` and `confidence`
