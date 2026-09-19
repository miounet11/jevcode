---
title: "상태"
description: "State는 모델이 평가해야 할 내용을 의미합니다. State의 세 가지 형태, 컨텍스트 구성 방법, 그리고 언어 지원의 제한 사항을 이해하세요."
section: concepts
order: 20
tags: ['state', 'context']
source: docs.typesafe.ai/concepts/state
translatedFrom: zh
---

## State란 무엇인가

**State**는 System One 모델이 평가하도록 요청하는 내용입니다. 이는 고객 서비스 메시지, 텍스트 조각, 또는 현재 애플리케이션의 상태일 수 있습니다. 이를 API 요청의 `state` 필드에 넣고, 질문과 함께 전달합니다.

각 요청에서는 **하나의 state**를 사용하여 **하나 이상의 질문**을 평가합니다. 모든 질문은 동일한 state를 보며, **독립적으로** 평가됩니다. 하나의 요청 내에서 [Choice](/ko/primitives/choice/), [Score](/ko/primitives/score/), [Noul](/ko/primitives/noul/) 질문을 혼합하여 사용할 수 있습니다.

## 세 가지 형태

### 문자열

가장 간단한 state는 일반 문자열입니다:

```python
state = "My card was charged twice."
```

시나리오가 단순하고 텍스트 한 줄만 필요한 경우에 적합합니다.

### 객체

의사 결정 시 여러 부분을 비교해야 할 경우, 관련 정보를 객체로 묶어 각 부분에 설명적인 이름을 부여합니다:

```json
{
  "ticket": {
    "subject": "Duplicate charge",
    "messages": [
      {"from": "customer", "text": "I was charged twice for order A-104. Please refund the duplicate."},
      {"from": "support", "text": "We are checking the charges."}
    ]
  },
  "order": {
    "id": "A-104",
    "charges": [
      {"amount_usd": 49, "status": "captured"},
      {"amount_usd": 49, "status": "captured"}
    ]
  },
  "refund_policy": "Duplicate charges are eligible for a refund."
}
```

이것은 대화, 주문, 정책이 모두 포함되어 있음에도 불구하고 **하나의** state입니다. 명세는 다음과 같이 권장합니다: **대부분의 요청에서 객체를 사용**하여 각 부분에 설명적인 이름을 부여하고 상호 관계를 명확하게 유지합니다.

### 배열

메시지 시퀀스나 레코드 시퀀스에 적합합니다:

```python
state = ["Hi", "My customer number is TS1337.", "My card was charged twice."]
```

| 형식 | 적합 사례 | 예시 |
| :--- | :--- | :--- |
| String | 메시지, 문서, 텍스트 조각 | `"My card was charged twice."` |
| Object | 이름이 있는 필드, 관련 레코드, 애플리케이션 상태 | 위 JSON 참조 |
| Array | 메시지 또는 레코드의 시퀀스 | 위 배열 참조 |

## 내용과 질문 분리하기

이는 Jev 사용 시 가장 중요한 사고 모델 중 하나입니다:

- **State는 내용과 배경 사실을 담습니다.** 환불 요청, 주문 기록, 환불 정책 등은 모두 state에 포함됩니다.
- **질문은 수행해야 할 판단을 정의합니다.** "사용자가 환불을 요청했는가?", "정책이 환불을 허용하는가?"는 질문입니다.

state 안에 판단 로직을 작성하지 마십시오. state는 전문가들에게 자료를 제시할 때 보여줄 것과 같습니다—전문가 집단에게 자료를 제시한 후 각자가 판단을 내리도록 요청하는 것과 같습니다.

## 언어 지원

Jev는 **순수 텍스트**를 받습니다. state는 문자열, JSON 객체 또는 텍스트 배열이어야 합니다.

- **이미지, 오디오, 비디오는 지원되지 않습니다.**
- 비텍스트 입력은 먼저 텍스트나 구조화된 필드로 전처리된 후 state로 전달되어야 합니다.
- **Jev의 주요 학습 언어는 영어입니다.** 다른 언어(중국어, 일본어, 한국어 포함)도 허용되지만, 현재 정확도는 낮습니다.

마지막 항목은 중국어 사용자에게 특히 중요합니다. 비즈니스에 중국어 콘텐츠가 포함되는 경우, 중요한 경로에 배포하기 전에 실제 데이터로 정확도를 검증하는 것이 좋습니다. 고위험 의사 결정의 경우, state에 영어 요약을 추가하거나 신뢰도가 낮을 때 수동 처리로 전환하는 것을 고려하십시오.

## 예산 및 제한 사항

- 단일 요청 컨텍스트는 64k 토큰을 덮습니다: `state`와 **모든** 질문을 포함합니다.
- 32k 토큰: `state`와 **가장 긴 하나의** 질문을 덮습니다.
- 모델은 state를 한 번만 읽은 후 모든 질문을 병렬로 평가합니다. 따라서 여러 질문을 하나의 요청에 패키징하면 추가 지연 비용이 거의 발생하지 않습니다—[Fan-out 패턴](/ko/patterns/fan-out/) 참조.
- 정확도는 state의 길이에 따라 변할 수 있으며, 공식 문서의 `Jev 1.13 jaggedness` 섹션에서 이를 다룹니다.

## 관련 항목

- [질문 원시 타입](/ko/primitives/) — instructions와 criteria를 사용하여 질문을 구성하는 방법
- [신뢰도](/ko/concepts/confidence/) — 반환값을 사용하여 동작 제어
- [API 참조](https://docs.typesafe.ai/api) — 요청 스키마
