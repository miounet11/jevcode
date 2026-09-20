---
title: "SDE 캐스케이드"
description: "2단계 구조화된 데이터 추출 캐스케이드(미니 → 검증 → 추론)를 활용하여, 대형 추론 모델의 높은 품질을 훨씬 낮은 비용으로 실현합니다."
section: cases
order: 250
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/sde_cascade"
translatedFrom: en
---
* 개요
 * 대형 추론 모델은 구조화된 데이터를 잘 추출하지만, 속도가 느리고 비용이 비쌉니다.
 * 소형 모델은 저렴하지만, 실수를 범합니다.
 * *캐스케이드(cascade)* 방식은 비용의 일부분으로 대부분의 품질을 확보합니다.
 * 우리가 사용하는 모델과 그 가격 (\$1M 토큰당, 입력 / 출력; 표준 요금,
 2026년 9월 15일 기준 확인):
 * 0단 (mini): [`gpt-5.4-mini`](https://developers.openai.com/api/docs/models/gpt-5.4-mini)
 \$0.75 / \$4.50
 * 1단 (reasoning): [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5)
 \$5.00 / \$30.00 (mini의 약 7배)
 * 검증기: TypeSafe `jev-1.12` \$0.042 / \$0.00 (출력 토큰은 무료;
 [공개된 Jev 가격표](https://typesafe.ai/blog/introducing-system-one-models-and-jev))
* 알고리즘
 1. 저렴하거나/small한 모델로 **추출(Extract)**합니다.
 2. **TypeSafe** 프리미티브로 **검증(Verify)**합니다: 필드별 예/아니오 ("Noul 질문")
 질문
 * (예: "이 값이 소스에 없습니까?", "관련 없는 텍스트에서 가져왔습니까?"), 각각
 P(무언가 잘못됨)를 반환합니다.
 3. 검증기 신호가 발생하면 비싼 추론 모델로 **에스컬레이션(Escalate)**합니다; 그렇지 않다면
 저렴한 답변을 유지합니다.
* 이 쿡북
 * 하나의 실제 예제를 끝까지 따라간 후, 100개 프롬프트에 걸친 트레이드오프를 보여줍니다.
 * 참고: 두 추출 단계는 텍스트 모드 OpenAI를 사용합니다.
 * 우리는 *구조화된 출력, 도구 호출, JSON 모드*를 사용하지 않습니다. 그 이유는:
 * *스키마 따르기(schema following)* 실수는 우리가 LLM이 범길 실수가 아닙니다 (이것을
 위해 합성 데이터를 만드는 것은
 쉽습니다)
 * LLM이 스키마를 따르는 데 실패한다면, 그것은 거의 항상 매우 혼란스러운 상태이므로,
 제약 있는 디코딩(constrained decoding)은 근본적인 문제를 해결하지 못합니다
 * 하지만 시도해 보시기를 권장합니다!

## 설정

* 의존성을 설치합니다(TypeSafe 검증자 클라이언트는 TypeSafe의 패키지 인덱스에서 제공됩니다):

```bash
pip install openai datasets jsonschema ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

* 그런 다음 환경에서 `OPENAI_API_KEY`와 `TYPESAFE_API_KEY`를 설정하세요

```python
import json
import os
from pathlib import Path

import jsonschema
from cooksafe import JsonCache, make_playground_link
from datasets import load_dataset
from IPython.display import Markdown, display
from openai import OpenAI
from typesafe_sdk import Noul, NoulCriteria, TypeSafeClient

MINI = "gpt-5.4-mini"  # rung 0: cheap + fast
REASONING = "gpt-5.5"  # rung 1: strong, run with reasoning_effort="high"
TS_MODEL = "jev-1.12"  # the TypeSafe verifier model
FIRE_T = 0.7  # escalate if any per-field P(wrong) exceeds this; also the "<== FIRES" display marker

oai = OpenAI()

ts = TypeSafeClient(api_key=os.environ["TYPESAFE_API_KEY"], timeout=30.0)
```

## 1단계: 데이터

우리는 scrapegraphai라는 huggingface 데이터를 선택합니다

```python
SCRAPEGRAPHAI_REVISION = "4bb9fba1dff9181c5acdb60a5a26fea62fa54fe9"
row = load_dataset(
    "scrapegraphai/scrapegraphai-100k",
    revision=SCRAPEGRAPHAI_REVISION,
    split="train",
)[516]
schema = json.loads(row["schema"])
prompt = row["prompt"]
content = row["content"]

print(
    f"""
PROMPT
===========
{prompt}

SCHEMA
===========
{json.dumps(schema, indent=2)}

CONTENT
===========
{content}
""".strip()
)
```

```text
PROMPT
===========
Find registration open date fall semester for New York University in New York, NY for the 2024-2025 school year.

SCHEMA
===========
{
  "properties": {
    "registration_open_date": {
      "description": "The date that registration opens for the fall semester. MUST be in the format mm/dd/yyyy. For example, for a college in the 2024-2025 school year, it might be something like 09/05/2024. Return a blank string if you are unsure.",
      "title": "Registration Open Date",
      "type": "string"
    },
    "description": {
      "description": "A brief description of the registration open date. For example, 'Registration opens for the fall semester'.",
      "title": "Description",
      "type": "string"
    }
  },
  "required": [
    "registration_open_date",
    "description"
  ],
  "title": "RegistrationOpen",
  "type": "object"
}

CONTENT
===========
Skip to content Skip to current page navigation

[ ](https://www.nyu.edu/)

Search Site

[ ](https://www.nyu.edu/)

  * [ Academics](https://www.nyu.edu/academics.html)
  * [ Admissions](https://www.nyu.edu/admissions.html)
  * [ Research](https://www.nyu.edu/research.html)
  * [ University Life](https://www.nyu.edu/life.html)
  * [ About](https://www.nyu.edu/about.html)


All NYU

#  Mobile Navigation 

[ ](https://www.nyu.edu/)

Search Site

  * [Academics](https://www.nyu.edu/academics.html)
  * [Admissions](https://www.nyu.edu/admissions.html)
  * [Research](https://www.nyu.edu/research.html)
  * [University Life](https://www.nyu.edu/life.html)
  * [About](https://www.nyu.edu/about.html)


All NYU

Info for

  * Back to main menu
  * Info for 

    * [Students](https://www.nyu.edu/students.html)
    * [Faculty](https://www.nyu.edu/faculty.html)
    * [Alumni](https://www.nyu.edu/alumni.html)
    * [Employees](https://www.nyu.edu/employees.html)
    * [Community](https://www.nyu.edu/community.html)


[Log In](http://home.nyu.edu/)

Info for

  * [Students](https://www.nyu.edu/students.html)
  * [Faculty](https://www.nyu.edu/faculty.html)
  * [Alumni](https://www.nyu.edu/alumni.html)
  * [Employees](https://www.nyu.edu/employees.html)
  * [Community](https://www.nyu.edu/community.html)


[Log In](https://home.nyu.edu/)

Search Site Search

#  Events Calendar 

Search Events 

Apply Reset

  * [About the Events Calendar ](https://www.nyu.edu/employees/resources-and-services/media-and-communications/digital-communications/university-events-calendar.html)
  * [Events Calendar Tutorial ](https://www.nyu.edu/employees/resources-and-services/media-and-communications/digital-communications/university-events-calendar/tutorials.html)
  * [Report issue or provide feedback ](https://nyu.service-now.com/sp?id=sc_cat_item&sys_id=7698dd2a98bcf4004c8c03063d84e274)


Search Filters Calendar

New York University 

Equal Opportunity and Non-Discrimination at NYU - New York University is committed to maintaining an environment that encourages and fosters respect for individual values and appropriate conduct among all persons. In all University spaces--physical and digital--programming, activities, and events are carried out in accordance with applicable law as well as University policy, which includes but is not limited to its Non-Discrimination and Anti-Harassment Policy. 

Unless otherwise noted, all content copyright New York University. All rights reserved. 

  * [Search](https://search.nyu.edu/)
  * [Campus Map](https://www.nyu.edu/map.html)
  * [Events](https://events.nyu.edu/)
  * [Contact Us](https://www.nyu.edu/contact-us.html)
  * [Give](https://www.nyu.edu/about/giving.html)
  * [Copyright & Fair Use](https://www.nyu.edu/copyright-and-fair-use.html)
  * [Privacy](https://www.nyu.edu/privacy.html)
  * [Accessibility](https://www.nyu.edu/accessibility.html)
  * [Feedback](https://www.nyu.edu/#feedback.html)


  * [New York Campus](https://www.nyu.edu/)
  * [Abu Dhabi Campus](https://nyuad.nyu.edu/)
  * [Shanghai Campus](https://shanghai.nyu.edu/)


  * [![](https://events.nyu.edu/live/resource/image/_i/themes/global/images/icons/facebook.rev.1773448757.svg)](https://facebook.com/)
  * [![](https://events.nyu.edu/live/resource/image/_i/themes/global/images/icons/linkedin.rev.1773448758.svg)](https://linkedin.com/)
  * [![](https://events.nyu.edu/live/resource/image/_i/themes/global/images/icons/x.rev.1773448757.svg)](https://x.com/)
  * [![](https://events.nyu.edu/live/resource/image/_i/themes/global/images/icons/instagram.rev.1773448757.svg)](https://instagram.com/)
  * [![](https://events.nyu.edu/live/resource/image/_i/themes/global/images/icons/youtube.rev.1773448758.svg)](https://youtube.com/)
```

* 이 행은 **NYU 이벤트 캘린더 페이지**(“2024년 가을 학기 등록 마감일”)입니다:
 * 스키마는 `registration_open_date`와 `description` 두 가지 필드만 요구합니다
 * 프롬프트 스크랩은 캘린더 내비게이션과 표준 텍스트만 캡처했습니다: **등록 날짜나 설명이 없습니다**
 * 스키마의 `description` 필드는 자체 필드 설명에 *예시* 값(“가을 학기 등록 시작”)을 포함합니다
* 그러므로 잘 작동하는 추출기는 페이지에 없는 필드를 *발명하지 말아야* 합니다
* 작은 모델이 올바른 행동을 하는지 확인해 봅시다!

## 2단계: 미니 모델로 추출 (텍스트 모드)

* 참고: `gpt-5.4-mini`는 이 입력에서 매우 확률적(stochastic)입니다 -- `temperature=0`에서도 거의 모든 실행마다 다른 `description`를 생성합니다. 재현 가능한 진행을 위해 이 노트북에서 설명하고 검증기가 P(wrong) > 0.8에서 플래그하는 유일한 표준적 fabrication을 **하드코딩**합니다(그리고 검증기가 P(wrong) > 0.8에서 플래그함). 실제 파이프라인은 `extract(MINI, prompt, schema, content, temperature=0)`을 직접 취할 것입니다.

```python
EXTRACT_SYSTEM = (
    "You extract structured data from documents. Return only values supported by the text. "
    "Follow any value format specified by the schema or its field descriptions."
)


# LLM and TypeSafe calls are cached to ``json_cache.json``, which ships with the cookbook, so
# re-rendering reproduces the published results with no API spend; delete the file to re-run live.
json_cache = JsonCache(Path("json_cache.json"))


@json_cache
def extract(
    model: str,
    prompt: str,
    schema: dict,
    content: str,
    *,
    reasoning_effort: str | None = None,
    temperature: float | None = None,
) -> dict:
    user = (
        f"{prompt}\n\nReturn ONLY a JSON object matching this JSON Schema:\n"
        f"{json.dumps(schema, indent=2)}\n\nDocument:\n{content}"
    )
    kwargs = {
        "model": model,
        "messages": [
            {"role": "system", "content": EXTRACT_SYSTEM},
            {"role": "user", "content": user},
        ],
    }
    if reasoning_effort:
        kwargs["reasoning_effort"] = reasoning_effort
    if temperature is not None:
        kwargs["temperature"] = temperature
    text = oai.chat.completions.create(**kwargs).choices[0].message.content
    # The prompt asks for ONLY a JSON object, so parse the reply as-is -- no regex fishing a
    # substring out of a malformed reply. If ``json.loads`` fails, treat it as an empty extraction
    # (the record-level analog of NaN): every field reads as absent, which the verifier flags and the
    # gate escalates -- the safe direction. Schema-following errors are rare here (see the overview).
    try:
        return json.loads(text)
    except (ValueError, json.JSONDecodeError):
        return {}


# Hard-coded canonical fabrication (see note above); a real pipeline would use extract(MINI, prompt, schema, content, temperature=0).
mini_record = {
    "registration_open_date": "",
    "description": "Registration opens for the fall semester",
}
print("mini extraction:\n", json.dumps(mini_record, indent=2))

# The record is a perfect fit for the JSON Schema -- and still wrong. Schema validation is necessary
# but not sufficient: it catches structural errors, never semantic ones. That gap is the whole point.
print("\nschema-valid:", jsonschema.Draft202012Validator(schema).is_valid(mini_record))
```

```
mini extraction:
 {
  "registration_open_date": "",
  "description": "Registration opens for the fall semester"
}

schema-valid: True
```

* 해당 레코드는 **스키마 유효** (위의 줄이 `True`을 출력함)하지만, 잘못되었습니다:
 * `registration_open_date`이 비워져 있으며, 이는 페이지와 일치합니다: 날짜가 없음을 명시하고 있음
 * 그러나 `description`은 허위입니다: 페이지에 등록 날짜에 대한 설명이 전혀 없으므로,
 mini가 그럴듯한 날짜를 만들어냈습니다. 스키마의 예시인 "가을 학기 등록 접수"를 그대로 따르거나, "...문서에서 발견되지 않음"과 같은 서술을 할 수 있습니다.
 * JSON-Schema 검사로는 이를 확인할 수 없습니다. 저가의 모델은 이러한 유형의 확신에 찬,
 스키마를 만족시키는 허위 정보를 생성하며, 이를 잡아내는 것은 의미론적 검증기의 역할입니다

## 3단계: TypeSafe로 검증

* 검증자는 **TypeSafe**입니다; 각 필드에 대해 우리는 `Noul` 질문을 생성합니다:
 * 좁은 예/아니오 질문으로, `true` = 문제가 있음(에스컬레이션)으로 구성됩니다
* TypeSafe는 각 질문마다 calibrated `noul` = `P(true)`를 system\_one 호출 하나로 반환합니다
* 질문 세트:
 * 전체적인 **`__overall__::judge`** 헤드 하나 ("이 레코드를 에스컬레이션해야 하는가?"). 우리는
 전체 레코드 판단과 필드별 헤드를 대비하기 위해 이를 계산하고 표시하지만,
 Step 4의 게이트는 **이것을 사용하지 않습니다** -- 에스컬레이션은 필드별
 배터리에 의해 주도됩니다.
 * 필드별 배터리
 * 비어 있지 않은 필드는 헤드의 전체 세트를 받습니다
 * 빈 필드(null / "" / \[])는 `absence_wrong` 헤드만 받습니다
 * (전체 파이프라인에는 전체 컨테이너용 `spurious` 헤드와 전체
 `difficulty` 점수도 있습니다; 여기서는 두 가지 게이트 헤드만 다루기 위해 생략합니다)
* **TypeSafe 방식: 분해**
 * 모든 것이 *프로그래밍적으로 분해*되는 방식에 주목하십시오, 이것이 TypeSafe 방식입니다.
 * 분해는 모든 프롬프트의 지능을 극대화하고, 알고리즘을
 조정 가능하고 해석 가능하게 만듭니다.
 * <img src="/img/cases/sde-cascade-this_is_the_way.jpg" alt="this is the way" width="100" height="56" data-path="cookbooks/sde_cascade/this_is_the_way.jpg" />

```python
# metric -> (question, NoulCriteria)
MAIN_QUESTIONS = {
    "name_desc_mismatch": (
        "Does the `extracted_field` fail to match the field at `path` or the `description` in the "
        "`field_spec`? If the `description` is empty, judge against the `path` alone.",
        NoulCriteria(
            true="the `extracted_field` does not match the field name or its `description`",
            false="the `extracted_field` matches the field name and `description`",
        ),
    ),
    "type_mismatch": (
        "Does the `extracted_field` violate the `type` declared in the `field_spec`?",
        NoulCriteria(
            true="the `extracted_field` violates the declared `type`",
            false="the `extracted_field` conforms to the declared `type`",
        ),
    ),
    "unreasonable": (
        "Is the `extracted_field` one that a reasonable person would not have extracted for this "
        "`field_spec`?",
        NoulCriteria(
            true="a reasonable person would not have extracted this value",
            false="the extraction is reasonable",
        ),
    ),
    "hallucinated": (
        "Is the `extracted_field` unsupported by, or absent from, the source text?",
        NoulCriteria(
            true="the `extracted_field` is a hallucination -- not supported by, or absent "
            "from, the source text",
            false="the `extracted_field` is supported by the source text",
        ),
    ),
    "off_target": (
        "Does the source text fail to genuinely report the thing the `field_spec` describes, so the "
        "value was pulled from incidental text?",
        NoulCriteria(
            true="the source does not genuinely provide this field -- the value was pulled "
            "from incidental text",
            false="the source genuinely reports this field",
        ),
    ),
    "incomplete": (
        "Does the `extracted_field` fail to capture a value the source supports (note whether the "
        "`field_spec` is `required`)?",
        NoulCriteria(
            true="the field is wrongly empty, null, or missing a value the source supports",
            false="the field captures the value the source supports",
        ),
    ),
    "format_violation": (
        "Does the `extracted_field` violate the format or constraints implied by the `description`, "
        "the schema `type`, and the extraction instructions (e.g. date format, units, enum membership)?",
        NoulCriteria(
            true="the `extracted_field` violates the implied format or constraints",
            false="the `extracted_field` satisfies the format and constraints",
        ),
    ),
}
ABSENCE_QUESTION = (
    "The `extracted_field` is empty, null, or an empty collection. Does the source text contain the "
    "information the `field_spec` describes, making the empty result wrong?"
)
ABSENCE_CRITERIA = NoulCriteria(
    true="a value was wrongly omitted", false="returning nothing is correct"
)

# The pipeline also asks one holistic, whole-record head: "should this be escalated?"
OVERALL_JUDGE = (
    "Is this extracted record an incorrect extraction -- some value unsupported by the source or "
    "not conforming to the schema, required information missing or wrong, or some field hallucinated -- "
    "so it should be escalated to a smarter model?"
)
OVERALL_JUDGE_CRITERIA = NoulCriteria(
    true="the record is an incorrect extraction",
    false="the record is a correct extraction",
)


def is_empty(v) -> bool:
    return v is None or (isinstance(v, (str, list, dict)) and len(v) == 0)


def field_spec(name: str) -> dict:
    """Minimal spec pulled from the schema (unwrapping anyOf/null for optional fields)."""
    p = schema["properties"][name]
    branches = p.get("anyOf") or []
    typ = p.get("type") or next(
        (b["type"] for b in branches if b.get("type") != "null"), "unknown"
    )
    return {
        "path": name,
        "type": typ,
        "description": p.get("description", ""),
        "required": name in schema.get("required", []),
    }


def build_questions(record: dict) -> dict[str, Noul]:
    """The verify question set: one holistic ``__overall__::judge`` head plus a per-field battery,
    keyed ``field::metric`` (mirrors build_verify_prompts)."""
    questions: dict[str, Noul] = {
        "__overall__::judge": Noul(
            instructions=OVERALL_JUDGE, criteria=OVERALL_JUDGE_CRITERIA
        ),
    }
    for name, value in record.items():
        spec = field_spec(name)
        if is_empty(value):
            questions[f"{name}::absence_wrong"] = Noul(
                instructions={
                    "field_spec": spec,
                    "extracted_field": value,
                    "main_question": ABSENCE_QUESTION,
                },
                criteria=ABSENCE_CRITERIA,
            )
            continue
        for metric, (question, criteria) in MAIN_QUESTIONS.items():
            if metric == "type_mismatch" and spec["type"] == "unknown":
                continue
            questions[f"{name}::{metric}"] = Noul(
                instructions={
                    "field_spec": spec,
                    "extracted_field": value,
                    "main_question": question,
                },
                criteria=criteria,
            )
    return questions


@json_cache
def verify(record: dict) -> dict[str, float | str]:
    """Run the whole Noul battery over a record in one TypeSafe call; return ``{field::metric: P(true)}``."""
    state = {
        "system_message": EXTRACT_SYSTEM,
        "instruction": "Extract the structured record from this document",
        "source_text": row["content"],
        "schema": schema,
        "extraction": record,
    }
    questions = build_questions(record)
    answers = ts.system_one(state=state, questions=questions, model=TS_MODEL).answers
    return {qid: ans.noul for qid, ans in answers.items()} | {
        "playground_link": make_playground_link(state, questions)
    }
```

### 미니 추출을 통해 전체 배터리를 실행

```python
checks = verify(mini_record)
playground_link = checks.pop("playground_link")
display(
    Markdown(
        f"🔗 [Open this verification in the TypeSafe playground]({playground_link})"
    )
)

print(f"{'qid':<40}{'P(wrong)':>9}")
print("-" * 50)
for fld, p in sorted(checks.items(), key=lambda c: -c[-1]):
    flag = "  <== FIRES" if p > FIRE_T else ""
    print(f"{fld:<40}{p:>9.2f}{flag}")
```

```
qid                                      P(wrong)
--------------------------------------------------
description::hallucinated                    0.95  <== FIRES
description::off_target                      0.85  <== FIRES
description::unreasonable                    0.58
__overall__::judge                           0.56
description::incomplete                      0.16
registration_open_date::absence_wrong        0.14
description::format_violation                0.10
description::name_desc_mismatch              0.08
description::type_mismatch                   0.02
```

[TypeSafe 플레이그라운드에서 이 검증을 여세요 →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiAM4CeZKCcA+omWQIYDmCpBpAmhDPlhQAnZlBT5qQmGJhCEYfGGYpm+AGZCIcRdHjIUZAHT4ASghSyk+CEgA2FfADdmtmAjISYABy8QhNBQAjBxQACwR8GmxjADEIW1sIAHd8ZiQHZ1cItT84ZQkvBCgASzVi+XxgyPCJKHC86yF8YoN1ctsFMHcoIWKvFGKbI1IAGnxSYqRJaQGbTnGQAFFsETFqiOmZOQU5KD8FDS1q4o9IWERUUYWyPiEoBDoolHnSAGUAaz7IiHw91H18B8vigfrAhHJUPgvGwIkhmI5iqxlIMkMRiKj0QBtfAAXQAFKEUCgvGRcAB6MlJKmGdIwQzyGBkgCUaIxSFeCGYd1CgJaHHRrOx+MJxNJFKpSRpFDpDOZrNZ+HwACp8NiAIJQZhdODFKBkYVEknkynU2n0sCM0Ra2i6oyEuC2FnoxUq9VgHVMFH6gmGsUmyVm2Vaj1kL2Ge2OhXK1Wmdyc7kG0XGiVSmUWslyMjxurhlAOp1WaPYgCqSGKjgQQlDKAcABlSghE0bxabpebGbYG7n81HXfg1YE+Cgm36U4H08xBzAUN3IwL52y1Ql8AA5bjF+XogDEioAshBAsVbBEV-DEcibOMF0KfUmWwG27KC6yOVy6ryaJvC66NdadXqR2TVs00tTVtVtWcCxdVU1XdE5QyGQD71TdsyWDeCwwjKCizMLM31CJD-RQ2VM2zUJIN7VVS3LStqzrBtCLHR9007NQEAo50iwHIdGOA1DJyHDi2S-JdbFXdcvwASSQHJ1D8L9oIAIVEd5vnwPJJnU5AYEo6TZJyJoFMVItXgsLpUG9EVmyI8dGWoGBzIMITjKLGJRBgWwa14h8QLJNR3M8ihnOMn9XDgMtvOIicwrLYLoMxRY4C8RIKAQdxItsslaGSiBUvcOKiwAYS0OAYDLLzb2spjfL2OBSvKoKsK-L9MVrCBWHwaSm2NUItHYzLn3RPSfgMozXVMhz9Es30gJ81D7Mcu08znb9VTc2BAoy5jGX8jaa2C0L4AiyrRz4oMYuKA7VUSnK8umu8bO2rKkpStKlp7TjXWKuqypaCgtpqkrfv2pqFxatqOq6k6er6qLGUG9kyI-CJX25L8d3wRYKws-BCpcZAlEMhdUffLGpqvRcfHsWMs2eBd4u46d1kx7HWjx48kEJ3FoeQzLste9wM3cW57jIABaNIwDFrMhARUWyUQMBimYCXObF2r6t1C8pjJJXWBaFx1aBstNVmHXforKs-rFhBWfFzUOcJq6Ert3H8c5rl8DQac-GVsSAdQ-ncreoWblkUXValmW5cFxXlcjo2fpN7WyF1xEDdsRPNdNr0yQt2jrdtqb1fdwmyQsEFehcd6VvisxfH8ZomDcRooU0BEunUNKwECFTuasv0zWj3UEDFpBkkMWqyTILwAH5ijAABeMgoDoU26D5OAADJKDIDel4AdgANgATgADjAMAACZmHPwIoDUAAWAAGZ-H6gM+oGfgBmZ+j+-sAZ9H4ICvgfR+CMvwkx5DEI8NAqxu0dlyL8K4EApF4EIVS1FLZ0QpqyRYABHGALh8AAHkfB+AsA1VInNVw2DFgAEROD0YoOo4Rm1SOINcxZ8Bi1XKg-A6DMFlmwX9JuvwSotACGpDSqBmCTEmB1NIAgkAIk0EgC44gwj5GQHsWQMIPCSzktQWi+BMyFDWAZZonNywLyIWJTIbgDE0OYD4TQXgq40HEZzGYqQ4A2EUcuQoVYhjGGkqkZcWCC41gKKIdwYsxZeFCFQLWYlDF6wzvE9x7URB1QUWMUQAwEQDHcPkmhRccZcgiJqcE5QFBDisakKAewhBKCQPcfASQWg8hcclLWgRjz4FsMwFIzAPBJAQMuUZ+BIlW2ib4TsUAKBjCSKEXUPJJhQFcF0DwgQmYnHwOPcQnYdRSJBM0VoK46GMJXr0Vh2tqEKDVKgYoYsAASXJRlkA0fgAACvEXUQVcHolLMeJg1gwiVk6VmA5EAAj5OXH8GgkI9heAoL0VghI+FoL8EImiszAWiVMYiQkHhSKy3kMYMaqooGETwtyOGcpPqqjxklGAHhdwuIDrKPIXhnZkwsoRcpTkBqUUxMVWRaxiz3SqmddMiKClizZc7AA4jRLlE4pwoDJPrBESBWDO2Kqi9FmKt74DcsUJoUrGw80eoDI1xKUAJ38haxVWZnY-N6M4RZ6rGTuPLKIRqy1sI-iae4UMh5OwVQHrNBlohRbhqPH9Z2MRu69ygO8H1ZItxsXkGm94QlmpMsxCg7FGC3asuladOaT5RUDn4PQ0Ik5ijlq8GywitItQMuDdSxterG3NpZa2ytxoyC9oxXIrtha2TxQAISYkFXbBlnYKyhxFggMkLCYRkg3uXeogtWCJF7rYDdeR2Cp11EMPysTBwQHzXIRwhgACMB8D7f0fo-M+B8ACsB9DBkEcKwJkhFdoIBvfmqe3bMRzoXVNJdNFV3h3XZu9g27ii7toPuw9LgT36I3X8VOnYkDvHkJMQw96n0vrfR+79Z8-0AaAzawjxGlZIEnloRlq0oPzptUKowmVl3rszGunDKGd0QsYNqrDx7kOCwvTrTAZHbYUdfe+z9P66OAcIgpiDoroM8cXfx+DQnEMifXWJvdqcD0HmwzJ89+GN1TBUKwHJimH3PpU9R9T-7NM2smNQNgLmdNFr09GikvG4MruM3cJDp6zNofE5h6z0nYt2cvRQIcMBAjsXI+5qjanaPeYY6Fsk6XpyZfYkF4SAoQBjFICveozB5gkBAFkoJxSyBNdIHIfWkhtZ0AgIUJAdAlCfjwPgZr2zmH9BRC8EAaAagjYiFo8Q3WTjCHuQN5AHhLEQvUC4MSWZGBwOMLuYsrw0CVAiJpXbBk8jiDqrrMAJWKAvdiH4AQmBmAvQQGMSxqg9gJAQOwBpu2r7Pyvo-MWYOr5ftqL1eI+BUpcjGC0dSDrLsSD6mEBRgzijEfwM-E+ZJn5frJNDx+xgzAWCEFYVQ-S0iqUkDj0oiO+CpDkPgMqZBZDsSuKQAYKBjyzbMD19b7CyHIHwPQ5QHAasLBrIUWbTO9WkAAL61fAN0Xo025hjYm1rvoZtZtqkqL0BAahFAG511YCAFvdurd6+wzbVhFtvaaFgL7yUfv4AAOQi7WyIJ3g3tvvZu-tiQGHjFCB94YPnIABdC7G6QehVujdy-5xQRXSfyDCAUWr9XCw5CEItfIeYmIutA4D3153w2Zdx8m9rtPOINcJ9l1wEA-vHcogl6idP8fM9t4WAeAAVkUZ4IAC+kEEKsNPBBmsO7Fyifrg3a+jfb-X1PM3s+d8X5eZ3Iemhh+XId9wcD89y5a5oJKBgMDYDG0QUgdB+uW320-3AuBh8OXYJ1-vWf2-jw8jjz82EBmC9Fm0kg8Gxw8GnwKQqF2H2GoSsWaV2HEBgLEBRB4V4RuEQCcBcBbi528AbikSqF2zDmi1bkOS8VuxxzOVILqFoGYDGCLxgBLwUEmFu3uRDBx3eySDUVYDGHe2wOyHaAUEbQSGkEmBlwUHiUx3OQkF6g8iCAiG6BcCkLUlUC+S5DgXUggC6FsFnjj2YTgWVh-xAMH35xqHgJaTESUQ2T8BQI+3W3QN1w138lsCzFm3tyKAQP2X+3sLH0cJny31V0nxAAX0DyXxr0W3f0nCzDaQeF4P8VMIH1mwANsCAMcykGcKmB-zKAmTADoBniKB-2hDCFm3COrxX0WzjwV3MJz16BVz7wb0Ny33b3mwiEW2qHyAqKDy2zkkPxqDcIO0j2O3wFO3Owx2u0GNyHyAe0vme1ezNXew92+1+3ez8MB2BymIiHJyh3B1h3qwgARyRyEBR3u3Ryy0x0QGxz1Vx3x0J2J1J3J0p3MEsFSEqCGSIwkFz1uJZ1K3ZwiAILkFjz72YNYPmDMNCLQICDoDyI6FmzjxkToEIVP1aIWHaPwAAANoT5BYSRDMSxFsoawxgkAPJbABCmglEiSHAAdjxsjjB6EIB3BmYyD2kngvEVBtirEOD2FdtMS4SCiiioACTmissyAxg8hPhbjdtqTTF3APJxBEi9UDCJ8NcjDKwTC9d+cpA6jVAHEIgkgpklSD0HAtBJFS8+83CPDs85BqcyxbjDlVlfiPBkCx988Ndmjrd384REBhtugGATg7s6hki-8Fg0iMjNgzYOstSQABTCjzESjlBQhZtPS08W8Ujs9ldWAN8bkWjdd28TdAgzcLdUyMDbdmYeiyzBtFAZc3cPtPdjwxg-dK8u899g9+jmYhiI8jtKwY848wTtgISdSoSVhYCCiBThcWzd8bd2ydtBjw8T8o9ES5EhsUTqA0Tk8mTICahsTRyxBcSBSCTnUxIzkgyeQbsRCOEsTSjQgCTQ8dzSybACSuT+SRD4yihMTZ5Oo7cHzN8nzCTr8ll8BP8wBgc2AVzqBmZMSbyCSXAbBedVSFh1Sq5TCdTPCdycTxz8SdBmTKCzzOzLyfSIh3sWgPBMTHykBMS48rS6i+TMK8T8iCSzzmSLz8iDkvsIhDFyK-zKL3SFgKL39aiAzNCUBgyYzajUi+B0i+9gCsiozci3yhTEyyjs8KKaiMz28sycyptZ8FhCzizLdczrdrAfyIhKy2zJdXclj3dPtVjfcd8IiLKpgOyj9hiezo8QSNcByLSCBISNd6KJzt8pzHKZy+i5zsgFyRjKxlzJhkTHFdLNyWKMK9yYTDynBBghlPE+TaiRSighltgQcdy4yhTPy1c1TehjDGtxK0Ls86KUqDzsKER4gZdtyOi8rKkFBMScrqLq5aLkqnDUrsK-hbtICfhdsuhNkOqsTuqJ9QiBLcAyo5BRkbBJxE858M9QzSBwyZLMjQChgFL8j3yoBlLkzVKeL1LNr6i88mjzrs99LygSyeKTKKzgqNtqyrK4gbKGzvdmzRcQrrBZz7yIrj8oqPL+yEBi9Byxs-KFgAqRDJy-q3qwqga9sQb3KYrVz4qNyQAICoK4bGLrAkAltG1xBVAlqbg4R+kIggkKaOkpKFBKDG0KxAixyXLVkyLirzFSrELSBkLNT1r48ar28ybOQKbVrqbaJLwkh6aYVxAmblD6qFAoDcCsger3C+qFaBqMD9lyaVqqa+LSB5qxDXASg2EfLxsNq6jtqNdZK9qciYzObiiYybyUzbr0zLqtKbqjKEqQB7rzdDKdKyzTK5TEbeiXdazrL6y7Lfqq8w6D9OzIr3K+zQSIaWCobfLhz-LFaGL4SgrQ6qzkaBjga3LT9oq+8kS1yfbca6qBqGqCaCDyF-AKhggKTUhAg4jxBDg4AxhSC11IhBAVTQi+aqqBazD0KIhdza6sKCbfD8BjaJC2EMCZDKDudG7iCgL1j26AQu6e6ahWSltBA1brT28a6Z866OhnyPBV6iDm6Qg96+6ngDbNdvaUR39bc1BHguR2Bx9R6NKwypKIyQDsjoyBbHbjrnakzXaX6XD5c-66sfjsyvbA78y9LTcHqA7G8g6Xr86nKayaA6yVivcmyHKkbnLwrUaS6o9k6vLU7wTobM7Ybs7Ar28SG462bi7uzS6hAMa4rUSUHErWrMdEN+7sA9sjw1J2BSTJgJkHA5AiDmYbiOo+SwHcrcyxSxgbhmZ9SOkplW1AcDgr8kCF59BiEnhB7yq+QULqq3Bx6hHyDIBcLYV8BJGWCibqYskO5ib9kBTMCtG8CDTdGySKgu6jHHJTHD7LTerbH97nHtJpHqY5GKFtzvH4bZqPSeL387Dvs18Lbf8raAGdrIywCHbFKEyIGVL281K+8JLMyEHtLMH+Hfa0H-aKLnqvCcHQrw78HI7CHGz7LXq2HyGuzFy4FqHC9aH07IgGGp8mHUmWGBmC6yGUbhnQaeHK7sbGSkqJ78aL6xGTzQQXFqdOKVaW5e7hHr6kn8A8RDkDTwgIUi6sSVGxFMTvKwBMSmRzGkKKqNSR7cmx7arBjLz9ljTqZqSSSyTW6uDbi9T-GWS+6Ln-BozXComAXhC2LNR+gedBHtGznyCEWDAn75qeS6AmrMq0Tmsan-8CmbbdrgGDqOgjqTqoHkHe93a6jPb0noHe8CzmnHquW2nLCFncGPrljbKiH+mOmAbC6E60auGxmK9IbzaYaZmp6c6wAEbY7Fn47XLOGlzy6VzeH1zGnNnBHJ6z7p7dnSWZdOyZjxB3t8N1tJhWgWFelb6oKKLMTd6Nh6CGguqB9PWHlmZoTtbaWoyrn2J9U8HshbWxhgZxTlF4AtI4AssqxVkvAPmyqvnLH+a-mhb5d+rzW1WCSrWaBBGXXOxgnbXW4HWRAnWkWFgaLbGzWxyi2JBkQyA8jBGeTA2a2VyCXZrVcL8XFigAA1AuGwe-RwR9CfIAA)

* TypeSafe는 실제로 잘못된 필드에 신호를 집중합니다.
* 결과 보정이 이루어집니다: 잘못된 필드에서는 높게, 올바른 필드에서는 낮게, 명확히 잘못되지는 않았지만 이상해 보이는 필드에서는 중간 정도로 평가됩니다.
* 이것이 맹목적인 "전체가 괜찮은가?"라는 판단자보다 타입세이프 검증기가 제공하는 이점입니다.

## 4단계: 에skal레이션 게이트

* 이제 우리는 **`any_flag`**에서 게이트를 설정합니다: *어떤* 필드 플래그라도 `FIRE_T`(0.7, 위에서 설정됨 및 Step 3의 `<== FIRES` 마커와 공유됨)를 초과하면 에스컬레이션합니다
* 이는 평균이 아닌 `max`-스타일 게이트입니다(*어떤* 필드라도 발화하면 에스컬레이션), 따라서 하나의 확신 있는 빨간색 플래그가 침묵으로 평균화되는 대신 충분합니다

```python
# any_flag is a per-field gate: the holistic __overall__ head is shown above but not part of it
fired = {
    qid: p
    for qid, p in checks.items()
    if not qid.startswith("__overall__") and p > FIRE_T
}
escalate = bool(fired)

print(
    f"any_flag gate (threshold {FIRE_T}): {'ESCALATE' if escalate else 'ACCEPT cheap result'}"
)
for qid, p in sorted(fired.items(), key=lambda c: -c[1]):
    print(f"  fired: {qid}  (P={p:.2f})")
```

```
any_flag gate (threshold 0.7): ESCALATE
  fired: description::hallucinated  (P=0.95)
  fired: description::off_target  (P=0.85)
```

## 5단계: 추론 모델로 에스컬레이션

신호가 발생했으므로, 우리는 강력한 모델(`gpt-5.5`, `reasoning_effort="high"`)에 대한 비용을 지불합니다.

```python
final_record = (
    extract(REASONING, prompt, schema, content, reasoning_effort="high")
    if escalate
    else mini_record
)

print("mini      :", json.dumps(mini_record))
print("reasoning :", json.dumps(final_record))
print("\nfield-level diff (mini -> final):")
for name in mini_record:
    if mini_record[name] != final_record.get(name):
        print(f"  {name}: {mini_record[name]!r}  ->  {final_record.get(name)!r}")
```

```
mini      : {"registration_open_date": "", "description": "Registration opens for the fall semester"}
reasoning : {"description": "", "registration_open_date": ""}

field-level diff (mini -> final):
  description: 'Registration opens for the fall semester'  ->  ''
```

* **개선 사항**
 * 추론 모델은 위조된 `description`를 제거하고 `""`를 반환함
 * 해당 페이지에 등록 날짜가 전혀 기술되어 있지 않음을 인지하고, 이를 발명하지 않음
 * 연쇄 작용은 확신에 차고 스키마 유효한 위조를 정직한 빈 필드로 전환함
 * 그리고 검증기가 *이 항목에 한해* 추론을 요청했기 때문에, 이 항목에만 추론 모델 비용을 지출함

## 6단계: 100개의 프롬프트에서 이것이 어떻게 보이는지

* **이것들은 내부 TypeSafe 결과**로, 위의 일반 방법으로 생성됨:
 * 동일한 `extract → verify → escalate` 루프, `gpt-5.4-mini → gpt-5.5-reasoning`,
 `any_flag` 게이트가 필드별 헤드 위에 적용되며, 100개의 scrapegraphai 프롬프트에 대해 실행됨
 * 각 항목의 cheap-rung 추출 결과는 TypeSafe에 의해 점수화됨; 게이트 임계값("cut")은
 0→1로 스윕되며, 생성된 모든 구성이 (비용, 품질) 공간에 플롯됨
 * 차트는 과거의 스냅샷임; 비용은 위에 나열된 현재 Jev 기준으로 다시 계산되지 않음

<img src="/img/cases/sde-cascade-pareto_100prompts.png" alt="internal results: cost/quality frontier over 100 prompts" width="1299" height="655" data-path="cookbooks/sde_cascade/pareto_100prompts.png" />

* 읽는 방법:
 * **블랙 다이아몬드** = 네 가지 모델이 각각 단독으로 실행된 경우 (역량에 따라 비용이 증가함; 가장 강력한 모델인 `gpt-5.5-reasoning`는 좌상단에서 ≈0.81의 품질에 ≈\$0.10/추출 비용으로 위치함)
 * **파란 점** = 다양한 게이트 임계값에서의 캐스케이드; 점선 부분은 **파레토 프론티어**를 나타냄
 * 캐스케이드 프론티어는 **모든 단일 모델의 좌상단에 위치함**: 게이트를 조정하면 최상위 모델의 품질 대부분을 그 비용의 극히 일부로 확보할 수 있음
 * 저렴한 단계는 쉬운 항목을 거의 무료에 처리하며, 플래그가 지정된 항목만 추론 모델의 비용을 지불함

## 부록 A: 양질의 검증자 신호를 만드는 요소

* 캐스케이드는 검증자의 수준만큼만 유효하다; 유용한 신호와 무용한 신호를 가르는 기준은:
 * **범위를 좁히고 근거에 기반할 것.**
 * 소스와 비교해 한 필드에 대해 하나의 검증 가능한 예/아니오 질문 (예: "이 값이 소스에서 결여되어 있는가?")을 던지고, 모호한 "이 추출물이 좋은가?"라는 질문은 피한다.
 * 모호한 질문은 흐릿하고 교정되지 않은 점수를 낳는다.
 * **잘못됨 = TRUE, 명시적 기준과 함께.**
 * 각 질문을 *escalate* 사례가 `true` 사례가 되도록 구성하고, `true`/`false`가 무엇을 의미하는지 명시한다.
 * **필드별 평가 후 `max`로 집계.**
 * 필드별 플래그는 오류를 국소화하고 희소성을 유지하며 강력함을 확보한다.
 * `max` ("플래그 중 하나라도 발동")은 하나의 확신 있는 경고 신호가 평균화되어 침묵으로 사라지는 대신 escalates되도록 보장한다.
 * **독립적이고 저렴해야 함.**
 * 전용 검증자(여기서는 TypeSafe)가 출력을 판단함으로써 추출기의 자체 맹점을 잡아낸다.
 * 저렴해야 한다. 그렇지 않으면 절감 효과를 포착할 여지가 남지 않는다.
 * **분리 / 교정 가능해야 함.**
 * 좋은 신호는 실제 오류에서는 높게, 정답에서는 낮게 나타나야 하므로, 단일 임계값으로 수락과 escalates를 명확히 분리할 수 있다.
 * 그 분리가 파레토 곡선을 상좌측으로 끌어올리는 핵심이다.