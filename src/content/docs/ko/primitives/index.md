---
title: "문제 원시 명령어 개요"
description: "Choice, Score, Noul의 세 가지 유형화된 질문 유형에서 각각 어떤 결과가 반환되며, 어떻게 선택해야 하는지"
section: primitives
order: 10
tags: ['primitives', 'choice', 'score', 'noul']
source: docs.typesafe.ai/primitives
translatedFrom: zh
---

## 원어는 쌍으로 존재합니다

TypeSafe의 원어(primitive)는 코드에서 조합하는 작은 타입화된 구성 요소입니다. 이들은 쌍으로 나타납니다:

- **질문(question)**: System One 모델이 **상태(state)**에 대해 내리는 판단을 정의합니다.
- **답변(answer)**: 모델이 반환하는 타입화된 값입니다.

코드에서 이러한 답변들을 조합하여 결정을 내립니다. 세 가지 질문 유형이 있으며, 각각 다른 형태의 답변을 반환합니다.

| 유형 | 답변 내용 | 반환 값 |
| :--- | :--- | :--- |
| [Choice](/ko/primitives/choice/) | 이 옵션 중 무엇을 선택할 것인가? | `choice`, `probabilities`, `confidence` |
| [Score](/ko/primitives/score/) | 어느 등급에 해당하는가? | `score`, `legend`, `probabilities`, `confidence` |
| [Noul](/ko/primitives/noul/) | 이것이 사실인가? | `noul`(0에서 1 사이) |

하나의 질문만 할 수도 있고, 여러 질문을 한 번에 보낼 수도 있습니다. 각 질문은 독립적으로 평가됩니다.

## 원어 선택 방법

원어를 선택하는 핵심은 비즈니스 도메인이 아닌 **결정의 형태**를 보는 것입니다:

- **후보 집합이 유한하고 상호 배타적인 경우** → Choice. 예: 티켓 분류, 의도 식별, 액션 선택.
- **순서가 있는 차원이나 질적 그라데이션이 존재하는 경우** → Score. 예: 관련성, 심각도, 만족도.
- **예/아니오 판단만 필요하며 모호함을 허용하는 경우** → Noul. 예: "이 콘텐츠가 규칙을 위반하는가", "사용자가 환불을 요청하는가".

흔히 발생하는 실수는 Choice를 사용해야 하는 곳에 Score를 사용하는 것입니다. 등급 간에 진정한 서수 관계가 없는 경우(예: "청구 / 기술 / 영업"), Choice를 사용해야 합니다. 강제로 Score를 사용하면 거짓된 서수적 의미가 도입되어, 이후 임계값 판단이 무의미해질 수 있습니다.

반대로, 연속적인 그라데이션이 실제로 존재한다면 여러 Noul을 조합하는 것보다 Score를 사용하는 것이 훨씬 간편합니다. Score는 전체 분포를 한 번에 제공하기 때문입니다.

## 답변의 두 가지 핵심 속성

**모든 답변은 제공된 옵션 내에 제약됩니다.** 모델이 반환하는 것은 제공된 옵션이나 등급에 대한 확률 분포이며, 집합 밖의 값을 절대 생성하지 않습니다. 이는 코드에서 생성된 텍스트에서 값을 복원할 필요가 없다는 것을 의미합니다. 이것이 Jev와 "LLM이 JSON을 출력하도록 한 후 파싱하는 것" 사이의 가장 본질적인 차이입니다.

**모든 답변은 서로 독립적입니다.** 한 질문의 답변이 다른 질문의 숨겨진 문맥이 되지 않습니다. 이 제약은 다음을 보장합니다:

- 질문의 평가 순서가 결과에 영향을 미치지 않음;
- 일부 분기에서만 의미가 있는 질문을 포함하여 여러 질문을 한 번에 안전하게 질문할 수 있으며, 서로 오염될 염려가 없음;
- 각 답변의 의미를 개별적으로 테스트하고 검증할 수 있음.

두 번째 속성은 매우 실용적인 추론을 가져옵니다. **추측성 질문(speculative questions)은 거의 무료입니다.** 예를 들어 티켓 시나리오에서 `bug_severity`는 티켓이 버그 보고일 때만 의미가 있고, `refund_requested`는 청구 관련 문제일 때만 의미가 있습니다. 하지만 이를 모두 동일한 요청에 미리 포함시켜도 속도 저하가 발생하지 않습니다. 모델이 모든 질문을 병렬로 평가하므로, 필요한 경우에만 해당 답변을 읽으면 됩니다.

## 한 번에 여러 질문하기

```json
{
  "intent": {
    "type": "choice",
    "instructions": "The primary intent of this customer message",
    "criteria": {
      "order_status": "Asking about an existing order",
      "product_question": "Asking about a product before buying",
      "return_exchange": "Wants to return or exchange something",
      "complaint": "Unhappy about an experience"
    }
  },
  "frustration": {
    "type": "score",
    "instructions": "How frustrated the user appears",
    "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
  },
  "refund_requested": {
    "type": "noul",
    "instructions": "The user is explicitly asking for a refund or credit"
  }
}
```

한 번의 호출로 세 개의 독립적인 답변이 반환되며, 코드는 `intent`에 따라 분기한 후 이미 획득한 결과에서 필요한 필드를 읽습니다.

## 심화 학습

- [원어 심화 사용법](/ko/primitives/advanced/) — criteria 작성법, 표현 기법, 경계 처리
- [Fan-out 패턴](/ko/patterns/fan-out/) — 대량의 질문을 한 번의 요청에 패키징하는 방법
- [신뢰도](/ko/concepts/confidence/) — `confidence` 및 `probabilities`를 사용하여 동작 제어
