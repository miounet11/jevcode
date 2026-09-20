---
title: "HTTP APIリファレンス"
description: "TypeSafeの評価エンドポイントを直接呼び出す — リクエストの形状、noul/choice/scoreの質問タイプ、レスポンスの形状、およびエラーハンドリング。"
section: sdk
order: 50
tags: ['api', 'http', 'reference']
source: docs.typesafe.ai/api
translatedFrom: en
---
## エンドポイント

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

`state`にTyped `questions`のマップを送信し、質問ごとに1つの`answer`を受け取ります。

## リクエストボディ

```json
{
  "state": "Help! My payouts have been failing for 3 days.",
  "model": "jev-latest",
  "questions": {
    "is_urgent": {
      "type": "noul",
      "instructions": "Does this convey urgency?"
    }
  }
}
```

| フィールド | 型 | 必須 | 説明 |
| :--- | :--- | :--- | :--- |
| `state` | string \| object \| array | はい | 評価対象のコンテンツ。テキストの場合はプレーンな文字列、チャットログ、レコード、またはアプリケーションの現在の状態などの構造化データの場合はその形式 |
| `model` | string | はい | リクエストを処理するモデル。`jev-latest`を使用してください。これは TypeSafe の主力モデルです。他のモデルやエイリアスについては公式の Models ページを参照してください |
| `questions` | map&lt;string, Question&gt; | はい | 型付き質問のマップ |

`questions`でキーを選択すると、各回答は**同じキー**の下で返されます。このキーは基盤モデルには送信されず、推論にも使用されないため、ビジネスドメインに合わせて命名できます（`department`、`is_urgent`）。

## 3つの質問タイプ

A `Question`は`type`フィールドによって区別され、3種類あります。これら3つはすべて`type`と`instructions`を共有し、それぞれが独自の`criteria`を追加します。

`instructions` の型は `string | object | array` です。

### noul — はい/いいえの判断

はい/いいえの質問。**回答が「はい」である確率を返します。**

```json
{
  "is_urgent": {
    "type": "noul",
    "instructions": "Does this convey urgency?",
    "criteria": {
      "true": "Explicitly time-sensitive",
      "false": "No urgency expressed"
    }
  }
}
```

`criteria`は省略可能で、「yes」と「no」の意味を説明します：

| Key | 説明 |
| :--- | :--- |
| `true` | 1に近づく値（「はい」）が意味すること |
| `false` | 0に近づく値（「いいえ」）が意味すること |

### choice — オプションから選択

定義したセットから1つのオプションを選択し、選択されたオプション **および確率分布全体** を返します。

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this?",
    "criteria": {
      "billing": "Payments, invoicing, refunds",
      "technical": "Bugs, outages, integrations",
      "sales": "Pricing, upgrades, new accounts"
    }
  }
}
```

`criteria`は必須で、型は`map⦇0⦈`です：オプション名がルールの説明にマッピングされています。オプションに追加の説明が不要な場合は、`null`を値として使用してください。

### スコア — 尺度に沿った評価

定義したルーブリックに沿って`state`を評価し、各レベルに確率重みを付けた値を返してください。

```json
{
  "frustration": {
    "type": "score",
    "instructions": "How frustrated is the customer?",
    "criteria": ["Calm", "Frustrated", "Very angry"]
  }
}
```

`criteria`は必須であり、レベルの説明からなる**順序付き配列**です。少なくとも2つのレベルを含める必要があります。

## 応答ボディ

各質問は、あなたが指定した id をキーとして、1つの回答を生成します。

```json
{
  "model": "jev-latest",
  "answers": {
    "is_urgent": {
      "type": "noul",
      "noul": 0.92
    }
  },
  "usage": { "input_tokens": 312, "output_tokens": 48 }
}
```

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `model` | string | 評価を実行したモデル |
| `answers` | map&lt;string, Answer&gt; | 各質問に対する回答。`questions`と同じキーで構成 |
| `usage` | object | リクエストのトークン使用量: `input_tokens`, `output_tokens` |

### 種類別の回答形状

すべての回答には、その質問に一致する`type`が伴います。`choice`および`score`の回答には、さらに`confidence`（0から1の間）も伴います。これは、その回答の確率分布から導き出された値です（公式のConfidenceページを参照）。

**noul answer**

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `noul` | number | 0（いいえ）から1（はい）までのyes/noの回答 |

```json
{ "type": "noul", "noul": 0.92 }
```

**選択回答**

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `choice` | string | 最も確率の高いオプション |
| `probabilities` | map&lt;string, number&gt; | オプションごとの確率；合計は1 |
| `confidence` | number | モデルの確信度。確率から導出 |

```json
{
  "type": "choice",
  "choice": "technical",
  "probabilities": { "billing": 0.08, "technical": 0.85, "sales": 0.07 },
  "confidence": 0.82
}
```

**スコア回答**

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `score` | number | 確率加重値。**レベル間にまたがる値になり得る** |
| `legend` | map&lt;string, string&gt; | 各レベルインデックスをその説明にマッピング |
| `probabilities` | map&lt;string, number&gt; | レベルごとの確率（文字列キー）；合計は1 |
| `confidence` | number | 確率から導出された、モデルの確信度 |

```json
{
  "type": "score",
  "score": 1.6,
  "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
  "probabilities": { "0": 0.05, "1": 0.3, "2": 0.65 },
  "confidence": 0.78
}
```

`score`が`probabilities`とどのように関連しているかに注目してください：3つのレベルの確率は0.05 / 0.3 / 0.65であり、`score`に1.6の重み付けをしています。したがって、`score`は整数である必要はありません。これが`choice`と明確に異なる点です。`choice`は1つの離散オプションを提供しますが、`score`は「2つのレベルの中間」を表現できます。

## エラー

エラーは標準のHTTPステータスコードを使用し、何が悪かったかを説明するJSONボディを含みます。

| ステータス | 意味 |
| :--- | :--- |
| `401 Unauthorized` | APIキーが不足しているか、無効です。`Authorization`ヘッダーを確認してください |
| `422 Unprocessable Entity` | リクエストボディの検証に失敗しました。例えば、必須フィールドが欠落しているか、質問の形式が正しくない場合などです。ボディには問題のあるフィールドが示されています |
| `429 Too Many Requests` | レート制限を超過しました。短い遅延後に再試行してください |
| `529 Overloaded` | TypeSafeが一時的に過負荷状態です。短い遅延後に再試行してください |

### レート制限の処理

`429`または`529`の場合、即座に再試行するのではなく、**指数バックオフを用いて再試行**してください。公式SDKを使用している場合、そのデフォルトの再試行ポリシーがこれを自動的に処理するため、追加のコードは不要です。