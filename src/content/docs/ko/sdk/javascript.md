---
title: "JavaScript / TypeScript SDK"
description: "@typesafe-ai/sdk를 설치하고, 자동 타입 추론이 적용된 클라이언트를 사용하여 System One API를 호출하세요."
section: sdk
order: 30
tags: ['javascript', 'typescript', 'sdk']
source: docs.typesafe.ai/sdk/javascript
translatedFrom: zh
---

## 설치

Node.js 20 이상 버전이 필요합니다:

```bash
npm install @typesafe-ai/sdk
```

환경 변수를 설정한 후 클라이언트를 생성합니다:

```bash
export TYPESAFE_API_KEY="sk-..."
```

## 기본 사용법

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "두 번 청구되었습니다. ASAP에 수정해 주세요." },
  questions: {
    category: choice("이 티켓의 주제는 무엇입니까?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

## 타입 추론

이것이 TS SDK의 가장 큰 가치입니다: **답변의 타입은 전달한 질문으로부터 자동으로 추론됩니다**.

```ts
questions: {
  category: choice("이 티켓의 주제는 무엇입니까?", {
    billing: null,
    technical: null,
    other: null,
  }),
}
```

`criteria`의 키가 `billing` / `technical` / `other`이므로, `response.answers.category.choice`의 타입은 이 세 가지 리터럴의 유니온 타입입니다. `"bililng"`을 작성하면 런타임에 `undefined`가 반환되는 대신 컴파일 시점에 오류가 발생합니다.

마찬가지로 `score(...)`로 생성된 질문의 답변에는 `score`, `legend`, `probabilities`, `confidence`가 포함되며, `noul(...)`로 생성된 질문에는 `noul`만 포함됩니다.

이는 **답변에 대한 타입 정의를 직접 작성할 필요가 없으며**, API 응답을 `any`로 처리할 필요가 없음을 의미합니다.

## 응답 구조

```ts
response.answers.category.choice;        // 선택된 옵션
response.answers.category.probabilities; // 각 옵션의 확률
response.answers.category.confidence;    // 신뢰도
```

모든 질문 타입은 `response.answers` 아래에서 질문 이름으로 인덱싱되며, 구체적인 필드는 질문의 타입에 따라 다릅니다.

## 패키지 구조

SDK는 ESM, CommonJS, TypeScript 선언 파일 세 가지 빌드 산출물을 모두 제공하므로 다양한 빌드 환경에서 바로 사용할 수 있습니다.

모든 옵션과 기본값에 대해 자세히 알아보려면 SDK의 [client](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/client.ts) 및 [types](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/types.ts)를 참조하세요.

## 관련 문서

- [5분 퀵스타트](/zh/quickstart/)
- [질문 원시 타입](/zh/primitives/) — 세 가지 질문 생성 방식
- [Fan-out 병렬 처리](/zh/patterns/fan-out/) — 한 번에 여러 질문하기
