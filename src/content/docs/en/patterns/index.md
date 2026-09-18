---
title: Patterns
description: Architectural patterns for building systems with TypeSafe. Thinking in discrete, atomic decisions is the key skill.
section: patterns
order: 10
tags: ['patterns', 'architecture']
source: docs.typesafe.ai/patterns
---

## The core idea

TypeSafe is designed to **sit within a larger system**, powering decisions with AI. The key skill is learning to think in terms of **discrete, atomic decisions** that compose into complex system behaviour.

That means resisting the urge to have one call solve a complex business problem. Break it into independent judgements and combine them in your own code. The combination logic is deterministic, testable, and tunable — which is exactly where reliability comes from.

Read [Primitives](/en/primitives/) and [Confidence](/en/concepts/confidence/) first if you have not.

## The four patterns

| Pattern | What it does | Benefits |
| :--- | :--- | :--- |
| [Speculative fan-out](/en/patterns/fan-out/) | Send many questions in a single call, including speculative ones, and let your code decide what's relevant | Cost, speed |
| [Confidence-gated routing](/en/patterns/confidence-routing/) | Use confidence as a second decision axis to build safer systems | Reliability, safety |
| [Composite scoring](/en/patterns/composite-scoring/) | Combine several dimensions of analysis into a single score | Cost, reliability, speed |
| [Intent routing](/en/patterns/intent-routing/) | Classify intent and route to the appropriate handler | Cost, speed |

## How they fit together

These are not mutually exclusive options but stackable building blocks. A typical production system uses several at once:

```text
incoming request
   │
   ├─ [intent routing]      classify what kind of request this is ────┐
   │                                                                  │
   ├─ [fan-out]             ask every judgement you might need ──────┤
   │                                                                  │
   ├─ [composite scoring]   rank candidates across dimensions ───────┤
   │                                                                  │
   └─ [confidence routing]  act when confident / escalate when not ──┘
```

**Intent routing** usually comes first because it determines which downstream handlers are relevant. **Fan-out** runs throughout, since packing questions into one call costs almost nothing in latency. **Composite scoring** applies when ranking is needed. **Confidence routing** is the final gate deciding whether the result executes automatically or escalates to a human.

## Design principles

**Split atomically.** One question, one judgement. A compound question that "does it all in one go" leaves you unable to tell which part went wrong, and unable to tune either part independently.

**Code composes, the model judges.** Weighting, thresholds, and branching belong in your code — the parts you need to read, test, and tune.

**Make uncertainty visible.** Rather than forcing the model to commit to an answer, surface "uncertain" through confidence and let your code decide what to do about it.

## Related

- [Primitives](/en/primitives/) — prerequisite
- [Confidence](/en/concepts/confidence/) — prerequisite
- [Ecosystem cases](/en/cases/use-case-map/) — how real projects use these patterns
