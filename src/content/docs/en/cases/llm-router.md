---
title: "LLM router: choose the handler with a typed decision"
description: "Ways to route each request to a model or a person — one model for everything, keyword rules, an embedding router, a chat model that names a route, and a clavue-jev choice plus a confidence question — and what you can branch on."
section: cases
order: 235
tags: ['llm-router', 'model-routing', 'routing', 'comparison']
---

## The decision in front of the model

An LLM router does not answer the user. It picks the handler that does. The same inbox holds a typo fix, a design question, and a message that should go to a person. Sending all three through the largest model works. The typo fix pays the large model's price.

People search this job as **LLM router** and **model routing**. The thing you are choosing is a closed set you already named: a small model, a large model, a lookup, a person. That choice is a value your program can branch on.

## Five ways the route gets chosen

| Approach | How the route is chosen | What can go wrong | What you pay |
| :--- | :--- | :--- | :--- |
| **One model for every request** | There is no router | Small jobs pay the large model's price | That model, on every request |
| **Keyword or regex rules** | A word list maps onto a handler | A paraphrase misses the list | Nothing at request time |
| **Embedding router** | The nearest route description wins | The descriptions drift away from the handlers | An embedding call, plus the index |
| **A chat model names the route** | You ask it to reply with a label | The label can sit outside your set, or arrive wrapped in prose | That model's input and its output |
| **Typed choice (clavue-jev)** | One `choice` over the handlers you listed, plus a `confidence` question | It can only return a handler you listed | Input tokens after a successful call. Output is free |

Keyword rules are enough when the words do not move. An embedding router fits when you already keep route descriptions. A chat model fits when the route itself has to be a sentence. A typed choice fits when the route is one of a few handlers and the next line of code has to read it.

## The request this site serves

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

```json
{
  "state": "Rename this function and add a test. Do not change behavior.",
  "questions": {
    "route": {
      "type": "choice",
      "instructions": "Which handler should run this request?",
      "options": ["small_model", "large_model", "human"]
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that routing judgment?"
    }
  }
}
```

`state` is text, 8 to 4000 characters. `questions` holds at most six. Keys start with a lowercase letter. A choice may send `options` or a `criteria` map. This server folds `options` into criteria before the model sees them.

You are billed on input tokens after a successful call. Output is free. The numbers are on the [pricing](/en/pricing/) page.

A response names the model and returns each answer under the same key:

```json
{
  "model": "clavue-jev",
  "answers": {
    "route": { "choice": "small_model" },
    "sure": { "noul": 0.78 }
  }
}
```

`route.choice` is one of the options you sent. `sure.noul` is a float from 0 to 1, and it comes from the confidence question. This API does not hide a confidence inside the choice. The `0.78` above shows the shape of that field. It is not a measured accuracy, and this site does not publish a cutoff.

Branch on the two fields. The cutoff is yours:

```python
route = body["answers"]["route"]["choice"]
sure = body["answers"]["sure"]["noul"]
cutoff = 0.8  # replace this with a cutoff you measured on your own traffic

if sure < cutoff or route == "human":
    hand_to_human(state)
elif route == "small_model":
    call_small(state)
else:
    call_large(state)
```

A wrong route into a tool that spends money wants a higher cutoff than a wrong route into a log line. Read a batch of your own traffic on [compare](/en/compare/) or [try](/en/try/) before you freeze the number. The reasoning is on the [confidence](/en/concepts/confidence/) page.

The same request can hold four more questions. A route, a confidence question, and a few yes/no checks still fit under the cap of six. [Fan-out](/en/patterns/fan-out/) is that shape.

## What the router does not do

It does not write the reply. The handler you picked writes it.

It does not invent a handler. If the right one is missing from `options`, the choice still returns one of the names you sent. Add the handler, or add a `noul` that asks whether any listed handler fits, and send the miss to a person.

Open-ended writing stays on a text model. The router decides which text model runs, or whether a person should see the request first. When the text comes back, a separate call can ask whether it is safe to act on. That second call is a [guardrail](/en/cases/llm-guardrails/), not part of the route.

## Where this shape already shows up

The [use-case map](/en/cases/use-case-map/) groups public projects that pick a model with a Jev choice: coding-task routers, a LiteLLM-based router, a per-request router for a coding agent, and a local proxy that picks a model and an effort level. The shared shape is one choice in front of the expensive call. This page does not add scores for those projects.

[Intent routing](/en/patterns/intent-routing/) is the same decision aimed at a customer-service queue instead of a model.

## Getting started

- [API](/en/api/) — `POST /v1/judge`, the request and the response
- [Try one](/en/try/) — the anonymous path, no key
- [System One](/en/concepts/system-one/) — state, questions, and the model name on the response
- [Confidence](/en/concepts/confidence/) — the second question, and who sets the cutoff
- [Pricing](/en/pricing/) — input tokens, output free

## Related

- [Structured output](/en/cases/structured-output/) — when the thing you need is a typed value, not a route
- [Fan-out](/en/patterns/fan-out/) — several questions on one state
- [Guardrails for LLMs](/en/cases/llm-guardrails/) — the check after a text model writes
- [Use-case map](/en/cases/use-case-map/) — the public projects
