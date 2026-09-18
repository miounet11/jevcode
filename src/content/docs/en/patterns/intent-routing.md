---
title: Intent routing
description: Classify incoming requests and route each to the optimal handler — deterministic logic, a specialist LLM, or a human.
section: patterns
order: 20
tags: ['routing', 'classification', 'cost']
source: docs.typesafe.ai/patterns/intent-routing
---

## The problem it solves

Not every user request needs the same kind of handler. Some can be answered with a database lookup. Some need an LLM with domain-specific context. Some need a human.

TypeSafe can sit **in front of all of these** as a fast, cheap classifier that determines which handler to invoke.

**The cost motive is the point**: rather than sending every message through an expensive LLM to figure out what kind of request it is, classify first and route accordingly.

## Example: customer service routing

Messages arrive and need to reach the right handler.

### Step 1: classify intent and complexity

Ask intent, complexity, and several supporting judgements in one request:

```json
{
  "questions": {
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
    "bug_severity": {
      "type": "score",
      "instructions": "How severe is the reported issue",
      "criteria": [
        "Cosmetic; no impact to functionality",
        "Broken or degraded feature; workaround exists",
        "Blocking issue; no workaround exists"
      ]
    },
    "has_reproducible_steps": {
      "type": "noul",
      "instructions": "The user describes specific steps to reproduce the issue"
    },
    "refund_requested": {
      "type": "noul",
      "instructions": "The user is explicitly asking for a refund or credit"
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated the user appears",
      "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
    }
  }
}
```

### Step 2: route on the classification

```python
intent = response.answers["intent"]

if intent.choice == "order_status":
    # Deterministic logic is enough: a database lookup
    lookup_order_status(state["order_id"])

elif intent.choice == "product_question":
    # Needs domain context: an LLM with the knowledge base
    answer_with_catalog_llm(state)

elif intent.choice == "return_exchange":
    start_return_flow(state["order_id"])

elif intent.choice == "complaint":
    # High stakes: a human
    route_to_human_agent(state)
```

## Why classifying first saves money

The point is to **reserve expensive handling for the requests that actually need it.**

Suppose 70% of your support messages are `order_status` type requests that a single database query answers. Send everything to a large model first and you pay large-model prices for that 70% — which never needed it. A cheap Choice classification up front diverts that traffic away.

This leans on [fan-out](/en/patterns/fan-out/): classification, severity, refund intent, and frustration are all asked at once, because additional questions cost nothing in speed.

## Practice notes

**The classification output should be directly usable.** `intent.choice` should work as a routing table key without further string processing.

**Granularity sets system complexity.** Too few categories and routing has no resolution; too many and each category has fewer samples, hurting accuracy. Start with four to six.

**Send speculative judgements along.** In the example, `bug_severity` and `has_reproducible_steps` only matter for some intents, and `refund_requested` only in refund scenarios. Sending them all up front costs almost nothing — that is the value of [fan-out](/en/patterns/fan-out/).

**Gate a second time on confidence.** If `intent.confidence` is low, the classification itself is unreliable. Do not route blindly — escalate to a human or ask for clarification. See [Confidence-gated routing](/en/patterns/confidence-routing/).

**Keep an escape-hatch category.** Give the classification an `other`-style option so requests that match no handler are not forced into the nearest one.

## Related

- [Choice](/en/primitives/choice/) — the primitive behind this pattern
- [Fan-out](/en/patterns/fan-out/) — asking every supporting judgement at once
- [Confidence routing](/en/patterns/confidence-routing/) — what to do when classification is unreliable
- [Composite scoring](/en/patterns/composite-scoring/) — the complementary pattern when ranking is needed
