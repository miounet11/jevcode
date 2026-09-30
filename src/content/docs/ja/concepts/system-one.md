---
title: System One
description: JevCode が書いた System One。clavue-jev は noul、confidence、choice で状態に答えます。
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## JevCode に書いてある

このページは私たちのものです。**このサイト**が実際に提供する呼び出しを説明します。

JevCode は Jev の本拠です。モデルは **clavue-jev** で、私たちはそれを今日世界で最も優れた Jev として出しています。ここでの System One 呼び出しとは、ひとつの状態、いくつかの型付き質問、そして `clavue-jev` と名乗る応答のことです。

## 何をするものか

ソフトウェアが要るのは、型のわかった値です。チャットの返事は、あとから解析しなければならない文字列です。clavue-jev は質問の側に型を持たせるので、答えはすでに小数か、あなたの選択肢のひとつです。

一日中走らせる判定に使ってください。どのキューか、この行は対象内か、この動作を通してよいか。開かれた文章を書く仕事ならテキストモデルに渡し、その文章を実行してよいかを clavue-jev に判定させます。

## この呼び出し

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

`state` は 8 から 4000 文字のテキスト。`questions` は最大六つ。キーは小文字で始めます。choice は `options` でも `criteria` でも送れます。このサーバーはモデルに渡す前に `options` を criteria へ畳みます。

応答には `"model": "clavue-jev"` が含まれます。成功した呼び出しの後、入力トークンで課金されます。出力は無料です。数字は[料金](/ja/pricing/)ページにあります。

## 続けて読む

- [状態](/ja/concepts/state/)
- [確からしさ](/ja/concepts/confidence/)
- [Choice、Noul とその他の原語](/ja/primitives/)
- [API](/ja/api/)
- [ライブ](/ja/scenes/)
