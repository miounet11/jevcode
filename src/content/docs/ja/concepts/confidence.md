---
title: 確からしさ
description: この API の確からしさは独立した質問で、0 から 1 の小数が返ります。閾値は誤りがいくら損かで決めます。
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## 確からしさ

この API は、すべての答えの中に確からしさを隠しません。欲しい数を、質問として聞きます。

- `noul` は `{ "noul": 0.92 }` を返します。「はい」の強さであり、別の確からしさではありません。
- `confidence` は `{ "noul": 0.78 }` を返します。判定がどれだけ確かいかです。自動で動かすなら、本題と並べて聞いてください。
- `choice` は `{ "choice": "billing" }` を返します。送った選択肢の一つです。

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

サイト共通の閾値はありません。自動返金の誤りは、ログ一行のタグ誤りより高くつきます。高いときは安全な動作を行い、低いときは人に渡すか、状態を絞ってもう一度呼びます。閾値を固定する前に、[比較](/ja/compare/)か[試行](/ja/try/)で自分の流量を見てください。

- [状態](/ja/concepts/state/)
- [System One](/ja/concepts/system-one/)
- [API](/ja/api/)
