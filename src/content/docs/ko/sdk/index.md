---
title: "SDK 및 통합"
description: "공식 클라이언트 SDK, HTTP API 선택, 그리고 AI 코딩 에이전트를 위한 스킬."
section: sdk
order: 10
tags: ['sdk', 'api']
source: docs.typesafe.ai/sdk
translatedFrom: zh
---

## 세 가지 통합 방식

| 방식 | 적합 대상 | 특징 |
| :--- | :--- | :--- |
| [Python SDK](/ko/sdk/python/) | 백엔드 서비스, 데이터 파이프라인, 배치 처리 | 동기/비동기 클라이언트, 타입 입력, 자동 재시도 |
| [JavaScript SDK](/ko/sdk/javascript/) | Node.js 서비스, 풀스택 애플리케이션 | TypeScript 타입 추론, 답변 타입이 질문으로부터 자동 추론 |
| HTTP API | 기타 언어, 경량 통합 | 직접 POST, 재시도 및 속도 제한 처리를 직접 구현해야 함 |

팀에 AI 코딩 에이전트가 통합 코드를 작성한다면, 먼저 [TypeSafe agent skill](/ko/sdk/agent-skill/)을 설치하여 에이전트가 요청과 응답의 정확한 구조를 인식하도록 하세요. 이렇게 하면 에이전트가 추측에 의존하여 코드를 작성하는 것을 방지할 수 있습니다.

## 공통 규칙

모든 SDK는 동일한 규칙을 공유합니다:

- **엔드포인트**: `POST https://api.typesafe.ai/v1/systemone`
- **인증**: 환경 변수 `TYPESAFE_API_KEY`에서 읽으며, 코드에서 직접 전달할 필요가 없습니다.
- **기본 모델**: `jev-latest`(최신 안정 버전으로 해석됨)
- **재시도**: 기본적으로 지수 백오프 전략으로 재시도하며, 응답의 `retry-after` 헤더를 존중합니다.

## 버전 요구사항

- Python SDK: 패키지 이름 `typesafe-sdk`
- JS SDK: 패키지 이름 `@typesafe-ai/sdk`, Node.js 20 이상 필요

JS SDK는 ESM, CommonJS, TypeScript 선언 파일 세 가지 빌드 산출물을 제공합니다.

## HTTP API 직접 호출

SDK를 사용하지 않을 경우, SDK에 이미 내장되어 있는 다음 두 가지 사항을 직접 처리해야 합니다:

**속도 제한 재시도.** 초당 250,000 토큰 또는 분당 1,200 요청을 초과하면 `429 Too Many Requests`가 반환됩니다. 응답에는 `retry-after` 헤더가 포함될 수 있으므로, 해당 헤더를 기준으로 백오프해야 합니다.

**응답 파싱.** 반환값은 질문 이름으로 인덱싱된 답변 객체이며, 각 질문 유형마다 고유한 필드 구조를 가집니다. 자세한 내용은 [API 참조](https://docs.typesafe.ai/api)를 참조하세요.

## 관련 항목

- [Python SDK](/ko/sdk/python/)
- [JavaScript SDK](/ko/sdk/javascript/)
- [Agent skill](/ko/sdk/agent-skill/)
- [5분 시작하기](/ko/quickstart/) — 완전한 실행 가능 예제
