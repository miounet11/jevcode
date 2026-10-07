---
title: "Content moderation API: build one from typed questions"
description: "How to build a content moderation API on TypeSafe typed questions — per-policy Noul checks, severity scoring, category routing, threshold governance you control — compared with one-size-fits-all moderation endpoints."
section: cases
order: 215
tags: ['moderation', 'content-moderation', 'guardrails', 'cookbook']
---

## Why "a moderation endpoint" is the wrong unit of purchase

Most platforms sell moderation as one endpoint with fixed labels: toxicity, hate,
violence, sexual, self-harm. That is convenient until the first time your product's
definition of a violation differs from the vendor's — a marketplace that must flag
off-platform payment attempts, a gaming chat where "trash talk" is allowed but
doxxing is not, a health forum where dosage questions are the point.

Your moderation policy is a **product decision**. The API you buy should not hard-code
it. What you actually need is a way to *express* the policy — and to change it when
the policy changes, without retraining anything and without waiting for a vendor.

This page shows how to build moderation from typed questions: each policy rule is a
question, each answer carries a probability, and the thresholds — the actual policy —
live in your code, versioned like code.

## The shape: one request per message, questions per rule

A message goes in; one request carries a Noul question per policy rule plus a Score
for severity; decisions come out. There is no second call and no per-rule endpoint to
fan out to.

```python
from typesafe_sdk import AsyncTypeSafeClient, Noul, Score

MODERATION_RULES = {
    "spam": Noul(instructions="Is this message spam or bulk advertising?"),
    "scam": Noul(instructions="Does this message try to defraud or phish the reader?"),
    "pii": Noul(instructions="Does this message contain personal data such as addresses, phone numbers, or IDs?"),
    "offsite_payment": Noul(instructions="Does this message try to move the transaction off the platform (external payment, direct email)?"),
    "severity": Score(
        instructions="If a policy is violated, how much harm would acting on it do?",
        criteria=["none", "minor", "moderate", "severe"],
    ),
}

async def moderate(client: AsyncTypeSafeClient, message: str) -> dict:
    async with client:
        response = await client.system_one(state=message, questions=MODERATION_RULES)
    return {rule: response.answers[rule] for rule in MODERATION_RULES}
```

The policy is the dict. Adding "no medical advice" to a health forum is one line; it
ships with your next deploy, not with your vendor's next model card.

## Thresholds are the policy — keep them in your code

Every Noul answer is a probability. What counts as a violation is the threshold you
apply to it, and different rules can carry different thresholds:

```python
THRESHOLDS = {"spam": 0.90, "scam": 0.85, "pii": 0.70, "offsite_payment": 0.95}
SEVERITY_ESCALATE = 2.5  # between "moderate" and "severe" on the 4-point scale

def decide(answers: dict) -> str:
    if answers["severity"].score >= SEVERITY_ESCALATE:
        return "escalate"    # legal / trust-and-safety queue
    for rule, threshold in THRESHOLDS.items():
        if answers[rule].noul >= threshold:
            return "block"
    if any(answers[rule].noul >= 0.60 for rule in THRESHOLDS):
        return "review"      # send to the human queue
    return "pass"
```

Four outcomes, each owned by you:

- **pass** — deliver the message
- **review** — human queue, cheapest way to burn down false positives
- **block** — enforce
- **escalate** — the severity Score pushed over its line, e.g. legal or trust-and-safety

Compare that with a moderation endpoint that returns its own category labels and a
flag. You can tune exactly one thing: the flag cutoff. The labels, their definitions,
and their calibration are someone else's deploy.

## Why the probabilities matter more than the labels

A boolean flag throws away the information you need to operate a moderation system:

**You can measure the borderline.** The share of decisions landing between 0.6 and 0.9
*is* your human-review workload. That number is legible before launch, not after a
pile of escalations. [Self-consistency testing](/en/cases/consistency-choice-cookbook/)
extends this: run borderline posts through the rubric repeatedly and check whether
labels hold still — label wobble is the silent killer of automated moderation.

**You can gate on confidence like every other decision in the pipeline.** The same
[confidence-routing](/en/patterns/confidence-routing/) pattern used for classification
applies unchanged: high probability acts, low probability reviews, and the split is a
number you chose.

**You can verify the verifier.** Because each rule is a separate question with a
distribution, you can hold out labeled examples per rule and measure precision per
rule — instead of discovering via a news cycle that one hidden category was
misfiring.

## Where this sits next to input guardrails

[Guardrails for LLMs](/en/cases/llm-guardrails/) covers the LLM-specific case:
screening prompts and completions for jailbreaks and harmful output around a model
call. The moderation system described here is the broader product surface — user
messages, profiles, listings, reviews — where the rules come from your terms of
service rather than from model safety. Same primitive, different rule author. Many
products end up running both: product moderation on user content, guardrails around
the model.

## Real moderation systems built this way

- [Jev-Moderation-Bot](https://github.com/brainstormity/Jev-Moderation-Bot) — a Discord bot where Jev checks spam and scam links, with warning and timeout escalation rules kept local
- [mastra-jev-moderation](https://github.com/CodeAlive-AI/mastra-jev-moderation) — input moderation for Mastra agents on TypeSafe Jev, in one file

## Build it

- [Primitives overview](/en/primitives/) — Noul and Score in detail
- [HTTP API reference](/en/sdk/http-api/) — request/response shapes
- [Guardrails for LLMs](/en/cases/llm-guardrails/) — the model-facing variant
- [Self-consistency: choices](/en/cases/consistency-choice-cookbook/) — stress-testing label stability
- [Use-case map](/en/cases/use-case-map/) — moderation and compliance among the other scenarios
