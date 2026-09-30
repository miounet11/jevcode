---
title: System One
description: "JevCode's own page on System One. clavue-jev answers a state with typed questions: noul, confidence, and choice."
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## Written on JevCode

This page is ours. It describes the call **this site** actually serves.

JevCode is the home of Jev. The model is **clavue-jev**, and we hold it as the best Jev in the world today. A System One call here means: one state, a handful of typed questions, and a response named `clavue-jev`.

## The job

Software needs a value of a known type. A chat reply is a string you then have to parse. clavue-jev takes the type in the question, so the answer is already a float or one of your options.

Use it for the judgments you run all day: which queue, whether a line is in scope, whether to let an action through. When the work is open-ended writing, use a text model, and let clavue-jev decide whether that text is safe to act on.

## The call

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

```json
{
  "state": "The invoice was paid twice on Tuesday.",
  "questions": {
    "duplicate": {
      "type": "noul",
      "instructions": "Does this describe a duplicate charge?"
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that judgment?"
    },
    "lane": {
      "type": "choice",
      "instructions": "Which queue should take it?",
      "options": ["billing", "fraud", "ignore"]
    }
  }
}
```

`state` is text, 8 to 4000 characters. `questions` holds at most six items. Keys start with a lowercase letter. A choice may send `options` or `criteria`. This server folds `options` into criteria before the model sees them.

The response includes `"model": "clavue-jev"`. You are billed on input tokens after a successful call. Output is free. The numbers are on the [pricing](/en/pricing/) page.

## Keep going

- [State](/en/concepts/state/)
- [Confidence](/en/concepts/confidence/)
- [Choice, Noul, and the rest](/en/primitives/)
- [API](/en/api/)
- [Live scenes](/en/scenes/)
