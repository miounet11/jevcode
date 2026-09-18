---
title: Confidence-gated routing
description: Use confidence as a second axis. The answer tells you what; confidence tells you whether to act.
section: patterns
order: 30
tags: ['confidence', 'routing', 'safety']
source: docs.typesafe.ai/patterns/confidence-routing
---

## The problem it solves

The answer and the confidence are **two independent pieces of information**. Branching on the answer alone discards half of what the model told you.

Confidence-gated routing means: take the answer, then use confidence to decide whether that answer is reliable enough to act on. This is the basis for systems that are both reliable and safe.

## Example: voice banking commands

Imagine building a voice interface for a bank account. You always want reasonable confidence in the interpreted intent, but **some actions are riskier than others and therefore demand a higher threshold**.

### Step 1: determine intent

A single Choice call yields the intent, with candidates such as `check_balance` and `approve_transfer`.

### Step 2: gate on confidence

```python
action = response.answers["intent"]

# Below 0.6 confidence on any action, route to a human
if action.confidence < 0.6:
    route_to_support_agent(account_id)

elif action.choice == "check_balance":
    # Low stakes. 0.6 confidence is sufficient.
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if action.confidence > 0.85:
        # High stakes, but high confidence. Proceed.
        ...
    else:
        # High stakes, moderate confidence. Confirm first.
        ask_user_to_confirm(account_id)
```

## Why the thresholds must differ

Look at the three thresholds in that code:

| Threshold | Purpose |
| :--- | :--- |
| `< 0.6` intercepts everything | When the model reports uncertainty, **no** action runs |
| `check_balance` at 0.6 | Read-only; a wrong screen is recoverable |
| `approve_transfer` at 0.85 | Moves money; mistakes are not reversible |

This is "thresholds scale with risk" expressed in code. **A single global threshold forces you to choose between over-interrupting on low-stakes actions and being under-cautious on high-stakes ones.**

## Practice notes

**Set a hard floor first, then per-action thresholds.** The floor (0.6 here) catches the model's own reported uncertainty — it is the safety net. Action thresholds sit above it, graded by risk.

**Make thresholds explicit configuration, not scattered magic numbers.** Define every action's threshold in one place so it can be audited and tuned. When someone asks "why does this transfer need human confirmation", you can point at a specific number.

**Do not let confidence replace business validation.** Confidence is the model's self-assessment, not a substitute for business rules. Amount limits and permission checks still belong in code.

**Calibrate thresholds against real data.** The official guidance is explicit: correct thresholds depend on your domain and how the model performs on your use case. Start conservative, test with your own data, adjust as you observe.

## When not to use it

If a decision has **no consequence when wrong** — tagging a log line, say — adding a confidence gate only adds complexity and human cost. The value of confidence routing scales with how irreversible the decision is.

## Related

- [Confidence](/en/concepts/confidence/) — how confidence relates to probabilities
- [Intent routing](/en/patterns/intent-routing/) — usually paired with this pattern
- [Composite scoring](/en/patterns/composite-scoring/) — handling confidence in ranking
