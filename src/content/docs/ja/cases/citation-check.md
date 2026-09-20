---
title: "引用の再確認"
description: "ソース文書と照合して、誤った引用や幻覚的な引用を検出します。1つのTypeSafe Choiceの質問により、引用の文脈が主張を支持しているかどうかを判断し、その信頼度によって引用を人間のレビュー対象としてフラグを設定できます。"
section: cases
order: 120
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/citation_check"
translatedFrom: en
---
LLMが質問に回答し、出典を付与する。各主張に対して、ソース文書の該当セクションと、その根拠となる引用文が示される。これらの出典の中には誤りや幻覚が含まれる場合がある。引用文が文書に全く存在しない場合や、文字通り文書に含まれているものの、その文脈が主張と正反対であることを示している場合などである。

手で一つずつ確認するのは遅い：文書を見つけ、その中の引用を見つけ、主張を裏付けるかどうかを判断するのに十分な文脈を読む必要がある。

そのチェックを自動化するには、まず通常の文字列マッチで欠落した引用符を探し、
次に⦇0⦇の質問を使って、各引用符の文脈を読み取り、その主張を支持しているかどうかを判断します。

<!-- mermaid flowchart converted to equivalent tables (this site loads no chart library) -->

*フロー方向：LR*

| ノード | 説明 | グループ |
| :--- | :--- | :--- |
| `cite` | 出典文書＋引用 | — |
| `match` | 引用か／出典内か？ | — |
| `fab` | 捏造をマーク | — |
| `request` | リクエスト | リクエスト |
| `q` | Choice — / セクションは主張とどう関係するか？／支持→検証済みとマーク／矛盾→矛盾ありとマーク／無関係→根拠なしとマーク | リクエスト |
| `gate` | 信頼度／≥ 0.8？ | — |
| `stand` | 判定を維持 | — |
| `review` | 人間が確認 | — |

| 元 | 条件 | 先 |
| :--- | :--- | :--- |
| `cite` | — | `match` |
| `match` | 見つかった | `request` |
| `match` | 引用なし | `request` |
| `match` | 見つからない | `fab` |
| `request` | — | `gate` |
| `gate` | — | `stand` |
| `gate` | — | `review` |


以下、RFC 7519（JSON Web Token）に関するLLMの回答から引用された8つの出典が検証される。正確な4つの出典は、すべて0.93以上の信頼度で`verified`として返された。仕掛けられた4つの失敗はすべて検出された：捏造された引用、矛盾する主張、そして人間に送られた2つの根拠のない出典。

`check_citation()`、ここで構築する関数は、ソースドキュメントと1つの引用を受け取り、4つの判断のいずれかを返します：`verified`、`unsupported`、`contradicted`、または`fabricated`。また、人間が確認すべきものをフラグで示す信頼度も返します。

## セットアップ

```bash
pip install ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

その後、`TYPESAFE_API_KEY`を設定します。すべてのAPI呼び出しは`json_cache.json`にキャッシュされ、これはクックブックに同梱されているため、リプレイを実行するとAPIを呼び出すのではなく公開済みの数値が再実行されます。すべての処理をライブで実行するには、そのファイルを削除してください。

以下の数字は`jev-1.12`より2026年8月16日付で取得したものです。

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

## ソースと引用を読み込む

ソースは [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519.html)（JSON Web Token）で、
rfc-editor.org から取得し、このクックブックの隣に `rfc7519.txt` としてコミットしました。以下のコードは
ページヘッダーとフッターを削除し、その後テキストを番号付きセクションに分割します。

`citations.json`の8つの引用は、LLMがRFCに対して生成したものです。4つは正確であり、残りの4つはチェックに失敗するように編集しました。

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

## ソース内の各引用を検出

ソースにない引用は捏造であり、それを見抜くのにモデルは必要ない。
RFCの行折り返しをまたいでも引用が一致するよう、空白と曲がり括弧を正規化し、部分文字列として検索する。一致すれば、その引用がどのセクションから来たか、そしてそのセクションが次のステップでモデルが読むテキストであることを示す。

引用では、セクションを指定するだけで、そこから何も引用しないことがある。その場合は一致する対象がないため、引用が指定するセクションに直接移動し、モデルへ進む。

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

## ソースが主張をサポートしているか確認する

この時点で引用が残っている場合、それは出典と一字一句一致していることを意味します。しかし、それだけでは不十分です。引用自体が正確でも、それに基づいた主張は間違っている可能性があります。それを判断するには、引用の文脈と、ステップ1で見つかったセクションが必要です。

生存している引用ごとに`Choice`問ずつ、節が主張と関連する3つの方法を問う。
最も確率が高い選択肢が判定となり、`AUTO_ACCEPT`（上記コードでは0.8）がそれに対して何を行うかを決定する：

* 0.8以上：判断は単独で成立します；
* 0.8未満：判断に対して何らかのアクションを起こす前に、人間が確認します。

まずは高めの設定から始め、自分のドキュメント上でモデルがどのように動作するかを見ながらしきい値を下げていく。

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

## 出典をすべて確認

すべての8つの引用が同じチェックを通過しました：

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

4件の引用が返ってきました`verified`、1件`fabricated`、1件`contradicted`、そして2件`unsupported`。

* `epoch_seconds`、`aud_reject`、`clock_skew`、`duplicate_names`が正確な4つです。
 すべてが`verified`として、0.93以上の信頼度で返ってきました。これは`AUTO_ACCEPT`を大きく上回ります。
* `sig_reporting`はモデルに到達しませんでした。その引用はRFCに含まれていないため、文字列マッチのみで`fabricated`と判断されます。
* `exp_required`は4.1.4節をそのまま引用しており、同節には「このクレームの使用はOPTIONAL（任意）です」とあるため、`contradicted`です（信頼度0.99）。
* `pii_encryption`と`iat_future`はそれぞれ0.27と0.56で`unsupported`として返ってきました。どちらも閾値を下回ったため、両方とも人間による確認に回されました。`pii_encryption`は、文字列マッチだけでは不十分である理由を示しています：その引用はソースと完全に一致していますが、その出典となった節ではそのクレームについて何も言及していません。

これを自分のデータに指すには、`rfc7519.txt`と`citations.json`を置き換えてください。
`load_source()`と`split_sections()`はRFCのレイアウト用に書かれているため、別の形状のドキュメントには独自の解析が必要です。

正規化後の文字列一致は完全一致です：切り捨てまたは軽く言い換えられた引用は `fabricated` として返されます。曖昧な引用を許容する本番システムでは、ファジーマッチングが必要です。

## プレイグラウンドで開く

リンクには、1つの引用の主張とセクション、および質問が含まれています。ブラウザで同じ呼び出しをライブ実行するには、リンクを開いてください。

```python
example = next(c for c in CITATIONS if c["id"] == "exp_required")
_, example_section = locate(SECTIONS, example)
playground_link = make_playground_link(
    {"claim": example["claim"], "section": example_section}, QUESTIONS, models=[TYPESAFE_MODEL]
)
display(Markdown(f"🔗 [Open one citation's claim + section in the TypeSafe playground]({playground_link})"))
```

[TypeSafe プレーグラウンドで1つの引用の主張とセクションを開く →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiFADYCGAlnKQaQKIBuCATgJ74BSA6mvjgwAzinzUkFGGAT5KSfFgAO1NpRTUICjYgDcc-CggBrZPgDu1FAAsIMMcUchlj0uOH4kEMc0rlqYAB0pAA0+KTCCFAaWvThIAAsgQCMgUn44U4uTvgAFIyYKmoxCmi0CACU+ADCVLSOSA0Z+GjWsq7OhR15yqrqmtrlVRQ0cOIyqNQAZtQIHjayvcUDhuX4scQKGRBsclMo7BbW1FDWhm08-PgAsgCqAMoCAHIA8gIARrKUUFAISgdgfBTHb4JRsaBzYQSADmgQyrQQTQyYIhwihSGh6ym53aWS6ORGtHwbAQAEcYKo5ud1Dj8LA2CTUPgwOoEAB6HSIzbNO6PfCffkIYEk2lLfpaZmsjlrfyiBCAiS0jrZNyEuDBTZI-AASTgSnICEQqHYHmuAEEAJqg8HMAKyYX4YQQRCOuB+cj4A0IcyUDhhEQwd1cLyCHayGzyLWUIHewQSexzMJGOQ-OxMh0UaDGR2mcxwnUoDy+cgwWS8j5fTzwT5sLVQLQoGhIGEGJ7wdgnAAirPwxdL+dukSx52oHjV7nwLwACmhtS8nmaADLBEAAXxAYRAKL1hYw2DwhBIIBJVBKcSPKA4SkRB9IpwgJxvYTvbCsHco54iMCUSh2hbipAIo6UQlI6jYHPMFzjiCYCUtE5BcLQ+qzJBNJWBOKBsKWoTxPWqBqLB0TCABIBAZE0QrKIrKQbIEA-hAUIHMOCx0nUYwgkh-hUuho5An4kQ4REvrCAA+l4NgwiRZEgSskBUuJchgGAJJokcNIseOlBouwhZhAgVhtLsPocKQq7PiAEiiFhFFaMRt4gAAEhA5jMhAVIseRoEnj2yYaWxAD8pnrpulAqAAaiaAwHiAzDJBuhCRAa0TytcEAyOQwgHgA2iAABWCDMAAtKkyQAEwgAAuquQA)