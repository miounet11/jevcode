---
title: "LLM 라우터: 타입이 있는 판정으로 처리자를 고른다"
description: "각 요청을 모델 또는 사람에게 보내는 방법. 항상 가장 큰 모델, 키워드 규칙, 임베딩 라우터, 채팅 모델에게 라벨을 말하게 하는 방법, 그리고 clavue-jev의 choice에 confidence 질문 하나. 분기할 수 있는 것은 그 선택지입니다."
section: cases
order: 235
tags: ['llm-router', 'model-routing', 'routing', 'comparison']
translatedFrom: en
---

## 모델 앞에 있는 판정

LLM 라우터는 사용자에게 답하지 않습니다. 답할 처리자를 고릅니다. 같은 받은편지함에 오타 수정, 설계 질문, 사람에게 가야 할 메시지가 함께 있습니다. 셋을 모두 가장 큰 모델로 보내면 동작합니다. 오타 수정은 큰 모델의 값을 냅니다.

이 일은 **LLM 라우터**, **모델 라우팅**으로 검색됩니다. 고르는 대상은 이미 이름을 붙인 닫힌 집합입니다. 작은 모델, 큰 모델, 조회, 사람. 그 선택은 프로그램이 분기할 수 있는 값입니다.

## 경로가 정해지는 다섯 가지

| 방법 | 경로가 정해지는 방식 | 어긋날 수 있는 것 | 내는 비용 |
| :--- | :--- | :--- | :--- |
| **모든 요청을 한 모델로** | 라우터가 없다 | 작은 일이 큰 모델의 값을 낸다 | 그 모델, 매번 |
| **키워드 또는 정규식** | 단어 목록이 처리자에 대응한다 | 말을 바꾸면 목록에 안 맞는다 | 요청 시점에는 추가 비용 없음 |
| **임베딩 라우터** | 가장 가까운 경로 설명이 이긴다 | 설명과 처리자가 어긋난다 | 임베딩 호출과 그 색인 |
| **채팅 모델에게 라벨을 맡긴다** | 이름으로 답하라고 요청한다 | 이름이 집합 밖에 있거나 문장에 싸여 온다 | 그 모델의 입력과 출력 |
| **타입이 있는 선택 (clavue-jev)** | 나열한 처리자에 대한 `choice`와 `confidence` 질문 하나 | 나열한 처리자만 반환한다 | 성공한 호출의 입력 토큰. 출력은 무료 |

말이 잘 안 바뀌면 키워드 규칙으로 충분합니다. 경로 설명을 이미 두고 있다면 임베딩 라우터가 맞습니다. 경로 자체가 문장이어야 하면 채팅 모델입니다. 경로가 몇 개의 처리자 중 하나이고 다음 줄이 그 값을 읽어야 하면 타입이 있는 선택입니다.

## 이 사이트가 받는 요청

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

```json
{
  "state": "Rename this function and add a test. Do not change behavior.",
  "questions": {
    "route": {
      "type": "choice",
      "instructions": "Which handler should run this request?",
      "options": ["small_model", "large_model", "human"]
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that routing judgment?"
    }
  }
}
```

`state`는 텍스트이며 8자에서 4000자입니다. `questions`는 최대 여섯 개입니다. 키는 소문자로 시작합니다. choice는 `options` 또는 `criteria` 맵으로 보낼 수 있습니다. 이 서버는 모델이 보기 전에 `options`를 criteria로 접습니다.

성공한 호출은 입력 토큰으로 과금합니다. 출력은 무료입니다. 숫자는 [요금](/ko/pricing/)에 있습니다.

응답은 모델 이름을 적고, 각 답을 같은 키로 돌려줍니다.

```json
{
  "model": "clavue-jev",
  "answers": {
    "route": { "choice": "small_model" },
    "sure": { "noul": 0.78 }
  }
}
```

`route.choice`는 보낸 선택지 중 하나입니다. `sure.noul`은 0에서 1 사이의 소수이며 confidence 질문에서 옵니다. 이 API는 choice 안에 확신도를 숨기지 않습니다. 위의 `0.78`은 그 필드의 모양입니다. 측정된 정확도가 아니며, 이 사이트는 하나의 기준값도 게시하지 않습니다.

두 필드로 분기합니다. 기준값은 직접 정합니다.

```python
route = body["answers"]["route"]["choice"]
sure = body["answers"]["sure"]["noul"]
cutoff = 0.8  # 자기 트래픽에서 측정한 기준값으로 바꿉니다

if sure < cutoff or route == "human":
    hand_to_human(state)
elif route == "small_model":
    call_small(state)
else:
    call_large(state)
```

돈을 쓰는 도구로 잘못 보내면, 로그 한 줄로 잘못 보낼 때보다 높은 기준값이 필요합니다. 숫자를 고정하기 전에 [비교](/ko/compare/) 또는 [체험](/ko/try/)에서 자기 트래픽을 한 묶음 읽으십시오. 이유는 [확신도](/ko/concepts/confidence/)에 있습니다.

같은 요청에 질문을 넷 더 넣을 수 있습니다. 경로, 확신도, 몇 개의 예/아니요는 여섯 개 한도 안에 들어갑니다. [팬아웃](/ko/patterns/fan-out/)이 그 모양입니다.

## 라우터가 하지 않는 일

답변을 쓰지 않습니다. 고른 처리자가 씁니다.

처리자를 만들지 않습니다. 맞는 처리자가 `options`에 없으면 choice는 그래도 보낸 이름 중 하나를 반환합니다. 처리자를 추가하거나, 나열한 처리자 중 맞는 것이 있는지를 묻는 `noul`을 추가하고, 없으면 사람에게 보냅니다.

열린 글은 텍스트 모델의 일입니다. 라우터는 어느 텍스트 모델을 돌릴지, 또는 사람이 먼저 볼지를 정합니다. 글이 돌아오면 다른 호출로 실행해도 되는지를 물을 수 있습니다. 두 번째 호출은 [가드레일](/ko/cases/llm-guardrails/)이며 경로의 일부가 아닙니다.

## 이 모양이 이미 있는 곳

[사용 사례 지도](/ko/cases/use-case-map/)는 Jev choice로 모델을 고르는 공개 프로젝트를 모아 둡니다. 코딩 작업 라우터, LiteLLM 기반 라우터, 코딩 에이전트의 요청별 라우터, 모델과 노력 수준을 고르는 로컬 프록시입니다. 공통 모양은 비싼 호출 앞에 choice 하나를 두는 것입니다. 이 페이지는 그 프로젝트에 점수를 더하지 않습니다.

[의도 라우팅](/ko/patterns/intent-routing/)은 같은 판정이며, 대상이 모델이 아니라 고객 지원 대기열입니다.

## 시작

- [API](/ko/api/) — `POST /v1/judge`, 요청과 응답
- [체험](/ko/try/) — 익명 경로, 키 없음
- [System One](/ko/concepts/system-one/) — state, 질문, 응답의 모델 이름
- [확신도](/ko/concepts/confidence/) — 두 번째 질문, 기준값을 정하는 쪽
- [요금](/ko/pricing/) — 입력 토큰 과금, 출력 무료

## 관련

- [구조화된 출력](/ko/cases/structured-output/) — 필요한 것이 경로가 아니라 타입이 있는 값일 때
- [팬아웃](/ko/patterns/fan-out/) — 하나의 state에 여러 질문
- [LLM 가드레일](/ko/cases/llm-guardrails/) — 텍스트 모델이 쓴 뒤의 검사
- [사용 사례 지도](/ko/cases/use-case-map/) — 공개 프로젝트
