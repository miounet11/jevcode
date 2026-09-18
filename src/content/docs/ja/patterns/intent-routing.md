---
title: "意図ルーティング"
description: "分類されたリクエストを、最も適切な処理ユニット（決定論的ロジック、専用LLM、または人間）にルーティングします。"
section: patterns
order: 20
tags: ['routing', 'classification', 'cost']
source: docs.typesafe.ai/patterns/intent-routing
translatedFrom: zh
---

## このパターンが解決する問題

すべてのユーザーリクエストに同じプロセッサが必要というわけではありません。データベースのクエリ1回で回答できるものもあれば、ドメインコンテキスト付きのLLMを必要とするもの、さらに手動処理を必須とするものもあります。

TypeSafe はこれらのプロセッサの**前面**に配置され、高速で低コストな分類器として機能し、どのプロセッサを呼び出すべきかを決定します。

**コストの核心**：すべてのメッセージを高価なLLMに送ってリクエストの種類を判断するのではなく、まず分類してからタイプごとにルーティングすることです。

## 例：カスタマーサポートのルーティング

カスタマーメッセージが入力された後、適切なプロセッサにルーティングする必要があるカスタマーサポートシステムを想定します。

### ステップ1：意図と複雑さの分類

1つのリクエストで、意図、複雑さ、およびいくつかの補助的な判断を同時に問い合せます。

```json
{
  "questions": {
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
    "bug_severity": {
      "type": "score",
      "instructions": "How severe is the reported issue",
      "criteria": [
        "Cosmetic; no impact to functionality",
        "Broken or degraded feature; workaround exists",
        "Blocking issue; no workaround exists"
      ]
    },
    "has_reproducible_steps": {
      "type": "noul",
      "instructions": "The user describes specific steps to reproduce the issue"
    },
    "refund_requested": {
      "type": "noul",
      "instructions": "The user is explicitly asking for a refund or credit"
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated the user appears",
      "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
    }
  }
}
```

### ステップ2：分類結果に基づくルーティング

```python
intent = response.answers["intent"]

if intent.choice == "order_status":
    # 決定論的なロジックで十分：データベースを検索
    lookup_order_status(state["order_id"])

elif intent.choice == "product_question":
    # ドメインコンテキストが必要：ナレッジベース付きのLLMに委譲
    answer_with_catalog_llm(state)

elif intent.choice == "return_exchange":
    start_return_flow(state["order_id"])

elif intent.choice == "complaint":
    # 高リスク：人間のエージェントに転送
    route_to_human_agent(state)
```

## なぜ先に分類するとコスト削減になるか

鍵は、**高価な処理を本当に必要なリクエストに留めること**です。

カスタマーメッセージの70%が `order_status` のように、データベースクエリ1回で解決できるものであると仮定します。すべてのメッセージをまず大規模言語モデルに送ると、本来不要だった70%のリクエストに対しても大規模言語モデルのコストを支払うことになります。まず低コストの Choice 分類を行い、このトラフィックを振り分けることでコストを削減できます。

ここで活用されているのは[扇出パターン](/zh/patterns/fan-out/)です。分類、深刻度、返金要求の有無、感情などの判断を一度に問い合せます。追加の問い合せは速度のコストを生みません。

## デザインのポイント

**分類出力は直接使用可能であること。** `intent.choice` の値は、文字列処理を行わずにルーティングテーブルのキーとして直接使用できるべきです。

**分類の粒度がシステムの複雑さを決定します。** カテゴリが少なすぎると、ルーティングに区別がつきません。カテゴリが多すぎると、各カテゴリのサンプル数が減少し、精度が低下します。4〜6つのカテゴリから始めます。

**推測的な判断を一緒に送信する。** 上記の例では、`bug_severity` と `has_reproducible_steps` は特定の意図でのみ意味を持ち、`refund_requested` は返金シナリオでのみ意味を持ちます。これらをすべて前置きして送信しても、コストはほぼゼロです。これが[扇出並列](/zh/patterns/fan-out/)の価値です。

**信頼度と組み合わせて二次ゲートを行う。** `intent.confidence` が低い場合、分類自体が信頼できないことを意味します。この場合、盲目的にルーティングするのではなく、人間に転送するか、明確化を求めます。詳細は[信頼度ルーティング](/zh/patterns/confidence-routing/)をご覧ください。

**フォールバックカテゴリを保持する。** 分類に `other` などのオプションを追加し、どのプロセッサタイプにも一致しないリクエストが、最も近いカテゴリに無理やり押し込まれるのではなく、適切な場所へ行くようにします。

## 関連

- [Choice](/zh/primitives/choice/) — このパターンの基本プリミティブ
- [扇出並列](/zh/patterns/fan-out/) — すべての補助判断を一度に問い出す
- [信頼度ルーティング](/zh/patterns/confidence-routing/) — 分類が信頼できない場合の対応
- [複合スコアリング](/zh/patterns/composite-scoring/) — 並べ替えが必要な場合の補完パターン
