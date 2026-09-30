---
title: 확신
description: 이 API의 확신은 별도의 질문이며 0에서 1 사이의 소수를 돌려줍니다. 기준값은 틀렸을 때의 대가로 정합니다.
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## 확신

이 API는 모든 답 안에 확신을 숨겨 두지 않습니다. 원하는 수를 질문으로 묻습니다.

- `noul`은 `{ "noul": 0.92 }`를 돌려줍니다. 「예」의 정도이지, 별도의 확신 점수가 아닙니다.
- `confidence`는 `{ "noul": 0.78 }`를 돌려줍니다. 그 판정이 얼마나 단단한지입니다. 자동으로 실행하려면 본질문 옆에 물으십시오.
- `choice`는 `{ "choice": "billing" }`를 돌려줍니다. 보낸 선택지 중 하나입니다.

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

사이트 공통의 기준값은 없습니다. 자동 환불을 잘못하는 비용은 로그 한 줄의 태그 실수보다 큽니다. 수가 높으면 안전한 동작을 하고, 낮으면 사람에게 넘기거나 상태를 좁혀 다시 호출하십시오. 기준값을 고정하기 전에 [비교](/ko/compare/)나 [체험](/ko/try/)에서 자기 트래픽을 보십시오.

- [상태](/ko/concepts/state/)
- [System One](/ko/concepts/system-one/)
- [API](/ko/api/)
