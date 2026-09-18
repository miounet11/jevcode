---
title: "System One 모델"
description: "System One는 「빠르고 구조화된 의사결정」을 위해 구축된 모델군입니다. Jev는 그 첫 번째 사례로, 그 출력은 소프트웨어가 직접 소비할 수 있습니다."
section: concepts
order: 10
tags: ['system-one', 'architecture']
source: docs.typesafe.ai/concepts/system-one
translatedFrom: zh
---

## 정의

System One 모델은 소프트웨어가 직접 사용할 수 있는 **빠른 구조화된 결정**을 내리도록 특별히 구축된 AI 모델 계열입니다. Jev는 TypeSafe의 플래그십 모델이자 최초의 System One 모델입니다.

이들이 해결하는 핵심 문제는 다음과 같습니다. 전통적인 언어 모델은 자유 텍스트를 출력하는 반면, 소프트웨어는 확정된 타입의 값을 필요로 합니다. System One은 이러한 변환 과정을 모델 내부에 내재화합니다. 즉, 문제 선언 시 출력 타입을 명시하면 모델이 제약 조건에 따라 응답을 반환합니다.

## System Two와의 역할 분담

이 명칭은 인지 과학의 이중 시스템 이론에서 차용한 것으로, 의미가 매우 직관적입니다.

| | System One | System Two |
| :--- | :--- | :--- |
| 특징 | 빠름, 직관적, 집중적 | 느림, 신중함, 다단계 |
|典型 작업 | 판단, 분류, 채점, 검증 | 복잡한 추론, 긴 체인 계획 |
| 지연 시간 | 낮고 예측 가능 | 높으며, 사고 길이에 따라 증가 |
| 출력 | 타입화됨, 제약 조건 있음 | 자유 텍스트 |
| 비용 | 낮음 | 높음 |

이들은 상호 대체 관계가 아닙니다. 프로덕션 시스템에서는 일반적으로 System One이 대부분의 고빈도 판단을 담당하며, 진정한 심층 추론이 필요할 때만 System Two로 업그레이드하거나 수동 검토로 전환합니다.

## 완전한 예시: 환불 요청

공식 문서에서 제시한 프로세스는 이 두 계층이 어떻게 협력하는지를 잘 보여줍니다.

1. **state 구성** — 고객 서비스 메시지, 관련 거래 내역, 환불 정책을 하나의 state로 패키징합니다.
2. **병렬 질문** — 세 개의 독립적인 질문에 동시에 답을 구합니다: 사용자가 환불을 요청했는가, 증거가 중복 차감을 나타내는가, 정책이 환불을 지원하는가.
3. **코드에서 조합** — 세 가지 답변을 결정론적인 비즈니스 검증과 결합한 후, 실행 또는 수동 검토로 라우팅합니다.

2단계에서 질문의 **독립성**에 주목하십시오. 세 질문은 서로 간섭하지 않으며 한 번에 요청할 수 있습니다. 이것이 이를 단일 요청으로 패키징할 수 있는 전제 조건입니다.

## 타입화된 출력이 중요한 이유

System One 모델은 자유 텍스트가 아닌 **타입화되고 제약 조건이 있는 출력**을 반환하므로, 코드는 이러한 답변을 직접 검사하고 조합하여 예측 가능한 워크플로우를 구성할 수 있습니다.

두 가지 통합 방식의 코드 복잡도를 비교해 보십시오.

```python
# 전통적인 방식: 파싱, 검증, 형식 예외 처리 필요
raw = llm.complete("Is this ticket about billing? Answer yes or no.")
is_billing = raw.strip().lower().startswith("y")  # 취약함, 경계 사례 많음

# System One: 값 자체가 타입화됨
response = client.system_one(
    state=ticket,
    questions={"billing": Noul(instructions="Is this ticket about billing?")},
)
is_billing = response.nouls["billing"].noul  # float, 0..1
```

후자의 반환값은 정의역 내의 확정된 타입입니다. Choice는 제공한 옵션 중 하나일 뿐이며, Score는 제공한 등급 구간 내에 있을 뿐이고, Noul은 항상 0에서 1 사이의 부동소수점 숫자입니다.

## 신뢰도: 모델이 "모른다"고 말할 수 있게 하기

System One 모델의 답변에는 [confidence](/ko/concepts/confidence/)가 포함되어 있으므로, 언제 직접 실행할지, 언제 수동 검토나 추론 모델로 업그레이드할지 결정할 수 있습니다. 이는 신뢰할 수 있는 시스템을 구축하는 기초입니다. **불확실성을 정직하게 표현할 수 없는 시스템은 신뢰될 수 없습니다.**

## 호출 방법

클라이언트 [SDK](/ko/sdk/) 또는 HTTP API를 통해 호출합니다.

```http
POST https://api.typesafe.ai/v1/systemone
```

요청의 `model` 필드에서 구체적인 모델을 선택합니다. 기본 별칭은 `jev-latest`입니다.

## 더 읽기

- [State](/ko/concepts/state/) — 모델에 전달할 컨텍스트를 구성하는 방법
- [질문 원시 타입](/ko/primitives/) — 세 가지 타입화된 질문 유형
- [아키텍처 패턴](/ko/patterns/) — 프로덕션 환경에서 이러한 호출을 조직하는 방법
- [System One 시스템 구축 방법](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — 공식 전체 워크플로우 가이드
