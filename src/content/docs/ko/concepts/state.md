---
title: 상태
description: 상태는 clavue-jev가 판정하는 텍스트입니다. 이 API에서 상태는 8자에서 4000자의 문자열 하나이고, 같은 호출의 모든 질문이 그 문자열을 봅니다.
section: concepts
order: 20
tags: ['state', 'clavue-jev']
---

## 상태

**상태**는 clavue-jev가 판정하는 텍스트입니다. `POST /v1/judge`에서 8자에서 4000자의 문자열 하나입니다. 같은 요청의 질문은 모두 이 문자열을 보고, 서로의 답은 읽지 않습니다.

판정에 필요한 사실을 그 문자열에 넣으십시오. 적지 않은 사실은 모델에게 없습니다. 서로 독립인 질문은 한 요청에 최대 여섯 개입니다. 앞의 답이 필요한 질문은, 그 답을 새 상태에 적어 두 번째 호출을 하십시오.

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

- [System One](/ko/concepts/system-one/)
- [확신](/ko/concepts/confidence/)
- [API](/ko/api/)
