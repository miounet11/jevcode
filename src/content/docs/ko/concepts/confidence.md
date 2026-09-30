---
title: 신뢰도
description: 이 API의 신뢰도는 별도의 질문 하나이며 0에서 1 사이의 소수를 돌려줍니다. 기준값은 틀렸을 때의 대가로 정합니다.
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## 두 개의 다른 수

이 API는 모든 답 안에 신뢰도를 숨겨 두지 않습니다. 원하는 수를 직접 물어봅니다.

- `noul` 질문은 `{ "noul": 0.92 }`를 돌려줍니다. "예"의 정도이고, 별도의 신뢰도 점수가 아닙니다.
- `confidence` 질문은 `{ "noul": 0.78 }`을 돌려줍니다. 이 판정이 얼마나 단단한지입니다. 자동 실행해도 되는 그 질문 옆에서 함께 물으세요.
- `choice` 질문은 `{ "choice": "billing" }`을 돌려줍니다. 보낸 선택지 중 하나입니다.

분기가 중요할 때는 둘을 함께 묻습니다:

```json
{
  "state": "The invoice was paid twice on Tuesday.",
  "questions": {
    "duplicate": {
      "type": "noul",
      "instructions": "Does this describe a duplicate charge?"
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that judgment?"
    },
    "lane": {
      "type": "choice",
      "instructions": "Which queue should take it?",
      "options": ["billing", "fraud", "ignore"]
    }
  }
}
```

## 언제 자동으로 움직이는가

이 사이트에 만능 기준값은 없습니다. 자동 환불을 잘못하는 쪽이 로그 한 줄의 태그를 잘못하는 쪽보다 비쌉니다. 그래서 환불 경로는 더 높은 수를 기다립니다.

실용적인 시작:

1. 수가 높을 때 할 안전한 동작을 고릅니다.
2. 수가 낮을 때 넘길 대상(사람, 또는 더 좁은 상태로 두 번째 호출)을 고릅니다.
3. 기준값을 고정하기 전에 [비교](/ko/compare/)나 [체험](/ko/try/)에서 자신의 트래픽을 한 배치 읽습니다.

모델이 "확신이 없다"고 말할 수 없다면, 돈을 움직이게 하거나 데이터를 지우게 하지 마세요. `confidence`를 한 번 묻고 분기합니다.

- [상태](/ko/concepts/state/)
- [System One](/ko/concepts/system-one/)
- [API](/ko/api/)
