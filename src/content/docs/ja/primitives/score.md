---
title: "スコア"
description: "スコアは、順序付けられた記述的な段階に基づいてコンテンツに点数を付けます。回答には点数、各段階の確率、および信頼度が含まれ、点数は2つの段階の間にも位置することができます。"
section: primitives
order: 30
tags: ['score', 'ranking', 'rating']
source: docs.typesafe.ai/primitives/score
translatedFrom: zh
---

## 使用場面

回答が**複数の段階で記述可能な連続的な尺度**上に位置する場合は、`Score` を使用します。例：

- バグの深刻度
- 顧客の満足度
- 候補者の Python 経験の深さ

回答が順序関係のない固定された選択肢のセットである場合は [Choice](/ja/primitives/choice/) を使用し、単なる Yes/No の場合は [Noul](/ja/primitives/noul/) を使用します。

典型的な質問の例：

```text
"How severe is the bug being reported?"
  → 0: Cosmetic; no impact to functionality
  → 1: Broken or degraded feature, but workaround exists
  → 2: Blocking issue; no workaround exists

"How formal is this outfit based on the description"
  → 0: gym clothes
  → 1: casual
  → 2: business casual
  → 3: formal
  → 4: black tie
```

2番目の例に注目してください。段階は 0 から 4 まで**順序付けられており**、最もカジュアルな服装から最もフォーマルな服装へと進みます。これが `Score` と `Choice` の決定的な違いです。逆に、`{ billing, technical, sales }` のような選択肢には真の順序関係がなく、無理に `Score` を使用すると、偽の順序付けのセマンティクス（意味論）が導入されてしまいます。

## パラメータ

| パラメータ | 必須 | 説明 |
| :--- | :--- | :--- |
| `type` | はい | `"score"` でなければなりません |
| `instructions` | はい | 質問そのもの |
| `criteria` | はい | **段階の配列**。昇順で並べられ、各項目の説明はその段階の定義となります |

`Choice` の `criteria` がオブジェクトであるのに対し、`Score` の `criteria` は**順序付き配列**です。配列の順序が尺度の方向を示します。

`Choice` と同様に、`criteria` の各要素は文字列、オブジェクト、または配列にできます。特定の段階についてより詳細な説明が必要な場合は、オブジェクトを使用してください。

## リクエスト例

```python
from typesafe_sdk import Score, TypeSafeClient

client = TypeSafeClient()

bug = "The export button throws a CORS error when saving to Google Sheets. It works in Chrome, but a few of our customers only use Safari."

response = client.system_one(
    state=bug,
    questions={
        "bug_severity": Score(
            instructions="How severe is the reported issue?",
            criteria=[
                "Cosmetic; no impact to functionality",
                "Broken or degraded feature, but workaround exists",
                "Blocking issue; no workaround exists",
            ],
        ),
    },
)

print(response.answers["bug_severity"].score)
```

## 返却値

`Score` の回答の重要な特徴は、`score` が**2つの段階の間にある値を取り得る**ことです。これは段階のインデックスではなく、尺度上の位置を示します。

| フィールド | 意味 |
| :--- | :--- |
| `score` | 尺度上の位置。小数になる可能性があります |
| `legend` | 段階の定義を番号付きで繰り返したもので、コード内で意味論へマッピングするために使用します |
| `probabilities` | 各段階における確率分布 |
| `confidence` | 分布の集中度。0 から 1 の値 |

上記の例で `score: 1.4` が返された場合、これはモデルが問題の深刻度を「回避策のある機能の破損」と「完全にブロックされる問題」の間、かつ前者に偏っていると判断したことを意味します。この**連続性は、Score が「複数の Noul を組み合わせたもの」に対する核心的な利点**です。1回の呼び出しで完全な分布情報が得られ、複数の独立した判断を行う必要がありません。

`legend` の役割は、返却値を自己完結型にすることです。数字を意味論に変換するために、コード内で別途段階の定数テーブルを管理する必要はありません。

## 使用上のポイント

**段階の説明は判別可能でなければなりません。** 各段階の説明は、他の人が同じ基準で境界を判断できるものであるべきです。`"Calm, matter-of-fact"` / `"Frustrated but civil"` / `"Very angry"` のような説明は判別可能です。一方、`"低 / 中 / 高"` のような説明は判別不可能です。

**段階の数は 3 から 5 に抑えてください。** 少なすぎると区別性が失われ、多すぎると隣接する段階の境界が曖昧になり、結果として信頼度が低下します。

**`score` だけでなく `confidence` にも注目してください。** `Score` の信頼度が低い場合、通常は段階の定義に曖昧さがある、尺度が多面的である、または state の情報が不足していることを意味します。そのような場合、正しい対応は値を無理やり決定することではなく、段階の定義を改善することです。

**ソート（順序付け）の場面では Score が主力プリミティブとなります。** 関連性のソート、品質評価、リスク分级には Score が適しており、[コンポジットスコアリングパターン](/ja/patterns/composite-scoring/) を組み合わせて複数の次元を重み付けして統合することができます。

## 関連

- [Choice](/ja/primitives/choice/) — 順序のない固定された選択肢
- [Noul](/ja/primitives/noul/) — Yes/No の確率
- [コンポジットスコアリングパターン](/ja/patterns/composite-scoring/) — 多次元重み付け合成
- [信頼度](/ja/concepts/confidence/) — 信頼度が低いことの意味
