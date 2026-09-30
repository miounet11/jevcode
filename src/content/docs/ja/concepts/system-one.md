---
title: System One
description: JevCode が書いた System One。clavue-jev は noul、confidence、choice で状態に答えます。
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## System One

このページは JevCode のものです。ここに書いてあるのは、**このサイトが実際に受ける呼び出し**です。モデルは **clavue-jev**。私たちはそれを今日世界で最も優れた Jev として出しています。

プログラムが要るのは、型のわかった値です。チャットの返事は、あとから解析する文字列です。clavue-jev は質問の側に型を持たせ、答えを小数か、あなたの選択肢の一つにします。一日に何度も行う判定に使ってください。自由な文章を書く仕事はテキストモデルに渡し、その文章を実行してよいかを clavue-jev に判定させます。

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

`state` は 8 から 4000 文字。`questions` は最大六つ。`options` はモデルに渡す前に `criteria` へ畳まれます。応答の `model` は `clavue-jev` です。成功した呼び出しだけが入力トークンで課金され、出力は無料です。 [料金](/ja/pricing/).

- [状態](/ja/concepts/state/)
- [確からしさ](/ja/concepts/confidence/)
- [プリミティブ](/ja/primitives/)
- [API](/ja/api/)
- [現場](/ja/scenes/)
