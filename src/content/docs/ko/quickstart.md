---
title: "5분 만에 시작하기"
description: "API 키를 가져온 후, cURL 또는 SDK를 사용하여 첫 번째 Jev 호출을 성공적으로 수행하고 응답 구조를 이해합니다."
section: start
order: 20
tags: ['quickstart', 'api', 'sdk']
source: docs.typesafe.ai/introduction/quickstart
translatedFrom: zh
---

## 1단계: Playground에서 테스트하기

[Playground](https://console.typesafe.ai/playground)에 접속하여 로그인한 후, 원하는 텍스트를 **state**로 붙여넣습니다:

```text
Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing.
I'm losing sales. Please help ASAP.
```

그런 다음 Noul 질문을 추가합니다:

```json
{
  "urgency": {
    "type": "noul",
    "instructions": "Does this message express urgency?"
  }
}
```

0에서 1 사이의 값을 즉시 받게 됩니다. 1에 가까울수록 모델이 답변이 '예'라고 판단했음을 의미합니다.

Playground의 가치는 **빠른 실험과 오류 수정**에 있습니다: Noul, Choice, Score 세 가지 유형의 질문을 혼합하여 한 번의 호출로 모든 결과를 확인하고, 질문의 표현이 의도한 대로 작동하는지 확인할 수 있습니다.

## 2단계: API 키 받기

[대시보드](https://console.typesafe.ai/settings/keys)에서 키를 생성한 후 환경 변수를 설정합니다:

```bash
export TYPESAFE_API_KEY="sk-..."
```

## 3단계: API 호출하기

모든 모델은 동일한 엔드포인트에서 제공됩니다:

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

최소한으로 작동하는 cURL 예제:

```bash
curl -X POST https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": "Hi, I have been trying to connect my Stripe account for 3 days and it keeps failing. I am losing sales. Please help ASAP.",
    "questions": {
      "department": {
        "type": "choice",
        "instructions": "Which team should handle this",
        "criteria": {
          "billing": "Payment or subscription issues",
          "technical": "Bugs or integration problems",
          "sales": "Pricing or account questions"
        }
      },
      "frustration": {
        "type": "score",
        "instructions": "How frustrated the customer appears",
        "criteria": [
          "Calm, just stating facts",
          "Frustrated but civil",
          "Very angry, strong language"
        ]
      },
      "is_urgent": {
        "type": "noul",
        "instructions": "The message conveys urgency"
      }
    }
  }'
```

## 4단계: SDK 사용 (권장)

SDK는 기본적으로 환경 변수에서 `TYPESAFE_API_KEY`를 읽으며, `jev-latest`를 기본 호출 대상으로 설정합니다.

### 파이썬

```bash
pip install typesafe-sdk     # 또는 uv add typesafe-sdk
```

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state={"document": "I was charged twice. Please fix this ASAP."},
            questions={
                "billing": Noul(instructions="Is this ticket about billing?"),
                "tone": Choice(
                    instructions="What is the customer's tone?",
                    criteria={"calm": None, "frustrated": None, "angry": None},
                ),
                "urgency": Score(
                    instructions="How urgent is this ticket?",
                    criteria=["can wait", "this week", "today"],
                ),
            },
        )

    print(response.nouls["billing"].noul)
    print(response.choices["tone"].choice)
    print(response.scores["urgency"].score)
```

### TypeScript / JavaScript

```bash
npm install @typesafe-ai/sdk    # Node.js 20+ 필요
```

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

TS SDK의 큰 장점 중 하나는 **답변의 타입이 질문으로부터 자동으로 추론**된다는 점입니다: 전달된 `questions`가 반환값의 타입을 결정하므로, 필드명 오타는 컴파일 시점에 발견할 수 있습니다.

## 반환값의 형태

각 답변의 타입은 질문의 `type`에 의해 결정됩니다:

| 타입 | 반환 필드 | 의미 |
| :--- | :--- | :--- |
| `choice` | `choice` / `probabilities` / `confidence` | 선택된 옵션, 각 옵션의 확률 분포, 신뢰도 |
| `score` | `score` / `legend` / `probabilities` / `confidence` | 점수 위치(두 단계 사이일 수 있음), 단계 설명, 확률 분포, 신뢰도 |
| `noul` | `noul` | 답변이 '예'일 확률, 자체적으로 `confidence`를 포함하지 않음 |

핵심 제약 사항: **답변은 항상 제공된 옵션 내에 존재합니다**. 모델은 정의된 옵션에 대한 확률 분포를 반환하며, 집합 밖의 값을 생성하지 않으므로 코드에서 의미 복구를 위한 파서를 작성할 필요가 없습니다.

## 일반적인 함정

- **state의 `state`는 한 번만 읽습니다**: 모델은 먼저 state를 읽고 모든 질문을 병렬로 평가합니다. 따라서 여러 질문을 하나의 요청에 조기에 패키징하면 거의 추가 지연 비용 없이 처리할 수 있습니다.
- **비텍스트 입력은 먼저 변환해야 합니다**: 이미지, 오디오, 비디오는 먼저 텍스트나 구조화된 필드로 변환한 후 state로 전달해야 합니다.
- **초과 시 429 반환**: 공식 SDK는 기본적으로 지수 백오프(retry)를 수행하며 `retry-after` 헤드를 존중합니다. HTTP API를 직접 호출하는 경우 이를 직접 구현해야 합니다.

## 다음 단계

- [Choice 원시 타입](/ko/primitives/choice/) — 분류 및 라우팅의 기초
- [Score 원시 타입](/ko/primitives/score/) — 점수 매기기 및 정렬
- [Noul 원시 타입](/ko/primitives/noul/) — 검증 및 가드레일
- [신뢰도](/ko/concepts/confidence/) — 신뢰도를 사용하여 시스템 동작 제어
