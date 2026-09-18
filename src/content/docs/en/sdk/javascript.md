---
title: JavaScript / TypeScript SDK
description: Install @typesafe-ai/sdk to call the System One API with answers whose types are inferred from your questions.
section: sdk
order: 30
tags: ['javascript', 'typescript', 'sdk']
source: docs.typesafe.ai/sdk/javascript
---

## Installation

Requires Node.js 20 or newer:

```bash
npm install @typesafe-ai/sdk
```

Set the environment variable, then create a client:

```bash
export TYPESAFE_API_KEY="sk-..."
```

## Basic usage

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

## Type inference

This is the most valuable part of the TS SDK: **answer types are inferred from the questions you pass.**

```ts
questions: {
  category: choice("What is this ticket about?", {
    billing: null,
    technical: null,
    other: null,
  }),
}
```

Because the `criteria` keys are `billing` / `technical` / `other`, the type of `response.answers.category.choice` is the union of those three literals. A typo like `"bililng"` is a compile error rather than a runtime `undefined`.

Likewise, a question built with `score(...)` yields an answer carrying `score`, `legend`, `probabilities`, and `confidence`; one built with `noul(...)` carries only `noul`.

The upshot: **you never hand-write answer types**, and you never treat the API response as `any`.

## Response shape

```ts
response.answers.category.choice;        // the selected option
response.answers.category.probabilities; // per-option probabilities
response.answers.category.confidence;    // confidence
```

All question types are indexed by question name under `response.answers`; the fields available depend on the question's type.

## Package layout

The SDK ships ESM, CommonJS, and TypeScript declaration files, so it works directly across build setups.

For every option and default, see the SDK's [client](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/client.ts) and [types](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/types.ts).

## Related

- [Quick start](/en/quickstart/)
- [Primitives](/en/primitives/) — how the three question types are constructed
- [Speculative fan-out](/en/patterns/fan-out/) — asking several questions at once
