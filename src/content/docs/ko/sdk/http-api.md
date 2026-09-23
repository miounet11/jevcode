---
title: "HTTP API 레퍼런스"
description: "TypeSafe 평가 엔드포인트를 직접 호출하세요 — 요청 형태, noul / choice / score 질문 유형, 응답 형태 및 오류 처리"
section: sdk
order: 50
tags: ['api', 'http', 'reference']
source: docs.typesafe.ai/api
translatedFrom: en
---
## 엔드포인트

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

`state`에 타입 지정된 `questions`의 맵을 보내면, 질문당 하나의 `answer`를 반환받습니다.

## 요청 본문

```json
{
  "state": "Help! My payouts have been failing for 3 days.",
  "model": "jev-latest",
  "questions": {
    "is_urgent": {
      "type": "noul",
      "instructions": "Does this convey urgency?"
    }
  }
}
```

| 필드 | 유형 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `state` | string \| object \| array | 예 | 평가할 콘텐츠. 텍스트의 경우 일반 문자열, 채팅 로그, 레코드 또는 애플리케이션의 현재 상태와 같은 구조화된 데이터의 경우 해당 유형 |
| `model` | string | 예 | 요청을 처리하는 모델. `jev-latest`, TypeSafe의 플래그십 모델을 사용하십시오. 다른 모델과 별칭에 대한 공식 모델 페이지를 참조하십시오 |
| `questions` | map&lt;string, Question&gt; | 예 | 타입 지정된 질문의 맵 |

`questions`에서 키를 선택하면, 각 답변은 **같은 키** 아래로 반환됩니다. 이 키는 하위 모델로 전송되지 않으며 추론에도 사용되지 않으므로, 비즈니스 도메인에 맞게 이름을 지을 수 있습니다(`department`, `is_urgent`).

## 세 가지 질문 유형

A `Question`는 `type` 필드에 따라 구별되며, 총 세 가지가 있습니다. 세 가지 모두 `type`와 `instructions`를 공유하며, 각각 고유한 `criteria`를 추가합니다.

`instructions`의 타입은 `string | object | array`입니다.

### noul — 예/아니오 결정

예/아니오 질문입니다. **답변이 예일 확률을 반환합니다.**

```json
{
  "is_urgent": {
    "type": "noul",
    "instructions": "Does this convey urgency?",
    "criteria": {
      "true": "Explicitly time-sensitive",
      "false": "No urgency expressed"
    }
  }
}
```

`criteria`는 선택사항이며, "yes"와 "no"가 각각 무엇을 의미하는지 설명합니다:

| Key | Description |
| :--- | :--- |
| `true` | 1에 가까운 값("예")이 의미하는 바 |
| `false` | 0에 가까운 값("아니오")이 의미하는 바 |

### 선택 — 옵션 중에서 선택

정의한 세트에서 하나의 옵션을 선택하고, 선택된 옵션 **과 전체 확률 분포**를 반환합니다.

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this?",
    "criteria": {
      "billing": "Payments, invoicing, refunds",
      "technical": "Bugs, outages, integrations",
      "sales": "Pricing, upgrades, new accounts"
    }
  }
}
```

`criteria`이(가) 필요하며, 유형은 `map<string, string | null>`입니다: 루브릭 설명에 매핑된 옵션 이름입니다. 옵션에 추가 설명이 필요하지 않을 때 값으로 `null`을(를) 사용하십시오.

### score — 척도상에서 평가

**`state`**를 당신이 정의한 기준에 따라 평가하고, **등급 전반에 걸쳐 확률 가중된 값**을 반환하세요.

```json
{
  "frustration": {
    "type": "score",
    "instructions": "How frustrated is the customer?",
    "criteria": ["Calm", "Frustrated", "Very angry"]
  }
}
```

`criteria`는 필수이며, 레벨 설명의 **순서 있는 배열**입니다. 최소 두 개의 레벨을 포함해야 합니다.

## 응답 본문

각 질문은 제공한 id로 키가 지정된 하나의 답변을 생성합니다.

```json
{
  "model": "jev-latest",
  "answers": {
    "is_urgent": {
      "type": "noul",
      "noul": 0.92
    }
  },
  "usage": { "input_tokens": 312, "output_tokens": 48 }
}
```

| 필드 | 유형 | 설명 |
| :--- | :--- | :--- |
| `model` | string | 평가를 수행한 모델 |
| `answers` | map&lt;string, Answer&gt; | 각 질문당 하나의 답변, `questions`와 동일한 키로 매핑됨 |
| `usage` | object | 요청에 대한 토큰 사용량: `input_tokens`, `output_tokens` |

### 유형별 답변 형태

모든 답변에는 질문에 대응하는 `type`이(가) 매칭됩니다. `choice` 및 `score` 답변에는 해당 답변의 확률 분포(공식 Confidence 페이지 참조)에서 파생된 `confidence`(0과 1 사이)도 함께 포함됩니다.

**noul 답변**

| 필드 | 유형 | 설명 |
| :--- | :--- | :--- |
| `noul` | number | 예/아니오 답변, 0(아니오)부터 1(예)까지 |

```json
{ "type": "noul", "noul": 0.92 }
```

**선택 답변**

| 필드 | 유형 | 설명 |
| :--- | :--- | :--- |
| `choice` | string | 가장 확률이 높은 옵션 |
| `probabilities` | map&lt;string, number&gt; | 옵션별 확률; 합계는 1 |
| `confidence` | number | 확률에서 유도된 모델의 확신도 |

```json
{
  "type": "choice",
  "choice": "technical",
  "probabilities": { "billing": 0.08, "technical": 0.85, "sales": 0.07 },
  "confidence": 0.82
}
```

**점수 답변**

| 필드 | 유형 | 설명 |
| :--- | :--- | :--- |
| `score` | number | **레벨 간에 위치할 수 있는** 확률 가중 값 |
| `legend` | map&lt;string, string&gt; | 각 레벨 인덱스를 해당 설명으로 매핑 |
| `probabilities` | map&lt;string, number&gt; | 레벨별 확률(문자열 키); 합계는 1 |
| `confidence` | number | 확률에서 유도된 모델의 확신도 |

```json
{
  "type": "score",
  "score": 1.6,
  "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
  "probabilities": { "0": 0.05, "1": 0.3, "2": 0.65 },
  "confidence": 0.78
}
```

`score`와 `probabilities`의 관계를 살펴보면, 세 가지 레벨 확률은 각각 0.05 / 0.3 / 0.65이며, 이는 `score` 1.6으로 가중치가 부여됩니다. 따라서 `score`는 정수일 필요가 없습니다. 이것이 바로 `choice`와 구분되는 지점입니다. `choice`는 하나의 이산적 옵션을 제공하는 반면, `score`은 "두 레벨 사이의 어딘가"를 표현할 수 있습니다.

## 오류

오류는 표준 HTTP 상태 코드를 사용하며, JSON 본문에 오류 원인이 설명됩니다。

| 상태 | 의미 |
| :--- | :--- |
| `401 Unauthorized` | API 키가 누락되었거나 유효하지 않습니다. `Authorization` 헤더를 확인하세요 |
| `422 Unprocessable Entity` | 요청 본문이 유효성 검사를 실패했습니다. 예를 들어 필수 필드가 누락되었거나 질문 형식이 잘못되었습니다. 본문에서 문제의 필드를 가리킵니다 |
| `429 Too Many Requests` | 요청 한도를 초과했습니다. 짧은 지연 후 다시 시도하세요 |
| `529 Overloaded` | TypeSafe가 일시적으로 과부하 상태입니다. 짧은 지연 후 다시 시도하세요 |

### 속도 제한 처리

`429` 또는 `529`에서 즉시 재시도하는 대신 **지수 백오프로 재시도**하세요. 공식 SDK를 사용하는 경우, SDK의 기본 재시도 정책이 이를 자동으로 처리하므로 추가 코드가 필요하지 않습니다.