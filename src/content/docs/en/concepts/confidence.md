---
title: Confidence
description: Confidence on this API is its own question and returns a float from 0 to 1. You choose the threshold from the cost of being wrong.
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## Two different numbers

This API does not hide a confidence inside every answer. You ask for the number you want.

- A `noul` question returns `{ "noul": 0.92 }`. That is how strongly the answer is yes, not a separate certainty score.
- A `confidence` question returns `{ "noul": 0.78 }`. That is how solid the judgment is. Ask it beside the question you may act on.
- A `choice` question returns `{ "choice": "billing" }`, one of the options you sent.

Ask both when the branch matters:

```json
{
  "state": "The invoice was paid twice on Tuesday.",
  "questions": {
    "duplicate": {
      "type": "noul",
      "instructions": "Does this describe a duplicate charge?"
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that judgment?"
    },
    "lane": {
      "type": "choice",
      "instructions": "Which queue should take it?",
      "options": ["billing", "fraud", "ignore"]
    }
  }
}
```

## When to act

There is no universal cutoff on this site. A wrong automatic refund costs more than a wrong tag on a log line, so the refund path waits for a higher number.

A practical start:

1. Pick the action that is safe when the number is high.
2. Pick the handoff (a person, or a second call with a tighter state) when the number is low.
3. Read a batch of your own traffic on [compare](/en/compare/) or [try](/en/try/) before you freeze the cutoff.

If the model cannot say it is unsure, do not let it move money or delete data. Ask `confidence`, and branch.

- [State](/en/concepts/state/)
- [System One](/en/concepts/system-one/)
- [API](/en/api/)
