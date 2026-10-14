---
title: "LLM 路由器：用一次类型化判定选出处理者"
description: "一条请求该交给哪个模型或哪个人。全走最大的模型、关键词规则、向量路由、让聊天模型报一个标签，以及 clavue-jev 的一道 choice 再加一问 confidence。程序能分支的是这个选项。"
section: cases
order: 235
tags: ['llm-router', 'model-routing', 'routing', 'comparison']
---

## 模型前面的那一次判定

LLM 路由器不回答用户。它选出谁来回答。同一个收件箱里有改错别字、有设计问题，也有该交给人的消息。三条都丢给最大的模型，能跑通。改错别字的那条，付的是大模型的价钱。

大家搜的是 **LLM 路由器** 和 **模型路由**。你要选的是已经起好名字的一小集合：小模型、大模型、一次查询、一个人。这个选项是程序可以直接分支的值。

## 五种选出路由的办法

| 做法 | 路由怎么来 | 会出什么错 | 你付什么 |
| :--- | :--- | :--- | :--- |
| **每条请求都走同一个模型** | 没有路由器 | 小任务付大模型的价钱 | 那个模型，每次都付 |
| **关键词或正则** | 一张词表对应到处理者 | 换一种说法就对不上词表 | 请求当时不另付 |
| **向量路由** | 离某条路由描述最近的胜出 | 描述和处理者慢慢对不上 | 一次向量调用，加上那份索引 |
| **让聊天模型报一个标签** | 你要求它回复一个名字 | 名字可以落在你的集合外面，或者裹在一段话里 | 那个模型的输入和输出 |
| **类型化选择（clavue-jev）** | 对你列出的处理者做一道 `choice`，再加一问 `confidence` | 它只能返回你列出的处理者 | 调用成功后按输入 token 计费。输出免费 |

词不怎么变的时候，关键词规则就够。你本来就维护着路由描述，向量路由合适。路由本身必须是一句话时，用聊天模型。路由是少数几个处理者之一、下一行代码得读到它，用类型化选择。

## 本站实际接受的请求

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

```json
{
  "state": "Rename this function and add a test. Do not change behavior.",
  "questions": {
    "route": {
      "type": "choice",
      "instructions": "Which handler should run this request?",
      "options": ["small_model", "large_model", "human"]
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that routing judgment?"
    }
  }
}
```

`state` 是文本，8 到 4000 个字符。`questions` 最多六道。键名以小写字母开头。选择题可以传 `options`，也可以传 `criteria` 映射。本站在模型看到之前，把 `options` 折成 criteria。

调用成功后按输入 token 计费。输出免费。数字在[价格](/zh/pricing/)页。

响应里写着模型名，每道题的答案用同一个键返回：

```json
{
  "model": "clavue-jev",
  "answers": {
    "route": { "choice": "small_model" },
    "sure": { "noul": 0.78 }
  }
}
```

`route.choice` 是你送出的选项之一。`sure.noul` 是 0 到 1 的小数，来自那道 confidence 问题。这个接口不会把置信度藏进 choice 里面。上面的 `0.78` 只说明这个字段长什么样。它不是测出来的准确率，本站也不公布一条统一阈值。

对这两个字段分支。阈值由你来定：

```python
route = body["answers"]["route"]["choice"]
sure = body["answers"]["sure"]["noul"]
cutoff = 0.8  # 换成你在自己的流量上量过的阈值

if sure < cutoff or route == "human":
    hand_to_human(state)
elif route == "small_model":
    call_small(state)
else:
    call_large(state)
```

路由错进一个会花钱的工具，阈值要比路由错进一行日志更高。先在[对比](/zh/compare/)或[试用](/zh/try/)上读一批你自己的流量，再把这个数字定下来。理由写在[置信度](/zh/concepts/confidence/)页。

同一次请求还能再放四道题。一道路由、一问置信度，再加几道是否题，仍然在六道的上限里。[扇出](/zh/patterns/fan-out/)就是这个形状。

## 路由器不做什么

它不写回复。你选中的处理者去写。

它不发明处理者。正确的那个如果不在 `options` 里，choice 仍会返回你送出的某个名字。把处理者加进去，或者再加一道 `noul`，问列出的处理者里有没有合适的，不合适就交给人。

敞开来写的文字仍交给文本模型。路由器决定跑哪一个文本模型，或者这条请求要不要先给人看。文字回来之后，可以再调一次，问它能不能拿去执行。第二次调用是[护栏](/zh/cases/llm-guardrails/)，不是路由的一部分。

## 这个形状已经出现在哪里

[能力地图](/zh/cases/use-case-map/)把一批公开项目放在一起：它们用一次 Jev 的 choice 选模型。里面有编程任务路由、基于 LiteLLM 的路由、编程代理的逐请求路由，以及一个按模型和力度做选择的本地代理。共同的形状是：贵的那次调用前面，先做一道选择。这一页不为那些项目另加分数。

[意图路由](/zh/patterns/intent-routing/)是同一种判定，目标换成客服队列，而不是模型。

## 从这里开始

- [API](/zh/api/) — `POST /v1/judge`，请求和响应
- [试一次](/zh/try/) — 匿名路径，不用密钥
- [System One](/zh/concepts/system-one/) — 状态、问题，以及响应上的模型名
- [置信度](/zh/concepts/confidence/) — 第二道题，以及阈值谁来定
- [价格](/zh/pricing/) — 按输入 token 计费，输出免费

## 相关

- [结构化输出](/zh/cases/structured-output/) — 你要的是一个类型化的值，而不是一条路由
- [扇出](/zh/patterns/fan-out/) — 同一段状态上的多道题
- [大语言模型的安全护栏](/zh/cases/llm-guardrails/) — 文本模型写完之后的那次检查
- [能力地图](/zh/cases/use-case-map/) — 那些公开项目
