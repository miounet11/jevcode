# JevCode 全面补充：图片接入 + 8 语言扩展 + 发布

## Context

`github.com/miounet11/jevcode` 是一个真实的 Astro 文档站（www.jevcode.ai，46 页，zh/en 各 20 篇文档）。用户反馈"没发现变化、也没看到图片"——这有确切原因，不是猜测：

**已核实的三个真实问题：**

1. **生态页与首页配图从未进入版本库。** `src/pages/[lang]/ecosystem.astro`、`src/data/ecosystem.ts`、`src/styles/global.css` 的生态页样式、`Header/Sidebar` 导航改动，全部处于**未提交**状态（`git status` 显示 modified/untracked）。`public/img/hero/` 下 8 个文件（4 张图 × PNG+WebP）**完全未被任何页面引用**——`grep -rn "hero/" src` 无结果。所以 GitHub 上看不到变化。

2. **本地落后于远端。** `git fetch` 后 `origin/main = c9b6714`（`docs: add README`），本地 HEAD 仍是 `ebe2138`。远端 README 已存在，本地没有。

3. **只有 zh/en 两种语言。** `src/i18n/ui.ts` 的 `languages` 仅 `{zh, en}`，`astro.config.mjs` 的 `i18n.locales` 也只有这两个。

**目标：** 把已有的图和生态页真正发布出去，生成一批新配图，扩展到 8 语言，README 图文并茂，最后推 GitHub + 重新部署。

---

## ⚠️ 阻塞项：`.pipeline/img.py` 含明文 root 密码

`.pipeline/img.py:6` 硬编码了一个 SSH 口令明文（变量名 `PASS`），用于 `root@192.168.2.100`。`.pipeline/` 目前是 untracked，**一旦 `git add -A` 就会把这个凭据推上公开仓库**。

处理方式（二选一，**必须先做**）：
- **推荐**：把 `.pipeline/` 整体加入 `.gitignore`，流水线脚本作为本地工具保留，不进公开仓库。
- 或者：把凭据改为读环境变量（`os.environ["JEVCODE_SSH_PASS"]`），并把 `PASS`/`GATEWAY` 内网地址移出源码后再提交。

`.pipeline/llm.py` 的 `GATEWAY = "http://192.168.2.100:30080/..."` 是内网地址，同理。

---

## 阶段 1：同步与安全（先做，避免后续返工）

1. 处理 `.pipeline` 凭据（见上）。
2. 扩展 `.gitignore`：
   ```
   .clavue/worktrees/
   .clavue/runs/
   .clavue/coordination/
   .pipeline/__pycache__/
   .research/official/*.html      # 约 880KB 抓取原文，md 版已保留
   ```
3. 本地未提交的生态页改动先 commit，再 `git pull --rebase origin/main` 对齐 `c9b6714`（远端只加了 README.md，与本地改动无文件重叠，不冲突）。
   - 涉及文件：`src/components/Header.astro`、`src/components/Sidebar.astro`、`src/styles/global.css`、`src/content/docs/{zh,en}/cases/use-case-map.md`、`src/pages/[lang]/ecosystem.astro`、`src/data/ecosystem.ts`、`public/img/`。

## 阶段 2：把现有 4 张图接进页面

现有图片（`public/img/hero/`，WebP 已远小于 PNG）：

| 文件 | PNG | WebP |
| :-- | --: | --: |
| `pareto` | 1.06 MB | 47 KB |
| `state-question` | 1.02 MB | 53 KB |
| `primitive.svg` | 938 KB | 58 KB |
| `confidence-gate` | 695 KB | 6.7 KB |

改动点：
- `src/pages/[lang]/index.astro` — hero 区插入主图（`pareto` 或 `primitive.svg`）。
- `src/pages/[lang]/[...slug].astro` — 文档页支持可选配图（按 `section`/`slug` 映射）。
- 用 `<picture>` 输出 WebP + PNG 回退，显式写 `width`/`height`/`loading="lazy"`/`alt`，避免布局抖动。
- `src/layouts/BaseLayout.astro` — 补 `og:image` 与 `twitter:image`（当前 meta 无社交预览图）。

## 阶段 3：生成新一批配图

复用现有流水线（`.pipeline/img.py` + `gen_batch.py`，走 192.168.2.100 集群）：

- 新建 jobs 文件 `.pipeline/jobs_docs.json`，产出到 `public/img/docs/`：架构总览、三原语（choice/score/noul）、置信度分流、扇出并行、组合评分、SDK 集成、生态地图、快速上手。
- 生成后用 `.pipeline/optimize_img.mjs` 转 WebP（已有脚本，保留 PNG 回退）。
- 新增 `public/og.png`（1200×630 社交预览），接入阶段 2 的 `og:image`。
- 生成脚本的 prompt 集中在 jobs JSON，便于复现。

## 阶段 4：扩展到 8 语言

语言集：`zh, en, ja, ko, de, fr, es, pt`。

**代码改动（结构层）：**
- `src/i18n/ui.ts` — `languages` 加 6 项；`ui` 补 6 套完整 UI 字符串（约 40 个 key）；检查 `switchLangPath` 是否用硬编码 `zh|en` 正则，若是则改为通用替换。
- `src/data/site.ts` — `sectionTitle(key, lang)` 签名从 `'zh' | 'en'` 放宽到 `Lang`；`patterns`、`primitiveCards` 的 `{zh, en}` 标题/描述补齐到 8 语言（缺失回退 en）。
- `astro.config.mjs` — `i18n.locales` 扩到 8 项，`sitemap` 的 hreflang 映射同步。
- `src/layouts/BaseLayout.astro:26` — `htmlLang` 目前只处理 `zh→zh-CN`，需完整 BCP-47 映射表。
- `src/components/Header.astro:42` — `hreflang` 同样只处理 zh/en，需映射表。
- `src/components/Footer.astro` — 硬编码 `lang === 'zh' ? ... : ...` 的文案需走 i18n。

**内容（主要工作量）：**
- 新建 `.pipeline/translate_docs.py`（参照 `expand_docs.py` 的结构与 `llm.py` 调用方式），把 `src/content/docs/zh/*` 全部 20 篇翻译成 6 种新语言 → 120 个文件。
- 复用 `[...slug].astro` 已有的 fallback 机制：新语言缺篇时回退，不用等翻译齐再上线。
- 机器翻译内容在每篇 frontmatter 或页脚标注来源，避免被当成官方权威译文。
- 产物落在 `src/content/docs/{ja,ko,de,fr,es,pt}/`。

## 阶段 5：README 图文并茂

远端 `README.md`（c9b6714）已有正确的基本盘（原语表、快速入口、本地开发、仓库结构）。在其基础上补：
- 顶部 hero 配图（`public/img/hero/pareto.webp`）+ AGPL/MIT 与 Astro 徽章。
- 8 语言入口链接。
- 站点截图区（引用 `public/img/docs/*.webp`）。
- 保留原有的"本站是实践与文档聚合，官方以 TypeSafe 为准"免责声明。

## 阶段 6：提交、推送、部署

1. `git add -A && git commit`（conventional commit，按改动拆 2–3 个提交：图片+生态页 / 8 语言 / README）。
2. `git push origin main`。
3. `./deploy/deploy.sh`（本地 build → scp → 服务器软链原子切换 → reload nginx）。

---

## 验证

- `npm run build` 通过；`find dist -name '*.html' | wc -l` 从 46 增至 8 语言规模。
- 所有配图引用可解析：`grep -rn "img/" dist --include=*.html`，且 `dist/img/` 下文件齐全。
- `git ls-files public/img | wc -l` > 0（当前为 0）。
- 确认 `.pipeline` 凭据未进版本库：`git log -p --all -- .pipeline | grep -c 'PASS '` 应为 0。
- `curl -sI https://www.jevcode.ai/ja/` 等新语言路径返回 200。
- GitHub 页面肉眼确认图片与 8 语言链接渲染正常。

## 待确认的取舍

- **`.research/` 与 `.pipeline/` 是否入库**：两者含抓取原文与内部地址。倾向 `.pipeline` 走 gitignore，`.research/*.md` 入库作为内容溯源。
- **120 篇机翻的校对深度**：本轮按"先上线、标注机翻"处理，精校留后续。
