---
title: "자기 일관성: nouls"
description: "경로별 불확실한 확률을 인간 검토로 전달하되, 기본 노울 값은 가시성을 유지한다."
section: cases
order: 160
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/consistency_noul_cookbook"
translatedFrom: en
---
이 쿡북은 하나의 자동차 보험 청구 건을 받아 15회에 걸쳐 14개 항목의 평가 기준을 적용하고, 각 답변이 반복 동안 일관되게 유지되는지 확인합니다. 각 검사는 `Noul`이므로, 각 답변은 단일 참/거짓 질문에 대해 참일 확률 P(true)입니다. 들어오는 청구를 지급, 거부 또는 인간 담당자 이송으로 분류하는 청구 선별 파이프라인에서는 확률이 결정을 안내합니다. 임계값 근처의 작은 변화는 취해지는 행동이 달라질 수 있습니다.

루리크는 14 `Noul` 문항으로 구성되며, 각 실행은 14개 모두에 답변하는 단일 호출입니다. 우리는 `NUM_SAMPLES` = 조건당 15회 반복을 수행하며, 여기서 조건은 하나의 모델과 하나의 설정을 의미하며, 반환된 모든 확률을 제시합니다.

조건:

* 비추론형 LLM `claude-haiku-4-5` 및 `gpt-5.4-mini`, `0` 온도 및 API 기본값 사용.
* 동일한 두 비추론형 모델의 True/False 모드: 질문당 하나씩의 단순 yes 또는 no, 1.0 및 0.0으로 매핑.
* 온도 조절 기능이 없는 추론형 LLM `gpt-5.5` 및 `claude-opus-4-8`.
* TypeSafe: 14개 `Noul` 질문 중 `system_one` 호출 1회, 각 호출마다 새로운 `uid` 필드(임시 고유 값) 사용.

무엇을 살펴봐야 할까: LLM의 답변은 실행마다 달라지며, 온도 `0`에서도 마찬가지이고, 판단이 필요한 부분에서는 모델이 *자신과* 의견이 일치하지 않는다. TypeSafe의 질문별 평균 확률 표준편차는 `0.0102`로, 여기에 제시된 모든 LLM 확률 조건보다 낮다. 그 `covered` 답변은 `0.43`에서 `0.53`에 걸쳐 있으며, `0.5` 의사결정 임계값을 넘나든다.

우리는 또한 `0.30`부터 `0.70`까지의 확률을 명시적인 `uncertain` 결과로 변환하여
사람이 검토할 수 있도록 합니다. 마지막 그림은 TypeSafe 확률을 이러한 작업에 매핑하면서
기저 확률이 가시적으로 유지되도록 합니다.

## 설정

```bash
pip install anthropic openai matplotlib ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

then set `TYPESAFE_API_KEY`, `ANTHROPIC_API_KEY`, and `OPENAI_API_KEY`.
This run uses `jev-latest` on the production API, sampled on 2026-09-11.

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

## 상태: JSON 형식의 자동차 보험 청구

경계선상의 몇 가지 호출이 내장된 하나의 주장:

* 사고는 트랙 데이 이벤트 중 발생했으나(보장은 "트랙/경주용 운전"을 제외함), 서킷이 아닌 주차장에서 차량이 정지해 있는 동안에 일어났다.
* 정책에는 렌트비 보상 조항이 없음에도 렌트카 항목이 청구되었다.
* 사고 금액이 \$2,000을 초과하므로 보장이 경찰 보고서 제출을 요구하지만, 보고서가 첨부되지 않았다.
* 자동 분류 노트는 인간 검토 없이, 또한 면책금액을 공제하지 않은 채 이미 청구 건을 "승인, 전액 지급"으로 표시하고 있다.

아래의 일부 평가 항목 질문은 명확하지만, 몇 가지는 샘플링된 LLM 답변이 분산되고 모델 간 의견이 일치하지 않는 경계선상의 유형입니다.

청구는 JSON 구조입니다. LLM은 프롬프트에 `json.dumps(CLAIM)`를 받으며, TypeSafe는 해당 구조를 상태로서 직접 취합니다.

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

## 기준: 14 `Noul` 질문

한 행에 하나의 `key -> question` 항목을 배치하고, 확인하려는 대상이 참일 때 '예'가 되도록 문장을 구성합니다. 이렇게 하면 모든 행을 비교 가능하게 유지됩니다. 각 모델의 확률과 TypeSafe의 `noul` 측정값이 동일한 대상을 측정하기 때문입니다.

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

## 우리가 어떻게 묻는가

각 LLM 호출은 `json.dumps(CLAIM)`와 모든 14개 질문을 포함하는 하나의 프롬프트입니다. 모델은 각 질문의 키를 확률에 매핑하는 JSON 객체를 반환합니다. 호출은 모델 이름에 따라 Anthropic 또는 OpenAI로 라우팅됩니다: 비추론 모델은 `temperature`(`0` 또는 API 기본값)를 사용하며, 추론 모델은 먼저 사고하고 온도(temperature)를 사용하지 않습니다.

추론형 모델이 아닌 모델도 True/False 변형을 실행합니다. 각 질문에 대해
단순한 예 또는 아니오로 답변하며, 이를 1.0과 0.0으로 매핑합니다. 이는 명확한 결정을
강요하며, 불확실한 중간 영역에 어떤 여지(질량)도 남길 수 없을 때
이러한 모델들이 어떻게 작동하는지를 보여줍니다.

TypeSafe 호출은 동일한 주장과 동일한 14 `Noul` 질문에 대해 한 번의 `system_one` 요청입니다. 각 답변의 `noul`는 P(true)입니다.

모든 쿼리에는 매번 새로운 `uid`가 할당되며, 이는 각 실행마다 변경되는 일회용 고유 값으로, 주장과 평가지표는 동일하게 유지됩니다. 이는 LLM 프롬프트와 TypeSafe 상태의 추가 필드에 나타납니다. 이 구조는 관련 없는 필드에 대한 민감도와 동일한 요청에서 발생할 수 있는 변동성을 분리할 수 없습니다.

> **참고:** "오직 JSON 객체만"이라는 지시에도 불구하고, `claude-haiku-4-5`는 거의 모든 응답을 ````json ... ``` ` fence that strict `json.loads` rejects > (the
> other models return bare JSON). The helper peels the fence; a reply that still fails > to
> parse becomes a parse failure, counted but not scored.

Each helper returns the answer, an estimated cost, and the round-trip latency.

````python
def rubric_prompt(mode: str, sample_index: int) -> str:
 """The claim + all 14 questions in one prompt; ``mode`` picks the answer format.

``mode="prob"`` asks for a probability per question, ``mode="yesno"``는 단순한 참/거짓(True/False) 응답용입니다.
 ``sample_index``는 uid buster를 초기화하여, 매번 반복할 때마다 서로 독립적인 고유한 추첨이 이루어지도록 합니다."""
 if mode == "yesno":
 answer_format = (
 "\n\n각 질문에 대해 예 또는 아니오로 답변하십시오.\n"
 "각 질문의 키를 'yes' 또는 'no'에 매핑하는 JSON 객체만을 응답하십시오. "
 "질문마다 하나의 항목을 포함해야 합니다."
 )
 else:
 answer_format = (
 "\n\n각 질문에 대해 답변이 'yes'일 확률을 제시하십시오.\n"
 "각 질문의 키를 0.00에서 1.00 사이의 숫자에 매핑하는 JSON 객체만을 응답하십시오. "
 "질문마다 하나의 항목을 포함해야 합니다."
 )
 return (
 f"uid: {sample_index}:{token_hex(4)}\n\n"
 f"문서 (자동차 보험 청구서):\n{json.dumps(CLAIM, indent=2)}\n\n질문:\n"
 + "\n".join(f"- {key}: {question}" for key, question in QUESTIONS.items())
 + answer_format
 )


def _cost(prices: tuple[float, float], input_tokens: int, output_tokens: int) -> float:
 return input_tokens / 1e6 * prices[0] + output_tokens / 1e6 * prices[1]


def _call_llm(model: str, prompt: str, temperature: float | None):
 """LLM 호출 1회 -> (text, cost_usd, latency_s), 모델 이름으로 라우팅."""
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


# 모든 샘플(LLM 및 TypeSafe)은cookbook와 함께 제공되는 ``json_cache.json``에 캐시되므로,
# 다시 렌더링하면 API 비용 없이 공개된 수치를 재현할 수 있습니다. ``sample_index``은
# 캐시 키의 일부이므로, NUM_SAMPLES 반복 횟수마다 각각 독립적인 추출이 이루어집니다. 파일을 삭제하면
# 실시간 샘플링으로 다시 추출할 수 있습니다.
json_cache = JsonCache(Path("json_cache.json"))


def _rubric_fingerprint() -> str:
 """프롬프트/루브릭을 형성하는 모든 것(상태와 각 질문의 텍스트)의 짧은 다이제스트.
 아래 캐시된 호출에 전달되어, 클레임이나 어떤 질문을 수정하더라도 캐시 키가 변경되어
 이전 버전의 문구로 생성된 낡은 답변이 조용히 제공되는 대신 새로운 샘플이 강제됩니다."""
 payload = json.dumps([CLAIM, QUESTIONS], sort_keys=True, default=str)
 return hashlib.sha256(payload.encode()).hexdigest()[:12]


RUBRIC_HASH = _rubric_fingerprint()


@json_cache
def _call_typesafe(sample_index: int, rubric_hash: str, model: str):
 """한 번의 호출에 대해 nouls, 토큰 사용량, 지연 시간 및 모델 메타데이터를 반환합니다.

``rubric_hash`` and ``model`` 루브릭이나 모델 변경 간에 재사용을 방지합니다.
별칭이 나중에 다른 버전으로 해석될 수 있으므로 반환된 모델을 보존합니다.
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


죄송하지만, 제공된 텍스트는 코드와 코드 주석이 포함된 Markdown 블록이며, 번역 요청은 한국어로 된 자연어 텍스트에 대한 것입니다. 코드와 코드 주석은 번역 대상이 아닙니다.

제공된 텍스트를 한국어로 번역할 자연어 텍스트가 있다면 알려주세요.

``mode="prob"`` reads the answer as a number; ``mode="yesno"``는 True/False를 각각 1.0 / 0.0에 매핑합니다.
그 외의 모든 것 -- 누락된 키, 숫자가 아닌 값, yes나 no가 아닌 응답 -- 은 NaN이며,
합법적으로 보이는 값이 결코 아닙니다."""
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
 """LLM 루브릭 쿼리 하나당 (질문 키로 키가 지정된 질문별 확률, 비용_usd,
 지연시간_s); 응답이 파싱되지 않는 곳은 NaN. ``rubric_hash``는 본문에서 사용되지 않음 -- 호출자는
 ``RUBRIC_HASH``를 전달하여 수정된 상태/루브릭이 낡은 답변 대신 캐시를 무효화하도록 함."""
 prompt = rubric_prompt(mode, sample_index)
 text, cost, latency = _call_llm(model, prompt, temperature)
 # 단일```json ... ``` fence (claude-haiku-4-5 adds one despite "ONLY a JSON object").
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

## 실험 조건

### 실험 그리드

| 모델 그룹 | 모델 | 확률 (t=0) | 확률 (기본값) | 예/아니오 (t=0) |
| -------------------- | ------------------------------ | :---------------: | :-------------------: | :----------: |
| 비추론 모델 | `claude-haiku-4-5` | ✓ | ✓ | ✓ |
| 비추론 모델 | `gpt-5.4-mini` | ✓ | ✓ | ✓ |
| 추론 모델 | `gpt-5.5` | — | ✓ | — |
| 추론 모델 | `claude-opus-4-8` | — | ✓ | — |
| TypeSafe | `jev-latest` (`typesafe_noul`) | — | ✓ | — |

* 체크 표시는 한 가지 조건을 의미하며, 15회 실행함. 대시는 테스트하지 않은 조합을 나타냄.
* 기본 열은 온도 인수를 전송하지 않음: 비추론 모델은 API 기본값을 사용하며, 추론 모델과 TypeSafe는 온도 설정 없이 실행됨.
* 예/아니오 답변은 `1.0` / `0.0`에 매핑됨.
* 온도 `0`는 재현성을 위한 일반적인 조언이므로, 우리는 이를 API 기본값과 비교함.

우리는 `NUM_SAMPLES` = 조건당 15회 반복으로 샘플링합니다. 각 반복은 고유한 캐시 키를 가지며 별도의 샘플링으로 간주되고, 캐시(`json_cache.json`)는 쿡북과 함께 제공되므로 다시 렌더링 시 이를 재사용하여 API 호출을 수행하지 않습니다. 캐시를 삭제하면 다시 실시간 샘플링을 수행할 수 있습니다.

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

### 비용 + 속도 (규칙별 쿼리 기준)

다음 비용은 Setup의 과거 가격 가정, TypeSafe에 대한 `speed_latest` 비율을 포함하여 산출되었습니다. 이는 검증된 `jev-latest` 가격이나 현재 청구 금액이 아닙니다.

한 행은 14개 문항의 평가 기준 호출 1회분입니다. `time/call`와 `cost/call`는 15회 호출의 평균을 내고, `vs ts_noul` 열은 TypeSafe 수치를 기준으로 나눕니다.

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

이 라운드에서 TypeSafe의 평균 왕복 지연 시간은 111ms입니다. 위의 동시성 설정 하에서 LLM 조건은 호출당 1.1초에서 13.9초 사이입니다.

## 플롯: 샘플 하나하나를 히트맵으로

읽는 방법:

* 바깥쪽 행 그룹: 질문.
* 안쪽 행: 조건.
* 열: 하나의 전체 루비크 호출.
* 셀 색상: 빨간색은 더 높은 P(yes)를, 초록색은 더 낮은 P(yes)를 의미합니다. 위험 관련 질문의 경우, 빨간색 셀은 루비크에서 플래그를 지정했던 항목입니다.

`typesafe_noul`는 `covered`(`0.43`에서 `0.53`)과 `exclusion`(`0.53`에서 `0.62`)에서 가장 크게 변동합니다. 일부 LLM 행은 온도 `0`에서도 변동합니다. 조건들은 판단에서 서로 일치하지 않습니다.

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

사실 확인은 대부분의 조건에서 안정적으로 유지됩니다. 판단이 많이 필요한 조건들에서 LLM 행들이 움직입니다: `exclusion`, `rental_eligible`, `fraud_flag`, `manual_review`은 샘플 간에 이동하거나 모델 간에 의견이 다릅니다. TypeSafe의 `covered` 행은 `0.5`를 가로지릅니다. 이 실행 동안 다른 13개 질문은 그 임계값의 한쪽에 머물러 있습니다.

## 불확실한 결정을 허용하여 예/아니오를 강요하지 않기

`0.5`의 임계값에서, 확률 `0.49`과 `0.51`은 둘 다 상당한 불확실성을 나타냄에도 불구하고 상반된 행동을 초래합니다. 대신 애플리케이션은 다음과 같이 반환할 수 있습니다:

* `no` 아래 `0.30`;
* `uncertain`에서 `0.30`부터 `0.70`까지, 양쪽 경계 포함;
* `yes` 위 `0.70`.

불확실한 사례는 인간 담당자에게 이관됩니다. 에스컬레이션은 반환된 확률에 기반한 애플리케이션 로직이며, 새로운 질문이나 두 번째 API 호출은 수행되지 않습니다. 이 범위는 예시를 위한 것으로, 교정된 보장이거나 최적화된 임계값이 아닙니다. 프로덕션 경계는 레이블이 지정된 예시와 잘못된 결정 및 검토의 비용으로부터 설정해야 합니다.

아래의 일러스트레이션은 이를 TypeSafe 확률에 적용합니다.

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

`0.5` 주변의 변동을 반대가 되는 자동 조치를 취하지 않고 흡수하는 검토 밴드가 있다. 다만 그 자체에도 경계가 존재한다. 바깥쪽 경계 중 어느 쪽에 가까운 값이라도 `uncertain`과 예 또는 무 사이를 이동할 수 있다. 이에 대해 모델이 더 결정론적이 되는 것은 아니며, 밴드를 통과하는 자동 결정이 올바르다고 입증되는 것도 아니다.

## TypeSafe 플레이그라운드에서 열기

아래 링크는 플레이그라운드에서 동일한 주장과 평가 기준을 엽니다: 하나의 주장, 동일한 14
`Noul` 질문, 그리고 TypeSafe `jev-latest`. 이는 위에서 사용된 변경되는 `uid` 필드를 생략합니다.

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

[TypeSafe 플레이그라운드에서 이 주장 + 기준 열기 →](https://console.typesafe.ai/playground#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-lTeK+k6y-RmhCs0sw3EbzkhAIoT8JY8AruShBfyqUAsMefSm85Z5rSrF4Doo94xSDGBNekECjC1iEljX29d+hYQqKCzk-QN4cnhRuGAEqpUKSYrzYwHBC5Qw0CAQ21AABq7xrzI28IoaGgxlieFmDYCAhhyApC+CAVKbYpBUFyjgCEEwgA)