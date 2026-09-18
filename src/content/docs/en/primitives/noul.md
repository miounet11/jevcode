---
title: Noul
description: A Noul asks the model to evaluate a yes/no question and return the probability that the answer is yes. It carries no separate confidence.
section: primitives
order: 40
tags: ['noul', 'verification', 'guardrails']
source: docs.typesafe.ai/primitives/noul
---

## When to use it

Use a Noul when the answer is **yes or no**. For example:

- is this message asking for a refund
- does this resume mention distributed systems
- does this comment contain personal data

If the answer is one of several options, use [Choice](/en/primitives/choice/). If it's a position on a spectrum, use [Score](/en/primitives/score/).

Example questions:

```text
"Is the customer requesting a refund?"
"Does this resume mention experience with distributed systems?"
"Does the message contain personally identifiable information?"
"Does the room have a minifridge?"
```

## Parameters

| Field | Required | Description |
| :--- | :--- | :--- |
| `type` | Yes | Must be `"noul"` |
| `instructions` | Yes | The yes/no question or statement to evaluate |
| `criteria` | No | Optional `{ true, false }` descriptions clarifying what a yes and a no mean |

`criteria` is optional. The `instructions` alone is enough for most Noul questions; use `criteria` when the boundary between yes and no is subtle, to pin down what each outcome means. **Try both phrasings on your own data** to see which works better.

## Request example

```python
from typesafe_sdk import Noul, TypeSafeClient

client = TypeSafeClient()

response = client.system_one(
    state=ticket_conversation,
    questions={
        "is_human_escalation": Noul(
            instructions="Is the customer asking to speak to a human?",
        ),
        "is_repeat_contact": Noul(
            instructions="Has this customer contacted us about this issue before?",
        ),
    },
)

print(response.nouls["is_human_escalation"].noul)
```

## Response

```json
{
  "model": "jev-latest",
  "answers": {
    "is_human_escalation": {
      "type": "noul",
      "noul": 0.99
    },
    "is_repeat_contact": {
      "type": "noul",
      "noul": 0.93
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

`noul` ranges from 0 to 1 and represents the probability that the answer is **yes**. Most often you threshold it into a boolean when your code needs a hard decision.

## Noul returns no separate confidence

This is the key difference from the other two primitives: **a Noul is already a probability**, so there is no additional `confidence` field.

- Near 1: a strong yes
- Near 0: a strong no
- Near 0.5: yes and no have similar probability

## Wording decides everything

**Phrase it so a high probability means "yes".** The official guidance is to write the question this way so the returned answer is unambiguous. If you write "Is this not urgent?", then 0.9 means "not urgent", and anyone reading the code can easily invert it. Write "Is this urgent?" and 0.9 means urgent.

**Define a clear criterion.** For "Is the candidate strong in Python?", first define what "strong" means. An unclear definition makes the probability hard to interpret.

**0.5 does not mean "medium skill".** This is the most common misuse: 0.5 means the model cannot distinguish yes from no, not that the answer is halfway. To measure depth of skill, use a [Score](/en/primitives/score/) over defined levels.

**You can phrase the instruction as a statement.** Beyond a plain question, you can phrase the instruction as a statement for the model to evaluate for truthfulness. For "the customer is requesting a refund", a value near 1 means the statement is true. **Try both phrasings with your own data.**

## Related

- [Choice](/en/primitives/choice/) — unordered fixed options
- [Score](/en/primitives/score/) — rating along an ordered scale
- [Confidence](/en/concepts/confidence/) — why Noul has none of its own
- [Patterns](https://docs.typesafe.ai/patterns) — Noul in guardrail architectures
