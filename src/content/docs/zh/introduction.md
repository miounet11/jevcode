---
title: 认识 JevCode
description: JevCode 是 Jev 的主场。模型是 clavue-jev，今天世界上最好的 Jev。一次调用送入状态和类型化问题，返回程序可以直接分支的判定。
section: start
order: 10
tags: ['overview', 'clavue-jev']
---

## Jev 的主场

JevCode 是 Jev 住的地方。本站提供的模型是 **clavue-jev**。它是我们做的，由我们提供，我们把它放在今天世界上最好的 Jev 这个位置上。

jev-1.13.0 出现在对比页，答的是同一道题，方便你并排看。它不是本站对外提供的模型。

## 一次调用是什么

clavue-jev 不是聊天模型。你送一段**状态**，再送最多六个**类型化问题**。它返回程序能直接读的字段：

| 问题 | 返回 |
| :--- | :--- |
| `noul` | 0 到 1 的小数。读成「是」的程度。 |
| `confidence` | 0 到 1 的小数。读成这次判定有多稳。 |
| `choice` | 你列出的选项里的一个。 |

聊天模型写一段话。clavue-jev 返回一个值。这就是 System One 这次调用要做的事。

## 接着看

- [System One](/zh/concepts/system-one/) — 一次调用的形状
- [状态](/zh/concepts/state/) — 你送进去的文本
- [把握](/zh/concepts/confidence/) — 什么时候自动做，什么时候停
- [试一次](/zh/try/) — 匿名路径不用 Key
- [API](/zh/api/) — 带 Key 的 `POST /v1/judge`
