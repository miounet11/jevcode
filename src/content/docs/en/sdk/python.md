---
title: Python SDK
description: Install typesafe-sdk and call the System One API with synchronous or asynchronous clients.
section: sdk
order: 20
tags: ['python', 'sdk', 'async']
source: docs.typesafe.ai/sdk/python
---

## Installation

```bash
# with uv
uv add typesafe-sdk

# or with pip
pip install typesafe-sdk
```

Then set the environment variable (create a key in the [console](https://console.typesafe.ai/)):

```bash
export TYPESAFE_API_KEY="sk-..."
```

The client reads it automatically and calls `jev-latest` by default.

## Async client (recommended)

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state={"document": "I was charged twice. Please fix this ASAP."},
            questions={
                "billing": Noul(instructions="Is this ticket about billing?"),
                "tone": Choice(
                    instructions="What is the customer's tone?",
                    criteria={"calm": None, "frustrated": None, "angry": None},
                ),
                "urgency": Score(
                    instructions="How urgent is this ticket?",
                    criteria=["can wait", "this week", "today"],
                ),
            },
        )

    print(response.nouls["billing"].noul)
    print(response.choices["tone"].choice)
    print(response.scores["urgency"].score)
```

Three things to note:

1. `state` takes a string, dict, or list directly — the SDK handles serialisation.
2. Questions are built with `Noul(...)` / `Choice(...)` / `Score(...)`; the `type` field is filled in for you.
3. **Responses are grouped by question type** — `response.nouls`, `response.choices`, `response.scores`, each keyed by question name.

## Question constructors

| Constructor | Arguments | Notes |
| :--- | :--- | :--- |
| `Noul(instructions, criteria=None)` | `criteria` optional, `{ true, false }` | Yes/no probability |
| `Choice(instructions, criteria)` | `criteria` is `{ option: description or None }` | Pick one from fixed options |
| `Score(instructions, criteria)` | `criteria` is an **ordered array** | Rate along ordered levels |

## Sync client

When async is inconvenient for the surrounding code:

```python
from typesafe_sdk import TypeSafeClient, Noul

client = TypeSafeClient()

response = client.system_one(
    state="I was charged twice.",
    questions={"billing": Noul(instructions="Is this about billing?")},
)

print(response.nouls["billing"].noul)
```

## Errors and retries

The SDK retries with backoff by default and honours the server's `retry-after` header. That matters because rate limits are adjusting dynamically — the official guidance is explicit that the published limits can change.

## Related

- [Full Python SDK API reference](https://docs.typesafe.ai/sdk/python/api/clients/async/client)
- [Quick start](/en/quickstart/)
- [Speculative fan-out](/en/patterns/fan-out/) — asking several questions at once
