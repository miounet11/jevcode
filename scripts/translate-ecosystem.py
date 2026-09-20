#!/usr/bin/env python3
"""
补翻译：生态页吸收项目的 desc / decisionPoint 中 de/fr/es/pt 仍为 en 兜底
（与 en 相同）的字段，用本地集群生成式模型（clavue-3-chat）翻译补上。

行级扫描，不做花括号配对（字符串内可能含 { }，深度计数会错位）。

用法：
  python3 scripts/translate-ecosystem.py [--dry] [--lang de,fr,es,pt] [--limit N]

依赖：集群 gateway 11401（CLAVUE_GEN_URL 可覆盖）。
说明：Jev 是判断模型不能生成，翻译用生成式模型（非 Jev）。zh/en/ja/ko 不动。
"""

import json
import os
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

GEN_URL = os.environ.get("CLAVUE_GEN_URL", "http://192.168.2.100:11401/v1/chat/completions")
GEN_MODEL = os.environ.get("CLAVUE_GEN_MODEL", "clavue-3-chat")
ECO = "src/data/ecosystem.ts"

LANGS = ["de", "fr", "es", "pt"]
DRY = "--dry" in sys.argv
LIMIT = None
CONCURRENCY = 8

for a in sys.argv[1:]:
    if a.startswith("--lang="):
        LANGS = a.split("=", 1)[1].split(",")
    elif a.startswith("--limit="):
        LIMIT = int(a.split("=", 1)[1])
    elif a.startswith("--concurrency="):
        CONCURRENCY = int(a.split("=", 1)[1])


def translate(text, lang):
    payload = json.dumps({
        "model": GEN_MODEL,
        "messages": [{"role": "user", "content": f'Translate to {lang} (one short sentence, no preamble, no quotes): "{text}"'}],
        "max_tokens": 80,
    }).encode("utf-8")
    req = urllib.request.Request(GEN_URL, data=payload, headers={"Content-Type": "application/json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                d = json.loads(r.read().decode("utf-8"))
            out = d.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return out.strip('"')
        except Exception as e:
            if attempt == 2:
                raise
            time.sleep(1 * (attempt + 1))


def parse_value(s):
    """把 'en: "....",' 里的值解出来（双引号字符串，处理转义）。"""
    # s 已去掉外层引号，补回引号再 JSON 解析以正确处理转义
    return json.loads('"' + s + '"')


src = open(ECO, encoding="utf-8").read()
lines = src.split("\n")

# 行级扫描：跟踪当前处于 desc 块还是 decisionPoint 块，记录块内各语言值。
# 只处理双引号值（吸收条目），单引号（原始 12 条）跳过。
FIELD_RE = re.compile(r'^\s*([a-z]{2}):\s*"(.*)",\s*$')

jobs = []  # (line_index, lang, en_value)
kind = None
block = {}  # lang -> value

for idx, line in enumerate(lines):
    stripped = line.strip()
    if stripped.startswith("desc: {"):
        kind = "desc"
        block = {}
        continue
    if stripped.startswith("decisionPoint: {"):
        kind = "decisionPoint"
        block = {}
        continue
    if stripped == "}," or stripped == "}":
        # 块结束：检查该块里 en 兜底的语言
        if kind in ("desc", "decisionPoint") and "en" in block:
            for l in LANGS:
                if block.get(l) == block["en"]:
                    jobs.append((idx, l, block["en"], kind))
        kind = None
        block = {}
        continue
    if kind in ("desc", "decisionPoint"):
        m = FIELD_RE.match(line)
        if m:
            block[m.group(1)] = parse_value(m.group(2))

# 上面记录的 idx 是块结束行，需要回到具体语言行做替换。改记录语言行的行号。
# 重新扫一遍，精确记录每个待译语言行的行号。
lang_line = {}  # (lang, en) -> [line_idx, ...]
kind = None
block = {}
line_meta = {}  # line_idx -> (lang, value)

for idx, line in enumerate(lines):
    stripped = line.strip()
    if stripped.startswith("desc: {"):
        kind = "desc"; block = {}; continue
    if stripped.startswith("decisionPoint: {"):
        kind = "decisionPoint"; block = {}; continue
    if stripped in ("},", "}"):
        if kind in ("desc", "decisionPoint") and "en" in block:
            for l in LANGS:
                if block.get(l) == block["en"]:
                    # 找到该语言行号
                    pass
        kind = None; block = {}; continue
    if kind in ("desc", "decisionPoint"):
        m = FIELD_RE.match(line)
        if m:
            block[m.group(1)] = parse_value(m.group(2))
            line_meta[idx] = (m.group(1), block[m.group(1)])

# 重新组织：找出所有 en 兜底的语言行
pending = []  # (line_idx, lang, en_value)
kind = None
block = {}
block_line_map = {}  # lang -> line_idx

for idx, line in enumerate(lines):
    stripped = line.strip()
    if stripped.startswith("desc: {"):
        kind = "desc"; block = {}; block_line_map = {}; continue
    if stripped.startswith("decisionPoint: {"):
        kind = "decisionPoint"; block = {}; block_line_map = {}; continue
    if stripped in ("},", "}"):
        if kind in ("desc", "decisionPoint") and "en" in block:
            for l in LANGS:
                if block.get(l) == block["en"] and l in block_line_map:
                    pending.append((block_line_map[l], l, block["en"]))
        kind = None; block = {}; block_line_map = {}; continue
    if kind in ("desc", "decisionPoint"):
        m = FIELD_RE.match(line)
        if m:
            block[m.group(1)] = parse_value(m.group(2))
            block_line_map[m.group(1)] = idx

if LIMIT:
    pending = pending[:LIMIT]

print(f"待翻译字段: {len(pending)}（语言 {','.join(LANGS)}）")

if DRY:
    sys.exit(0)

# 唯一翻译任务
unique = {(l, en) for _, l, en in pending}
print(f"去重后唯一翻译任务: {len(unique)}")

translations = {}

def work(item):
    l, en = item
    try:
        return (l, en, translate(en, l))
    except Exception:
        return (l, en, None)

t0 = time.time()
with ThreadPoolExecutor(max_workers=CONCURRENCY) as ex:
    futs = {ex.submit(work, u): u for u in unique}
    done = 0
    for fut in as_completed(futs):
        l, en, t = fut.result()
        if t:
            translations[(l, en)] = t
        done += 1
        if done % 100 == 0:
            print(f"  进度 {done}/{len(unique)} ({time.time()-t0:.0f}s)", flush=True)

failed = len(unique) - len(translations)
print(f"翻译完成 {len(translations)}/{len(unique)}，失败 {failed}，耗时 {time.time()-t0:.0f}s")

# 写回：按行号倒序替换
applied = 0
for line_idx, l, en in sorted(pending, key=lambda x: -x[0]):
    if (l, en) not in translations:
        continue
    newval = translations[(l, en)]
    newval_esc = newval.replace("\\", "\\\\").replace('"', '\\"')
    # 保持原缩进
    m = re.match(r'^(\s*)', lines[line_idx])
    indent = m.group(1)
    lines[line_idx] = f'{indent}{l}: "{newval_esc}",'
    applied += 1

open(ECO, "w", encoding="utf-8").write("\n".join(lines))
print(f"写回 {applied} 个字段到 {ECO}")
