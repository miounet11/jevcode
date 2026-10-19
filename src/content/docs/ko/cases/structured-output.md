---
title: "LLM 구조화된 출력: JSON 모드, 함수 호출 및 타입 기반 결정"
description: "LLM 앱의 구조화된 출력 옵션 비교 — JSON 모드, 스키마 제약 디코딩, 함수 호출, TypeSafe typed 질문 — 실패 모드, 비용, 그리고 모델을 호출해 JSON을 생성하도록 요청하는 것보다 closed-set decision primitive가 더 효과적인 경우"
section: cases
order: 205
tags: ['structured-output', 'json-mode', 'function-calling', 'comparison']
translatedFrom: en
---
## 모든 LLM 앱이 직면하는 문제

LLM은 문체를 반환합니다. 당신의 애플리케이션은 데이터가 필요합니다: 카테고리, 숫자, 부울, 구조체. 그 이후의 모든 것 — 라우팅, 저장, 대시보드, 재시도 —은 구문 분석 가능하고 유효한 출력이 **매번** 보장되는 것에 의존합니다.

이것의 업계 명칭은 **구조화된 출력**이며, 이를 얻는 방법에는 현재 네 가지 주류가 있습니다. 이들은 보장 사항, 비용, 그리고 어떤 부분이 깨지는지에 따라 다릅니다.

## 네 가지 옵션 한눈에 보기

| 접근 방식 | 작동 방식 | 보장 사항 | 실패 모드 | 상대 비용 |
| :--- | :--- | :--- | :--- | :--- |
| **JSON을 위한 프롬프팅** | 모델에게 "JSON으로 답해"라고 요청 | 없음 — 제안일 뿐 | trailing comma, JSON 주변의 문체, 발명된 필드 | 1x 생성 (길 수 있음) |
| **JSON 모드 / response_format** | 출력을 유효한 JSON으로 제한하는 API 플래그 | 유효한 JSON 구문 | 모양이나 타입이 잘못된 유효한 JSON; 스키마 드리프트 | 1x 생성 |
| **스키마 제약 디코딩** | 토큰 샘플링 중 적용되는 구문/정규식 제약 | 구문 *및* 모양이 스키마와 일치 | 의미론적으로 잘못되었지만 합리적으로 채워진 필드; 서버 지원 필요 | 1x 생성 + 서빙 복잡성 |
| **함수 호출** | 모델이 선언된 함수와 인수를 선택 | 인수가 시그니처와 검증됨 | 열거형 밖의 환각된 인수 값; 다단계 취약성 | 1x 생성 |
| **타입 질문 (TypeSafe)** | 상태에 대한 폐쇄 집합 선택 / 점수 / Noul 질문 | 타입 지정된 답변 + 전체 확률 분포 + 신뢰도, 한 번에 | 질문하지 않은 것 — 질문하지 않은 질문은 환각을 일으킬 수 없음 | 토큰 입력만; **출력은 무료** |

첫 번째부터 네 번째까지의 공통된 특징을 솔직히 말하자면, **모델이 여전히 토큰을 하나씩 생성해 낸다**는 점이다. 위에서 언급된 모든 보장 사항은 생성을 대체하는 것이 아니라, 생성을 둘러싼 안전장치다. 다섯 번째는 폐쇄된 집합에 대한 분포를 출력하는 단일 순전파로 생성을 대체한다.

## 폐쇄 집합이 실패 프로필을 어떻게 바꾸는가

JSON 모드에서는 `"priority": "high"`와 같은 필드가 `"High"`, `"HIGH"`,
`"priority_high"`, 또는 `2`로 반환될 수 있습니다. 검증자, 재시도 루프, 그리고 대체(fallback) 로직은 당신이 작성해야 합니다.
스키마 제약이 있는 디코딩의 경우, 구조는 올바르지만 *값*이
올바른 판단인지 확인하는 것은 아무도 없습니다. 완벽하게 형식화된 구조체라도 잘못된 답을 포함할 수 있으며,
모델이 얼마나 확신하는지에 대한 신호는 없습니다.

타입화된 질문은 반대 접근 방식을 취합니다: 답변 공간은 요청이 존재하기 전에 고정됩니다.

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state=ticket_text,
            questions={
                "priority": Choice(
                    instructions="Which priority does this ticket have?",
                    criteria={
                        "p0": "Outage or data loss, all users affected",
                        "p1": "Major feature broken, workaround exists",
                        "p2": "Minor issue, scheduled work",
                    },
                )
            },
        )

    answer = response.answers["priority"]
    print(answer.choice)                            # "p1"
    print(answer.confidence)                        # 0.93 — route on it directly
```

당신이 받아보는 것은 파싱할 문자열이 아닙니다. 정확히 당신이 선언한 옵션들에 대한 확률 분포를 가진 **타입 값**입니다 — `p0: 0.02, p1: 0.93, p2: 0.05` —
그리고 신뢰도 숫자 하나. 유효성을 검사할 JSON도, 정규화할 열거형도, 잘못된 출력에 대한 재시도 루프도 없습니다. 잘못된 출력이 생성될 수 없기 때문입니다.

## 실제 사례에서 이것이 어떻게 보이는지

**enum 인수를 사용한 함수 호출.** 함수 시그니처에서 `Literal` 타입을 이미 사용하고 있다면, 이러한 폐쇄 집합은 Choice 질문과 1:1로 매핑됩니다 — 자연어가 per-argument 신뢰도와 함께 타입화된 호출로 변환되는 완전한 트레이딩 어시스턴트 예제가 있는 [함수 호출 쿡북](/en/cases/function-calling/)을 참조하세요.

**추출 파이프라인.** 문서에서 값을 추출하기 위해, 질문 맵 *은* 스키마 그 자체입니다 — 필드당 하나의 항목이며, 의미론은 정확히 한 번 정의됩니다. [구조화된 데이터 추출 캐스케이드](/en/cases/sde-cascade/)는 검증 단계를 포함한 두 단계 버전을 보여줍니다.

**가이드라인 및 분류.** 예/아니오 확인(이것이 제이브레이크인가? 여기에 개인식별정보가 포함되어 있는가?)은 Noul 질문이다 — 이는 파싱된 문자열이 아닌 확률이다. [LLM용 가이드라인](/en/cases/llm-guardrails/) 참조.

**불확실성 처리.** 확률 분포는 JSON 모드에서 제공할 수 없는 부분입니다. [신뢰도를 사용한 분류](/en/cases/classification-using-confidence/)와 [신뢰도 게이트 라우팅](/en/patterns/confidence-routing/)은 그것이 무엇을 가능하게 하는지 보여줍니다: 임계값 이상에서는 자동 수락, 임계값 이하에서는 인간 검토, 자체 데이터로 측정.

## 정직한 트레이드오프 표

| | JSON mode / function calling | Typed questions |
| :--- | :--- | :--- |
| Open-ended text generation | 예 — 스키마에 자유 문자열 포함 가능 | 아니요 — 답변은 닫힌 집합에서 제공됨 |
| Output validity | 생성 후 검증됨 | 구성에 의해 보장됨 |
| Confidence signal | 때때로 (logprobs, 노출된 경우) | 항상 — 질문별 전체 분포 |
| Cost driver | 생성된 출력 토큰 | 입력 토큰만 (출력 무료) |
| Schema changes | JSON 스키마 편집, 재프롬프트 | 질문 맵 편집, 동일한 요청 형태 |
| Best for | 구조가 포함된 초안, 요약, 창의적 텍스트 | 결정: 분류, 라우팅, 점수 매기기, 검증 |

두 가지 접근 방식은 경쟁자가 아니라 상호 보완적입니다. 생성된 *간단한 설명*과 라우팅 결정이 모두 필요한 파이프라인은 생성 비용은 한 번만 지불하고, 동일한 JSON에서 파싱하는 대신typed 질문을 통해 결정을 내립니다.

## 시작하기

- [Primitives overview](/en/primitives/) — Choice, Score, Noul 및 각 경우에 대한 적용
- [HTTP API reference](/en/sdk/http-api/) — 요청/응답 구조
- [Quickstart](/en/quickstart/) — 5분 만에 첫 번째 타입 지정 질문
- [Playground](/en/playground/) — 실제 상태에 대해 질문 시도, 가입 불필요

## 관련

- [함수 호출](/en/cases/function-calling/) — 자연어를 타입 지정된 함수 호출로 변환
- [구조화된 데이터 추출 캐스케이드](/en/cases/sde-cascade/) — 검증이 포함된 두 단계 추출
- [신뢰도 기반 라우팅](/en/patterns/confidence-routing/) — 분포가 가능하게 하는 패턴
- [사용 사례 맵](/en/cases/use-case-map/) — 각 기본 구성 요소가 실제 서비스에서 나타나는 위치