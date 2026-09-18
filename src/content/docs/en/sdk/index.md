---
title: SDKs & integration
description: Official client SDKs, the HTTP API, and the skill for AI coding agents.
section: sdk
order: 10
tags: ['sdk', 'api']
source: docs.typesafe.ai/sdk
---

## Three ways to integrate

| Route | Best for | Notes |
| :--- | :--- | :--- |
| [Python SDK](/en/sdk/python/) | Backend services, data pipelines, batch jobs | Sync and async clients, typed inputs, automatic retries |
| [JavaScript SDK](/en/sdk/javascript/) | Node services, full-stack apps | Answer types inferred from your questions |
| HTTP API | Other languages, lightweight integration | You handle retries and rate limits yourself |

If an AI coding agent is writing the integration, install the [TypeSafe agent skill](/en/sdk/agent-skill/) first so it knows the exact request and response shapes instead of guessing.

## Shared conventions

All SDKs follow the same conventions:

- **Endpoint**: `POST https://api.typesafe.ai/v1/systemone`
- **Auth**: read from the `TYPESAFE_API_KEY` environment variable; no key in code
- **Default model**: `jev-latest` (resolves to the latest stable release)
- **Retries**: backoff by default, honouring the `retry-after` header when present

## Version requirements

- Python SDK: package `typesafe-sdk`
- JavaScript SDK: package `@typesafe-ai/sdk`, Node.js 20 or newer

The JS SDK ships ESM, CommonJS, and TypeScript declaration files.

## Calling the HTTP API directly

Without an SDK you own two things the SDKs already handle:

**Rate-limit retries.** Exceeding 250,000 tokens/second or 1,200 requests/minute returns `429 Too Many Requests`. The response may carry a `retry-after` header, and you should back off accordingly.

**Response parsing.** The return value is an answer object keyed by question name, with a different field shape per question type. See the [API reference](https://docs.typesafe.ai/api).

## Related

- [Python SDK](/en/sdk/python/)
- [JavaScript SDK](/en/sdk/javascript/)
- [Agent skill](/en/sdk/agent-skill/)
- [Quick start](/en/quickstart/) — a complete runnable example
