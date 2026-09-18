---
title: "構造化された問題"
description: "instructions と criteria はどちらも JSON 構造を受け付けます。System One モデルは構造を理解するように訓練されており、それを活用することで複雑な判断の精度を大幅に向上させることができます。"
section: primitives
order: 90
tags: ['instructions', 'criteria', 'structure']
source: docs.typesafe.ai/primitives/advanced
translatedFrom: zh
---

## 構造はどこで使えるか

以下のフィールドはすべて `string`、`object`、`array`、または `null` を受け付けます：

| フィールド | 適用先 |
| :--- | :--- |
| `instructions` | Choice、Score、Noul |
| `criteria` の値（Choice の選択肢の説明） | Choice |
| `criteria` のエントリ（Score の階級の説明） | Score |
| `criteria.true` / `criteria.false` | Noul |

**System One モデルは構造を理解するように訓練されています。** これは回避すべき制限ではなく、積極的に活用すべき能力です。

## 構造化記法を使うべきタイミング

- **明確さが向上する場合。** 1つの問題に複数の部分が含まれている場合、JSON を使用して各部分を名前付きキーに格納することで、テンプレート文字列に連結するよりも可読性が大幅に向上します。
- **問題がデータを必要とする場合。** スキーマ、分類体系、データベース行は本来 JSON です。モデルに渡す前に文字列にシリアライズするのではなく、全体、または関連するサブフィールドのみを渡します。

## 構造化された instructions：再利用可能なフィールド記述

一般的なパターンとして、**チェック対象のフィールド**を `field` オブジェクトで記述し、複数の問題がキーを通じてそれを参照します。

以下に、請求書の検証例を示します。`state` は請求書のテキストです：

```text
Invoice #4471 issued March 3, 2026 to Beaver Dam Logistics for $12,840.00, net 30.
```

そして、**同じ `field` の形状**が、数値を検証する Noul、候補から値を選択する Choice、値を尺度に割り当てる 2つの Score という、4種類の異なる判断を駆動します：

```json
{
  "questions": {
    "invoice_number_is_correct": {
      "type": "noul",
      "instructions": {
        "field": {
          "name": "invoice_number",
          "type": "string",
          "description": "The identifier printed on the invoice."
        },
        "extracted_value": "4471",
        "question": "Does `extracted_value` match the `field` as it appears in `source_text`?"
      }
    },
    "customer_name": {
      "type": "choice",
      "instructions": {
        "field": {
          "name": "customer_name",
          "type": "string",
          "description": "The organization the invoice was issued to."
        },
        "question": "Which option is the value of `field` in `source_text`?"
      },
      "criteria": {
        "Beaver Logistics": null,
        "Dam Logistics": null,
        "Beaver Dam Logistics": null,
        "Beaver": null,
        "Dam": null
      }
    },
    "payment_terms": {
      "type": "score",
      "instructions": {
        "field": {
          "name": "payment_terms",
          "type": "integer",
          "unit": "days",
          "description": "Days allowed for payment, from terms such as \"net 30\"."
        },
        "question": "How many days does the `field` in `source_text` allow for payment?"
      },
      "criteria": ["Due on receipt", "Net 15", "Net 30", "Net 60", "Net 90 or longer"]
    }
  }
}
```

この例の価値は、**構造の再利用性**を示している点にあります。`field` 内で名前、型、単位、説明を宣言し、各問題では「どのような判断を行うか」のみを記述すればよいです。構造化抽出のシナリオでは、これは各問題に対して独立した自然言語のプロンプトを書くよりもはるかに安定しています。なぜなら、フィールドのセマンティクスは1回だけ定義されるからです。

`customer_name` の Choice も注目すべき点です。選択肢は**紛らわしい近似文字列**（Beaver Logistics / Dam Logistics / Beaver Dam Logistics / Beaver / Dam）のセットです。このような「類似した候補の中から正しいものを選ぶ」ことは Choice の典型的な強みであり、Noul で個別に判断させるよりも、はるかに高速で一貫性があります。

## 構造化された Score の階級

Score の `criteria` 配列の各要素はオブジェクトにでき、階級に追加情報（数値範囲、例など）を付与できます。

## 構造化された Noul の criteria

Noul の `criteria` はオプションです。はい/いいえの境界が微妙な場合、構造化された `true` と `false` の記述により、両側に定義と例を提供して境界を明確に定めることができます。

## 階層分類：チェーンされた Choice

深い分類体系で分類を行う場合、1つの問題の選択肢に分類ツリー全体を一度に渡すのではなく、**Choice を逐次的にチェーンして呼び出します**。

手順は以下の通りです。1層目でトップレベルの部門を問い、選択肢として各部門を指定し、値としてその部門の**サブツリー**の構造を返します。`probabilities` を確認して、分岐が十分に近いかどうかを判断します。近い場合は、両方のブランチを検索します。

ある部門が選択されると、次の層ではその部門の子ノードを選択肢とし、それらのサブツリーを値として使用し、葉ノードに到達するまでこれを繰り返します。コードでは、これはネストされた辞書に対する1回のループで実現でき、各問題の `criteria` が現在のノードとなります。

公式には、Hierarchical Classification cookbook が用意されており、確率が近い場合にビームサーチを使用して複数の候補パスを保持する戦略など、同様のツリートラバーサルが示されています。

> **ヒント**：サブツリーは大きくなる可能性があります。あるブランチが大きすぎる場合は、値を直接の子ノードと少量の葉ノードのサンプルに切り詰めます。

## 関連

- [Choice](/zh/primitives/choice/) / [Score](/zh/primitives/score/) / [Noul](/zh/primitives/noul/)
- [ファンアウトパターン](/zh/patterns/fan-out/) — 大量の問題を1つのリクエストにパックする
- [System One システムの構築方法](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — 公式の完全なワークフロー
