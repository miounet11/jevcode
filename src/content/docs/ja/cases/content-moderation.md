---
title: "コンテンツモデレーションAPI: 型付き質問から構築する"
description: "TypeSafe によるTyped QuestionsのコンテンツモデレーションAPIの構築方法 — ポリシーごとのNoulチェック、重大度スコアリング、カテゴリルーティング、あなたが管理する閾値ガバナンス — を、一括適用型のモデレーションエンドポイントと比較する。"
section: cases
order: 215
tags: ['moderation', 'content-moderation', 'guardrails', 'cookbook']
translatedFrom: en
---
## 「モデレーションエンドポイント」を購入単位として不適切な理由

大半のプラットフォームは、モデレーションを固定ラベル（毒性、ヘイト、暴力、性的コンテンツ、自傷行為）を持つ1つのエンドポイントとして販売している。これは、製品における違反の定義がベンダーの定義と異なる最初の瞬間まで、便利に思える。オフプラットフォームでの支払い試行をフラグ付けしなければならない市場、ここでは「Trash talk」は許可されるがDoxxingは許可されないゲームチャット、ここでは用量に関する質問が本題となる健康フォーラムなど。

あなたのモデレーションポリシーは**製品上の判断**です。あなたが購入するAPIにそれをハードコードすべきではありません。あなたが本当に必要なのは、ポリシーを*表現*する方法であり、何も再学習することなく、ベンダーを待つことなく、ポリシーが変更されたときに変更できる方法です。

このページでは、型付き質問からモデレーションを構築する方法を示します。各ポリシールールは質問であり、各回答には確率が伴い、閾値 — つまり実際のポリシー — はコード内で管理され、コードと同様にバージョン管理されます。

## 形状：1メッセージにつき1リクエスト、ルールごとに質問

メッセージが入力され、1つのリクエストが各ポリシールールごとにNoul questionと重大度スコアを運びます。判断が出力されます。2回目の呼び出しはなく、ルーリングごとにファンアウトするエンドポイントもありません。

```python
from typesafe_sdk import AsyncTypeSafeClient, Noul, Score

MODERATION_RULES = {
    "spam": Noul(instructions="Is this message spam or bulk advertising?"),
    "scam": Noul(instructions="Does this message try to defraud or phish the reader?"),
    "pii": Noul(instructions="Does this message contain personal data such as addresses, phone numbers, or IDs?"),
    "offsite_payment": Noul(instructions="Does this message try to move the transaction off the platform (external payment, direct email)?"),
    "severity": Score(
        instructions="If a policy is violated, how much harm would acting on it do?",
        criteria=["none", "minor", "moderate", "severe"],
    ),
}

async def moderate(client: AsyncTypeSafeClient, message: str) -> dict:
    async with client:
        response = await client.system_one(state=message, questions=MODERATION_RULES)
    return {rule: response.answers[rule] for rule in MODERATION_RULES}
```

ポリシーは絶対的なものだ。健康フォーラムに「医療アドバイスではない」という免責事項を追加するのは一行で済む；それはベンダーの次のモデルカードではなく、次のデプロイと一緒にリリースされる。

## 閾値はポリシーです — コード内でそれらを維持してください

Noulの回答はすべて確率です。違反としてカウントされるのは、その確率に適用する閾値であり、ルールごとに異なる閾値が存在します：

```python
THRESHOLDS = {"spam": 0.90, "scam": 0.85, "pii": 0.70, "offsite_payment": 0.95}
SEVERITY_ESCALATE = 2.5  # between "moderate" and "severe" on the 4-point scale

def decide(answers: dict) -> str:
    if answers["severity"].score >= SEVERITY_ESCALATE:
        return "escalate"    # legal / trust-and-safety queue
    for rule, threshold in THRESHOLDS.items():
        if answers[rule].noul >= threshold:
            return "block"
    if any(answers[rule].noul >= 0.60 for rule in THRESHOLDS):
        return "review"      # send to the human queue
    return "pass"
```

あなたに属する4つの結果：

- **pass** — 配信する
- **review** — 人間のキュー、誤検知を減らすための最もコスト効率の良い方法
- **block** — 強制する
- **escalate** — 重大度スコアが閾値を超えた場合、例えば法務または信頼と安全

その、独自のカテゴリラベルとフラグを返すモデレーションエンドポイントと比較してください。調整できるのは1つだけ：フラグの閾値です。ラベル、その定義、そしてそのキャリブレーションは、他者のデプロイに委ねられます。

## 確率がラベルよりも重要である理由

真偽値のフラグは、モデレーションシステムを運用するために必要な情報を破棄する：

**境界線を測定できる。** 0.6から0.9の間に収まる判断の割合が、人間のレビュー業務量である。この数字は、大量のエスカレーションが積み上がる前、リリース前に把握可能だ。[自己一貫性テスト](/en/cases/consistency-choice-cookbook/)はこれを拡張する：境界線上の投稿をルーブリックで繰り返し実行し、ラベルが安定しているか確認する——ラベルのぶれは、自動化されたモデレーションにおける静かなる殺し手である。

**信頼度でゲート制御できます。パイプライン内の他の意思決定と同じです。**
分類に使用されるのと同じ[confidence-routing](/en/patterns/confidence-routing/)パターンが、変更なしで適用されます：確率が高い場合は実行、確率が低い場合はレビュー、そしてその境界値はあなたが選んだ数値です。

**検証者は検証可能である。** 各ルールは分布を持つ個別の質問であるため、各ルールごとにラベル付き例を保持し、各ルールの精度を測定できる — ニュースサイクルを通じて隠れたカテゴリの誤作動を発見するのではなく。

## 入力ガードレールとの関係

[LLM向けのガードレール](/en/cases/llm-guardrails/)は、LLM固有のケースをカバーします：
モデル呼び出しにおけるモデルの呼び出し前後の、ジェイルブレイクや有害な出力に対するプロンプトおよび完成テキストのスクリーニング。ここで説明するモデレーションシステムは、より広範な製品表面であり、ユーザー
メッセージ、プロファイル、リスト、レビューであり、ルールはモデルの安全性ではなく、利用規約に由来します。同じ基本要素、異なるルール作成者。多くの
製品は両方を実行することになります：ユーザーコンテンツに対する製品モデレーション、モデル周囲のガードレール。

## この方法で構築されたリアルなモデレーションシステム

- [Jev-Moderation-Bot](https://github.com/brainstormity/Jev-Moderation-Bot) — スパムや詐欺リンクをチェックし、警告とタイムアウトの段階的措置ルールをローカルで保持するDiscordボット
- [mastra-jev-moderation](https://github.com/CodeAlive-AI/mastra-jev-moderation) — TypeSafe Jev上のMastraエージェント向けの入力モデレーション、1つのファイルに収める

## Build it

- [プリミティブの概要](/en/primitives/) — Noul と Score の詳細
- [HTTP API リファレンス](/en/sdk/http-api/) — リクエスト/レスポンスの形状
- [LLM 用のガードレール](/en/cases/llm-guardrails/) — モデル向けバリアント
- [自己整合性：選択](/en/cases/consistency-choice-cookbook/) — ラベル安定性のストレステスト
- [ユースケースマップ](/en/cases/use-case-map/) — 他のシナリオにおけるモデレーションとコンプライアンス