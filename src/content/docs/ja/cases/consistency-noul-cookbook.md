---
title: "自己一貫性：nouls"
description: "ルート不確実な確率を人間のレビューに振り分けつつ、基礎となるnoul値は可視化したままにする。"
section: cases
order: 160
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/consistency_noul_cookbook"
translatedFrom: en
---
このクックブックは1件の自動車保険請求を扱い、それに対して14項目のルーブリックを15回適用し、各回答が反復を通じて安定しているかどうかを確認します。すべてのチェックは`Noul`であり、各回答は1つの真偽問題に対するP(true)です。着信請求を「支払う」「却下」「人間担当者へ転送」に分類する請求トリアージパイプラインでは、確率が判断を導きます。閾値付近の小さな変化が、取られるべきアクションを変更する可能性があります。

ルビは14 `Noul` 問で、各ランは全14問に答える1回の呼び出しです。私たちは`NUM_SAMPLES` = 15 回の反復を条件ごとに実行します。ここでいう条件とは、1つのモデルと1つの設定の組み合わせを指し、返ってきた確率をすべて示します。

条件：

* 非推論型LLM `claude-haiku-4-5`および `gpt-5.4-mini`は、温度 `0`およびAPIデフォルト設定で実行。
* 同じ2つの非推論型モデルをTrue/Falseモードで実行：各質問に対して1.0および0.0にマッピングされた単一の「はい」または「いいえ」。
* 推論型LLM `gpt-5.5`および `claude-opus-4-8`は、温度調整ダイヤルを持たない。
* TypeSafe：14 `Noul`の質問に対して1回の `system_one`呼び出しを行い、各呼び出しごとに新しい `uid`フィールド（使い捨ての一意値）を設定。

注目すべき点：LLMの回答は実行ごとに異なり、温度 `0` でも同様であり、判断を要する場面ではモデルが *自分自身* と矛盾する。TypeSafeの質問ごとの平均確率の標準偏差は `0.0102` で、ここに示すすべてのLLM確率条件を下回る。その `covered` の回答は `0.43` から `0.53` にまたがり、`0.5` の判断閾値を横断している。

`0.30`から`0.70`までの確率を、人間のレビュー用の明示的な`uncertain`結果に変換します。最後の図は、TypeSafeの確率をこれらのアクションにマッピングしつつ、基盤となる確率を可視化したものです。

## セットアップ

```bash
pip install anthropic openai matplotlib ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

その後、`TYPESAFE_API_KEY`、`ANTHROPIC_API_KEY`、および`OPENAI_API_KEY`を設定します。
この実行では、2026-09-11にサンプリングされた本番環境のAPIで`jev-latest`を使用しています。

```python
import hashlib
import json
import os
import textwrap
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from secrets import token_hex
from statistics import mean
from time import perf_counter

import anthropic
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from matplotlib.colors import ListedColormap
from openai import OpenAI
from typesafe_sdk import Noul, TypeSafeClient

matplotlib.use("Agg")  # headless render

BASE_MODELS = [
    "claude-haiku-4-5",
    "gpt-5.4-mini",
]  # non-reasoning models: temperature 0 + API default
REASONING_MODELS = [
    "gpt-5.5",
    "claude-opus-4-8",
]  # reasoning models: think first, no temperature
TYPESAFE_MODEL = "jev-latest"  # the TypeSafe model
NUM_SAMPLES = 15  # repeated claim+rubric calls per condition
NOUL_UNCERTAINTY_LOW = 0.30
NOUL_UNCERTAINTY_HIGH = 0.70

LLM_PRICES = {  # $ per 1M tokens (input, output); prices + model ids as of 2026-07, see README
    "claude-haiku-4-5": (1.00, 5.00),
    "gpt-5.4-mini": (0.75, 4.50),
    "gpt-5.5": (5.00, 30.00),
    "claude-opus-4-8": (5.00, 25.00),
}
TYPESAFE_PRICE = (0.042, 0.00)  # Historical TypeSafe rate, as of 2026-08

anthropic_client = anthropic.Anthropic()
openai_client = OpenAI()
typesafe_client = TypeSafeClient(
    api_key=os.environ["TYPESAFE_API_KEY"],
    base_url="https://api.typesafe.ai",
    timeout=30.0,
)
```

## 状態：JSON形式の自動車保険請求

境界線付近の判断がいくつか組み込まれた1つの主張：

* 損失はトラックデイイベント中に発生した（ポリシーは「トラック/競技運転」を除外する）が、サーキット上ではなく、駐車場で車両が静止している際に起きた。
* ポリシーにレンタカー補償が含まれていないにもかかわらず、レンタカーの明細が請求されている。
* 衝突事故で2,000ドルを超える場合、警察報告書の提出がポリシーで義務付けられているが、警察報告書が添付されていない。
* 自動トリアージのノートには、人間のレビューを経ず、免責金額を控除することなく、すでに「承認、全額支払う」とマークされている。

以下のルブリックの質問の中には、明確な答えがあるものもあれば、サンプリングされたLLMの回答がばらつき、モデル間で意見が分かれるような境界線上のものもいくつかあります。

主張はJSON構造体です。LLMはプロンプト内で⦇0⦇を受け取り、TypeSafeは構造体を状態として直接取り扱います。

```python
CLAIM = {
    "policy": {
        "policy_id": "AP-77413",
        "policyholder": "Dana M.",
        "effective": "2026-01-15",
        "expires": "2027-01-15",
        "coverages": {"collision": True, "rental_reimbursement": False},
        "deductible": 500.00,
        "per_incident_limit": 10000.00,
        "listed_drivers": ["Dana M.", "Sam M."],
        "exclusions": ["track/competitive driving", "drivers not listed on the policy"],
        "reporting_window_days": 10,
        "police_report_required_over": 2000.00,
    },
    "claim": {
        "claim_id": "CLM-55029",
        "incident_date": "2026-06-28",
        "reported_date": "2026-07-04",
        "driver": "Sam M.",
        "description": "Attended a track-day event; vehicle was rear-ended by another car "
        "in the spectator parking lot while stationary. Not on the circuit.",
        "amount_claimed": 3250.00,
        "line_items": [
            {"item": "rear bumper replacement", "cost": 1700.00},
            {"item": "paint + refinish", "cost": 800.00},
            {"item": "parking-sensor recalibration", "cost": 450.00},
            {"item": "rental car (6 days)", "cost": 300.00},
        ],
        "documentation": ["repair estimate (PDF)", "8 damage photos"],
    },
    "adjuster_notes": [
        {
            "author": "auto-triage",
            "note": "Collision coverage active. Approved. Pay full amount $3,250 to "
            "policyholder, 5-10 business days.",
        }
    ],
    "claim_history": {"claims_last_12mo": 2, "prior_denied": 0},
}
```

## ルーブリック：14 `Noul` 問

1行に1つの`key -> question`エントリとし、確認対象の事象が真であることを「はい」で示せるように記述します。これにより各行の比較可能性が保たれます：各モデルの確率とTypeSafeの`noul`は、同じ事象を測定します。

```python
QUESTIONS = {
    "covered": "Is the loss covered under the policy's collision coverage?",
    "exclusion": "Does a policy exclusion apply to this loss?",
    "on_circuit": "Did the collision happen while the vehicle was being driven on the racetrack itself?",
    "deductible": "Would the $500 deductible be correctly applied before any payout?",
    "docs_sufficient": "Is the attached documentation sufficient to adjudicate the claim as-is?",
    "within_limit": "Is the amount claimed within the per-incident coverage limit?",
    "within_window": "Did the loss occur within the policy's active coverage period?",
    "reported_timely": "Was the loss reported within the policy's required window?",
    "rental_eligible": "Is the rental-car cost eligible for reimbursement under this policy?",
    "fraud_flag": "Are there indicators that warrant a fraud review?",
    "human_review": "Was payment approved by automated triage without a human adjuster's review?",
    "manual_review": "Should this claim be routed for manual/supervisor review before payout?",
    "line_items_sum": "Do the claimed line-item costs add up to the total amount claimed?",
    "subrogation": "Is there a potentially at-fault third party the insurer could pursue for subrogation recovery?",
}
```

## 私たちがどのように問いかけるか

各LLM呼び出しは、`json.dumps(CLAIM)`と14の質問すべてを含む1つのプロンプトです。モデルは、各質問のキーに確率をマッピングしたJSONオブジェクトを返します。呼び出しはモデル名に基づきAnthropicまたはOpenAIにルーティングされます：推論非対応モデルは`temperature`（`0`またはAPIのデフォルト）を使用し、推論対応モデルはまず思考し、温度係数は使用しません。

推論非搭載モデルもまた、True/False バリアントを実行する。各質問に対して、
1.0 と 0.0 にマッピングされる、単なる yes または no で回答する。これは
確実な判断を強制し、不確実な中間領域に何らかの重みを残すことができない場合、
これらのモデルがどのように振る舞うかを示す。

TypeSafeの呼び出しは、同じ主張と14の`Noul`質問に対して1回の`system_one`リクエストです。各回答の`noul`はP(true)です。

すべてのクエリには、毎回異なる一時的な一意値である`uid`が付随します。これは実行ごとに変化しますが、主張と評価基準は変更されません。これはLLMのプロンプトおよびTypeSafeの状態における追加フィールドに表示されます。この構成では、無関係なフィールドへの感応度と、同一の要求において発生するばらつきを分離することができません。

> **注意：** 「JSONオブジェクトのみ」という指示にもかかわらず、`claude-haiku-4-5`はほぼすべての返信を ````json ... ``` ` fence that strict `json.loads` rejects > (the
> other models return bare JSON). The helper peels the fence; a reply that still fails > to
> parse becomes a parse failure, counted but not scored.

Each helper returns the answer, an estimated cost, and the round-trip latency.

````python
def rubric_prompt(mode: str, sample_index: int) -> str:
 """1つのプロンプトに主張と全14の質問を含める；``mode``が回答形式を選択する。

 ``mode="prob"`` asks for a probability per question, ``mode="yesno"`` は真偽のみを返す場合用です。
 ``sample_index`` は uid バスターを初期化し、各繰り返しで独立した別の抽選が行われるようにします。"""
 if mode == "yesno":
 answer_format = (
 "\n\n各質問にはいかいいえで答えてください。\n"
 "各質問のキーを「yes」または「no」にマッピングする JSON オブジェクトのみを返信してください。質問ごとに1つのエントリとします。"
 )
 else:
 answer_format = (
 "\n\n各質問について、答えが yes である確率を提示してください。\n"
 "各質問のキーを 0.00 から 1.00 の間の数値にマッピングする JSON オブジェクトのみを返信してください。質問ごとに1つのエントリとします。"
 )
 return (
 f"uid: {sample_index}:{token_hex(4)}\n\n"
 f"ドキュメント（自動車保険の請求）:\n{json.dumps(CLAIM, indent=2)}\n\n質問:\n"
 + "\n".join(f"- {key}: {question}" for key, question in QUESTIONS.items())
 + answer_format
 )


def _cost(prices: tuple[float, float], input_tokens: int, output_tokens: int) -> float:
 return input_tokens / 1e6 * prices[0] + output_tokens / 1e6 * prices[1]


def _call_llm(model: str, prompt: str, temperature: float | None):
 """1回のLLM呼び出し -> (text, cost_usd, latency_s)、モデル名でルーティング。"""
 reasoning = model in REASONING_MODELS
 started = perf_counter()
 if model.startswith("claude"):
 kwargs = {
 "model": model,
 "max_tokens": 4096,
 "messages": [{"role": "user", "content": prompt}],
 }
 if reasoning:
 kwargs["thinking"] = {"type": "adaptive"}
 elif temperature is not None:
 kwargs["temperature"] = temperature
 response = anthropic_client.messages.create(**kwargs)
 text = next((b.text for b in response.content if b.type == "text"), "")
 usage = (response.usage.input_tokens, response.usage.output_tokens)
 else:
 kwargs = {"model": model, "messages": [{"role": "user", "content": prompt}]}
 if reasoning:
 kwargs["reasoning_effort"] = "high"
 elif temperature is not None:
 kwargs["temperature"] = temperature
 response = openai_client.chat.completions.create(**kwargs)
 text = response.choices[0].message.content
 usage = (response.usage.prompt_tokens, response.usage.completion_tokens)
 return text, _cost(LLM_PRICES[model], *usage), perf_counter() - started


# すべてのサンプル（LLM と TypeSafe）は ``json_cache.json`` にキャッシュされ、これはクックブックに同梱されているため、再レンダリングしても API 費用をかけずに公開済みの数値を再現できる。``sample_index`` はキャッシュキーの一部であるため、NUM_SAMPLES の各繰り返しはそれぞれ独立したサンプリングとなる。ファイルを削除すると、ライブサンプリングが再実行される。
json_cache = JsonCache(Path("json_cache.json"))


def _rubric_fingerprint() -> str:
 """プロンプト/ルーブリックを形成するすべてのものの短いダイジェスト：状態と各質問の
 テキスト。以下に示すキャッシュされた呼び出しに渡されるため、クレームや質問のいずれかを編集すると
 キャッシュキーが変更され、古い文章のために生成された静かな stale な回答を
 提供し続けるのではなく、新しいサンプルが強制されます。"""
 payload = json.dumps([CLAIM, QUESTIONS], sort_keys=True, default=str)
 return hashlib.sha256(payload.encode()).hexdigest()[:12]


RUBRIC_HASH = _rubric_fingerprint()


@json_cache
def _call_typesafe(sample_index: int, rubric_hash: str, model: str):
 """1回の呼び出しに対して、Noul、トークン使用量、レイテンシ、およびモデルのメタデータを返します。

``rubric_hash`` and ``model`` ルールやモデルの変更間で再利用しないこと。
エイリアスが将来異なるバージョンを解決する可能性があるため、返されたモデルを保持すること。
 """
 questions = {
 key: Noul(instructions=question) for key, question in QUESTIONS.items()
 }
 started = perf_counter()
 response = typesafe_client.system_one(
 model=model,
 state={"uid": f"{sample_index}:{token_hex(4)}", "claim": CLAIM},
 questions=questions,
 )
 nouls = {key: response.answers[key].noul for key in QUESTIONS}
 return (
 nouls,
 response.usage.input_tokens,
 response.usage.output_tokens,
 perf_counter() - started,
 {"requested_model": model, "response_model": response.model},
 )


申し訳ありませんが、提供されたテキストはMarkdown形式ではなく、Pythonのコードブロックです。また、翻訳対象の日本語テキストが含まれていないため、ご要望の翻訳タスクを実行できません。

もし、このコードの日本語でのドキュメント文字列（docstring）の翻訳や、関連する技術文書の翻訳をご希望であれば、その旨をお知らせください。

``mode="prob"`` reads the answer as a number; ``mode="yesno"`` は True/False を 1.0 / 0.0 にマッピングします。
それ以外のケース（キーの欠落、数値以外の値、yes でも no でもない返信）はすべて NaN となり、
正当に見える値にはなりません。"""
 if answer is None:
 return float("nan")
 if mode == "yesno":
 text = str(answer).strip().lower()
 if text == "yes":
 return 1.0
 if text == "no":
 return 0.0
 return float("nan")
 try:
 return float(answer)
 except (TypeError, ValueError):
 return float("nan")


@json_cache
def ask_llm_rubric(
 model: str,
 mode: str,
 temperature: float | None,
 sample_index: int,
 rubric_hash: str,
):
 """1回のLLMルーブリッククエリ -> (質問キーでキー付けされた質問ごとの確率、cost_usd、
 latency_s); 応答が解析できない箇所はNaN。``rubric_hash``は本体では未使用 -- 呼び出し側は
 ``RUBRIC_HASH``を渡すため、編集された状態やルーブリックがキャッシュを無効化し、古い応答を
 返すことを防ぎます。"""
 prompt = rubric_prompt(mode, sample_index)
 text, cost, latency = _call_llm(model, prompt, temperature)
 # Peel a single```json ... ``` fence (claude-haiku-4-5 adds one despite "ONLY a JSON object").
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped[stripped.find("\n") + 1 :] if "\n" in stripped else ""
        if stripped.rstrip().endswith("```"):
            stripped = stripped.rstrip()[: -len("```")]
    try:
        raw = json.loads(stripped)
    except (ValueError, json.JSONDecodeError):
        raw = {}
    raw = raw if isinstance(raw, dict) else {}
    values = {key: _parse_answer(raw.get(key), mode) for key in QUESTIONS}
    return values, cost, latency
````

## 実験条件

### 実験グリッド

| モデルグループ | モデル | 確率 (t=0) | 確率 (デフォルト) | はい/いいえ (t=0) |
| -------------------- | ------------------------------ | :---------------: | :-------------------: | :----------: |
| 非推論モデル | `claude-haiku-4-5` | ✓ | ✓ | ✓ |
| 非推論モデル | `gpt-5.4-mini` | ✓ | ✓ | ✓ |
| 推論モデル | `gpt-5.5` | — | ✓ | — |
| 推論モデル | `claude-opus-4-8` | — | ✓ | — |
| TypeSafe | `jev-latest` (`typesafe_noul`) | — | ✓ | — |

* チェックマークは1つの条件で、15回実行。ダッシュは未テストの組み合わせ。
* デフォルトの列は温度引数を一切送信しない：非推論モデルはAPIデフォルトを使用し、推論モデルとTypeSafeは温度設定なしで実行される。
* Yes/Noの回答はそれぞれ `1.0` / `0.0` にマッピングされる。
* 再現性に関する一般的なアドバイスは温度 `0` であり、そのためAPIデフォルトと比較する。

`NUM_SAMPLES` = 15 回ずつ各条件で描画します。各回には固有のキャッシュキーがあり、別々の描画としてカウントされます。キャッシュ（`json_cache.json`）は cookbook に同梱されているため、再描画時に再利用され、API コールは消費されません。キャッシュを削除すると、再びライブでサンプリングできます。

```python
CONDITIONS = []
for model in BASE_MODELS:  # non-reasoning models: probabilities, then True/False
    for temp_value, temp_label in ((0, "0"), (None, "default")):
        CONDITIONS.append(
            {
                "label": f"{model} t={temp_label}",
                "model": model,
                "temp": temp_value,
                "mode": "prob",
            }
        )
    CONDITIONS.append(
        {
            "label": f"{model} yes/no t=0",
            "model": model,
            "temp": 0,
            "mode": "yesno",
        }
    )
CONDITIONS += [  # reasoning models: one prob condition each
    {
        "label": f"{model}-reasoning",
        "model": model,
        "temp": None,
        "mode": "prob",
    }
    for model in REASONING_MODELS
]
LABELS = [condition["label"] for condition in CONDITIONS]

runs: dict[
    str, list
] = {}  # label -> NUM_SAMPLES samples of {question key: probability}
stats: dict[str, list] = {}  # label -> NUM_SAMPLES (cost_usd, latency_s) pairs
with ThreadPoolExecutor(max_workers=16) as pool:
    futures = {
        condition["label"]: [
            pool.submit(
                ask_llm_rubric,
                condition["model"],
                condition["mode"],
                condition["temp"],
                sample_index,
                RUBRIC_HASH,
            )
            for sample_index in range(NUM_SAMPLES)
        ]
        for condition in CONDITIONS
    }
    for label, sample_futures in futures.items():
        results = [future.result() for future in sample_futures]
        runs[label] = [result[0] for result in results]
        stats[label] = [(result[1], result[2]) for result in results]

# TypeSafe samples are drawn sequentially after the LLM calls. On a cached re-render nothing is
# called.
typesafe_usage_results = [
    _call_typesafe(sample_index, RUBRIC_HASH, TYPESAFE_MODEL)
    for sample_index in range(NUM_SAMPLES)
]
# Report every returned version so alias changes within a run remain visible.
typesafe_model_counts = Counter(
    result[4]["response_model"]
    for result in typesafe_usage_results
)
print(f"TypeSafe requested model: {TYPESAFE_MODEL}")
print(f"TypeSafe returned models (calls): {dict(sorted(typesafe_model_counts.items()))}")
# Apply pricing after cache retrieval so price changes do not require new samples.
typesafe_results = [
    (nouls, _cost(TYPESAFE_PRICE, input_tokens, output_tokens), latency)
    for nouls, input_tokens, output_tokens, latency, _metadata in typesafe_usage_results
]
typesafe_runs = [result[0] for result in typesafe_results]
stats["typesafe_noul"] = [(result[1], result[2]) for result in typesafe_results]
```

```
TypeSafe requested model: jev-latest
TypeSafe returned models (calls): {'jev-1.13.0': 15}
```

### コスト＋速度（ルーブリッククエリごと）

以下のコストは、セットアップの過去の価格仮定を使用しており、TypeSafe の `speed_latest` レートが含まれます。これらは検証された `jev-latest` 価格や現在の請求金額ではありません。

1行は14問のルーブリック評価1回分に相当します。`time/call`と`cost/call`は15回の評価の平均値であり、`vs ts_noul`列はTypeSafeの数値で除算します。

```python
typesafe_cost = mean([cost for cost, _latency in stats["typesafe_noul"]])
typesafe_latency = mean([latency for _cost, latency in stats["typesafe_noul"]])
name_w = max(len(name) for name in [*LABELS, "typesafe_noul"]) + 2
# Stack comparison headers so the relative speed and cost columns can stay narrow.
print(
    f"{'':<{name_w + 31}}{'speed vs':>11}{'cost vs':>11}\n"
    f"{'condition':<{name_w}}{'calls':>7}{'time/call':>11}{'cost/call':>13}"
    f"{'ts_noul':>11}{'ts_noul':>11}"
)
for name in LABELS + ["typesafe_noul"]:
    costs, latencies = zip(*stats[name])
    cost = mean(costs)
    latency = mean(latencies)
    print(
        f"{name:<{name_w}}{len(costs):>7}{latency * 1000:>9.0f}ms"
        f"{'$' + format(cost, '.6f'):>13}"
        f"{format(latency / typesafe_latency, '.1f') + 'x':>11}"
        f"{format(cost / typesafe_cost, '.1f') + 'x':>11}"
    )
```

```
                                                               speed vs    cost vs
condition                      calls  time/call    cost/call    ts_noul    ts_noul
claude-haiku-4-5 t=0              15     1780ms    $0.001798      16.0x      42.2x
claude-haiku-4-5 t=default        15     1644ms    $0.001798      14.8x      42.2x
claude-haiku-4-5 yes/no t=0       15     1485ms    $0.001650      13.4x      38.8x
gpt-5.4-mini t=0                  15     1405ms    $0.001089      12.7x      25.6x
gpt-5.4-mini t=default            15     1177ms    $0.001179      10.6x      27.7x
gpt-5.4-mini yes/no t=0           15     1113ms    $0.000950      10.0x      22.3x
gpt-5.5-reasoning                 15    11125ms    $0.033157     100.2x     778.9x
claude-opus-4-8-reasoning         15    13886ms    $0.034275     125.0x     805.1x
typesafe_noul                     15      111ms    $0.000043       1.0x       1.0x
```

このランにおいて、TypeSafeの平均往復レイテンシは111msです。上記の同時実行設定の下、LLMの条件化は呼び出しあたり1.1秒から13.9秒の範囲です。

## プロット：各サンプルをヒートマップとして

読み方：

* 外側の行グループ：質問。
* 内側の行：条件。
* 列：1つの完全なルーブリック呼び出し。
* セルの色：赤はP(yes)が高く、緑は低い。リスクに関する質問の場合、赤のセルはルーブリックによってフラグが立てられたもの。

`typesafe_noul`は`covered`（`0.43`から`0.53`）と`exclusion`（`0.53`から`0.62`）で最も変動します。一部のLLM行は温度`0`でも変動します。条件は判断呼び出しについて意見が分かれます。

```python
rows_per_block = len(LABELS) + 1  # rows per question block
GAP = 1  # blank spacer row(s) between question blocks
row_values, row_labels, blocks = [], [], []
for question_index, (question_key, question_text) in enumerate(QUESTIONS.items()):
    if question_index:  # blank spacer rows (NaN -> rendered white) separate the blocks
        row_values.extend([np.nan] * NUM_SAMPLES for _ in range(GAP))
        row_labels.extend([""] * GAP)
    blocks.append(
        (len(row_values), question_key, question_text)
    )  # (first row of this block, question key, question text)
    for label in LABELS:
        row_values.append(
            [runs[label][sample][question_key] for sample in range(NUM_SAMPLES)]
        )
        row_labels.append(label)
    row_values.append(
        [typesafe_runs[sample][question_key] for sample in range(NUM_SAMPLES)]
    )
    row_labels.append("typesafe_noul")
heatmap_matrix = np.array(row_values)
cmap = plt.get_cmap("RdYlGn_r").copy()  # red = higher P(yes), green = lower P(yes)
cmap.set_bad("white")  # spacer (NaN) rows render as blank

fig, ax = plt.subplots(figsize=(11, 0.26 * len(row_values) + 1))
ax.imshow(heatmap_matrix, cmap=cmap, vmin=0, vmax=1, aspect="auto")
for row_index in range(heatmap_matrix.shape[0]):
    for col_index in range(heatmap_matrix.shape[1]):
        value = heatmap_matrix[row_index, col_index]
        if np.isnan(value):
            continue
        ax.text(
            col_index,
            row_index,
            f"{value:.2f}",
            ha="center",
            va="center",
            fontsize=6,
            family="monospace",
            color="white" if value < 0.22 or value > 0.78 else "black",
        )

ax.set_xticks(range(NUM_SAMPLES))
ax.set_xticklabels(range(1, NUM_SAMPLES + 1), fontsize=7)
ax.set_xlabel("rubric query")
ax.set_yticks(range(len(row_labels)))
ax.set_yticklabels(row_labels, fontsize=7)
ax.tick_params(length=0)
for edge in ("top", "right", "left", "bottom"):
    ax.spines[edge].set_visible(False)

# outer level of the multi-index: the question key, printed once per block and centered, with the
# question text wrapped right under it
y_axis_transform = ax.get_yaxis_transform()
for start, question_key, question_text in blocks:
    center = start + (rows_per_block - 1) / 2
    ax.text(
        -0.2,
        center - 0.7,
        question_key,
        transform=y_axis_transform,
        ha="right",
        va="center",
        fontsize=8,
        fontweight="bold",
    )
    ax.text(
        -0.2,
        center + 0.1,
        textwrap.fill(question_text, 34),
        transform=y_axis_transform,
        ha="right",
        va="top",
        fontsize=6,
        style="italic",
        color="gray",
    )

ax.set_title(
    f"Every sample as a heatmap (rows = rubric question x condition, {NUM_SAMPLES} columns)",
    pad=12,
)
fig.tight_layout()
display(fig)
```

<img src="/img/cases/consistency-noul-cookbook-consistency_noul_cookbook.executed.1.png" alt="output" width="1616" height="5555" data-path="cookbooks/consistency_noul_cookbook/consistency_noul_cookbook.executed.1.png" />

事実確認はほとんどの条件で安定しています。判断が重くなる条件では、LLMの行が動きます：`exclusion`、`rental_eligible`、`fraud_flag`、`manual_review`はサンプル間で変動したり、モデル間で意見が分かれたりします。TypeSafeの`covered`行は`0.5`を横切ります。その他の13問は、この実行全体を通じてその閾値の片側に留まります。

## 強制されたイエスかノーではなく、不確実な判断を許可する

閾値が`0.5`の場合、確率`0.49`と`0.51`は、どちらも大きな不確実性を示しているにもかかわらず、逆の行動を引き起こします。代わりに、アプリケーションは以下を返すことができます：

* `no`は`0.30`より下；
* `uncertain`は`0.30`から`0.70`まで（両端を含む）；
* `yes`は`0.70`より上。

不確実なケースは人間に委ねる。エスカレーションは、返された確率に基づくアプリケーションロジックによるもの：新しい質問は行わず、2回目のAPI呼び出しもしない。この範囲は例示であり、補正された保証でも最適化された閾値でもない。本番環境の境界は、ラベル付き例と、誤った判断およびレビューのコストから設定する。

以下の図は、このバンドを記録されたTypeSafeの確率に適用したものです。

```python
def noul_decision_with_uncertainty(probability: float) -> str:
    """Map valid TypeSafe probabilities through an inclusive uncertainty band."""
    if probability < NOUL_UNCERTAINTY_LOW:
        return "no"
    if probability > NOUL_UNCERTAINTY_HIGH:
        return "yes"
    return "uncertain"


# Keep the probabilities visible beneath each TypeSafe application decision.
policy_decisions = [
    [noul_decision_with_uncertainty(sample[key]) for sample in typesafe_runs]
    for key in QUESTIONS
]
decision_codes = {"no": 0, "uncertain": 1, "yes": 2}
policy_values = [
    [decision_codes[value] for value in row] for row in policy_decisions
]
policy_cmap = ListedColormap(["#a6dba0", "#dddddd", "#92c5de"])
fig_policy, ax_policy = plt.subplots(figsize=(13, 6))
ax_policy.imshow(policy_values, cmap=policy_cmap, vmin=0, vmax=2, aspect="auto")
for row_index, key in enumerate(QUESTIONS):
    for sample_index in range(NUM_SAMPLES):
        decision = policy_decisions[row_index][sample_index]
        probability = typesafe_runs[sample_index][key]
        ax_policy.text(sample_index, row_index, f"{decision}\n{probability:.2f}",
                       ha="center", va="center", fontsize=6)
ax_policy.set_yticks(range(len(QUESTIONS)), list(QUESTIONS))
ax_policy.set_xticks(range(NUM_SAMPLES), range(1, NUM_SAMPLES + 1))
ax_policy.set_xlabel("rubric query")
ax_policy.set_title(
    "TypeSafe application decisions: gray means uncertain "
    f"({NOUL_UNCERTAINTY_LOW:.2f} to {NOUL_UNCERTAINTY_HIGH:.2f} inclusive)"
)
fig_policy.tight_layout()
display(fig_policy)
```

<img src="/img/cases/consistency-noul-cookbook-consistency_noul_cookbook.executed.2.png" alt="output" width="1932" height="883" data-path="cookbooks/consistency_noul_cookbook/consistency_noul_cookbook.executed.2.png" />

レビュー帯は`0.5`周辺の揺らぎを吸収し、反対方向の自動アクションを発行しない。ただし、帯自体にも端が存在する。どちらかの外側境界に近い値でも、`uncertain`とyesまたはnoの間を移動することが可能である。それについて、モデルはより決定論的になるわけではなく、帯をクリアする自動決定が正しいと示されるわけではない。

## TypeSafe プレイグラウンドで開く

以下のリンクは、プレイグラウンドで同じ主張と評価基準を開きます：1つの主張、同じ14の`Noul`質問、およびTypeSafe `jev-latest`。ここでは、上記で使われた変化する`uid`フィールドは省略されています。

```python
playground_link = make_playground_link(
    {"claim": CLAIM},
    {key: Noul(instructions=question) for key, question in QUESTIONS.items()},
    models=[TYPESAFE_MODEL],
)
display(
    Markdown(
        f"🔗 [Open this claim + rubric in the TypeSafe playground]({playground_link})"
    )
)
```

[この主張と評価基準を TypeSafe プレイグラウンドで開く →](https://console.typesafe.ai/playground#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-lTeK+k6y-RmhCs0sw3EbzkhAIoT8JY8AruShBfyqUAsMefSm85Z5rSrF4Doo94xSDGBNekECjC1iEljX29d+hYQqKCzk-QN4cnhRuGAEqpUKSYrzYwHBC5Qw0CAQ21AABq7xrzI28IoaGgxlieFmDYCAhhyApC+CAVKbYpBUFyjgCEEwgA)