# Jev 实测记录（本地工具链）

本文件记录用本地 `scripts/jev-client.mjs` 调用 Jev API 的**实测**结果，
供建站决策参考。API 细节见 `.research/api-verified.md`（已实测验证）。

## 端点与凭据

- `POST https://api.typesafe.ai/v1/systemone`，Bearer 鉴权
- key 放在 `.env`（已 gitignore），`TYPESAFE_API_KEY=...`
- 模型：`jev-latest`（解析为 `jev-1.13.0`）

## 实测记录

### 2026-09-19: 冒烟测试（jev-client.mjs 自测）

```json
{"is_urgent":{"type":"noul","noul":0.93},
 "severity":{"type":"score","score":1.87,"confidence":0.81,
   "probabilities":{"0":0,"1":0.13,"2":0.87}}}
```

观察：

1. **判别稳定**：同一个 state 两次调用（curl 冒烟 + client 自测），
   `noul` 均为 0.93，`score` 1.89→1.87，判别方向一致，波动 <0.05。
2. **fan-out 可行**：两种题型混在一个请求里 200，各答各的。
3. **输出免费**：输出 tokens 不计费，多问原子问题的成本只体现在输入端
   （$42/Btok），对站内评估这种短文本场景成本可忽略。
4. **zsh 陷阱**：`curl -d '...\\!...'` 里 `\!` 会被 zsh 的 history 扩展
   搞坏，产生 `Invalid \escape` JSON 错误。用文件传 body（`--data-binary @file`）
   可避开。
