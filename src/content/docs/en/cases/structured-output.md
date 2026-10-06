---
title: "LLM structured output: JSON mode, function calling, and typed decisions"
description: "Structured output options for LLM apps compared — JSON mode, schema-constrained decoding, function calling, and TypeSafe typed questions — with failure modes, cost, and when a closed-set decision primitive beats asking a model to emit JSON."
section: cases
order: 205
tags: ['structured-output', 'json-mode', 'function-calling', 'comparison']
---

## The problem every LLM app hits

An LLM returns prose. Your application needs data: a category, a number, a boolean, a
struct. Everything downstream — routing, storage, dashboards, retries — depends on that
prose becoming parseable, valid output **every single time**, not most of the time.

The industry name for this is **structured output**, and there are now four mainstream
ways to get it. They differ in what they guarantee, what they cost, and what breaks.

## The four options at a glance

| Approach | How it works | Guarantee | Failure mode | Relative cost |
| :--- | :--- | :--- | :--- | :--- |
| **Prompting for JSON** | Ask the model to "reply in JSON" | None — it is a suggestion | Trailing commas, prose around the JSON, invented fields | 1x generation (can be long) |
| **JSON mode / response_format** | API flag that constrains output to valid JSON | Valid JSON syntax | Valid JSON with the wrong shape or types; schema drift | 1x generation |
| **Schema-constrained decoding** | Grammar/regex constraints applied during token sampling | Syntax *and* shape match the schema | Fields filled plausibly but semantically wrong; needs server support | 1x generation + serving complexity |
| **Function calling** | Model picks a declared function and arguments | Arguments validated against your signature | Hallucinated argument values outside enums; multi-step fragility | 1x generation |
| **Typed questions (TypeSafe)** | Closed-set Choice / Score / Noul questions over your state | Typed answer + full probability distribution + confidence, in one pass | Only what you did not ask — unasked questions cannot hallucinate | Token input only; **output is free** |

The first four share one property worth being honest about: **the model still generates
the answer token by token.** Every guarantee above is a guardrail around generation, not
a replacement for it. The fifth replaces generation with a single forward pass that
emits a distribution over a closed set you defined.

## Why closed sets change the failure profile

With JSON mode, a field like `"priority": "high"` can come back as `"High"`, `"HIGH"`,
`"priority_high"`, or `2`. You write the validator, the retry loop, and the fallback.
With schema-constrained decoding, the shape is right but nothing checks that the *value*
is the right judgement — a perfectly formatted struct can still contain a wrong answer,
and you have no signal for how sure the model was.

A typed question takes the opposite approach: the answer space is fixed before the
request exists.

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state=ticket_text,
            questions={
                "priority": Choice(
                    instructions="Which priority does this ticket have?",
                    criteria={
                        "p0": "Outage or data loss, all users affected",
                        "p1": "Major feature broken, workaround exists",
                        "p2": "Minor issue, scheduled work",
                    },
                )
            },
        )

    answer = response.answers["priority"]
    print(answer.choice)                            # "p1"
    confidence = answer.confidence                  # 0.93 — route on it directly
```

What you get back is not a string to parse. It is a **typed value with a probability
distribution over exactly the options you declared** — `p0: 0.02, p1: 0.93, p2: 0.05` —
plus a confidence number. There is no JSON to validate, no enum to normalize, no retry
loop for malformed output, because malformed output cannot be produced.

## What this looks like in practice

**Function calling with enum arguments.** If your function signatures already use
`Literal` types, those closed sets map one-to-one onto Choice questions — see the
[function calling cookbook](/en/cases/function-calling/) for a full trading-assistant
example where natural language becomes typed calls with per-argument confidence.

**Extraction pipelines.** For pulling values out of documents, the question map *is*
the schema — one entry per field, with the semantics defined exactly once. The
[structured data extraction cascade](/en/cases/sde-cascade/) shows a two-stage version
with a verification pass.

**Guardrails and classification.** Yes/no checks (is this a jailbreak? does this
contain PII?) are Noul questions — a probability, not a parsed string. See
[guardrails for LLMs](/en/cases/llm-guardrails/).

**Uncertainty handling.** The probability distribution is the part JSON mode cannot
give you. [Classification using confidence](/en/cases/classification-using-confidence/)
and [confidence-gated routing](/en/patterns/confidence-routing/) show what it enables:
auto-accept above a threshold, human review below, measured on your own data.

## The honest trade-off table

| | JSON mode / function calling | Typed questions |
| :--- | :--- | :--- |
| Open-ended text generation | Yes — the schema can contain free strings | No — answers come from closed sets |
| Output validity | Validated after generation | Guaranteed by construction |
| Confidence signal | Sometimes (logprobs, if exposed) | Always — full distribution per question |
| Cost driver | Generated output tokens | Input tokens only (output free) |
| Schema changes | Edit JSON schema, re-prompt | Edit question map, same request shape |
| Best for | Drafts, summaries, creative text with some structure | Decisions: classification, routing, scoring, verification |

The two approaches are complements, not competitors. A pipeline that needs a generated
brief *and* a routing decision pays for generation once, and makes the decision with a
typed question instead of parsing it out of the same JSON.

## Getting started

- [Primitives overview](/en/primitives/) — Choice, Score, Noul and when each applies
- [HTTP API reference](/en/sdk/http-api/) — the request/response shapes
- [Quickstart](/en/quickstart/) — first typed question in five minutes
- [Playground](/en/playground/) — try questions against live state, no signup

## Related

- [Function calling](/en/cases/function-calling/) — natural language to typed function calls
- [Structured data extraction cascade](/en/cases/sde-cascade/) — two-stage extraction with verification
- [Confidence-gated routing](/en/patterns/confidence-routing/) — the pattern the distribution enables
- [Use-case map](/en/cases/use-case-map/) — where each primitive shows up in production
