---
title: Score
description: A Score rates content against ordered, descriptive levels. The answer includes a score, a probability per level, and confidence — and the score can fall between two levels.
section: primitives
order: 30
tags: ['score', 'ranking', 'rating']
source: docs.typesafe.ai/primitives/score
---

## When to use it

Use a Score when the answer is **a position on a spectrum you can describe in steps**. For example:

- how severe a bug is
- how happy a customer is
- how much Python experience a candidate has

If the answer is one of a fixed set of options with **no order between them**, use [Choice](/en/primitives/choice/). If it's yes or no, use [Noul](/en/primitives/noul/).

Example questions:

```text
"How severe is the bug being reported?"
  → 0: Cosmetic; no impact to functionality
  → 1: Broken or degraded feature, but workaround exists
  → 2: Blocking issue; no workaround exists

"How formal is this outfit based on the description"
  → 0: gym clothes
  → 1: casual
  → 2: business casual
  → 3: formal
  → 4: black tie
```

Note the ordering from 0 to 4 in the second example — least to most formal. That ordering is exactly the dividing line between Score and Choice. `{ billing, technical, sales }` has no genuine ordering; forcing a Score onto it would import a false ordinal semantics.

## Parameters

| Field | Required | Description |
| :--- | :--- | :--- |
| `type` | Yes | Must be `"score"` |
| `instructions` | Yes | The question itself |
| `criteria` | Yes | An **ordered array of levels**, lowest to highest; each entry's description defines that level |

Unlike Choice, where `criteria` is an object, a Score's `criteria` is an **ordered array**. The array order is the direction of the scale.

As with Choice, each entry can be a string, an object, or an array — switch to an object when a level needs more explanation.

## Request example

```python
from typesafe_sdk import Score, TypeSafeClient

client = TypeSafeClient()

bug = "The export button throws a CORS error when saving to Google Sheets. It works in Chrome, but a few of our customers only use Safari."

response = client.system_one(
    state=bug,
    questions={
        "bug_severity": Score(
            instructions="How severe is the reported issue?",
            criteria=[
                "Cosmetic; no impact to functionality",
                "Broken or degraded feature, but workaround exists",
                "Blocking issue; no workaround exists",
            ],
        ),
    },
)

print(response.answers["bug_severity"].score)
```

## Response

The defining feature of a Score answer is that `score` **can fall between two levels** — it is a position on the scale, not a level index.

| Field | Meaning |
| :--- | :--- |
| `score` | Position along your levels; may be fractional |
| `legend` | Your levels repeated by number, so you can map back to semantics in code |
| `probabilities` | Distribution across levels |
| `confidence` | How peaked the distribution is, 0 to 1 |

If the example returns `score: 1.4`, the model places the issue between "broken feature with a workaround" and "blocking", closer to the first. This **continuity is Score's core advantage over assembling several Nouls** — one call yields the full distribution rather than a handful of separate judgements.

`legend` makes the response self-describing: you do not need to maintain a separate table of level constants to translate the number back into meaning.

## Practice notes

**Level descriptions must be discriminable.** Each level's wording should let another person draw the same boundary. `"Calm, matter-of-fact"` / `"Frustrated but civil"` / `"Very angry"` is discriminable; `"low / medium / high"` is not.

**Keep levels to three to five.** Fewer loses resolution; more blurs the boundaries between adjacent levels and depresses confidence.

**Read `confidence`, not just `score`.** Low Score confidence usually means the levels are ambiguous, the scale is multi-dimensional, or the state lacks information. The right response is to improve the level definitions, not to force a value.

**Score is the workhorse for ranking.** Relevance, quality assessment, and risk grading all fit Score, combined with [composite scoring](/en/patterns/composite-scoring/) to merge several dimensions.

## Related

- [Choice](/en/primitives/choice/) — unordered fixed options
- [Noul](/en/primitives/noul/) — yes/no probability
- [Composite scoring](/en/patterns/composite-scoring/) — weighted multi-dimension merging
- [Confidence](/en/concepts/confidence/) — what low confidence means
