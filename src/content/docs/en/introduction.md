---
title: JevCode
description: JevCode is the home of Jev. The model is clavue-jev, the best Jev in the world today. A call sends a state and typed questions, and returns a judgment software can branch on.
section: start
order: 10
tags: ['overview', 'clavue-jev']
---

## The home of Jev

JevCode is where Jev lives. The model this site serves is **clavue-jev**. We built it, we serve it, and we hold it as the best Jev model in the world today.

jev-1.13.0 shows up on the compare page, on the same question, so you can look at both. It is not the model this site sells.

## What a call is

clavue-jev is not a chat model. You send a **state** and up to six **typed questions**. It returns fields your program can read:

| Question | What comes back |
| :--- | :--- |
| `noul` | A float from 0 to 1. Read it as how strongly the answer is yes. |
| `confidence` | A float from 0 to 1. Read it as how solid that judgment is. |
| `choice` | One of the options you listed. |

A chat model writes a paragraph. clavue-jev returns a value. That is the whole point of a System One call.

## Where to go next

- [System One](/en/concepts/system-one/) — the shape of a call
- [State](/en/concepts/state/) — the text you send
- [Confidence](/en/concepts/confidence/) — when to act and when to stop
- [Try one](/en/try/) — no key required for the anonymous path
- [API](/en/api/) — `POST /v1/judge` with a key
