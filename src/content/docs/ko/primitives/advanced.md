---
title: "구조화된 질문"
description: "instructions와 criteria는 모두 JSON 구조를 받습니다. System One 모델은 구조를 이해하도록 학습되었으며, 이를 효과적으로 활용하면 복잡한 판단의 정확성이 크게 향상됩니다."
section: primitives
order: 90
tags: ['instructions', 'criteria', 'structure']
source: docs.typesafe.ai/primitives/advanced
translatedFrom: zh
---

## 구조는 어디에 사용할 수 있나요

다음 필드는 모두 `string`, `object`, `array` 또는 `null`을 허용합니다:

| 필드 | 적용 대상 |
| :--- | :--- |
| `instructions` | Choice, Score, Noul |
| `criteria` 값 (Choice의 옵션 설명) | Choice |
| `criteria` 항목 (Score의 등급 설명) | Score |
| `criteria.true` / `criteria.false` | Noul |

**System One 모델은 구조를 이해하도록 훈련되었습니다.** 이는 우회해야 할 제약이 아니라, 적극적으로 활용해야 할 능력입니다.

## 언제 구조화된 형식을 사용해야 하나요

- **명확성이 향상될 때입니다.** 하나의 질문이 여러 부분으로 구성되어 있을 때, JSON을 사용하여 각 부분을 이름 있는 키에 담으면 템플릿 문자열로 붙여넣는 것보다 가독성이 훨씬 뛰어납니다.
- **질문에 지원 데이터가 필요할 때입니다.** 스키마, 분류 체계, 데이터베이스 행은 본질적으로 JSON입니다. 전체를 전달하거나 관련 하위 필드만 전달하세요. 모델을 위해 문자열로 직렬화하여 전달하는 대신에요.

## 구조화된 instructions: 재사용 가능한 필드 설명

일반적인 패턴은 `field` 객체를 사용하여 **검사할 필드**를 설명한 후, 여러 질문이 키를 통해 이를 참조하도록 하는 것입니다.

다음은 송장 검증 예시입니다. `state`는 송장 텍스트입니다:

```text
Invoice #4471 issued March 3, 2026 to Beaver Dam Logistics for $12,840.00, net 30.
```

그리고 **동일한 `field` 형태**가 네 가지 다른 판단을 구동합니다. 값의 유효성을 검사하는 Noul, 후보 중 값을 선택하는 Choice, 값을 척도에 매핑하는 두 가지 Score가 있습니다:

```json
{
  "questions": {
    "invoice_number_is_correct": {
      "type": "noul",
      "instructions": {
        "field": {
          "name": "invoice_number",
          "type": "string",
          "description": "The identifier printed on the invoice."
        },
        "extracted_value": "4471",
        "question": "Does `extracted_value` match the `field` as it appears in `source_text`?"
      }
    },
    "customer_name": {
      "type": "choice",
      "instructions": {
        "field": {
          "name": "customer_name",
          "type": "string",
          "description": "The organization the invoice was issued to."
        },
        "question": "Which option is the value of `field` in `source_text`?"
      },
      "criteria": {
        "Beaver Logistics": null,
        "Dam Logistics": null,
        "Beaver Dam Logistics": null,
        "Beaver": null,
        "Dam": null
      }
    },
    "payment_terms": {
      "type": "score",
      "instructions": {
        "field": {
          "name": "payment_terms",
          "type": "integer",
          "unit": "days",
          "description": "Days allowed for payment, from terms such as \"net 30\"."
        },
        "question": "How many days does the `field` in `source_text` allow for payment?"
      },
      "criteria": ["Due on receipt", "Net 15", "Net 30", "Net 60", "Net 90 or longer"]
    }
  }
}
```

이 예시의 가치는 **구조의 재사용성**을 보여준다는 점에 있습니다. `field` 내에서 이름, 유형, 단위, 설명을 선언한 후, 각 질문은 '어떤 판단을 수행할지'만 명시하면 됩니다. 구조화된 추출 시나리오에서는 각 질문에 독립적인 자연어 프롬프트를 작성하는 것보다 훨씬 안정적입니다. 필드의 의미론이 한 번만 정의되기 때문입니다.

`customer_name` Choice도 주목할 만합니다. 옵션은 **혼동하기 쉬운 유사 문자열**(Beaver Logistics / Dam Logistics / Beaver Dam Logistics / Beaver / Dam)의 집합입니다. 이러한 '유사한 후보 중 올바른 것을 선택'하는 작업은 Choice의 전형적인 강점이며, Noul을 사용하여 하나씩 판단하면 속도가 느리고 일관성이 떨어지기 쉽습니다.

## 구조화된 Score 등급

Score의 `criteria` 배열 내 각 항목은 객체가 될 수 있으며, 이를 통해 등급에 추가 정보(예: 수치 범위, 예시)를 부여할 수 있습니다.

## 구조화된 Noul criteria

Noul의 `criteria`는 선택 사항입니다. 예/아니오의 경계가 미묘할 때, 구조화된 `true` 및 `false` 설명을 사용하면 양측에 정의와 예시를 제공하여 경계를 명확히 할 수 있습니다.

## 계층적 분류: 체이닝 Choice

깊은 분류 체계에서 분류를 수행하려면, 전체 분류 트리를 한 번에 하나의 질문 옵션에 넣는 대신 **단계별로 체이닝하여 Choice를 호출**하세요.

방법은 다음과 같습니다. 첫 번째 단계에서 최상위 부서를 묻고, 옵션은 각 부서이며 값은 해당 부서 **하위 트리의 구조**입니다. `probabilities`를 확인하여 분기가 충분히 근접한지 판단합니다. 근접하다면 두 분기를 모두 탐색합니다.

특정 부서가 선택되면, 다음 단계에서는 해당 부서의 하위 노드를 옵션으로, 하위 트리를 값으로 사용하여 이를 반복합니다. 코드에서는 이는 중첩된 딕셔너리에 대한 루프가 될 수 있으며, 각 질문의 `criteria`는 현재 노드가 됩니다.

공식 문서에는 Hierarchical Classification cookbook이 있으며, 여기에는 확률이 근접할 때 빔 서치(Beam Search)를 사용하여 여러 후보 경로를 유지하는 전략을 포함한 유사한 트리가 순회되는 예시가 나와 있습니다.

> **팁**: 하위 트리가 매우 커질 수 있습니다. 특정 분기가 너무 크다면 값을 해당 분기의 직접적인 하위 노드와 소수의 리프 샘플로 잘라내세요.

## 관련 문서

- [Choice](/ko/primitives/choice/) / [Score](/ko/primitives/score/) / [Noul](/ko/primitives/noul/)
- [Fan-out 패턴](/ko/patterns/fan-out/) — 대량의 질문을 한 번의 요청에 패키징
- [System One 시스템 구축 방법](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — 공식 전체 워크플로우
