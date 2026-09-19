---
title: "역량 지도 및 생태계 사례"
description: "시나리오별로 구성된 Jev 기능 지도와 실제 프로덕션 프로젝트 사례를 제공합니다. 다른 사람들이 어떤 시나리오에서 어떤 원시 연산을 사용하는지 확인하세요."
section: cases
order: 10
tags: ['use-cases', 'ecosystem', 'production']
source: docs.typesafe.ai/concepts/use-case-map + awesome-jev
translatedFrom: zh
---

## 이 지도를 어떻게 사용하나요

자신의 비즈니스와 가장 가까운 시나리오를 먼저 찾아보세요. 해당 시나리오에서 다른 사람들이 어떤 원리(primitive)를 사용하고 어떤 문제를 해결하는지 확인한 후, 이를 자신의 문서와 액션에 적용해 보세요.

아래 각 시나리오에서는 다음 순서로 정보를 제공합니다: **어떤 문제를 해결하는가** → **어떤 원리를 사용하는가** → **실제 프로젝트**.

> **카테고리별 정리된 전체 프로젝트 인덱스**(별 수 및 언어 태그 포함)를 보려면 [커뮤니티 생태계 프로젝트](/ko/ecosystem/)를 참조하세요.

## 분류 및 라우팅

**문제**: 요청이 들어왔을 때 해당 요청이 어떤 카테고리에 속하는지 판단한 후, 서로 다른 처리 경로로 분배해야 합니다.

**원리**: Choice(분류), 신뢰도 점수를 게이트키(gating)로 사용.

**실제 프로젝트**:

- [Notra](https://github.com/usenotra/notra) — 마케팅 분석: 프로덕션 환경의 GEO 플랫폼으로, `NOTRA_JEV_CLASSIFIERS` 플래그를 사용하여 브랜드 가시성 분류기를 LLM에서 Jev의 부울(decision) 결정으로 마이그레이션했으며, 임계값은 0.5입니다.
- [jev-router](https://github.com/gargpratyush/jev-router) — 개발 도구: Jev가 후보 모델 중에서 선택하도록 하여 Claude Code의 작업을 가장 저렴하고 적합한 모델로 라우팅합니다.
- [jev-router (prismhq)](https://github.com/prismhq/jev-router) — LLM 인프라: LiteLLM 기반의 오픈소스 라우터로, Jev 결정을 사용하여 각 요청을 처리할 모델을 선택합니다.
- [pi-jev-router](https://github.com/mejiasd3v/pi-jev-router) — 코딩 에이전트: Pi 코딩 에이전트에 요청 기반 모델 자동 라우팅 기능을 추가하며, Vercel AI Gateway에서 Jev를 통해 결정을 내립니다.
- [jcm-router](https://github.com/adarshmishra07/jcm-router) — 코딩 에이전트: 로컬 에이전트로, Jev 결정을 사용하여 각 메시지에 대해 Claude 모델과 추론 강도를 선택하며, 메인 채팅 캐시가 오염되지 않도록 합니다.

> **관찰**: 모델 라우팅은 이 시나리오에서 가장 밀집된 적용 방향입니다. 공통된 패턴은 「비싼 모델 호출이나 인간의 판단을 한 번의 저렴한 Choice 결정으로 대체한다」는 것입니다.

## 점수 매기기 및 정렬

**문제**: 일련의 항목을 관련성, 품질 또는 다차원 기준에 따라 정렬해야 합니다.

**원리**: Score, [복합 점수 매기기](/ko/patterns/composite-scoring/)를 사용하여 다차원을 병합.

**실제 프로젝트**:

- [jev-bfs](https://github.com/komikat/jev-bfs) — 검색 도구: Jev가 위키백과 각 페이지의 아웃바운드 링크에 순위를 매기도록 하여 영어 위키의 두 항목 간 링크 경로를 찾으며, 검색 과정은 Python이 제어합니다.
- [Jev Search](https://github.com/superagents-lab/jev-search) — 웹 검색: Jev의 Noul을 사용하여 Search1API 결과의 제목과 요약에 관련성 점수를 매깁니다.

## 검증 및 가드레일

**문제**: AI 또는 에이전트가 생성한 작업, 도구 호출, 입력/출력은 진행되기 전에 검사를 받아야 합니다.

**원리**: Noul(예/아니오 판단), 임계값을 부울로 변환.

**실제 프로젝트**:

- [jev-review](https://github.com/devagrawal09/jev-review) — 소프트웨어 공학: 단계별 코드 리뷰 워크플로우 및 로컬 대시보드. Jev는 각 리뷰 단계에서 검증을 수행하며, 통과해야만 변경 사항이 진행됩니다.
- [pi-jev](https://github.com/y0usaf/pi-jev) — 에이전트 보안: Pi 코딩 에이전트에 측정 가능한 도구 호출 게이트를 추가하여, 위험한 호출은 실행 전에 Jev 검사를 거치도록 합니다.
- [OpenWork](https://github.com/different-ai/openwork) — 엔지니어링 워크플로우: Jev를 eval testkit에 검증 심판으로 연결하여, 에이전트가 생성한 작업이 텍스트 모델이 아닌 타입화된 판정에 의해 검증되도록 합니다.
- [jev-guard](https://github.com/leepokai/jev-guard) — 에이전트 보안: Claude Code, Codex, Pi 및 ACP 에이전트를 위한 프롬프트 인젝션 및 위험 액션 보호. Jev가 무엇을 차단할지 결정합니다.

## 에이전트 의사결정

**문제**: 에이전트가 각 단계에서 무엇을 해야 하는지에 대해 빠르고, 타입 안전하며, 해석 가능한 판단 레이어가 필요합니다.

**원리**: Choice(액션 선택), Score/Noul 보조.

**실제 프로젝트**:

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — 브라우저 자동화: browser-use의 초고속 에이전트로, Jev가 각 단계의 액션과 클릭할 요소를 결정하며, 텍스트 입력이 필요한 경우에만 언어 모델을 호출합니다.
- [pi-typesafe-jev](https://github.com/legacybridge-tech/pi-typesafe-jev) — 코딩 에이전트: System One 판단을 Pi의 5가지 도구로 노출하여, 모델이 좁은 범위의 의미론적 판단을 수행하도록 하고, 임계값, 가중치 및 액션에 대한 제어는 코드와 사용자가 유지합니다.
- [jev-judgment](https://github.com/HyunjunJeon/jev-judgment) — 코딩 에이전트: 폐쇄형 코딩 에이전트 판단을 Jev로 보내어, 판정이 타입 안전하고 저렴하며 런타임 간 비교 가능하도록 합니다.
- [limpet](https://github.com/noplan-inc/limpet) — 코딩 에이전트: Stop hook. Jev 판단을 사용하여 자연어로 된 완료 조건을 판단함으로써, 에이전트가 조기에 작업을 종료하는 것을 방지합니다.
- [robo-harness](https://github.com/grmkris/robo-harness) — 로봇: SO-101 로봇팔 워크벤치. Jev가 결정 런너가 타입화된 후보 액션 중에서 경계가 있는 관절 스텝을 선택하도록 하며, 예산 제약 하에 동작합니다.

## 콘텐츠 검토 및 규정 준수

**문제**: 콘텐츠가 규정을 위반했는지, 민감한 정보를 포함하고 있는지, 정책에 부합하는지 판단합니다.

**원리**: Noul.

실제 프로젝트收录가 적습니다(이 방향은 아직 초기 단계). 하지만 전형적인 형태는 가드레일 시나리오와 동일합니다: 「개인 식별 정보 포함 여부」, 「정책 위반 여부」와 같은 문제를 Noul로 작성하고, 임계값을 통해 부울로 변환한 후 결정론적 프로세스로 진입합니다.

## 데이터 주석 및 평가

**문제**: 데이터셋에 라벨을 붙이거나 모델 출력의 품질을 평가합니다.

**원리**: 세 가지 모두.

**실제 프로젝트**:

- 「점수 매기기 및 정렬」 및 「검증 및 가드레일」 섹션의 평가 관련 프로젝트(예: OpenWork의 eval testkit 사용법) 참조.

## 게임 및 시뮬레이션

**문제**: 실시간 환경에서 각 프레임 또는 각 의사결정 지점에서 빠른 판단이 필요합니다.

**원리**: Choice(액션 선택).

**실제 프로젝트**:

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — 위 참조.
- [jev-drone](https://github.com/RomanSlack/jev-drone) — 로봇 시뮬레이션: MuJoCo에서 카메라만 사용하는 자율 드론. Jev 판단 모델을 제어 루프에 배치하며, 주파수는 2.5 Hz입니다.
- [tsai-sc](https://github.com/phyous/tsai-sc) — 게임: 키보드와 마우스로 원본 스타크래프트 공유판을 구동하며, 각 결정 시 Jev의 액션 확률을 기록합니다.

> **관찰**: 이러한 시나리오는 지연(latency)에 가장 민감합니다. `jev-drone`의 2.5 Hz 제어 루프는 Jev의 지연이 실시간 제어 링크에 진입할 수 있음을 보여줍니다.

## 기초 모델 연구

**문제**: System One과 같은 「한 번의 순전파로 타입화된 결정을 출력하는」 모델 형태를 재현하거나 연구합니다.

**실제 프로젝트**:

- [decider](https://github.com/Mapika/decider) — 오픈 모델: Qwen3.5-2B를 파인튜닝하여 System One 형태를 재현하며, 한 번의 순전파로 보정된 확률을 가진 타입화된 결정을 출력합니다.
- [openjev](https://github.com/zhihz/openjev) — 오픈 연구: 독립적인 로컬 미리보기. 컨텍스트, 질문 및 후보 답변을 바탕으로 이국어 확률 문제를 해결하며, TypeSafe Jev에서 영감을 받았습니다.
- [Parallel Constrained Decoding (Qwen2.5-1B-RLCD)](https://huggingface.co/spaces/drinkmoonshine/parallel-constrained-decoding) — 오픈 연구: RLCD로 훈련된 Qwen2.5-1B 데모. 오픈소스 병렬 제약 디코딩을 Jev의 대안으로 사용하는 것을 탐구합니다.

## 인프라 및 SDK

**문제**: 기존 기술 스택에 Jev를 통합합니다.

**실제 프로젝트**:

- [awesome-jev의 Infra / SDKs / Integrations 카테고리](https://github.com/yibie/awesome-jev/blob/main/categories/infra-sdks-integrations.md) 참조. 다양한 언어 바인딩, 에이전트 통합 및 게이트어댑터가 수록되어 있습니다.

## 공식 능력 지도의 네 가지 방향

TypeSafe 공식에서는 사용 사례를 네 가지 큰 방향으로 요약하며, 시나리오를 구상할 때对照해 볼 가치가 있습니다:

**AI 자동화 소프트웨어** — AI와 신뢰할 수 있는 소프트웨어를 교차적으로 오케스트레이션하여, 백그라운드에서 수백만 번 실행하더라도 인간 조종사 없이도 작동하도록 합니다. **코드에서 제어 흐름을 장악하고, TypeSafe가 의미론적 결정과 언어 이해를 처리합니다.**

**실시간 애플리케이션** — 최전선의 지능이 실시간 속도(150ms)에 도달하면, AI의 결정이 인간의 지각보다 빠를 수 있어 게임에 프로그래밍하거나 UI에 임베드할 수 있습니다.

**대규모 데이터의 AI Map Reduce** — 비용이 100배 절감됨에 따라 거대한 데이터셋을 처리할 수 있습니다: 거대한 코퍼스에서 관련 정보 검색, 방대한 에이전트 궤적 분류, 예측을 위한 특징 추출.

**범용 AI 검증** — 다른 모든 AI의 입력 프롬프트, 추출 결과, 추론 궤적, 도구 호출을 검증합니다. 제이킹(jailbreaking), 인용 오류, 환각(hallucination) 등 오류 패턴을 감지하며, 비용은 실제 LLM 호출의 일부에 불과합니다.

## 관련

- [아키텍처 패턴](/ko/patterns/) — 이러한 사례 뒤에 있는 일반적인 패턴
- [문제 원리](/ko/primitives/) — 원리 선택 방법
- [awesome-jev 전체 목록](https://github.com/yibie/awesome-jev) — 지속적으로 업데이트되는 커뮤니티 프로젝트 목록
