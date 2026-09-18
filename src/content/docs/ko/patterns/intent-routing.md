---
title: "의도 라우팅"
description: "분류된 요청을 가장 적합한 처리기(결정적 로직, 전용 LLM 또는 사람)로 라우팅합니다."
section: patterns
order: 20
tags: ['routing', 'classification', 'cost']
source: docs.typesafe.ai/patterns/intent-routing
translatedFrom: zh
---

## 이 패턴이 해결하는 문제

모든 사용자 요청에 동일한 프로세서가 필요한 것은 아닙니다. 어떤 요청은 데이터베이스 쿼리 한 번으로 답변할 수 있고, 어떤 요청은 도메인 컨텍스트가 있는 LLM이 필요하며, 또 다른 요청은 반드시 수동 처리가 필요합니다.

TypeSafe는 이러한 모든 프로세서 **앞에** 배치되어, 어떤 프로세서를 호출할지 결정하는 빠르고 저렴한 분류기 역할을 합니다.

**핵심 비용 동기**: 각 메시지를 비싼 LLM에 보내어 요청 유형을 판단하기보다는, 먼저 분류한 후 유형에 따라 라우팅하는 것이 효율적입니다.

## 예시: 고객 지원 라우팅

고객 메시지가 들어오면 올바른 프로세서로 라우팅해야 하는 고객 지원 시스템을 상상해 보세요.

### 1단계: 의도 및 복잡도 분류

한 번의 요청에서 의도, 복잡도 및 몇 가지 보조 판단 요소를 동시에 묻습니다.

```json
{
  "questions": {
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
    "bug_severity": {
      "type": "score",
      "instructions": "How severe is the reported issue",
      "criteria": [
        "Cosmetic; no impact to functionality",
        "Broken or degraded feature; workaround exists",
        "Blocking issue; no workaround exists"
      ]
    },
    "has_reproducible_steps": {
      "type": "noul",
      "instructions": "The user describes specific steps to reproduce the issue"
    },
    "refund_requested": {
      "type": "noul",
      "instructions": "The user is explicitly asking for a refund or credit"
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated the user appears",
      "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
    }
  }
}
```

### 2단계: 분류 결과에 따른 라우팅

```python
intent = response.answers["intent"]

if intent.choice == "order_status":
    # 결정론적 논리로 충분: 데이터베이스 조회
    lookup_order_status(state["order_id"])

elif intent.choice == "product_question":
    # 도메인 컨텍스트 필요: 지식 베이스가 있는 LLM에게 위임
    answer_with_catalog_llm(state)

elif intent.choice == "return_exchange":
    start_return_flow(state["order_id"])

elif intent.choice == "complaint":
    # 고위험: 인간 에이전트로 라우팅
    route_to_human_agent(state)
```

## 왜 먼저 분류하면 비용이 절감되는가

핵심은 **고비용 처리를 실제로 필요한 요청에만 남겨두는 것**입니다.

고객 메시지의 70%가 `order_status`와 같이 데이터베이스 쿼리 한 번으로 해결 가능한 유형이라고 가정해 보세요. 모든 메시지를 먼저 대형 모델에 보내면, 본래 필요 없었던 이 70%의 메시지에 대해 대형 모델 비용을 지불하게 됩니다. 먼저 저렴한 Choice 분류를 수행하면 이러한 트래픽을 다른 경로로 유도할 수 있습니다.

여기서 사용되는 것은 [Fan-out 패턴](/ko/patterns/fan-out/)입니다: 분류, 심각도, 환불 요청 여부, 감정 등 모든 보조 판단을 한 번에 묻습니다. 여러 번 묻는 것이 속도 비용에 영향을 주지 않기 때문입니다.

## 설계 핵심 사항

**분류 출력은 즉시 사용 가능해야 합니다.** `intent.choice`의 값은 라우팅 테이블의 키로 직접 사용할 수 있어야 하며, 문자열 처리가 필요하지 않아야 합니다.

**분류의 세분화 수준이 시스템 복잡도를 결정합니다.** 카테고리가 너무 적으면 라우팅의 구별력이 떨어지고, 카테고리가 너무 많으면 각 카테고리의 샘플 수가 줄어들어 정확도가 하락합니다. 4~6개 카테고리로 시작하세요.

**추측성 판단을 함께 전송합니다.** 위 예시의 `bug_severity`와 `has_reproducible_steps`는 일부 의도에서만 의미가 있으며, `refund_requested`는 환불 시나리오에서만 의미가 있습니다. 모든 판단을 사전에 전송하면 비용은 거의 발생하지 않습니다. 이것이 [Fan-out 병렬 처리](/ko/patterns/fan-out/)의 가치입니다.

**신뢰도와 함께 2차 게이트를 구성합니다.** `intent.confidence`가 낮으면 분류 자체가 신뢰할 수 없음을 의미하므로, 맹목적으로 라우팅하기보다는 인간 에이전트로 전환하거나 명확화를 요청해야 합니다. 자세한 내용은 [Confidence Routing](/ko/patterns/confidence-routing/)을 참조하세요.

**폴백 카테고리를 유지합니다.** 분류에 `other`와 같은 옵션을 추가하여, 어떤 프로세서 유형에도 일치하지 않는 요청이 가장 가까운 카테고리에 무리하게 할당되지 않고 적절한 처리를 받을 수 있도록 합니다.

## 관련 항목

- [Choice](/ko/primitives/choice/) — 이 패턴의 기본 원리
- [Fan-out 병렬 처리](/ko/patterns/fan-out/) — 모든 보조 판단을 한 번에 묻기
- [Confidence Routing](/ko/patterns/confidence-routing/) — 분류가 신뢰할 수 없을 때 대응 방법
- [Composite Scoring](/ko/patterns/composite-scoring/) — 정렬이 필요한 경우를 위한 보완 패턴
