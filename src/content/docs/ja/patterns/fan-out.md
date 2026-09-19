---
title: "扇出並列"
description: "1回の呼び出しで大量の問題（推測的なものを含む）を送信し、コードが関連するものを決定する。"
section: patterns
order: 50
tags: ['fan-out', 'latency', 'cost']
source: docs.typesafe.ai/patterns/fan-out
translatedFrom: zh
---

## このパターンが解決する課題

従来のアプローチは、「まず分類し、その結果に基づいて次に何を質問するかを決定する」ものです。これには直列呼び出しが必要です：最初の呼び出しで結果が返ってきて初めて、2番目の呼び出しで何を質問すべきかがわかります。これにより遅延が積み重なります。

扇出（Fan-out）並列処理はこれとは逆のアプローチです：**必要になり得るすべての質問を一度に送信し**、分類結果に基づいてどの回答を無視するかをコード側で決定します。モデルはステートを1回だけ読み取り、すべての質問を並列で評価するため、複数の質問を追加しても边际コスト（追加コスト）は極めて低くなります。

## 重要なメカニズム

扇出パターンが成立する基盤となる3つの事実があります：

1. モデルは**ステートを1回だけ読み取り**、その後すべての質問を並列で評価します。
2. **各回答は相互に独立しています** —— ある質問の回答が、別の質問の暗黙的なコンテキストになることはありません。
3. コンテキスト予算は 64k トークン（ステート + すべての質問）または 32k トークン（ステート + 最長の単一質問）です。

特に2番目の事実が重要です：これにより、無関係な質問を一緒に送信しても、関連する質問の回答が汚染されることはありません。

## 例：サポートチケットの振り分け

カスタマーサポートのチケットを処理する必要がありますが、異なる種類のチケットには全く異なる判断が必要です。まず分類してから追跡するのではなく、一度にすべてを質問します。

### ステップ1：1回のリクエストですべての判断を質問する

```json
{
  "questions": {
    "category": {
      "type": "choice",
      "instructions": "What kind of request is this?",
      "criteria": {
        "bug_report": "Reporting something broken",
        "billing": "Payment, invoice, or refund matters",
        "feature_request": "Asking for new functionality"
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

ここで `bug_severity` と `has_reproducible_steps` は、チケットがバグレポートの場合にのみ意味を持ちます。`refund_requested` は、請求関連の問題の場合にのみ意味を持ちます。**これらは推測的な質問**ですが、複数の質問を追加しても速度のコストは発生しないため、すべてを事前に送信します。

### ステップ2：コードによるルーティング

```python
category = response.answers["category"]
bug_severity = response.answers["bug_severity"]
bug_repro = response.answers["has_reproducible_steps"]
refund = response.answers["refund_requested"]
frustration = response.answers["frustration"]

if category.choice == "bug_report":
    if bug_severity.score > 1.5 and bug_repro.noul > 0.6:
        escalate_to_engineering(ticket_id, severity="high")
    else:
        add_to_bug_backlog(ticket_id)

elif category.choice == "billing":
    if refund.noul > 0.7:
        route_to_billing_with_flag(ticket_id, refund_likely=True)
    else:
        route_to_billing(ticket_id)

elif category.choice == "feature_request":
    log_feature_request(ticket_id)

# カテゴリに関係なく、frustration は常に有用です
if frustration.score > 1.5:
    flag_for_priority_response(ticket_id)
```

**完全な意思決定ツリーに必要なすべての情報は、1回の呼び出しから得られます。** 無関係な文脈では推測的な質問は無視され、関連する文脈では1往復分の時間を節約できます。

## デザインのポイント

**まずすべてを質問し、その後でフィルタリングします。** 「どの質問が価値があるか」という判断を、呼び出し前ではなく呼び出し後に遅らせます。呼び出し前では分類結果が不明なため、どの質問が適切か判断できません。呼び出し後には回答が得られるため、フィルタリングは通常の分岐処理になります。

**コンテキスト予算に注意してください。** 64k は、ステートに**すべての**質問を加えた合計です。もし数百の質問を扇出する場合（例：一連のドキュメントに対して個別にスコアリングする場合）、ステートがすぐに膨張します。そのような場合は、リクエストを分割するか、[Score のバッチ処理](https://docs.typesafe.ai/patterns)を検討してください。

**「推測的」と「冗長」を区別してください。** 推測的な質問とは、**他のブランチでも明確な意味を持つ**質問のことです。もしある質問の回答が、どのブランチでも読まない場合は、それは推測的ではなく「無駄」です——コストは低いものの、コードを混乱させます。

**信頼度と組み合わせて使用してください。** 扇出は「何を質問するか」を解決し、信頼度ルーティングは「どの程度信じるか」を解決します。これらを組み合わせた形態は、本番環境のシステムで一般的です。音声銀行の例については、[信頼度ルーティング](/ja/patterns/confidence-routing/)を参照してください。

## 関連情報

- [質問プリミティブ](/ja/primitives/) — 独立性と推測的質問
- [State](/ja/concepts/state/) — コンテキスト予算とステートの構成
- [信頼度ルーティング](/ja/patterns/confidence-routing/) — 2つ目の意思決定軸
