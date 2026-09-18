---
title: What is Jev
description: Jev is TypeSafe's flagship model and the first System One model. It turns unstructured state plus typed questions into typed decisions software can consume directly.
section: start
order: 10
tags: ['overview', 'system-one']
source: docs.typesafe.ai/introduction
---

## In one sentence

Jev is not a chat model. You give it **state** and **typed questions**; it returns **typed decisions** — a choice, a score, or a boolean probability, each with a **confidence**.

That framing is what separates it from conversational models:

| Dimension | Chat models | Jev |
| :--- | :--- | :--- |
| Output | Free-form text | Structured results with a fixed schema |
| Purpose | Generation, dialogue, reasoning chains | Classification, routing, scoring, verification, guardrails |
| Integration | Parse the model's prose | Consume the value directly, no regex |
| Confidence | Usually absent | Present on every answer |
| Latency | Seconds, grows with output length | Low and stable |

## Why a decision layer

The usual pain when wiring an LLM into a business system: the model emits prose, so you write a parser, handle edge cases, and guess whether it got it right. Jev removes that layer — the question itself declares the output type, and the model must answer within it.

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this",
    "criteria": {
      "billing": "Payment or subscription issues",
      "technical": "Bugs or integration problems",
      "sales": "Pricing or account questions"
    }
  }
}
```

The return value is one of `billing` / `technical` / `sales`, plus a confidence. No parsing, no fallback format.

## Three question primitives

Every decision reduces to one of three question types. This is Jev's core abstraction — understand these and you understand the whole system:

- **[Choice](/en/primitives/choice/)** — pick one from a set of mutually exclusive options. For intent detection, ticket routing, action selection.
- **[Score](/en/primitives/score/)** — rate along an ordered scale. For relevance ranking, quality assessment, risk grading.
- **[Noul](/en/primitives/noul/)** — answer a yes/no question as the probability of yes. For verification, claim checking, guardrails.

You can mix all three in one request. The model reads the state once, then evaluates every question in parallel.

## Where System One fits

System One is a class of models built to make fast, structured decisions that software can use directly. Jev is the first of that class. It is not a replacement for System Two style reasoning models — they divide labour:

- **System One**: high-frequency, low-latency, structured judgements. An upgraded if/else for your pipeline.
- **System Two**: tasks that need multi-step, long-chain reasoning.

The common production pattern is to lean on System One for fast triage throughout the pipeline, and escalate to a stronger model only when genuine deep reasoning is required — which keeps cost and latency down.

## Next steps

- [Quick start](/en/quickstart/) — get an API key and make your first call
- [Core concepts](/en/concepts/system-one/) — System One and the state model
- [Patterns](/en/patterns/) — how production systems organise these calls
