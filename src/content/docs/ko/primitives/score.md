---
title: "점수"
description: "Score는 정렬된 서술적 등급을 사용하여 콘텐츠에 점수를 매깁니다. 답변은 점수, 각 등급별 확률 및 신뢰도로 구성되며, 점수는 두 등급 사이에 위치할 수 있습니다."
section: primitives
order: 30
tags: ['score', 'ranking', 'rating']
source: docs.typesafe.ai/primitives/score
translatedFrom: zh
---

## 언제 사용해야 하는가

답변이 **여러 단계로 설명할 수 있는 연속 스펙트럼** 위에 있을 때 `Score`를 사용하십시오. 예시:

- 버스의 심각도
- 고객의 만족도
- 후보자의 Python 경험 수준

답변이 고정된 옵션 집합이며 옵션 간에 **순서 관계가 없는** 경우 [Choice](/ko/primitives/choice/)를 사용하십시오. 단순히 예/아니오인 경우 [Noul](/ko/primitives/noul/)을 사용하십시오.

대표적인 질문 예시:

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

두 번째 예시에서 단계는 0부터 4까지 **순서**가 있습니다. 가장 캐주얼한 것부터 가장 격식 있는 것까지. 이것이 `Score`와 `Choice`를 구분하는 결정적인 차이입니다. 반대로 `{ billing, technical, sales }` 사이에는 진정한 순서 관계가 없으며, 강제로 `Score`를 사용하면 거짓된 서수(semantic ordinal) 의미가 도입될 뿐입니다.

## 매개변수

| 매개변수 | 필수 여부 | 설명 |
| :--- | :--- | :--- |
| `type` | 예 | 반드시 `"score"`여야 합니다 |
| `instructions` | 예 | 질문 자체 |
| `criteria` | 예 | **단계 배열**, 낮은 순서부터 높은 순서로 정렬됨. 각 항목의 설명은 해당 단계의 정의를 의미합니다 |

`Choice`의 `criteria`가 객체인 것과 달리, `Score`의 `criteria`는 **순서가 있는 배열**입니다. 배열의 순서가 척도(dimension)의 방향을 결정합니다.

`Choice`와 마찬가지로 `criteria` 내 각 항목은 문자열, 객체 또는 배열일 수 있습니다. 특정 단계에 더 많은 설명이 필요할 경우 객체로 변경하십시오.

## 요청 예시

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

## 반환값

`Score` 답변의 핵심 특징은 `score`가 **두 단계 사이에 위치할 수 있다**는 것입니다. 이는 척도 상의 한 위치를 나타내며, 단계 인덱스가 아닙니다.

| 필드 | 의미 |
| :--- | :--- |
| `score` | 척도 상의 위치, 소수일 수 있음 |
| `legend` | 단계 정의를 번호별로 반복하여, 코드 내에서 의미론으로 매핑하기 용이하도록 함 |
| `probabilities` | 각 단계별 확률 분포 |
| `confidence` | 분포의 집중 정도, 0에서 1 사이 값 |

위 예시에서 `score: 1.4`가 반환된다고 가정해 봅시다. 이는 모델이 문제의 심각도가 '대안이 있는 기능 손상'과 '완전한 차단' 사이에 있으며, 첫 번째 단계에 더 가깝다고 판단했음을 의미합니다. 이러한 **연속성은 Score가 '여러 Noul 조합'에 비해 가지는 핵심 장점**입니다. 여러 개의 독립적인 판단을 얻는 대신, 한 번의 호출로 전체 분포 정보를 얻을 수 있습니다.

`legend`의 역할은 반환값을 자기 설명적으로 만드는 것입니다. 숫자를 의미론으로 다시 번역하기 위해 코드 내에서 별도의 단계 상수 테이블을 별도로 유지할 필요가 없습니다.

## 사용 시 주의사항

**단계 설명은 판별 가능해야 합니다.** 각 단계의 설명은 다른 사람도 경계를 일관되게 판단할 수 있어야 합니다. `"Calm, matter-of-fact"` / `"Frustrated but civil"` / `"Very angry"`와 같은 설명은 판별 가능하지만, `"Low / Medium / High"`는 그렇지 않습니다.

**단계 수는 3~5단계로 제한하십시오.** 단계가 너무 적으면 구별력이 손실되고, 너무 많으면 인접한 단계 간 경계가 모호해져 신뢰도가 낮아집니다.

**`score`만 보지 말고 `confidence`에 주목하십시오.** `Score`의 신뢰도가 낮다는 것은 일반적으로 단계 정의에 모호함이 있거나, 척도가 다차원적이거나, `state` 정보가 부족함을 의미합니다. 이때 올바른 대응은 값을 무리하게 추출하는 것이 아니라 단계 정의를 개선하는 것입니다.

**순위 매기기 시나리오에서 Score는 주요 원리입니다.** 관련성 순위 매기기, 품질 평가, 위험 등급 분류 등은 모두 `Score`에 적합하며, 여러 차원을 가중치 합산하여 결합하는 [Composite Scoring Pattern](/ko/patterns/composite-scoring/)과 함께 사용하면 좋습니다.

## 관련 문서

- [Choice](/ko/primitives/choice/) — 순서가 없는 고정 옵션
- [Noul](/ko/primitives/noul/) — 예/아니오 확률
- [Composite Scoring Pattern](/ko/patterns/composite-scoring/) — 다차원 가중치 합성
- [Confidence](/ko/concepts/confidence/) — 낮은 신뢰도의 의미
