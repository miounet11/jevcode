#!/usr/bin/env python3
"""
从 v-modal/awesome-jev-tools 发现候选仓库，筛出可吸收条目，产出 absorb-awesome-tools.mjs 的输入。

许可说明：v-modal/awesome-jev-tools 仓库未声明许可证，因此**不使用**它的条目描述文字。
它只作为发现索引（仓库地址 + 分类线索）；描述文字来自两处自有来源：
  - 仓库自身的 GitHub description（属仓库作者，仅作事实性定位）
  - logicrw/awesome-jev-projects（MIT，含 4 语言 summary 与 Jev 决策点）

输入（.research/awesome-jev-tools/）：
  - entries.json             清单 README 解析结果（仅取 url / category）
  - candidate-meta.json      候选仓库 GitHub 元数据（含仓库作者的 description）
  - readme-verification.json 各候选仓库 README 的 Jev 证据评分

输出：absorb-selected.json，每条含
  repo / url / stars / forks / language / license / topics / srcCat / tier
  desc: {zh, en, ja, ko}   tier A 来自参考站 4 语言；tier B 只有 en（仓库 description）
  dp:   {zh, en, ja, ko}   「Jev 在这里做什么」，tier B 为空，由后续人工补

用法：python3 scripts/select-awesome-tools.py [--dry]
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, ".research", "awesome-jev-tools")
REF = os.path.join(ROOT, ".research", "awesome-jev-projects", "projects.json")
ECO = os.path.join(ROOT, "src", "data", "ecosystem.ts")

JEVPAT = re.compile(r"\bjev\b|typesafe|system one", re.I)
DRY = "--dry" in sys.argv


def repo_key(url):
    m = re.search(r"github\.com/([^/]+/[^/]+)", url or "")
    return m.group(1).lower() if m else None


def main():
    meta = {m["repo"].lower(): m for m in json.load(open(os.path.join(SRC, "candidate-meta.json"), encoding="utf-8"))}
    rows = json.load(open(os.path.join(SRC, "readme-verification.json"), encoding="utf-8"))
    entries = json.load(open(os.path.join(SRC, "entries.json"), encoding="utf-8"))
    ref = json.load(open(REF, encoding="utf-8"))

    refmap = {}
    for x in ref:
        k = (x.get("repo") or "").lower()
        if k:
            refmap[k] = x

    # 仅用参考清单补分类线索，不取其描述文字（该仓库无许可证）
    entry_cat = {}
    for e in entries:
        k = repo_key(e.get("url"))
        if k:
            entry_cat[k] = e.get("category")

    site = {s.lower() for s in re.findall(r"repo:\s*['\"]([^'\"]+)['\"]", open(ECO, encoding="utf-8").read())}

    selected, skipped = [], []
    for r in rows:
        repo = r["repo"].lower()
        if repo in site:
            skipped.append((r["repo"], "已在站内"))
            continue
        if r.get("archived"):
            skipped.append((r["repo"], "已归档"))
            continue
        m = meta.get(repo)
        if m is None:
            skipped.append((r["repo"], "无元数据"))
            continue

        item = {
            "repo": m["repo"],
            "url": m["url"],
            "stars": m["stars"],
            "forks": m["forks"],
            "language": m["language"],
            "license": m["license"],
            "topics": m.get("topics") or [],
            "archived": m["archived"],
        }

        if repo in refmap:
            x = refmap[repo]
            prose_en = (x.get("plainSummaryEn") or x.get("plainSummary") or "").strip()
            if not prose_en:
                skipped.append((r["repo"], "参考站无简介"))
                continue
            item["tier"] = "A"
            item["srcCat"] = x.get("category")
            item["desc"] = {
                "zh": (x.get("plainSummary") or "").strip(),
                "en": prose_en,
                "ja": (x.get("plainSummaryJa") or "").strip(),
                "ko": (x.get("plainSummaryKo") or "").strip(),
            }
            item["dp"] = {
                "zh": (x.get("jevDecisionPoint") or "").strip(),
                "en": (x.get("jevDecisionPointEn") or "").strip(),
                "ja": (x.get("jevDecisionPointJa") or "").strip(),
                "ko": (x.get("jevDecisionPointKo") or "").strip(),
            }
        else:
            # 不用清单的描述文字：只认仓库作者自述里明确提到 Jev/TypeSafe 的
            gh_desc = (r.get("gh_desc") or "").strip()
            if not JEVPAT.search(gh_desc):
                skipped.append((r["repo"], f"作者描述未提及 Jev（score={r['score']}）"))
                continue
            item["tier"] = "B"
            item["srcCat"] = entry_cat.get(repo)
            item["desc"] = {"en": gh_desc}
            item["dp"] = {}

        selected.append(item)

    selected.sort(key=lambda x: (-x["stars"], x["repo"]))

    if DRY:
        for x in selected:
            print(f"  {x['tier']} {x['stars']:>6} {x['repo']}")
            print(f"        {x['desc'].get('en', '')[:100]}")
        a = sum(1 for x in selected if x["tier"] == "A")
        print(f"\n入选 {len(selected)}（A {a} / B {len(selected) - a}），跳过 {len(skipped)}")
        return

    out = os.path.join(SRC, "absorb-selected.json")
    json.dump(selected, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    a = sum(1 for x in selected if x["tier"] == "A")
    print(f"入选 {len(selected)}（tier A {a} / B {len(selected) - a}），跳过 {len(skipped)} → {out}")


if __name__ == "__main__":
    main()
