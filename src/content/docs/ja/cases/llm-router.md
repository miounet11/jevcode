---
title: "LLMルーター：型付きの判定で処理先を選ぶ"
description: "各リクエストをモデルか人のどちらへ渡すか。常に最大のモデル、キーワード規則、埋め込みルーター、チャットモデルにラベルを言わせる方法、そして clavue-jev の choice に confidence を一問足す方法。分岐できるのはその選択肢です。"
section: cases
order: 235
tags: ['llm-router', 'model-routing', 'routing', 'comparison']
translatedFrom: en
---

## モデルの前にある判定

LLM ルーターはユーザーに答えません。答える処理先を選びます。同じ受信箱に、誤字の修正、設計の質問、人へ回すべきメッセージが並びます。三つとも最大のモデルへ送れば動きます。誤字の修正は、大きいモデルの値段を払います。

この仕事は **LLM ルーター** や **モデルルーティング** として検索されます。選ぶものは、すでに名前を付けた閉じた集合です。小さいモデル、大きいモデル、検索、人。その選択は、プログラムが分岐できる値です。

## ルートの決まり方、五つ

| 方法 | ルートの決まり方 | 起きうること | 支払うもの |
| :--- | :--- | :--- | :--- |
| **すべてのリクエストを一つのモデルへ** | ルーターはない | 小さい仕事が大きいモデルの値段を払う | そのモデルを、毎回 |
| **キーワードか正規表現** | 語の一覧が処理先に対応する | 言い換えると一覧に当たらない | リクエストの時点では別料金なし |
| **埋め込みルーター** | いちばん近いルート説明が勝つ | 説明と処理先がずれていく | 埋め込みの呼び出しと、その索引 |
| **チャットモデルにラベルを言わせる** | 名前で返答するよう頼む | 名前が集合の外に出る、または文章に包まれる | そのモデルの入力と出力 |
| **型付きの選択（clavue-jev）** | 列挙した処理先への `choice` と、`confidence` の一問 | 返せるのは列挙した処理先だけ | 成功した呼び出しの入力トークン。出力は無料 |

語が動かないなら、キーワード規則で足ります。ルート説明をすでに持っているなら、埋め込みルーターが合います。ルート自体が文でなければならないなら、チャットモデルです。ルートが少数の処理先のどれかで、次の行がそれを読むなら、型付きの選択です。

## このサイトが受けるリクエスト

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

```json
{
  "state": "Rename this function and add a test. Do not change behavior.",
  "questions": {
    "route": {
      "type": "choice",
      "instructions": "Which handler should run this request?",
      "options": ["small_model", "large_model", "human"]
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that routing judgment?"
    }
  }
}
```

`state` はテキストで、8 から 4000 文字です。`questions` は最大六つです。キーは小文字で始まります。choice は `options` でも `criteria` のマップでも送れます。このサーバーは、モデルが見る前に `options` を criteria へ畳みます。

成功した呼び出しは入力トークンで課金します。出力は無料です。数字は[料金](/ja/pricing/)にあります。

応答はモデル名を載せ、各答えを同じキーで返します。

```json
{
  "model": "clavue-jev",
  "answers": {
    "route": { "choice": "small_model" },
    "sure": { "noul": 0.78 }
  }
}
```

`route.choice` は送った選択肢の一つです。`sure.noul` は 0 から 1 の小数で、confidence の質問から来ます。この API は choice の中に確信度を隠しません。上の `0.78` はそのフィールドの形です。測定した精度ではなく、このサイトは一律の閾値も出しません。

二つのフィールドで分岐します。閾値はあなたが決めます。

```python
route = body["answers"]["route"]["choice"]
sure = body["answers"]["sure"]["noul"]
cutoff = 0.8  # 自分のトラフィックで測った閾値に置き換える

if sure < cutoff or route == "human":
    hand_to_human(state)
elif route == "small_model":
    call_small(state)
else:
    call_large(state)
```

お金を使うツールへ誤って回すなら、ログの一行へ誤って回すときより高い閾値が要ります。数字を固定する前に、[比較](/ja/compare/)か[試す](/ja/try/)で自分のトラフィックを一括して読んでください。理由は[確信度](/ja/concepts/confidence/)にあります。

同じリクエストにあと四問置けます。ルート、確信度、いくつかのはい／いいえは、六つの上限に収まります。[ファンアウト](/ja/patterns/fan-out/)がその形です。

## ルーターがしないこと

返信は書きません。選んだ処理先が書きます。

処理先は発明しません。正しいものが `options` に無いときも、choice は送った名前のどれかを返します。処理先を足すか、列挙した処理先のどれかが合うかを問う `noul` を足して、外れたものは人へ渡します。

開いた文章はテキストモデルの仕事です。ルーターは、どのテキストモデルを走らせるか、または人に先に見せるかを決めます。文章が戻ったら、別の呼び出しで実行してよいかを問えます。二回目は[ガードレール](/ja/cases/llm-guardrails/)であり、ルートの一部ではありません。

## この形がすでに出ている場所

[ユースケースマップ](/ja/cases/use-case-map/)は、Jev の choice でモデルを選ぶ公開プロジェクトをまとめています。コーディング作業のルーター、LiteLLM ベースのルーター、コーディングエージェントのリクエストごとのルーター、モデルと労力を選ぶローカルプロキシです。共通の形は、高い呼び出しの前に choice を一つ置くことです。このページはそれらのプロジェクトに点数を足しません。

[インテントルーティング](/ja/patterns/intent-routing/)は同じ判定で、向かう先がモデルではなくカスタマーサポートのキューです。

## 始め方

- [API](/ja/api/) — `POST /v1/judge`、リクエストと応答
- [試す](/ja/try/) — 匿名の経路。キーは不要
- [System One](/ja/concepts/system-one/) — state、質問、応答に載るモデル名
- [確信度](/ja/concepts/confidence/) — 二問目と、閾値を決める人
- [料金](/ja/pricing/) — 入力トークン課金、出力は無料

## 関連

- [構造化出力](/ja/cases/structured-output/) — 必要なのがルートではなく型付きの値であるとき
- [ファンアウト](/ja/patterns/fan-out/) — 一つの state に複数の質問
- [LLM のガードレール](/ja/cases/llm-guardrails/) — テキストモデルが書いたあとの検査
- [ユースケースマップ](/ja/cases/use-case-map/) — 公開プロジェクト
