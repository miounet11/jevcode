---
title: "知識グラフエンティティ整合"
description: "2つのビールカタログから選ばれた450組の候補ペアのうち、同じ製品を記述しているものを判断する。TypeSafe Scoreの質問1つが意思決定全体を担っており、その3つのレベルはペアに対して実行可能な3つの操作、すなわちマージ、リンクなしで放置、キュレーターへの手動割り当てに対応している。適合させる閾値は存在しない。"
section: cases
order: 180
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/entity_alignment"
translatedFrom: en
---
*知識グラフにおける重要な課題の一つは、流入するエンティティが既存のエンティティの重複であるかどうかを判断することであり、特に入手可能な情報が異なったソースからの自然言語のみである場合がそれに該当します。潜在的な重複ペアが与えられたとき、単一の TypeSafe `Score` は、各ペアが重複であるかどうか、あるいはキュレーターによるより詳細な検討に値するかどうかを判断します。*

2つのデータソースが同じものの重複するセットを記述しており、片側のどのエントリがもう片側のどのエントリと同じものなのかを知る必要があると仮定します。ナレッジグラフでは、それらのエントリを*エンティティ*と呼び、各エンティティについて記録された事実を保持します。安価だが大まかな最初の処理で、2つのソースを比較し、より詳細な検討に値する450組のペアが選別済みです。残る作業は、各ペアについて最終的な判断を下すことです。

2つのエンティティを不適切にマージすることは、より高価なミスです。なぜなら、どちらかのエンティティに関するすべての事柄がマージされたエンティティを記述するようになり、どちらかにリンクされていたものもすべて一緒に移動してしまうからです。後で元に戻すには、各事柄がどこから来たのかを特定する必要があります。マッチを見逃すのは重複が残るだけなので、判断には「マージしても安全でも、ドロップしても安全でもない」ペアに対する第三の選択肢が必要です。

判断は、3つの結果それぞれに対して1つのレベルを持つ`Score`質問である：

* **異なる製品** — 2つのエンティティをリンクしない
* **関連しているが、必ずしも同一ではない** — カレーターに判断を委ねる
* **同一製品** — マージする

私たちはScore質問を使用します。これは、中間の成果物を含むすべての成果物に、スコア基準というセマンティックラベルを直接付与したいからです。Noul質問では、出力に対する閾値処理によって間接的にこれを実現できますが、Choice質問では3つの成果物の順序関係が失われてしまいます。

次に、考慮したいエンティティの各フィールドについて、`Noul`これらのフィールドが一致するかどうかに関する質問を、同じリクエストに含めることができます。これらのノウルは、スコアが「同一製品」または「別製品」のレベルのいずれにも該当しない場合、キュレーターに対してより詳細な情報を提供します。

`route()` を受け取り、3つの結果のいずれかを返すものになります。これは、独自のデータに適合させる必要のある閾値を持たないものです。

<!-- mermaid flowchart converted to equivalent tables (this site loads no chart library) -->

*フロー方向：LR*

| ノード | 説明 | グループ |
| :--- | :--- | :--- |
| `CALL` | 1つのリクエスト、4つの質問 | 1つのリクエスト、4つの質問 |
| `S` | Score: 2つはどう関係するか？ / · 異なる製品 / · 関連するが、必ずしも同一ではない / · 同一製品 | 1つのリクエスト、4つの質問 |
| `N` | Nouls: 比較対象のフィールドごとに1つ / · 同じ名前か？ / · 同じ醸造所か？ / · 同じスタイルか？ | 1つのリクエスト、4つの質問 |

| 元 | 条件 | 先 |
| :--- | :--- | :--- |
| `S` | — | `N` |
| `S` | — | `R` |
| `R` | 異なる | `DROP` |
| `R` | 同じ | `M` |
| `R` | 関連 | `Q` |


## セットアップ

```bash
pip install matplotlib ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

その後、`TYPESAFE_API_KEY`を設定します。すべての呼び出しは`json_cache.json`にキャッシュされ、これはクックブックに同梱されているため、再レンダリングするとAPIを呼び出すことなく公開済みの数値が再生されます。すべての処理をライブで再実行するには、そのファイルを削除してください。

以下の数字は`jev-1.12`より2026年8月11日付で取得したものです。

```python
import json
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from typesafe_sdk import Noul, Score, TypeSafeClient

matplotlib.use("Agg")  # headless render

TYPESAFE_MODEL = "jev-1.12"
MAX_WORKERS = 6  # small pool; the public endpoint rate-limits above roughly eight

client = TypeSafeClient(
    api_key=os.environ.get(
        "TYPESAFE_API_KEY", "cache-only"
    ),  # keyless kernels replay the cache
    base_url=os.environ.get("TYPESAFE_ENDPOINT"),
    timeout=120.0,
)
json_cache = JsonCache(Path("json_cache.json"))
```

## 候補ペアを読み込む

ペアは公開されたベンチマークセット、MagellanコレクションのBeerデータ由来です：
異なるウェブサイトからスクレイピングされた2つのビールカタログは、最初の粗い処理段階で既に450ペアに削減されています。各エンティティには4つのフィールドが含まれます：名前、醸造所、スタイル、アルコール度数。各ペアにはさらに`known_same_as`、すなわちベンチマーク独自の回答も付随しています。

テキストは、前処理なしで、公開時の状態のまま正確に保持されます。文字に復元されなかったHTMLエンティティ、単語として分離されたアポストロフィ、一部文字の誤ったデコード。

ペアごとに1リクエストが送信されるため、コストはソースのサイズではなく、割り当てられたペアの数に応じて変動します。

```python
PAIRS = json.loads(Path("candidate_pairs.json").read_text(encoding="utf-8"))
BY_ID = {pair["id"]: pair for pair in PAIRS}

print(f"{len(PAIRS)} candidate pairs. The first one, as the model will see it:")
print(json.dumps({k: PAIRS[0][k] for k in ("entity_a", "entity_b")}, indent=2)[:420])
```

```
450 candidate pairs. The first one, as the model will see it:
{
  "entity_a": {
    "name": "C N Red Imperial Red Ale",
    "brewery": "Redwood Lodge",
    "style": "American Amber / Red Ale",
    "abv": "8.10 %"
  },
  "entity_b": {
    "name": "Kinetic Infrared Imperial Red Ale",
    "brewery": "Kinetic Brewing Company",
    "style": "American Strong Ale",
    "abv": "9.30 %"
  }
}
```

## 候補ペアごとに1つのScore質問と3つのNoul質問を質問する

両方のエンティティは、`entity_a`および`entity_b`として単一の状態に組み込まれるため、質問は個々の側面ではなく、*ペア*に関するものである。これら4つはすべて1つのリクエストに収められる。

以下の3つのレベルの説明は、意思決定の全体を構成します。各レベルは1つの結果です。
このファイルのどこにも閾値定数はありません。また、これらは調整すべき数値とは異なり、スコアを1つ確認する前でもこれらの説明を書くことができます。

中位レベルは、慎重に記述する価値がある。ここでは、バリエーション、限定版、あるいはどちらの製品にも妥当し得る名称を扱い、それらがマージや削除ではなくキュレーターに到達するようにする。

`OUTCOME` は3つの結果を名付けています。マージ結果は `assert sameAs` と呼ばれます。これは `sameAs` が2つのエンティティが同一のものであることを記録する標準的な方法であり、これを書くことでマージが実際に実行されるからです。

4つのフィールドのうち3つに`Noul`の質問が設定されます：名前、醸造所、スタイルです。アルコール度数については質問がありません。2つの数値を比較するのは算術処理に過ぎず、必要であればコード内で計算してください。
この形式を別の種類のデータに適用するには、`QUESTIONS`と`LEVELS`を書き換えます。ビールに関する知識を持つのは、結果を出力する2つの関数だけで、それらはフィールド名を指定しています。

```python
LEVELS = [
    "They describe two different products.",
    "They describe closely related products that may or may not be the same one: "
    "a variant, a special edition, or a name that could plausibly refer to either.",
    "They describe one and the same product.",
]
OUTCOME = {0: "leave unlinked", 1: "curator queue", 2: "assert sameAs"}

QUESTIONS = {
    "link_state": Score(
        instructions="How do the two entity descriptions relate as products?",
        criteria=LEVELS,
    ),
    "same_name": Noul(
        instructions="Do the two entities state the same beer name?",
    ),
    "same_brewery": Noul(
        instructions="Are the two entities from the same brewery?",
    ),
    "same_style": Noul(
        instructions="Do the two entities describe the same beer style?",
    ),
}


@json_cache
def score(pair_id: str) -> dict:
    """One request about one candidate pair -> the score plus the three noul answers."""
    pair = BY_ID[pair_id]
    response = client.system_one(
        state={"entity_a": pair["entity_a"], "entity_b": pair["entity_b"]},
        questions=QUESTIONS,
        model=TYPESAFE_MODEL,
    )
    link = response.answers["link_state"]
    return {
        "score": link.score,
        "probabilities": link.probabilities,
        "confidence": link.confidence,
        "properties": {
            k: response.answers[k].noul for k in QUESTIONS if k != "link_state"
        },
        # tokens and requests are the durable units; don't cache a derived cost
        "input_tokens": response.usage.input_tokens or 0,
        "output_tokens": response.usage.output_tokens or 0,
    }


def route(score_value: float) -> str:
    """The whole decision rule: the nearest level names the outcome."""
    return OUTCOME[min(int(score_value + 0.5), len(LEVELS) - 1)]


def show(pair_id: str) -> None:
    pair, result = BY_ID[pair_id], score(pair_id)
    print(
        f"{pair_id}  score {result['score']:.2f}  confidence {result['confidence']:.2f}"
        f"  ->  {route(result['score'])}"
    )
    for side in ("entity_a", "entity_b"):
        e = pair[side]
        print(f"    {e['name'][:44]:<46}{e['brewery'][:30]:<32}{e['style'][:22]}")
    nouls = result["properties"]
    print(
        f"    name {nouls['same_name']:.2f}   brewery {nouls['same_brewery']:.2f}   "
        f"style {nouls['same_style']:.2f}"
    )
```

4つのペア。`c446`は1つの製品で、`c427`は2つ。残りの2つは異なる理由で中位レベルに属する：`c100`は同じ名称と醸造所を持つが、情報源はそのスタイルを異なる方法で記述しており、`c428`はビールとそのフルーツ・ホップバリアントをペアリングしている。

```python
for pair_id in ("c446", "c427", "c100", "c428"):
    show(pair_id)
    print()
```

```
c446  score 1.94  confidence 0.92  ->  assert sameAs
    Thomas Hooker Old Marley Barleywine           Thomas Hooker Brewing Company   American Barleywine
    Thomas Hooker Old Marley Barleywine           Thomas Hooker Brewing Company   Barley Wine
    name 0.97   brewery 0.99   style 0.81

c427  score 0.03  confidence 0.95  ->  leave unlinked
    Frost Quake Bourbon Barrel Aged Barley Wine   Wellington County Brewery       American Barleywine
    Lompoc Bourbon Barrel Aged Proletariat Red A  Lompoc Brewing                  Amber Ale
    name 0.02   brewery 0.09   style 0.08

c100  score 1.30  confidence 0.27  ->  curator queue
    Belle Gueule Rousse                           Brasseurs R.J.                  American Amber / Red A
    Belle Gueule Rousse                           Brasseurs RJ                    Amber Lager/Vienna
    name 0.95   brewery 0.94   style 0.35

c428  score 1.10  confidence 0.77  ->  curator queue
    Ambleside Amber Ale                           Bridge Brewing Company          American Amber / Red A
    Bridge Ambleside Amber Ale - Pomegranate & G  Bridge Brewing Company          Amber Ale
    name 0.63   brewery 0.98   style 0.74
```

## 各候補ペアをルーティングする

```python
# 450 candidate pairs, one request each; a small pool keeps a live run to a few minutes.
with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
    scored = list(pool.map(lambda pair: score(pair["id"]), PAIRS))

scores = [result["score"] for result in scored]
by_outcome: dict[str, list[str]] = {name: [] for name in OUTCOME.values()}
for pair, s in zip(PAIRS, scores):
    by_outcome[route(s)].append(pair["id"])

SURFACE, INK, INK2, MUTED = "#fcfcfb", "#0b0b0b", "#52514e", "#898781"
GRID, AXIS, BLUE, ORANGE = "#e1e0d9", "#c3c2b7", "#2a78d6", "#eb6834"

BINS, TOP = 20, len(LEVELS) - 1
counts = [0] * BINS
for s in scores:
    counts[min(int(s / TOP * BINS), BINS - 1)] += 1
centers = [(i + 0.5) / BINS * TOP for i in range(BINS)]
queued = [c if route(x) == "curator queue" else 0 for c, x in zip(counts, centers)]
settled = [c if route(x) != "curator queue" else 0 for c, x in zip(counts, centers)]

fig, ax = plt.subplots(figsize=(7.2, 3.6), facecolor=SURFACE)
ax.set_facecolor(SURFACE)
for side in ("top", "right"):
    ax.spines[side].set_visible(False)
for side in ("left", "bottom"):
    ax.spines[side].set_color(AXIS)
ax.tick_params(colors=MUTED, labelcolor=INK2, labelsize=9)
ax.set_axisbelow(True)
ax.grid(axis="y", color=GRID, linewidth=0.8)
ax.bar(
    centers, settled, width=TOP / BINS * 0.9, color=BLUE, label="settled automatically"
)
ax.bar(
    centers, queued, width=TOP / BINS * 0.9, color=ORANGE, label="sent to the curator"
)
for edge in (0.5, 1.5):
    ax.axvline(edge, color=INK2, linewidth=1, linestyle="--")
ax.set_xticks([0, 0.5, 1, 1.5, 2])
ax.set_xticklabels(["0\ndifferent", "0.5", "1\nrelated", "1.5", "2\nsame"])
ax.set_xlabel("score for the pair", color=INK2, fontsize=9)
ax.set_ylabel("candidate pairs", color=INK2, fontsize=9)
ax.set_title(
    f"{len(PAIRS)} candidate pairs, scored once each",
    loc="left",
    color=INK,
    fontsize=11,
)
ax.legend(frameon=False, labelcolor=INK2, fontsize=9)
display(fig)
plt.close(fig)

for name in ("assert sameAs", "curator queue", "leave unlinked"):
    n = len(by_outcome[name])
    print(f"{name:<16}{n:>5}  ({n / len(PAIRS):>5.1%})")
```

```
assert sameAs      40  ( 8.9%)
curator queue      50  (11.1%)
leave unlinked    360  (80.0%)
```

<img src="/img/cases/entity-alignment-entity_alignment.executed.1.png" alt="output" width="944" height="562" data-path="cookbooks/entity_alignment/entity_alignment.executed.1.png" />

`route()`の回答が変化する2つのスコア値がカットポイントです。ほとんどのペアは収束し、下限カットポイントより下のスコアが360、上限カットポイントより上のスコアが40となり、キュレーターには50が残ります。

このセットでは、スコアが整数にきれいに収まらない。大半は0.25付近に位置する。共通点のないビール2本でも、スタイル名が同じである場合があり、醸造元の社名が似ていることもあるため、モデルは確率のすべてをゼロにするのではなく、中間レベルに一部を割り当てる。ペアがあるカットポイントのどちら側に属するかを決定するのは、そのレベルへの近さではない。

2つのカットポイントは混雑度が等しくない。9組が上位のカットポイント（1.5）から0.1以内の範囲に位置しており、これはグラフにマージされる対象を決定するものである。47組が下位のカットポイント（0.5）から0.1以内の範囲に位置しており、これはキュレーターがペアを閲覧するかどうかを決定するものである。これらの数値は調整可能なパラメータではない。両者はレベルの記述方法に由来しており、中央のレベルの記述が、キュレーターに渡されるペアとリンクされないで残るペアの間の移動を決定する。

## プレイグラウンドで開く

以下のプレイグラウンドリンクは`c428`を開き、これは1.10のスコアでキュレーターに送られました。
*Ambleside Amber Ale*と*Bridge Ambleside Amber Ale - Pomegranate & Galena Hops*をペアにしています：同じ醸造所、同じアルコール度数。関連する4つの質問がすべて付いています。

```python
playground_link = make_playground_link(
    {"entity_a": BY_ID["c428"]["entity_a"], "entity_b": BY_ID["c428"]["entity_b"]},
    QUESTIONS,
    models=[TYPESAFE_MODEL],
)
display(
    Markdown(
        f"🔗 [Open this pair + questions in the TypeSafe playground]({playground_link})"
    )
)
```

[このペアと質問を TypeSafe プレイグラウンドで開く →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiMigJYoCeA+gIakEkhL2JP6kCCcARgBsEAZwpgE+XnwQAnSUNIAaLiD4yEAd1nVOpAEIyxAcwkHNFJEfwBhCHAAO9JDpDLSwmgrwresilCdJfll8AHp8ACUEMHkEJRV6PgA3XRAAVgA6AGYABnwAUlIAXzcyVCo6Pk4WNg5vfUMwEyDBETEJKRDuIXwAWnwABTsEIxknehQJADJ8AHF6ITZ8AAkIe2F40jVNbVSDY1N1DQsrWwcnF1KPai8CHmC5brjXBOTUzNyC4qKXkHsZOz2FDCDDYbxEUgCCwAa1oHgmz2YpBo9kRKmEUAg6k2ICghkmhkY3gA2qQ0AALBDUfDiDGGaT4FAaCA0igAMzZsnI+H+EDAMCgwIyOIpVJpIjxFAZUAEEGECAE1PUAgRMV5-MFwkZ5Im+Dg9GpWL1BvwSAgKHwDJQlPwwnYEggSAQBHo+CS9EJqGUruEqKgFAW+GiVAojuURtdtQk1t1mJgAjVKpgokESoQnLkKBZCColJkwpeZMp1NpkoZjokThi1okdsQPIBGpQBYAuqULB4ZALKI6NvUQKsNDSWTXGcyg+UaOK6RQgaGkFrlQj8PQteru8IAPzFK722hR6rI6io1Jm+M4jsoLuC+d9u4gAAiI5tTOzk4oIltKGXo7rEmkIRRtuIAlOie7bFoMguEiIAomipBngIF4Lle3a3qk3DqNq0bjuQIafmyAJwNhtr2paRzaMBoHuHu1y3PgLBwaeEDnoWICXtePYLqkT4ka+E6UJQn6lvS0Y2n+loICEdEIFRPzKCA9D2BQABqsiiI64JJAAjL88pCIK0QALJ8gqwgkiAABWCBJL02kZNpABMIAtkUQA)