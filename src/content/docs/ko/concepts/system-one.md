---
title: System One
description: JevCode가 쓴 System One. clavue-jev는 noul, confidence, choice로 상태에 답합니다.
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## JevCode에 쓰여 있음

이 페이지는 우리 것입니다. **이 사이트**가 실제로 제공하는 호출을 설명합니다.

JevCode는 Jev의 본거지입니다. 모델은 **clavue-jev**이며, 우리는 그것을 오늘 세계에서 가장 뛰어난 Jev로 내세웁니다. 여기서 System One 호출이란 하나의 상태, 몇 개의 타입이 있는 질문, 그리고 `clavue-jev`라고 밝히는 응답을 뜻합니다.

## 무엇을 하는가

소프트웨어가 필요한 것은 타입이 알려진 값입니다. 채팅 답변은 나중에 파싱해야 하는 문자열입니다. clavue-jev는 질문 쪽에 타입을 두므로, 답이 이미 소수이거나 당신의 선택지 하나입니다.

하루 종일 돌리는 판정에 쓰세요. 어느 큐인지, 이 줄이 범위 안인지, 이 동작을 통과시킬지. 열린 글쓰기 작업이라면 텍스트 모델에 맡기고, 그 텍스트를 실행해도 되는지를 clavue-jev가 판정하게 하세요.

## 이 호출

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

`state`는 8자에서 4000자의 텍스트입니다. `questions`는 최대 여섯 개입니다. 키는 소문자로 시작합니다. choice는 `options`로도 `criteria`로도 보낼 수 있습니다. 이 서버는 모델에 보내기 전에 `options`를 criteria로 합칩니다.

응답에는 `"model": "clavue-jev"`가 들어 있습니다. 성공한 호출 뒤에 입력 토큰으로 과금됩니다. 출력은 무료입니다. 숫자는 [가격](/ko/pricing/) 페이지에 있습니다.

## 이어서 보기

- [상태](/ko/concepts/state/)
- [신뢰도](/ko/concepts/confidence/)
- [Choice, Noul 그리고 나머지](/ko/primitives/)
- [API](/ko/api/)
- [라이브](/ko/scenes/)
