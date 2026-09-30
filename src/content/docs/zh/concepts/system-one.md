---
title: System One
description: JevCode 自己写的 System One。clavue-jev 用类型化问题回答一段状态：noul、confidence、choice。
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## 写在 JevCode 上

这一页是我们自己的。它描述的是**本站实际提供**的那次调用。

JevCode 是 Jev 的主场。模型是 **clavue-jev**，我们把它作为今天世界上最好的 Jev。在这里，一次 System One 调用就是：一段状态、几道类型化问题，以及一份标明 `clavue-jev` 的响应。

## 它干什么

程序要的是已知类型的值。聊天回复是一段还得再解析的字符串。clavue-jev 让问题自己带上类型，答案直接是小数，或是你的选项之一。

用它做你每天都在跑的判定：进哪个队列、这句话算不算数、这个动作放不放行。事情如果是敞开来写一段文字，交给文本模型，再用 clavue-jev 决定这段文字能不能拿去执行。

## 这次调用

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

`state` 是文本，8 到 4000 个字符。`questions` 最多六个。键名以小写字母开头。选择题可以传 `options`，也可以传 `criteria`。本站会先把 `options` 收成 criteria，再送给模型。

响应里有 `"model": "clavue-jev"`。调用成功后按输入 token 计费，输出免费。数字在[价格](/zh/pricing/)页。

## 接着看

- [状态](/zh/concepts/state/)
- [把握](/zh/concepts/confidence/)
- [Choice、Noul 和其余原语](/zh/primitives/)
- [API](/zh/api/)
- [现场](/zh/scenes/)
