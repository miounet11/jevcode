---
title: "事前解析された値の抽出"
description: "正規表現を使用して候補となるメールアドレス、電話番号、金額を検出し、その後 TypeSafe が指定されたスパンを選択することで、コードが原文の値を正規化できるようになります。"
section: cases
order: 230
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/pre_parsed_value_extraction_cookbook"
translatedFrom: en
---
*正規表現が候補値を検出し、TypeSafeが質問で求められているものを選び、
コードはそのままコピーします。*

ここで`find`と`pick`のペアは、自分のドキュメントを指し示すことができるものであり、3つの実例がその使用法を示しています：差出人が領収書を送信したい住所、`+14155550177`としての電話番号、および課金としてフラグ付けされた請求書の合計額`1315.50 USD`です。

TypeSafeはあなたが渡したオプションの中から1つを選ぶので、候補をまず見つける必要があります。正規表現で見つけ、TypeSafeが1つ選び、コードがその選択をコピーする、という3つのステップです：

1. 正規表現でテキスト内の候補値を検出します。過検出されるようにチューニングしてください。
2. TypeSafe は、質問が求めている候補を特定し、コードが後続で必要とする属性（通貨、国、金額がクレジットか請求か）を読み取ります。
3. コードは選択された値をコピーし、正規化します。

TypeSafeは、正規表現が見つけたスパンの中からのみ選択するため、返される値はそれらのスパンのいずれかで、変更せずにコピーされたものです。値を凭空生成したり、桁を転置したりすることはできません。

<img src="/img/cases/pre-parsed-value-extraction-cookbook-overview.png" alt="Overview diagram" width="1351" height="348" data-path="cookbooks/pre_parsed_value_extraction_cookbook/overview.png" />

*正規表現は文書内で候補値を検出し、TypeSafe が1つを選択し、下流のコードがそれを正規化して処理します。*

## セットアップ

```bash
pip install ipython phonenumbers "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

その後、`TYPESAFE_API_KEY`を設定します。

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

## ヘルパー

`find`は、過剰検出に調整された正規表現を実行し、重複を除外します。`pick`は、選択肢が`find`が返すスパンである`Choice`質問であり、その回答はそれらのスパンを正確にコピーしたものか、該当する候補がない場合は`none`です。`classify`は、通貨と国に対して使用される、固定されたラベルセット上の`Choice`質問です。
`is_true`は`Noul`であり、ここでは金額がクレジットかどうかを尋ねるために使用されます。

すべての呼び出しは `json_cache.json` にキャッシュされるため、再描画時に API 呼び出しは行われません。

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

## メール: 役割に応じて適切なアドレスを選ぶ

ヘッダーには4つの住所が記載されています。本文では、`To:`の請求先エイリアスではなく個人宛の住所へ領収書を送付するよう求められているため、回答は本文の内容を確認する必要があります。ここでは2つの質問があります。領収書はどの住所へ送付するか、そしてメッセージはどの住所から送信されたか、という点です。

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

`receipt`は`Reply-To:`行にある個人用Gmailアドレスであり、本文で求められているものです；`sender`は`From`行にあるものです。これらはどちらも正規表現マッチのコピーであり、コード内で小文字に変換されています。

## 電話：モバイルを選択し、E.164 に正規化

国コードを伴わない3つの数値。TypeSafeが携帯電話を特定し、テキストから国を読み取ります；⦇0⦇はこれらの2つの回答をE.164形式に結合します。E.164は⦇1⦇と国コードで始まる国際形式です。

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

桁の数字だけでは、どの番号が携帯電話用で、どの国にあるかは分かりません。それを取り巻く言葉がそれを示します。TypeSafe はそれらの言葉を読み取り、⦇0⦇ で選ばれた番号を ⦇1⦇ の形式で整形します。

## お金：金額を選択し、通貨を分類し、クレジットとチャージを区別する

4つの金額が記載された請求書。TypeSafeは、合計未払額とクレジットを選択し、通貨を読み取り、選択された各金額を請求またはクレジットとしてフラグ付けします。コードは選択された各文字列をコピーし、それを ⦇0⦇ に解析します。

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

合計支払額は\$1,315.50、クレジットは\$50.00で、いずれもUSDです。クレジットまたは請求
`Noul`は合計に対して0.01、クレジットに対して0.99に回答するため、コードは解析する各`Decimal`の符号を把握します。

> `to_decimal`は、カンマが千の位を区切り、ドットが小数点であると仮定します。これは`$1,315.50`に当てはまりますが、`€1.315,50`ではその逆です。ドキュメントでどの表記規則が使われているかを問う`Noul`な質問を行い、コード内で分岐してください。

## TypeSafe プレイグラウンドで開く

ブラウザでメールスレッドを開く共有リンク。その receipt 質問と、正規表現がオプションとして見つけた4つのアドレスが含まれています。

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

[このスレッドと選択範囲を TypeSafe プレイグラウンドで開く →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIAYgE4RwEAiAhktfgOoAWAlivgDxi3UB0A7qxQABalEQBaKBBIAHXtLgA+ADpI0EAgCMWAG10skAc1HiEUmfMVqAwlAIywCEgGdTk6XIXk1AJQSyugCeEhoE3HS8ss4uEHS6wkZw1HrecGpqABIs+CgI1HD4EviB+S4I+JBIAOTsMOW5TBU6+oZG+NQG1C74AGYyjSw9cQi8+ADKyGD4cEH4JAhQCCyy7CgQM0Fq0a5xnR1gYAsuPYYuedRgY2hMtADWLgA0+DSRIM8gsmRwqy4Y2HhCMAVCAFksVigQQRgSAUEFolD8CCoEwICwliDnsiSGxnCxqIiYRE+II2O5zJ4rD5AUgYPosSAWgZjOSLF5rDS6boGY4YqzKWlEbT6UjwDwojE9gkkildILOSKQUgRoiQQA5Eb4CC9RoIBpDXXzBAARxgery0wAbp0zbwQQBfBlnFAkGBQFAsOIuVUgZjopj4BDJPQHI56nqQPWG8pIJwkfD8WhrJoseNg5arfAxtYQAD8Dvt70I1FkLAAajFPUhASBLQBGIsgcq6RYWgCyECcuhcgIA2iAAFYIS0SOu8OsAJhAAF17UA)

## 二つの制限

* `Choice`の質問では、オプションは最大255個までです。それ以上の候補がある場合は、2段階で絞り込みます：まずセクションを選択し、次にその中の範囲を選択します。
* 候補の特定が作業の中心です。メールアドレス、電話番号、金額には正規表現で対応できますが、名前には対応できないため、候補はすでに持っている名簿か、名前付きエンティティ認識器やLLMが提案するものから来る必要があります。TypeSafeは、その質問で求められているものを選択します。