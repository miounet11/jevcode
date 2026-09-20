#!/usr/bin/env python3
"""
文档翻译：把 en 的 cookbook / sdk 文档翻译到目标语言（ja/ko/de/fr/es/pt）。

保护策略（关键，实测踩坑后加）：
  1. 围栏代码块整块原样保留，不送翻译
  2. 正文段落里的 inline code / URL / 超长 base64 链接 / HTML 标签 /
     路径样式 token，先抽成占位符 ⟧N⟦，翻译后原样还原
     —— 否则模型会把 13KB 的 playground 分享链接截成 5.6KB
  3. 独立 `---` 分隔线不送翻译（模型会输出乱码或多余分隔线）
  4. frontmatter 只翻 title/description，其余键原样，追加 translatedFrom: en

用法：
  python3 scripts/translate-docs.py --lang=ja --file=cases/autoformat.md
  python3 scripts/translate-docs.py --lang=ja,ko --all
  加 --dry 只统计不调用

依赖：集群 gateway 11401（CLAVUE_GEN_URL 可覆盖）。
说明：Jev 是判断模型不能生成，翻译用生成式模型（非 Jev）。
"""

import json
import os
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

GEN_URL = os.environ.get("CLAVUE_GEN_URL", "http://192.168.2.100:11401/v1/chat/completions")
GEN_MODEL = os.environ.get("CLAVUE_GEN_MODEL", "clavue-3-chat")
DOCS = Path("src/content/docs")

LANGS = []
FILE = None
DRY = "--dry" in sys.argv
ALL = "--all" in sys.argv
LIMIT = None
CONCURRENCY = 6
MAX_RETRY_ON_TRUNC = 2

for a in sys.argv[1:]:
    if a.startswith("--lang="):
        LANGS = a.split("=", 1)[1].split(",")
    elif a.startswith("--file="):
        FILE = a.split("=", 1)[1]
    elif a.startswith("--limit="):
        LIMIT = int(a.split("=", 1)[1])
    elif a.startswith("--concurrency="):
        CONCURRENCY = int(a.split("=", 1)[1])

LANG_NAME = {
    "ja": "Japanese", "ko": "Korean", "de": "German",
    "fr": "French", "es": "Spanish", "pt": "Portuguese",
}

PH_OPEN, PH_CLOSE = "\u2987", "\u2988"  # ⟧ ⟦


def ph(i):
    return f"{PH_OPEN}{i}{PH_CLOSE}"


def protect(text):
    """抽出不应翻译的片段，返回 (带占位符文本, 还原表)。"""
    store = []

    def stash(s):
        store.append(s)
        return ph(len(store) - 1)

    text = re.sub(r"```[\s\S]*?```", lambda m: stash(m.group(0)), text)
    text = re.sub(r"<!--[\s\S]*?-->", lambda m: stash(m.group(0)), text)
    text = re.sub(r"<[^>\n]{1,300}>", lambda m: stash(m.group(0)), text)
    text = re.sub(r"`[^`\n]+`", lambda m: stash(m.group(0)), text)
    # 链接目标（含超长 base64）
    text = re.sub(r"\]\(([^)\s]+)\)", lambda m: "](" + stash(m.group(1)) + ")", text)
    text = re.sub(r"https?://[^\s)\]]+", lambda m: stash(m.group(0)), text)
    text = re.sub(r"[\w.+-]+@[\w-]+\.[\w.]+", lambda m: stash(m.group(0)), text)
    # 含多个 / 的路径样式 token（模型爱改写成翻译后的词）
    text = re.sub(r"\b[a-zA-Z_][\w.-]*(?:/[\w.-]+){2,}\b", lambda m: stash(m.group(0)), text)
    return text, store


def restore(text, store):
    for i, orig in enumerate(store):
        text = text.replace(ph(i), orig)
    return text


def missing_placeholders(text, store):
    return [i for i in range(len(store)) if ph(i) not in text]


def call_gen(prompt, max_tokens):
    payload = json.dumps({
        "model": GEN_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.2,
    }).encode("utf-8")
    req = urllib.request.Request(GEN_URL, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.loads(r.read().decode("utf-8"))


def translate(text, lang, kind="body"):
    name = LANG_NAME.get(lang, lang)
    if kind == "title":
        # 必须把原文放进 payload —— 否则模型会「翻译」提示词本身（实测踩坑）
        prompt = (
            f"Translate the following document title to {name}. "
            "Output only the translation, no quotes, no trailing period.\n\n"
            f"---\n{text}"
        )
        budget = 200
        protected, store = text, []
    elif kind == "description":
        prompt = (
            f"Translate the following document description to {name}. "
            "Output only the translation, no quotes.\n\n"
            f"---\n{text}"
        )
        budget = 600
        protected, store = text, []
    else:
        protected, store = protect(text)
        # 提示词里不能出现真实占位符字面量，否则模型会把它回显进译文
        prompt = (
            f"Translate the following Markdown block to {name}. "
            "Some tokens look like a circled number inside angle brackets — keep them "
            "byte-for-byte unchanged and in place; they are opaque placeholders. "
            "Keep all Markdown syntax exactly (**, `, [], (), -, *, #, |, >). "
            "Do NOT add or remove horizontal rules (--- or ***) or headings. "
            "Preserve the block's paragraph/line structure. "
            "Do not translate product names (Jev, TypeSafe, System One, Noul, Choice, Score, API, SDK, CLI). "
            "Output only the translation, no preamble, no code fences around it."
            f"\n\n---\n{protected}"
        )
        budget = min(8000, max(400, len(protected) * 4))

    last_err = None
    for attempt in range(3):
        try:
            d = call_gen(prompt, budget)
            ch = d.get("choices", [{}])[0]
            out = (ch.get("message", {}) or {}).get("content", "").strip()
            # 输出被截断时加大预算重试
            if ch.get("finish_reason") == "length" and attempt < MAX_RETRY_ON_TRUNC:
                budget = min(16000, budget * 2)
                continue
            if not out:
                raise ValueError("empty output")
            if store:
                lack = missing_placeholders(out, store)
                if lack and attempt < 2:
                    # 占位符丢失 → 重试（可能是模型改写了 ⟧N⟦）
                    budget = min(16000, budget * 2)
                    last_err = ValueError(f"placeholders lost: {lack[:3]}")
                    continue
                out = restore(out, store)
            # 确定性守卫：plan_body 已把真正的分隔线作为 raw 保留，
            # 文本段落里模型自造的 --- / *** 一律剔除（实测模型会插分隔线把小节切开）
            out = re.sub(r"(?m)^\s*(?:---+|\*\*\*+|___+)\s*$\n?", "", out)
            return out
        except Exception as e:
            last_err = e
            time.sleep(2 * (attempt + 1))
    raise last_err or RuntimeError("translate failed")


def split_frontmatter(text):
    m = re.match(r"^---\n(.*?)\n---\n?", text, re.S)
    if not m:
        return None, text
    return m.group(1), text[m.end():]


# 围栏代码块：支持 3+ 反引号，优先匹配更长围栏（```` 内部可含 ```）
FENCE_RE = re.compile(r"(?P<f>`{3,})(?P<info>[^\n]*)\n(?P<body>[\s\S]*?)\n\s*(?P=f)[\t ]*")


def plan_body(body):
    """切块：代码围栏整块保留；独立分隔线保留；其余按空行分段待译。"""
    parts = []
    pos = 0
    for m in FENCE_RE.finditer(body):
        if m.start() > pos:
            parts.extend(_split_prose(body[pos:m.start()]))
        parts.append(("raw", m.group(0)))
        pos = m.end()
    if pos < len(body):
        parts.extend(_split_prose(body[pos:]))
    return parts


def _split_prose(chunk):
    out = []
    for seg in re.split(r"(\n\s*\n)", chunk):
        if not seg:
            continue
        if re.fullmatch(r"\n\s*\n", seg):
            out.append(("raw", seg))
        elif re.fullmatch(r"\s*(?:-{3,}|\*{3,}|_{3,})\s*", seg):
            out.append(("raw", seg))  # 水平分隔线 --- *** ___ 都不翻译
        else:
            out.append(("text", seg))
    return out


def rebuild(parts, results, key_prefix):
    out = []
    for kind, payload in parts:
        if kind == "raw":
            out.append(payload)
        else:
            out.append(results.get(f"{key_prefix}:{payload}", payload))
    return "".join(out)


def main():
    if not LANGS:
        print("需要 --lang=", file=sys.stderr)
        sys.exit(1)

    if FILE:
        files = [FILE]
    elif ALL:
        files = sorted(str(p.relative_to(DOCS / "en")) for p in (DOCS / "en").rglob("*.md"))
    else:
        print("需要 --file= 或 --all", file=sys.stderr)
        sys.exit(1)

    plans = []
    jobs = []
    for lang in LANGS:
        for rel in files:
            src_path = DOCS / "en" / rel
            if not src_path.exists():
                continue
            if (DOCS / lang / rel).exists() and not FILE:
                continue
            raw = src_path.read_text(encoding="utf-8")
            fm, body = split_frontmatter(raw)
            parts = plan_body(body)
            plans.append((lang, rel, fm, parts, body))
            for kind, payload in parts:
                if kind == "text":
                    jobs.append((lang, payload))

    print(f"待翻译文档: {len(plans)}，待译段落: {len(jobs)}")

    if DRY or not jobs:
        if DRY:
            sys.exit(0)

    results = {}
    t0 = time.time()
    unique_jobs = list(dict.fromkeys(jobs))

    def work(j):
        lang, payload = j
        try:
            return (f"{lang}:{payload}", translate(payload, lang))
        except Exception:
            return (f"{lang}:{payload}", None)

    with ThreadPoolExecutor(max_workers=CONCURRENCY) as ex:
        futs = [ex.submit(work, j) for j in unique_jobs]
        done = 0
        for fut in as_completed(futs):
            key, t = fut.result()
            if t:
                results[key] = t
            done += 1
            if done % 50 == 0:
                print(f"  进度 {done}/{len(unique_jobs)} ({time.time()-t0:.0f}s)", flush=True)

    failed = len(unique_jobs) - len(results)
    print(f"段落翻译 {len(results)}/{len(unique_jobs)}，失败 {failed}，耗时 {time.time()-t0:.0f}s")

    written = 0
    for lang, rel, fm, parts, _body in plans:
        new_fm = fm or ""
        if fm:
            tm = re.search(r'^title:\s*"?(.*?)"?\s*$', fm, re.M)
            dm = re.search(r'^description:\s*"?(.*?)"?\s*$', fm, re.M)
            if tm:
                try:
                    nt = translate(tm.group(1), lang, "title").strip().strip('"')
                    new_fm = re.sub(r'^title:.*$', f'title: "{nt}"', new_fm, count=1, flags=re.M)
                except Exception:
                    pass
            if dm:
                try:
                    nd = translate(dm.group(1), lang, "description").strip().strip('"')
                    new_fm = re.sub(r'^description:.*$', f'description: "{nd}"', new_fm, count=1, flags=re.M)
                except Exception:
                    pass
            if "translatedFrom:" not in new_fm:
                new_fm = new_fm.rstrip() + "\ntranslatedFrom: en"
        # rebuild 用每个 part 生成同样的 key
        out_parts = []
        for kind, payload in parts:
            if kind == "raw":
                out_parts.append(payload)
            else:
                out_parts.append(results.get(f"{lang}:{payload}", payload))
        dst = DOCS / lang / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(f"---\n{new_fm}\n---\n{''.join(out_parts)}", encoding="utf-8")
        written += 1

    print(f"写出 {written} 个文件")


if __name__ == "__main__":
    main()
