---
title: System One models
description: System One is a class of models built for fast, structured decisions. Jev is the first, and its output can be consumed by software directly.
section: concepts
order: 10
tags: ['system-one', 'architecture']
source: docs.typesafe.ai/concepts/system-one
---

## Definition

System One models are a class of AI models built to make **fast, structured decisions that software can use directly**. Jev is TypeSafe's flagship model and the first System One model.

The problem they solve: conventional language models emit free-form text, while software needs values of a known type. System One internalises that conversion — the question declares the output type, and the model answers within it.

## Division of labour with System Two

The naming borrows from dual-process theory in cognitive science, and the meaning is direct:

| | System One | System Two |
| :--- | :--- | :--- |
| Character | Fast, intuitive, focused | Slow, deliberate, multi-step |
| Typical tasks | Judgement, classification, scoring, verification | Complex reasoning, long-horizon planning |
| Latency | Low and predictable | Higher, grows with thinking length |
| Output | Typed and constrained | Free-form text |
| Cost | Low | High |

They are not substitutes. The typical production pattern is for System One to carry the overwhelming majority of high-frequency judgements, escalating to System Two or a human only when deep reasoning is genuinely needed.

## A worked example: refund requests

The flow in the official docs illustrates how the two layers cooperate:

1. **Build a state** — pack the customer's message, the relevant transactions, and the refund policy into one state.
2. **Ask in parallel** — ask three independent questions at once: whether a refund was requested, whether the evidence indicates a duplicate charge, and whether the policy supports a refund.
3. **Combine in code** — combine the three answers with deterministic business checks, then route to action or review.

Note the **independence** of the questions in step 2: they do not influence each other, which is the precondition for packing them into a single request.

## Why typed output is the crux

Because System One models return **typed, constrained outputs rather than free-form text**, your code can inspect and combine the answers into predictable workflows.

Compare the integration complexity:

```python
# Conventional: parse, validate, handle format drift
raw = llm.complete("Is this ticket about billing? Answer yes or no.")
is_billing = raw.strip().lower().startswith("y")  # brittle, many edge cases

# System One: the value is already typed
response = client.system_one(
    state=ticket,
    questions={"billing": Noul(instructions="Is this ticket about billing?")},
)
is_billing = response.nouls["billing"].noul  # float, 0..1
```

The second returns a type within a known domain — a Choice is always one of your options, a Score lies within your levels, a Noul is always a float from 0 to 1.

## Confidence: letting the model say "I don't know"

System One answers also carry [confidence](/en/concepts/confidence/), so you can decide when to act and when to escalate to a person or a reasoning model. This is the foundation of trustworthy systems — **if a system cannot express honest uncertainty, it cannot be trusted**.

## How to call it

Through a client [SDK](/en/sdk/) or the HTTP API:

```http
POST https://api.typesafe.ai/v1/systemone
```

The `model` field in the request selects which model handles the call. The default alias is `jev-latest`.

## Further reading

- [State](/en/concepts/state/) — organising the context you send
- [Primitives](/en/primitives/) — the three typed question types
- [Patterns](/en/patterns/) — how production systems organise these calls
- [How to build with System One](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — the official end-to-end workflow guide
