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

# 占位符：规范形态是 ⟧N⟦，但模型实测常把它改写成 ⟧N⟧ / ⟦N⟦ / ⟦N⟧。
# 因此匹配与还原一律按「编号」进行，不依赖字形 —— 否则被改写的那个会被静默漏过并落盘。
PH_RE = re.compile(r"[\u2987\u2988]\s*(\d+)\s*[\u2987\u2988]")
# 兜底扫描：任何占位符字形残留（含被切断的 1⦈ / ⦇0）。残检用它而非 PH_RE，
# 否则畸形输出（如粘连的 ⟧0⟧1⟦）会匹配不到而被放行落盘。
ANY_PH_RE = re.compile(r"[\u2987\u2988]")


def ph(i):
    return f"{PH_OPEN}{i}{PH_CLOSE}"


def protect(text):
    """抽出不应翻译的片段，返回 (带占位符文本, 还原表)。"""
    store = []

    def stash(s):
        store.append(s)
        return ph(len(store) - 1)

    # 围栏块（3+ 反引号，等长闭合）整体保留：用与 plan_body 相同的行首/行尾锚定规则，
    # 否则 4 反引号块会被块内第一个 ``` 提前截断，块内代码泄漏进译文。
    text = re.sub(
        r"(?m)^`{3,}[^\n]*\n[\s\S]*?\n[ \t]*`{3,}[ \t]*$",
        lambda m: stash(m.group(0)),
        text,
    )
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
    """按编号还原占位符，循环至不再变化以解开嵌套（protect 可能二次抽取）。"""
    def sub(m):
        i = int(m.group(1))
        return store[i] if 0 <= i < len(store) else m.group(0)

    for _ in range(10):
        new = PH_RE.sub(sub, text)
        if new == text:
            break
        text = new
    return text


def placeholder_echoes(text):
    """还原后仍残留的占位符字形 —— 空表示干净。用 ANY_PH_RE 兜底，
    确保被切断/粘连的畸形残留（如 1⦈）也能被发现并触发拒绝。"""
    return sorted(set(ANY_PH_RE.findall(text)))


# 模型遇到「孤立标题」「纯代码块」等无正文片段时，会回一段「我无法翻译……」的
# 说明文字。实测这类回复会被 if t: 当成成功译文写回，把原标题整段顶掉
# （pt/sdk/http-api.md 的 `### score` 标题就是这样丢的）。命中即视为失败。
REFUSAL_RE = re.compile(
    r"(?:je ne peux pas traduire|não (?:é possível|posso) traduzir|"
    r"no (?:se ha proporcionado|puedo traducir)|i (?:can(?:no|')t|cannot) translate|"
    r"cannot translate|can't translate)",
    re.I,
)


def looks_like_refusal(text):
    return bool(REFUSAL_RE.search(text))


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


# 产品/专有名词：任何分支（含标题、描述）都不得翻译。
# 实测缺此约束时标题会把术语当普通词译掉，例如 `Self-consistency: nouls`
# 被译成 fr "Auto-cohérence : nouveaux"、de "Selbstkonsistenz: neue Sprachen"。
# 注意：不要在这里罗列术语清单 —— 实测模型会把清单当成待译内容回显进输出
# （如把 "Self-consistency: nouls" 译成 "Auto-recherche, API, SDK, CLI, JSON, Markdown"）。
# 只给规则，不给例子。
TERM_GUARD = (
    "Product names and technical terms must be kept byte-for-byte as in the source; "
    "never translate, inflect, or split them into parts."
)


def translate(text, lang, kind="body"):
    name = LANG_NAME.get(lang, lang)
    if kind == "title":
        # 必须把原文放进 payload —— 否则模型会「翻译」提示词本身（实测踩坑）
        prompt = (
            f"Translate the following document title to {name}. "
            f"{TERM_GUARD} "
            "Output only the translation, no quotes, no trailing period.\n\n"
            f"---\n{text}"
        )
        budget = 200
        protected, store = text, []
    elif kind == "description":
        prompt = (
            f"Translate the following document description to {name}. "
            f"{TERM_GUARD} "
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
            f"{TERM_GUARD} "
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
            # 拒译/元话语回复不是译文：直接判失败，交给重试；三次都失败则
            # 由 rebuild 回退原文，绝不用它顶替原文（否则标题/正文被整段吃掉）。
            if looks_like_refusal(out):
                raise ValueError(f"refusal-like output: {out[:60]!r}")
            # 提示词注入 / 复读指令：短文本（标题、描述）的输出长度应与其原文同量级。
            # 实测模型偶发把 TERM_GUARD 或整段指令当译文回显，长度会暴涨到数倍。
            if len(out) > max(80, len(text) * 4):
                raise ValueError(f"output too long vs source ({len(out)} vs {len(text)})")
            if store:
                # 校验模型是否丢弃了受保护片段。
                # protect 会二次抽取：store[i] 可能内嵌 ph(j)（如 store[2]=`map⟧0⟦`）。
                # 这类「被其他项引用」的编号本来就不会出现在模型输出里（它随宿主一起回来），
                # 因此只要求「顶层编号」出现；否则会把正常段落误判为失败
                # （实测 sdk/http-api.md:91 的 store[0] 就嵌套在 store[2] 内）。
                nested = {int(n) for s in store for n in PH_RE.findall(s)}
                seen = {int(n) for n in PH_RE.findall(out)}
                lack = [i for i in range(len(store)) if i not in nested and i not in seen]
                if lack:
                    # 顶层占位符缺失 = 受保护片段被静默丢弃，绝不接受（含最后一次尝试）。
                    raise ValueError(f"placeholders lost: {lack[:3]}")
                out = restore(out, store)
                # 还原后仍有残形 = 编号越界 / 字形被切断，同样绝不落盘。
                echoes = placeholder_echoes(out)
                if echoes:
                    raise ValueError(f"placeholder echoes: {echoes[:3]}")
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


# 围栏代码块：行首锚定开栏、行尾锚定闭栏，闭栏反引号数必须 >= 开栏（```` 体内可含 ```）。
# 注意：这里不能用 `{3,}` 贪婪匹配后靠反向引用回溯 —— 在 ```` 块上它会吞掉 4 个�回退到 3，
# 于是块内第一个 ``` 被当成闭栏，整块被截断、后半段泄漏进译文（实测模型据此拒译并落盘）。
FENCE_RE = re.compile(r"(?m)^(?P<f>`{3,})[^\n]*\n(?P<body>[\s\S]*?)\n[ \t]*(?P=f)[ \t]*$")


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
