# JevCode

**Jev 技术解决方案与最佳实践** — [www.jevcode.ai](https://www.jevcode.ai)

Jev 是 TypeSafe 的 System One 决策模型：你给它**状态 + 类型化问题**，它返回**可直接进代码的决策**（带置信度），不是聊天文案。

| 原语 | 做什么 | 典型用途 |
| :--- | :--- | :--- |
| **Choice** | 从互斥选项里选一个 | 意图路由、工单分派、动作选择 |
| **Score** | 按量纲打分 | 相关性排序、质量评估、风险分级 |
| **Noul** | 是/否概率 | 校验、断言核查、Agent 护栏 |

> 本站是 **实践与文档聚合**（中 / EN），官方模型与 API 仍以 [TypeSafe](https://typesafe.ai/) / [docs.typesafe.ai](https://docs.typesafe.ai/) 为准。

## 快速入口

- 中文站：https://www.jevcode.ai/zh/
- English：https://www.jevcode.ai/en/
- 认识 Jev：https://www.jevcode.ai/zh/introduction/
- 5 分钟上手：https://www.jevcode.ai/zh/quickstart/
- 问题原语：https://www.jevcode.ai/zh/primitives/
- 架构模式：https://www.jevcode.ai/zh/patterns/

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 产出到 dist/
```

Node 20+ 推荐。部署脚本见 [`deploy/`](./deploy/)。

## 仓库结构

```
src/content/docs/{zh,en}/   # 文档正文
src/pages/                  # Astro 路由
deploy/                     # nginx / 发布 / 回滚
```

## 和官方的关系

- 官方产品：TypeSafe / Jev API
- 本仓库：中文优先的解决方案站 + 模式 / 案例整理，方便工程落地
- 不替代官方 docs；有冲突以官方为准

## License

文档与站点代码以本仓库为准；TypeSafe / Jev 商标与模型归原厂所有。
