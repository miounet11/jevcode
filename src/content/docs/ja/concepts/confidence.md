---
title: 確からしさ
description: この API の確からしさは独立した一問で、0 から 1 の小数を返します。閾値は間違えたときの代償から自分で決めます。
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## 二つの別の数

この API は、すべての答えの中に確からしさを隠してはいません。欲しい数を自分で問います。

- `noul` の質問は `{ "noul": 0.92 }` を返します。これは「はい」の強さで、別の確信度スコアではありません。
- `confidence` の質問は `{ "noul": 0.78 }` を返します。これはこの判定がどれだけ固いかです。自動実行してよいその質問の隣で聞いてください。
- `choice` の質問は `{ "choice": "billing" }` を返します。送った選択肢のひとつです。

分岐が重要なときは、両方を一緒に聞きます：

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

## いつ自動で動かすか

当サイトに万能の閾値はありません。自動返金を間違えるほうが、ログ一行のタグを間違えるより高くつきます。だから返金の道はより高い数を待ちます。

実践的な始め方：

1. 数が高いときに行う、安全な動作を選ぶ。
2. 数が低いときの引き継ぎ先（人、またはより狭い状態での二回目の呼び出し）を選ぶ。
3. 閾値を固定する前に、[比較](/ja/compare/)か[試用](/ja/try/)で自分のトラフィックを一批読む。

モデルが「自信がない」と言えないなら、お金を動かさせたりデータを消させたりしないでください。`confidence` を一問聞いて、分岐します。

- [状態](/ja/concepts/state/)
- [System One](/ja/concepts/system-one/)
- [API](/ja/api/)
