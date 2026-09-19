---
title: "問題原語の概要"
description: "Choice、Score、Noul の3つの型付き問題について、それぞれが返す値と選択方法"
section: primitives
order: 10
tags: ['primitives', 'choice', 'score', 'noul']
source: docs.typesafe.ai/primitives
translatedFrom: zh
---

## 原語はペアで存在する

TypeSafe の原語（プリミティブ）は、コード内で組み合わせるための小型の型付きコンポーネントです。これらはペアで構成されます：

- **質問（question）**：System One モデルに **state** に対する判断を促す定義。
- **回答（answer）**：モデルが返す型付き値。

コード内でこれらの回答を組み合わせることで意思決定を行います。質問には3つのタイプがあり、それぞれ異なる形状の回答を返します。

| タイプ | 回答内容 | 返却値 |
| :--- | :--- | :--- |
| [Choice](/ja/primitives/choice/) | どの選択肢を選ぶか？ | `choice`, `probabilities`, `confidence` |
| [Score](/ja/primitives/score/) | どの段階に該当するか？ | `score`, `legend`, `probabilities`, `confidence` |
| [Noul](/ja/primitives/noul/) | これは真か？ | `noul`（0 から 1） |

1つの質問だけを投げることも、一度に複数の質問を送信することもできます。各質問は独立して評価されます。

## 原語の選択方法

原語を選択する際の鍵は、ビジネスドメインではなく**意思決定の形態**を見ることです：

- **候補が有限かつ排他的である** → Choice。例：チケット分類、意図の認識、アクションの選択。
- **順序付けられた尺度や質的グラデーションが存在する** → Score。例：関連性、深刻度、満足度。
- **単なるYes/Noの判断が必要であり、曖昧さを許容する** → Noul。例：「このコンテンツは規約違反か」「ユーザーは返金を求めているか」。

よくある誤りは、本来 Choice を使うべき場面で Score を使用することです。段階間に真の順序関係がない場合（例：「請求 / 技術 / 営業」）、Choice を使用してください。無理に Score を使用すると、偽の序数意味論が導入され、後の閾値判断が無意味になります。

逆に、連続したグラデーションが確かに存在する場合は、複数の Noul を組み立てるよりも Score を使用した方が効率的です。Score は一度の呼び出しで完全な分布を返すためです。

## 回答の2つの重要な性質

**各回答は、あなたが提供した選択肢内に制約されます。** モデルが返すのは、あなたが指定した選択肢や段階における確率分布であり、集合外の値を生成することはありません。これは、コード内で生成された自由形式のテキストから値を復元する必要がないことを意味します。これが Jev と「LLM に JSON を出力させてそれを解析する」というアプローチとの最も本質的な違いです。

**各回答は互いに独立しています。** ある質問の回答が、別の質問の隠れたコンテキストになることはありません。この制約により、以下のことが保証されます：

- 質問の評価順序が結果に影響しない；
- 特定のブランチでのみ意味を持つ質問を含め、一度に多数の質問を安全に送信でき、相互の干渉を心配する必要がない；
- 各回答のセマンティクスを個別にテストおよび検証できる。

2つ目の性質から、非常に実用的な帰結が導かれます。**推測的質問（speculative questions）はほぼ無料で実行できる**ということです。例えば、チケット処理のシナリオでは、`bug_severity` はチケットがバグ報告の場合にのみ意味を持ち、`refund_requested` は請求関連の質問の場合にのみ意味を持ちます。しかし、これらをすべてリクエストの先頭に配置しても、速度の低下はありません。モデルはすべての質問を並列に評価し、必要な場合にのみ対応する回答を読み取ります。

## 一度に複数の質問を送信する

```json
{
  "intent": {
    "type": "choice",
    "instructions": "The primary intent of this customer message",
    "criteria": {
      "order_status": "Asking about an existing order",
      "product_question": "Asking about a product before buying",
      "return_exchange": "Wants to return or exchange something",
      "complaint": "Unhappy about an experience"
    }
  },
  "frustration": {
    "type": "score",
    "instructions": "How frustrated the user appears",
    "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
  },
  "refund_requested": {
    "type": "noul",
    "instructions": "The user is explicitly asking for a refund or credit"
  }
}
```

1回の呼び出しで3つの独立した回答が返され、コードは `intent` によって分岐し、既に取得した結果から必要なフィールドを読み取ります。

## 上級者向け

- [原語の上級用法](/ja/primitives/advanced/) — criteria の書き方、表現のテクニック、境界ケースの処理
- [ファンアウトパターン](/ja/patterns/fan-out/) — 大量の質問を1つのリクエストにパックする方法
- [信頼度](/ja/concepts/confidence/) — `confidence` と `probabilities` を使用して動作を制御する
