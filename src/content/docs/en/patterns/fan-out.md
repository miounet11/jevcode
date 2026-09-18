---
title: Speculative fan-out
description: Send many questions in a single call — including speculative ones — and let your code decide which are relevant.
section: patterns
order: 50
tags: ['fan-out', 'latency', 'cost']
source: docs.typesafe.ai/patterns/fan-out
---

## The problem it solves

The conventional approach is "classify first, then decide what to ask next". That requires serial calls: the first returns before you know what the second should be, and the latency stacks.

Fan-out inverts it: **send every question you might need at once**, and let your code decide which to ignore based on the classification. Because the model reads the state once and evaluates all questions in parallel, additional questions cost very little.

## The mechanism

Three facts make this pattern work:

1. The model **reads the state once**, then evaluates all questions in parallel.
2. **Every answer is independent** — one answer is not hidden context for another.
3. The budget is 64k tokens (state + all questions), or 32k tokens (state + the single longest question).

The second matters most: it guarantees that sending irrelevant questions alongside relevant ones will not contaminate the relevant answers.

## Example: ticket triage

You handle support tickets, and different kinds need entirely different judgements. Rather than classify then follow up, ask everything at once.

### Step 1: ask every judgement in one request

```json
{
  "questions": {
    "category": {
      "type": "choice",
      "instructions": "What kind of request is this?",
      "criteria": {
        "bug_report": "Reporting something broken",
        "billing": "Payment, invoice, or refund matters",
        "feature_request": "Asking for new functionality"
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

Here `bug_severity` and `has_reproducible_steps` only matter if the ticket is a bug report; `refund_requested` only matters for billing. **They are speculative questions** — but since asking more costs no speed, send them all up front.

### Step 2: route in code

```python
category = response.answers["category"]
bug_severity = response.answers["bug_severity"]
bug_repro = response.answers["has_reproducible_steps"]
refund = response.answers["refund_requested"]
frustration = response.answers["frustration"]

if category.choice == "bug_report":
    if bug_severity.score > 1.5 and bug_repro.noul > 0.6:
        escalate_to_engineering(ticket_id, severity="high")
    else:
        add_to_bug_backlog(ticket_id)

elif category.choice == "billing":
    if refund.noul > 0.7:
        route_to_billing_with_flag(ticket_id, refund_likely=True)
    else:
        route_to_billing(ticket_id)

elif category.choice == "feature_request":
    log_feature_request(ticket_id)

# Frustration is useful regardless of category
if frustration.score > 1.5:
    flag_for_priority_response(ticket_id)
```

**Everything needed for the full decision tree comes from one call.** Speculative questions are ignored when irrelevant and save a round trip when they are not.

## Practice notes

**Ask everything, then filter.** Move the "which questions are worth asking" decision from before the call to after it. Before the call you cannot know; after it, filtering is an ordinary branch.

**Watch the context budget.** The 64k covers state plus **all** questions. Fanning out hundreds of questions — scoring a corpus document by document, say — inflates the state quickly. Split into multiple requests in that case.

**Distinguish speculative from merely redundant.** A speculative question is one that **has clear meaning on other branches too**. A question whose answer you will never read on any branch is not speculative, it is waste — cheap, but it makes the code harder to follow.

**Pair it with confidence.** Fan-out solves *what to ask*; confidence routing solves *whether to trust it*. Combining them is the common production shape — see the voice banking example in [confidence-gated routing](/en/patterns/confidence-routing/).

## Related

- [Primitives](/en/primitives/) — independence and speculative questions
- [State](/en/concepts/state/) — context budgets and organising state
- [Confidence routing](/en/patterns/confidence-routing/) — the second decision axis
