---
translatedFrom: en
title: SDK 与集成
description: 官方客户端 SDK、HTTP API 的选择，以及给 AI 编码代理用的 skill。
section: sdk
order: 10
tags: ['sdk', 'api']
source: docs.typesafe.ai/sdk
---

## 三种集成方式

| 方式 | 适用 | 特点 |
| :--- | :--- | :--- |
| [Python SDK](/zh/sdk/python/) | 后端服务、数据管道、批处理 | 同步/异步客户端，类型化输入，自动重试 |
| [JavaScript SDK](/zh/sdk/javascript/) | Node.js 服务、全栈应用 | TypeScript 类型推导，答案类型由问题自动推导 |
| HTTP API | 其他语言、轻量集成 | 直接 POST，需要自己处理重试与限流 |

如果团队里有 AI 编码代理在写集成代码，建议先装 [TypeSafe agent skill](/zh/sdk/agent-skill/)，让代理知道请求与响应的确切形状，避免它凭猜测写代码。

## 共同约定

所有 SDK 共享同一套约定：

- **端点**：`POST https://api.typesafe.ai/v1/systemone`
- **认证**：从环境变量 `TYPESAFE_API_KEY` 读取，无需在代码里传
- **默认模型**：`jev-latest`（解析到最新的稳定版本）
- **重试**：默认按退避策略重试，并尊重响应里的 `retry-after` 头

## 版本要求

- Python SDK：包名 `typesafe-sdk`
- JS SDK：包名 `@typesafe-ai/sdk`，需要 Node.js 20 或更新版本

JS SDK 提供 ESM、CommonJS 和 TypeScript 声明文件三种产物。

## 直接调用 HTTP API

如果不用 SDK，需要自己处理两件 SDK 已经内置的事：

**限流重试。** 超过 250,000 tokens/秒 或 1,200 请求/分钟会返回 `429 Too Many Requests`。响应可能带 `retry-after` 头，你应该按它退避。

**响应解析。** 返回值结构是按问题名索引的答案对象，每类问题有自己的字段形状。详见 [API 参考](https://docs.typesafe.ai/api)。

## 相关

- [Python SDK](/zh/sdk/python/)
- [JavaScript SDK](/zh/sdk/javascript/)
- [Agent skill](/zh/sdk/agent-skill/)
- [5 分钟上手](/zh/quickstart/) — 完整可运行示例
