---
title: "重排序"
description: "为 40 个 CLERC 法律查询构建包含 30 个条目的 BM25 短名单，然后针对每个查询-候选对使用一个 TypeSafe 问题，将 top-1 准确率从 5% 提升至 18%，将 top-10 准确率从 38% 提升至 62%。"
section: cases
order: 240
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/rerank_typesafe"
translatedFrom: en
---

你手头有成千上万份文档，需要找到其中能回答特定**问题**的那一份。那么，该如何找到它呢？

首先，使用关键词匹配等快速方法，将成千上万的候选文档筛选成一份简短的合理候选列表。我们称之为快速搜索（fast search）。

快速搜索擅长此道，但它无法告诉你候选列表中哪一个是正确的。这就需要重排序（re-ranking）来发挥作用。它直接针对查询对候选列表中的每个候选进行打分，并将得分最高的排在第一位。

以下两个步骤均在 CLERC 数据集的 3,565 份法院意见段落上运行：BM25 为 40 个查询中的每一个构建包含 30 个候选的快速搜索候选列表，然后 TypeSafe 对每个候选列表进行重排序。通过重排序，正确答案在 18% 的查询中位列第一，而仅使用快速搜索时这一比例仅为 5%。

**在此过程中，你将学到：**

* 快速搜索的作用，以及为什么它并非完整的答案
* 什么是重排序，以及它如何在快速搜索步骤之后发挥作用
* TypeSafe 如何对单个候选与查询进行评分，以及这能带来多大的结果提升

## 亲自试一试

[在 TypeSafe Playground 中打开一个查询、候选和重排序问题](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiAI4wIBOAngPpZTUAOKpBpUANgIYCWcfADMIVfADc+EXiilIAzvghD8AaWQoYUANY18UPpK75mVaAjAwqCADT4UACwR6h-Yygj55KHigT4efV4BfBhmCCR8AHcHPigHfGsuPgQVKB5IgCN-AHMqDL8wADp8NCd8AFk+bUVIfCQIFHw+MA0+IRpAFAIMsCUrRIR5BB4qePxIQfrGgfFhrm79HhghpRUeKFkI4VEJKRk5RWU1DS1dfUM+YwByEzMmS2sSitEECFmqOwAxazAwFMr1tEeIoGk1AswRig9B57OURNZuBB5FZ-OtNpEeoskKD8Nl8E4uL1rPJwgo+JkuP54QEkHpTOYHjxjK0hAgNoo+JFHP56UwLJycvISmhPNz8Fg-KhYb5Yf4qjUvAgENp7J5MlQBQEgvxBNTJNJfAdVrK+GJLDy7oNFBqcg4UIoYEhWmIxZ92o58ABBRBOn1NGFigCqSD4hXwAGUfH5FABhCLeUMwdF2bkuNyqrxR1HakJhLYxOIJJIpNIZXG5fKoCzl9LLfzfCx-OWAvgg6aBHJvahIP0BDY7GKedJZfwE3rJHgUqk7KDx2SadFM3YG9FC-AASUi+AASgBRAAinpjaAP+FlEbC1kQ+DjViagx8FNbTl6gSE+UQUVEKuprT8VDgTlNRiZAtU7d4ew0ABaEl4xeXpZyocJ8nRZpFA7LsqEgqU0R2alZwUeckzkJdmCscIhjXdcmjHaUmkAHAIQOsfAilY88AHFMOwpooGsXxJkCRDkMNLZMj0Ek2T4JdeCiOxqTFIQ7ycSsmGNcDuz9JcIEyAArNlZFmeQ7ExawfE5RRqVDIYuBUZhqDgDINACJMHFEUNoU8HhmHCTkwXwBydLcqFjTFP4EQ8KhDhURwZSE0QRKQFNyjilC5DQkxISgkLyk4iDe2pMikKRSYjldU1vC9H0wD9IpAFwCDdigCJoAGYAE5WrsABGTqAFYIyKGMUBKVqADZOqKOxg2dc8ABkEHVABnyJ3x4T9vy+H4mwBKB0pxDC8qc3CxEHLFy3xBBCXwCcp22MR9X2eNsvrd0Em9ZBqo0QBMAkUfdKHwAAFS15FjXg6xKcMlTsBAihyCbKpKAAhDJtGoRRnioFBYZvURmBKcQSk+CwSgACQga8ZogMt0cxko4yQuGAHY+s+Ipmt6TqABYAAZOq67mRqgrnWvwAAKVqPRjU0ik69qRoASlIOxOB6Fp+LoCFgZ4HIEHYfBSB8bRNWUFQtjjUR5E+gIwHeWR5GA2IxjrRQxXkLgIByMsjkADAJw0ud58ARmAuEpFBLcs+1y2oLEjPPPxsFuaBgjgZ2HBlM3IvSr2yn8X2uH9wPg4Qf1U7BARFGz-BPhGHc+FtUPFHCZJZHSYwtfewIZTFJxIWNN6NXSIpLfqgAObrK-BsJcfwdrmrsdq+pF8N9wAOQATXwGXWuauWSm9FB8m0b7dlU0xBhaJy-nkLz6VmXoxR4a3qFthA-TsTlxAgQ2kBySr954Q+G7SDiDQN+SBlKhmrO+MmzQI6n1aEwYGOxgRXR6G7KgvQjj-WQJESMCUkr+CwdieQNA84ZCkjuNwZgH7YzgBCWkdh6IxSaKGaIlxjB7WDhAKIJggHNyXA-G2rYjZcnKAAbXDDpOyGx1hB2rgIp+Qjv5eFrkgOqXpvIlAAEzDx6iUOai0RGgSEJcasyIWFa34IRX+B8aS9DQPudcdhuA6gFKA-8AQJxJU7uUawikr7uE8MwXgqlYjoUfhjVsL8nJbDFOGKRPhYC8DEKnXo91+K9FCZXcqYInRZKEB6N6vonI2jtGuT0+So5YDsn8MMl9ZzvBAeefcrZ95xCaLeDGiQg7ViYdY-+dhsi1hWEcKyQRir2BSM7UU5RCbOiXLlDSGg7BRGQYEBZWFexHWMk0SkwImjUjdJFJohSPpSkKhRQYxlcm9NGdYPSGw0pHH0WYJAR96QXNfOE5+myHQKBgKGSclJbrjFbEEngehOQA2wRGKMaUUnLhkD0mZ2TKrvRqqUZKEA7z4DyAUaszylo0maEgHSjoHlbExKIZ01Y942MxPY9cGZL5gr0M8iIR95ERKGL2GJ5Q4n6RkUk4U5RgwQN6Lg6M2NsVHE9N5OYFkdixLZBEXoktRj-KaNYd4QxGqdU0ePfAbNDXD2HqLTe29hU8kclwI+EBmBAS2MYo5Uwwy9Npf-IEMcxKx3slFc8lIcitgeiI2KfEwyhjsHtfA6zuLilQO5N+xRtmGtalzAA3LY2UkQCLcBgK0O+JdzyzOoPMrivYVltiaPITw79pC31YQUuAf8VS9LFDIf8R94FCMerOIOvQ8QETttS3orI5mt3JYlZoSamops6lBNqmjaaxFSPgAAUnm7W+Bl4ICiA5SIl8hhVkagAdQrHihCCj4oahKD1MegZwYlG6lzBem8OY7w3Iy09+IeCzHOpdCITA7CBwxlsfG+Bj2XEAt-DwkR-ojC-j-T0LkgqNOaiNPq97+r4AZr1M1o1Opyyub0K+LR-IZGhAIS5dE+yrmNKYQw-E43zkmadatiBZCIEUHiawHt0HVmQepDZGh+ETuBYOoii5jDnOKmuCGthxQlFhnYcMZZvgZAMPIWcXoMaKAAGRekcCHOIMdNxQDxiUUVYYJWTAAPJcBoLQuINC4Bww5sPZq+BMPhhvZozRdgeocxGnh4eDM5YZoRlweAEgSirxGEXeQug7Acx6gzTzD7p6tV5hvLmXMObBc0WFyoEBxkUzAJu5eEBH1c1S2B9cVBJAx25qlrzj6Rqzw3gzfVIsZadffdRdKrhTQZivtCQt9EsViHSJRcYkk-hKJApEej4hGNojSoBOuZ1WhRILTKUq5RvCMdTr+nE2RkCkAAL4gDsCAektD7QYGwHgQgJAQCtjoAYQodBq1WCYLrF7UI7K61IA0IOis9avcIlQLQq4gcgArhQagehGAsB4mTSYUDBCBEDOGYQFgS3GF7Z0u1DqMS5IrdEDUKBJTNDgIgP4-F7MBDMI6V85xYUxM8rcNkePUAZrFB9hKMDrIqFTlxpUkQrxdkareS6-OVZgEYxrK+m68QY+ox96sp97hOU6OMCAkwWEPkBc+c8EkDDGJ2gG0iZgKKhjSmKBHtBxSYCYEhZhSAP4o3QswiOAvUI+VQAAfjB5wSn1ApJ-f1lDnWT3SAV2HH8BXfgMqa03QdyVOwjdPnkE4FO-gzftCc1DykdgDtOhGGAOwrlCSuKUGIVwGwMpU+7NRh3lAnfI7d01VpmQkyTBhLcl+Uu2cJSKCHkArguBDFh-H+XivgTK-8K2fy1ALp6ApcowCSTVT2p2jsSAGwNRIAQBmlhExK1eEnozl2UjC87XeUiO3vL-CO6Ry7lHAxkglVURd87l3rteR8AABqqMcgT2IA4gnUV2hA1k+kFgzwrQU+T2oiIAEkFgdAiK3gIAAAuudkAA)

## 我们如何在成千上万份文档中找到一份？

你有一堆文档和一个查询，即一段描述你正在寻找内容的文本。在这堆文档中的某处，就藏着能回答该查询的那一份文档。

逐一将每份文档与查询进行比较是可行的，每份文档进行一次比较：数百万份文档意味着每个查询需要进行数百万次比较。你可以通过两步法来提高性能：

1. 使用一种足够快速、可以遍历整个文档堆的方法，将文档堆缩减为一份可能的候选短名单。
2. 对这份短名单应用更准确的步骤，以找到确切的答案。

<img src="/img/cases/rerank-typesafe-two-step-search-intro-diagram.svg"
  alt="动画示意图：一堆文档缩小为快速搜索候选列表，然后重排序对该候选列表进行重新排列，使正确答案上升到顶部"
  width="1560"
  height="560"
  data-path="cookbooks/rerank_typesafe/two-step-search-intro-diagram.svg"
/>

本 cookbook 在法院意见数据集上测试了该设置，详见下方的[真实示例中的重排序](#re-ranking-on-a-real-example)。

## 什么是快速搜索？

快速搜索是指任何能够将查询与大型语料库中的每个文档进行比较，并快速返回排名靠前的候选列表的方法。常见的方法包括关键词搜索（如 BM25）和稠密嵌入（dense embeddings），后者通过语义比较段落。系统通常会将这两种方法结合起来使用。

此处的第一步仅使用 BM25，不做其他操作。BM25 根据共享词汇对段落进行排名。保持这一步骤的简单性，可以将注意力集中在重排序（re-ranking）上，而这正是本 cookbook 的重点。快速搜索方法的选择是一个次要问题：重排序仅处理进入候选列表的那些段落。

## 什么是重排序？

重排序接收快速搜索已经生成的候选列表，并将其重新排列成更优的顺序。它不再一次性将查询与整个语料库进行比较，而是将查询与候选列表中的每个候选项单独进行比较，并根据该分数对候选列表进行排序。

<img src="/img/cases/rerank-typesafe-rerank-diagram.png"
  alt="Diagram: a ranked shortlist on the left, an arrow labeled &#x22;re-rank,&#x22; and the re-ordered
version on the right with the true answer moving from the middle to the
top"
  width="2400"
  height="1186"
  data-path="cookbooks/rerank_typesafe/rerank-diagram.png"
/>

该分数可以来自语言模型。将查询和一个候选项一起提供给模型，并询问该候选项回答查询的质量如何。重排序随后能在候选列表中找到最佳匹配项，即使其措辞与查询不同。

## 使用 TypeSafe 进行重排序

重排序器需要为每个“查询-候选项”对提供一个可比较的分数。通用语言模型可以生成这些分数，或直接对候选列表进行排名。然而，对于独立的成对评分，你需要定义一个评分量表，并提示模型对每个候选项应用相同的标准。重复调用仍可能对同一对产生不同的分数，而通用生成式任务会增加时间成本，而该任务实际上只需要一个数字。

### TypeSafe 返回的内容

使用 TypeSafe 时，评分请求可以保持为一个是/否问题：

```text
Could this candidate passage be from the cited precedent?
```

仅使用“是”或“否”的简单回答不足以对 30 名候选人进行排序。`Noul` 则返回一个介于 0 和 1 之间的数值，称为 [noul](/zh/primitives/noul/)。Noul 是 TypeSafe 对答案是否为“是”的可能性估计。

问题的标准定义了什么是“真”和“假”。TypeSafe 将这些标准应用于每个“问题-候选人”配对，并直接返回 noul。该 noul 即为应用程序用于排序的分数。无需为通用模型发明评分量表，且 TypeSafe 专为更快、更经济且更一致地执行此类重复评分而构建。

在简化的伪代码中，一次 TypeSafe 评分调用如下所示：

```python
question = Noul(
    instructions="Is this candidate the cited case?",
    criteria=NoulCriteria(
        true="The candidate states the specific rule the query cites.",
        false="The candidate is only on a similar topic.",
    ),
)
response = client.system_one(state={...}, questions={"is_cited_source": question})
response.answers["is_cited_source"].noul  # -> 0.87
```

TypeSafe 将查询与一个候选项结合，针对该问题进行评估，并返回一个 noul。

你可以利用这一点，通过将相同的问题逐一应用于候选列表中的每个候选项来进行重新排序，然后根据每次调用返回的 noul 值对候选列表进行排序，优先保留最高分。

```python
nouls = {candidate: ask_typesafe(query, candidate) for candidate in shortlist}
reranked = sorted(shortlist, key=lambda c: nouls[c], reverse=True)  # highest noul first
```

下图展示了如何通过对每个候选项发起一次请求来生成用于重新排序候选列表的分数。

<!-- mermaid 流程图已转为等价表格（本站不加载图表渲染库） -->

*流程方向：LR*

| 节点 | 说明 | 所属分组 |
| :--- | :--- | :--- |
| `q` | query excerpt / one opinion passage, / citation removed | — |
| `sl` | shortlist from fast search / 30 candidate passages | — |
| `quest` | one Noul / could this candidate be / from the cited precedent? / criteria fix true and false | — |
| `fan` | one request per candidate · no request sees another | one request per candidate · no request sees another |
| `sort` | sort by noul, / highest first | — |
| `out` | re-ranked shortlist / same 30, better order | — |

| 从 | 条件 | 到 |
| :--- | :--- | :--- |
| `q` | — | `fan` |
| `sl` | — | `fan` |
| `quest` | — | `fan` |
| `fan` | — | `sort` |


## 重新排序示例

快速搜索和重新排序现在在
[CLERC](https://aclanthology.org/2025.findings-naacl.441/) 上运行，这是一个法律检索数据集。
此示例使用了 3,565 份法院意见段落和 40 个查询。

### 设置

第一步安装本教程所依赖的包。

* `bm25s` 和 `datasets` 用于构建快速搜索的候选列表。
* `typesafe-sdk` 和 `cooksafe` 负责重新排序和 API 缓存。
* `matplotlib` 用于绘制结果图表。

```bash
pip install bm25s datasets matplotlib "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

下一个代码块用于设置 TypeSafe 客户端以及本教程后续部分使用的常量，例如要调用的 TypeSafe 模型以及快速搜索为重新排序器提供的短列表大小。调用 TypeSafe 需要一个 `TYPESAFE_API_KEY`。

```python
import hashlib
import json
import os
import random
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import msgspec
from cooksafe import JsonCache
from IPython.display import display
from typesafe_sdk import Noul, NoulCriteria, TypeSafeClient

TYPESAFE_MODEL = "jev-1.12"
PRICE = (
    0.042,
    0.00,
)  # $ per 1M tokens (input, output); TypeSafe jev-1.12 as of 2026-08
N_ROWS = 170  # CLERC rows pooled into the shared corpus
N_QUERIES = 40  # rows we evaluate
TOP_K = 30  # candidates the shortlist hands to the re-ranker, per query

client = TypeSafeClient(
    api_key=os.environ.get(
        "TYPESAFE_API_KEY", "cache-only"
    ),  # keyless kernels replay the cache
    base_url=os.environ.get("TYPESAFE_ENDPOINT"),
    timeout=120.0,
)
json_cache = JsonCache(Path("json_cache.json"))
```

### 使用快速搜索对段落进行排名

此处使用的数据集是一个美国法院判决书语料库，共包含 170 行数据。每一行的结构如下：

* **查询（Query）**：一段去除了引用标记的判决书摘录。
* **黄金答案（Gold）**：被移除的引用所指向的段落，即针对该查询的唯一正确答案。
* **候选项（Candidates）**：语料库中的其余所有段落，即查询可能错误匹配到的内容。

在 170 行数据中，选取 40 行作为查询用于评估。其余 130 行仅作为候选项出现。

下一个单元格将构建候选列表，使用上述描述的技术：

1. 加载语料库。
2. 使用 BM25 算法针对每个查询对其进行排名。

此处尚未引入 TypeSafe，这仅是快速搜索步骤。

```python
CLERC_FILE = (
    "https://huggingface.co/datasets/jhu-clsp/CLERC/resolve/main/"
    "teva_train_dir/train_data.jsonl.gz"
)


def cid(text: str) -> str:
    """Corpus id: a content hash, so passages shared across queries dedupe."""
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:16]


@json_cache
def build_slice(n_rows: int, n_queries: int, seed: int) -> dict:
    """Stream CLERC rows, pool ``n_rows`` of them into a corpus, pick ``n_queries`` to evaluate."""
    from datasets import load_dataset  # heavy import, keep local

    stream = load_dataset("json", data_files=CLERC_FILE, streaming=True, split="train")
    rows = []
    for row in stream:
        if (
            row.get("positive_passages")
            and len(row.get("negative_passages") or []) == 20
        ):
            rows.append(row)
        if len(rows) >= 1000:
            break

    rng = random.Random(seed)
    picked = rng.sample(rows, n_rows)
    corpus, pool = {}, []
    for row in picked:
        gold = row["positive_passages"][0]["text"]
        corpus[cid(gold)] = gold
        for neg in row["negative_passages"]:
            corpus[cid(neg["text"])] = neg["text"]
        pool.append(
            {"qid": str(row["query_id"]), "query": row["query"], "gold": cid(gold)}
        )
    # hold out the first 20 pooled rows; evaluate on the rest
    queries = rng.sample(pool[20:], n_queries)
    # sort the corpus by id so every run — live or cache replay — iterates it identically
    return {"queries": queries, "corpus": dict(sorted(corpus.items()))}


def bm25_rankings(corpus: dict[str, str], queries: dict[str, str], k: int = 100):
    """Rank every passage in the corpus by word overlap with each query."""
    import bm25s

    cids = list(corpus)
    retriever = bm25s.BM25()
    retriever.index(bm25s.tokenize([corpus[c] for c in cids], stopwords="en"))
    qids = list(queries)
    idxs, _ = retriever.retrieve(
        bm25s.tokenize([queries[q] for q in qids], stopwords="en"), k=min(k, len(cids))
    )
    return {q: [cids[i] for i in idxs[row]] for row, q in enumerate(qids)}


def gold_rank(ranked: list[str], gold: str) -> int | None:
    """1-based rank of the gold id, or None if it isn't in the list."""
    return ranked.index(gold) + 1 if gold in ranked else None


SURFACE, INK, INK2, MUTED = "#f8f8f2", "#34342f", "#34342f", "#7c7c77"
GRID, AXIS, BLUE, GREEN = "#d8d8cf", "#d8d8cf", "#5d76a2", "#6f9b52"


def bar_chart(labels: list[str], shares: list[float], title: str) -> None:
    """A small single-series bar chart of shares (0-1, shown as percentages)."""
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(5, 3.2), facecolor=SURFACE)
    ax.set_facecolor(SURFACE)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(AXIS)
    ax.tick_params(colors=MUTED, labelcolor=INK2, labelsize=9)
    ax.set_axisbelow(True)
    ax.grid(axis="y", color=GRID, linewidth=0.8)

    bars = ax.bar(labels, shares, width=0.55, color=[BLUE, GREEN][: len(labels)])
    ax.bar_label(
        bars,
        labels=[f"{s * 100:.0f}%" for s in shares],
        padding=4,
        color=INK,
        fontsize=11,
    )
    ax.set_ylim(0, 1.1)
    ax.set_yticks([0, 0.25, 0.5, 0.75, 1.0])
    ax.set_yticklabels(["0%", "25%", "50%", "75%", "100%"])
    ax.set_ylabel(f"share of {len(queries)} queries", color=INK2, fontsize=9)
    ax.set_title(title, loc="left", color=INK, fontsize=11)
    plt.tight_layout()
    display(fig)
    plt.close(fig)


ds = build_slice(N_ROWS, N_QUERIES, seed=0)
corpus: dict[str, str] = ds["corpus"]
queries = {q["qid"]: q["query"] for q in ds["queries"]}
golds = {q["qid"]: q["gold"] for q in ds["queries"]}

candidates = {q: ranked[:TOP_K] for q, ranked in bm25_rankings(corpus, queries).items()}

in_top_k = sum(golds[q] in candidates[q] for q in queries)
at_rank_1 = sum(candidates[q][0] == golds[q] for q in queries)

bar_chart(
    [f"In top {TOP_K}", "At rank 1"],
    [in_top_k / len(queries), at_rank_1 / len(queries)],
    f"Where the correct passage lands, {len(queries)} queries against {len(corpus):,} candidates",
)
```

<img src="/img/cases/rerank-typesafe-rerank_typesafe.executed.1.png" alt="output" width="940" height="462" data-path="cookbooks/rerank_typesafe/rerank_typesafe.executed.1.png" />

### 快速搜索不太可能将正确的段落排在首位

该图表展示了快速搜索在 3,565 个候选项中，将正确段落排在什么位置。

快速搜索能够可靠地将语料库缩小到一个包含正确答案的候选名单。它在 40 个查询的 100% 的情况下都包含了正确答案。但是，该段落很少成为候选名单中的排名第一项，这种情况仅占 5%。

下面的重排序操作仅对候选名单上已有的前 30 个候选项进行重新排序。它无法添加快速搜索未选中的段落。在此处，候选名单在所有 40 个查询中都包含了正确段落，因此重排序可以专注于将每个正确段落置于更好的位置。

### 使用 TypeSafe 进行重排序

重排序会根据查询对候选名单上的每个候选项进行评分，然后根据该分数进行排序。TypeSafe 针对每对候选项和查询提出的问题在于：该候选项是否可能是查询中被移除的引用所指向的段落。

下一个单元格执行以下操作：

1. 定义该问题。
2. 对每个候选名单上的每个候选项询问一次，共 40 个查询乘以 30 个候选项，总计 1,200 次调用，以并发方式运行，而非依次运行。
3. 根据 TypeSafe 返回的分数对每个候选名单进行排序，生成重排序后的结果。

```python
is_cited_source = Noul(
    instructions=(
        "The query excerpt comes from a US federal court opinion and was written "
        "immediately around a citation to a precedent; the citation itself has been "
        "removed. Could the candidate passage be from that cited precedent — does it "
        "establish the specific legal proposition the query excerpt invokes at its "
        "citation point?"
    ),
    criteria=NoulCriteria(
        true=(
            "The candidate passage states or establishes the specific rule, standard, "
            "holding, or fact pattern that the query excerpt attributes to its removed "
            "citation."
        ),
        false=(
            "The candidate passage is merely on a similar topic or doctrine; it does not "
            "supply the specific proposition the query excerpt relies on."
        ),
    ),
)


@json_cache
def score_candidate(model: str, query: str, candidate: str, question_json: str) -> dict:
    """One TypeSafe call about one (query, candidate) pair: a noul, plus token usage."""
    # the SDK takes a question as its JSON dict, so the cached string decodes straight in
    question = json.loads(question_json)
    response = client.system_one(
        state={"query_excerpt": query, "candidate_passage": candidate},
        questions={"is_cited_source": question},
        model=model,
    )
    return {
        "noul": response.answers["is_cited_source"].noul,
        "input_tokens": response.usage.input_tokens or 0,
        "output_tokens": response.usage.output_tokens or 0,
    }


# Each of the 40 queries has 30 candidates, so re-ranking every shortlist means 1,200 independent
# calls — cheap enough to fire all at once with a thread pool instead of one after another.
pair_list = [(q, c) for q in queries for c in candidates[q]]
question_json = msgspec.json.encode(is_cited_source).decode()
with ThreadPoolExecutor(max_workers=12) as pool:
    results = pool.map(
        lambda p: score_candidate(
            TYPESAFE_MODEL, queries[p[0]], corpus[p[1]], question_json
        ),
        pair_list,
    )
pair_scores = {q: {} for q in queries}
for (q, c), result in zip(pair_list, results):
    pair_scores[q][c] = result

reranked = {
    q: sorted(candidates[q], key=lambda c: -pair_scores[q][c]["noul"]) for q in queries
}


def chart_before_after(
    runs: dict[str, dict[str, list[str]]], thresholds: list[int]
) -> None:
    """Grouped bar chart: how often the correct passage lands in the top N, for each run."""
    import numpy as np
    import matplotlib.pyplot as plt

    labels = list(runs)
    colors = [BLUE, GREEN]

    def share_in_top(rankings, k):
        return sum(
            gold_rank(rankings[q], golds[q]) in range(1, k + 1) for q in queries
        ) / len(queries)

    fig, ax = plt.subplots(figsize=(6.5, 3.6), facecolor=SURFACE)
    ax.set_facecolor(SURFACE)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(AXIS)
    ax.tick_params(colors=MUTED, labelcolor=INK2, labelsize=9)
    ax.set_axisbelow(True)
    ax.grid(axis="y", color=GRID, linewidth=0.8)

    x = np.arange(len(thresholds))
    width = 0.35
    for i, (label, rankings) in enumerate(runs.items()):
        shares = [share_in_top(rankings, k) for k in thresholds]
        offset = (i - (len(labels) - 1) / 2) * width
        bars = ax.bar(x + offset, shares, width * 0.92, color=colors[i], label=label)
        ax.bar_label(
            bars,
            labels=[f"{s * 100:.0f}%" for s in shares],
            padding=3,
            color=INK2,
            fontsize=8.5,
        )

    ax.set_xticks(x, [f"top {k}" for k in thresholds])
    ax.set_ylim(0, 1)
    ax.set_yticks([0, 0.25, 0.5, 0.75, 1.0])
    ax.set_yticklabels(["0%", "25%", "50%", "75%", "100%"])
    ax.set_ylabel(f"share of {len(queries)} queries", color=INK2, fontsize=9)
    ax.set_title(
        "How often the correct passage lands near the top",
        loc="left",
        color=INK,
        fontsize=11,
    )
    ax.legend(frameon=False, labelcolor=INK2, fontsize=9, loc="upper left")
    plt.tight_layout()
    display(fig)
    plt.close(fig)


chart_before_after(
    {"Fast search": candidates, "+ TypeSafe re-rank": reranked}, [1, 5, 10]
)

calls = [pair_scores[q][c] for q in queries for c in pair_scores[q]]
input_tokens = sum(call["input_tokens"] for call in calls)
output_tokens = sum(call["output_tokens"] for call in calls)
cost = input_tokens / 1_000_000 * PRICE[0] + output_tokens / 1_000_000 * PRICE[1]
print(
    f"{len(calls)} TypeSafe calls used {input_tokens:,} input and "
    f"{output_tokens:,} output tokens, costing ${cost:.4f}."
)
```

```
1200 TypeSafe calls used 1,536,002 input and 25,200 output tokens, costing $0.0645.
```

<img src="/img/cases/rerank-typesafe-rerank_typesafe.executed.2.png" alt="output" width="957" height="524" data-path="cookbooks/rerank_typesafe/rerank_typesafe.executed.2.png" />

### 重排序将正确答案推向顶部

该图表对比了快速搜索与快速搜索加重新排序在三个阈值下的表现。
在每一个阈值下，重排序都将正确的段落推向了更靠前的位置：

* **Top 1** — 5% → 18%
* **Top 5** — 15% → 35%
* **Top 10** — 38% → 62%

报告的 token 数量和成本涵盖了用于对 40 个短列表进行重排序的所有 1,200 次 TypeSafe 调用。

每个 CLERC 行包含一个正确答案段落和 20 个负向段落。本演练将 170 行中的段落合并为一个共享语料库。对于 40 个评估查询中的每一个，BM25 从整个语料库中选择 30 个候选项，而不仅仅是该行提供的 20 个负向段落。然后，TypeSafe 针对每个选定的候选项读取查询，并对这 30 个段落进行重排序。

本演练为了清晰起见，每对数据只问一个问题。在实际应用中，一次调用会针对同一对数据询问多个问题。请参阅 [并行问题 cookbook](/zh/cases/parallel-questions/) 和 [推测性扇出模式](/zh/patterns/fan-out/) 了解具体做法。

***

## 下一步

TypeSafe 文档中的其他部分也使用了相同的构建块：

* [Noul](/zh/primitives/noul/)，了解 TypeSafe 如何将是非问题转化为分数。
* [Speculative Fan-Out](/zh/patterns/fan-out/)，了解如何在一次调用中针对一个文档询问多个问题。
* [逐行搜索](/zh/cases/semantic-find/)，了解另一种通过语义而非关键词搜索语料库的方法。
