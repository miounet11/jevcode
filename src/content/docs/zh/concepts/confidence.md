---
title: 把握
description: 本站接口里的把握是单独一题，返回 0 到 1 的小数。阈值按做错的代价自己定。
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## 两个不同的数

本站接口不会在每个答案里再藏一个把握。你要哪个数，就单独问一题。

- `noul` 返回 `{ "noul": 0.92 }`。这是「是」的程度，不是另一份把握分。
- `confidence` 返回 `{ "noul": 0.78 }`。这是这次判定有多稳。要拿来决定是否自动执行时，跟那道正题一起问。
- `choice` 返回 `{ "choice": "billing" }`，是你送出的选项之一。

分支重要时，两题一起问：

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

## 什么时候自动做

本站没有一个放之四海的阈值。自动退款判错，比给一行日志打错标签贵，所以退款那条路要等更高的数。

可以这样起手：

1. 数高的时候，做那个即使做错也还安全的动作。
2. 数低的时候，转给人，或者带着更紧的状态再调一次。
3. 先在[对比](/zh/compare/)或[试用](/zh/try/)上看一批你自己的流量，再把阈值定死。

模型如果不能表示自己没把握，就不要让它动钱或删数据。问一题 `confidence`，然后分支。

- [状态](/zh/concepts/state/)
- [System One](/zh/concepts/system-one/)
- [API](/zh/api/)
