---
title: "Noul"
description: "Noul은 모델이 예/아니오 질문을 평가하도록 하여, 답이 '예'일 확률을 반환합니다. 이는 별도의 confidence 없이 0에서 1 사이의 값 자체입니다."
section: primitives
order: 40
tags: ['noul', 'verification', 'guardrails']
source: docs.typesafe.ai/primitives/noul
translatedFrom: zh
---

## 언제 사용해야 하는가

답변이 **예 또는 아니오**일 때 Noul을 사용하십시오. 예를 들어:

- 이 메시지가 환불을 요청하는가?
- 이 이력서에 분산 시스템 경험이 언급되어 있는가?
- 이 댓글에 개인식별정보(PII)가 포함되어 있는가?

답변이 여러 옵션 중 하나여야 한다면 [Choice](/ko/primitives/choice/)를 사용하고, 특정 척도 상의 위치를 나타내야 한다면 [Score](/ko/primitives/score/)를 사용하십시오.

대표적인 질문 예시:

```text
"Is the customer requesting a refund?"
"Does this resume mention experience with distributed systems?"
"Does the message contain personally identifiable information?"
"Does the room have a minifridge?"
```

## 매개변수

| 필드 | 필수 | 설명 |
| :--- | :--- | :--- |
| `type` | 예 | 반드시 `"noul"`이어야 합니다. |
| `instructions` | 예 | 평가할 예/아니오 질문 또는 진술 |
| `criteria` | 아니오 | 선택사항인 `{ true, false }` 설명으로, '예'와 '아니오'가 각각 무엇을 의미하는지 명확히 함 |

`criteria`는 선택사항입니다. `instructions`는 대부분의 Noul 질문에 충분합니다. '예'와 '아니오' 사이의 경계가 미묘할 때만 사용하여 두 결과의 의미를 명확히 하십시오. **데이터에서 더 나은 성능을 보이는 쪽을 선택하기 위해 두 가지 방식 모두 테스트해 보기를 권장합니다.**

## 요청 예시

```python
from typesafe_sdk import Noul, TypeSafeClient

client = TypeSafeClient()

response = client.system_one(
    state=ticket_conversation,
    questions={
        "is_human_escalation": Noul(
            instructions="Is the customer asking to speak to a human?",
        ),
        "is_repeat_contact": Noul(
            instructions="Has this customer contacted us about this issue before?",
        ),
    },
)

print(response.nouls["is_human_escalation"].noul)
```

## 반환 값

```json
{
  "model": "jev-latest",
  "answers": {
    "is_human_escalation": {
      "type": "noul",
      "noul": 0.99
    },
    "is_repeat_contact": {
      "type": "noul",
      "noul": 0.93
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

`noul` 값은 0에서 1 사이이며, 답변이 **「예」**일 확률을 나타냅니다. 코드에서 명확한 결정이 필요할 때는 일반적으로 임계값을 사용하여 부울 값으로 변환합니다.

## Noul은 개별 confidence를 반환하지 않습니다

이는 Noul을 다른 두 원리와 구별하는 중요한 차이점입니다: **Noul 자체가 확률**이므로 별도의 `confidence` 필드가 없습니다.

- 1에 가까움: 강한 「예」
- 0에 가까움: 강한 「아니오」
- 0.5에 가까움: 예와 아니오의 확률이 비슷함

## 문구 선택이 모든 것을 결정합니다

**높은 확률이 「예」에 해당하도록 하십시오.** 공식 권장사항은 반환값의 의미가 모호하지 않도록 질문을 다음과 같이 작성하는 것입니다. 「Is this not urgent?」(이것이 긴급하지 않은가?)라고 작성하면 0.9는 「긴급하지 않음」을 의미하므로 코드를 읽는 사람이 쉽게 오해할 수 있습니다. 「Is this urgent?」(이것이 긴급한가?)라고 작성하면 0.9는 「긴급함」을 의미합니다.

**명확한 판단 기준을 정의하십시오.** 「Is the candidate strong in Python?」(후보자가 Python에서 우수한가?)를 예로 들면: 「우수하다」의 정의를 먼저 정의해야 합니다. 정의가 불분명하면 확률 해석이 어려워집니다.

**0.5는 「중간 수준」을 의미하지 않습니다.** 이는 가장 흔한 오용 사례입니다. 0.5는 모델이 예와 아니오를 구분할 수 없음을 의미할 뿐, 「중간 정도의 수준」을 의미하지 않습니다. 기술의 숙련도를 측정하려면 [Score](/ko/primitives/score/)를 사용하여 정의된 등급에서 점수를 매겨야 합니다.

**지시문을 평가할 진위 여부를 가진 진술문으로 작성할 수 있습니다.** 의문문 외에도 지시문을 모델이 진위 여부를 평가해야 하는 진술문으로 작성할 수 있습니다. 예를 들어 「고객이 환불을 요청하고 있다」라는 내용에 대해 진술문으로 작성할 경우, 1에 가까운 값은 해당 진술이 참임을 나타냅니다. **두 가지 문구 방식 모두 자체 데이터를 사용하여 테스트해 보기를 권장합니다.**

## 관련 문서

- [Choice](/ko/primitives/choice/) — 순서가 없는 고정된 옵션
- [Score](/ko/primitives/score/) — 순서가 있는 척도에서의 점수
- [신뢰도](/ko/concepts/confidence/) — Noul에 confidence가 없는 이유
- [가드레일에서의 Noul 활용](https://docs.typesafe.ai/patterns) — 공식 패턴 라이브러리
