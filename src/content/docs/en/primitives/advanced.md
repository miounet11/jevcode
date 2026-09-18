---
title: Structured questions
description: Instructions and criteria accept JSON structure. System One models are trained to understand structure — using it lifts accuracy on complex judgements.
section: primitives
order: 90
tags: ['instructions', 'criteria', 'structure']
source: docs.typesafe.ai/primitives/advanced
---

## Where structure is allowed

All of these fields accept a `string`, `object`, `array`, or `null`:

| Field | Applies to |
| :--- | :--- |
| `instructions` | Choice, Score, Noul |
| `criteria` values (option descriptions) | Choice |
| `criteria` entries (level descriptions) | Score |
| `criteria.true` / `criteria.false` | Noul |

**System One models are trained to understand structure.** This is not a limitation to work around — it is a capability to exploit.

## When to structure a question

- **When it helps with clarity.** When a question has multiple parts, putting them in JSON with labelled keys reads far better than folding them into a template string.
- **When the question needs supporting data.** A schema, a taxonomy, or a database row is already JSON. Pass it in whole, or pass the relevant subfields, instead of serialising it into a string.

## Structured instructions: one reusable field description

A common pattern: describe the **field being checked** with a `field` object, then have multiple questions refer to it by key.

Here the state is a line of invoice text:

```text
Invoice #4471 issued March 3, 2026 to Beaver Dam Logistics for $12,840.00, net 30.
```

The **same `field` shape** then drives four different judgements — a Noul that verifies a value, a Choice that picks one from candidates, and Scores that place values on scales:

```json
{
  "questions": {
    "invoice_number_is_correct": {
      "type": "noul",
      "instructions": {
        "field": {
          "name": "invoice_number",
          "type": "string",
          "description": "The identifier printed on the invoice."
        },
        "extracted_value": "4471",
        "question": "Does `extracted_value` match the `field` as it appears in `source_text`?"
      }
    },
    "customer_name": {
      "type": "choice",
      "instructions": {
        "field": {
          "name": "customer_name",
          "type": "string",
          "description": "The organization the invoice was issued to."
        },
        "question": "Which option is the value of `field` in `source_text`?"
      },
      "criteria": {
        "Beaver Logistics": null,
        "Dam Logistics": null,
        "Beaver Dam Logistics": null,
        "Beaver": null,
        "Dam": null
      }
    },
    "payment_terms": {
      "type": "score",
      "instructions": {
        "field": {
          "name": "payment_terms",
          "type": "integer",
          "unit": "days",
          "description": "Days allowed for payment, from terms such as \"net 30\"."
        },
        "question": "How many days does the `field` in `source_text` allow for payment?"
      },
      "criteria": ["Due on receipt", "Net 15", "Net 30", "Net 60", "Net 90 or longer"]
    }
  }
}
```

The value here is the **reusability of the structure**: the `field` declares name, type, unit, and description once, and each question then only states which judgement to make. For structured extraction, this is far more stable than writing an independent natural-language prompt per question, because the field's semantics are defined exactly once.

Note the `customer_name` Choice too: its options are a set of **easily confused near-strings** (Beaver Logistics / Dam Logistics / Beaver Dam Logistics / Beaver / Dam). Picking the right one from similar candidates is a textbook Choice strength; judging them one by one with Nouls would be slower and less consistent.

## Structured Score levels

Each entry in a Score `criteria` array can be an object, attaching more information to a level such as numeric ranges or examples.

## Structured Noul criteria

Noul `criteria` is optional. When the yes/no boundary is subtle, structured `true` and `false` descriptions let you pin it down with a definition and examples on each side.

## Hierarchical classification: chained Choices

To classify through a deep taxonomy, **chain Choice questions level by level** rather than stuffing the whole tree into one question's options.

Ask the top-level department first, with each department as an option and its **subtree** as the value. Read the `probabilities` to see whether the split is close enough to explore both branches.

Once a department is chosen, ask the next Choice with that department's children as the options and their subtrees as the values, and repeat until you reach a leaf. In code this can be a loop over a nested dict, where each question's `criteria` is simply the current node.

The official Hierarchical Classification cookbook shows a similar tree walk, including a beam search that keeps several candidate paths alive when the probabilities are close.

> **Tip**: Subtrees can get large. If a branch is too large, trim the value to its direct children plus a sample of leaves.

## Related

- [Choice](/en/primitives/choice/) / [Score](/en/primitives/score/) / [Noul](/en/primitives/noul/)
- [Fan-out](/en/patterns/fan-out/) — packing many questions into one request
- [How to build with System One](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — the official workflow guide
