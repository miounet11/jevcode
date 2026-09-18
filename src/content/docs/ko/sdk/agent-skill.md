---
title: "에이전트 스킬"
description: "TypeSafe 스킬을 Claude Code, Codex 등 코딩 에이전트에 통합하여, 추측이 아닌 API의 전체 컨텍스트를 확보하도록 합니다."
section: sdk
order: 40
tags: ['agent', 'claude-code', 'codex']
source: docs.typesafe.ai/agent-skill
translatedFrom: zh
---

## 이 스킬이 해결하는 문제

TypeSafe 에이전트 스킬은 AI 코딩 에이전트에게 TypeSafe API의 전체 컨텍스트를 제공합니다: 세 가지 [문제 유형](/zh/primitives/), 아키텍처 [패턴](/zh/patterns/), 그리고 조직 평가의 모범 사례.

**필요한 이유**: 스킬이 없는 에이전트는 추측에 기반하여 요청 및 응답 필드를 작성하므로, 합리적으로 보이지만 실제로 존재하지 않는 API 호출을 생성합니다. 이는 코딩 에이전트가 새로운 API를 통합할 때 가장 흔히 발생하는 실패 패턴입니다.

## 설치

### Claude Code

```bash
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai
```

### 기타 에이전트

```bash
npx skills add typesafe-ai/skills --skill typesafe-ai
```

설치 시 프롬프트에 따라 에이전트를 선택하세요. **기본값은 프로젝트 로컬 설치**이며, `-g` 옵션을 추가하면 전역 설치할 수 있습니다.

### 에이전트에게 직접 설치하게 하기

아래 프롬프트를 코딩 에이전트에 그대로 붙여넣으세요:

```text
Install the TypeSafe skill. If you're in Claude Code, run `claude plugin marketplace add typesafe-ai/skills`,
then `claude plugin install typesafe@typesafe-ai`. If you're in another agent, run
`npx skills add typesafe-ai/skills --skill typesafe-ai` and select your agent.
Use one installation method. You can read the skill directly at
https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
(raw: https://raw.githubusercontent.com/typesafe-ai/skills/main/skills/typesafe-ai/SKILL.md).
Then use the TypeSafe skill when working on this project.
```

수동으로 설치하려면 GitHub의 `skills/typesafe-ai` 전체 디렉토리(**참고 파일 포함**)를 에이전트의 스킬 디렉토리에 복사하세요.

> **설치 방법 중 하나만 선택**하여 중복 복사본이 생성되지 않도록 하세요.

## 업데이트

Claude Code 플러그인:

```bash
claude plugin marketplace update typesafe-ai
claude plugin update typesafe@typesafe-ai
```

그 후 Claude Code를 재시작하거나 `/reload-plugins`를 실행하세요. 자동 업데이트를 활성화하려면: `/plugin`을 열고 **Marketplaces → typesafe-ai → Enable auto-update**를 선택하세요.

skills.sh로 설치한 경우 `npx skills update`를 사용하세요. 수동으로 복사한 경우 GitHub의 최신 버전으로 스킬 디렉토리 전체를 교체하세요.

## 유용한 프롬프트

프롬프트에서 스킬을 명시적으로 지칭하는 것(「use the TypeSafe skill」)은 모든 에이전트에서 효과적입니다. Claude Code 플러그인을 사용할 때는 `/typesafe:typesafe-ai`를 직접 호출할 수도 있습니다.

**리팩토링 기회를 찾기**:

```text
Using the TypeSafe skill, explore the project and find opportunities for using
intelligent judgement to stand in for complex parsing or other fragile code.
```

**실제 API 키로 실험하기**:

```text
Using the TypeSafe skill, run some experiments using the TypeSafe API key that I've
exported to `TYPESAFE_API_KEY`. Propose changes based on the most promising results.
```

**비슷한 Cookbook 찾기**:

```text
Using the TypeSafe skill, analyze my code and see if there are any applicable cookbooks
that show how I could refactor my code to be less fragile or complex.
```

## 에이전트와의 협업 원칙

공식적으로 제시된 네 가지 원칙을 따르는 것이 좋습니다:

1. **먼저 논의하고, 그 다음에 실행하세요.** 위의 프롬프트를 사용하여 에이전트와 대화하며 방향을 명확히 하세요.
2. **구현 전에 계획을 검토하세요.** 계획이 타당함을 확인한 후에 코드를 작성하게 하세요.
3. **상수를 한 곳에 집중하세요.** 문제와 임계값은 단일 파일에 정의해야 검토가 용이합니다. **에이전트의 코딩 능력은 제한적**이므로, 한 번에 완벽하게 끝내려 하기보다 에이전트와 협력하여 수정해 나가는 것을 예상하세요.
4. **검증되지 않은 주장을 수용하지 마세요.** 에이전트가 자신의 가정을 검증하도록 권장하세요.

## 자주 묻는 질문

### 에이전트가 스킬을 사용하지 않음

Claude Code 플러그인에서는 `/typesafe:typesafe-ai`를 직접 호출하고, 다른 에이전트에서는 「use the TypeSafe skill」을 명시적으로 사용하세요. 여전히 로드되지 않는다면, 설치기가 올바른 에이전트를 선택했는지 확인한 후 재시작하세요.

### 라우팅 동작이 예상과 다름

문제와 임계값을 확인하세요. 임계값이 너무 높으면(누락) 또는 너무 낮으면(오경보) 발생할 수 있습니다. 문제를 더 구체적으로 작성해야 할 수도 있습니다.

### 여기저기서 신뢰도 임계값을 사용 중임

단순히 **최상의 옵션을 선택**하려는 것이라면, 신뢰도가 가장 높은 옵션을 직접 선택하면 되며 임계값을 설정할 필요가 없습니다. 구체적인 통계 알고리즘이 필요한 경우, `confidence`가 아닌 `probabilities`가 필요합니다.

### TypeSafe 코드가 검토하기 어려움

인간이 검토해야 하는 핵심은 **문제 정의**와 **임계값 상수**입니다. 이를 단일 코드 파일에 집중적으로 정의하여 검토 시 여기저기 찾아다니지 않도록 하세요.

### 에이전트가 요청 또는 응답 필드를 날조함

보통 스킬이 오래되어서 발생하는 문제입니다. 위의 방법으로 업데이트한 후 다시 시도하세요.

## 관련

- [SDK 개요](/zh/sdk/) — Python 및 JS SDK
- [문제 원시 데이터](/zh/primitives/) — 에이전트가 이해해야 할 세 가지 문제
- [신뢰도](/zh/concepts/confidence/) — 임계값 설정 방법
