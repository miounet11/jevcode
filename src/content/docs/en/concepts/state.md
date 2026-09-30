---
title: State
description: State is the text clavue-jev judges. On this API it is one string, 8 to 4000 characters, shared by every question in the call.
section: concepts
order: 20
tags: ['state', 'clavue-jev']
---

## What you send

**State** is the text clavue-jev judges. On `POST /v1/judge` it is one string, from 8 to 4000 characters. Every question in that request sees the same string, and the questions do not read each other's answers.

Pack the facts the judgment needs into that string: the message, the policy line, the two names you want compared. If a fact is not in the string, the model does not have it.

```json
{
  "state": "User: I was charged twice. Policy: a duplicate charge within 7 days is refunded. Charge rows: Tuesday 18:02, Tuesday 18:04, same card, same amount.",
  "questions": {
    "duplicate": {
      "type": "noul",
      "instructions": "Do the rows show a duplicate charge?"
    }
  }
}
```

## One state, several questions

Put independent questions in the same request, up to six. "Is it a duplicate?" and "Which queue?" can travel together. A question that needs the previous answer cannot: run that as a second call, with the first answer written into the new state.

Name each part in the prose if you are sending more than one fact. "Policy: … Charge rows: …" is easier to judge than three unlabeled blobs.

## Length

Shorter than 8 characters is rejected. Longer than 4000 is rejected. If the material does not fit, cut it to the lines the question actually needs, or split the work into two calls.

- [System One](/en/concepts/system-one/)
- [Confidence](/en/concepts/confidence/)
- [API](/en/api/)
