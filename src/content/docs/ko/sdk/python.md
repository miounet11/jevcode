---
title: "Python SDK"
description: "typesafe-sdk를 설치하고 동기 또는 비동기 클라이언트를 사용하여 System One API를 호출합니다."
section: sdk
order: 20
tags: ['python', 'sdk', 'async']
source: docs.typesafe.ai/sdk/python
translatedFrom: zh
---

## 설치

```bash
# uv 사용
uv add typesafe-sdk

# 또는 pip 사용
pip install typesafe-sdk
```

그런 다음 환경 변수를 설정합니다 (키 생성은 [console](https://console.typesafe.ai/) 에서 진행):

```bash
export TYPESAFE_API_KEY="sk-..."
```

클라이언트는 이 환경 변수를 자동으로 읽으며, 기본적으로 `jev-latest`를 호출합니다.

## 비동기 클라이언트 (권장)

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state={"document": "두 번 청구되었습니다. 이 문제를 ASAP로 해결해 주세요."},
            questions={
                "billing": Noul(instructions="이 티켓이 청구 관련인가요?"),
                "tone": Choice(
                    instructions="고객의 어조는 무엇인가요?",
                    criteria={"calm": None, "frustrated": None, "angry": None},
                ),
                "urgency": Score(
                    instructions="이 티켓의 긴급도는 어떻게 되나요?",
                    criteria=["기다릴 수 있음", "이번 주", "오늘"],
                ),
            },
        )

    print(response.nouls["billing"].noul)
    print(response.choices["tone"].choice)
    print(response.scores["urgency"].score)
```

다음 세 가지 사항에 유의하십시오:

1. `state`에는 문자열, 사전(dict) 또는 리스트를 직접 전달할 수 있으며, SDK가 직렬화를 처리합니다.
2. 세 가지 유형의 질문은 `Noul(...)` / `Choice(...)` / `Score(...)`로 생성하며, `type` 필드는 SDK가 자동으로 채웁니다.
3. **응답은 질문 유형별로 그룹화됩니다** — `response.nouls`, `response.choices`, `response.scores`이며, 각각 질문 이름으로 인덱싱합니다.

## 질문 생성기

| 생성기 | 매개변수 | 설명 |
| :--- | :--- | :--- |
| `Noul(instructions, criteria=None)` | `criteria` 선택 사항, `{ true, false }` | 예/아니오 확률 |
| `Choice(instructions, criteria)` | `criteria`는 `{ 옵션: 설명 또는 None }` | 고정된 옵션 중 하나 선택 |
| `Score(instructions, criteria)` | `criteria`는 **정렬된 배열** | 정렬된 등급에서 점수 매기기 |

## 동기 클라이언트

환경에서 async를 사용하기 어려운 경우 동기 버전도 제공됩니다:

```python
from typesafe_sdk import TypeSafeClient, Noul

client = TypeSafeClient()

response = client.system_one(
    state="두 번 청구되었습니다.",
    questions={"billing": Noul(instructions="이것이 청구 관련인가요?")},
)

print(response.nouls["billing"].noul)
```

## 오류 및 재시도

SDK는 기본적으로 지수 백오프(exponential backoff) 전략으로 재시도하며, 서버가 반환한 `retry-after` 헤더를 존중합니다. 이는 직접 HTTP API를 호출하는 것보다 훨씬 편리합니다 — 속도 제한은 동적으로 조정되며, 공식 문서에서는 제한 사항이 언제든지 변경될 수 있다고 명시하고 있습니다.

## 관련

- [Python SDK 전체 API 참조](https://docs.typesafe.ai/sdk/python/api/clients/async/client)
- [5분 시작하기](/ko/quickstart/)
- [Fan-out 병렬 처리](/ko/patterns/fan-out/) — 한 번에 여러 질문하기
