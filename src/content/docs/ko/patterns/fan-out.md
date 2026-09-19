---
title: "Fan-out 병렬 처리"
description: "한 번의 호출에서 많은 질문(추측성 질문 포함)을 전송한 후, 코드에서 관련 있는 질문을 결정합니다."
section: patterns
order: 50
tags: ['fan-out', 'latency', 'cost']
source: docs.typesafe.ai/patterns/fan-out
translatedFrom: zh
---

## 이 패턴이 해결하는 문제

기존 방식은 「먼저 분류하고, 분류 결과에 따라 다음에 무엇을 물어볼지 결정한다」는 것입니다. 이는 직렬 호출이 필요합니다: 첫 번째 호출의 결과를 받아야 두 번째로 무엇을 물어봐야 하는지 알 수 있으므로, 지연 시간이 누적됩니다.

팬아웃 병렬 처리(Fan-out Parallelism)는 그 반대로 작동합니다: **필요할 수 있는 모든 질문을 한 번에 보내고**, 분류 결과에 따라 어떤 것을 무시할지 코드가 결정합니다. 모델은 상태를 한 번만 읽고 모든 질문을 병렬로 평가하므로, 여러 질문을 던지는 한계 비용은 매우 낮습니다.

## 핵심 메커니즘

세 가지 사실이 팬아웃 패턴의 기초가 됩니다:

1. 모델은 **상태(state)를 한 번만 읽고**, 모든 질문을 병렬로 평가합니다.
2. **각 답변은 서로 독립적입니다** — 한 질문의 답변이 다른 질문의 숨겨진 문맥이 되지 않습니다.
3. 컨텍스트 예산은 64k 토큰(state + 모든 질문) 또는 32k 토큰(state + 가장 긴 단일 질문)입니다.

두 번째 사실이 특히 중요합니다: 이는 관련 없는 질문들을 함께 보내도 관련 질문의 답변을 오염시키지 않음을 보장합니다.

## 예시: 티켓 라우팅

고객 지원 티켓을 처리해야 하지만, 유형에 따라 완전히 다른 판단이 필요합니다. 먼저 분류하고 다시 묻기보다는, 한 번에 모두 물어보는 것이 좋습니다.

### 1단계: 한 번의 요청으로 모든 판단 질문하기

```json
{
  "questions": {
    "category": {
      "type": "choice",
      "instructions": "What kind of request is this?",
      "criteria": {
        "bug_report": "Reporting something broken",
        "billing": "Payment, invoice, or refund matters",
        "feature_request": "Asking for new functionality"
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

여기서 `bug_severity`와 `has_reproducible_steps`는 티켓이 버그 보고일 때만 의미가 있으며, `refund_requested`는 청구 관련 문제일 때만 의미가 있습니다. **이들은 추측성 질문(speculative questions)입니다** — 하지만 여러 질문을 던져도 속도 비용이 발생하지 않으므로, 모두 사전에 던져두면 됩니다.

### 2단계: 코드로 라우팅하기

```python
category = response.answers["category"]
bug_severity = response.answers["bug_severity"]
bug_repro = response.answers["has_reproducible_steps"]
refund = response.answers["refund_requested"]
frustration = response.answers["frustration"]

if category.choice == "bug_report":
    if bug_severity.score > 1.5 and bug_repro.noul > 0.6:
        escalate_to_engineering(ticket_id, severity="high")
    else:
        add_to_bug_backlog(ticket_id)

elif category.choice == "billing":
    if refund.noul > 0.7:
        route_to_billing_with_flag(ticket_id, refund_likely=True)
    else:
        route_to_billing(ticket_id)

elif category.choice == "feature_request":
    log_feature_request(ticket_id)

# 어떤 분류든 frustration은 유용합니다
if frustration.score > 1.5:
    flag_for_priority_response(ticket_id)
```

**완전한 의사결정 트리에 필요한 모든 정보는 한 번의 호출에서 나옵니다.** 관련 없는 경우 추측성 질문은 무시되고, 관련 있는 경우 왕복(round-trip)을 한 번 절약할 수 있습니다.

## 설계 포인트

**먼저 모두 묻고, 나중에 필터링하세요.** 「어떤 질문을 물어볼 가치가 있는가」에 대한 판단을 호출 전에서 호출 후로 미룹니다. 호출 전에는 분류 결과를 알 수 없으므로 판단할 수 없지만, 호출 후에는 답변을 얻었으므로 필터링은 단순한 분기 처리가 됩니다.

**컨텍스트 예산에 주의하세요.** 64k는 state와 **모든** 질문을 합친 값입니다. 만약 수십 개의 질문을 팬아웃해야 한다면(예: 문서 집합에 대해 개별적으로 점수 매기기), state가 빠르게 커집니다. 이 경우 여러 요청으로 나누거나, [Score의 배치 사용](https://docs.typesafe.ai/patterns)을 고려하세요.

**「추측성」과 「중복」을 구분하세요.** 추측성 질문은 **다른 분기에서도 명확한 의미**를 가지는 질문입니다. 만약 어떤 질문의 답변을 어떤 분기에서도 읽지 않는다면, 그것은 추측성이 아니라 낭비입니다 — 비용은 낮지만 코드를 지저분하게 만듭니다.

**신뢰도(confidence)와 함께 사용하세요.** 팬아웃은 「무엇을 물을 것인가」를 해결하고, 신뢰도 라우팅은 「얼마나 믿을 것인가」를 해결합니다. 이 둘을 조합한 형태는 프로덕션 시스템에서 흔히 볼 수 있습니다: [신뢰도 라우팅](/ko/patterns/confidence-routing/)의 음성 뱅크 예시를 참조하세요.

## 관련

- [질문 원시 타입](/ko/primitives/) — 독립성과 추측성 질문
- [State](/ko/concepts/state/) — 컨텍스트 예산 및 state 조직화
- [신뢰도 라우팅](/ko/patterns/confidence-routing/) — 두 번째 의사결정 축
