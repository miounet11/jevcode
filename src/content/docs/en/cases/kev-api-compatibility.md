---
title: "Kev API compatibility: a third-party conformance report"
description: "Kev-0.8B (MLX, M1 Pro) passes all 32 MUST requirements of a third-party Jev API conformance suite — 255 options, 10 score levels, mixed question batteries, typesafe-sdk parsing — with the two SHOULD-level notes the author filed back."
section: cases
order: 225
tags: ['compatibility', 'conformance', 'kev', 'api']
---

## Compatibility you can test, not compatibility you claim

"Compatible with the Jev API" is easy to say and hard to verify. So a community
member wrote it down as a testable spec: [jevcompat](https://github.com/mandu5/jevcompat)
— 48 requirements for the `POST /v1/systemone` contract, each one citing TypeSafe's
docs, the OpenAPI file, or SDK source. Then the suite was run against the eight
most-starred open servers implementing the API.

**Kev-0.8B (`2874258`, MLX, M1 Pro) is one of two servers that pass every MUST: 32/32**, including:

- choice options accepted up to the 255-option limit
- score levels accepted up to the 10-level limit
- `model: "jev-latest"` alias resolution
- mixed batteries — noul, choice, and score questions in one request, answers keyed
  by your ids
- non-ASCII text round-tripping through option names
- the official `typesafe-sdk` parsing every answer type unmodified

Full report with every recorded exchange:
[results/kev/report.md](https://github.com/mandu5/jevcompat/blob/main/results/kev/report.md)
— serve command and weights in [RUN.md](https://github.com/mandu5/jevcompat/blob/main/results/kev/RUN.md),
reproducible on your own machine.

## What conformance does not cover

The suite also tracks SHOULD-level requirements (Kev passes 10 of 12; the two
misses are auth-error responses, untested because the reported run ran with auth
off, and one further check was not exercised because the server never produced the
error it covers). The two SHOULD-level notes the author filed back are the more
interesting part, because both are places where a byte-identical response can
still be a worse answer:

**Score confidence normalization.** Kev computes score confidence as
`1 − E|level − mode| / (L − 1)`; TypeSafe's documented examples compute
`1 − E|level − mode| / D`, where `D` is the distribution's spread. Same evidence,
different denominator — measured on a 3-level question, Kev returned confidence
0.7535 where the reference formula gives 0.260. A client comparing confidence
numbers across backends will see different distributions for identical judgement
quality. If you route on absolute thresholds (the
[confidence-routing](/en/patterns/confidence-routing/) pattern), calibrate per
backend — or route on the raw distribution, which both backends expose.

**Long-context degradation is a model property, not a spec violation.** The suite
passes; accuracy beyond Kev's 384-token training context does not survive into the
spec. On the suite's TypeSafe selections, Kev-9B scored 0.92 inside the training
context but 0.75–0.79 on longer documents (Kev-4B: 0.88 / 0.88 / 0.81) — see the
[long-context recipe](https://github.com/jaredpalmer/kev/issues/48) for the full
breakdown and the author's proposed fixes. The
[state design](/en/concepts/state/) guidance applies to any backend: keep the state
the size of the decision, not the size of the page.

## The broader point

The 48-requirement spec is backend-agnostic. If you are evaluating Kev against
other self-hosted Jev API servers, run the same suite and compare numbers instead
of READMEs. The two conformant implementations also disagree in measurable ways
outside the spec — confidence distribution shape, long-context retention — which
is exactly the kind of thing a conformance report makes visible and a feature grid
hides.

## Getting started

- [Kev on GitHub](https://github.com/jaredpalmer/kev) — the 0.8B–9B model family
- [jevcompat spec](https://github.com/mandu5/jevcompat/blob/main/SPEC.md) — the 48 requirements
- [HTTP API reference](/en/sdk/http-api/) — the official contract being tested
- [Confidence-gated routing](/en/patterns/confidence-routing/) — route on distributions, calibrate per backend
- [Self-consistency testing](/en/cases/consistency-choice-cookbook/) — stress-test any backend the same way
