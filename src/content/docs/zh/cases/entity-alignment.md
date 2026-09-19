---
title: "知识图谱实体对齐"
description: "从两个啤酒目录的 450 个候选对中，判断哪些对描述的是同一产品。一个 TypeSafe Score 问题承载了整个决策，因为其三个层级对应了处理一对数据的三种操作：合并、保持未链接状态，或交由人工审核者处理。无需拟合阈值，"
section: cases
order: 180
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/entity_alignment"
translatedFrom: en
---

*知识图谱中的一个关键问题是判断传入实体是否重复了现有实体，尤其是在仅有来自不同来源的自然语言作为依据的情况下。给定潜在的重复实体对，TypeSafe `Score` 将决定每对实体是否为重复项，或者是否需要人工审核员进行更仔细的检查。*

假设两个数据源描述了相同事物的重叠集合，你需要知道另一侧的哪个条目与这一侧的哪个条目是同一事物。知识图谱将这些条目称为*实体*，并保存关于每个实体的记录事实。经过一轮廉价但粗略的初步比对，两个源已被比较并选出了 450 对值得进一步审查的实体对。剩下的工作是对每对实体做出判断。

不当合并两个实体是代价更高的错误，因为关于任一实体的所有事实现在都描述了合并后的实体，且与任一实体相关联的内容也会随之合并。事后撤销这一操作需要厘清每个事实的来源。错过匹配仅会导致存在重复项，因此判断需要第三个选项：既不适合合并也不适合丢弃的实体对。

该判断是一个 `Score` 问题，针对三种结果各设一个层级：

* **不同产品** — 保持两个实体未链接状态
* **相关，但可能并非同一事物** — 交由人工审核员决定
* **同一产品** — 合并它们

我们使用 Score 问题，是因为希望将语义标签（即评分标准）直接附加到每个结果上，包括中间结果。Noul 问题可以通过对其输出设置阈值来间接实现此目的，而 Choice 问题则会丢失这三种结果之间的有序关系。

接下来，对于我们要考虑的每个实体字段，关于这些字段是否匹配的 `Noul` 问题可以随请求一同发送。如果分数既不在“同一产品”层级也不在“不同产品”层级，这些 Noul 将为审核员提供更详细的信息。

最终得到一个 `route()`，它接收一个候选实体对并返回三种结果之一，无需针对你自己的数据调整阈值。

<!-- mermaid 流程图已转为等价表格（本站不加载图表渲染库） -->

*流程方向：LR*

| 节点 | 说明 | 所属分组 |
| :--- | :--- | :--- |
| `CALL` | one request, four questions | one request, four questions |
| `S` | Score: how do the two relate? / · different product / · related, but possibly not the same / · same product | one request, four questions |
| `N` | Nouls: one per compared field / · same name? / · same brewery? / · same style? | one request, four questions |

| 从 | 条件 | 到 |
| :--- | :--- | :--- |
| `S` | — | `N` |
| `S` | — | `R` |
| `R` | different | `DROP` |
| `R` | same | `M` |
| `R` | related | `Q` |


## Setup

```bash
pip install matplotlib ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

然后设置 `TYPESAFE_API_KEY`。每次调用都会缓存到 `json_cache.json`，该文件随 cookbook 一起提供，因此重新渲染时会回放已发布的数值，而不会调用 API。删除该文件即可重新实时运行所有内容。

上述数值来自 2026-08-11 的 `jev-1.12`。

```python
import json
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from typesafe_sdk import Noul, Score, TypeSafeClient

matplotlib.use("Agg")  # headless render

TYPESAFE_MODEL = "jev-1.12"
MAX_WORKERS = 6  # small pool; the public endpoint rate-limits above roughly eight

client = TypeSafeClient(
    api_key=os.environ.get(
        "TYPESAFE_API_KEY", "cache-only"
    ),  # keyless kernels replay the cache
    base_url=os.environ.get("TYPESAFE_ENDPOINT"),
    timeout=120.0,
)
json_cache = JsonCache(Path("json_cache.json"))
```

## 加载候选对

这些对来自已发布的基准数据集，即 Magellan 集合中的啤酒数据：两个从不同网站抓取的啤酒目录，经过最初的粗略筛选后已缩减至 450 对。每个实体包含四个字段：名称（name）、酿酒厂（brewery）、风格（style）和酒精含量（alcohol content）。每对数据还包含 `known_same_as`，即基准测试提供的答案。

文本保持发布时的原始状态，未经过预处理：包括从未转换回字符的 HTML 实体、被拆分为独立单词的撇号，以及少数解码错误的字符。

每个对发送一次请求，因此你的花费取决于你接收到的对数，而不是任一源数据的大小。

```python
PAIRS = json.loads(Path("candidate_pairs.json").read_text(encoding="utf-8"))
BY_ID = {pair["id"]: pair for pair in PAIRS}

print(f"{len(PAIRS)} candidate pairs. The first one, as the model will see it:")
print(json.dumps({k: PAIRS[0][k] for k in ("entity_a", "entity_b")}, indent=2)[:420])
```

```
450 candidate pairs. The first one, as the model will see it:
{
  "entity_a": {
    "name": "C N Red Imperial Red Ale",
    "brewery": "Redwood Lodge",
    "style": "American Amber / Red Ale",
    "abv": "8.10 %"
  },
  "entity_b": {
    "name": "Kinetic Infrared Imperial Red Ale",
    "brewery": "Kinetic Brewing Company",
    "style": "American Strong Ale",
    "abv": "9.30 %"
  }
}
```

## 对每个候选对询问一个 Score 问题和三个 Noul 问题

两个实体进入同一个状态，分别作为 `entity_a` 和 `entity_b`，因此问题是关于*这对实体*，而不是单独关于其中任何一方。所有四个问题都在一个请求中完成。

下面描述的三个层级构成了整个决策过程：每个层级对应一个结果。此文件中没有任何阈值常量。你甚至可以在尚未看到任何分数之前编写这些描述，这与需要拟合的数值不同。

中间层级是值得我们仔细撰写的那个。在这里，它涵盖了变体、特别版以及可能合理地指代任一产品的名称，因此这些情况会交由策展人处理，而不是被合并或丢弃。

`OUTCOME` 命名了三个结果。合并结果被称为 `assert sameAs`，因为 `sameAs` 是记录两个实体为同一事物的标准方式，而编写一条 `sameAs` 记录正是实际执行合并的方式。

四个字段中有三个字段对应一个 Noul 问题：名称、酿酒厂和风格。酒精含量没有对应的问题，因为比较两个数字属于算术运算；如果你需要它，请在代码中计算。要在其他类型的数据上使用此方法，你需要重写 `QUESTIONS` 和 `LEVELS`。唯一知道啤酒相关信息的其他代码是用于打印结果的两个函数，它们命名了这些字段。

```python
LEVELS = [
    "They describe two different products.",
    "They describe closely related products that may or may not be the same one: "
    "a variant, a special edition, or a name that could plausibly refer to either.",
    "They describe one and the same product.",
]
OUTCOME = {0: "leave unlinked", 1: "curator queue", 2: "assert sameAs"}

QUESTIONS = {
    "link_state": Score(
        instructions="How do the two entity descriptions relate as products?",
        criteria=LEVELS,
    ),
    "same_name": Noul(
        instructions="Do the two entities state the same beer name?",
    ),
    "same_brewery": Noul(
        instructions="Are the two entities from the same brewery?",
    ),
    "same_style": Noul(
        instructions="Do the two entities describe the same beer style?",
    ),
}


@json_cache
def score(pair_id: str) -> dict:
    """One request about one candidate pair -> the score plus the three noul answers."""
    pair = BY_ID[pair_id]
    response = client.system_one(
        state={"entity_a": pair["entity_a"], "entity_b": pair["entity_b"]},
        questions=QUESTIONS,
        model=TYPESAFE_MODEL,
    )
    link = response.answers["link_state"]
    return {
        "score": link.score,
        "probabilities": link.probabilities,
        "confidence": link.confidence,
        "properties": {
            k: response.answers[k].noul for k in QUESTIONS if k != "link_state"
        },
        # tokens and requests are the durable units; don't cache a derived cost
        "input_tokens": response.usage.input_tokens or 0,
        "output_tokens": response.usage.output_tokens or 0,
    }


def route(score_value: float) -> str:
    """The whole decision rule: the nearest level names the outcome."""
    return OUTCOME[min(int(score_value + 0.5), len(LEVELS) - 1)]


def show(pair_id: str) -> None:
    pair, result = BY_ID[pair_id], score(pair_id)
    print(
        f"{pair_id}  score {result['score']:.2f}  confidence {result['confidence']:.2f}"
        f"  ->  {route(result['score'])}"
    )
    for side in ("entity_a", "entity_b"):
        e = pair[side]
        print(f"    {e['name'][:44]:<46}{e['brewery'][:30]:<32}{e['style'][:22]}")
    nouls = result["properties"]
    print(
        f"    name {nouls['same_name']:.2f}   brewery {nouls['same_brewery']:.2f}   "
        f"style {nouls['same_style']:.2f}"
    )
```

四对。`c446` 是一个产品，`c427` 是两个。另外两个位于中间层级，原因各不相同：`c100` 具有相同的名称和酿酒厂，但来源对其风格的描述不同；而 `c428` 则将一款啤酒与其水果和啤酒花变体配对。

```python
for pair_id in ("c446", "c427", "c100", "c428"):
    show(pair_id)
    print()
```

```
c446  score 1.94  confidence 0.92  ->  assert sameAs
    Thomas Hooker Old Marley Barleywine           Thomas Hooker Brewing Company   American Barleywine
    Thomas Hooker Old Marley Barleywine           Thomas Hooker Brewing Company   Barley Wine
    name 0.97   brewery 0.99   style 0.81

c427  score 0.03  confidence 0.95  ->  leave unlinked
    Frost Quake Bourbon Barrel Aged Barley Wine   Wellington County Brewery       American Barleywine
    Lompoc Bourbon Barrel Aged Proletariat Red A  Lompoc Brewing                  Amber Ale
    name 0.02   brewery 0.09   style 0.08

c100  score 1.30  confidence 0.27  ->  curator queue
    Belle Gueule Rousse                           Brasseurs R.J.                  American Amber / Red A
    Belle Gueule Rousse                           Brasseurs RJ                    Amber Lager/Vienna
    name 0.95   brewery 0.94   style 0.35

c428  score 1.10  confidence 0.77  ->  curator queue
    Ambleside Amber Ale                           Bridge Brewing Company          American Amber / Red A
    Bridge Ambleside Amber Ale - Pomegranate & G  Bridge Brewing Company          Amber Ale
    name 0.63   brewery 0.98   style 0.74
```

## 路由每个候选对

```python
# 450 candidate pairs, one request each; a small pool keeps a live run to a few minutes.
with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
    scored = list(pool.map(lambda pair: score(pair["id"]), PAIRS))

scores = [result["score"] for result in scored]
by_outcome: dict[str, list[str]] = {name: [] for name in OUTCOME.values()}
for pair, s in zip(PAIRS, scores):
    by_outcome[route(s)].append(pair["id"])

SURFACE, INK, INK2, MUTED = "#fcfcfb", "#0b0b0b", "#52514e", "#898781"
GRID, AXIS, BLUE, ORANGE = "#e1e0d9", "#c3c2b7", "#2a78d6", "#eb6834"

BINS, TOP = 20, len(LEVELS) - 1
counts = [0] * BINS
for s in scores:
    counts[min(int(s / TOP * BINS), BINS - 1)] += 1
centers = [(i + 0.5) / BINS * TOP for i in range(BINS)]
queued = [c if route(x) == "curator queue" else 0 for c, x in zip(counts, centers)]
settled = [c if route(x) != "curator queue" else 0 for c, x in zip(counts, centers)]

fig, ax = plt.subplots(figsize=(7.2, 3.6), facecolor=SURFACE)
ax.set_facecolor(SURFACE)
for side in ("top", "right"):
    ax.spines[side].set_visible(False)
for side in ("left", "bottom"):
    ax.spines[side].set_color(AXIS)
ax.tick_params(colors=MUTED, labelcolor=INK2, labelsize=9)
ax.set_axisbelow(True)
ax.grid(axis="y", color=GRID, linewidth=0.8)
ax.bar(
    centers, settled, width=TOP / BINS * 0.9, color=BLUE, label="settled automatically"
)
ax.bar(
    centers, queued, width=TOP / BINS * 0.9, color=ORANGE, label="sent to the curator"
)
for edge in (0.5, 1.5):
    ax.axvline(edge, color=INK2, linewidth=1, linestyle="--")
ax.set_xticks([0, 0.5, 1, 1.5, 2])
ax.set_xticklabels(["0\ndifferent", "0.5", "1\nrelated", "1.5", "2\nsame"])
ax.set_xlabel("score for the pair", color=INK2, fontsize=9)
ax.set_ylabel("candidate pairs", color=INK2, fontsize=9)
ax.set_title(
    f"{len(PAIRS)} candidate pairs, scored once each",
    loc="left",
    color=INK,
    fontsize=11,
)
ax.legend(frameon=False, labelcolor=INK2, fontsize=9)
display(fig)
plt.close(fig)

for name in ("assert sameAs", "curator queue", "leave unlinked"):
    n = len(by_outcome[name])
    print(f"{name:<16}{n:>5}  ({n / len(PAIRS):>5.1%})")
```

```
assert sameAs      40  ( 8.9%)
curator queue      50  (11.1%)
leave unlinked    360  (80.0%)
```

<img src="/img/cases/entity-alignment-entity_alignment.executed.1.png" alt="output" width="944" height="562" data-path="cookbooks/entity_alignment/entity_alignment.executed.1.png" />

`route()` 改变其 `answer` 的两个 `Score` 值即为切点。大多数配对在此处达成一致：低于下切点的 `Score` 为 360，高于上切点的为 40，留给 `curator`（策展人）的有 50 个。

在此数据集中，分数并非整齐地分布在整数上。大多数分数集中在 0.25 附近。两款毫无共同之处的啤酒可能仍共享一个风格名称，且其酿酒厂名称可能看起来相似，因此模型会将部分概率分配给中间层级，而非完全不分配。决定一个配对属于切点哪一侧的因素是分数本身，而它距离某个层级的远近并不影响这一判断。

这两个切点附近的配对数量并不均衡。有九个配对位于上切点 1.5 附近（误差在 0.1 以内），该切点决定哪些配对会被合并到图中。有 47 个配对位于下切点 0.5 附近（误差在 0.1 以内），该切点仅决定 `curator` 是否会看到该配对。这两个数值均非可调参数，它们均由你对层级的描述方式决定，而中间层级的描述方式正是影响配对在 `curator` 与未链接配对之间分布的关键。

## 在 Playground 中打开

下方的 Playground 链接会打开 `c428`，其 `Score` 为 1.10，并被送往 `curator`。它将 *Ambleside Amber Ale* 与 *Bridge Ambleside Amber Ale - Pomegranate & Galena Hops* 配对：同一家酿酒厂，相同的酒精含量。所有四个 `question` 均附带于此。

```python
playground_link = make_playground_link(
    {"entity_a": BY_ID["c428"]["entity_a"], "entity_b": BY_ID["c428"]["entity_b"]},
    QUESTIONS,
    models=[TYPESAFE_MODEL],
)
display(
    Markdown(
        f"🔗 [Open this pair + questions in the TypeSafe playground]({playground_link})"
    )
)
```

[在 TypeSafe 沙盒中打开此配对 + 问题 →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiMigJYoCeA+gIakEkhL2JP6kCCcARgBsEAZwpgE+XnwQAnSUNIAaLiD4yEAd1nVOpAEIyxAcwkHNFJEfwBhCHAAO9JDpDLSwmgrwresilCdJfll8AHp8ACUEMHkEJRV6PgA3XRAAVgA6AGYABnwAUlIAXzcyVCo6Pk4WNg5vfUMwEyDBETEJKRDuIXwAWnwABTsEIxknehQJADJ8AHF6ITZ8AAkIe2F40jVNbVSDY1N1DQsrWwcnF1KPai8CHmC5brjXBOTUzNyC4qKXkHsZOz2FDCDDYbxEUgCCwAa1oHgmz2YpBo9kRKmEUAg6k2ICghkmhkY3gA2qQ0AALBDUfDiDGGaT4FAaCA0igAMzZsnI+H+EDAMCgwIyOIpVJpIjxFAZUAEEGECAE1PUAgRMV5-MFwkZ5Im+Dg9GpWL1BvwSAgKHwDJQlPwwnYEggSAQBHo+CS9EJqGUruEqKgFAW+GiVAojuURtdtQk1t1mJgAjVKpgokESoQnLkKBZCColJkwpeZMp1NpkoZjokThi1okdsQPIBGpQBYAuqULB4ZALKI6NvUQKsNDSWTXGcyg+UaOK6RQgaGkFrlQj8PQteru8IAPzFK722hR6rI6io1Jm+M4jsoLuC+d9u4gAAiI5tTOzk4oIltKGXo7rEmkIRRtuIAlOie7bFoMguEiIAomipBngIF4Lle3a3qk3DqNq0bjuQIafmyAJwNhtr2paRzaMBoHuHu1y3PgLBwaeEDnoWICXtePYLqkT4ka+E6UJQn6lvS0Y2n+loICEdEIFRPzKCA9D2BQABqsiiI64JJAAjL88pCIK0QALJ8gqwgkiAABWCBJL02kZNpABMIAtkUQA)
