---
title: "双重检查引用来源"
description: "通过对照源文档来捕获错误或幻觉产生的引用。一个 TypeSafe Choice 问题用于判断引文的上下文是否支持该声明，其置信度可用于标记该引用以供人工审查。"
section: cases
order: 120
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/citation_check"
translatedFrom: en
---

大语言模型（LLM）回答一个问题并附带引用：对于每个声明，引用来源文档的特定部分及其所依据的原文摘录。其中一些引用是错误的或幻觉生成的：摘录可能在文档中完全缺失，或者虽然逐字存在于文档中，但其上下文却与声明相反。

人工逐一检查效率低下：需要找到文档，在文档中找到摘录，然后阅读足够的上下文以判断其是否支持该声明。

为了自动化这一检查过程，我们首先通过普通的字符串匹配来查找缺失的摘录，然后使用 `Choice` 问题来阅读每个幸存摘录的上下文，并决定其是否支持该声明。

<!-- mermaid 流程图已转为等价表格（本站不加载图表渲染库） -->

*流程方向：LR*

| 节点 | 说明 | 所属分组 |
| :--- | :--- | :--- |
| `cite` | source document + citation | — |
| `match` | is the quote / in the source? | — |
| `fab` | mark fabricated | — |
| `request` | request | request |
| `q` | Choice — how does the / section relate to the claim? / supports → mark verified / contradicts → mark contradicted / says nothing → mark unsupported | request |
| `gate` | confidence / ≥ 0.8? | — |
| `stand` | let the verdict stand | — |
| `review` | a human confirms it | — |

| 从 | 条件 | 到 |
| :--- | :--- | :--- |
| `cite` | — | `match` |
| `match` | found | `request` |
| `match` | no quote | `request` |
| `match` | not found | `fab` |
| `request` | — | `gate` |
| `gate` | — | `stand` |
| `gate` | — | `review` |


下面展示了来自大语言模型关于 RFC 7519（JSON Web Token）回答的八个引用经过检查的过程。其中四个准确的引用以 0.93 或更高的置信度返回 `verified`（已验证）。所有四个植入的失败案例均被捕获：一个伪造的摘录、一个被反驳的声明，以及两个未获支持的引用被发送给人类进行审查。

`check_citation()` 是你在此处构建的函数，它接收一个来源文档和一个引用，并返回以下四种裁决之一：`verified`（已验证）、`unsupported`（未获支持）、`contradicted`（被反驳）或 `fabricated`（伪造）。它还返回一个置信度，用于标记需要人类查看的案例。

## Setup

```bash
pip install ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

然后设置 `TYPESAFE_API_KEY`。每次 API 调用都会缓存在 `json_cache.json` 中，该文件随 cookbook 一起提供，因此重新运行时会复现已发布的数值，而不是调用 API。删除该文件即可实时运行所有内容。

上述数值来自 2026-08-16 的 `jev-1.12`。

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

## 加载源文件和引用

源文件是 [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519.html)（JSON Web Token），
从 rfc-editor.org 获取，并与本 cookbook 一起提交为 `rfc7519.txt`。以下代码
会去除页眉和页脚，然后将文本拆分为带编号的章节。

`citations.json` 中的八个引用由 LLM 基于 RFC 编写。其中四个准确无误；我们编辑了另外四个，使其无法通过检查。

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

## 在源文本中查找每条引用

如果某条引用在源文本中不存在，则说明该引用是伪造的，无需借助模型即可发现这一点。
对空白字符和弯引号进行规范化处理，使引用能够跨 RFC 的换行符正确匹配，然后将其作为子字符串进行查找。匹配结果还会指明该引用出自哪个章节，而该章节的文本即为模型在下一步中读取的内容。

引用可以仅指明某个章节，而不包含该章节中的任何具体引文。在这种情况下，没有内容可供匹配，因此直接采用引用所指定的章节，并直接进入模型处理阶段。

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

## 验证源是否支持该主张

如果此时引用仍包含原文摘录，则说明摘录与源内容逐字匹配。但这还不够：摘录可能准确，但基于摘录构建的主张仍可能是错误的。判断这一点需要结合摘录的上下文，即步骤 1 中找到的章节内容。

针对每个幸存的引用，提出一个 `Choice` 问题，以覆盖章节与主张之间的三种关系。概率最高的选项即为裁决结果，`AUTO_ACCEPT`（在上述代码中为 0.8）决定对其采取的操作：

* 置信度达到或超过 0.8：裁决结果独立成立；
* 低于 0.8：在采取任何行动之前，需由人工确认裁决结果。

从较高的阈值开始，并根据模型在你自身文档上的表现逐步降低阈值。

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

## 检查每条引用

所有八条引用均通过同一检查：

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

四条引用返回了 `verified`（已验证），一条 `fabricated`（伪造），一条 `contradicted`（矛盾），还有两条 `unsupported`（不支持）。

* `epoch_seconds`、`aud_reject`、`clock_skew` 和 `duplicate_names` 是准确的四条。它们的置信度均达到 0.93 或更高，全部返回 `verified`，远高于 `AUTO_ACCEPT` 阈值。
* `sig_reporting` 从未到达模型。其引用的内容不在 RFC 中，因此仅凭字符串匹配就将其标记为 `fabricated`。
* `exp_required` 逐字引用了第 4.1.4 节，而该节明确指出“使用此声明是可选的（Use of this claim is OPTIONAL）”，因此判定为 `contradicted`，置信度为 0.99。
* `pii_encryption` 和 `iat_future` 分别以 0.27 和 0.56 的置信度返回 `unsupported`，均低于阈值，因此都转交给人工审核。`pii_encryption` 说明了仅靠字符串匹配是不够的：其引用内容在源文件中逐字存在，但来源章节并未提及该声明。

要将其指向您自己的数据，请替换 `rfc7519.txt` 和 `citations.json`。`load_source()` 和 `split_sections()` 是针对 RFC 的布局编写的，因此其他结构类型的文档需要自定义解析逻辑。

标准化后的字符串匹配是精确的：被截断或轻微改写的引用会返回 `fabricated`。容忍模糊引用的生产系统则需要使用模糊匹配。

## 在 playground 中打开

该链接包含一条引用的声明和章节，以及问题。打开它以在浏览器中实时运行相同的调用。

```python
example = next(c for c in CITATIONS if c["id"] == "exp_required")
_, example_section = locate(SECTIONS, example)
playground_link = make_playground_link(
    {"claim": example["claim"], "section": example_section}, QUESTIONS, models=[TYPESAFE_MODEL]
)
display(Markdown(f"🔗 [Open one citation's claim + section in the TypeSafe playground]({playground_link})"))
```

[在 TypeSafe playground 中打开某个引用的声明和章节 →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiFADYCGAlnKQaQKIBuCATgJ74BSA6mvjgwAzinzUkFGGAT5KSfFgAO1NpRTUICjYgDcc-CggBrZPgDu1FAAsIMMcUchlj0uOH4kEMc0rlqYAB0pAA0+KTCCFAaWvThIAAsgQCMgUn44U4uTvgAFIyYKmoxCmi0CACU+ADCVLSOSA0Z+GjWsq7OhR15yqrqmtrlVRQ0cOIyqNQAZtQIHjayvcUDhuX4scQKGRBsclMo7BbW1FDWhm08-PgAsgCqAMoCAHIA8gIARrKUUFAISgdgfBTHb4JRsaBzYQSADmgQyrQQTQyYIhwihSGh6ym53aWS6ORGtHwbAQAEcYKo5ud1Dj8LA2CTUPgwOoEAB6HSIzbNO6PfCffkIYEk2lLfpaZmsjlrfyiBCAiS0jrZNyEuDBTZI-AASTgSnICEQqHYHmuAEEAJqg8HMAKyYX4YQQRCOuB+cj4A0IcyUDhhEQwd1cLyCHayGzyLWUIHewQSexzMJGOQ-OxMh0UaDGR2mcxwnUoDy+cgwWS8j5fTzwT5sLVQLQoGhIGEGJ7wdgnAAirPwxdL+dukSx52oHjV7nwLwACmhtS8nmaADLBEAAXxAYRAKL1hYw2DwhBIIBJVBKcSPKA4SkRB9IpwgJxvYTvbCsHco54iMCUSh2hbipAIo6UQlI6jYHPMFzjiCYCUtE5BcLQ+qzJBNJWBOKBsKWoTxPWqBqLB0TCABIBAZE0QrKIrKQbIEA-hAUIHMOCx0nUYwgkh-hUuho5An4kQ4REvrCAA+l4NgwiRZEgSskBUuJchgGAJJokcNIseOlBouwhZhAgVhtLsPocKQq7PiAEiiFhFFaMRt4gAAEhA5jMhAVIseRoEnj2yYaWxAD8pnrpulAqAAaiaAwHiAzDJBuhCRAa0TytcEAyOQwgHgA2iAABWCDMAAtKkyQAEwgAAuquQA)
