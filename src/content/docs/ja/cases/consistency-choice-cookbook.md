---
title: "自己一貫性：選択肢"
description: "モデレーション判断に不確実な結果を追加し、ラベル合意率と自動処置の割合を比較する。"
section: cases
order: 150
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/consistency_choice_cookbook"
translatedFrom: en
---
このクックブックは、境界線上のユーザー投稿を1つ選び、モデレーション基準を15回適用し、
各回答が繰り返しを通じて安定しているかを確認します。各チェックは
`Choice`であり、各回答は固定されたセットからの1つのラベルです。モデレーションパイプラインにおいて
このラベルはルーティング決定です：削除するか投稿を維持するか、エスカレートするか自動解決するか、
スレッド、スパム、または一般キューに送信するか。ラベルが実行ごとに揺らぐ場合、
同じ投稿が理由もなく異なる場所にルーティングされます。

評価基準は8 `Choice`問で、1回のランはこれら8問すべてに回答する1回の呼び出しです。各条件（モデル1つと設定1つの組み合わせ）につき15
15
回繰り返し、返ってきたすべてのラベルをプロットします。

条件：

* 非推論型LLM `claude-haiku-4-5`および `gpt-5.4-mini`は、温度 `0`および
 APIのデフォルト設定を使用します。
* 推論型LLM `gpt-5.5`および `claude-opus-4-8`は、温度調整ダイヤルを持ちません。
* TypeSafe: 8 `Choice`の質問に対して1回の `system_one`呼び出しを行い、各呼び出しごとに
 新規の `uid`
 フィールド（使い捨ての一意な値）を設定し、noulのクックブック設定に合わせます。

確認すべき点：選択したラベルは1つの条件内で反転する可能性があり、TypeSafeもその対象となります。また、条件同士が矛盾することもあります。

このランでは、LLM分布設定は87.5%から100%の確率でその多数派ラベルを繰り返すのに対し、TypeSafeでは90.8%であった。TypeSafeは6つのLLM分布条件のうち5つよりも平均確率変動が低く、温度0でのHaikuはさらに変動が少ない。確率が近接していてもルーティング変更は可能であり、TypeSafeは8問中2問で切り替わっている。

アプリケーションの判断には、少なくとも`0.60`の最高確率も必要です。そうでない場合、結果は`uncertain`となり、人間のレビューに回されます。TypeSafeの合意率は99.2%に上昇し、回答の74.2%に自動ラベルが付けられます。生の出力を表示し、LLMの確率条件にも同じ閾値を適用し、棄権と変更が可視化されるようにします。

## セットアップ

```bash
pip install anthropic openai matplotlib ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

`TYPESAFE_API_KEY`、`ANTHROPIC_API_KEY`、および`OPENAI_API_KEY`を設定します。
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
from typesafe_sdk import Choice, TypeSafeClient

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
NUM_SAMPLES = 15  # repeated post+rubric calls per condition
MIN_CHOICE_PROBABILITY = 0.60  # illustrative automatic-action threshold

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

## 状態：境界線上のユーザー投稿、JSON形式

以下の投稿は、両者の間に位置するように構成されています。その言語は激しく、侮辱的であり、ある特定の人物に向けられている部分もあれば、議論やコミュニティに向けられている部分もあります。これにはプラットフォーム外の招待（別のサイトへ人を引き込むリンク）が含まれており、当該アカウントには過去の違反記録が1回あり、4件のユーザーからの報告があり、また脅しのような表現が明確に整理されていません。

ここには単に明白な答えがあるわけではなく、それが要点です：小さな表記の違いが、同じ投稿を強制処理のパス間でランダムに移動してはいけません。

プロンプトには LLM が `json.dumps(POST)` を取得します。TypeSafe は Python の辞書（dict）を直接取得します。

```python
POST = {
    "post_id": "P-88213",
    "author": {
        "user_id": "u/4471",
        "account_age_days": 38,
        "prior_strikes": 1,
        "followers": 210,
    },
    "context": {
        "surface": "public reply",
        "in_reply_to": "another user defending a game patch",
        "community": "r/gamedebates",
    },
    "content": {
        "text": (
            "Are you seriously this dense? Anyone who defends that patch is a complete clown and "
            "should be embarrassed to even post here. People like you are what's ruining this "
            "community and honestly you need to be dealt with. Come say it to my face, invite's "
            "right here. Keep it up and I'll end your whole channel."
        ),
        "has_link": True,
        "link_domain": "discord.gg",
        "language": "en",
    },
    "reports": {"user_reports": 4, "report_reasons": ["harassment", "spam", "threat"]},
}
```

## ルーブリック：8 `Choice` 問

各質問には`key`、指示文、および固定されたラベルセットが含まれます。質問内のラベルは相互に排他的（正確に1つが適用）であり、それぞれに短い説明が付いています。TypeSafeは、選択された`choice`とラベル上の`probabilities`分布を返します。LLMには同じラベルセットを使用するよう求められており、これにより各行の比較可能性が保たれます。

```python
QUESTIONS = {
    "category": (
        "What is the single most applicable content-policy category for this post?",
        {
            "None": "No policy violation of any kind.",
            "Harass": "Insults or demeans a person, with no threat of harm and no protected-class attack.",
            "Hate": "Attacks a person or group over a protected characteristic (race, religion, gender, ...).",
            "Violence": "Makes a credible threat of harm or incites violence against someone.",
            "Spam": "Unsolicited promotion or link spam, with no personal attack.",
            "Sexual": "Sexual or adult content.",
        },
    ),
    "primary_risk": (
        "What is the primary moderation risk that should drive triage for this post?",
        {
            "Harassment": "Personal attack or targeted abuse is the main risk.",
            "Violence": "A threat of harm or intimidation is the main risk.",
            "LinkAbuse": "External-link or off-platform coordination risk is the main risk.",
            "AccountHistory": "Prior account history or repeat behavior is the main risk.",
            "LowRisk": "No meaningful moderation risk is present.",
        },
    ),
    "target": (
        "Who or what is the content primarily directed at?",
        {
            "None": "Not directed at anyone in particular.",
            "Person": "Directed at one specific individual.",
            "Group": "Directed at a protected group or class.",
            "Platform": "Directed at the community or platform itself, not a person.",
        },
    ),
    "action": (
        "What enforcement action should be taken on this post?",
        {
            "Allow": "Leave the post up with no action.",
            "Warn": "Leave the post up but attach a warning label.",
            "Remove": "Remove the post, but do not penalize the account.",
            "Strike": "Remove the post and add a strike to the account.",
            "Escalate": "Take no automated action; hold for a human decision.",
        },
    ),
    "queue": (
        "Which single moderation queue should own this post?",
        {
            "Auto": "Auto-resolve; no human queue needed.",
            "General": "General moderation queue.",
            "Threat": "Threat / violence response queue.",
            "Spam": "Spam and platform-abuse queue.",
            "TSLead": "Trust-and-safety lead / senior queue.",
        },
    ),
    "link_handling": (
        "How should any external link or off-platform invite in the post be handled?",
        {
            "Allow": "Leave the link in place.",
            "RmLink": "Strip or disable the link but keep the post.",
            "Brigade": "Treat the link as coordinated brigading and action it as abuse.",
            "Escalate": "Send the link to a specialist to assess before acting.",
        },
    ),
    "review_path": (
        "Who should make the final call on this post?",
        {
            "Auto": "Automated action; no human review.",
            "Human": "A frontline human moderator makes the call.",
            "Senior": "A senior or specialist reviewer is required.",
            "Legal": "Route to legal or law-enforcement escalation.",
        },
    ),
    "severity": (
        "What is the overall severity of this post?",
        {
            "None": "No violation.",
            "Low": "Rude or dismissive, but essentially harmless.",
            "Medium": "Personal harassment with no clearly credible threat.",
            "High": "Harassment together with a threat that could be read as credible.",
        },
    ),
}
```

## 私たちがどのように問いかけるか

各LLM呼び出しは、`json.dumps(POST)`、全8問、および許可されたすべてのラベルを含む1つのプロンプトです。回答形式は2種類あります。分布モードでは、モデルは各質問ごとにラベルごとの確率を持つ1つのJSONオブジェクトを返します。単一選択モードでは、各質問ごとに1つのラベルのみを返し、当社の分析ではそのラベルに確率質量のすべてを割り当てます。

TypeSafeの呼び出しは、同じ投稿に対する1`system_one`回のリクエストと、同じ8`Choice`回の質問に基づいており、質問ごとに1つの分布を返します。

すべてのクエリには、新しい`uid`が必ず付与されます。これは、投稿やルビрикはそのままに、実行ごとに変わる使い捨ての一意な値です。これはLLMのプロンプト内およびTypeSafeの状態における追加フィールドとして表示されます。この構成では、無関係なフィールドに対する感応度と、同一の要求で発生するはずのばらつきを分離することができません。

各ヘルパーは、回答、推定コスト、および往復レイテンシを返します。

````python
def argmax_label(values: list, labels: list[str]) -> str | None:
    """The label with the most probability mass, or ``None`` if any value is missing or
    non-numeric -- a partially parsed distribution never yields a confident-looking pick."""
    numeric = [_numeric_value(value) for value in values]
    if any(value is None for value in numeric):
        return None
    return labels[int(np.argmax(numeric))]


def choice_decision_with_uncertainty(values: list, labels: list[str]) -> str | None:
    """Abstain below the action threshold; retain invalid results as parse failures."""
    label = argmax_label(values, labels)
    if label is None:
        return None
    probabilities = [float(value) for value in values]
    if any(value < 0 or value > 1 for value in probabilities):
        return None
    return label if max(probabilities) >= MIN_CHOICE_PROBABILITY else "uncertain"


def choice_decision_annotation(values: list, labels: list[str]) -> str:
    """Show the application decision and top probability in a heatmap cell."""
    decision = choice_decision_with_uncertainty(values, labels)
    if decision is None:
        return ""
    probability = max(float(value) for value in values)
    probability_text = f"{probability:.2f}".removeprefix("0")
    return f"{decision} {probability_text}"


def _numeric_value(value: object) -> float | None:
    """A finite numeric value, or ``None`` if the model emitted something unusable."""
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return None
    return numeric if np.isfinite(numeric) else None


def parse_distribution(raw: object, labels: list[str]) -> list[float]:
    """Map a model's already-parsed per-question reply to per-label probabilities, in label order
    (distribution-mode answers left un-normalized).

    A single-pick reply is a single label string -> all the mass on that exact label; a
    distribution-mode reply is a dict read label by label. Anything that doesn't match a known label
    or isn't a finite number is left NaN -- we report the gap rather than massaging the reply (e.g.
    stripping an echoed description) to make it fit."""
    if isinstance(raw, str):  # single-pick mode: a single chosen label
        if raw in labels:
            return [1.0 if label == raw else 0.0 for label in labels]
        return [float("nan")] * len(labels)
    if not isinstance(raw, dict):
        return [float("nan")] * len(labels)
    return [
        value if (value := _numeric_value(raw.get(label))) is not None else float("nan")
        for label in labels
    ]


def rubric_prompt(mode: str, sample_index: int, rubric_hash: str) -> str:
    """The post + all questions (with their label sets) in one prompt; ``mode`` picks the format.

    ``mode="dist"`` asks for a probability distribution over each question's labels; the single-pick
    mode (``mode="single"``) asks for a single label per question. The uid line combines
    ``rubric_hash`` (which rubric version) with ``sample_index`` and a random token, so every repeat
    is a distinct, independent draw and two different rubrics never share a nonce."""
    lines = []
    for key, (instructions, choices) in QUESTIONS.items():
        labels = "\n".join(f"     {label}: {desc}" for label, desc in choices.items())
        lines.append(f"- {key}: {instructions}\n   labels:\n{labels}")
    exclusivity = (
        "\n\nEach question's labels are mutually exclusive: exactly one applies. If a post could "
        "arguably fit more than one, pick the single most severe / most specific label per the "
        "label descriptions."
    )
    if mode == "single":
        answer_format = (
            "\n\nFor each question, pick exactly ONE label.\nRespond with ONLY a JSON object "
            "mapping each question's key to one of that question's bare labels (the label only, "
            "not its description), with one entry per question."
        )
    else:
        answer_format = (
            "\n\nFor each question, give a probability distribution over that question's labels "
            "(values 0.00-1.00 that sum to 1).\nRespond with ONLY a JSON object mapping each "
            "question's key to an object mapping that question's bare labels (the label only, "
            "not its description) to probabilities, with one entry per question."
        )
    return (
        f"uid: {rubric_hash}:{sample_index}:{token_hex(4)}\n\n"
        f"Document (a reported user post):\n{json.dumps(POST, indent=2)}\n\nQuestions:\n"
        + "\n".join(lines)
        + exclusivity
        + answer_format
    )


def _cost(prices: tuple[float, float], input_tokens: int, output_tokens: int) -> float:
    return input_tokens / 1e6 * prices[0] + output_tokens / 1e6 * prices[1]


def _call_llm(model: str, prompt: str, temperature: float | None):
    """One LLM call -> (text, cost_usd, latency_s), routed by model name."""
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


# All samples (LLM and TypeSafe) are cached to ``json_cache.json``, which ships with the cookbook, so
# re-rendering is instant and reproduces the published numbers with no API spend. ``sample_index``
# seeds the uid buster and is part of the cache key, so each of the NUM_SAMPLES repeats is its own
# entry and its own independent draw, not one draw replayed. Delete ``json_cache.json`` to re-sample
# everything live.
json_cache = JsonCache(Path("json_cache.json"))


def _rubric_fingerprint() -> str:
    """Short digest of everything that shapes the prompt/rubric: the state and every question's
    text and label set. Passed into the cached calls below so that editing the post or any question
    changes the cache key and forces a fresh sample, instead of silently serving a stale answer that
    was generated for the old wording."""
    payload = json.dumps([POST, QUESTIONS], sort_keys=True, default=str)
    return hashlib.sha256(payload.encode()).hexdigest()[:12]


RUBRIC_HASH = _rubric_fingerprint()


@json_cache
def _call_typesafe(sample_index: int, rubric_hash: str, model: str):
    """Return distributions, token usage, latency, and model metadata for one call.

    ``rubric_hash`` and ``model`` prevent reuse across rubric or model changes.
    Preserve the returned model because an alias can resolve to a different version later.
    """
    questions = {
        key: Choice(instructions=instructions, criteria=choices)
        for key, (instructions, choices) in QUESTIONS.items()
    }
    started = perf_counter()
    response = typesafe_client.system_one(
        model=model,
        state={"uid": f"{rubric_hash}:{sample_index}:{token_hex(4)}", "post": POST},
        questions=questions,
    )
    distributions = {}
    for key, (_instructions, choices) in QUESTIONS.items():
        probabilities = dict(response.answers[key].probabilities)
        distributions[key] = [
            probabilities.get(label, float("nan")) for label in choices
        ]
    return (
        distributions,
        response.usage.input_tokens,
        response.usage.output_tokens,
        perf_counter() - started,
        {"requested_model": model, "response_model": response.model},
    )


@json_cache
def ask_llm_rubric(
    model: str,
    mode: str,
    temperature: float | None,
    sample_index: int,
    rubric_hash: str,
):
    """One LLM rubric query -> (per-question label distributions keyed by question key, cost_usd,
    latency_s); NaNs if the reply doesn't parse.

    ``mode="dist"`` parses 8 label distributions; the single-pick mode (``mode="single"``) parses 8
    single labels and puts all the mass on each. ``rubric_hash`` goes into the prompt's uid nonce
    (and so the cache key), so an edited state/rubric busts the cache instead of serving a stale
    answer."""
    prompt = rubric_prompt(mode, sample_index, rubric_hash)
    text, cost, latency = _call_llm(model, prompt, temperature)
    # Peel a single ```json ... ``` fence (claude-haiku-4-5 sometimes adds one despite "ONLY a JSON
    # object").
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped[stripped.find("\n") + 1 :] if "\n" in stripped else ""
        if stripped.rstrip().endswith("```"):
            stripped = stripped.rstrip()[: -len("```")]
    try:
        raw = json.loads(stripped)
    except (ValueError, json.JSONDecodeError):
        raw = {}
    if not isinstance(raw, dict):
        raw = {}
    distributions = {
        key: parse_distribution(raw.get(key), list(choices))
        for key, (_instructions, choices) in QUESTIONS.items()
    }
    return distributions, cost, latency
````

## 実験条件

### 実験グリッド

| モデルグループ | モデル | 分布 (t=0) | 分布 (デフォルト) | 単一選択 (t=0) |
| -------------------- | -------------------------------- | :----------------: | :--------------------: | :---------------: |
| 推論非対応モデル | `claude-haiku-4-5` | ✓ | ✓ | ✓ |
| 推論非対応モデル | `gpt-5.4-mini` | ✓ | ✓ | ✓ |
| 推論対応モデル | `gpt-5.5` | — | ✓ | — |
| 推論対応モデル | `claude-opus-4-8` | — | ✓ | — |
| TypeSafe | `jev-latest` (`typesafe_choice`) | — | ✓ | — |

* `✓`は15回の反復でテストされた条件を示し、`—`はテストされていない組み合わせを示します。
* デフォルトの列は温度引数を送信しません：推論モデルはAPIのデフォルトを使用し、推論モデルとTypeSafeは温度設定なしで実行されます。
* 単一選択の条件では、質問ごとに1つのラベルが返されます。
* 再現性のために温度`0`が一般的に推奨されるため、APIのデフォルトと比較されます。

`NUM_SAMPLES` = 15 条件ごとに 15 回の繰り返しを行います。各繰り返しには独自のキャッシュキーがあり、個別の描画としてカウントされます。キャッシュ（`json_cache.json`）はクックブックに同梱されているため、再描画時に再利用され、API コールは発生しません。キャッシュを削除すると、再度ライブサンプリングが行われます。

```python
CONDITIONS = []
for (
    model
) in BASE_MODELS:  # non-reasoning models: dist at t=0 / default, then a single-pick variant
    for temp_value, temp_label in ((0, "0"), (None, "default")):
        CONDITIONS.append(
            {
                "label": f"{model} t={temp_label}",
                "model": model,
                "temp": temp_value,
                "mode": "dist",
            }
        )
    CONDITIONS.append(
        {
            "label": f"{model} single-pick t=0",
            "model": model,
            "temp": 0,
            "mode": "single",
        }
    )
CONDITIONS += [  # reasoning models: one distribution condition each
    {
        "label": f"{model}-reasoning",
        "model": model,
        "temp": None,
        "mode": "dist",
    }
    for model in REASONING_MODELS
]
LABELS = [condition["label"] for condition in CONDITIONS]
TYPESAFE_LABEL = "typesafe_choice"
ALL_LABELS = [*LABELS, TYPESAFE_LABEL]

runs: dict[
    str, list
] = {}  # label -> NUM_SAMPLES samples of {question key: distribution}
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

# TypeSafe samples are drawn sequentially, after the LLM pool has closed, so each call's latency is a
# clean round trip rather than one measured under the 16-way LLM thread contention.
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
    (distributions, _cost(TYPESAFE_PRICE, input_tokens, output_tokens), latency)
    for distributions, input_tokens, output_tokens, latency, _metadata in typesafe_usage_results
]
typesafe_runs = [result[0] for result in typesafe_results]
stats[TYPESAFE_LABEL] = [(result[1], result[2]) for result in typesafe_results]
```

```
TypeSafe requested model: jev-latest
TypeSafe returned models (calls): {'jev-1.13.0': 15}
```

### コスト＋速度（ルーブリッククエリごと）

以下のコストは、セットアップの過去の価格仮定を使用しており、TypeSafeの`speed_latest`レートが含まれます。これらは検証された`jev-latest`価格や現在の請求金額ではありません。

1行は1回の8問評価基準呼び出しです。`time/call`と`cost/call`は15回の呼び出しの平均値であり、`vs ts_choice`列はTypeSafeの数値で除算します。LLMは16-wayプールで実行されます。

```python
typesafe_cost = mean([cost for cost, _latency in stats["typesafe_choice"]])
typesafe_latency = mean([latency for _cost, latency in stats["typesafe_choice"]])
name_w = max(len(name) for name in ALL_LABELS) + 2  # fit the longest condition label
# Stack comparison headers so the relative speed and cost columns can stay narrow.
print(
    f"{'':<{name_w + 31}}{'speed vs':>11}{'cost vs':>11}\n"
    f"{'condition':<{name_w}}{'calls':>7}{'time/call':>11}{'cost/call':>13}"
    f"{'ts_choice':>11}{'ts_choice':>11}"
)
for name in ALL_LABELS:
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
condition                           calls  time/call    cost/call  ts_choice  ts_choice
claude-haiku-4-5 t=0                   15     3853ms    $0.003498      33.8x      76.1x
claude-haiku-4-5 t=default             15     3860ms    $0.003494      33.8x      76.0x
claude-haiku-4-5 single-pick t=0       15      992ms    $0.001527       8.7x      33.2x
gpt-5.4-mini t=0                       15     2293ms    $0.002299      20.1x      50.0x
gpt-5.4-mini t=default                 15     1986ms    $0.002164      17.4x      47.1x
gpt-5.4-mini single-pick t=0           15      826ms    $0.000936       7.2x      20.3x
gpt-5.5-reasoning                      15    12978ms    $0.041255     113.7x     897.4x
claude-opus-4-8-reasoning              15    10376ms    $0.028375      90.9x     617.2x
typesafe_choice                        15      114ms    $0.000046       1.0x       1.0x
```

このラン `typesafe_choice` の平均往復レイテンシは114msです。上記の同時実行設定の下、LLMの条件は呼び出しあたり826msから13.0秒の範囲です。

## プロット：各サンプルの判断をヒートマップとして

読み方：

* 外側行グループ：質問。
* 内側行：条件。
* 列：1つの完全なルーブリック呼び出し。
* セルテキスト：アプリケーションの判断と、最上位ラベルの確率。
* セル色：その質問内でのラベルの位置。したがって、行全体にわたって同じ色であれば、常に同じ判断を意味する。
* グレー `uncertain`：最上位確率が `0.60` より低い場合、ケースは人間のレビューに回される。
* 斜線 `n/a`：返信が使用可能なラベルに解析されなかった（解析失敗）。
* 空白行は単なるスペーサーである。

単一選択条件は返されたラベルを保持します：これらは不確実性推定を提供しません。

```python
GAP = 1  # blank spacer row(s) between question blocks
HEAT_LABELS = ALL_LABELS
rows_per_block = len(HEAT_LABELS)  # rows per question block
pooled_runs = {
    **runs,
    TYPESAFE_LABEL: typesafe_runs,
}

row_index_values, row_text, row_labels, blocks = [], [], [], []
for question_index, (question_key, (question_text, choices)) in enumerate(
    QUESTIONS.items()
):
    labels = list(choices)
    if question_index:  # blank spacer rows (NaN -> rendered white) separate the blocks
        row_index_values.extend([np.nan] * NUM_SAMPLES for _ in range(GAP))
        row_text.extend([[""] * NUM_SAMPLES for _ in range(GAP)])
        row_labels.extend([""] * GAP)
    blocks.append((len(row_index_values), question_key, question_text))
    for label in HEAT_LABELS:
        values_by_sample = [
            pooled_runs[label][sample][question_key] for sample in range(NUM_SAMPLES)
        ]
        picks = [
            choice_decision_with_uncertainty(values, labels) for values in values_by_sample
        ]
        row_index_values.append(
            [
                10 if pick == "uncertain" else labels.index(pick) if pick in labels else np.nan
                for pick in picks
            ]
        )
        row_text.append(
            [choice_decision_annotation(values, labels) for values in values_by_sample]
        )
        row_labels.append(label)

heatmap_matrix = np.array(row_index_values, dtype=float)
# Reserve gray for abstentions while concrete-label colors remain local to each question.
cmap = ListedColormap([*plt.get_cmap("tab10").colors, "#dddddd"])
cmap.set_bad(
    "white"
)  # NaN cells (spacer rows AND unparseable replies) render white here...

fig, ax = plt.subplots(figsize=(15, 0.33 * len(row_index_values) + 1))
ax.imshow(heatmap_matrix, cmap=cmap, vmin=0, vmax=10, aspect="auto")
for row in range(heatmap_matrix.shape[0]):
    is_spacer_row = row_labels[row] == ""  # blank separator between question blocks
    for col in range(heatmap_matrix.shape[1]):
        label_text = row_text[row][col]
        if label_text:
            ax.text(
                col,
                row,
                label_text,
                ha="center",
                va="center",
                fontsize=5.7,
                family="monospace",
                color="black",
            )
        elif (
            not is_spacer_row
        ):  # ...but an unparseable reply gets a hatched "n/a", not blank white
            ax.add_patch(
                plt.Rectangle(
                    (col - 0.5, row - 0.5),
                    1,
                    1,
                    facecolor="#e8e8e8",
                    edgecolor="#b0b0b0",
                    hatch="////",
                    linewidth=0,
                )
            )
            ax.text(
                col,
                row,
                "n/a",
                ha="center",
                va="center",
                fontsize=5,
                family="monospace",
                color="#b30000",
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
    f"Every sample's decision + top probability; gray = uncertain (< {MIN_CHOICE_PROBABILITY:.2f})\n"
    f"(rows = question x condition, {NUM_SAMPLES} columns)",
    pad=12,
)
fig.tight_layout()
display(fig)
```

<img src="/img/cases/consistency-choice-cookbook-consistency_choice_cookbook.executed.1.png" alt="output" width="2230" height="4044" data-path="cookbooks/consistency_choice_cookbook/consistency_choice_cookbook.executed.1.png" />

より明確な質問は安定している：`target`は全体を通してPersonを読み取り、`severity`はHighを読み取る。境界線上のものは条件間で分かれる：`category`、`primary_risk`、`action`、`review_path`、および`link_handling`。いくつかの条件では、15回の反復内でもラベルが反転することがある。棄権以前、TypeSafeは`primary_risk`（ハラスメント11回、暴力4回）および`link_handling`（RmLink8回、Brigade7回）において最上位ラベルを変更する。両方の行は、現在、その最上位確率が`0.60`を下回っているため、全体を通して`uncertain`を示している。

## 確率の標準偏差

これは選ばれたラベルだけでなく、確率ベクトル全体を対象とします。各条件について、質問ごとに15個の分布をすべて収集し、各ラベルの確率の繰り返し間での標準偏差（実行間でどれだけ変動するか）を算出し、その後、すべてのラベルと質問にわたってそれらの標準偏差の平均を取ります。また、単一のラベル標準偏差の最大値も報告し、構文解析の失敗は別途カウントします。

表は、TypeSafe に対してすべての確率出力 LLM の条件を比較している。単一選択の行は、確率分布ではなく確実なラベルを出力するため、除外されている。

```python
def probability_std_stats(samples: list) -> tuple[float, float, float]:
    """Mean label std dev, max label std dev, parse-failure rate."""
    label_stds = []
    parse_failures = []
    for question_key in QUESTIONS:
        arr = np.array(
            [sample[question_key] for sample in samples],
            dtype=float,
        )
        parse_failures.extend(np.isnan(arr).any(axis=1).tolist())
        label_stds.extend(np.nanstd(arr, axis=0).tolist())
    return (
        float(np.nanmean(label_stds)),
        float(np.nanmax(label_stds)),
        float(np.mean(parse_failures)),
    )


PROBABILITY_OUTPUT_LABELS = [
    condition["label"] for condition in CONDITIONS if condition["mode"] == "dist"
] + [TYPESAFE_LABEL]
probability_std_by_label = {
    label: probability_std_stats(pooled_runs[label])
    for label in PROBABILITY_OUTPUT_LABELS
}
typesafe_mean_std = probability_std_by_label[TYPESAFE_LABEL][0]

print(
    f"{'condition':<{name_w}}{'mean prob std':>15}{'max prob std':>14}"
    f"{'parse fail':>12}{'x TypeSafe':>12}"
)
for label in PROBABILITY_OUTPUT_LABELS:
    mean_std, max_std, parse_failure_rate = probability_std_by_label[label]
    relative_std = mean_std / typesafe_mean_std
    print(
        f"{label:<{name_w}}{mean_std:>15.4f}{max_std:>14.4f}"
        f"{parse_failure_rate:>11.0%}{relative_std:>12.2f}x"
    )
```

```
condition                           mean prob std  max prob std  parse fail  x TypeSafe
claude-haiku-4-5 t=0                       0.0012        0.0221         0%        0.12x
claude-haiku-4-5 t=default                 0.0516        0.3150         1%        5.29x
gpt-5.4-mini t=0                           0.0312        0.0905         0%        3.20x
gpt-5.4-mini t=default                     0.0543        0.2303         0%        5.56x
gpt-5.5-reasoning                          0.0305        0.1047         0%        3.12x
claude-opus-4-8-reasoning                  0.0245        0.0693         0%        2.52x
typesafe_choice                            0.0098        0.0515         0%        1.00x
```

このランにおいて、TypeSafeは平均確率標準偏差が`0.0098`、単一ラベルの最大標準偏差が`0.0515`です。温度0におけるHaikuは、より低い平均標準偏差`0.0012`を示します。他の5つのLLM確率条件は`0.0245`から`0.0543`の範囲にあり、TypeSafeの平均の約`2.5x`から`5.6x`です。2つのラベルが近い場合、小さな変化でもトップラベルが切り替わる可能性があります。

## プロット：不確実な結果を伴う意思決定の合意

`uncertain`の確率が`0.60`を下回る場合、`uncertain`を返す。各確率出力条件および質問について、`uncertain`を含む最も一般的なアプリケーションの判断をカウントし、15回の試行すべてで割る。パース失敗は合意数にカウントされる。各棒グラフは、8つの質問すべてにおけるスコアの平均を示し、合意度が最も高い順に並べる。

不確定性推定を提供しないため、単一選択のLLM条件は除外される。

```python
# Compute policy decisions and agreement once for both this chart and the comparison table.
decisions_by_condition = {}
policy_agreement_by_condition = {}
for label in PROBABILITY_OUTPUT_LABELS:
    decisions = [
        [
            choice_decision_with_uncertainty(sample[key], list(choices))
            for sample in pooled_runs[label]
        ]
        for key, (_instructions, choices) in QUESTIONS.items()
    ]
    decisions_by_condition[label] = decisions
    shares = [
        max(Counter(value for value in row if value is not None).values(), default=0)
        / NUM_SAMPLES
        for row in decisions
    ]
    policy_agreement_by_condition[label] = mean(shares)

# Sort by the measured agreement, keeping TypeSafe's color independent of its rank.
bar_labels = sorted(
    PROBABILITY_OUTPUT_LABELS, key=policy_agreement_by_condition.__getitem__, reverse=True
)
rates = [policy_agreement_by_condition[label] for label in bar_labels]

fig_bar, bar_ax = plt.subplots(figsize=(7, 0.45 * len(bar_labels) + 1))
positions = range(len(bar_labels))
bar_ax.barh(
    list(positions),
    rates,
    color=["#2b8cbe" if label == TYPESAFE_LABEL else "#fe9929" for label in bar_labels],
    alpha=0.85,
)
for label, position, rate in zip(bar_labels, positions, rates):
    marker = "*" if label == "claude-haiku-4-5 t=0" else ""
    bar_ax.text(
        rate + 0.01, position, f"{rate:.1%}{marker}", va="center", fontsize=8, color="gray"
    )
bar_ax.set_yticks(list(positions))
bar_ax.set_yticklabels(bar_labels, fontsize=8)
bar_ax.invert_yaxis()  # first condition on top
bar_ax.set_xlim(0, 1.08)
bar_ax.set_xticks(np.linspace(0, 1, 6))
bar_ax.set_xlabel("decision agreement across 15 re-runs (mean over 8 questions)")
for edge in ("top", "right", "left"):
    bar_ax.spines[edge].set_visible(False)
bar_ax.tick_params(length=0)
fig_bar.suptitle("Decision agreement including uncertain outcomes", y=1.0)
# Keep the caveat inside the exported chart so it travels with the 100% annotation.
fig_bar.text(
    0.01,
    0.01,
    "* Haiku t=0: 100% repeatability does not imply correctness.\n"
    "  This experiment does not measure accuracy.",
    fontsize=8,
)
fig_bar.tight_layout(rect=(0, 0.11, 1, 1))
display(fig_bar)
```

<img src="/img/cases/consistency-choice-cookbook-consistency_choice_cookbook.executed.2.png" alt="output" width="1052" height="651" data-path="cookbooks/consistency_choice_cookbook/consistency_choice_cookbook.executed.2.png" />

`0.60` ルールのもと、温度0でのHaikuは100%のスコアを記録した。TypeSafeは99.2%で、その他のLLM条件は84.2%から94.2%の範囲に収まった。TypeSafeは回答の25.8%で`uncertain`を返し、残りの74.2%で自動的に行動した。温度0でのHaikuは一度もAbstainしなかった。これらのパーセンテージは反復可能性のみを測定するものである。以下の表は、このチャートのポリシー合意に対して、生じた同意率とAbstention率を並べて示している。

## 不確実な確率が不確実な意思決定を生む

小さな確率の変化で、近いラベル同士が入れ替わることがある。アプリケーションは勝者に必ずしも従う必要はなく、最上位の確率が`uncertain`を下回る場合は`0.60`を返し、そのケースを人間に送る。`0.60`の場合、最上位のラベルを選択する。これはAPIの別の`confidence`フィールドではなく、返された確率を使用し、モデル呼び出しを追加しない。

しきい値は、例示されたアプリケーションポリシーであり、較正された保証や、この実行の合意を最大化するために選ばれたしきい値ではありません。本番環境のしきい値は、ラベル付き例、誤ったアクションのコスト、および人間のレビューを用いて選択してください。

確率出力の条件にはすべて同じルールを適用する。単一選択のLLM応答には確率推定がなく、その合成のワンホットベクトルは不確実性を測定できないため、合意チャートおよび表からは除外される。

```python
def agreement_rate(samples: list) -> float:
    """Mean over questions of the raw plurality label's share across all NUM_SAMPLES draws.

    Parse failures count against agreement because a failed route is not a repeated decision.
    """
    shares = []
    for question_key, (_instructions, choices) in QUESTIONS.items():
        labels = list(choices)
        picks = [
            argmax_label(samples[sample][question_key], labels)
            for sample in range(NUM_SAMPLES)
        ]
        picks = [pick for pick in picks if pick is not None]
        if not picks:
            shares.append(0.0)
            continue
        top = Counter(picks).most_common(1)[0][1]
        shares.append(top / NUM_SAMPLES)
    return mean(shares) if shares else float("nan")


# Keep failures separate from abstentions and count conflicting concrete actions per question.
print(
    f"{'condition':<{name_w}}{'raw agree':>12}{'policy agree':>14}"
    f"{'uncertain':>12}{'automatic':>12}{'conflicts':>11}"
)
for label in PROBABILITY_OUTPUT_LABELS:
    decisions = decisions_by_condition[label]
    flat = [value for row in decisions for value in row]
    uncertain_rate = mean(value == "uncertain" for value in flat)
    automatic_rate = mean(value not in (None, "uncertain") for value in flat)
    conflicts = sum(
        len({value for value in row if value not in (None, "uncertain")}) > 1
        for row in decisions
    )
    print(
        f"{label:<{name_w}}{agreement_rate(pooled_runs[label]):>11.1%}"
        f"{policy_agreement_by_condition[label]:>13.1%}{uncertain_rate:>11.1%}"
        f"{automatic_rate:>11.1%}{conflicts:>11}"
    )
```

```
condition                            raw agree  policy agree   uncertain   automatic  conflicts
claude-haiku-4-5 t=0                   100.0%       100.0%       0.0%     100.0%          0
claude-haiku-4-5 t=default              87.5%        86.7%       0.8%      98.3%          2
gpt-5.4-mini t=0                        99.2%        87.5%      12.5%      87.5%          0
gpt-5.4-mini t=default                  90.8%        84.2%      22.5%      77.5%          2
gpt-5.5-reasoning                       90.0%        93.3%      30.8%      69.2%          1
claude-opus-4-8-reasoning               92.5%        94.2%      33.3%      66.7%          0
typesafe_choice                         90.8%        99.2%      25.8%      74.2%          0
```

`policy agree`は`uncertain`を意思決定としてカウントします；パース失敗は合意に対してカウントされます。
`automatic`は、ラベルを選択するすべての回答の割合です。`conflicts`は、放棄を無視して、繰り返しの間で複数の具体的なラベルを持つ質問の数をカウントします。これらの指標は、再現性とアプリケーションが行動する頻度を記述するものであり、その行動が正しいかどうかを示すものではありません。

TypeSafeの合意率は90.8%から99.2%に上昇した。回答のうち25.8%が不確実で、74.2%が自動的だった。`primary_risk`と`link_handling`は繰り返すたびに常に不確実性を示し、`category`は暴力と`uncertain`の間で交互に切り替わり、繰り返しのうち一部では行動閾値を超え、他の一部では超えなかった。どの質問も、2つの異なる具体的なTypeSafeラベルを生成しなかった。これらは正確性や優位性を示すものではない：温度0におけるHaikuはここで100%の合意率を示し、棄権はなかった。

```python
# Show every TypeSafe decision while retaining the top probability behind it.
policy_decisions = decisions_by_condition[TYPESAFE_LABEL]
policy_values = []
for row, (_key, (_instructions, choices)) in zip(policy_decisions, QUESTIONS.items()):
    labels = list(choices)
    policy_values.append([
        10 if value == "uncertain" else labels.index(value) if value is not None else np.nan
        for value in row
    ])
policy_cmap = ListedColormap([*plt.get_cmap("tab10").colors, "#dddddd"])
policy_cmap.set_bad("white")
fig_policy, ax_policy = plt.subplots(figsize=(13, 4))
ax_policy.imshow(policy_values, cmap=policy_cmap, vmin=0, vmax=10, aspect="auto")
for row_index, key in enumerate(QUESTIONS):
    for sample_index in range(NUM_SAMPLES):
        decision = policy_decisions[row_index][sample_index]
        probability = max(typesafe_runs[sample_index][key])
        ax_policy.text(sample_index, row_index, f"{decision or 'n/a'}\n{probability:.2f}",
                       ha="center", va="center", fontsize=6)
ax_policy.set_yticks(range(len(QUESTIONS)), list(QUESTIONS))
ax_policy.set_xticks(range(NUM_SAMPLES), range(1, NUM_SAMPLES + 1))
ax_policy.set_xlabel("rubric query")
ax_policy.set_title(
    "TypeSafe application decisions: gray means uncertain "
    f"(top probability < {MIN_CHOICE_PROBABILITY:.2f})"
)
fig_policy.tight_layout()
display(fig_policy)
```

<img src="/img/cases/consistency-choice-cookbook-consistency_choice_cookbook.executed.3.png" alt="output" width="1932" height="584" data-path="cookbooks/consistency_choice_cookbook/consistency_choice_cookbook.executed.3.png" />

この方針はモデルを決定論的にするものではない。拒否は、同じ人間レビュー結果をもたらす競合ラベルを置き換えることができるが、`0.60`に近い確率は依然として具体的なラベルと`uncertain`の間で移動する可能性がある。確率統計および表の`raw agree`列は、依然として元のモデルの出力を報告している。

## TypeSafe プレイグラウンドで開く

以下のリンクは、プレイグラウンドで同じ投稿と評価基準を開きます：1つの投稿、同じ8つの
`Choice`、およびTypeSafe `jev-latest`。

```python
playground_link = make_playground_link(
    {"post": POST},
    {
        key: Choice(instructions=instructions, criteria=choices)
        for key, (instructions, choices) in QUESTIONS.items()
    },
    models=[TYPESAFE_MODEL],
)
display(
    Markdown(
        f"🔗 [Open this post + rubric in the TypeSafe playground]({playground_link})"
    )
)
```

[この投稿と評価基準を TypeSafe プレイグラウンドで開く →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiAA4QDOKpBJ5VKA+gJZi36kAKAtABx8ATAEYAzKQA0nEAEMYKABYQATh3oxKCZa3Z5pMAPQAWIwHZhk6TKhQIMVExkBzBEzAyAnpQ6i+U0mTKLCpM1EEA1gjeesL+IABmEAA2SRAA7lrRBCIADAC+cbaoWDR69JQwyvHWCBwBMABGSSxQ+MoIZEkelqQsSEztnR5MKBB1skgQilr4GjNgCPHIYH1O+DL4TjKI+GQyKFAKPSC2cHD2LCjdeqTKBluICw37UaQF0kUoyKV0pF-Y4wAgu18B47PhNEE7JQuvhFCxKPgFkhNAB+fCApBgpAIfBpJRIxbLRGKfa7faHfAI9b4U6dBBfWmpNJIdZIMAQpQwJIchq4hBwZ7KZQySiaDmjfAIABuyF2jHwCi0CAAdPguAgIPT8M1IqDwTIQfj9gByRHKGB9VZwhTU07nJCXDxsjlKHHUWFgmD4HEICUQfB8wkyJIoPGXBRqgDCEB2lE8VLDkrgzuqUAQUj60suCDNbRYTgUYaV7TVAGkEB1E7MyC78ABJE0pKXs-WVPFKJK4w4yJA4pIq44KUVMZpIcIcFAWjPSMfhNyxmR9cYrSi2ZRgFVOJzHJK9pwwZy1G4gZBvOKDFQoLL4dSQgYdK83owXx-KZjtUUQFEcADapGHEUxUQVBjkoPY4GORRP1KABdPIEJAKRyGUWMyGvDBsD0IhSCgF4nBUa5fhAK4yGPAhcKUFpj0KIIviCGQ1FIAA5b9yOkVj5WaKBnWzZJ9mCVkIHiNlnXCPpN2OAAJQ1RRvUh6xRblr3wFRCUQXtEQ2MjlEob8pDSCMfQDaCEDJYTFUNOA60mXZUK+KAvjAHgoD3MV1hQFBrHCQckOkGSviBTzvK03ZMm-VTlE2VCYFrCBZSi7T7IQRy-VpQDrHohEUBafAAAoRXTKR2maJxBKkFx2S0KQVVqgBKXy4gANWCLskHTcYAFkZEiUKoHaFYmlxUzzJEwDrLUvooBzRE+La9N1i2PpqAhWNNRxRrpAAZQg8YAFUUWSFocw5QJYymQTIp1PpwghCCDKM2ydL0pAQw8ryoB844tqwQ8knGH7MD+q6ZDAZTaW-L5UF895ehRKcYEcwT5JAAB1Ycw2paYIVWLt8DgBUZDIToWhkIaIeKVAeAobjnTwr4COUVM1PhREKGoVFz2kQIWDgQ1hiCSgJzKP4PDI8ZDggajjn6nMGKYkAZKAygQJ+aQNV0783v2D7bpZw0XCc9YGjmKkSSVfGl1ZQWvr80gWuSZAOpPQEbRg1Sxqsq6+hyuA2AEiKsYtvm+nzIXNtIAAZG7ARNzRxgAUWwLRXqSHg5yu4T4mpvcUESZRrNsFQVlenKIpts2bVxEPrYRW24kBGw7FQKTssI8YuChRKm-sYs26Zq7BjMsM+WHPioqD6urbD+vpEj9IACU6-GTiNMdJAnHibl8YgBYRTL2uhcrwIom+GG4mWhGke-FH0bJSe7N5-md73gPD9u0kw0oLkeSRIJZThAxFw+B842mpOzFAnMQCwxIgbBkCtSLsUolLZ2tE5YsEYiLEArEcQrymEiFg7RUocjJL2bEuJQ57HfC0bkhoI4gA1i9cYAARQhKUjbmRxHdFKLB4i5QkiwbMYMQz0IAOIxTICwthxCPI0jOg5I2TgJFXVcnJehXBc750gieVhRCOFJgtvaC4VwrqdH2FoxMmgkjxCkJMMM2lwpIHPtIS+Fpr4-hPOjAMaljSY3Nt2SG3xH58yCLCFYei0r7CgTAzKgkEFiyQScKiqCPh0S0BghWgIUjpHGJHMyADsYQJrOGRQxl1juPoajQ0SBcn5OGhbIpsVAzyHetYBQNI0jVOtHuPkA5jgLwFPFRJAyCYFIaYwKQJswyQGMmGMiqcWAAC96m4msLYXu9CtpThYJEcYIyhlV3lCtXsJCwAkIhNsvUkpsZrObigehCc1whheOMNAPVcS2TkKMPmHD3EAG5FTJA5KAjYCh4C9kJNNSgglnFwzCIjA+t8MYtnzumVW5SD6cjsL-IMXlIhCVZKzI5kCuakAAI4wAQJS+J4sTyS2lnbE4aT5ZYMBPIMYLt2U8HaHpJIsoAW2TBXzVkFKqUfMrAsSSjLRHIC0CGcYMqcQiiSC-OVmLRWUvoWgBQMFXk6uHvgAw+A5pO1xDyigKJcQatVN9XaJ4drbDrGYvOKg4A8DJqba1Wqtp5NBq8i01B3Xsh4PGJYJiuyg0NRCZAwQopetJSAVxCLkbjHRi0dp0KN54wJq-dVlLKVYu5BydIhLbRs0YNEuIc4mDDnZGOHcWDEES2STRVJ6DMHESycyWpMgxm4gzpQvc6Z6ELzgNHccANtlxSiquMmeNsYZymfgSIVZCmMHoQAISCFsBY-qDULpuusRERcNx9BeLybdoNrQnIxZdS4R7jZzAeU83OiSfqtgPeOOEAYNjgR4SGbK36j2aHcnyfOqykYb1hYm+GbjEXjCkukQtv8yFSmTsoVO10v1qSzjncxrqqRIGzIyUOa6VpBlrWALsYBK3SHaNmBAaQmB7EUDSxJ9KUm4WZRk1l7KgTsp+ZE-5ZShUQvoywRj9CpLgpqS7EBqFUBjlxKJ1kOa1VqT5r1Q5eEUibJjSoIE0bHQ4ain+6aAGVricYzMak7QKVsKlXEPJWx-ongXnYRkkouwuaunuNIPBkCooFEEqIOm37QaTe4pFAZv7Yo5JplZICz0qp0yqiKRKIG0dIJoBKTo2PNpQa2rj7aFY4MSZxOa4XjjzzSHsmACwrqrj9mKQRM4l1RE0KgDBKRnTjS7GKehnU-QsHgB3Rxb0MrASCYZUptlXJmWULCfqw3yYjXudJAsRwTxKzkui0YhsSwlPaRsNbNoyTrJxWasyJDj0DRYENCLsHk031Tcih+QzlUqpy+kkxFkMsVreHkPysgyAsCapkQS2FpTCGB1Y9hfpOq7wQEkSgehfwgAAFYynTi8agIB4JAA)