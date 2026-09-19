---
title: "Jev 알아보기"
description: "Jev는 TypeSafe의 플래그십 모델이자 첫 번째 System One 모델입니다. 이 모델은 비정형 상태와 타입화된 질문을 소프트웨어가 직접 사용할 수 있는 타입화된 결정으로 변환합니다."
section: start
order: 10
tags: ['overview', 'system-one']
source: docs.typesafe.ai/introduction
translatedFrom: zh
---

## 한 문장으로 이해하기

Jev은 채팅 모델이 아닙니다. Jev에 **상태**(state)와 **타입화된 질문**(typed questions)을 입력하면, **타입화된 결정**(typed decisions)을 반환합니다. 이는 옵션, 점수, 또는 부울 확률 중 하나이며, 각각에 **신뢰도**(confidence)가 포함됩니다.

이 포지셔닝이 Jev을 대화형 모델과 근본적으로 구분짓는 이유입니다:

| 차원 | 대화형 모델 | Jev |
| :--- | :--- | :--- |
| 출력 | 자유 텍스트 | 고정된 스키마의 구조화된 결과 |
| 용도 | 생성, 대화, 추론 체인 | 분류, 라우팅, 점수 매기기, 검증, 가드레일 |
| 통합 방식 | 모델 출력 파싱 | 반환값 직접 소비, 정규식 파싱 불필요 |
| 신뢰도 | 일반적으로 없음 | 모든 답변에 포함 |
| 지연 | 초 단위, 출력 길이에 따라 증가 | 낮고 안정적 |

## 왜 '결정 레이어'가 필요한가

LLM을 비즈니스 시스템에 통합할 때 가장 흔한 고통 포인트는 다음과 같습니다: 모델이 자연어 텍스트를 출력하면, 파서를 작성하고 경계 상황을 처리하며 모델이 맞는지 추측해야 합니다. Jev은 이 레이어를 추상화합니다. 질문 자체가 출력 타입을 선언하며, 모델은 스키마에 따라 답변해야 합니다.

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this",
    "criteria": {
      "billing": "Payment or subscription issues",
      "technical": "Bugs or integration problems",
      "sales": "Pricing or account questions"
    }
  }
}
```

반환값은 `billing`, `technical`, `sales` 중 하나와 신뢰도입니다. 파싱도 없고, 대체 형식도 없습니다.

## 세 가지 질문 원리

모든 결정은 세 가지 유형의 질문으로 귀결됩니다. 이것이 Jev의 핵심 추상화이며, 이를 이해하면 전체 시스템을 이해한 것입니다:

- **[Choice](/ko/primitives/choice/)** — 상호 배타적인 후보 그룹 중 하나를 선택합니다. 의도 인식, 티켓 라우팅, 작업 선택에 사용됩니다.
- **[Score](/ko/primitives/score/)** — 척도나 평가 기준에 따라 점수를 매깁니다. 관련성 정렬, 품질 평가, 위험 등급 분류에 사용됩니다.
- **[Noul](/ko/primitives/noul/)** — 예/아니오 질문에 답변하며, '예'일 확률을 반환합니다. 콘텐츠 검증, 어설션 확인, 가드레일에 사용됩니다.

한 번의 요청에서 이 세 가지 질문을 혼합할 수 있습니다. 모델은 상태를 한 번만 읽은 후 모든 질문을 병렬로 평가합니다.

## System One의 포지셔닝

System One은 소프트웨어가 직접 사용할 수 있는 빠르고 구조화된 결정을 내리는 데 특화된 모델 유형입니다. Jev은 이 유형의 첫 번째 모델입니다. System One은 System Two식 추론 모델의 대체재가 아니라, 역할을 분담합니다:

- **System One**: 고빈도, 저지연, 구조화된 판단. 비즈니스 파이프라인에서의 if/else를 업그레이드한 버전입니다.
- **System Two**: 다단계 추론과 긴 사슬 사고가 필요한 복잡한 작업.

실무에서는 파이프라인에서 System One을 많이 사용하여 빠르게 분기하고, 실제로 깊은 추론이 필요할 때만 더 강력한 모델로 업그레이드하여 비용과 지연 시간을 낮추는 일반적인 관행이 있습니다.

## 다음 단계

- [5분 시작하기](/ko/quickstart/) — API 키를 받고 첫 호출을 실행합니다.
- [핵심 개념](/ko/concepts/system-one/) — System One과 상태 모델 이해
- [아키텍처 패턴](/ko/patterns/) — 프로덕션 환경에서 이러한 호출을 조직하는 방법 보기
