---
title: "5分でマスター"
description: "API キーを取得し、cURL または SDK を使用して最初の Jev 呼び出しを完了し、レスポンスの構造を理解します。"
section: start
order: 20
tags: ['quickstart', 'api', 'sdk']
source: docs.typesafe.ai/introduction/quickstart
translatedFrom: zh
---

## ステップ 1: Playground で試す

[Playground](https://console.typesafe.ai/playground) にアクセスしてログインし、任意のテキストを **state** として貼り付けます：

```text
Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing.
I'm losing sales. Please help ASAP.
```

次に、Noul 質問を追加します：

```json
{
  "urgency": {
    "type": "noul",
    "instructions": "Does this message express urgency?"
  }
}
```

すると、0 から 1 の間の数値がすぐに返されます。1 に近い値は、モデルが回答を「Yes（はい）」と判断したことを示します。

Playground の価値は**迅速な試行錯誤**にあります。Noul、Choice、Score の 3 種類の質問を混合し、1 回の呼び出しですべての結果を確認することで、質問の表現が期待どおりかどうかを確認できます。

## ステップ 2: API key を取得する

[ダッシュボード](https://console.typesafe.ai/settings/keys) で key を作成し、環境変数を設定します：

```bash
export TYPESAFE_API_KEY="sk-..."
```

## ステップ 3: API を呼び出す

すべてのモデルは同じエンドポイントによって提供されます：

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

最小限の実行可能な cURL サンプル：

```bash
curl -X POST https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": "Hi, I have been trying to connect my Stripe account for 3 days and it keeps failing. I am losing sales. Please help ASAP.",
    "questions": {
      "department": {
        "type": "choice",
        "instructions": "Which team should handle this",
        "criteria": {
          "billing": "Payment or subscription issues",
          "technical": "Bugs or integration problems",
          "sales": "Pricing or account questions"
        }
      },
      "frustration": {
        "type": "score",
        "instructions": "How frustrated the customer appears",
        "criteria": [
          "Calm, just stating facts",
          "Frustrated but civil",
          "Very angry, strong language"
        ]
      },
      "is_urgent": {
        "type": "noul",
        "instructions": "The message conveys urgency"
      }
    }
  }'
```

## ステップ 4: SDK を使用する（推奨）

SDK はデフォルトで環境変数から `TYPESAFE_API_KEY` を読み取り、`jev-latest` を呼び出します。

### Python

```bash
pip install typesafe-sdk     # または uv add typesafe-sdk
```

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state={"document": "I was charged twice. Please fix this ASAP."},
            questions={
                "billing": Noul(instructions="Is this ticket about billing?"),
                "tone": Choice(
                    instructions="What is the customer's tone?",
                    criteria={"calm": None, "frustrated": None, "angry": None},
                ),
                "urgency": Score(
                    instructions="How urgent is this ticket?",
                    criteria=["can wait", "this week", "today"],
                ),
            },
        )

    print(response.nouls["billing"].noul)
    print(response.choices["tone"].choice)
    print(response.scores["urgency"].score)
```

### TypeScript / JavaScript

```bash
npm install @typesafe-ai/sdk    # Node.js 20 以上が必要
```

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

TS SDK の大きな利点は、**回答の型が質問から自動的に推論される**ことです。渡された `questions` が戻り値の型を決定するため、フィールド名の誤りはコンパイル時に検出されます。

## 戻り値の形式

各回答の型は、質問の `type` によって決定されます：

| 型 | 戻りフィールド | 意味 |
| :--- | :--- | :--- |
| `choice` | `choice` / `probabilities` / `confidence` | 選択されたオプション、各オプションの確率分布、信頼度 |
| `score` | `score` / `legend` / `probabilities` / `confidence` | スコアの位置（2つのレベルの間でも可）、レベルの説明、確率分布、信頼度 |
| `noul` | `noul` | 回答が「Yes（はい）」である確率。`confidence` は含まれません |

重要な制約：**回答は常に指定されたオプション内に収まります**。モデルは定義されたオプション上の確率分布を返すため、セット外の値は生成されません。そのため、コード内でセマンティクスを復元するためのパーサーを書く必要はありません。

## よくある落とし穴

- **state 内の `state` は1回だけ読み取られる**：モデルはまず state を1回読み取り、その後すべての質問を並列で評価します。そのため、複数の質問を1つのリクエストに早めにまとめておけば、追加の遅延コストはほとんどありません。
- **テキスト以外の入力は事前に変換する**：画像、音声、動画は、state として渡す前にテキストまたは構造化フィールドに変換する必要があります。
- **制限超過で 429 が返される**：公式 SDK はデフォルトで指数関数的バックオフによる再試行を行い、`retry-after` ヘッダーを尊重します。HTTP API を直接呼び出す場合は、これを自分で実装する必要があります。

## 次のステップ

- [Choice 原語](/zh/primitives/choice/) — 分類とルーティングの基礎
- [Score 原語](/zh/primitives/score/) — スコアリングとソート
- [Noul 原語](/zh/primitives/noul/) — 検証とガードレール
- [信頼度](/zh/concepts/confidence/) — 信頼度を使用してシステム動作を制御する
