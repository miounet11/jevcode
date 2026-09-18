---
title: "Noul"
description: "Noul はモデルに Yes/No の質問を評価させ、「Yes」の回答の確率を返します。この値は 0 から 1 の範囲の数値であり、個別の confidence は伴いません。"
section: primitives
order: 40
tags: ['noul', 'verification', 'guardrails']
source: docs.typesafe.ai/primitives/noul
translatedFrom: zh
---

## 使用場面

答えが**「はい」または「いいえ」**である場合、Noul を使用します。例：

- このメッセージは返金を求めていますか？
- この履歴書には分散システムに関する経験が記載されていますか？
- このコメントには個人識別情報（PII）が含まれていますか？

答えが選択肢のいずれかである場合は [Choice](/zh/primitives/choice/) を、特定の尺度上の位置である場合は [Score](/zh/primitives/score/) を使用します。

典型的な質問の例：

```text
"Is the customer requesting a refund?"
"Does this resume mention experience with distributed systems?"
"Does the message contain personally identifiable information?"
"Does the room have a minifridge?"
```

## パラメータ

| フィールド | 必須 | 説明 |
| :--- | :--- | :--- |
| `type` | はい | `"noul"` でなければなりません |
| `instructions` | はい | 評価対象の「はい/いいえ」の質問またはステートメント |
| `criteria` | いいえ | オプションの `{ true, false }` の記述。「はい」と「いいえ」がそれぞれ何を意味するかを明確にするためのもの |

`criteria` はオプションです。`instructions` はほとんどの Noul 質問で十分です。「はい」と「いいえ」の境界が微妙な場合にのみ、2つの結果の意味を明確にするために使用します。**両方の書き方を試して、どちらがあなたのデータでより良い結果をもたらすかを確認することをお勧めします。**

## リクエスト例

```python
from typesafe_sdk import Noul, TypeSafeClient

client = TypeSafeClient()

response = client.system_one(
    state=ticket_conversation,
    questions={
        "is_human_escalation": Noul(
            instructions="Is the customer asking to speak to a human?",
        ),
        "is_repeat_contact": Noul(
            instructions="Has this customer contacted us about this issue before?",
        ),
    },
)

print(response.nouls["is_human_escalation"].noul)
```

## 戻り値

```json
{
  "model": "jev-latest",
  "answers": {
    "is_human_escalation": {
      "type": "noul",
      "noul": 0.99
    },
    "is_repeat_contact": {
      "type": "noul",
      "noul": 0.93
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

`noul` の値は 0 から 1 の範囲で、答えが**「はい」**である確率を示します。コード内で明確な判断（ブーリアン値への変換）が必要な場合、通常はしきい値を用いてブール値に変換します。

## Noul は個別の confidence を返しません

これは Noul と他の2つのプリミティブとの重要な違いです：**Noul 自体が確率**であるため、追加の `confidence` フィールドはありません。

- 1 に近い値：強い「はい」
- 0 に近い値：強い「いいえ」
- 0.5 に近い値：「はい」と「いいえ」の確率がほぼ同程度

## 表現がすべてを決定する

**高い確率が「はい」に対応するようにしてください。** 公式の推奨事項は、戻り値の意味に曖昧さが生じないように、質問を以下のように記述することです。「Is this not urgent?」（これは緊急ではありませんか？）と記述すると、0.9 は「緊急ではない」を意味し、コードを読む人が誤解しやすいです。「Is this urgent?」（これは緊急ですか？）と記述すれば、0.9 は「緊急」を意味します。

**明確な判断基準を定義してください。** 「Is the candidate strong in Python?」（候補者は Python で強力なスキルを持っていますか？）を例にとると、「強力」とは何を指すのかを事前に定義する必要があります。定義が不明確だと、確率の解釈が困難になります。

**0.5 は「中程度」を意味しません。** これは最も一般的な誤用です。0.5 は、モデルが「はい」と「いいえ」を区別できないことを示しており、「半分の中程度」を意味するものではありません。スキルの深さを測定する場合は、[Score](/zh/primitives/score/) を使用して、定義された段階でスコアリングを行う必要があります。

**指示を真偽を評価すべき陈述文として記述することもできます。** 疑問文だけでなく、指示を陈述文として記述し、モデルにその真偽を評価させることもできます。例えば、「顧客が返金を求めている」という事象について、陈述文として記述した場合、1 に近い値はその陈述が真であることを示します。**両方の表現方法は、独自のデータで試す価値があります。**

## 関連情報

- [Choice](/zh/primitives/choice/) — 順序のない固定された選択肢
- [Score](/zh/primitives/score/) — 順序のある尺度でのスコアリング
- [信頼度](/zh/concepts/confidence/) — Noul に confidence がない理由
- [ガードレールにおける Noul の適用](https://docs.typesafe.ai/patterns) — 公式パターンライブラリ
