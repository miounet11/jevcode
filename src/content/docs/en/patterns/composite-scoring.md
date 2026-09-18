---
title: Composite scoring
description: Break a complex judgement into atomic scores, then combine them with weights you control in code.
section: patterns
order: 40
tags: ['score', 'ranking', 'weights']
source: docs.typesafe.ai/patterns/composite-scoring
---

## The problem it solves

We often need to rank a set of items on **several criteria at once**. Asking for a single "overall score" works badly: the number is unexplainable and you cannot tell why the model ranked things that way.

Composite scoring instead breaks the judgement into independent dimensions, scores each separately, and combines them in code with **weights you control**.

## Example: resume screening

Say you are processing resumes for engineering roles and want to rank candidates on several criteria, ultimately selecting the top X for further review.

### Step 1: score each dimension independently

Ask four Scores in one call: `python_depth`, `team_leadership`, `system_design`, `generalist`, each with its own level definitions.

### Step 2: combine with weights

```python
py      = response.answers["python_depth"].score / 4
lead    = response.answers["team_leadership"].score / 4
arch    = response.answers["system_design"].score / 4
general = response.answers["generalist"].score / 4

# Senior IC
ic_score = (0.40 * py) + (0.10 * lead) + (0.40 * arch) + (0.10 * general)

# Engineering Manager
em_score = (0.15 * py) + (0.40 * lead) + (0.20 * arch) + (0.25 * general)
```

Each dimension is normalised to 0–1 first, then weighted.

## The real payoff

A ranked list is the surface benefit. **The real value is explainability.**

Notice that the two roles use **the same scores with different weights**. That means:

- one call serves two hiring tracks; cost does not double;
- if the ranking does not match expectations, you adjust weights rather than re-tuning prompts;
- when someone asks why a candidate ranked first, you can show the per-dimension values and the weights.

**None of the dimension detail is lost.** A candidate strong in Python but weak at leading teams ranks high for the IC role and lower for the EM role — and that difference is encoded in weights, not re-decided by the model.

## Debugging by decomposition

Weights bring another practical benefit: **you can sort by a single dimension to investigate anomalies.** If the composite ranking looks wrong, sort by `python_depth` alone and check whether that matches intuition. If it does not, the problem is that dimension's level definitions, not the weights. This decomposability is exactly what "ask the model for one big score" cannot give you.

If a dimension lacks resolution — everyone lands in the same level — the level definitions need rewriting, not the weights.

## Working with confidence

Every dimension's Score carries `confidence`. A low-confidence dimension is a signal: either the levels are ambiguous or the state lacks evidence.

A practical rule: if a high-weight dimension comes back below your confidence threshold, mark the candidate for human review rather than letting an unreliable score drive the ranking.

## Practice notes

**Dimensions must be orthogonal.** If two dimensions correlate strongly (say "Python depth" and "programming ability"), weighting double-counts the same thing. Ask of each dimension: can this vary independently?

**Normalise weights to sum to 1.** It makes them easy to reason about and adjust.

**Normalise before weighting.** Different dimensions usually have different numbers of levels; without normalisation, a dimension with more levels gets disproportionate influence.

**Weights are a business decision, not a technical one.** Who decides the IC-versus-EM weight difference? The hiring manager, not the engineer. Make weights configurable.

## Related

- [Score](/en/primitives/score/) — the primitive behind this pattern
- [Fan-out](/en/patterns/fan-out/) — asking every dimension at once
- [Confidence](/en/concepts/confidence/) — handling unreliable dimension scores
