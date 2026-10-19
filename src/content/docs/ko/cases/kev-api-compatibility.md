---
title: "Kev API 호환성: 서드파티 준수 보고서"
description: "Kev-0.8B(MLX, M1 Pro)는 제3자 Jev API 준수성 테스트 스위트의 32개 MUST 요구사항을 모두 통과했으며, 이는 255개의 옵션, 10개의 점수 수준, 혼합 질문 배터리, typesafe-sdk 파싱을 포함하며, 저자가 보고한 두 개의 SHOULD 레벨 메모가 제외된 상태입니다."
section: cases
order: 225
tags: ['compatibility', 'conformance', 'kev', 'api']
translatedFrom: en
---
## 검증 가능한 호환성, 주장하는 호환성이 아닌

“Jev API와 호환됨”은 말하기는 쉽지만 검증하기 어렵다. 그래서 한 커뮤니티 구성원이 이를 검증 가능한 명세로 정리했다: [jevcompat](https://github.com/mandu5/jevcompat)
— `POST /v1/systemone` 계약에 대한 48가지 요구사항으로, 각각 TypeSafe의 문서, OpenAPI 파일, 또는 SDK 소스를 인용하고 있다. 그런 다음 이 테스트 스위트는 해당 API를 구현한 가장 많은 스타를 받은 8개의 오픈 서버에 대해 실행되었다.

**Kev-0.8B (`2874258`, MLX, M1 Pro)는 모든 MUST 기준을 32/32로 통과하는 두 서버 중 하나입니다.** 다음을 포함합니다:

- 255개 옵션 제한까지 선택 옵션 허용
- 10단계 제한까지 점수 레벨 허용
- `model: "jev-latest"` 별칭 해결
- 혼합 배터리 — noul, choice, score 질문을 하나의 요청으로, 답변은
 당신의 id로 키 매핑
- 옵션 이름을 통한 비ASCII 텍스트 라운드 트립
- `typesafe-sdk` 모든 답변 유형을 수정 없이 구문 분석

모든 기록된 교환 내역을 포함한 전체 보고서:
[results/kev/report.md](https://github.com/mandu5/jevcompat/blob/main/results/kev/report.md)
— [RUN.md](https://github.com/mandu5/jevcompat/blob/main/results/kev/RUN.md)의 serve 명령어와 가중치 제공,
귀하의 머신에서 재현 가능.

## 적합성이 다루지 않는 사항

suite 또한 SHOULD 수준 요구사항을 추적합니다(Kev는 12개 중 10개를 통과; 누락된 두 가지는 auth 오류 응답이며, 보고된 실행에서 auth가 비활성화된 상태로 실행되었기 때문에 테스트되지 않았고, 한 가지 추가 검사는 서버가 해당 오류를 생성하지 않았기 때문에 수행되지 않았습니다). 저자가 백로그에 기록한 두 SHOULD 수준 메모는 더 흥미로운 부분입니다. 바이트 단위로 동일한 응답이 여전히 더 나쁜 답변이 될 수 있는 두 지점이기 때문입니다:

**점수 신뢰도 정규화.** Kev는 점수 신뢰도를 `1 − E|level − mode| / (L − 1)`로 계산합니다. TypeSafe의 문서화된 예시는 `1 − E|level − mode| / D`를 계산하며, 여기서 `D`는 분포의 퍼짐(spread)을 의미합니다. 동일한 증거임에도 다른 분모를 사용합니다. 3단계 질문에서 측정했을 때 Kev는 0.7535의 신뢰도를 반환한 반면, 참조 공식은 0.260을 제공합니다. 백엔드 간 신뢰도 수치를 비교하는 클라이언트는 동일한 판단 품질에 대해 서로 다른 분포를 보게 됩니다. 절대 임계값( [confidence-routing](/en/patterns/confidence-routing/) 패턴)으로 라우팅하는 경우, 백엔드별로 보정하거나 두 백엔드가 모두 제공하는 원시 분포를 기준으로 라우팅하십시오.

**긴 컨텍스트 성능 저하는 모델의 속성이지, 스펙 위반이 아니다.** 이 스위트는 통과하지만, Kev의 384-token 학습 컨텍스트를 넘어선 정확도는 스펙으로 유지되지 않는다. 스위트의 TypeSafe 선택 항목에서 Kev-9B는 학습 컨텍스트 내부에서 0.92점을 기록했지만, 더 긴 문서에서는 0.75–0.79점을 기록했다(Kev-4B: 0.88 / 0.88 / 0.81). 전체 분석과 저자가 제안한 수정안은 [긴 컨텍스트 레시피](https://github.com/jaredpalmer/kev/issues/48)를 참조하라. [상태 설계](/en/concepts/state/) 가이드라인은 모든 백엔드에 적용된다: 상태를 결정의 크기로 유지하고, 페이지의 크기로 유지하지 말라.

## 더 넓은 관점

48개 요구사항 명세는 백엔드 독립적입니다. Kev를 다른 자체 호스팅 Jev API 서버와 비교 평가할 때는 README가 아닌 동일한 테스트 스위트에서 동일한 수치를 비교하십시오. 두 가지 준수 구현체는 명세 밖에서도 측정 가능한 차이(신뢰도 분포 형태, 장문 컨텍스트 유지력 등)를 보이는데, 이는 컨포머스 보고서에서는 명확히 드러나지만 기능 비교표에서는 가려지는 부분입니다.

## 시작하기

- [GitHub의 Kev](https://github.com/jaredpalmer/kev) — 0.8B–9B 모델 패밀리
- [jevcompat 명세](https://github.com/mandu5/jevcompat/blob/main/SPEC.md) — 48개 요구사항
- [HTTP API 참조](/en/sdk/http-api/) — 테스트 중인 공식 계약
- [Confidence-gated routing](/en/patterns/confidence-routing/) — 분포에 따라 라우팅, 백엔드별로 보정
- [Self-consistency testing](/en/cases/consistency-choice-cookbook/) — 모든 백엔드를 동일한 방식으로 스트레스 테스트