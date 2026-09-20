---
title: "인용문 재확인"
description: "출처 문서와 대조하여 잘못된 또는 환각된 인용을 확인합니다. 하나의 TypeSafe Choice 질문은 인용의 맥락이 주장을 지지하는지 여부를 결정하며, 그 신뢰도는 인용을 인간 검토 대상으로 플래그 지정할 수 있습니다."
section: cases
order: 120
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/citation_check"
translatedFrom: en
---
LLM이 질문에 답변하고 출처를 인용합니다: 각 주장마다 소스 문서의 섹션과 그 근거가 되는 인용문이 포함됩니다. 이러한 인용 중 일부는 잘못되거나 환각된 것입니다: 인용문이 문서에 전혀 없거나, 문서에 그대로 있지만 맥락이 주장과 정반대를 의미할 수 있습니다.

한 번에 하나씩 수동으로 확인하는 것은 느립니다: 문서를 찾고, 그 안의 인용구를 찾아, 주장이 뒷받침되는지 판단할 만큼의 맥락을 충분히 읽어야 합니다.

그 검사를 자동화하려면, 먼저 일반적인 문자열 매칭으로 누락된 따옴표를 찾고,
그런 다음 `Choice` 질문을 사용하여 각 살아남은 따옴문의 문맥을 읽고
그 주장을 지지하는지 여부를 결정합니다.

<!-- mermaid flowchart converted to equivalent tables (this site loads no chart library) -->

*흐름 방향: LR*

| 노드 | 설명 | 그룹 |
| :--- | :--- | :--- |
| `cite` | 원본 문서 + 인용 | — |
| `match` | 인용문인가 / 원본에 있는가? | — |
| `fab` | 위조 표시 | — |
| `request` | 요청 | 요청 |
| `q` | Choice — / 섹션이 주장과 어떻게 관련되는가? / 지지 → 검증됨으로 표시 / 모순 → 모순됨으로 표시 / 관련 없음 → 근거 없음으로 표시 | 요청 |
| `gate` | 신뢰도 / ≥ 0.8인가? | — |
| `stand` | 판정 유지 | — |
| `review` | 사람이 확인함 | — |

| From | Condition | To |
| :--- | :--- | :--- |
| `cite` | — | `match` |
| `match` | 발견됨 | `request` |
| `match` | 인용문 없음 | `request` |
| `match` | 발견되지 않음 | `fab` |
| `request` | — | `gate` |
| `gate` | — | `stand` |
| `gate` | — | `review` |


아래는 RFC 7519(JSON Web Token)에 대한 LLM의 답변에서 발췌한 여덟 가지 인용문을 검토한 결과입니다. 정확도가 확인된 네 가지 인용문은 `verified`에서 신뢰도 0.93 이상으로 판정되었습니다. 심어 둔 네 가지 오류는 모두 적발되었습니다: 위조된 인용문, 모순된 주장, 그리고 인간에게 전달된 두 가지 근거 없는 인용문.

`check_citation()`에서, 여기서 구축하는 함수는 원본 문서와 하나의 인용을 받아 네 가지 판정 중 하나인 `verified`, `unsupported`, `contradicted`, 또는 `fabricated`을 반환합니다. 또한 사람이 검토해야 할 항목에 플래그를 지정하는 신뢰도도 반환합니다.

## 설정

```bash
pip install ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

그런 다음 `TYPESAFE_API_KEY`을 설정합니다. 모든 API 호출은 `json_cache.json`에 캐시되며, 이는 쿡북과 함께 제공되므로 다시 실행하면 API를 호출하는 대신 게시된 수치가 재생됩니다. 모든 작업을 실시간으로 실행하려면 해당 파일을 삭제하세요.

아래 숫자는 2026-08-16 기준 `jev-1.12`의 데이터입니다.

```python
import json
import os
import re
from pathlib import Path
from time import perf_counter

from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from typesafe_sdk import Choice, TypeSafeClient

TYPESAFE_MODEL = "jev-1.12"
AUTO_ACCEPT = 0.8  # start high for more human review as you build trust in the model

client = TypeSafeClient(
    api_key=os.environ.get("TYPESAFE_API_KEY", "cache-only"),
    base_url=os.environ.get("TYPESAFE_ENDPOINT"),
    timeout=120.0,
)
json_cache = JsonCache(Path("json_cache.json"))
```

## 소스와 인용문을 로드하세요

소스는 [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519.html)(JSON Web Token)이며,
rfc-editor.org에서 가져와 이 쿡북 옆에 `rfc7519.txt`로 커밋했습니다. 아래 코드는
페이지 헤더와 푸터를 제거한 후, 텍스트를 번호가 매겨진 섹션으로 나눕니다.

`citations.json`의 여덟 인용문은 LLM이 RFC를 대상으로 작성한 것이다. 네 개는 정확하며, 나머지 네 개는 검사를 통과하지 못하도록 수정했다.

```python
def load_source() -> str:
    """RFC 7519 verbatim, minus the page headers and footers that interrupt its paragraphs."""
    lines = []
    for line in Path("rfc7519.txt").read_text().splitlines():
        bare = line.lstrip("\f")
        if re.match(r"Jones, et al\.\s.*\[Page \d+\]$", bare):
            continue
        if re.match(r"RFC 7519\s+JSON Web Token \(JWT\)\s+May 2015$", bare):
            continue
        lines.append(bare)
    return re.sub(r"\n{3,}", "\n\n", "\n".join(lines))


def split_sections(source: str) -> dict[str, str]:
    """Map each numbered section ("4.1.3") to its text, split on the RFC's header lines."""
    boundary = re.compile(r"(?m)^(?:(\d+(?:\.\d+)*)\.  .+|Appendix [A-Z]\..*)$")
    marks = list(boundary.finditer(source))
    sections = {}
    for mark, nxt in zip(marks, marks[1:] + [None]):
        if mark.group(1) is None:  # an appendix header only terminates the section before it
            continue
        sections[mark.group(1)] = source[mark.start() : nxt.start() if nxt else len(source)].strip()
    return sections


SOURCE = load_source()
SECTIONS = split_sections(SOURCE)
CITATIONS = json.loads(Path("citations.json").read_text())

print(f"{len(SOURCE):,} characters, {len(SECTIONS)} numbered sections, {len(CITATIONS)} citations")
print("\nA citation with a quote:")
print(json.dumps(CITATIONS[1], indent=2))
print("\nA claim-only citation:")
print(json.dumps(next(c for c in CITATIONS if c["quote"] is None), indent=2))
```

```
58,365 characters, 45 numbered sections, 8 citations

A citation with a quote:
{
  "id": "aud_reject",
  "claim": "If a validator does not find itself in a token's audience list, it has to reject the token.",
  "quote": "If the principal processing the claim does not identify itself with a value in the \"aud\" claim when this claim is present, then the JWT MUST be rejected.",
  "section": "4.1.3"
}

A claim-only citation:
{
  "id": "iat_future",
  "claim": "The \"iat\" claim requires validators to reject tokens whose issue time is in the future.",
  "quote": null,
  "section": "4.1.6"
}
```

## 소스의 각 인용문을 찾기

소스에 없는 인용구는 위조된 것이며, 이를 알아차리기 위해 모델은 필요하지 않다.
RFC의 줄 바꿈을 넘어 인용구가 일치하도록 공백과 굽은 따옴표를 정규화한 후, 부분 문자열로서 그것을 검색한다. 일치하는 경우 인용구가 어느 섹션에서 왔는지, 그리고 그 섹션이 다음 단계에서 모델이 읽을 텍스트임을 알려준다.

인용은 섹션의 내용을 인용하지 않고도 해당 섹션을 지칭할 수 있습니다. 이 경우 일치시킬 내용이 없으므로, 인용이 지칭하는 섹션을 그대로 가져와 모델로 바로 이동합니다.

```python
def normalize(text: str) -> str:
    """Collapse whitespace and fold curly quotes, so a quote matches across line wraps."""
    table = str.maketrans({"“": '"', "”": '"', "‘": "'", "’": "'"})
    return re.sub(r"\s+", " ", text.translate(table)).strip()


def find_quote(sections: dict[str, str], quote: str) -> str | None:
    """The number of the section that contains the quote verbatim, or None."""
    needle = normalize(quote)
    for number in sorted(sections, key=lambda n: [int(p) for p in n.split(".")]):
        if needle in normalize(sections[number]):
            return number
    return None


def locate(sections: dict[str, str], citation: dict) -> tuple[str, str | None]:
    """Step 1 for one citation: a status, plus the section step 2 will read."""
    if citation["quote"] is None:
        return "section-only", sections[citation["section"]]
    number = find_quote(sections, citation["quote"])
    if number is None:
        return "missing", None
    return "found", sections[number]


for citation in CITATIONS:
    status, section = locate(SECTIONS, citation)
    where = f"section of {len(section):,} chars" if section else "not in the source"
    print(f"{citation['id']:<18}{status:<14}{where}")
```

```
epoch_seconds     found         section of 3,122 chars
aud_reject        found         section of 761 chars
sig_reporting     missing       not in the source
clock_skew        found         section of 529 chars
exp_required      found         section of 529 chars
pii_encryption    found         section of 1,653 chars
iat_future        section-only  section of 270 chars
duplicate_names   found         section of 918 chars
```

## 소스가 주장을 지원하는지 확인

이 시점에서도 인용구가 남아 있는 경우, 그 인용구는 출처와 단어로 정확히 일치합니다. 그러나 그것은 충분하지 않습니다. 인용구는 정확할 수 있지만, 그 위에 구축된 주장은 여전히 잘못될 수 있습니다. 이를 결정하려면 인용문의 문맥과 단계 1에서 찾은 섹션이 필요합니다.

생존하는 인용문마다 `Choice`개의 질문은 섹션이 주장을 어떻게 반영하는지에 대한 세 가지 방식을 다룹니다.
가장 높은 확률을 가진 옵션이 결론이며, `AUTO_ACCEPT`(위 코드에서 0.8)이 이에 대한 처리 방식을 결정합니다:

* 신뢰도가 0.8 이상일 경우: 판정이 자체적으로 유효함;
* 0.8 미만일 경우: Jev가 판정을 확인하기 전까지 아무 조치도 취하지 않음.

시작은 높게 설정하고, 모델이 당신의 문서에서 어떻게 작동하는지 확인하면서 점차 기준을 낮추세요.

```python
QUESTIONS = {
    "relation": Choice(
        instructions="How does the section relate to the claim?",
        criteria={
            "supports": "The section states the claim or directly implies that it is true",
            "contradicts": "The section states the opposite of the claim or implies it is false",
            "says_nothing": "The section does not address what the claim asserts, either way",
        },
    ),
}

RELATION_TO_VERDICT = {
    "supports": "verified",
    "contradicts": "contradicted",
    "says_nothing": "unsupported",
}


@json_cache
def ask(claim: str, section: str) -> dict:
    started = perf_counter()
    response = client.system_one(
        state={"claim": claim, "section": section},
        questions=QUESTIONS,
        model=TYPESAFE_MODEL,
    )
    answer = response.answers["relation"]
    return {
        "choice": answer.choice,
        "probabilities": answer.probabilities,
        "confidence": answer.confidence,
        "seconds": round(perf_counter() - started, 2),
        "input_tokens": response.usage.input_tokens or 0,
        "output_tokens": response.usage.output_tokens or 0,
    }


def verdict(status: str, answer: dict | None) -> dict:
    """Fold step 1 and step 2 into one of the four labels, plus an auto-or-review flag."""
    if status == "missing":
        # confidence None: no model was called, so there is no model confidence to report
        return {"verdict": "fabricated", "confidence": None, "auto": True}
    return {
        "verdict": RELATION_TO_VERDICT[answer["choice"]],
        "confidence": answer["confidence"],
        "auto": answer["confidence"] >= AUTO_ACCEPT,
    }


def check_citation(sections: dict[str, str], citation: dict) -> dict:
    status, section = locate(sections, citation)
    answer = ask(citation["claim"], section) if section is not None else None
    return {"id": citation["id"], "status": status, "answer": answer, **verdict(status, answer)}
```

## 모든 인용문 확인

모든 여덟 인용문은 동일한 검사를 통과했습니다:

```python
print(f"{'citation':<18}{'quote':<14}{'relation':<14}{'conf':>6}  {'verdict':<13}{'action':>7}")
for citation in CITATIONS:
    result = check_citation(SECTIONS, citation)
    answer = result["answer"]
    relation = answer["choice"] if answer else "-"
    conf = f"{answer['confidence']:.2f}" if answer else "-"
    action = "auto" if result["auto"] else "review"
    print(
        f"{result['id']:<18}{result['status']:<14}{relation:<14}{conf:>6}"
        f"  {result['verdict']:<13}{action:>7}"
    )
```

```
citation          quote         relation        conf  verdict       action
epoch_seconds     found         supports        0.93  verified        auto
aud_reject        found         supports        0.95  verified        auto
sig_reporting     missing       -                  -  fabricated      auto
clock_skew        found         supports        0.99  verified        auto
exp_required      found         contradicts     0.99  contradicted    auto
pii_encryption    found         says_nothing    0.27  unsupported   review
iat_future        section-only  says_nothing    0.56  unsupported   review
duplicate_names   found         supports        0.99  verified        auto
```

네 개의 인용이 `verified`로, 하나가 `fabricated`로, 하나가 `contradicted`로, 그리고 두 개가 `unsupported`로 돌아왔습니다.

* `epoch_seconds`, `aud_reject`, `clock_skew`, 그리고 `duplicate_names`가 정확한 네 가지입니다.
 이 모두는 `verified`로 0.93 이상의 신뢰도로 반환되었으며, 이는 `AUTO_ACCEPT`보다 훨씬 높은 수치입니다.
* `sig_reporting`는 모델에 도달하지 않았습니다. 해당 인용문이 RFC에 없으므로, 문자열 일치만으로는 이를 `fabricated`로 표시합니다.
* `exp_required`는 4.1.4 절을 단어 하나도 빠짐없이 인용하고 있으며, 같은 절에서는 "이 주장의 사용은 선택사항(OPTIONAL)입니다"라고 명시하고 있으므로, 이는 `contradicted`로 간주됩니다(신뢰도 0.99).
* `pii_encryption`과 `iat_future`은 각각 0.27과 0.56의 신뢰도로 `unsupported`로 반환되었으며, 둘 다 임계값 미만이었으므로 모두 인간 검토로 넘어갔습니다. `pii_encryption`은 문자열 일치만으로는 부족함을 보여주는 사례입니다: 해당 인용문은 소스에서 단어 하나도 빠짐없이 일치하지만, 해당 인용문이 나온 절에서는 해당 주장에 대해 아무런 언급이 없습니다.

자신의 데이터에 적용하려면 `rfc7519.txt`와 `citations.json`를 교체하세요.
`load_source()`와 `split_sections()`는 RFC 레이아웃을 기준으로 작성되었으므로,
다른 구조의 문서에는 자체 파싱이 필요합니다.

정규화 후 문자열 매칭이 정확함: 잘리거나 약간 재구성된 인용구는 `fabricated`로 반환됨. 부실한 인용을 허용하는 프로덕션 시스템이라면 퍼지 매칭이 필요할 것임.

## 플레이그라운드에서 열기

링크에는 한 가지 인용의 주장과 섹션, 그리고 질문이 담겨 있습니다. 브라우저에서 직접 동일한 호출을 실행하려면 링크를 여세요.

```python
example = next(c for c in CITATIONS if c["id"] == "exp_required")
_, example_section = locate(SECTIONS, example)
playground_link = make_playground_link(
    {"claim": example["claim"], "section": example_section}, QUESTIONS, models=[TYPESAFE_MODEL]
)
display(Markdown(f"🔗 [Open one citation's claim + section in the TypeSafe playground]({playground_link})"))
```

[TypeSafe 플레이그라운드에서 한 인용의 주장 + 섹션 열기 →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiFADYCGAlnKQaQKIBuCATgJ74BSA6mvjgwAzinzUkFGGAT5KSfFgAO1NpRTUICjYgDcc-CggBrZPgDu1FAAsIMMcUchlj0uOH4kEMc0rlqYAB0pAA0+KTCCFAaWvThIAAsgQCMgUn44U4uTvgAFIyYKmoxCmi0CACU+ADCVLSOSA0Z+GjWsq7OhR15yqrqmtrlVRQ0cOIyqNQAZtQIHjayvcUDhuX4scQKGRBsclMo7BbW1FDWhm08-PgAsgCqAMoCAHIA8gIARrKUUFAISgdgfBTHb4JRsaBzYQSADmgQyrQQTQyYIhwihSGh6ym53aWS6ORGtHwbAQAEcYKo5ud1Dj8LA2CTUPgwOoEAB6HSIzbNO6PfCffkIYEk2lLfpaZmsjlrfyiBCAiS0jrZNyEuDBTZI-AASTgSnICEQqHYHmuAEEAJqg8HMAKyYX4YQQRCOuB+cj4A0IcyUDhhEQwd1cLyCHayGzyLWUIHewQSexzMJGOQ-OxMh0UaDGR2mcxwnUoDy+cgwWS8j5fTzwT5sLVQLQoGhIGEGJ7wdgnAAirPwxdL+dukSx52oHjV7nwLwACmhtS8nmaADLBEAAXxAYRAKL1hYw2DwhBIIBJVBKcSPKA4SkRB9IpwgJxvYTvbCsHco54iMCUSh2hbipAIo6UQlI6jYHPMFzjiCYCUtE5BcLQ+qzJBNJWBOKBsKWoTxPWqBqLB0TCABIBAZE0QrKIrKQbIEA-hAUIHMOCx0nUYwgkh-hUuho5An4kQ4REvrCAA+l4NgwiRZEgSskBUuJchgGAJJokcNIseOlBouwhZhAgVhtLsPocKQq7PiAEiiFhFFaMRt4gAAEhA5jMhAVIseRoEnj2yYaWxAD8pnrpulAqAAaiaAwHiAzDJBuhCRAa0TytcEAyOQwgHgA2iAABWCDMAAtKkyQAEwgAAuquQA)