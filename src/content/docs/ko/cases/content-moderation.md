---
title: "Content moderation API: build one from typed questions"
description: "TypeSafe 형식화된 질문을 활용한 콘텐츠 검열 API 구축 방법 — 정책별 Noul 검사, 심각도 점수 매기기, 카테고리 라우팅, 사용자가 통제하는 임계값 거버넌스 — 일괄형 검열 엔드포인트와 비교"
section: cases
order: 215
tags: ['moderation', 'content-moderation', 'guardrails', 'cookbook']
translatedFrom: en
---
## "모deration 엔드포인트"라는 구매 단위가 잘못된 이유

대부분의 플랫폼은 중재(moderation)를 독점 엔드포인트로 판매하며, 고정된 라벨(독성, 혐오, 폭력, 성적, 자해)을 사용합니다. 이는 처음부터 귀하의 제품이 위반에 대한 정의를 벤더의 정의와 다르게 설정할 때 편리함이 사라집니다. — 예를 들어 오프라인 결제 시도를 플래그해야 하는 마켓플레이스, '비난적인 말장난'은 허용되지만 실명 공개(doxxing)는 허용되지 않는 게임 채팅, 복용량 질문이 핵심인 건강 포럼 등.

당신의 검열 정책은 **제품 결정**입니다. 당신이 구매하는 API는 이를 하드코딩해서는 안 됩니다. 당신이 실제로 필요한 것은 정책을 *표현*하는 방법이며, 아무것도 재학습하지 않고 벤더를 기다리지 않고도 정책이 변경될 때 이를 변경할 수 있는 방법입니다.

이 페이지는 타입 기반 질문으로 모더레이션을 구축하는 방법을 보여줍니다. 각 정책 규칙은 질문이며, 각 답변은 확률을 포함하고, 임계값 — 실제 정책 — 은 코드처럼 버전 관리되는 코드에 위치합니다.

## 형태: 메시지당 하나의 요청, 규칙당 질문

메시지가 입력되면, 각 정책 규칙당 하나의 Noul 질문과 심각도 점수를 담은 요청이 처리됩니다. 결정이 출력됩니다. 두 번째 호출은 없으며, 각 규칙별로 분기할 엔드포인트도 없습니다.

```python
from typesafe_sdk import AsyncTypeSafeClient, Noul, Score

MODERATION_RULES = {
    "spam": Noul(instructions="Is this message spam or bulk advertising?"),
    "scam": Noul(instructions="Does this message try to defraud or phish the reader?"),
    "pii": Noul(instructions="Does this message contain personal data such as addresses, phone numbers, or IDs?"),
    "offsite_payment": Noul(instructions="Does this message try to move the transaction off the platform (external payment, direct email)?"),
    "severity": Score(
        instructions="If a policy is violated, how much harm would acting on it do?",
        criteria=["none", "minor", "moderate", "severe"],
    ),
}

async def moderate(client: AsyncTypeSafeClient, message: str) -> dict:
    async with client:
        response = await client.system_one(state=message, questions=MODERATION_RULES)
    return {rule: response.answers[rule] for rule in MODERATION_RULES}
```

정책은 절대적이다. 건강 포럼에 "의료 조언 아님" 고지를 추가하는 것은 한 줄에 불과하며, 이는 벤더의 다음 모델 카드가 아니라 당신의 다음 배포와 함께 출시된다.

## 임계값은 정책이다 — 코드에서 유지하라

Noul의 모든 답변은 확률입니다. 위반으로 간주되는 것은 그 확률에 적용하는 임계값이며, 서로 다른 규칙은 서로 다른 임계값을 가질 수 있습니다:

```python
THRESHOLDS = {"spam": 0.90, "scam": 0.85, "pii": 0.70, "offsite_payment": 0.95}
SEVERITY_ESCALATE = 2.5  # between "moderate" and "severe" on the 4-point scale

def decide(answers: dict) -> str:
    if answers["severity"].score >= SEVERITY_ESCALATE:
        return "escalate"    # legal / trust-and-safety queue
    for rule, threshold in THRESHOLDS.items():
        if answers[rule].noul >= threshold:
            return "block"
    if any(answers[rule].noul >= 0.60 for rule in THRESHOLDS):
        return "review"      # send to the human queue
    return "pass"
```

네 가지 결과, 각각이 당신의 것:

- **pass** — 메시지를 전달하다
- **review** — 인간 대기열, 위양성을 줄이는 가장 저렴한 방법
- **block** — 시행하다
- **escalate** — 심각도 Score가 기준선을 넘었을 때, 예를 들어 법적 문제나 신뢰 및 안전

모든 카테고리 레이블과 플래그를 반환하는 모더레이션 엔드포인트와 비교해 보세요. 조정할 수 있는 것은 오직 하나입니다: 플래그 컷오프. 레이블, 정의, 그리고 교정(calibration)은 다른 쪽의 배포 사항입니다.

## 확률이 레이블보다 더 중요한 이유

Boolean 플래그는 모더레이션 시스템을 운영하기 위해 필요한 정보를 무시합니다:

**경계를 측정할 수 있습니다.** 0.6과 0.9 사이에 속하는 결정의 비율이 바로 당신의 수동 검토 업무량입니다. 이 수치는 대규모 에스컬레이션이 쌓인 후가 아니라, 런칭 전에 명확하게 파악할 수 있습니다. [자기 일관성 테스트](/en/cases/consistency-choice-cookbook/)는 이를 확장합니다: 경계에 있는 게시물을 규칙에 따라 반복 실행하고 라벨이 고정되어 있는지 확인하십시오 — 라벨의 흔들림은 자동화된 모더레이션의 침묵의 살인자입니다.

**파이프라인의 다른 모든 결정처럼 신뢰도를 기준으로 게이트할 수 있습니다.** 분류에 사용되는 동일한
[confidence-routing](/en/patterns/confidence-routing/) 패턴이 변경 없이 적용됩니다: 높은 확률은 실행, 낮은 확률은 검토하며, 분할 기준은 당신이 선택한 숫자입니다.

**검증기를 검증할 수 있습니다.** 각 규칙이 분포를 가진 별도의 질문이기 때문에, 규칙별로 라벨링된 예시를 분리하여 각 규칙에 대한 정밀도를 측정할 수 있습니다. 이는 뉴스 주기를 통해 숨겨진 한 카테고리가 오작동하고 있음을 발견하는 대신, 더 정확한 평가가 가능합니다.

## 입력 가드레일과의 관계

[LLM을 위한 가드레일](/en/cases/llm-guardrails/)은 LLM 관련 사례를 다룹니다: 모델 호출 전후의 프롬프트와 응답에서 탈옥 시도와 유해한 출력을 선별합니다. 여기서 설명하는 모더레이션 시스템은 더 넓은 제품 표면입니다 — 사용자 메시지, 프로필, 게시글, 리뷰 — 여기서 규칙은 모델 안전성이 아닌 서비스 약관에서 비롯됩니다. 동일한 기본 원리, 다른 규칙 작성자. 많은 제품이 둘 다 실행합니다: 사용자 콘텐츠에 대한 제품 모더레이션, 모델 주변의 가드레일.

## 이 방식으로 구축된 실제 모더레이션 시스템

- [Jev-Moderation-Bot](https://github.com/brainstormity/Jev-Moderation-Bot) — 스팸 및 사기 링크를 확인하고, 경고 및 타임아웃 강화 규칙을 로컬에 유지하는 Jev의 디스코드 봇
- [mastra-jev-moderation](https://github.com/CodeAlive-AI/mastra-jev-moderation) — TypeSafe Jev에서 Mastra 에이전트를 위한 입력 모더레이션, 단일 파일로

## Build it

- [Primitives overview](/en/primitives/) — Noul과 Score 상세 설명
- [HTTP API reference](/en/sdk/http-api/) — 요청/응답 구조
- [Guardrails for LLMs](/en/cases/llm-guardrails/) — 모델 대상 변형
- [Self-consistency: choices](/en/cases/consistency-choice-cookbook/) — 레이블 안정성 스트레스 테스트
- [Use-case map](/en/cases/use-case-map/) — 기타 시나리오 중 모더레이션 및 규정 준수