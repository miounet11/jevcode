---
title: Quick start
description: Get an API key, make your first Jev call with cURL or an SDK, and understand the response shape.
section: start
order: 20
tags: ['quickstart', 'api', 'sdk']
source: docs.typesafe.ai/introduction/quickstart
---

## Step 1: Try the Playground

Open the [Playground](https://console.typesafe.ai/playground) and log in. Paste any text as the **state**:

```text
Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing.
I'm losing sales. Please help ASAP.
```

Then add a Noul question:

```json
{
  "urgency": {
    "type": "noul",
    "instructions": "Does this message express urgency?"
  }
}
```

You get back a number between 0 and 1. Near 1 means the model thinks the answer is yes.

The Playground's value is **fast iteration**: mix Noul, Choice, and Score questions, see every result from one call, and confirm your wording does what you expect.

## Step 2: Get an API key

Create one in the [dashboard](https://console.typesafe.ai/settings/keys), then set the environment variable:

```bash
export TYPESAFE_API_KEY="sk-..."
```

## Step 3: Call the API

Every model is served by the same endpoint:

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Minimal runnable cURL example:

```bash
curl -X POST https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": "Hi, I have been trying to connect my Stripe account for 3 days and it keeps failing. I am losing sales. Please help ASAP.",
    "questions": {
      "department": {
        "type": "choice",
        "instructions": "Which team should handle this",
        "criteria": {
          "billing": "Payment or subscription issues",
          "technical": "Bugs or integration problems",
          "sales": "Pricing or account questions"
        }
      },
      "frustration": {
        "type": "score",
        "instructions": "How frustrated the customer appears",
        "criteria": [
          "Calm, just stating facts",
          "Frustrated but civil",
          "Very angry, strong language"
        ]
      },
      "is_urgent": {
        "type": "noul",
        "instructions": "The message conveys urgency"
      }
    }
  }'
```

## Step 4: Use an SDK (recommended)

The SDKs read `TYPESAFE_API_KEY` from the environment and call `jev-latest` by default.

### Python

```bash
pip install typesafe-sdk     # or: uv add typesafe-sdk
```

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

### TypeScript / JavaScript

```bash
npm install @typesafe-ai/sdk    # requires Node.js 20+
```

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

The TS SDK's main advantage is that **answer types are inferred from your questions**: the `questions` you pass determine the return type, so a misspelled field name is a compile error.

## What the response looks like

Each answer's type follows the question's `type`:

| Type | Fields | Meaning |
| :--- | :--- | :--- |
| `choice` | `choice` / `probabilities` / `confidence` | Selected option, distribution over options, confidence |
| `score` | `score` / `legend` / `probabilities` / `confidence` | Position along your levels (can fall between two), legend, distribution, confidence |
| `noul` | `noul` | Probability the answer is yes. No separate `confidence`. |

The key constraint: **answers are always confined to the options you supplied.** The model returns a probability distribution over your options, never a value outside them — so no parser is needed to recover meaning.

## Common pitfalls

- **The state is read once.** The model reads it once, then evaluates all questions in parallel. Pack multiple questions into one request early; it costs almost nothing.
- **Pre-process non-text input.** Images, audio, and video must be converted to text or structured fields before being sent as state.
- **Over-limit returns 429.** The official SDKs retry with backoff and honour the `retry-after` header by default; calling the HTTP API directly means implementing that yourself.

## Next steps

- [Choice](/en/primitives/choice/) — the basis of classification and routing
- [Score](/en/primitives/score/) — rating and ranking
- [Noul](/en/primitives/noul/) — verification and guardrails
- [Confidence](/en/concepts/confidence/) — use it to control system behaviour
