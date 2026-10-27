#!/usr/bin/env python3
"""
为 src/data/daily-briefs.json 里已发布的案例生成多语言正文，
让 /ja/ /ko/ /de/ /fr/ /es/ /pt/ /zh/ 各自的简报页有本地语言内容，
而不是复制同一段英文原文（那正是非 en/zh 页面被 noindex 的原因）。

同时翻译 industry / scene / dimension / stage / tag 这套结构化术语，
标题（briefHeading）也随语言变化。

用法：
  python3 scripts/translate-briefs.py --lang=ja [--limit=20] [--dry]
  python3 scripts/translate-briefs.py --lang=all

依赖：集群 gateway（CLAVUE_GEN_URL 可覆盖），模型 CLAVUE_GEN_MODEL（生成式模型，Jev 不能生成）。

只翻译已发布（daily-briefs.json 里存在）的案例；语料其余部分等发布时再翻。
输出：src/data/briefs-i18n.json，结构 { [id]: { [lang]: { context, question, choices } } }
"""

import json
import os
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRIEFS = os.path.join(ROOT, "src/data/daily-briefs.json")
TERMS_JSON = os.path.join(ROOT, "src/data/brief-terms.json")
TERMS_FILE = os.path.join(ROOT, "src/data/brief-terms.ts")
OUT = os.path.join(ROOT, "src/data/briefs-i18n.json")

GEN_URL = os.environ.get("CLAVUE_GEN_URL", "http://192.168.2.100:11401/v1/chat/completions")
GEN_MODEL = os.environ.get("CLAVUE_GEN_MODEL", "clavue-3-chat")

ALL_LANGS = ["zh", "ja", "ko", "de", "fr", "es", "pt"]
CJK_LANGS = {"zh", "ja", "ko"}
LANGS = ALL_LANGS
FIELDS = ["industry", "scene", "dimension", "stage", "tag", "choice"]
DRY = "--dry" in sys.argv
LIMIT = None
CONCURRENCY = int(os.environ.get("BRIEF_TRANSLATE_CONCURRENCY", "12"))

for a in sys.argv[1:]:
    if a.startswith("--lang="):
        LANGS = ALL_LANGS if a.split("=", 1)[1] == "all" else a.split("=", 1)[1].split(",")
    elif a.startswith("--limit="):
        LIMIT = int(a.split("=", 1)[1])
    elif a.startswith("--concurrency="):
        CONCURRENCY = int(a.split("=", 1)[1])

# 选择项在语料里是 yes/no 这类固定枚举，不翻译。
PROMPT = (
    "Translate the following into {lang_name}. It is a user-message snippet from a "
    "coverage test corpus; keep it short, factual and neutral. Keep these product "
    "names verbatim in Latin script: Jev, TypeSafe, System One, Choice, Score, Noul, "
    "MCP, OpenRouter, TypeScript, Python. Output only the translation, no preamble, "
    "no quotes, no explanation. {native_hint}\n\n"
    'Text: "{text}"'
)

# 「输出必须是目标语言」这一句不是客套。同一个句子反复请求时，模型会有约三成
# 概率把英文原样返回（实测串行、间隔 1s 仍有 2/6），加并发无关，也不是内容敏感。
# 显式点明目标语言后，同类退化从 3/4 降到 0/4。CJK 尤其明显——它们的译文本来
# 就不该出现整段拉丁字母，模型滑回去的代价最直观。
NATIVE_HINT = {
    "zh": "Write the answer in Simplified Chinese characters only.",
    "ja": "Write the answer in Japanese, using Japanese script.",
    "ko": "Write the answer in Korean, using Hangul.",
    "de": "Write the answer in German.",
    "fr": "Write the answer in French.",
    "es": "Write the answer in Spanish.",
    "pt": "Write the answer in Brazilian Portuguese.",
}

TERM_PROMPT = (
    "This is a short taxonomy slug used as a label in a coverage test corpus: {term}. "
    "Give its {lang_name} equivalent as a single noun or short noun phrase, 1-3 words, "
    "lowercase in languages that use lowercase. Keep brand-like slugs that have no "
    "natural translation as they are — in that case reply with the exact same slug. "
    "Output only the term, no quotes, no punctuation, no explanation."
)

TERM_PROMPT_STRICT = (
    "Answer with the {lang_name} word for this concept, in lowercase: {term}. "
    "Replace any hyphen with a space first. Reply with only that word — never repeat the English."
)

LANG_NAME = {
    "zh": "Simplified Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "de": "German",
    "fr": "French",
    "es": "Spanish",
    "pt": "Portuguese (Brazil)",
}


def is_ascii(text):
    return all(ord(c) < 128 for c in text)


def clean(text):
    out = (text or "").strip()
    if out.startswith('"') and out.endswith('"') and out.count('"') == 2:
        out = out[1:-1].strip()
    out = out.strip()
    if not out:
        return None
    out = " ".join(out.split())
    if re.search(r"(?i)^(the translation|translated|here is|sure,|translation:|text:)", out):
        return None
    if re.search(r"(?i)\bis:\s*$", out):
        return None
    # 产品名/技术名不许被音译
    if re.search(r"杰夫|ジェブ|제브|タイプセー|ノウル|Sistema Uno|Système Un", out):
        return None
    if re.search(r"\bJov\b", out):
        return None
    if out.count('"') % 2 == 1:
        return None
    # 提示词回显：模型把 PROMPT 里的示例清单或开场白当成译文吐了出来。
    # 这不是「译文质量差」，是整条都不可用，必须当失败处理。
    if re.search(r"TypeSafe, System One, Choice, Score, Noul", out):
        return None
    if re.search(r"(?i)^(i'm clavue|i am clavue|je suis clavue|sou clavue)", out):
        return None
    return out


# 模型稳定把这些 slug 读成英文、或译文与英文同形，但目标语言其实有常用词。
# 只补真正该换词的少数；marketing/chat/compliance 这类同形词交给回退逻辑，
# 硬凑一个近义词反而会让标题读起来别扭。
MANUAL_TERMS = {
    ("escalation", "de"): "Eskalation",
    ("escalation", "pt"): "escalonamento",
    ("priority", "ja"): "優先度",
    ("banking", "de"): "Bankwesen",
    ("telecom", "ko"): "통신",
    ("telecom", "es"): "telecomunicaciones",
    ("telecom", "pt"): "telecomunicações",
    ("telehealth", "de"): "Telemedizin",
    ("pharma", "ja"): "製薬",
    ("form", "de"): "Formular",
    ("log", "pt"): "registro",
    ("social", "es"): "redes sociales",
    ("social", "pt"): "redes sociais",
    ("transcript", "ko"): "대화 기록",
    ("triage", "ko"): "분류",
    ("chargeback", "pt"): "estorno",
    # 模型对这几个高频词稳定返回英文；它们出现在每条标题里，必须有人工值。
    ("ecommerce", "ja"): "電子商取引",
    ("support-ticket", "ja"): "サポートチケット",
    ("support-ticket", "ko"): "지원 티켓",
    ("churn-risk", "ja"): "解約リスク",
    ("churn-risk", "ko"): "이탈 위험",
    ("nonprofit", "ja"): "非営利",
    ("realestate", "ja"): "不動産",
    ("financial-advice", "ja"): "金融アドバイス",
    ("medical-triage", "ja"): "医療トリアージ",
    ("pii", "ja"): "個人情報",
    ("chargeback", "ko"): "지급 거절",
    # 术语污染修复：这些值曾被模型写成提示语、复读或英文原形（"sluterie sluterie"、
    # "note French equivalent: notice"、"guten chat. ich bin clavue."），
    # 已从 brief-terms.json 清掉。人工给定正确译法，避免重跑时再次被污染。
    ("streaming", "fr"): "streaming",
    ("restaurant", "fr"): "restaurant",
    ("construction", "fr"): "construction",
    ("construction", "ja"): "建設",
    ("chat", "de"): "Chat",
    ("chat", "es"): "chat",
    ("chat", "pt"): "chat",
    ("note", "fr"): "note",
    ("note", "zh"): "备注",
    ("note", "ja"): "メモ",
    ("social", "fr"): "social",
    ("social", "zh"): "社交",
    ("social", "ja"): "ソーシャル",
    ("api-payload", "de"): "API-Payload",
    ("api-payload", "pt"): "carga útil da API",
    ("log", "es"): "registro",
    # 选择项：模型在这些词上稳定返回英文原形或英文近义词，人工给定。
    ("bug", "zh"): "缺陷",
    ("bug", "fr"): "bogue",
    ("clean", "ja"): "無害",
    ("compliance", "de"): "Compliance",
    ("deny", "ja"): "拒否",
    ("grant", "ja"): "承認",
    ("grant", "ko"): "승인",
    ("incident", "fr"): "incident",
    ("negative", "ja"): "否定的",
    ("neutral", "de"): "neutral",
    ("neutral", "es"): "neutral",
    ("no", "ko"): "아니요",
    ("no", "es"): "no",
    ("normal", "de"): "normal",
    ("normal", "fr"): "normal",
    ("normal", "es"): "normal",
    ("normal", "pt"): "normal",
    ("poor", "ja"): "不良",
    ("question", "fr"): "question",
    ("routine", "de"): "routine",
    ("routine", "fr"): "routine",
    ("spam", "de"): "Spam",
    ("spam", "pt"): "spam",
    ("urgent", "fr"): "urgent",
    ("warn", "de"): "warnen",
}

# 语言码选项（语料里「这段话是什么语言」那道题）：显示各语言自己的语言名。
LANGUAGE_LABELS = {
    "en": {"zh": "英语", "ja": "英語", "ko": "영어", "de": "Englisch", "fr": "anglais", "es": "inglés", "pt": "inglês"},
    "zh": {"zh": "中文", "ja": "中国語", "ko": "중국어", "de": "Chinesisch", "fr": "chinois", "es": "chino", "pt": "chinês"},
    "ja": {"zh": "日语", "ja": "日本語", "ko": "일본어", "de": "Japanisch", "fr": "japonais", "es": "japonés", "pt": "japonês"},
}
for _code, _by_lang in LANGUAGE_LABELS.items():
    for _lang, _label in _by_lang.items():
        MANUAL_TERMS[(_code, _lang)] = _label


def _term_words(text):
    return set(re.split(r"[\s\-]+", text.lower()))


def valid_term(slug, lang, value):
    """判断一条术语译文是否真的翻译了，而不是模型把 slug 原样吐回。

    读入已有数据时也要过这一关：早期版本写进文件的坏值（ja 的 "ecommmerce"、
    各语言照抄的 "support ticket"）不清理就会被 merge 永久保留。
    """
    if not isinstance(value, str):
        return False
    out = value.strip()
    if not out or len(out) > 40:
        return False
    if out.lower() == slug.lower():
        return False
    # 模型偶尔把提示语本身当译文写回（"note French equivalent: notice"、
    # "slut French equivalent: slug slut"）。这类值词数够多、也含拉丁字母，
    # 能骗过下面的形状检查，但对读者是完全无意义的句子，必须先排掉。
    if re.search(r"equivalen|translat|meaning of|in (?:french|german|spanish|portuguese|japanese|korean|chinese)", out, re.I):
        return False
    # 残留的标识符形态（"sliding_scale"）说明模型没在翻译，只是复述。
    if "_" in out and " " not in out:
        return False
    # ja/ko/zh 的译文必须真的含本族文字，纯 ASCII 一律是没译。
    if lang in CJK_LANGS and is_ascii(out):
        return False
    if lang == "ko" and not re.search(r"[가-힣]", out):
        return False
    if lang in ("ja", "zh") and not re.search(r"[\u3400-\u9fff\u3040-\u30ff]", out):
        return False
    # ja/ko/zh 的译文里夹长串英文单词，多半是模型没译完（"ふ" 这种单假名除外）。
    if lang in CJK_LANGS and re.search(r"[A-Za-z]{7,}", out):
        return False
    # de/fr/es/pt 把连字符换成空格、或只改大小写，也算没译。
    if _term_words(out) <= _term_words(slug):
        return False
    # 同一个词重复（"sluterie sluterie"）是模型复读，不是译文。
    words = [w for w in re.split(r"\s+", out.lower()) if w]
    if len(words) > 1 and len(set(words)) == 1:
        return False
    return True


def valid_body(source, lang, value):
    """判断一条正文译文是否真的翻译了，而不是模型把英文原样吐回。

    术语有 valid_term 把关，正文此前完全没有：模型偶尔直接返回英文原文，
    clean() 判不出区别，坏值就写进了 briefs-i18n.json。前端照原样渲染，
    非 en 页面于是出现整段英文——正是这些页面被判低质的原因。
    content-check 的 identical-translation 就是这个判据，两边必须一致。

    读入已有数据时也要过这一关：只判「字段非空」会让早就写坏的译文
    被 merge 永久保留（术语表踩过同一个坑，见 valid_term 的注释）。
    """
    if not isinstance(value, str):
        return False
    out = value.strip()
    if not out:
        return False
    # 与英文原文完全相同 = 没翻译。
    if " ".join(out.split()).lower() == " ".join((source or "").split()).lower():
        return False
    if lang in CJK_LANGS and is_ascii(out):
        return False
    if lang == "ko" and not re.search(r"[가-힣]", out):
        return False
    if lang in ("ja", "zh") and not re.search(r"[\u3400-\u9fff\u3040-\u30ff]", out):
        return False
    # 提示词回显。前面 clean() 只认「整条就是那份清单」，模型更常见的做法是
    # 把清单粘在译文末尾，或干脆把「原样保留这些产品名」当成要翻译的句子。
    if "TypeSafe, System One" in out:
        return False
    # CJK 译文里整段是英文（提示词回显、模型自言自语）同样是坏值：
    # 上面只要求「含本族文字」，一条 "I'm Clavue. Review posted: ..." 也能通过。
    if lang in CJK_LANGS:
        latin_words = re.findall(r"[A-Za-z]{3,}", out)
        native = re.findall(r"[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]", out)
        if len(latin_words) > 3 and len(native) * 2 < len(latin_words):
            return False
    return True


def translate_term_strict(term, lang):
    return _translate_term(term, lang, TERM_PROMPT_STRICT)


def translate_term(term, lang):
    return _translate_term(term, lang, TERM_PROMPT)


def _translate_term(term, lang, prompt):
    """术语用单独的提示：短标识符常被原样返回，或被引号包起来。"""
    budget = 60
    payload = json.dumps({
        "model": GEN_MODEL,
        "messages": [{"role": "user", "content": prompt.format(lang_name=LANG_NAME[lang], term=term)}],
        "max_tokens": budget,
        "temperature": 0,
    }).encode("utf-8")
    try:
        with urllib.request.urlopen(urllib.request.Request(
            GEN_URL, data=payload, headers={"Content-Type": "application/json"}
        ), timeout=60) as r:
            d = json.loads(r.read().decode("utf-8"))
        out = clean(d.get("choices", [{}])[0].get("message", {}).get("content", ""))
    except Exception:  # noqa: BLE001
        return None
    return out if valid_term(term, lang, out) else None


def translate(text, lang):
    budget = max(120, int(len(text) * 2.2))
    payload = json.dumps({
        "model": GEN_MODEL,
        "messages": [{"role": "user", "content": PROMPT.format(
            lang_name=LANG_NAME[lang], text=text, native_hint=NATIVE_HINT.get(lang, ""))}],
        "max_tokens": min(budget, 1200),
        "temperature": 0,
    }).encode("utf-8")
    req = urllib.request.Request(GEN_URL, data=payload, headers={"Content-Type": "application/json"})
    last = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                d = json.loads(r.read().decode("utf-8"))
            out = clean(d.get("choices", [{}])[0].get("message", {}).get("content", ""))
            if out is None:
                raise ValueError("bad translation output")
            # 校验必须在这里做，不能只留到写回时。写回时才发现就等于没有重试：
            # 那时的失败只会让这一条回退到旧值（而旧值往往正是那条英文），
            # 坏值原样留在文件里，下一轮再「成功」一次，永远修不好。
            if not valid_body(text, lang, out):
                raise ValueError(f"untranslated or echoed output: {out[:40]!r}")
            return out
        except Exception as e:  # noqa: BLE001 - 重试后仍失败则记为 None
            last = e
            time.sleep(1 * (attempt + 1))
    print(f"    FAIL {text[:40]!r} -> {lang}: {last}", file=sys.stderr)
    return None


def run_jobs(unique, label, fn=None):
    """unique: [(lang, text)] 去重后并行翻译，返回 {(lang, text): 译文}。"""
    fn = fn or translate
    out = {}
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=CONCURRENCY) as ex:
        futs = {ex.submit(fn, text, lang): (lang, text) for lang, text in unique}
        done = 0
        for fut in as_completed(futs):
            key = futs[fut]
            try:
                value = fut.result()
            except Exception:  # noqa: BLE001
                value = None
            if value:
                out[key] = value
            done += 1
            if done % 100 == 0:
                print(f"  {label}: {done}/{len(unique)} ({time.time() - t0:.0f}s)", flush=True)
    print(f"{label}: {len(out)}/{len(unique)} 成功，{time.time() - t0:.0f}s")
    return out


briefs = json.load(open(BRIEFS, encoding="utf-8"))
if LIMIT:
    briefs = briefs[-LIMIT:]
ids = {b["id"] for b in briefs}
print(f"已发布案例 {len(ids)} 篇，目标语言 {LANGS}")

out = {}
if os.path.exists(OUT):
    out = json.load(open(OUT, encoding="utf-8"))

# ---- 正文 ----
body_jobs = set()
for b in briefs:
    for lang in LANGS:
        cur = out.get(b["id"], {}).get(lang) or {}
        # 逐字段判断，而不是「两个字段都非空就跳过」：某条只有 question 退回英文时，
        # 整体跳过会让那条坏值永远修不掉。
        if not valid_body(b["context"], lang, cur.get("context")):
            body_jobs.add((lang, b["context"]))
        if not valid_body(b["question"], lang, cur.get("question")):
            body_jobs.add((lang, b["question"]))

# ---- 术语 ----
terms = {f: sorted({b[f] for b in briefs if b.get(f)}) for f in FIELDS}
# 选择项是另一套枚举（yes/no、urgent、escalate…），单独收集。
# 语料里有一道「这段话是什么语言」的题，选项本身就是语言码，翻译它没有意义。
# 语言码选项也是选项：显示成各语言自己的语言名（见 LANGUAGE_LABELS）。
choice_values = sorted({c for b in briefs for c in (b.get("choices") or [])})
terms["choice"] = choice_values
term_jobs = set()
for f, values in terms.items():
    for lang in LANGS:
        for v in values:
            term_jobs.add((lang, v))

print(f"待翻正文 {len(body_jobs)} 条，术语 {len(term_jobs)} 条")
if DRY:
    for lang, text in sorted(body_jobs)[:5]:
        print(f"  [{lang}] {text}")
    print(f"  术语示例 {sorted(term_jobs)[:3]}")
    sys.exit(0)

existing_terms = {}
if os.path.exists(TERMS_JSON):
    existing_terms = json.load(open(TERMS_JSON, encoding="utf-8"))
# 只信任校验通过的旧值，坏值当作缺失重新翻。
# 人工词表例外：与英文同形但确实是该语言正确写法的词（法语 incident）不算坏值。
term = {
    (lang, v): txt
    for f_, bucket in existing_terms.items()
    for v, langs in bucket.items()
    for lang, txt in langs.items()
    if valid_term(v, lang, txt) or (v, lang) in MANUAL_TERMS
}
term_jobs = {(lang, v) for lang, v in term_jobs if (lang, v) not in term}

body = run_jobs(sorted(body_jobs), "正文")
term.update(run_jobs(sorted(term_jobs), "术语", translate_term))

# 人工词表优先于模型输出，也是唯一能保证同形词站点读起来自然的一层。
for (slug, lang), txt in MANUAL_TERMS.items():
    if slug in {v for values in terms.values() for v in values}:
        term[(lang, slug)] = txt

# 首轮常有一批 slug 被模型原样返回；换一条更硬的提示重试一次。
missing = [(lang, v) for f, values in terms.items() for v in values for lang in LANGS if (lang, v) not in term]
if missing:
    retry = run_jobs(sorted(set(missing)), "术语重试", translate_term_strict)
    term.update(retry)
    print(f"术语重试补齐 {len(retry)}/{len(set(missing))} 条")

applied = 0
for b in briefs:
    entry = out.setdefault(b["id"], {})
    for lang in LANGS:
        prev = entry.get(lang) or {}
        ctx = body.get((lang, b["context"])) or prev.get("context")
        q = body.get((lang, b["question"])) or prev.get("question")
        # 两个字段都得是真译文才写。本轮没翻出来就沿用旧值；旧值本身是英文
        # 或提示词回显时整条删掉，不能让它在 merge 里永生——之前正是「只跳过
        # 不删除」，16 条提示词回显的坏值才从旧文件里原样活了下来。
        if not valid_body(b["context"], lang, ctx) or not valid_body(b["question"], lang, q):
            entry.pop(lang, None)
            continue
        # choices 原样保留英文 slug：它们是判分用的键，翻译会改掉语义。
        # 展示层用术语表按语言渲染，键不变。
        entry[lang] = {"context": ctx, "question": q, "choices": list(b.get("choices") or [])}
        applied += 1

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2, sort_keys=True)
    f.write("\n")
print(f"写回 {applied} 条译文到 {os.path.relpath(OUT, ROOT)}，覆盖 {len(out)} 个 id")

# 术语表合并写回：按语言逐次跑时不覆盖已有语言。
term_out = {}
if os.path.exists(TERMS_JSON):
    term_out = json.load(open(TERMS_JSON, encoding="utf-8"))
for f_ in FIELDS:
    bucket = term_out.setdefault(f_, {})
    for v in terms[f_]:
        slot = bucket.setdefault(v, {})
        for lang in LANGS:
            t = term.get((lang, v))
            if t:
                slot[lang] = t
        # 旧文件里的坏值（拼错、照抄英文）不能在 merge 时被留下。
        for lang in list(slot):
            # 人工词表是可信来源：像法语 incident 这种与英文同形的词，
            # valid_term 会判成「没译」而删掉，但它们确实就是该语言的正确写法。
            if (v, lang) in MANUAL_TERMS:
                continue
            if not valid_term(v, lang, slot[lang]):
                del slot[lang]
with open(TERMS_JSON, "w", encoding="utf-8") as f:
    json.dump(term_out, f, ensure_ascii=False, indent=2, sort_keys=True)
    f.write("\n")

# 同一份数据再输出成 TS，供页面直接 import（避免构建期再解析 JSON 的手写转义）。
lines = [
    "/** 由 scripts/translate-briefs.py 生成，数据源 src/data/brief-terms.json。改词请改脚本后重跑。 */",
    "",
    "export const briefTerms: Record<string, Record<string, Record<string, string>>> = "
    + json.dumps(term_out, ensure_ascii=False, indent=2, sort_keys=True)
    + ";",
    "",
]
with open(TERMS_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"写回术语表到 {os.path.relpath(TERMS_FILE, ROOT)}")