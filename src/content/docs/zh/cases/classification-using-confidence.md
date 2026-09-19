---
title: "基于置信度的分类"
description: "将 SEC 年度报告分类到 75 个行业组中，每个报告对应一个 Choice，然后读取该答案自身的置信度，以决定是报告该行业组还是其上级更广泛的部门。"
section: cases
order: 130
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/classification_using_confidence"
translatedFrom: en
---

每家向美国证券交易委员会（SEC）提交年度报告的公司，都会在其中描述自身的业务。我们将这些描述归类到标准行业分类（Standard Industrial Classification）下：每个文档对应一个 `Choice` 问题，涵盖 75 个行业组。

大多数申报文件很容易处理。一家区域性银行就是一家区域性银行。但有些则不然：例如，一家公司刚刚出售了其两个业务部门中的一个，或者一家初创公司描述的是其计划进入的业务，而非其实际运营的业务。模型无论如何都必须选择一个组，且困难案例的答案在形式上与简单案例的答案并无二致。区分困难案例与简单案例通常是成本所在：需要第二个模型、额外的调用或人工审核。

`Choice` 本身已提供线索。除了返回获胜选项外，它还返回 `confidence`（置信度）：当几乎所有概率都集中在一个选项上时，置信度高；当概率分散在多个选项上时，置信度低。这单一数值将你可信赖的答案与不可信赖的答案区分开来。

如何处理不可信赖的答案取决于你的标签体系。标准行业分类（SIC）标签具有层级结构：行业组向上汇总为更广泛的部门（divisions）。这使得一种响应几乎零成本。当模型对行业组不确定时，报告其所属的部门。由于宽泛标签是从狭窄标签推导出来的，因此无需进行第二次调用。

在 60 份申报文件中，0.9 的置信度阈值将其分为两半。置信度高的那一半正确率为 90%；另一半的正确率为 40%。若将标签上报一级，那 40% 的正确率便提升至 70%。最终我们得到一个 `classify()` 函数，它返回一个标签及其具体程度，且每个文档仅需一次请求。

<!-- mermaid 流程图已转为等价表格（本站不加载图表渲染库） -->

*流程方向：LR*

| 节点 | 说明 | 所属分组 |
| :--- | :--- | :--- |
| `doc` | Item 1 'Business' / from one 10-K | — |
| `request` | one request | one request |
| `q` | Choice / 75 industry groups | one request |
| `sure` | confidence / ≥ 0.9? | — |
| `grp` | report the industry group / e.g. 28 | — |
| `div` | report its division / e.g. manufacturing | — |

| 从 | 条件 | 到 |
| :--- | :--- | :--- |
| `doc` | — | `request` |
| `sure` | yes | `grp` |
| `sure` | no | `div` |


## 设置

```bash
pip install ipython matplotlib "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

然后设置 `TYPESAFE_API_KEY`。每次 API 调用都会缓存到 `json_cache.json` 中，该文件随 cookbook 一起提供，因此重新渲染时会回放已发布的数值，而不会调用 API。删除该文件即可重新实时运行所有内容。

上述数值来自 2026-08-12 的 `jev-1.12`。

```python
import json
from collections import defaultdict
from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from typesafe_sdk import Choice, TypeSafeClient

matplotlib.use("Agg")  # headless render

import os  # noqa: E402

TYPESAFE_MODEL = "jev-1.12"
CONFIDENT = 0.9  # above this the group is reported; below it, the division

client = TypeSafeClient(
    api_key=os.environ.get(
        "TYPESAFE_API_KEY", "cache-only"
    ),  # keyless kernels replay the cache
    base_url=os.environ.get("TYPESAFE_ENDPOINT"),
    timeout=120.0,
)
json_cache = JsonCache(Path("json_cache.json"))
```

## 构建分类法的两个层级

`sic_codes.tsv` 是美国证券交易委员会（SEC）发布的行业列表，供申报方从中选择自己的代码，获取日期为 2026-08-10：包含 444 个四位代码，每个代码对应一个行业标题。这些数字构成一个层级结构。前两位数字代表**主要组**（此处共有 75 个，从 `01` 农业生产到 `99` 不可分类），而主要组的固定范围则构成了十个**部门**，这是 SIC 分类中最广泛的划分。

这两个层级均源自该单一文件，无需借助模型：按代码的前两位数字进行分组，然后将这些数字映射到相应的部门。

```python
DIVISIONS = [
    (1, 9, "agriculture, forestry and fishing"),
    (10, 14, "mining"),
    (15, 17, "construction"),
    (20, 39, "manufacturing"),
    (40, 49, "transportation, communications and utilities"),
    (50, 51, "wholesale trade"),
    (52, 59, "retail trade"),
    (60, 67, "finance, insurance and real estate"),
    (70, 89, "services"),
    (91, 99, "public administration"),
]

INDUSTRIES: dict[str, str] = {}
for line in Path("sic_codes.tsv").read_text().splitlines()[1:]:
    code, _office, title = line.split("\t")
    INDUSTRIES[code] = title.lower()

GROUPS: dict[str, list[str]] = defaultdict(list)
for code in sorted(INDUSTRIES):
    GROUPS[code[:2]].append(code)


def division(group: str) -> str:
    number = int(group)
    return next(name for low, high, name in DIVISIONS if low <= number <= high)


print(
    f"{len(INDUSTRIES)} industries -> {len(GROUPS)} major groups -> {len(DIVISIONS)} divisions"
)
print(
    f"  group 35 = {division('35')} / {', '.join(INDUSTRIES[c] for c in GROUPS['35'][:3])} ..."
)
```

```
444 industries -> 75 major groups -> 10 divisions
  group 35 = manufacturing / engines & turbines, farm machinery & equipment, lawn & garden tractors & home lawn & gardens equip ...
```

Choice 问题需要描述每个选项，但组自身的名称并不总是存在：在 SEC 列表中，75 个中有 42 个带有伞形标题，其余则没有。因此，每个组由其内部的行业描述，这也是阅读该备案文件的人所匹配的内容。

```python
MAX_NAMED = (
    8  # industries listed per group; enough to characterise it without a wall of text
)


def describe(group: str) -> str:
    umbrella = INDUSTRIES.get(f"{group}00")
    inside = [INDUSTRIES[c] for c in GROUPS[group] if c != f"{group}00"][:MAX_NAMED]
    listed = "; ".join(inside)
    return (
        f"{umbrella} — includes: {listed}"
        if umbrella and listed
        else (umbrella or listed)
    )


print(f"group 20: {describe('20')[:150]}")
print(f"\ngroup 65: {describe('65')[:150]}")
```

```
group 20: food and kindred products — includes: meat packing plants; sausages & other prepared meat products; poultry slaughtering and processing; dairy product

group 65: real estate — includes: real estate operators (no developers) & lessors; operators of nonresidential buildings; operators of apartment buildings; less
```

## 备案文件

`filings.jsonl` 包含 60 份年度报告（10-K 表），每份报告均截取自第 1 项“业务”部分。该部分由公司对自身业务进行描述，也是行业代码所关注的唯一内容。这些文件的时间跨度为 1993 年至 2024 年，字数在 700 到 2,200 字之间。每份文件都包含其提交者选择的 SIC 代码，以及用于在 EDGAR 系统中查询的 accession number（ accession 编号）。

在考虑任何准确率数值之前，这些标签的来源至关重要。这些标签是自我报告的：由准备备案文件的人员一次性选定，当公司出售该代码所代表的业务并保留该代码时，该标签便会过时。这 60 份文件经过筛选，仅保留那些其文本内容支持其所携带代码的备案文件，因此此处展示的数值衡量的是 recipe 的效果，而非 EDGAR 元数据的现状。

```python
FILINGS = [json.loads(line) for line in Path("filings.jsonl").read_text().splitlines()]
example = FILINGS[7]
print(
    f"{len(FILINGS)} filings, {sum(f['words'] for f in FILINGS) // len(FILINGS)} words on average"
)
print(f"\n{example['id']} (filed {example['year']}, accession {example['accession']}):")
print(f"  {example['text'][:230]}...")
print(f"  filer's code: {example['sic']} {INDUSTRIES[example['sic']]}")
```

```
60 filings, 1438 words on average

1389870_2008 (filed 2008, accession 0001079974-09-000155):
  Item 1. DESCRIPTION OF BUSINESS. NARRATIVE DESCRIPTION OF THE BUSINESS Across America Financial Services, Inc. is a corporation which was formed under the laws of the State of Colorado on December 1, 2005. Until March 23, 2007, we...
  filer's code: 6163 loan brokers
```

## 提出一个 Choice 问题，并读取置信度

一个 `Choice` 问题，其选项为 75 个组。整个分类法可以包含在单个请求中：Choice 在大约 240 个选项内都能可靠工作，而 75 远在此范围内。

返回的答案包含 `choice`（获胜的组）、`probabilities`（75 个选项各自的权重）以及 `confidence`，它表示该分布的集中程度。配方中读取的是 `confidence` 而非获胜者自身的概率。获胜者概率为 0.45 且亚军为 0.44 的情况，与获胜者概率为 0.45 但其余权重分散得很开的情况，是两种不同的情形，而 `confidence` 正是区分它们的关键。

```python
QUESTION = (
    "Which broad industry does this company operate in? Judge the company's own operations "
    "as this filing describes them."
)


def questions() -> dict:
    return {
        "group": Choice(
            instructions=QUESTION,
            criteria={group: describe(group) for group in sorted(GROUPS)},
        )
    }


@json_cache
def ask(filing_id: str, text: str) -> dict:
    response = client.system_one(
        state=text, questions=questions(), model=TYPESAFE_MODEL
    )
    answer = response.answers["group"]
    return {
        "group": answer.choice,
        "confidence": answer.confidence,
        "probabilities": dict(answer.probabilities),
    }
```

## 确定时返回组，不确定时返回其所属部门

以下四行代码是完整的配方。当置信度达到 0.9 或以上时，答案以行业组（industry group）的形式报告；低于该阈值时，同一答案则以其所属的部门（division）形式报告。

每一份文件都会返回一个可用的标签。对于模型无法自信分类的情况，答案会向上返回一级，而不是被丢弃或继续传递。如果您的应用需要更细粒度的数据才能采取行动，而部门层级过于粗略，则在此分支处将其转交给人工处理。

```python
def classify(filing: dict) -> dict:
    answer = ask(filing["id"], filing["text"])
    sure = answer["confidence"] >= CONFIDENT
    return {
        "level": "group" if sure else "division",
        "label": answer["group"] if sure else division(answer["group"]),
        "confidence": answer["confidence"],
        "group": answer["group"],
    }


def show(filing: dict) -> None:
    result = classify(filing)
    named = describe(result["group"]).split(" — ")[0][:46]
    print(
        f"  {filing['id']:>13}  conf {result['confidence']:.2f}  -> {result['level']:<8} "
        f"{result['label']:<14} (group {result['group']}: {named})"
    )


print("three filings the model was sure about:")
for f in sorted(FILINGS, key=lambda f: -ask(f["id"], f["text"])["confidence"])[:3]:
    show(f)
print("\nthree it was not:")
for f in sorted(FILINGS, key=lambda f: ask(f["id"], f["text"])["confidence"])[:3]:
    show(f)
```

```
three filings the model was sure about:
    310158_1996  conf 1.00  -> group    28             (group 28: chemicals & allied products)
     33416_1998  conf 1.00  -> group    63             (group 63: life insurance; accident & health insurance; h)
    352541_1996  conf 1.00  -> group    49             (group 49: electric, gas & sanitary services)

three it was not:
   1372167_2013  conf 0.22  -> division manufacturing  (group 38: search, detection, navagation, guidance, aeron)
   1398633_2009  conf 0.23  -> division wholesale trade (group 50: wholesale-durable goods)
     46653_1999  conf 0.29  -> division services       (group 87: services-engineering, accounting, research, ma)
```

置信度与每个文件分类的难度相匹配。置信度为 1.00 的三个文件分别来自一家制药公司、一家人寿保险公司和一家公用事业公司；尽管这三者在名义上都是控股公司，但每家公司都有一个在文件中明确指出的主导业务。底部的三个文件分类难度较大，原因可在文本中找到。其中两家是处于开发阶段的公司，描述的是它们打算开展的业务（Nevaeh “打算作为软件开发商运营”，Barricode “成立旨在进入计算机安全软件行业”），第三家公司在提交文件前几周出售了其两个业务部门中的一个。这三个文件最终被归类为部门（division），而非集团（group）。

`classify()` 是整个配方（recipe）。将 `ask()` 指向你自己的文档，并根据你自己的分类体系重写 `describe()`，其余部分即可沿用。

## 更广泛的答案带来的价值

针对所有 60 份文件，根据每个提交者选择的代码，在两种策略下进行评分：每次都命名一个集团（group），或者当置信度低于 0.9 时报告部门（division）。

```python
def correct(filing: dict, result: dict) -> bool:
    gold_group = filing["sic"][:2]
    if result["level"] == "group":
        return result["label"] == gold_group
    return result["label"] == division(gold_group)


results = [(f, classify(f)) for f in FILINGS]
sure = [(f, r) for f, r in results if r["level"] == "group"]
unsure = [(f, r) for f, r in results if r["level"] == "division"]

forced = sum(r["group"] == f["sic"][:2] for f, r in results)
broadened = sum(correct(f, r) for f, r in results)

print(f"forced to name a group every time      {forced}/{len(results)} right")
print(
    f"  of those, the {len(sure)} it was sure about  "
    f"{sum(r['group'] == f['sic'][:2] for f, r in sure)}/{len(sure)} right"
)
print(
    f"  and the {len(unsure)} it was not           "
    f"{sum(r['group'] == f['sic'][:2] for f, r in unsure)}/{len(unsure)} right"
)
print(
    f"\nletting it answer coarsely when unsure  {broadened}/{len(results)} useful answers"
)
```

```
forced to name a group every time      39/60 right
  of those, the 30 it was sure about  27/30 right
  and the 30 it was not           12/30 right

letting it answer coarsely when unsure  48/60 useful answers
```

当模型确信时，其命名的组别在十分之九的情况下是正确的。当模型不确定时，命名组别的正确率低于错误率，仅为 40%。将这些相同的答案报告为除法操作，则正确率提升至 70%。

该图表将两种策略并列展示，并根据模型是否确信进行划分。

```python
labels = ["sure\n(group reported)", "unsure\n(division reported)"]
forced_split = [
    sum(r["group"] == f["sic"][:2] for f, r in sure) / len(sure),
    sum(r["group"] == f["sic"][:2] for f, r in unsure) / len(unsure),
]
broad_split = [
    sum(correct(f, r) for f, r in sure) / len(sure),
    sum(correct(f, r) for f, r in unsure) / len(unsure),
]

fig, ax = plt.subplots(figsize=(7, 3.6))
x = range(len(labels))
ax.bar(
    [i - 0.19 for i in x],
    forced_split,
    0.38,
    label="always name a group",
    color="#c8ccd4",
)
ax.bar(
    [i + 0.19 for i in x],
    broad_split,
    0.38,
    label="answer broadly when unsure",
    color="#3b6ea5",
)
for i, (a, b) in enumerate(zip(forced_split, broad_split)):
    ax.text(i - 0.19, a + 0.02, f"{a:.0%}", ha="center", fontsize=9)
    ax.text(i + 0.19, b + 0.02, f"{b:.0%}", ha="center", fontsize=9)
ax.set_xticks(list(x))
ax.set_xticklabels(
    [f"{lab}\nn={n}" for lab, n in zip(labels, [len(sure), len(unsure)])]
)
ax.set_ylabel("labels that are right")
ax.set_ylim(0, 1.12)
ax.set_title("Where the broader answer helps: the filings it was unsure about")
ax.legend(frameon=False, loc="upper right")
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
display(fig)
```

<img src="/img/cases/classification-using-confidence-classification_using_confidence.executed.1.png" alt="output" width="1034" height="523" data-path="cookbooks/classification_using_confidence/classification_using_confidence.executed.1.png" />

## 在 playground 中打开

此分享链接包含一个归档文件和一道 75 个选项的问题，因此你可以查看其分布和产生的置信度，而无需编写任何代码。

```python
playground_link = make_playground_link(
    example["text"], questions(), models=[TYPESAFE_MODEL]
)
display(
    Markdown(
        f"🔗 [Open the filing + question in the TypeSafe playground]({playground_link})"
    )
)
```

在 TypeSafe 沙盒中打开备案 + 问题 →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIAkignPgIwB0+AIgKIDKAwgEpEAKaRA8gHL4eAMXwAhAKqMifJoxp8Agq1YLuANXp0mbTt36CRaABKaJUmY0b4FUAE4QAzg+uJbASygBDfELdJPSFBungA2+IwItgBuHggOADT4RIE0bs7eUBC2AA5ZnihuEEj4AO4AFh5lpZ7OAGZZiGD4MEhgkfgoZQj4IZ4lzhC1HV3hKPndg-jMECF5kPhFdAhQZABG7RSJAEwADDsArDTiqG5hALKetlBVWwDM23sA7Ikl3a+23d7lMyEAngC0EBKSAQTQcMFWDjcYGCtl+CyGzE82VItls3l8-kCwTCAHF7DBsolklAqIl6rZXH98ABrJBA4o1ax2RzOBSuDzeVgIUL4egOMakKZZbJUAAUgBwCZgKLiAXAIAJQ0HjFABSARgl3hFB2Dx2z2G3RhHygKCyA0RMrQ+GR2XsUVBiXBqwAVssUB0IAb8AharU3W57SCnAjrfgPgBzNIodEFRYlNydL0RWDuApxa2tPmYa4BcPdaZwOBpKFFRKdbq2z0x7wObJ+QG+kM2ezB9mRTk+PwBIK8iLRWIJJIpfBizHdnHhSIxFYOeUeqaW-AOMqXBBlGZtWzmsPLLJNRYXK5VTb4XZ6haM-CVsP5byrGppGiMPwrBdcQCYBM5VjAoUHnGkd16UgmlNL1K1yBxQWtE0AwTNx00mMdsV7KcBy9aUuHwI03TNLDlmhKCE2qf9inLfB1gFfA-FROJ3UmDCrQCJokJ7MI+2ndMmLfNBPyXFcPnXEJN2cUDa3rQYhhYid2LQ0CiyQNwiwAL0+JB4VyUgTl5SZMiQWoQg8OihmoyJaJoNARmXVdtyklD+xnUpTIWYEoNWeEGJedcsKjdxv2A0NTTGMJJk2AAObV4gAFkeAA2PjrPnMiGPigSN0iAZiiya1VggGB3UPa5T3uU8niVVV1U1Sgtl1fUAgWWxwwCNwlPyQpin8Rpwk8P18CMS4ctsJJEgAGWG5gyXwCkqXhOkGWtZxGG67o+tsAaxB-Pw4mcWgEHtWZskQVBhTgbIAnhSVFp6laBoVTzKio9JfVOYJ-PjRNcsG3oGtolK1zS2xElxWhRAUId7QFQ6UEHUbmESTxww+KDQMrGI2gWbJIlapBw3wLw6yCqjSJGKaQ28WY6smAASLZ9h1PYdnnTJ7UGiAMZjPwcawDGkEghxzIqZxyeKEomTAGAJnKpANThKqHm1GgjCBXbIkSH0-Rg+1BBNCB1kGigYt1UKXgrTxoQRIYyNtF83FOsIuM8KA7HFpoTI+SixYlhYYE+iA6tAy7lv6rKdr21nIeO061Lh9InDccMQRAz0A96oO9ZGsaaAUd0yIcTxEA6RSEGN71UFMl3UE9MnfcZNFczIZB3TeqoAHUfrOXLUFN4oOHcRB0-Gu7CoA7rame8Ymibr3Bp7uICNQRIzlsGgAGkQjIBwlJoVvyKyexXiaSmKFuar6cm+xyFbyj25aMY-HwHvC-7+cUYI9HMYKbHceRBNeVApn2lZu-Dm3pMDc15vzACQsHrelRsgFYTQ3IZmaDzZY3soKViLE4LI8J6RCjFGRCUfAICkAVKUCoQ9nD0hKFhcWWtTS60oAbEqOwACciQWhr2DLpZmwFM4hDCFbbEtsMzlxopRB2Tt0w31OF6IhQoAIe3qrjIoPDQT80+NkbIBkvCrDXoTMR7oYyezInI7oAEKBbAAKRXnaAEKW5AsArBRITL0ysjqdHyI5Sapswh-xUZEd0Z0rxZFjJlC2IxBFBGEVxU68IyKux+oou+5R7peEgl6G02jPC6O6EYi8sjiHdCsvwg0HxuqonIt0CgoVrFswzPYzOgS1IF3zlbLKoEyKKLAOMEMJjClwxKblKGYxWjAMiTbXkLRNwFKFHATwvw4bZ0sjMCYKI2q9JGIrISKtKnKKQKo0RnoPrKMLIsKybtvQAEcNS+M9GRIZAomJjPcEI3kecO5GS9Lgw0sE2gIPhFQLYWwaD-HwLcfAoKOCsB4BwHgjB6C0EEBwegKg9B8CsNvVcoY2ihwOg3JcYw8wnMjr8JU3s8K4vDo8ol6xGrCy6MLDRKMoLHO-L+LaV5eiZWKEQ+0cAGFsOYTFMlg0tF1RFiJSuJp5qhjgCExqNL7A0naBSE5rhWI7l5LRHp0YAi5xgkUPmggeUQD5Qwig+ozxGy8Q3Mu+jK7FAUAjBA9cjqTDOJEPMg0uIcC5SGbkWQ6XNVanGBMVQZTQrEIUe+-E5krDypyMI0wch5FCSOCNPB5RwyvO4KIPTpizHRPMTIKb2aljIaZRBxzvj8IBAyKCTooQwk1IkZsrIXDti8Mya5aQ4KLGTaKF4uUhL4FcESyeGaXhhusFCnglTgE529jEGIn8G4JlJTOyNJRh0gQZZUzI+dq2CT+ICFyYIIRNthBu8QuRihQFmL+HGZEx07NeKUHdD1wSfA9ATEKRtqlsMijFLYv1JVegzb9QSwkXGOJXNjboqrQjBXCQgNwet-2hUA8Bz9zsRFe2GU8z+5y4hlVDLUGAtbEgwhCHlVyD5BxkQg8RqD6V30Uf3MCAKxDtJDF2PECgQH4gsOw8R7cBYSXHTlcURgpooA0kzukHc4IQifM6ABXVPMHahOLtu9j+AVya28IFHj1pNH2EwIpcY1I7ijtOAZM5-EEKIggKc6TsmaQ4aglxB5IyYTYyOLer097HDAMmM+z1Oz7lPRWFuPD2FtaxcmBB3TI71gHomOSiSsRYtcXi6aLcIqlwrPNtluLaGcIA3wIvFea84AbyHXpt2cdihq39IZpZ3QCiHqGMFx96iTmrE2k0A9EmUv7jZj0qZ7QyIdW6AoJSpBCqiEKA4IIcCi5DlJIkLKDgXOGnbHmtN5YPiDH6710L4T1Pok0wa4oAEnSumlX-AJXc9kfzzNiOI0dR1ZAQxR6kMJVs-kguXcDzrXWfI9d9b1mZfUUyGAGhqTUWrabw2RD4PaPjh0mJ4GAMJ-KjyxBqx5pBIZ1HPpungAyig40nmRG0doTNkQ0-qtNiCc6OZY4loYEGuJJRcySzOs7oFkW0cgSCEwhijzXggvK+BcH4F+Agd0xZcOnU0lDQC49GYC5C2myYcyUAVK4ogToEB9xDB-Ah9pZT3vkS0+2Xkfh1ZppfDRvzON7wmkdwIkE8AijBDLBCSIsAH3D0zAETo6JMCExd21I1EGVzpBCLtnosQUFNDqlgKMYzxhHVVcz232OhgxHRGEZ3-pFhu7x8AowRA1DEj0jR5ALU8MaTXUhuJIwJSDdsE0fSMBZT4FLz+IXkaxU83nA7THqkmg4oQPtEBOfP5cXpHtUp390wePdF4YocrNZR9yuGKo96-CJo6O4UIzge1yb+I6Lo2Quh94XV0cgh+YDH69EIWgoMGemt5JWDOLzHhp4GAHmtiJ-OWG-mUASJ-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-hZiUdZuCsifZsUIE-RC5lJqMD055qk-hhkx7v1qgy6tju4JGP4GaRiUjCuCro3B+qiPJD0osEIHHbYNLFqPWXsCwlREMN4MwGHp-E4c2XRI7L6WANGYg4RBXEgnnJxVBAcxDvOFgJpLup1pEHc2mrYZ1p6AVMeG86wi4mKq+GFiMOiyGI8-QS85QDi07RA1ixS7qIKgg6XEg-aqGGnUUJnodH8tYODuHKBAi5xV6Lc12Gizqpi-VVUHWXS3i70ASyhlhPc0MDSxQJSzQMkIRcFHOW7BjCaKU3Nty-iu6pg3hjg-6ggPgwpCjusljl3HafmVE1cLPt6L6G6CCvgPsBCiAIkCABgiiA4BgNgHgIQMAAADogAIy5TZAhsEDBsgBSkYyRv4AhvXAQCxAhuJCJupiO7xvRs7AUDxshvwwUmDPewAH2Biy3b-AsjZAOCpsJsgA7BbB5sgAFseBFtl45rm7-AGQ52bMABkGYlmYQYtOIRNNbIbeojbzboe8xbbkZM4o7dboUjbFItEcI87rCS7aQFt4YiQZQ0iK+mYuqmiHM872ojbpu7tZ+n8gAKASEz3p45xAED+UjpQ2nBlW-YOAADctmq2C+XKprER57wUbsJ7DbAbIbg28x8kCJyivIfbBk8cCd8kHMX7EH8Afg0HmQsHaeCHQoR5Ux3QSH2MJ7twjbTsaMGM0YKy8A+Afb6hxbYQjUn7WE7g89n8ybYQfbjHjk-CTH7HNHTJTIo8C+TQXMhavNs7cQX7fHnHgn8EI6Eng44FJ7kUZ7l7OMfbx9cIF2zZQVKl89UAtmIIZezgYoLh5GC+s4J7+wjbH2mMYQuiYAOM5d6ICWzgoKTWbQWk9nQkHZUnE2Dd-B2yW4X7tnbbDnTnRQuqrnPZ9ISAHnHe3njn1bHrtb+sjbh9UQ8IukAozzt2Cwc5t55EPneylEoKzndRsWN71ebQDgBAIsqIjoCA7wiQdYGMBkIIiQ8B-HuQ7waeIIJX0Y2JoSJ7jwpHhqg3eXoKQ7v8RajlkXLntJ+AVXgQ7uD73o-t0Y5+26tgNI87uwS7EA5ueGNIfgYATLlYZbmuy3d7NXBAYd7oC1J3n8E+UMX7ucP4DxzgfbmN7QtocNq4vFPID3pbQ3THuQgzMsDgvQH+ZQEx+7TQgBW0yHcraG6kIP2rX7sQuMZS5AfbtQ9gKkxQNXuJr3MZCc5IBPyA3X7R0Q-ezzCYiQ9o6nUTR303Km6tX7u+5PZ8E9UMjPCA27OacQU4X2+AzoecX3Yvv7HPTJ6Id8iz7bl3yXabIAWwubYHMbOsEinoF3oPS3t7q3tXuMccq4HFyvtbQKjbpA2ApwBHdmivev13hvBA9BvsYA26gY3i9BHgtmPHnXxCVtKH9goBHvVPtR3vBnizg4OF5paMo8DCfbUIIQNIX7dICYduUfqfCkVpqIrwlwvvKenPlwFHkvzzHZe3JHGvNoq4HH+XWNhOm7CPpb244fFJkvSJpw+fhuYQTv97Rvh0Md-HOUvwDgUdk03sCky4HZQ6O3uMswnQgvfbSG8ETQjUlIDcTH26A-0fxYcQUd6NTQzoLQhQiWtGtgeftgX7W-yAMdiQlNe-nXFQQk+Bg-fbzukeo-yCm4a-ZOX7mCKw-CAIP+zqDZIKS2ua3gUAkLo8oYe3FThrxoyYV+O26I7rr21YjgzOE-BMGgjnC99buS4PoFH265coM+dmQcKF1CB-87MyAqQsPmQAupKsWiX4NQMSCJ8Ju07XkNQKUaYUmOcqQbHonXCIAweHwVvpyFeiHcEEPnSXiNm3qoBzeIbGmOlwRJ-QR05GWwNnzQRX9xB+mJQVBnH5qCsBHwRIKZ09CEhBIAoMuPKCk7RY-s+g6dggCsFd0bB6gnAsYPfTm5LBctXRD73C78cEK2uVQc4PsFXhwafaHmPfgXxRBBezdDyoOG+7WD+OAoXkqPGwBoIeBaQAAX+2g4BCDB3QPHm4BSHAcUu8gmKI21OhsxJey-dBNAOcC4C1u2QCjNkAL5g9kQ7QTPsELZg5QeKTQr9mUMiCdCqK5dLuKxj7ZyFJOeyA5O0PaB9tehq0Sik33NwmcgykXIAVuAAD0ow2cD0N6ACgPAg4eoDIj7aYd-IMw+3OXyKGq9RuGvEEP0BmFG96hXg5cKFlFTy1N2wCaYS8new9D2w5uRNHcJeGPC2Ozwh4Vu2p7URkeOUdyn8OBFPDPBBkAEcz0ESfCd47lHNGCOxiUCf2gAkENB3uFwit2nPNZiwRLZojwwf-JqPUFSxvkQKdWELgbWAReA+8cg1Xouw17XAyAvw-jpUPmFK99e1XNbqdx-Cbcnc9IJHEHVxiv5fhWwmoAUEj7DFQgjoX4KgCqBNYkAqw55qsF1iddf2FGRwOgM9DhhthmwzlNKJ95u0U8CopUUplFr8dYuUQCjKXQXzSi9swXJRjCCCCnNxR7I4OpLxygjJz8qA0no-kuBxpKGMoktv908JMc74MQSjvx2jEBgbCwQeOI4BlFCMMmM4FDoUHbL+jqhRglwoDmTE7CDOjaEZDOA8G7ZkQVGZXBFlkGdc14uYIXkXTCotdIg5GQQf7wcCm5dhe3FhKUOVz2A141HYQWpy-Y1AgxKmYISumZ72BBgwCM0WkMxGZCIiAY7cBRwHGUNceMHEIPO1vpW9yskvPwEZw6DB4mO6ohPsaKLFhliEF-ELjUEtKI0HYNIZnpBFCA4wcUaEPtmeKmEXiZRzgdcJBC-YiCW6UEL8aKlzHy5lgGIjIUAJxHbDfxDvDHsgnBCaIQk6COCbsMBqbjlwLqFAFKMvFRM84CEwMehKgDOAVxiQJTucLrKNt6xc5ODkDyxorjeRK3PvgQHqDXieQlWVwaBPlA7jQOBAENvpE8QGiagTHEScGE46GiRYhgoXk4BZSDRdEDIELoaLexDCXR4ksieBLmRoxJg9Qo8DUCggaTOeEOHdr8DO645tEb3NgfRzn7zIiJYPAPpEHhCfjHRxw6oQSMCAKENswRKttR2mFwTfu1QncZXwEkgBzBC+d9Dt0HC6JpReg-wA5E-E-A3hrJSfiCLaHhSwg23GkNFLglxSKGpfJKZ-EIFihMgyqBYIGCNEZSEiGMfjvMQoiY9A6CQ0gBFPqBTJlKQgyzJD0QDs9P4LkhvmxyGCxclaBIZwIBw6lzIZYAY9ZDjgQF+B4Ab3XcK0EqidiF8duPqWpxDBDTIgI0pRkFFPGFS3xRRZKQi2eaYlJgW0tENBzGk7i4BoUwDjGR4F6c+INsOsJ-HvBogLOVGZ5nVkSDKoOy3XHxEx3rprxRG+mJiKaBmCS9yBDJHitJKCGH07cCAHtESBAROJ3QC+ZYEgODHWg0MX7fyfAEGyfxkhdgpjgjOARIyJ6eKeeKjLhroyNuFJLGZSBxnPEJ++UwCaANEENprJbbe6SuL-5PTIAZoR0ObQp5Qto+G4DmJL025wB2ZEfbXGKiFBZSRwOUW3oNGXCsxLOVE6zhr2QAnN0wfbadoTLGG1EmZcaC2k5P44UybYkML9gdWKAyc+8VPKLotz7YCDugds-jmv087OArZ2QDyTlyG5tQ7+G0vtvOLBmtB2uOMM2ZtBlh9tfZ-stgesmjlGdnJVySmZQIUhFSHY5s2OWnJth6iFgBwgTnUDk68Vs5ls5GR4Ok7FzWSwnc0tcBjmpzfZNswmGLBy4TgJu2UssAtyFkX4fEuEVgY+PSg7iShOs+mQHgM7fc5yGMgOufmbn4pXBI2M-nnOyA4CDerE4JM128jty-I6yRPlq2HZxIfiU0dKG9zejXA8w+fRPufLKD9DM8miS4PkB-BfsZ5m3ahgKPblvIH5MYZ+T9hdlMk6BMYM0F+3XBW5dBmSYINZSY6vyGZoCyCHDMl61EeYL8+mT73g6w9kp8YF5JzGRkty4FygzPDXk9B9tYEE5XBQ3B3GXC7pxCLKPaHIScIAZck+DINAZE7wYQYwzuUPwiI5R2FPAmhYNDoUeAJC4NCocaSwTtSv2nC3VKrL4W503ZTHU2FcHRC1B3Q0wkRaOLQx2BykGipReUhLh6zJeuszaMEIRo7iWRoUl8UeCrGLZUc-gPNI1FRzxloQ3YDbJ4HhL+AqGvIBwCP1tnZJU02CUzE2PmKILMBdg0cXlE9DOdIZdrHcPGSAjAJ4uXnfjvAXYL7IdqunWQZj1aCCi4qotQbmThiVh0jyJk7eWKnyZQV5uMwSRXU2ajAIB8ZsU3MMOUR7s3xu0AcFkoDkFLVURS2qbRG04wKPALlOOf7SXDNYr8vigaPkACUBBQgvwMMeXh5j5KN+fneZYTE6Ub9+Oa8FCjuN7Ea9XQrwEIKDKT7Mw4ZRA7XHDK-b7KF8oMv7kECul6c-+G0d+Ysu+nLKsIPwdvvMSdaJwfFAndsR6BH7JKn+Z3G-s4EEX3p0wrgyADxyH4eBfgEKyqfDTWmJ0nSEJAzv5QWEUTIJNiMITiqCAp5+OP3b1NQSjCf95xBIgUPAG6BXLDlqctfKtPVrztIoOwRtnL0OVu9Bw7XBAP8BXAUY347MdETeFODB8wQN85KYKw9HapgRZOJler1CnN0sOTob2PeFIg-EiIb-RlsqrqhlASg6kUSbrOmw-EmV-E2tp3OSmZBfC7QBTgXMUUeCzVn8VwQqpCAeDcRPvOGXAuSmJD0QeYSRSiy7BhA5kJkInAhmcr6l1ahS-hWfFQzH5s4PxJFUytum1t6uhqvVEit5q1CjebQOGkuB5B2to1qq1NSEl5qTB8e0a2Hkyu1mhTFFfcnmGmtRyrYugYsGXDouaXKU1ZqEDMczJrW1gi1tiw1GyKbWggdFSKvYX8DqWlyKhaGJFR0D9UeiFOTK0eaFNa7uyTiBcujm20Y68Tzh0UK3nGt7XrJrVGaggJcGux4V9WFsPddQWLVS5vyMa5JZcH8pMrzFtbItIUFIBrwt6-XeAsfxbrx5fVH69cF+rWY-qwqBc19YUgA3b07VGMhGMiCqBTysagg3OESm-VB0wqX7cDW5VAJpI7cJOP9TOrXgxAqaWGsADhuAR4bDURfHJISrnKxICNbS4jQpwJGFgQN+dHNXiUU7LAmVuy0KQMqgCJAuOifJqGMEh4dr0wR69bm6AZlMb5cT8jdUyBZyU02oX7ddbyC46Kbe0u2e2dvM267yigKmuTWptFg+Q3AempACgqk0+8ENVqsTc4APRGywAt4yXkSvY22kBsQ2K-iyWQmMC3uwm5abZvna0xG2NaOIKEG5Vix0Q1GjFWABqHry8BIW3OGvH+Bypc64KhhaHMjVpaTYCNBIYSC0Qy8EtYW5LZlrXBCKdGmiAyPrIgnUIi6pPQrUluyF2D+ObsuKa8IEpX9BIoWpLQgPPEubsuicxYOSrIQrJEt3KnrTskYHMCC+SsvtpwMjgWcOtI2orZWD9CxwigWHV4hqnnlHRE+eWyrZv062jaK2AuM-pLzZg2wn8WqchTtqKwqKLlw2zhEVsaCJoqxncWvv+PxhXbKZ4cXbRVsZXnD9gcqpNYduW0tDBoaiupHzIe1dbwtZfZmqzGUoibw1fbM7h-kjAChP+4IVoBIuh1Hbq+CFFrvBFfDRbJeuCfDfVu5VhsYsyOvOlUPNyg9Ftj2pLVTvbCi9oZfXIIRTv+AmzyAAYwYuaQmLjLcdRWtkUWG9Gcj56dOpXozph3-A1xVHcgN+GT4EpQNBs2dVfkC0mqQ2ehU4P8EC6Yl5xO7WGauAE08Uqe3m6kBJp10hBO2BM78S5v11zi5RBKtoGFpdHW7itfAxwhY1d0gymRN9VlSpV12F1waVKfLGMI915pEdrNd9hhqD027-+ACozu7RDxwZAcRScPf7sTXa7493OrQV6vE1xa1uHulnZD0z1x7FCx2-ZMgHgjWUCU77QLZWpfW57ccWZD4k0sY4zBjFFGyfFbpb0RLmtFjC3THsKEq99gi65vZXvx0RSl+Yi3bGXvfbMSbuxe3PdfyQCD9gsamIjOXp3CV7aiyJLLvPxBEF7Txue9WRnob0A6qFk+nxDyosaNa0E5ITAfCMMXXb3QJ+pfc713236H9OBE-RXtv3gaywUQZJYaipUAVx5QdREjvo91LyKkhwk7RUl2x3asU-+7-bruNB7hqepkEtJyzGA1ST9gW59Tnsr1A9kpZ3PwE9xxj4sI9uesg892lZxBAtPGm-brv-6-sYJERa3Z-o3ke7UdOMD-TEnsBWwVKC+t2AAbYPpCOD2IiIurKPafwSd9e8Q+gZt00qxDtByveuA1H5NTQqcxqPnDkOn7K9sXAvSodPkqGK2t4dsvx0DU269w7QfBUYcAPx6lDovSiSrxigsqrhzRXkJtonAqrspVknpH4d5ABGgZhIt4qEYCBdyIJUAXzVOJIg7D5iqOP0JuE7zijwaZceI5LLWU0kE0hqCiRUVSN2cwS-EGiI5vH6BA2Nfg-yG3oggJgAlARjmFiqgDzsYoQOwSaCDs78dijZeE9D2p5i-ZhsSDIiA8U+xg90o625iiMZVyLKsB+dN7uuGoJCEUWqpE4nZpmO5H5j+G9g1iOAFrGgSdgUEERDyXbH9NP2agoqQCNNKoEJaTVmyzeVQJXeMQwCWySbpbRgF80SCCgD11DywQqCVMP9o8Na6wpAJoZWqh+EGlnj6UKsW7sHARN4M7fWzTwbwFp1Ca8IaE1uFhN+6ej8-XmiNjRLhHTk+OLLvNy0xfgnikvX3eYezq0Rw4oBDiG0ZCm1sDIPUUWsW2sqjjHYc8VRfpg+KJh2T12FYCAscCfba+z26hhJ2NHILWSMkiacYsOE1AbkBpQUy4re5oIVTPMDk8KYLgoA9Eqpzk2su1OOUT18ELE7EbaPZ6QABp18GMb54rUmlEnNo03pz1aoviKJlfW6bZr8qplsWKFU1XKFzh6J4i3jv51wjnSigiSgoKEYnpCRJZfnd+OGa+a1bw4ju9rdeRDOFEPi7bfkvk3Apx6vTPSO05LxwoPE-TqqIlUaLYLeh3T1J8s+0i6BxMamjsD5B4K5S2MYQsCWLCjoDOsZF59cCYnEC3UeHr94HLlB5jZFyZeOMiewL8FCAGldUwkHoXnjoguRuzGZ+fWkOT0clpy85o+aAXMPVmOCZiavRDA6LPMMdWS7tuafcO1tL6ig99YOBnHyQcYjhzrnnCrY0asaswRzmMkYOxa+RRvdcI+ZsMQamRjwEEwpzl2TG51AW84Y8GZMhsoLDJgJL2kFXIWwCqFx9NaA+xrYmOUF7LuAex7HHDEjNEldjH978JK8jIXCzLygu2HmjO4KaeWhCN2xqC3XYCxAFg2P5fgC0jjf8DyzmkZEKFkldhZk1QWsyByyOc5rnJpnfOrmgcMlqkN7HoO220i29s2U8hH0fF20v8DUs7gNL9Eh8BRYtPwWXToJ-i63pczEJaKTFxRY1w40AyduwCCTchYH34ECYRl7C1CtzTpRhzd5ifUhds1KXFxnB5wB8FOhxN518F4gxZd0spb1kdYE0Ggn46kKOgLQoicpoUszh-gXI+cAlcWBJWmtzF8zdlbiDFa00RVlKyQoIh3IMrgOXTfkdKvIXJdicP+YlcMgpWGrvkJqzpcUsFXigVVnAuWCqL4XgraV-A7kj2rbj4LLBoK5ZbgBW4ft1FW3AeuROuXgrLnRi9VwXQucPMTRUJH1Zyu7Glx6QRa5BGWvGhVr5x+i9Ay3AVBGhPanLS5KOP4maMkIedqvUbZQXD6KmKoIeqL1G8oLWWBKXPzPykSQwkAaLgbmOPuighUFqWFuGSnlCpjX8HAqrTDVjCoLDgE7lRecLexsLDIkNfirapjX+LH2n+IXzKsOB-g7OiU4qu9iRhqGFNvaS0aOvlX6bYQXoJMvyx0XgrLW364mCJvU32bNNxPYLfg1qsV+1Nlo59Y6NxXFLQ9LxXBZV6hRILwV0ENiR8ODsVbtbUKIhYVs5XdsxOda4DYIAEXgVcrLLqgd1shtQogVw2xzbuuPDGhZrJAvHk+ujnHbNNoxSCHbAmXteLSxIHVSsXmlcKcLDa-xd9v0DyNtm0W8dsLBEiBEZQEfufhGFZiuL5+EO9cHjukk7c3N-xTjvoszKz1R0cS8FdLOl2d8YBnqQIbjvU3udoa0m1iRQnsXK7cLaK6rditQswBRPRmrI0qjGhUMPrQCb9maxMkAqagmVecMwzfXgrCnWW+cIvqNtXY6hJitaF9CKKmRLCOayAFi6Ah-O5Mx5NKo34hsAAvirzyW5d86jbZuOQiqCu8myH86MPCEgBb5hSBJ5pAdZPMAB+fACqDxxEoyIn934IPzmgHWeCCm4UtLmAQ1c7Apm9+2QCoDn2z7KXJtnWDUDpQ2oAbEAFEAoBoPIIG3UEO3DaAp4A2AAbRACugog-wagBYhAAABdM+0AA)
