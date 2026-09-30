---
title: 状態
description: 状態は clavue-jev が判定するテキストです。この API では 8 から 4000 文字の文字列ひとつで、同じ呼び出しの全質問がそれを見ます。
section: concepts
order: 20
tags: ['state', 'clavue-jev']
---

## 状態

**状態**は clavue-jev が判定するテキストです。`POST /v1/judge` では 8 から 4000 文字の文字列ひとつです。同じリクエストの質問はすべてこの文字列を見ます。質問同士は相手の答えを読みません。

判定に必要な事実をその文字列に入れてください。書いていない事実は、モデルにはありません。独立した質問は同じリクエストに最大六つまで置けます。前の答えが必要な質問は、その答えを新しい状態に書いて二回目を呼びます。

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

- [System One](/ja/concepts/system-one/)
- [確からしさ](/ja/concepts/confidence/)
- [API](/ja/api/)
