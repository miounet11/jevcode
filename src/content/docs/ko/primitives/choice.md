---
title: "선택"
description: "Choice는 고정된 옵션 집합에서 하나의 옵션을 선택합니다. 답변은 선택된 옵션, 각 옵션의 확률 및 신뢰도로 구성됩니다."
section: primitives
order: 20
tags: ['choice', 'classification', 'routing']
source: docs.typesafe.ai/primitives/choice
translatedFrom: zh
---

## 언제 사용해야 하는가

답변이 **고정되고 상호 배타적인 옵션 집합** 내에 있을 때 `Choice`를 사용하십시오. 예를 들어:

- 어떤 팀이 이 티켓을 처리해야 하는가
- 상품이 어떤 카테고리에 속하는가
- 이 코드는 어떤 언어로 작성되었는가

답변이 연속적인 스펙트럼 위의 위치라면 [Score](/zh/primitives/score/)를 사용하고, 단순히 예/아니면 [Noul](/zh/primitives/noul/)을 사용하십시오.

대표적인 질문 예시:

```text
"What programming language is this code written in"
  → options: python, javascript, typescript, go, rust, other

"What type of meeting is this based on the title and description"
  → options: standup, planning, retrospective, one on one, brainstorm, none of the above
```

## 매개변수

| 매개변수 | 필수 | 설명 |
| :--- | :--- | :--- |
| `type` | 예 | 반드시 `"choice"`여야 함 |
| `instructions` | 예 | 질문 자체로, 수행해야 할 판단 내용을 설명 |
| `criteria` | 예 | 옵션 정의. 객체 형태 `{ 옵션 이름: 설명 }`이며, 설명은 `null`이 될 수 있음 |

`instructions`와 `criteria` 내의 각 항목은 **문자열, 객체 또는 배열**이 될 수 있습니다. 문자열로 시작하십시오. 특정 옵션에 여러 가지 지침(포함 범위, 제외 범위, 예시 등)이 필요할 경우 객체로 변경하십시오.

## 요청 예시

부서별로 고객 지원 티켓 분류:

```python
from typesafe_sdk import Choice, TypeSafeClient

client = TypeSafeClient()

ticket = "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing."

response = client.system_one(
    state=ticket,
    questions={
        "department": Choice(
            instructions="Which team should handle this ticket?",
            criteria={
                "returns": "Refunds, wrong or damaged items",
                "shipping": "Delivery status, delays, lost packages",
                "billing": "Charges, invoices, payment problems",
            },
        ),
    },
)

print(response.answers["department"].choice)
```

## 반환값

```json
{
  "model": "jev-latest",
  "answers": {
    "department": {
      "type": "choice",
      "choice": "billing",
      "probabilities": {
        "returns": 0.02,
        "shipping": 0.05,
        "billing": 0.93
      },
      "confidence": 0.91
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

| 필드 | 의미 |
| :--- | :--- |
| `choice` | 선택된 옵션 이름 |
| `probabilities` | 각 옵션에 대한 확률 분포 |
| `confidence` | 해당 분포의 집중도를 나타내는 요약 값, 0에서 1 사이 |

`probabilities`는 사용자가 더 유용한 지표를 정의하는 데 필요한 원자재입니다. 자세한 내용은 [신뢰도](/zh/concepts/confidence/)를 참조하십시오.

## 사용 팁

**항상 대체 옵션을 제공하십시오.** `other` 또는 `none of the above`와 같은 옵션을 추가하여, 나머지 옵션이 모두 적합하지 않을 때 모델이 가장 나쁜 선택을 강요받지 않고 적절한 응답을 할 수 있도록 하십시오. 이는 엣지 케이스(예외 상황)에서의 오判을 크게 줄여줍니다.

**옵션 설명은 '경계'를 명확히 하십시오.** 설명의 가치는 '무엇을 포함하는지'와 '무엇을 포함하지 않는지'를 구분하는 데 있습니다. 위 예시에서 `billing`은 모호한 '금전 관련 사항'이 아니라 'Charges, invoices, payment problems'로 명시되어 있습니다.

**옵션 이름이 충분히 명확하다면 설명에 `null`을 전달할 수 있습니다.** 예를 들어 감정 3분류 `{ "calm": null, "frustrated": null, "angry": null }`와 같이, 옵션 이름 자체가 모호함이 없다면 불필요한 설명은 오히려 노이즈를 유발할 수 있습니다.

**추측성 질문에는 추가 비용이 발생하지 않습니다.** 아래 더 복잡한 예시에서 `return_reason`은 `department`가 `returns`일 때만 의미가 있고, `shipping_issue`는 `shipping`일 때만 의미가 있습니다. 하지만 이를 모두 동일한 요청에 미리 포함시켜도 속도가 느려지지 않습니다. 모델은 모든 질문을 병렬로 평가합니다. 이러한 질문을 **추측성 질문**(speculative questions)이라고 합니다.

**심층 분류에는 체이닝(연쇄 호출)을 사용하십시오.** 문서에 대해 심층적이거나 대규모 분류 체계를 적용해야 할 경우, `Choice` 질문을 계층적으로 연결하십시오. 공식 쿡북에는 `Choice`의 확률 기반 빔 서치(Beam Search)를 수행하는 방법이 소개되어 있습니다. 이는 각 단계에서 가장 좋은 K개의 후보 경로만 유지하고, 탐욕스럽게 한 개만 선택하는 대신 더 나은 결과를 도출합니다.

## 관련 문서

- [Score](/zh/primitives/score/) — 순서가 있는 척도에서의 점수
- [Noul](/zh/primitives/noul/) — 예/아니오 확률
- [의도 라우팅 패턴](/zh/patterns/intent-routing/) — Choice의 가장 일반적인 프로덕션 사용 사례
- [신뢰도](/zh/concepts/confidence/) — `probabilities`와 `confidence`를 사용하여 동작 제어
