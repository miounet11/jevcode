---
title: "選択"
description: "Choice は、固定された選択肢のセットから1つを選択します。回答には、選択された項目、各選択肢の確率、および信頼度が含まれます。"
section: primitives
order: 20
tags: ['choice', 'classification', 'routing']
source: docs.typesafe.ai/primitives/choice
translatedFrom: zh
---

## 使用場面

回答が**固定された排他的な選択肢のセット**に含まれる場合に `Choice` を使用します。例：

- どのチームがこのチケットを処理するか
- 商品がどのカテゴリに属するか
- このコードはどの言語で書かれているか

回答が連続的な尺度上の位置である場合は [Score](/zh/primitives/score/) を、単なる Yes/No の場合は [Noul](/zh/primitives/noul/) を使用します。

典型的な質問の例：

```text
"What programming language is this code written in"
  → options: python, javascript, typescript, go, rust, other

"What type of meeting is this based on the title and description"
  → options: standup, planning, retrospective, one on one, brainstorm, none of the above
```

## パラメータ

| パラメータ | 必須 | 説明 |
| :--- | :--- | :--- |
| `type` | 必須 | `"choice"` でなければならない |
| `instructions` | 必須 | 質問そのもので、判断すべき内容を説明する |
| `criteria` | 必須 | 選択肢の定義。オブジェクト形式 `{ 選択肢名: 説明 }`。説明は `null` でも可 |

`instructions` と `criteria` の各項目は**文字列、オブジェクト、または配列**のいずれかになります。文字列から始め、特定の選択肢に複数のガイダンス（何をカバーするか、何をカバーしないか、例を挙げるなど）が必要な場合は、オブジェクト形式に変更します。

## リクエスト例

部署ごとにカスタマーサポートチケットを分類する：

```python
from typesafe_sdk import Choice, TypeSafeClient

client = TypeSafeClient()

ticket = "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing."

response = client.system_one(
    state=ticket,
    questions={
        "department": Choice(
            instructions="Which team should handle this ticket?",
            criteria={
                "returns": "Refunds, wrong or damaged items",
                "shipping": "Delivery status, delays, lost packages",
                "billing": "Charges, invoices, payment problems",
            },
        ),
    },
)

print(response.answers["department"].choice)
```

## 返値

```json
{
  "model": "jev-latest",
  "answers": {
    "department": {
      "type": "choice",
      "choice": "billing",
      "probabilities": {
        "returns": 0.02,
        "shipping": 0.05,
        "billing": 0.93
      },
      "confidence": 0.91
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

| フィールド | 意味 |
| :--- | :--- |
| `choice` | 選択された選択肢の名前 |
| `probabilities` | 各選択肢上の確率分布 |
| `confidence` | その分布の集中度を要約した値。0 から 1 の範囲 |

`probabilities` は、独自に定義したより有用な指標を作成するための原材料となります。詳細は[信頼度](/zh/concepts/confidence/)をご覧ください。

## 使用上のポイント

**常にフォールバック選択肢を提供してください。** `other` や `none of the above` を追加し、他の選択肢がすべて不適切な場合に、モデルが最もマシな選択肢を強制的に選ぶのではなく、適切な回答を行えるようにします。これにより、エッジケースにおける誤判定が大幅に減少します。

**選択肢の説明は「境界」を明確にしてください。** 説明の価値は、「何を含み、何を含まないか」を明確にすることにあります。上記の例では、`billing` は漠然とした「金銭に関連すること」ではなく、「Charges, invoices, payment problems」と記載されています。

**選択肢名が明確であれば、説明には `null` を直接渡すことができます。** 例えば、感情の3分類 `{ "calm": null, "frustrated": null, "angry": null }` のように、選択肢名自体に曖昧さがなく、余計な説明がノイズをもたらす可能性がある場合です。

**推測的な質問には追加コストがかかりません。** 以下のより複雑な例では、`return_reason` は `department` が `returns` の場合にのみ意味を持ち、`shipping_issue` は `shipping` の場合にのみ意味を持ちます。しかし、これらをすべて同じリクエストに事前に含めても、速度は低下しません。モデルはすべての質問を並列に評価します。このような質問を**推測的質問**（speculative questions）と呼びます。

**階層分類にはチェーン呼び出しを使用してください。** ドキュメントに対して階層的または大規模な分類体系による分類を行う場合は、`Choice` 質問を階層ごとに連鎖させてください。公式の cookbook には、`Choice` の確率上でビームサーチを実行する方法が記載されています。これは、貪欲に1つのパスのみを選択するのではなく、各層で最も良い K 個の候補パスを保持します。

## 関連

- [Score](/zh/primitives/score/) — 順序付き尺度上のスコアリング
- [Noul](/zh/primitives/noul/) — Yes/No の確率
- [意図ルーティングパターン](/zh/patterns/intent-routing/) — Choice の最も一般的なプロダクションでの使用例
- [信頼度](/zh/concepts/confidence/) — `probabilities` と `confidence` を使用して動作を制御する
