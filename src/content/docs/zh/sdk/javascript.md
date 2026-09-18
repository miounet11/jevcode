---
title: JavaScript / TypeScript SDK
description: 安装 @typesafe-ai/sdk，用自动类型推导的客户端调用 System One API。
section: sdk
order: 30
tags: ['javascript', 'typescript', 'sdk']
source: docs.typesafe.ai/sdk/javascript
---

## 安装

需要 Node.js 20 或更新版本：

```bash
npm install @typesafe-ai/sdk
```

设置环境变量后创建客户端：

```bash
export TYPESAFE_API_KEY="sk-..."
```

## 基本用法

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

## 类型推导

这是 TS SDK 最有价值的部分：**答案类型由你传入的问题自动推导**。

```ts
questions: {
  category: choice("What is this ticket about?", {
    billing: null,
    technical: null,
    other: null,
  }),
}
```

因为 `criteria` 的键是 `billing` / `technical` / `other`，`response.answers.category.choice` 的类型就是这三个字面量的联合类型。写成 `"bililng"` 会在编译期报错，而不是在运行时返回 `undefined`。

同理，用 `score(...)` 构造的问题，答案上会有 `score`、`legend`、`probabilities`、`confidence`；用 `noul(...)` 构造的只有 `noul`。

这意味着**你不需要手写答案的类型定义**，也不需要把 API 返回当作 `any` 处理。

## 响应结构

```ts
response.answers.category.choice;        // 选中的选项
response.answers.category.probabilities; // 各选项概率
response.answers.category.confidence;    // 置信度
```

所有问题类型统一在 `response.answers` 下按问题名索引，具体字段取决于问题的类型。

## 包结构

SDK 同时提供 ESM、CommonJS 和 TypeScript 声明文件三种产物，因此在各种构建环境下都能直接用。

如果想了解全部选项与默认值，可以看 SDK 的 [client](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/client.ts) 与 [types](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/types.ts)。

## 相关

- [5 分钟上手](/zh/quickstart/)
- [问题原语](/zh/primitives/) — 三类问题的构造方式
- [扇出并行](/zh/patterns/fan-out/) — 一次问出多个问题
