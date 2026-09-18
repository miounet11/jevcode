---
title: Use-case map & ecosystem
description: A map of Jev use cases by scenario, with real production projects. See which primitives others reach for, and where.
section: cases
order: 10
tags: ['use-cases', 'ecosystem', 'production']
source: docs.typesafe.ai/concepts/use-case-map + awesome-jev
---

## How to use this map

Find the scenario closest to your business, see which primitives others use and what problem it solves, then adapt it to the documents and actions in your own workflow.

Each scenario below gives: **what it solves** → **which primitives** → **real projects**.

> For the **full project index grouped by category** (with star counts and language tags), see [Community ecosystem](/en/ecosystem/).

## Classification & routing

**Problem**: a request arrives and must be sorted into a category, then dispatched to a handler.

**Primitives**: Choice (classification), confidence for gating.

**Real projects**:

- [Notra](https://github.com/usenotra/notra) — Marketing analytics: a production GEO platform whose `NOTRA_JEV_CLASSIFIERS` flag routes brand-visibility classifiers off an LLM and onto Jev boolean decisions at a 0.5 threshold.
- [jev-router](https://github.com/gargpratyush/jev-router) — Developer tooling: routes Claude Code tasks to the cheapest capable model by asking Jev to choose among candidates.
- [jev-router (prismhq)](https://github.com/prismhq/jev-router) — LLM infrastructure: an open-source LiteLLM-based router where a Jev decision picks which model serves each request.
- [pi-jev-router](https://github.com/mejiasd3v/pi-jev-router) — Coding agents: adds automatic per-request model routing to the Pi coding agent through Jev decisions on Vercel AI Gateway.
- [jcm-router](https://github.com/adarshmishra07/jcm-router) — Coding agents: a local proxy that picks the Claude model and reasoning effort per message with a Jev decision, leaving the cached main chat untouched.

> **Observation**: model routing is the densest application area here. The shared shape is "one cheap Choice decision replacing an expensive model call or a human judgement".

## Scoring & ranking

**Problem**: a set of items must be ranked by relevance, quality, or several criteria at once.

**Primitives**: Score, with [composite scoring](/en/patterns/composite-scoring/) to merge dimensions.

**Real projects**:

- [jev-bfs](https://github.com/komikat/jev-bfs) — Search tooling: finds link paths between English Wikipedia articles by having Jev rank each page's outgoing links, while Python controls the search.
- [Jev Search](https://github.com/superagents-lab/jev-search) — Web search: uses Jev Noul judgements on result titles and snippets to rank Search1API results by relevance.

## Verification & guardrails

**Problem**: AI- or agent-produced work, tool calls, and inputs must be checked before a change advances.

**Primitives**: Noul (yes/no), thresholded to a boolean.

**Real projects**:

- [jev-review](https://github.com/devagrawal09/jev-review) — Software engineering: a staged code-review workflow and local dashboard where Jev gates each review stage before a change advances.
- [pi-jev](https://github.com/y0usaf/pi-jev) — Agent safety: adds a measured tool-call gate to the Pi coding agent so risky calls are checked by Jev before execution.
- [OpenWork](https://github.com/different-ai/openwork) — Engineering workflow: wires Jev into its eval testkit as a verification judge, so agent-produced work is gated by typed verdicts rather than a text model.
- [jev-guard](https://github.com/leepokai/jev-guard) — Agent security: a prompt-injection and dangerous-action guard for Claude Code, Codex, Pi, and ACP agents, with Jev deciding what to block.

## Agent decisions

**Problem**: an agent needs a fast, typed, explainable judgement layer at every step.

**Primitives**: Choice (action selection), supported by Score and Noul.

**Real projects**:

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — Browser automation: browser-use's ultrafast agent, where Jev decides each next action and which element to click, calling a language model only when text must be typed.
- [pi-typesafe-jev](https://github.com/legacybridge-tech/pi-typesafe-jev) — Coding agents: exposes System One judgements as five Pi tools so a model makes narrow semantic judgements while code and users keep control of thresholds, weights, and actions.
- [jev-judgment](https://github.com/HyunjunJeon/jev-judgment) — Coding agents: an agent skill that sends closed coding-agent judgements to Jev so verdicts stay typed, cheap, and comparable across runs.
- [limpet](https://github.com/noplan-inc/limpet) — Coding agents: a Stop hook that keeps an agent from finishing too early by judging plain-language completion rules with Jev.
- [robo-harness](https://github.com/grmkris/robo-harness) — Robotics: an SO-101 arm workbench where a Jev decision runner picks bounded joint steps from typed candidate actions under a spend budget.

## Content moderation & compliance

**Problem**: judging whether content violates policy, or contains sensitive information.

**Primitives**: Noul.

Few public projects are catalogued here yet — the shape matches the guardrail scenario: write questions like "does this contain personally identifiable information" or "does this violate policy" as Nouls, threshold them into booleans, and feed a deterministic pipeline.

## Data labeling & evaluation

**Problem**: labelling datasets, or evaluating model output quality.

**Primitives**: all three.

**Real projects**: see the evaluation-oriented entries under Scoring & ranking and Verification & guardrails — for instance OpenWork's use of Jev as an eval testkit judge.

## Games & simulation

**Problem**: a real-time environment needs a judgement at every frame or decision point.

**Primitives**: Choice (action selection).

**Real projects**:

- [jev-drone](https://github.com/RomanSlack/jev-drone) — Robotics simulation: a camera-only autonomous drone in MuJoCo that puts a Jev judgement model in the control loop at 2.5 Hz.
- [tsai-sc](https://github.com/phyous/tsai-sc) — Gaming: drives the original StarCraft shareware through keyboard and mouse with Jev action probabilities recorded per decision.

> **Observation**: latency matters most here. `jev-drone`'s 2.5 Hz control loop shows Jev's latency is low enough to sit inside a real-time control path.

## Foundational model research

**Problem**: reproducing or researching the System One shape — typed decisions in one forward pass.

**Real projects**:

- [decider](https://github.com/Mapika/decider) — Open models: reproduces the System One shape with a Qwen3.5-2B fine-tune that emits typed decisions with calibrated probabilities in one pass.
- [openjev](https://github.com/zhihz/openjev) — Open research: an independent local preview that answers bilingual probability questions from context, questions, and candidate answers, inspired by TypeSafe Jev.
- [Parallel Constrained Decoding (Qwen2.5-1B-RLCD)](https://huggingface.co/spaces/drinkmoonshine/parallel-constrained-decoding) — Open research: an RLCD-trained Qwen2.5-1B demo exploring open-source parallel constrained decoding as an alternative to Jev.

## Infrastructure & SDKs

**Problem**: wiring Jev into an existing stack.

See the [Infra / SDKs / Integrations category](https://github.com/yibie/awesome-jev/blob/main/categories/infra-sdks-integrations.md) on awesome-jev for language bindings, agent integrations, and gateway adapters.

## The official four directions

TypeSafe's own use-case map groups things into four directions worth checking your ideas against:

**AI automation software** — interleave AI with reliable software so it can run a million times in the background without a human co-pilot. **Code owns control flow; TypeSafe handles semantic decisions and language understanding.**

**Real-time applications** — frontier intelligence at real-time speeds (150ms) means AI decisions can be faster than human perception, fast enough to be programmed into games or embedded in a UI.

**AI Map Reduce over big data** — 100x cheaper means giant datasets become tractable: searching relevant information over giant corpuses, classifying massive agent traces, extracting features for prediction.

**Universal AI verification** — verify any other AI's input prompts, extractions, reasoning traces, or tool calls. Detect jailbreaks, citation errors, and hallucinations at a fraction of the cost of the LLM call itself.

## Related

- [Patterns](/en/patterns/) — the general patterns behind these cases
- [Primitives](/en/primitives/) — how to choose a primitive
- [awesome-jev](https://github.com/yibie/awesome-jev) — the ongoing community project list
