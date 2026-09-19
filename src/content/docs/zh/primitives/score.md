---
translatedFrom: en
title: Score
description: Score 按有序的描述性档位给内容打分。答案是分数、每档概率以及置信度，且分数可以落在两档之间。
section: primitives
order: 30
tags: ['score', 'ranking', 'rating']
source: docs.typesafe.ai/primitives/score
---

## 什么时候用

当答案落在**一个你能用若干档描述出来的连续谱**上时，用 Score。例如：

- 一个 bug 有多严重
- 一个客户有多满意
- 一个候选人的 Python 经验有多深

如果答案是一组固定选项且选项之间**没有顺序关系**，用 [Choice](/zh/primitives/choice/)；如果只是是/否，用 [Noul](/zh/primitives/noul/)。

典型问题示例：

```text
"How severe is the bug being reported?"
  → 0: Cosmetic; no impact to functionality
  → 1: Broken or degraded feature, but workaround exists
  → 2: Blocking issue; no workaround exists

"How formal is this outfit based on the description"
  → 0: gym clothes
  → 1: casual
  → 2: business casual
  → 3: formal
  → 4: black tie
```

注意第二个例子里，档位从 0 到 4 是**有序**的——从最随意到最正式。这正是 Score 与 Choice 的分水岭。反过来，`{ billing, technical, sales }` 之间没有真正的序关系，硬用 Score 只会引入虚假的序数语义。

## 参数

| 参数 | 必填 | 说明 |
| :--- | :--- | :--- |
| `type` | 是 | 必须是 `"score"` |
| `instructions` | 是 | 问题本身 |
| `criteria` | 是 | **档位数组**，按从低到高排列，每项的说明即该档位的定义 |

与 Choice 的 `criteria` 是对象不同，Score 的 `criteria` 是**有序数组**。数组顺序就是量纲的方向。

和 Choice 一样，`criteria` 里的每一项也可以是字符串、对象或数组——当某一档需要更多说明时改用对象。

## 请求示例

```python
from typesafe_sdk import Score, TypeSafeClient

client = TypeSafeClient()

bug = "The export button throws a CORS error when saving to Google Sheets. It works in Chrome, but a few of our customers only use Safari."

response = client.system_one(
    state=bug,
    questions={
        "bug_severity": Score(
            instructions="How severe is the reported issue?",
            criteria=[
                "Cosmetic; no impact to functionality",
                "Broken or degraded feature, but workaround exists",
                "Blocking issue; no workaround exists",
            ],
        ),
    },
)

print(response.answers["bug_severity"].score)
```

## 返回值

Score 答案的关键特征是 `score` **可以落在两档之间**——它是量纲上的一个位置，不是档位下标。

| 字段 | 含义 |
| :--- | :--- |
| `score` | 在量纲上的位置，可能是小数 |
| `legend` | 按编号重复你的档位定义，便于在代码里映射回语义 |
| `probabilities` | 每个档位上的概率分布 |
| `confidence` | 分布集中程度，0 到 1 |

假设上例返回 `score: 1.4`：这表示模型认为问题的严重程度在「有变通办法的功能损坏」和「完全阻塞」之间，偏向第一档。这种**连续性是 Score 相对于「多个 Noul 拼装」的核心优势**——一次调用就得到完整的分布信息，而不是若干个独立判断。

`legend` 的作用是让返回值自解释：你不需要在代码里另外维护一份档位常量表来把数字翻译回语义。

## 使用要点

**档位描述要可判别。** 每一档的说明应该让另一个人也能一致地判断边界。`"Calm, matter-of-fact"` / `"Frustrated but civil"` / `"Very angry"` 这样的描述是可判别的；`"低 / 中 / 高"` 不是。

**档位数量控制在 3 到 5 档。** 太少会丢失区分度，太多会让相邻档位的边界变得模糊，进而压低置信度。

**关注 `confidence` 而不是只看 `score`。** Score 置信度低通常意味着档位定义有歧义、量纲是多维的，或者 state 信息不足。这时正确的反应是改进档位定义，而不是硬取一个值。

**排序场景下 Score 是主力原语。** 相关性排序、质量评估、风险分级都适合用 Score，再配合[组合评分模式](/zh/patterns/composite-scoring/)把多个维度加权合并。

## 相关

- [Choice](/zh/primitives/choice/) — 无序的固定选项
- [Noul](/zh/primitives/noul/) — 是/否概率
- [组合评分模式](/zh/patterns/composite-scoring/) — 多维度加权合成
- [置信度](/zh/concepts/confidence/) — 低置信度意味着什么
