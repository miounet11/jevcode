---
title: JevCode 알아보기
description: JevCode는 Jev의 본거지입니다. 모델은 clavue-jev이며, 오늘 세계에서 가장 뛰어난 Jev입니다. 호출은 상태와 타입이 있는 질문을 보내고, 프로그램이 분기할 수 있는 판정을 돌려줍니다.
section: start
order: 10
tags: ['overview', 'clavue-jev']
---

## Jev의 본거지

JevCode는 Jev가 사는 곳입니다. 이 사이트가 제공하는 모델은 **clavue-jev**입니다. 우리가 만들었고, 우리가 제공하며, 오늘 세계에서 가장 뛰어난 Jev 자리에 두고 있습니다.

jev-1.13.0은 비교 페이지에 나옵니다. 같은 문제에 답하는 대조이며, 나란히 보기 위한 것입니다. 이 사이트가 밖으로 제공하는 모델이 아닙니다.

## 한 번의 호출이란

clavue-jev는 채팅 모델이 아닙니다. **상태** 하나를 보내고, **타입이 있는 질문**을 최대 여섯 개 보냅니다. 돌아오는 것은 프로그램이 그대로 읽는 필드입니다:

| 질문 | 반환값 |
| :--- | :--- |
| `noul` | 0에서 1 사이의 소수. "예"의 강도로 읽습니다. |
| `confidence` | 0에서 1 사이의 소수. 이 판정이 얼마나 단단한지로 읽습니다. |
| `choice` | 당신이 든 선택지 중 하나. |

채팅 모델은 문장을 씁니다. clavue-jev는 값을 돌려줍니다. 그것이 System One의, 이 호출의 일입니다.

## 이어서 보기

- [System One](/ko/concepts/system-one/) — 한 번의 호출 모양
- [상태](/ko/concepts/state/) — 보내는 텍스트
- [신뢰도](/ko/concepts/confidence/) — 언제 자동으로 하고 언제 멈출지
- [한 번 시도](/ko/try/) — 익명이면 Key가 필요 없습니다
- [API](/ko/api/) — Key가 있는 `POST /v1/judge`
