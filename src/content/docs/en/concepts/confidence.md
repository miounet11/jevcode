---
title: Confidence
description: Confidence is a statistic derived from the probability distribution. What it means, how it differs from probability, and why thresholds must scale with risk.
section: concepts
order: 30
tags: ['confidence', 'probabilities', 'threshold']
source: docs.typesafe.ai/confidence
---

## How the two fields relate

Every Choice and Score answer includes a `probabilities` property: the probability distribution across the options (Choice) or levels (Score).

The **shape** of that distribution tells you how certain the model is. Concentrated on one outcome means a confident answer; spread out means an uncertain one.

The `confidence` property collapses that shape into a single number from 0 to 1, so you can threshold on it without doing the maths yourself.

> **Note**: Noul answers do **not** carry a `confidence` — the value itself is already a probability from 0 to 1.

## What the distribution shape tells you

- **Low confidence on a Choice** usually means none of the options is a clear winner over the others.
- **Low confidence on a Score** usually means the levels are ambiguous or multi-dimensional, or the state does not contain enough to go on.

## "I don't know" is a useful signal

If an intelligent system — human or machine — cannot express honest uncertainty, the system cannot be trusted.

Confidence gives the model a built-in mechanism to say "I'm not sure about this one." That lets your code implement different behaviour for different levels of certainty, which is the foundation for systems you can actually rely on.

## Three paths

A useful starting pattern is to divide confidence into three ranges, each producing a different system behaviour:

- **High confidence**: act automatically. The model has a clear read and you can proceed without human involvement.
- **Medium confidence**: proceed with caution. The answer is reasonable but not certain. Depending on context, ask the user to confirm, flag for review, or gather more information first.
- **Low confidence**: do not act. Route to a human, request clarification, or fall back to a different system. The model is telling you it lacks information or the question is a poor fit.

**Where you draw those boundaries depends on the stakes.**

## Thresholds scale with risk

This is the single most important practice: **a confidence threshold is not one number.**

Different actions within the same system should be gated at different levels, depending on the consequences of getting it wrong.

```python
response = client.system_one(
    state=user_message,
    questions={
        "action": Choice(
            instructions="What is the user trying to do?",
            criteria={
                "check_balance": "View account balance",
                "approve_transfer": "Approve the pending withdrawal request",
                "support": "Get help with an issue",
            },
        ),
    },
)

action = response.answers["action"]
confidence = action.confidence

if confidence < 0.5:
    # Model is genuinely unsure. Don't guess.
    route_to_human(user_message)

elif action.choice == "check_balance":
    # Low stakes. Showing the wrong screen is recoverable.
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if confidence > 0.9:
        # High stakes, high confidence. Proceed with confirmation.
        confirm_then_execute(account_id)
    else:
        # High stakes, moderate confidence. Verify first.
        ask_user_to_confirm(account_id)
```

There are three distinct thresholds here, each matched to a risk level:

| Action | Risk | Threshold |
| :--- | :--- | :--- |
| Below 0.5, always intercept | — | Hard floor; catches the model's own reported uncertainty |
| `check_balance` | Low, read-only and recoverable | 0.5 is sufficient to act |
| `approve_transfer` | High, moves money | Requires > 0.9, and still confirms with the user |

The `0.5` floor catches anything the model reports as genuinely uncertain. Above it, the threshold for acting without confirmation is far higher for a destructive operation than for a read-only one. **Your code encodes your risk tolerance.**

> **Note**: The correct threshold values depend on your domain and how the model performs on your use case. Start conservative, test with your own data, and adjust as you observe results.

## You can define your own measure

The `confidence` TypeSafe provides is a convenient measure that fits most use cases, but you are never locked into its definition. Depending on what you are evaluating, a different measure may serve you better — which is exactly why `probabilities` is returned alongside it: you have the full distribution and can compute your own.

For example, the margin between the top two options may reflect "should I act automatically" better than concentration does in some settings. Or you might look only at the top-1 probability and ignore the rest. That choice is yours.

## Related

- [Choice](/en/primitives/choice/) / [Score](/en/primitives/score/) — the two primitives that carry confidence
- [Noul](/en/primitives/noul/) — no separate confidence; the value is the probability
- [Confidence routing](/en/patterns/confidence-routing/) — using confidence as a routing signal in a pipeline
