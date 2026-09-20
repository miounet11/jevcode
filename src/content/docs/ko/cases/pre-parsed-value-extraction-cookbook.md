---
title: "사전 파싱된 값 추출"
description: "정규식을 사용해 후보 이메일, 전화번호 및 금액을 찾은 후 TypeSafe가 요청된 범위를 선택하여 원문을 정규화할 수 있도록 합니다."
section: cases
order: 230
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/pre_parsed_value_extraction_cookbook"
translatedFrom: en
---
*정규 표현식은 후보 값을 찾으며, TypeSafe는 질문에서 요구하는 값을 선택하고, 코드는 이를 그대로 복사합니다.*

여기의 `find`와 `pick` 쌍은 자신의 문서를 가리킬 수 있는 것이며, 세 가지 실제 적용 사례가 그 사용법을 보여줍니다: 발신자가 영수증을 보내길 원하는 주소, `+14155550177`로 표시된 전화번호, 그리고 요금으로 플래그가 지정된 `1315.50 USD`의 청구서 총액.

TypeSafe는 사용자가 제공한 옵션 중 하나를 선택하므로, 후보를 먼저 찾아야 합니다. 정규식이 후보를 찾고, TypeSafe가 하나를 선택하며, 코드가 그 선택을 복사합니다. 세 단계로 이루어집니다:

1. 정규식은 텍스트에서 후보 값을 찾습니다. 과탐지되도록 튜닝하세요.
2. TypeSafe는 질문이 요구하는 후보 값을 선택하고, 코드에서 이후에 필요로 하는 속성(통화, 국가, 금액이 크레딧인지 차징인지 여부 등)을 읽어옵니다.
3. 코드는 선택된 값을 복사하고 정규화합니다.

TypeSafe는 정규식이 찾은 범주 중에서만 선택하므로, 반환되는 값은 변경 없이 복사된 해당 범주 중 하나입니다. 새로운 값을 생성하거나 자릿수를 바꿀 수 없습니다.

<img src="/img/cases/pre-parsed-value-extraction-cookbook-overview.png" alt="Overview diagram" width="1351" height="348" data-path="cookbooks/pre_parsed_value_extraction_cookbook/overview.png" />

*정규식은 문서에서 후보 값을 찾으며, TypeSafe가 하나를 선택하면, 하류 코드에서 이를 정규화하고 그에 따라 동작합니다.*

## 설정

```bash
pip install ipython phonenumbers "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

그런 다음 `TYPESAFE_API_KEY`를 설정합니다.

```python
import os
import re
from decimal import Decimal
from pathlib import Path

import phonenumbers
from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from typesafe_sdk import Choice, Noul, TypeSafeClient

TYPESAFE_MODEL = "jev-1.12"
NONE = "none"  # the escape hatch on every selection: "none of the candidates fits"

# base_url defaults to https://api.typesafe.ai/ ; the env override points at another deployment.
ts = TypeSafeClient(
    api_key=os.environ.get(
        "TYPESAFE_API_KEY", "cache-only"
    ),  # cached re-renders need no key
    base_url=os.environ.get("TYPESAFE_BASE_URL"),
    timeout=30.0,
)
json_cache = JsonCache(Path("json_cache.json"))
```

## 도우미

`find`은 과잉 검색을 위해 조정된 정규식을 실행하고 중복을 제거합니다. `pick`은 `find`이 반환하는 범위를 옵션으로 하는 `Choice` 질문이며, 그 답변은 해당 범위 중 하나를 정확히 복사한 것이거나, 후보가 적합하지 않을 경우 `none`입니다. `classify`은 고정된 라벨 집합에 대한 `Choice` 질문으로, 여기서는 통화와 국가에 사용됩니다.
`is_true`은 `Noul`로, 여기서는 금액이 크레딧인지 여부를 묻는 데 사용됩니다.

모든 호출은 `json_cache.json`에 캐시되므로 다시 렌더링해도 API 호출이 발생하지 않습니다.

```python
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\(?\+?\d[\d\s()\-.]{6,}\d")
MONEY_RE = re.compile(r"[$€£¥]\s?\d[\d,]*(?:\.\d{2})?")


def find(pattern: re.Pattern, text: str) -> list[str]:
    """Code-side candidate finder: recall-tuned regex, deduped, in document order."""
    seen: set[str] = set()
    out: list[str] = []
    for match in pattern.findall(text):
        span = match.strip()
        if span and span not in seen:
            seen.add(span)
            out.append(span)
    return out


@json_cache
def pick(document: str, candidates: list[str], question: str) -> dict:
    """TypeSafe selects which found span plays the role. Returns {choice, confidence}.

    The options ARE the candidate spans, so ``choice`` is a verbatim copy of one of them (or the
    ``none`` hatch) - the model chooses, code owns the string."""
    criteria = {c: None for c in candidates} | {
        NONE: "None of these is the requested value."
    }
    answer = ts.system_one(
        state=document,
        questions={"pick": Choice(instructions=question, criteria=criteria)},
        model=TYPESAFE_MODEL,
    ).answers["pick"]
    return {"choice": answer.choice, "confidence": answer.confidence}


@json_cache
def classify(document: str, question: str, options: list[str]) -> dict:
    """A small Choice over a fixed label set (currency, country, ...). Returns {choice, confidence}."""
    answer = ts.system_one(
        state=document,
        questions={
            "q": Choice(instructions=question, criteria={o: None for o in options})
        },
        model=TYPESAFE_MODEL,
    ).answers["q"]
    return {"choice": answer.choice, "confidence": answer.confidence}


@json_cache
def is_true(document: str, question: str) -> float:
    """A yes/no Noul. Returns P(yes)."""
    return (
        ts.system_one(
            state=document,
            questions={"q": Noul(instructions=question)},
            model=TYPESAFE_MODEL,
        )
        .answers["q"]
        .noul
    )
```

## 이메일: 역할에 따라 올바른 주소 선택

헤더에 네 개의 주소가 있음. 본문에서는 `To:` 청구 별명 대신 개인 주소로 영수증을 보내달라고 요청하므로, 답은 본문을 읽는지에 따라 달라짐. 여기 두 가지 질문이 있음: 영수증을 받을 주소는 어디이고, 메시지를 보낸 주소는 어디인가.

```python
EMAIL_DOC = """From: Dana Whit <dana.whit@acme-corp.com>
To: billing@acme-corp.com
Cc: orders@acme-corp.com
Reply-To: dana.personal@gmail.com

Hi team - please don't use the billing alias for this one. Send my receipt to my
personal address instead. Thanks, Dana."""

emails = find(EMAIL_RE, EMAIL_DOC)
receipt = pick(
    EMAIL_DOC, emails, "Which email address does the sender want their receipt sent to?"
)
sender = pick(
    EMAIL_DOC, emails, "Which email address did this message come from (the From line)?"
)

print("candidates :", emails)
# code copies the picked value verbatim and normalizes (lowercase); it never re-types it
print(
    f"receipt -> : {receipt['choice'].lower():<28} (conf {receipt['confidence']:.2f})"
)
print(f"sender  -> : {sender['choice'].lower():<28} (conf {sender['confidence']:.2f})")
```

```
candidates : ['dana.whit@acme-corp.com', 'billing@acme-corp.com', 'orders@acme-corp.com', 'dana.personal@gmail.com']
receipt -> : dana.personal@gmail.com      (conf 0.98)
sender  -> : dana.whit@acme-corp.com      (conf 1.00)
```

`receipt`는 `Reply-To:` 행의 개인 Gmail 주소이며, 본문에서 요구하는 것이 바로 그것입니다. `sender`는 `From` 행의 주소입니다. 둘 다 정규식 매칭의 복사본이며, 코드에서 소문자로 변환되었습니다.

## 전화: 모바일을 선택하고 E.164로 정규화

 country 코드가 없는 세 숫자. TypeSafe는 모바일 번호를 선택하고
텍스트에서 국가를 읽습니다; `phonenumbers`은 이 두 답변을 E.164로 결합하며,
이는 `+`과 국가 코드로 시작하는 국제 형식입니다.

```python
PHONE_DOC = """Reach our San Francisco office at these numbers: main desk (415) 555-0199,
billing fax (415) 555-0142, and my direct cell (415) 555-0177. Call the cell if it's urgent."""

phones = find(PHONE_RE, PHONE_DOC)
mobile = pick(PHONE_DOC, phones, "Which of these is the direct mobile / cell number?")
region = classify(
    PHONE_DOC,
    "In what country is this office located?",
    ["US", "GB", "DE", "FR", "CA", "AU"],
)

# code copies the picked value and normalizes it with the model-supplied country
parsed = phonenumbers.parse(mobile["choice"], region["choice"])
e164 = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)

print("candidates :", phones)
print(f"mobile  -> : {mobile['choice']}  (conf {mobile['confidence']:.2f})")
print(f"country -> : {region['choice']}  (conf {region['confidence']:.2f})")
print(f"E.164   -> : {e164}")
```

```
candidates : ['(415) 555-0199', '(415) 555-0142', '(415) 555-0177']
mobile  -> : (415) 555-0177  (conf 1.00)
country -> : US  (conf 0.90)
E.164   -> : +14155550177
```

숫자 자체에는 어느 번호가 모바일인지, 어느 국가에 속하는지가 명시되어 있지 않습니다. 그 숫자들을 둘러싼 단어가 그 정보를 담고 있습니다. TypeSafe는 이러한 단어들을 읽어내고, `phonenumbers`는 선택된 번호를 `+14155550177` 형식으로 출력합니다.

## Money: 금액 선택, 통화 분류, 신용과 직불 구분

총 4개의 금액이 기재된 청구서입니다. TypeSafe는 총 지급액과 크레딧을 선택하고, 통화를 판별하며, 선택된 각 금액을 차변 또는 크레딧으로 표시합니다. 코드는 선택된 각 문자열을 복사하여 `Decimal`로 구문 분석합니다.

```python
MONEY_DOC = """Invoice INV-2087.
Subtotal: $1,200.00
Sales tax: $115.50
Total due: $1,315.50
A $50.00 courtesy credit from last month has already been applied."""

amounts = find(MONEY_RE, MONEY_DOC)
currency = classify(
    MONEY_DOC,
    "What currency are these amounts in?",
    ["USD", "EUR", "GBP", "JPY", "CAD"],
)
total = pick(MONEY_DOC, amounts, "Which amount is the total the customer must pay?")
credit = pick(
    MONEY_DOC, amounts, "Which amount is the courtesy credit that was applied?"
)


def to_decimal(value: str) -> Decimal:
    """Copy the picked value and parse the number in code (US grouping/decimal here)."""
    return Decimal(re.sub(r"[^\d.]", "", value))


for label, chosen in [("total due", total), ("credit", credit)]:
    is_credit = is_true(
        MONEY_DOC,
        f"Is the amount {chosen['choice']} a credit or refund to the customer, not a charge?",
    )
    kind = "credit" if is_credit > 0.5 else "charge"
    print(
        f"{label:<10}: {chosen['choice']:<10} -> {to_decimal(chosen['choice'])} {currency['choice']} "
        f"({kind}, P(credit)={is_credit:.2f})"
    )
print("\ncandidates :", amounts)
```

```
total due : $1,315.50  -> 1315.50 USD (charge, P(credit)=0.01)
credit    : $50.00     -> 50.00 USD (credit, P(credit)=0.99)

candidates : ['$1,200.00', '$115.50', '$1,315.50', '$50.00']
```

총 지급액은 1,315.00달러, 신용금액은 50.00달러이며, 둘 다 USD입니다. 신용-차변
`Noul`은 총액에 대해 0.01, 신용금액에 대해 0.99로 응답하므로, 코드는 구문 분석한 각 `Decimal`의
부호를 알 수 있습니다.

> `to_decimal`는 쉼표를 천 단위 구분자로, 점을 소수점으로 간주합니다. 이는 `$1,315.50`에 해당하지만, `€1.315,50`에서는 그 반대입니다. 문서에서 어떤 규약을 사용하는지 묻는 `Noul` 질문을 하고, 코드에서 그에 따라 분기하세요.

## TypeSafe 플레이그라운드에서 열기

브라우저에서 이메일 스레드를 열되, 영수증 질문과 정규식이 옵션 중에서 찾은 네 가지 주소가 포함된 공유 링크

```python
receipt_criteria = {e: None for e in emails} | {
    NONE: "None of these is the requested value."
}
playground_link = make_playground_link(
    EMAIL_DOC,
    {
        "receipt": Choice(
            instructions="Which email address does the sender want their receipt sent to?",
            criteria=receipt_criteria,
        )
    },
    models=[TYPESAFE_MODEL],
)
display(
    Markdown(
        f"🔗 [Open this thread + selection in the TypeSafe playground]({playground_link})"
    )
)
```

[TypeSafe 플레이그라운드에서 이 스레드 + 선택 항목 열기 →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIAYgE4RwEAiAhktfgOoAWAlivgDxi3UB0A7qxQABalEQBaKBBIAHXtLgA+ADpI0EAgCMWAG10skAc1HiEUmfMVqAwlAIywCEgGdTk6XIXk1AJQSyugCeEhoE3HS8ss4uEHS6wkZw1HrecGpqABIs+CgI1HD4EviB+S4I+JBIAOTsMOW5TBU6+oZG+NQG1C74AGYyjSw9cQi8+ADKyGD4cEH4JAhQCCyy7CgQM0Fq0a5xnR1gYAsuPYYuedRgY2hMtADWLgA0+DSRIM8gsmRwqy4Y2HhCMAVCAFksVigQQRgSAUEFolD8CCoEwICwliDnsiSGxnCxqIiYRE+II2O5zJ4rD5AUgYPosSAWgZjOSLF5rDS6boGY4YqzKWlEbT6UjwDwojE9gkkildILOSKQUgRoiQQA5Eb4CC9RoIBpDXXzBAARxgery0wAbp0zbwQQBfBlnFAkGBQFAsOIuVUgZjopj4BDJPQHI56nqQPWG8pIJwkfD8WhrJoseNg5arfAxtYQAD8Dvt70I1FkLAAajFPUhASBLQBGIsgcq6RYWgCyECcuhcgIA2iAAFYIS0SOu8OsAJhAAF17UA)

## 두 가지 한계

* A `Choice` 질문은 최대 255개의 옵션을 허용합니다. 이보다 많은 후보가 있을 경우, 두 단계로 좁혀나가세요: 먼저 섹션을 선택한 후, 그 안의 범위를 선택합니다.
* 후보를 찾는 부분이 작업을 필요로 합니다. 이메일, 전화번호, 금액은 이를 포괄하는 정규식이 있지만, 이름은 그렇지 않으므로 후보는 이미 존재하는 명단이나 이를 제안하는 NER 또는 LLM에서 제공되어야 합니다. TypeSafe는 그런 다음 질문에서 요구하는 항목을 선택합니다.