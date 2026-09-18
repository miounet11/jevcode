---
title: "신뢰도"
description: "confidence는 확률 분포에서 유도된 통계량입니다. probabilities와의 관계를 이해하고, 임계값이 위험도에 따라 어떻게 조정되는지 파악하세요."
section: concepts
order: 30
tags: ['confidence', 'probabilities', 'threshold']
source: docs.typesafe.ai/confidence
translatedFrom: zh
---

## 두 필드의 관계

모든 `Choice` 및 `Score` 답변에는 각 옵션(Choice) 또는 각 등급(Score)에서의 **확률 분포**를 나타내는 `probabilities` 속성이 포함되어 있습니다.

이 분포의 **형태**는 모델의 확신 정도를 보여줍니다: 결과가 한 곳에 집중되어 있다는 것은 답변이 명확함을 의미하며, 넓게 퍼져 있다는 것은 불확실함을 의미합니다.

`confidence` 속성은 이러한 형태를 0에서 1 사이의 숫자로 압축하여, 별도의 수학적 계산 없이도 임계값을 직접 설정할 수 있게 해줍니다.

> **참고**: `Noul` 답변은 `confidence` 속성을 포함하지 않으며, 그 자체가 0에서 1 사이의 확률 값입니다.

## 분포 형태의 의미

- **Choice의 신뢰도가 낮음**은 일반적으로 어떤 옵션도 다른 옵션보다 현저히 우월하지 않음을 의미합니다.
- **Score의 신뢰도가 낮음**은 일반적으로 등급 정의에 모호함이 있거나 다차원적이거나, state에 판단에 필요한 정보가 부족함을 의미합니다.

## "모른다"는 것은 유용한 신호입니다

인간이든 기계이든, 불확실성을 정직하게 표현할 수 없는 지능 시스템은 신뢰할 수 없습니다.

신뢰도는 모델에게 "이건 불확실합니다"라고 말할 수 있는 내장 메커니즘을 제공합니다. 이를 통해 코드는 서로 다른 확신 수준에 따라 다른 동작을 구현할 수 있으며, 이는 진정한 신뢰성 있는 시스템을 구축하는 기초가 됩니다.

## 세 가지 분기

실용적인 시작점으로 신뢰도를 세 구간으로 나누어 각 구간마다 다른 시스템 동작을 대응시킬 수 있습니다:

- **높은 신뢰도**: 자동 실행. 모델이 명확한 판단을 내렸으며 인간 개입이 필요 없습니다.
- **중간 신뢰도**: 신중하게 진행. 모델이 합리적인 답변을 제시했지만 확신이 부족합니다. 문맥에 따라 사용자의 확인을 받거나, 검토 대기 상태로 표시하거나, 추가 정보를 수집할 수 있습니다.
- **낮은 신뢰도**: 실행하지 않음. 인간에게 위임하거나, 명확한 설명을 요청하거나, 다른 시스템으로 폴백합니다. 모델이 정보 부족을 나타내거나, 이 문제가 모델에게 적합하지 않음을 알려줍니다.

**경계는 리스크의 크기에 따라 결정됩니다.**

## 리스크에 따른 임계값 조정

가장 중요한 실무 원칙은 다음과 같습니다: **신뢰도 임계값은 단일 숫자가 아닙니다.**

동일한 시스템 내에서 서로 다른 작업은 "실수했을 때의 결과"에 따라 서로 다른 임계값을 설정해야 합니다.

```python
response = client.system_one(
    state=user_message,
    questions={
        "action": Choice(
            instructions="What is the user trying to do?",
            criteria={
                "check_balance": "View account balance",
                "approve_transfer": "Approve the pending withdrawal request",
                "support": "Get help with an issue",
            },
        ),
    },
)

action = response.answers["action"]
confidence = action.confidence

if confidence < 0.5:
    # 모델이 실제로 불확실합니다. 추측하지 마십시오.
    route_to_human(user_message)

elif action.choice == "check_balance":
    # 리스크가 낮습니다. 잘못된 화면 표시는 복구 가능합니다.
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if confidence > 0.9:
        # 리스크가 높고 신뢰도도 높습니다. 확인을 거쳐 실행합니다.
        confirm_then_execute(account_id)
    else:
        # 리스크가 높고 신뢰도는 중간입니다. 먼저 검증합니다.
        ask_user_to_confirm(account_id)
```

이 코드에는 서로 다른 리스크 수준에 대응하는 세 가지 서로 다른 임계값이 있습니다:

| 작업 | 리스크 | 임계값 |
| :--- | :--- | :--- |
| 0.5 미만은 모두 차단 | — | 모델이 스스로 불확실하다고 판단하는 경우를 포착하는 하드 하한선 |
| `check_balance` | 낮음, 읽기 전용 및 복구 가능 | 0.5 이상이면 자동 실행 |
| `approve_transfer` | 높음, 자금 관련 | 0.9 초과 필요, 그리고 여전히 사용자 확인 필요 |

`0.5`라는 하한선은 모델이 스스로 보고한 "실제로 불확실함"을 차단합니다. 그 위에서는 파괴적인 작업을 실행하는 데 필요한 임계값이 읽기 전용 작업보다 훨씬 높습니다. **코드는 당신의 리스크 허용도를 인코딩합니다.**

> **참고**: 올바른 임계값은 당신의 도메인과 모델이 당신의 사용 사례에서 실제로 보여주는 성능에 따라 달라집니다. 보수적인 임계값으로 시작하여 자체 데이터로 테스트한 후, 관찰 결과를 바탕으로 조정하십시오.

## 자체 정의 측정 가능

공식적으로 제공되는 `confidence`는 대부분의 사용 사례에 적합한 편의 측정 항목이지만, 그 정의에 묶일 필요는 없습니다. 무엇을 평가하느냐에 따라 다른 측정 항목이 더 적합할 수 있으며, 이것이 `probabilities`도 함께 반환되는 이유입니다: 전체 분포를 가지고 있으므로 직접 계산할 수 있습니다.

예를 들어, 두 후보 옵션 간의 확률 차이(margin)은 특정 상황에서 집중도보다 "자동 실행 여부"를 더 잘 반영할 수 있습니다. 또는 나머지 옵션은 무시하고 top-1 확률만 볼 수도 있습니다. 선택은 당신에게 달려 있습니다.

## 관련

- [Choice](/ko/primitives/choice/) / [Score](/ko/primitives/score/) — confidence를 포함하는 두 가지 원시 타입
- [Noul](/ko/primitives/noul/) — confidence를 포함하지 않으며, 그 자체가 확률임
- [신뢰도 라우팅 패턴](/ko/patterns/confidence-routing/) — 신뢰도를 파이프라인 라우팅 신호로 사용
