---
title: "Python SDK"
description: "typesafe-sdkをインストールし、同期または非同期クライアントを使用してSystem One APIを呼び出します。"
section: sdk
order: 20
tags: ['python', 'sdk', 'async']
source: docs.typesafe.ai/sdk/python
translatedFrom: zh
---

## インストール

```bash
# uv を使用する場合
uv add typesafe-sdk

# または pip を使用する場合
pip install typesafe-sdk
```

その後、環境変数を設定します（[console](https://console.typesafe.ai/) でキーを作成）：

```bash
export TYPESAFE_API_KEY="sk-..."
```

クライアントはこの環境変数を自動的に読み取り、デフォルトで `jev-latest` を呼び出します。

## 非同期クライアント（推奨）

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

以下の3点に注意してください：

1. `state` には文字列、辞書、またはリストを直接渡すことができ、SDK がシリアライズを処理します。
2. 3種類の質問は `Noul(...)` / `Choice(...)` / `Score(...)` で構築され、`type` フィールドは SDK によって自動的に設定されます。
3. **レスポンスは質問タイプごとにグループ化されます** —— `response.nouls`、`response.choices`、`response.scores` となり、それぞれ質問名でインデックス付けされます。

## 質問コンストラクタ

| コンストラクタ | パラメータ | 説明 |
| :--- | :--- | :--- |
| `Noul(instructions, criteria=None)` | `criteria` はオプション、`{ true, false }` | 肯定/否定の確率 |
| `Choice(instructions, criteria)` | `criteria` は `{ オプション: 説明または None }` | 固定された選択肢から1つを選択 |
| `Score(instructions, criteria)` | `criteria` は**順序付き配列** | 順序付きの段階でスコアを付与 |

## 同期クライアント

環境によっては非同期処理が適さない場合もあります。その場合は同期バージョンも利用可能です：

```python
from typesafe_sdk import TypeSafeClient, Noul

client = TypeSafeClient()

response = client.system_one(
    state="I was charged twice.",
    questions={"billing": Noul(instructions="Is this about billing?")},
)

print(response.nouls["billing"].noul)
```

## エラーとリトライ

SDK はデフォルトで指数関数的バックオフ戦略でリトライを行い、サーバーから返される `retry-after` ヘッダーを尊重します。これは直接 HTTP API を呼び出すよりもはるかに便利です——レートリミットは動的に調整され、公式には制限値が随时変更される可能性があることが明記されています。

## 関連

- [Python SDK 完全 API リファレンス](https://docs.typesafe.ai/sdk/python/api/clients/async/client)
- [5分で始める](/zh/quickstart/)
- [ファンアウト並列処理](/zh/patterns/fan-out/) — 一度に複数の質問を行う
