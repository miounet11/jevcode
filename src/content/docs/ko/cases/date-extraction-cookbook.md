---
title: "날짜 추출"
description: "문서에 명시된 부분을 TypeSafe에 요청하여 절대 및 상대 날짜를 추출한 후, 코드에서 신뢰도 기반 검토를 통해 이를 해석하고 검증합니다."
section: cases
order: 170
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/date_extraction_cookbook"
translatedFrom: en
---
*TypeSafe를 사용해 텍스트에서 날짜의 각 부분을 읽은 후, 코드에서 이를 `date`로 변환합니다.*

여기에서 구축하는 함수 `extract_date(document, role)`는 문서와 원하는 날짜를 나타내는 구문(예: "양식 반환 마감일")을 받아 신뢰도와 함께 `date`를 반환합니다. 신뢰도가 낮은 판독 결과, 날짜로 전혀 합쳐지지 않는 결과(문서가 전혀 명시하지 않은 날짜 포함)를 플래그로 표시합니다. 날짜는 "2027년 8월 14일"과 같이 명시적으로 표기되거나, 오늘을 기준으로 "내일", "다음 목요일"과 같이 상대적으로 표기될 수 있습니다.

TypeSafe는 `Choice` 날짜 관련 질문에 한 번의 호출로 답변합니다: 그 날짜가 어떤 종류인지, 그리고 텍스트에서 언급하는 월, 일, 연도, 요일이 무엇인지. 코드는 이러한 답변을 `date`로 변환합니다. 모델은 텍스트가 말하는 내용을 읽을 뿐, 절대 달력 계산을 수행하지 않습니다.

아래 셀은 해당 함수를 네 개의 짧은 문서에 대해 실행하고, 각 날짜와 그 신뢰도를 출력하며, 결과를 코드에서 허용하는 것과 사람이 확인해야 하는 것으로 나눕니다.

<img src="/img/cases/date-extraction-cookbook-overview.png" alt="Overview diagram" width="1351" height="348" data-path="cookbooks/date_extraction_cookbook/overview.png" />

*TypeSafe는 날짜가 어떻게 표기되는지, 그리고 텍스트가 어떤 부분을 지칭하는지를 읽습니다. 코드는 이러한 답변을 `date`로 변환하며, 날짜가 상대적인 경우 오늘을 기준으로 계산하고, 이를 수락하거나 검토용으로 보냅니다.*

## 설정

```bash
pip install ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

그런 다음 `TYPESAFE_API_KEY`를 설정합니다.

```python
import os
from datetime import date, timedelta
from pathlib import Path

from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from typesafe_sdk import Choice, TypeSafeClient

TYPESAFE_MODEL = "jev-1.12"
TODAY = date(
    2026, 7, 30
)  # fixed reference "today" so relative dates resolve reproducibly
REVIEW_BELOW = 0.60  # gate: a date below this confidence is flagged for a human

MONTHS = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12,
}
WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]
YEAR_WINDOW = list(range(1900, 2051))  # 1900..2050

# Cached to json_cache.json (shipped with the cookbook, so re-rendering replays the published
# results with no API spend); delete it to re-run live.
json_cache = JsonCache(Path("json_cache.json"))
```

```python
# The demo cells below run when this file is executed as the cookbook; the constants and the pure
# resolve/assemble code stay importable, so the calendar math can be unit-tested on its own.
if __name__ == "__cookbook__":
    client = TypeSafeClient(
        api_key=os.environ.get(
            "TYPESAFE_API_KEY", "cache-only"
        ),  # cached re-renders need no key
        base_url=os.environ.get("TYPESAFE_BASE_URL"),
        timeout=30.0,
    )
```

## 질문들

한 번의 호출로 `Choice`개의 질문이 전송됩니다. `mode`은 날짜 표기 방식을 지정합니다:
`absolute`
월을 명시한 날짜에는 `relative`, 오늘을 기준으로 상대적으로 표기된 날짜에는 `none`,
문서에 날짜가 전혀 기재되지 않은 경우에는 `none`을 사용합니다.

다른 여섯 명은 그 글들을 읽었다. 절대적 날짜에는 `month`, `day`, `year`가 필요하고, 상대적 날짜에는 `day_anchor`가 필요하다: 오늘, 내일, 모레, 또는 특정 요일. 특정 요일을 지칭할 때 `weekday`와 `week_offset`는 그것이 어느 요일이며 어느 주인지 명시한다. 코드는 `mode`이 요청하는 조각들만 읽는다.

`year`는 1900년부터 2050년까지 매년 하나의 옵션과 두 가지 탈출구를 나열합니다. `none`는 텍스트에 연도가 명시되지 않았고 코드가 이를 채워넣는다는 의미입니다. `out_of_range`는 텍스트에 목록에 없는 연도가 명시되었고, 코드가 추측하는 대신 이를 경고한다는 의미입니다. 만약 이렇게 긴 목록이 부담스럽다면, 먼저 텍스트에서 연도 유사 숫자를 추출한 뒤 모델에는 해당 숫자만 제공하세요.

```python
def date_questions(role: str) -> dict[str, Choice]:
    """Seven typed choices that read a date's shape and parts off the text -- no math."""
    absent = "The document does not state this, or it is not this kind of date."
    return {
        "mode": Choice(
            instructions=(
                f"How is {role} written? 'absolute' = a calendar date naming a month (e.g. "
                "'August 14', 'the 3rd of March'); 'relative' = given relative to today (today, "
                "tomorrow, the day after tomorrow, or a named weekday such as 'next Thursday'); "
                "'none' = the document does not state this date."
            ),
            criteria={"absolute": None, "relative": None, "none": None},
        ),
        "month": Choice(
            instructions=f"If {role} is an absolute calendar date, which month is it in?",
            criteria={m: None for m in MONTHS} | {"none": absent},
        ),
        "day": Choice(
            instructions=f"If {role} is an absolute calendar date, which day of the month (1-31)?",
            criteria={str(d): None for d in range(1, 32)} | {"none": absent},
        ),
        "year": Choice(
            instructions=(
                f"If {role} is an absolute calendar date, which year? Pick 'none' if the document "
                "states no year (code infers it), or 'out_of_range' if a year is stated but not "
                "in the list."
            ),
            criteria={str(y): None for y in YEAR_WINDOW}
            | {
                "out_of_range": "A year is stated for this date but is outside the listed range.",
                "none": "No year is stated for this date.",
            },
        ),
        "day_anchor": Choice(
            instructions=(
                f"If {role} is relative to today, which day is it? 'today', 'tomorrow', "
                "'day_after' (the day after tomorrow), or 'weekday' (a named day of the week)."
            ),
            criteria={
                "today": None,
                "tomorrow": None,
                "day_after": None,
                "weekday": None,
                "none": absent,
            },
        ),
        "weekday": Choice(
            instructions=f"If {role} names a day of the week, which one?",
            criteria={w: None for w in WEEKDAYS} | {"none": absent},
        ),
        "week_offset": Choice(
            instructions=(
                f"If {role} names a weekday, which week is it in? 'next' for 'next Thursday' or "
                "'Thursday next week'; 'current' for 'this Thursday'; 'none' for a bare weekday "
                "with no qualifier (just 'Thursday' / 'on Thursday')."
            ),
            criteria={"current": None, "next": None, "none": absent},
        ),
    }
```

## 코드에서 해결하기

`read_parts`이 결정을 내립니다. `assemble`은 답변을 `date`로 변환합니다: 텍스트에 연도가 명시되지 않은 경우 연도를 채우고, 특정 요일이 날짜의 어느 날을 가리키는지 계산합니다. 이 두 작업은 `TODAY`을 기준으로 하며, `TODAY`은 고정되어 있어 매 실행마다 상대적 날짜가 동일하게 산출됩니다. `assemble`은 또한 사용된 하위 요소들 중 가장 낮은 신뢰도를 보고하므로, 하위 요소 중 하나라도 답변이 부정확하면 전체 날짜가 검토 대상으로 처리됩니다.

“다음 목요일”은 두 가지 다른 날짜를 의미할 수 있으므로, 코드가 어느 것을 선택할지 결정합니다. 한정자가 없는 평일은 오늘 이후의 첫 번째 날짜를 의미합니다. `next`는 다음 달력을 의미하며, `current`는 이번 주를 의미합니다.

```python
@json_cache
def read_parts(document: str, role: str) -> dict:
    """One TypeSafe call -> {part: {choice, confidence}} for the seven questions."""
    answers = client.system_one(
        state=document, questions=date_questions(role), model=TYPESAFE_MODEL
    ).answers
    return {
        part: {"choice": ans.choice, "confidence": ans.confidence}
        for part, ans in answers.items()
    }


def resolve_weekday(today: date, weekday: str, week_offset: str) -> date:
    """Which date a named weekday points to, by our stated convention: a bare weekday is the next
    occurrence on or after today; 'next' is the following calendar week; 'current' is this week."""
    w = WEEKDAYS.index(weekday)
    this_monday = today - timedelta(days=today.weekday())
    if week_offset == "next":
        return this_monday + timedelta(days=7 + w)
    if week_offset == "current":
        return this_monday + timedelta(days=w)
    return today + timedelta(days=(w - today.weekday()) % 7)


def assemble(parts: dict, today: date = TODAY) -> dict:
    """Resolve the parts TypeSafe read into a concrete date, in code. Confidence is the weakest of
    the parts the shape actually used."""
    mode = parts["mode"]["choice"]
    confs = [parts["mode"]["confidence"]]

    def result(resolved: date | None, note: str) -> dict:
        usable = [c for c in confs if c is not None]
        confidence = min(usable) if usable else None
        needs_review = (
            resolved is None or confidence is None or confidence < REVIEW_BELOW
        )
        return {
            "date": resolved,
            "confidence": confidence,
            "needs_review": needs_review,
            "note": note,
        }

    if mode == "none":
        return result(None, "no such date stated")

    if mode == "absolute":
        month, day, year = (
            parts["month"]["choice"],
            parts["day"]["choice"],
            parts["year"]["choice"],
        )
        confs += [
            parts["month"]["confidence"],
            parts["day"]["confidence"],
            parts["year"]["confidence"],
        ]
        if "none" in (month, day) or not day.isdigit() or month not in MONTHS:
            return result(None, "absolute date incomplete")
        if (
            year == "out_of_range"
        ):  # a year is stated but off the list -> flag, don't guess
            return result(None, f"year outside {YEAR_WINDOW[0]}-{YEAR_WINDOW[-1]}")
        if (
            year == "none"
        ):  # no year stated -> infer this year, bumped to next if well past
            try:
                resolved = date(today.year, MONTHS[month], int(day))
            except (
                ValueError
            ):  # e.g. February 30 -- an inconsistent read, not a real date
                return result(None, f"impossible date: {month} {day}")
            if resolved < today - timedelta(days=31):
                resolved = date(today.year + 1, MONTHS[month], int(day))
            return result(resolved, "")
        try:  # a stated, in-range year
            return result(date(int(year), MONTHS[month], int(day)), "")
        except ValueError:
            return result(None, f"impossible date: {year}-{month}-{day}")

    if mode == "relative":
        anchor = parts["day_anchor"]["choice"]
        confs.append(parts["day_anchor"]["confidence"])
        if anchor == "today":
            return result(today, "")
        if anchor == "tomorrow":
            return result(today + timedelta(days=1), "")
        if anchor == "day_after":
            return result(today + timedelta(days=2), "")
        if anchor == "weekday":
            weekday, offset = parts["weekday"]["choice"], parts["week_offset"]["choice"]
            confs += [
                parts["weekday"]["confidence"],
                parts["week_offset"]["confidence"],
            ]
            if weekday not in WEEKDAYS:
                return result(None, "relative weekday not read")
            return result(resolve_weekday(today, weekday, offset), "")
        return result(None, "relative day not read")

    return result(None, f"unrecognized mode: {mode}")


def extract_date(document: str, role: str) -> dict:
    return assemble(read_parts(document, role))
```

## 실행하기

네 가지 짧은 문서에 걸친 여섯 가지 질문: 연도를 명시하는 계약서에서 파생된 두 날짜, 연도를 표기하지 않은 양식 마감일, “오늘”에 종료되는 설문조사, “다음 목요일”로 설정된 리뷰, 그리고 양식에서 전혀 언급되지 않은 날짜. 모두 `TODAY` = 2026-07-30(목요일)을 기준으로 해결된다.

```python
CONTRACT = "This agreement is effective January 1, 2025 and expires December 31, 2027."
FORM = "Please return the signed form by August 14."
SURVEY = "Heads up - the customer survey closes today at 5pm."
REVIEW = "Let's schedule the design review for next Thursday."

# (document, question phrase, expected date) -- the expected value is only for the scorecard.
EXAMPLES = [
    (CONTRACT, "the date the agreement takes effect", date(2025, 1, 1)),
    (CONTRACT, "the date the agreement expires", date(2027, 12, 31)),
    (FORM, "the deadline to return the form", date(2026, 8, 14)),
    (FORM, "the date of the kickoff call", None),
    (SURVEY, "the date the survey closes", date(2026, 7, 30)),
    (REVIEW, "the date of the design review", date(2026, 8, 6)),
]

if __name__ == "__cookbook__":
    print(f"{'':3}{'question':<38}{'expected':<12}{'got':<12}{'conf':>6}  flags")
    print("-" * 84)
    for document, role, expected in EXAMPLES:
        r = extract_date(document, role)
        got = r["date"].isoformat() if r["date"] else "none"
        exp = expected.isoformat() if expected else "none"
        mark = "OK" if r["date"] == expected else "XX"
        conf = f"{r['confidence']:.2f}" if r["confidence"] is not None else " n/a"
        flags = "  <== review" if r["needs_review"] else ""
        if r["note"]:
            flags += f"  ({r['note']})"
        print(f"{mark:<3}{role:<38}{exp:<12}{got:<12}{conf:>6}{flags}")
```

```
   question                              expected    got           conf  flags
------------------------------------------------------------------------------------
OK the date the agreement takes effect   2025-01-01  2025-01-01    0.97
OK the date the agreement expires        2027-12-31  2027-12-31    0.91
OK the deadline to return the form       2026-08-14  2026-08-14    0.95
OK the date of the kickoff call          none        none          0.46  <== review  (absolute date incomplete)
OK the date the survey closes            2026-07-30  2026-07-30    0.94
OK the date of the design review         2026-08-06  2026-08-06    0.92
```

계약서에는 두 연도가 모두 명시되어 있으므로, 해당 내용은 텍스트에서 제외되었습니다. 양식에는 연도가 기재되어 있지 않아, 코드가 2026년을 채워 넣었습니다. 이는 현재 연도를 기준으로 하되, 날짜가 이미 한 달 이상 지난 경우에만 다음 연도로 이동하는 방식을 따릅니다. "오늘"과 "다음 목요일"은 영문으로 표기된 날짜들과 동일한 함수를 거쳤습니다.

시작 회의는 양식에서 언급하지 않는 사항이다. 그 양식에는 날짜가 있지만, 이 양식에는 없으며, `absolute date incomplete`이라는 메모는 `mode`이 `absolute`로 돌아왔고 이에 해당하는 월이 없음을 의미한다. 날짜는 빈 값으로 돌아왔고, 신뢰도는 0.46이며, 해당 행은 사람의 확인을 위해 플래그가 설정되었다.

## 라우팅에 대한 자신감

모든 답변은 보정된 신뢰도와 함께 제공되며, 날짜의 신뢰도는 이를 구성하는 부분들 중 가장 낮은 값입니다. `REVIEW_BELOW` = 0.60 미만의 날짜는 사람에게 전달되며, 코드에서 전혀 조립할 수 없었던 날짜도 마찬가지입니다. 나머지는 바로 통과됩니다.

```python
if __name__ == "__cookbook__":
    confident = [
        (doc, role)
        for doc, role, _ in EXAMPLES
        if not extract_date(doc, role)["needs_review"]
    ]
    review = [
        (doc, role)
        for doc, role, _ in EXAMPLES
        if extract_date(doc, role)["needs_review"]
    ]
    print(f"auto-accept ({len(confident)}):")
    for _doc, role in confident:
        print(f"  - {role}")
    print(f"\nsend to review ({len(review)}):")
    for _doc, role in review:
        r = extract_date(_doc, role)
        print(
            f"  - {role}  (conf {r['confidence']:.2f} / {r['note'] or 'low confidence'})"
        )
```

```
auto-accept (5):
  - the date the agreement takes effect
  - the date the agreement expires
  - the deadline to return the form
  - the date the survey closes
  - the date of the design review

send to review (1):
  - the date of the kickoff call  (conf 0.46 / absolute date incomplete)
```

## TypeSafe 플레이그라운드에서 열기

아래 링크에는 “다음 목요일” 메시지와 코드가 보내는 동일한 질문이 담겨 있습니다.
링크를 열어 답변과 그 신뢰도를 확인하고, 코드를 작성하지 않고도 문구를 수정하세요.

```python
if __name__ == "__cookbook__":
    playground_link = make_playground_link(
        REVIEW, date_questions("the date of the design review"), models=[TYPESAFE_MODEL]
    )
    display(
        Markdown(
            f"🔗 [Open this document + questions in the TypeSafe playground]({playground_link})"
        )
    )
```

[TypeSafe 플레이그라운드에서 이 문서와 질문 열기 →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIAMgigOQDO+FUAFgmDADYL4r35gIUCWA5knwAnBADceCAO74AZhCH4kWFPjS0YQimACGATwB0IADSEADkIhxTKChmx5CwADog4ELi4LOQKXaYSe+C50EDxQAcZBIFBCPCgIsdqB3toARhQQTDDxgUjMTCYuIkzaKDyiEQR5TAVRSBBKufkAvoUgPEgUKEIwUGUNFIEuABIQ0jxU7Kw68fgQMmwcXLwCwmIS0pKxKPFIAPz4ZGkZWfFk+AC8+Nr4UNosSDoKM6xI2nAdfNf4bqi0+AAKBD6Pj6Q4AQRgfBgXXwAEYACxkExkKb4ADMQjAcwWAFltEI6GQAJQAbkOxVK5QQ5yufGpgkpZQqbAgrJ0ukBKHcehM3LcQgskj5Sz01xk8QU-PkQpM8m+b0Q2MkCAQAGsOdRev9tFQyEpsKp1JoOSTyfqGjTLotptB4MgVJBuIoICouqVWOwJpwPfoXK0or92MkXL5-ENorRQuEXG0YnEEjwkg5vAApbR5Am6Jo1NoAMQQqR6WZztRc+MJtFLbXB5h4TGrUXx2Yc1TLIFTMEarfybU7TBbVV7UUh0K6jZcAGUENYEHBUgkJyAAPJ9CALoRLgByEAq88XPdzUQAIghwvvN4f2-VuwQXGpbbBEKhOBBnfU3SgPYsJnKFHF8G9D8fyoNUOmxeYfXiP0QADFwOi6Ho+h4AYIwASQWNEXhxG1OG4fhGXWKRAKoDNrnSTJslYO4HieKCEBMSRaDCf4g3+b0AI6PZ-TaDkQx8PxKiiEIwgiONtkTZMvBcOElwAJiXdElwRJcAFYlwANiXAB2JcAA4lwATiXOEAAYTNkq82jhBSrKiOElLsmSVKckA4XU1y4S0zzdM8gzPOM1y5PMoLLKHI8XDk2zwvbOTHJito5JchKojkjyUsi7yMpAOTfOyuT-PywLsvREKSrCxRhxcG8hPvJY7WfR03yoYD3VmL0KD-QCVCA10QPwMDHhwl4YLg9pOm6Xp+k6dDMNFWZIKw-DVhEcRiO9Mjjko2YaOQOiXkY5i6B9TlFo4NjAThABadE4WJbjYLaXQEAJfiw1qyNozE4SJMSfi4UM0yysqiK3MBiq22swHopB9sAdM+LYah0zkqR+zAfStGZMBrKsbB0y8rx+HCqJwHitJsyTMMuEIaqsGbKphzGdRyH0fcxncdZ7G4UJrn6ZJvmAYBqngpF2nQYBqKRcRwXDKSkXMdluTObpyXedVuWBY1uTydl0qqdug2Yb1mWNfRFmzcVs2VYlwz0XV230S1x3dY1hFgdlhFxbhwyEWNt3TdthELaDq2g5tn2EQdyPncj13bdUj2NdU72odU-2E8Dn3VJD7Ow+ziO0+jtPY7T+OfY0pPbY01P0Y0jOK6zqGNNz5v8+bwu6+LuvS7r8uoe0qufe02vse0huB6b9HtNb6f2+nzux+7sfe7H-v0b0oeob00ewb0ieN6n7G9Nn4-5+Pxe9+XvfV739fscBqnqafg+H6PsHfaf8+P8vgHDOvv+t8-73xykDLeqUga72CqZV+oCEbySBqfOB39oGX2gdfaBt9oEgOCpTIKpkaYIIZvgpmJCkG4JQQQtBBCMEEKwQQnBMDwGRRgVAmBsDgpxQQfLfBaVuHUNytw+hOsEH63wYbcRHCEbv2CubURlD0TUPtqI+h6JGHuwQV7TRUiEQyJRuQlGlCETUKjpo+hCJGGJyXBAbIAB9eYtihAZj4B9cE+BnoEhItQL88RsRyClMxKg2FUjZC8TYmwPAuC4SYBMXxwhnHAljHUS0EYdzuJev+KgbUGCyHlB1eio02gIUmshVCDgXAYVwthM60xlqETWuMUiggtqnGovcPaniDr4CYixdJBIDgAAUwhqkODVc4PA5qPntC+bJLU2QeIUACKA7hWAdBkAkKgcRiRdTIOE+xMhHEJPGQsG4CyvHZOxCElQwEOjRNiYUqIHJbEZhCJeaSAlwzlM+qJJJwRfpJjejyQceNpSCjGEuJ52gJQHmyiqdUfFXI1QjA+V8T4HSvnfH1bJIEuqcTmSofJg0IILBGjxKIxSkLTUGF8ypWFvw1LwisepGwvFMmpKydkvJulHX+JqDiKADioiBciQ4oKhQirIJC6FQhzgAjpZyKFkpWQCiFNsuYCgyBwo1HoWVNxFQ5M1AyrVxIHkuC1Qi9570IwiRjJEP5CY-opnLA0C1eM0AwG4K6vmAB1BgSgtB6CXGoDQAbgV8zzLEL1dNJylA0FG0Gk4uzxuvCkr5KLIBopfE6fF3jvwdVxT1HNhLwLDV9GS+CE1KUoRmjSyZ9EcJLSZWsBpih3jOhuIautWrDq9MtA9MaWr9kyAoKQN6glrVRh+Xa6I-ypL4G8LAQUDolwGhQCu1Nd4QDpoaui7NLpPx5sCQWrxwFi1DUgqSx65LK1TWrdSzdtL5qsAZcsAizaWX6tIt01U2rdA9uOlqrxnF9ijOUOcfxoHDTBpNDq9VhxoOhsUMob96oyDmkXSIVA4H5SokCUaENppzRjNyQoG4qQCSsHNWKSQcR-j1HwAARxgPcCZEhFkACsYQqDIAh00+AAD0hwGj4Zg7oEko1miRBANoUwPAABqGzq0OBAKIOEUmR0sD6AwXEKymAUAcAAbRAOxsQV04T6BsiAAAus0IAA)