---
title: System One
description: JevCode가 쓴 System One. clavue-jev는 noul, confidence, choice로 상태에 답합니다.
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## System One

이 페이지는 JevCode의 글입니다. 여기 적은 것은 **이 사이트가 실제로 받는 호출**입니다. 모델은 **clavue-jev**이며, 우리는 그것을 오늘 세계에서 가장 뛰어난 Jev로 내놓습니다.

프로그램에 필요한 것은 형을 아는 값입니다. 채팅 답변은 나중에 파싱할 문자열입니다. clavue-jev는 질문 쪽에 형을 두어, 답을 소수 또는 선택지 하나로 만듭니다. 하루에도 계속 도는 판정에 쓰십시오. 열린 글쓰기는 텍스트 모델에 맡기고, 그 글을 실행해도 되는지는 clavue-jev가 판정하게 하십시오.

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

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

`state`는 8자에서 4000자입니다. `questions`는 최대 여섯 개입니다. `options`는 모델에 가기 전에 `criteria`로 접힙니다. 응답의 `model`은 `clavue-jev`입니다. 성공한 호출만 입력 토큰으로 과금되고, 출력은 무료입니다. [가격](/ko/pricing/).

- [상태](/ko/concepts/state/)
- [확신](/ko/concepts/confidence/)
- [프리미티브](/ko/primitives/)
- [API](/ko/api/)
- [현장](/ko/scenes/)
