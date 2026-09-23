---
title: "スキル提案"
description: "Nous ResearchのHermesカタログにある182のスキルの中から、エージェントのターンに対して最大1つのスキルを選択する。TypeSafeリクエストはまずすべてのスキルをランキングし、そのターンにスキルがそもそも必要かどうかを判断し、2番目のリクエストは上位3つを正しく読み取り、それらすべてを拒否することも可能である。勝者の名前はエージェントのシ"
section: cases
order: 270
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/skill_suggestion"
translatedFrom: en
---
*エージェントは、すべてのスキルを切り捨ててシステムメッセージに読み込むことでスキルを選択しますが、これによりコストが増加し、スキルの選択パフォーマンスが低下し、セッションの残りの部分でコンテキストの劣化が誘発されます。私たちは、ターンごとに2つのTypeSafeリクエストを使用することでこれを解決します。1つはスキルのランク付け用、もう1つは選択の検証用であり、これにより誤ったスキルの読み込みを半分以下に削減します。*

スキル roster が豊富なエージェントは、ほとんど情報がない状態で選択を行う。roster はインデックスとしてエージェントに渡される：スキルごとに1行で、説明文は切り捨てられており、完全なテキストが会話を圧迫しないようになっている。ここで使用されているエージェントハーネスであるHermesは、デフォルトで60文字に切り詰める。例えば、その幅では、`.pptx`ファイルを*編集する*スキルが、それらを*執筆する*スキルとほぼ同じように見える。ピッチデッキを依頼すると、エージェントは間違ったものを読み込む可能性がある。すべてのスキルが適合しないターンでも、エージェントはそれでも1つを読み込むことがある。なぜなら、名前のリストは推測を誘発するからである。

このクックブックは説明をそのままにし、段階的な開示を採用して、
182のスキルを低コストですべて読み、そのうち3つを詳細に読みます。どのスキルを
ロードするかという判断の前に、2つのTypeSafeリクエストが行われます。1つ目は、
ロースターのすべてのスキルをユーザーのターンに対してランク付けし、ターンに
スキルが必要かどうかを答えます。2つ目は、各スキルの完全な説明と
指示の冒頭を伴って、上位3つだけを再読み込みし、それらすべてを拒否する
自由があります。

勝者の名前は、そのターンにおけるエージェントのシステムプロンプトの1行追加されます：

```
<skill_relevance>
Relevant to the current request: pptx-author. Ignore this if it does not fit what the user
actually asked for.
</skill_relevance>
```

エージェントは完全なインデックスと独自の判断を保持しており、その1行は最初に見るべきエントリを指定するだけである。名簿自体は変更されないため、それに対するプレフィックスキャッシングは依然として有効である。`claude-haiku-4-5-20251001`に対して488件のリクエストを行い、Hermes名簿のスキルを使用した：

| | 間違ったスキルを読み込む | 適合するものがないのに1つだけ読み込む |
| ------------------------------------ | --------------------- | --------------------------- |
| ロスターのみを持つエージェント単体 | 16.8% | 9.8% |
| **TypeSafeによる提案付きエージェント** | **7.3%** | **4.0%** |
| 正解を渡されたエージェント | 2.5% | 1.2% |

3行目は、過ちの下限がゼロではないことを示している。なぜなら、適切なスキルを与えられたエージェントでも、必ずしもそれをロードするとは限らず、いかに優れた選択方法であっても、その壁を乗り越えることはできないからである。

`suggest()` 関数は最大で1つのスキル名を返し、`suggestion_block()` はそれをシステムプロンプト用にラップし、上記の表を生成したハarness は、あなたの独自のロスターを指し示す準備ができています。

<!-- mermaid flowchart converted to equivalent tables (this site loads no chart library) -->

*フロー方向：LR*

| ノード | 説明 | グループ |
| :--- | :--- | :--- |
| `C1` | コール1 - 182のスキルをすべてざっと読む | コール1 - 182のスキルをすべてざっと読む |
| `Q1` | 選択: どのスキルが合うか？ / 182すべて、それぞれ1行で | コール1 - 182のスキルをすべてざっと読む |
| `N1` | ノウル: スキルが本当に必要か？ / ・相手の行動に介入するか？ / ・書かれた手順に従うか？ / ・それともただ話すだけか？ | コール1 - 182のスキルをすべてざっと読む |
| `C2` | コール2 - その3つをちゃんと読む | コール2 - その3つをちゃんと読む |
| `Q2` | 選択: その3つのうちどれか？ / 今度こそ具体的な詳細で | コール2 - その3つをちゃんと読む |
| `N2` | ノウル: それぞれが / 本当にそれを実行できるか？ | コール2 - その3つをちゃんと読む |

| 元 | 条件 | 先 |
| :--- | :--- | :--- |
| `Q1` | — | `N1` |
| `Q2` | — | `N2` |
| `C1` | トップ3 | `C2` |
| `C1` | なし / 適用 | `STOP` |
| `C2` | 該当なし | `STOP` |
| `C2` | 勝者 | `OUT` |


## セットアップ

* TypeSafe クライアント、Anthropic クライアント、および共有クックブックヘルパーをインストールします。
* [TypeSafe API キー](https://console.typesafe.ai/keys) と、測定対象エージェント用の Anthropic キーを設定します。

```bash
pip install anthropic matplotlib ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
export TYPESAFE_API_KEY=your-key-here
export ANTHROPIC_API_KEY=your-key-here
```

> **注：** 以下のコードブロックは、順序通りに1つのスクリプトです。追従するには、示された順序で1つのファイルに配置してください。

キャッシュ結果

`JsonCache` は各呼び出しの結果を、入力キーで保存するため、再実行すると以下の数値が再生され、API への呼び出しは行われません。`json_cache.json` を削除するとライブ実行になります。公開された実行では `jev-1.12` と `claude-haiku-4-5-20251001` が使用され、2026-07-31 にレンダリングされました。

```python
import json
import os
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from time import perf_counter

import anthropic
import matplotlib
import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter
from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from typesafe_sdk import Choice, Noul, TypeSafeClient

matplotlib.use("Agg")  # headless render

TYPESAFE_MODEL = "jev-1.12"
AGENT_MODEL = (
    "claude-haiku-4-5-20251001"  # the agent under test, pinned so scores are stable
)

SHORTLIST = 3  # candidates carried from the first request into the second
EXCERPT_CHARS = (
    700  # SKILL.md characters each candidate brings; the roster file stores 1600
)
GATE_THRESHOLD = (
    0.30  # mean of the three request nouls, below which nothing is suggested
)
FITS_THRESHOLD = (
    0.30  # a shortlist whose best "does this fit" noul is under this is dropped
)
WORKERS = 8  # small pool: enough to keep a live run to minutes, gentle on rate limits

assert EXCERPT_CHARS <= 1600, (
    "the shipped roster file stores 1600 body characters per skill"
)

client = TypeSafeClient(
    api_key=os.environ.get(
        "TYPESAFE_API_KEY", "cache-only"
    ),  # keyless kernels replay the cache
    base_url=os.environ.get("TYPESAFE_ENDPOINT"),
    timeout=120.0,
)
agent = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", "cache-only"))
json_cache = JsonCache(Path("json_cache.json"))
```

## ステップ 1: ロスターを読み込む

`hermes_roster.json`は、[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) (MIT) の182のスキルを、特定のコミットに固定して保持しています。各レコードには、スキルの名前とカテゴリ、インデックスが示す説明、完全な説明、およびその`SKILL.md`の冒頭が含まれています。

以下のインデックスおよびプロンプト内のその上の指示は、Hermesからコピーされたものです。

```python
ROSTER = json.loads(Path("hermes_roster.json").read_text(encoding="utf-8"))
BY_NAME = {skill["name"]: skill for skill in ROSTER}

# Verbatim from hermes-agent agent/prompt_builder.py:build_skills_system_prompt.
PREAMBLE = (
    "## Skills (mandatory)\n"
    "Before replying, scan the skills below. If a skill matches or is even partially relevant "
    "to your task, you MUST load it with skill_view(name) and follow its instructions. "
    "Err on the side of loading — it is always better to have context you don't need "
    "than to miss critical steps, pitfalls, or established workflows. "
    "Skills contain specialized knowledge — API endpoints, tool-specific commands, "
    "and proven workflows that outperform general-purpose approaches. Load the skill "
    "even if you think you could handle the task with basic tools like web_search or terminal. "
    "Skills also encode the user's preferred approach, conventions, and quality standards "
    "for tasks like code review, planning, and testing — load them even for tasks you "
    "already know how to do, because the skill defines how it should be done here.\n"
    "Whenever the user asks you to configure, set up, install, enable, disable, modify, "
    "or troubleshoot Hermes Agent itself — its CLI, config, models, providers, tools, "
    "skills, voice, gateway, plugins, or any feature — load the `hermes-agent` skill "
    "first. It has the actual commands (e.g. `hermes config set …`, `hermes tools`, "
    "`hermes setup`) so you don't have to guess or invent workarounds.\n"
    "If a skill has issues, fix it with skill_manage(action='patch').\n"
    "After difficult/iterative tasks, offer to save as a skill. "
    "If a skill you loaded was missing steps, had wrong commands, or needed "
    "pitfalls you discovered, update it before finishing.\n"
    "\n"
)
FOOTER = "\n\nOnly proceed without loading a skill if genuinely none are relevant to the task."
IDENTITY = (
    "You are Hermes, a capable AI assistant with access to tools and a library "
    "of skills. You help the user with coding, research, and everyday tasks.\n\n"
)


def render_index() -> str:
    """The body of <available_skills>: skills grouped by category, both sorted by name."""
    by_category = defaultdict(list)
    for skill in ROSTER:
        by_category[skill["category"]].append(skill)
    lines = []
    for category in sorted(by_category):
        lines.append(f"  {category}:")
        for skill in sorted(by_category[category], key=lambda s: s["name"]):
            lines.append(f"    - {skill['name']}: {skill['description']}")
    return "\n".join(lines)


CATALOG_PROMPT = (
    IDENTITY
    + PREAMBLE
    + "<available_skills>\n"
    + render_index()
    + "\n</available_skills>"
    + FOOTER
)

widths = [len(skill["description"]) for skill in ROSTER]
print(f"{len(ROSTER)} skills in {len({s['category'] for s in ROSTER})} categories")
print(f"roster prompt: {len(CATALOG_PROMPT):,} characters")
print(
    f"index description: {sum(widths) / len(widths):.0f} characters on average, "
    f"{max(widths)} at most"
)
print("\none category, as the agent reads it:")
index_lines = render_index().splitlines()
start = index_lines.index("  apple:")
end = next(
    i
    for i in range(start + 1, len(index_lines))
    if not index_lines[i].startswith("    ")
)
print("\n".join(index_lines[start:end]))
```

```
182 skills in 33 categories
roster prompt: 16,089 characters
index description: 54 characters on average, 60 at most

one category, as the agent reads it:
  apple:
    - apple-notes: Manage Apple Notes via memo CLI: create, search, edit.
    - apple-reminders: Apple Reminders via remindctl: add, list, complete.
    - findmy: Track Apple devices/AirTags via FindMy.app on macOS.
    - imessage: Send and receive iMessages/SMS via the imsg CLI on macOS.
```

## ステップ 2: エージェントを自身について評価する

`requests.json`は488件の単発リクエストを保持しており、そのうち315件はちょうど1つのスキルによってカバーされ、残りの173件は何にもカバーされていない。

カバーされたリクエストは、各スキルの`SKILL.md`からClaude Sonnet 5によって記述されたものであり、ラベルは信頼でき、リクエストはユーザーが送信するものよりも簡単です。

173件の発見されたものは、すべて推測を罰するために書かれた：85件の日常リクエスト、スキルが対応できない42件の技術的な質問（*モナドとは何かを説明せよ*）、そして、リストがXとそれ以外の何もないことをカバーしているような *Mastodonに投稿せよ* のように、リストにスキルがない特定のものを求める46件。

スコアリングはエージェントの最初の応答のみを読み取ります。両方の数値はエラー率であるため、それぞれにおいて低い方が
優れています：

* **誤った読み込み**: カバートされたリクエストのうち、最初の `skill_view` 呼び出しが
 対応するスキルではなかった割合。何も読み込まなかったターンはミスとしてカウントされる。
* **不要な読み込み**: カバートされていないリクエストのうち、エージェントが
 `skill_view` を呼び出した割合。

```python
REQUESTS = json.loads(Path("requests.json").read_text(encoding="utf-8"))
POSITIVES = [p for p in REQUESTS if p["gold"]]
NEGATIVES = [p for p in REQUESTS if not p["gold"]]

print(
    f"{len(REQUESTS)} requests: {len(POSITIVES)} covered by a skill "
    f"({len({p['gold'] for p in POSITIVES})} distinct skills), {len(NEGATIVES)} covered by none"
)
print(f"\ncovered   [{POSITIVES[0]['gold']}]  {POSITIVES[0]['text']}")
print(f"uncovered  {NEGATIVES[0]['text']}")
```

```
488 requests: 315 covered by a skill (171 distinct skills), 173 covered by none

covered   [1password]  I've got a config.yaml with `{{ op://app-prod/db/password }}` placeholders in it — can you set up my project to pull the real values in at runtime instead of hardcoding them?
uncovered  Add these three cards to our Trello backlog.
```

提案は、システムプロンプト内の独自のブロックに配置され、リスト内ではなくその後に置かれます。これにより、リストのテキストはすべてのターンで同一となり、プレフィックスキャッシュが維持されます。

エージェントは最小限のツールセットを持っており、その中には `skill_view` を使って自由形式の名前でスキルをロードするものが含まれます。正確なロードのためには、名前がスキルと完全に一致している必要があります。

```python
# Verbatim from hermes-agent tools/skills_tool.py:SKILL_VIEW_SCHEMA.
SKILL_VIEW_DESCRIPTION = (
    "Skills allow for loading information about specific tasks and workflows, as "
    "well as scripts and templates. Load a skill's full content or access its "
    "linked files (references, templates, scripts). First call returns SKILL.md "
    "content plus a 'linked_files' dict showing available references/templates/"
    "scripts. To access those, call again with file_path parameter."
)
TOOLS = [
    {
        "name": "skill_view",
        "description": SKILL_VIEW_DESCRIPTION,
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "The skill name."}
            },
            "required": ["name"],
        },
    },
    {
        "name": "terminal",
        "description": "Run a shell command on the user's machine and return its output.",
        "input_schema": {
            "type": "object",
            "properties": {"command": {"type": "string"}},
            "required": ["command"],
        },
    },
    {
        "name": "read_file",
        "description": "Read a file from the user's filesystem.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"],
        },
    },
    {
        "name": "web_search",
        "description": "Search the web and return result snippets.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
]


@json_cache
def run_turn(model: str, arm: str, request: str, suggestion: str) -> dict:
    """One measured turn. ``arm`` is in the key so each arm samples independently."""
    system = [
        {"type": "text", "text": CATALOG_PROMPT, "cache_control": {"type": "ephemeral"}}
    ]
    if suggestion:
        system.append({"type": "text", "text": suggestion})  # after the breakpoint
    response = agent.messages.create(
        model=model,
        max_tokens=1024,
        system=system,
        tools=TOOLS,
        messages=[{"role": "user", "content": request}],
    )
    usage = response.usage
    return {
        "loaded": [
            str(block.input.get("name", ""))
            for block in response.content
            if block.type == "tool_use" and block.name == "skill_view"
        ],
        "input_tokens": usage.input_tokens or 0,
        "output_tokens": usage.output_tokens or 0,
    }


def summarise(turns: dict[str, dict]) -> dict[str, float]:
    """Two failure rates: wrong loads on covered requests, needless ones on uncovered."""
    hits = [turns[p["text"]]["loaded"][:1] == [p["gold"]] for p in POSITIVES]
    over = [bool(turns[p["text"]]["loaded"]) for p in NEGATIVES]
    return {
        # both metrics are errors, so the two columns read the same direction
        "wrong_load": 1 - sum(hits) / len(hits),
        "needless_load": sum(over) / len(over),
    }


def run_arm(arm: str, suggestions: dict[str, str]) -> dict[str, dict]:
    """One measured turn per request, in a small pool. 488 calls."""
    texts = [request["text"] for request in REQUESTS]
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        turns = pool.map(
            lambda t: run_turn(AGENT_MODEL, arm, t, suggestions.get(t, "")), texts
        )
        return dict(zip(texts, turns))
```

エージェントは、今日の運用方式通り、その名簿のみで最初に実行される。その2つのエラー率は、残りのクックブックが測定する基準値となる。

```python
baseline = run_arm("baseline", {})
base_scores = summarise(baseline)
print(
    f"wrong loads    {base_scores['wrong_load']:.1%}   ({len(POSITIVES)} covered requests)"
)
print(
    f"needless loads {base_scores['needless_load']:.1%}   ({len(NEGATIVES)} uncovered requests)"
)

# where the wrong loads land: a neighbour of the right skill, or somewhere unrelated?
misses = [
    (p["gold"], baseline[p["text"]]["loaded"][0])
    for p in POSITIVES
    if baseline[p["text"]]["loaded"] and baseline[p["text"]]["loaded"][0] != p["gold"]
]
same_category = sum(
    1
    for gold, got in misses
    if got in BY_NAME and BY_NAME[got]["category"] == BY_NAME[gold]["category"]
)
print(
    f"\nof {len(misses)} wrong first picks, {same_category} came from the right skill's own "
    f"category"
)
```

```
wrong loads    16.8%   (315 covered requests)
needless loads 9.8%   (173 uncovered requests)

of 36 wrong first picks, 10 came from the right skill's own category
```

誤った負荷は、偶然が示すよりもはるかに高い確率で、正しいスキルのカテゴリに分類されてしまうため、難しいのは似通ったものを区別することです。エージェントはすでにほぼ正しい場所を探しています。

## ステップ3：ロースター全体をランク付け

一つのリクエストには、二種類の問いが含まれる：

* **`which`** は、182 のスキル名すべてを対象とした [`Choice`](/en/primitives/choice/) 質問であり、各選択肢の基準としてインデックスの説明（エージェント自体が受け取るのと同じテキスト）が用いられます。その確率がランキングとなります。
* リクエストに関する [`Noul`](/en/primitives/noul/) 質問が **3つ** あり、以下に示されています。それぞれ、説明を与えるのではなく行動を起こすことを望んでいるかどうかを異なる方法で問いかけています。`prose_suffices` は逆方向でカウントされます。それらの平均値によって、何らかの提案を行うかどうかが決まり、0.30 未満の場合は何も提案されません。

どちらも1つのリクエストで送信されるため、ランキングとチェックの処理は1往復で済みます。

これら3つは、アクションが望ましいかどうかを尋ねるために記述する。主題に関する質問は、*モナドとは何かを説明する*とスキルを要するリクエストを分離しない。なぜなら、両者ともソフトウェアに関連するものだからである。

`Choice` 1つの質問で、この規模のリストをすんなり処理できる。数倍大きくなれば、チャンクに分割して各チャンクをランク付けし、その後、勝者たちに対してこの短いリスト作成ステップを再実行する。

```python
CHOICE_INSTRUCTIONS = (
    "Which of these skills, if any, is the right one to load to help with the "
    "user's latest request?"
)
GATE_QUESTIONS = {
    "acts_on_user_system": (
        "Is the assistant being asked to act on the user's files, accounts, devices, "
        "or online services, rather than only to explain or advise?"
    ),
    "would_follow_documented_procedure": (
        "Would a careful expert answering this consult a specific documented procedure "
        "or set of commands, rather than answering from general understanding?"
    ),
    "prose_suffices": (
        "Could a knowledgeable generalist fully satisfy this request in prose, with "
        "no tools, no documentation, and no access to the user's files or accounts?"
    ),
}
INVERTED = {"prose_suffices"}  # a yes here points away from needing a skill


def build_state(request: str) -> dict:
    return {"request": request, "recent_context": ""}


@json_cache
def rank_wide(request: str) -> dict:
    """Request 1: rank all 182 skills, and score the request for whether a skill applies."""
    questions = {
        "which": Choice(
            instructions=CHOICE_INSTRUCTIONS,
            criteria={skill["name"]: skill["description"] for skill in ROSTER},
        )
    }
    for key, text in GATE_QUESTIONS.items():
        questions[f"gate::{key}"] = Noul(instructions=text)
    started = perf_counter()
    response = client.system_one(
        state=build_state(request), questions=questions, model=TYPESAFE_MODEL
    )
    ranked = sorted(
        response.answers["which"].probabilities.items(), key=lambda kv: -kv[1]
    )
    values = {
        key.removeprefix("gate::"): answer.noul
        for key, answer in response.answers.items()
        if key.startswith("gate::")
    }
    oriented = [(1.0 - v) if k in INVERTED else v for k, v in values.items()]
    return {
        "ranked": ranked[
            :12
        ],  # more than any shortlist needs, and keeps the cache small
        "gate": sum(oriented) / len(oriented),
        "values": values,
        "seconds": round(perf_counter() - started, 2),
        "input_tokens": response.usage.input_tokens or 0,
        "output_tokens": response.usage.output_tokens or 0,
    }


DEMO = [
    "Can you save this recipe as a new note in my 'Recipes' folder in Notes.app so it syncs"
    " to my phone? Just write it up in whatever editor pops up.",
    "Can you put together a pitch deck skeleton (cover, situation overview, comps, precedent"
    " transactions, DCF, LBO) as a .pptx, using our firm-template.pptx for branding and"
    " footnoting each valuation number back to the cell it came from in the model?",
    "Post this announcement to my Mastodon account.",
]
for request in DEMO:
    wide = rank_wide(request)
    verdict = "suggest" if wide["gate"] >= GATE_THRESHOLD else "stay quiet"
    print(f'"{request[:78]}"')
    print(f"  needs a skill {wide['gate']:.2f} -> {verdict}   ({wide['seconds']}s)")
    for name, probability in wide["ranked"][:SHORTLIST]:
        print(f"    {probability:.3f}  {name:<38}{BY_NAME[name]['description']}")
    print()
```

```
"Can you save this recipe as a new note in my 'Recipes' folder in Notes.app so "
  needs a skill 0.75 -> suggest   (0.31s)
    0.990  apple-notes                           Manage Apple Notes via memo CLI: create, search, edit.
    0.010  computer-use                          Drive the user's desktop in the background — clicking, ty...
    0.000  concept-diagrams                      Generate flat, minimal educational SVG visuals as HTML.

"Can you put together a pitch deck skeleton (cover, situation overview, comps, "
  needs a skill 0.76 -> suggest   (0.16s)
    0.700  powerpoint                            Create, read, edit .pptx decks, slides, notes, templates.
    0.300  pptx-author                           Build PowerPoint decks headless with python-pptx.
    0.000  chroma                                Embedding database for RAG and semantic search.

"Post this announcement to my Mastodon account."
  needs a skill 0.78 -> suggest   (0.16s)
    0.550  xurl                                  X/Twitter via xurl CLI: raw post search, posting, DM, media.
    0.140  computer-use                          Drive the user's desktop in the background — clicking, ty...
    0.080  openhands                             Delegate coding to OpenHands CLI (model-agnostic, LiteLLM).
```

Notes.appへのリクエストは明確であり、その最上位の選択肢が正解です。ランキングが何をやってもMastodon版は救えません：3つの質問はスキルが求められていることを示しており、アカウントへの投稿はアクションだからです。Xへの投稿用スキルがありMastodon用がない場合、最も近いスキルが勝つことになります。

残るのはデッキだけ。両者のリーダーは`.pptx`のスキルであり、60文字という制約下では、広義のChoice質問において、作成スキルが編集スキルを上回るため、デッキの作成に関するリクエストには適している。

## ステップ4：上位3つを再ランク付け

3つの選択肢は、各スキルの完全な説明と`SKILL.md`の冒頭部分の両方を収める余地を残しており、2番目のリクエストはより良い証拠に対して同じ質問を投げかけています：

* **`which`** は、ショートリストに対する`Choice`の質問であり、各選択肢の基準としてその長いテキストが用いられます。
* **`fits::{name}`** は、各候補者ごとに1つの`Noul`の質問です：このスキルは、リクエストで求められている特定の事柄を実行できるか？ それぞれが個別に回答され、すべてが低い評価になることもあり、最高値が0.30を下回るショートリストは完全に除外されます。

```python
RERANK_INSTRUCTIONS = (
    "Exactly one of these skills is the right one to load for the user's latest "
    "request. Which one? Read what each actually does, not just its name."
)


def rerank_criteria(names: tuple[str, ...], excerpt: int) -> dict[str, str]:
    return {
        name: f"{BY_NAME[name]['description_full']} — {BY_NAME[name]['body'][:excerpt]}"
        for name in names
    }


def rerank_questions(names: tuple[str, ...], excerpt: int) -> dict:
    questions = {
        "which": Choice(
            instructions=RERANK_INSTRUCTIONS, criteria=rerank_criteria(names, excerpt)
        )
    }
    for name in names:
        questions[f"fits::{name}"] = Noul(
            instructions=(
                f"Does the skill '{name}' do the specific thing the user's request asks "
                f"for? It is described as: {BY_NAME[name]['description_full']}"
            )
        )
    return questions


@json_cache
def rerank(request: str, names: tuple[str, ...], excerpt: int) -> dict:
    """Request 2: the same Choice over a shortlist, plus one absolute noul per candidate."""
    started = perf_counter()
    response = client.system_one(
        state=build_state(request),
        questions=rerank_questions(names, excerpt),
        model=TYPESAFE_MODEL,
    )
    return {
        "winner": response.answers["which"].choice,
        "fits": {
            key.removeprefix("fits::"): answer.noul
            for key, answer in response.answers.items()
            if key.startswith("fits::")
        },
        "seconds": round(perf_counter() - started, 2),
        "input_tokens": response.usage.input_tokens or 0,
        "output_tokens": response.usage.output_tokens or 0,
    }


for request in DEMO:
    wide = rank_wide(request)
    if wide["gate"] < GATE_THRESHOLD:
        print(f'"{request[:78]}"\n  scored too low, nothing suggested\n')
        continue
    shortlist = tuple(name for name, _ in wide["ranked"][:SHORTLIST])
    result = rerank(request, shortlist, EXCERPT_CHARS)
    best = max(result["fits"].values())
    verdict = result["winner"] if best >= FITS_THRESHOLD else "nothing fits"
    print(f'"{request[:78]}"')
    print(f"  was {shortlist[0]} -> {verdict}   ({result['seconds']}s)")
    for name in shortlist:
        print(f"    fits {result['fits'][name]:.2f}  {name}")
    print()
```

```
"Can you save this recipe as a new note in my 'Recipes' folder in Notes.app so "
  was apple-notes -> apple-notes   (0.12s)
    fits 0.60  apple-notes
    fits 0.54  computer-use
    fits 0.01  concept-diagrams

"Can you put together a pitch deck skeleton (cover, situation overview, comps, "
  was powerpoint -> pptx-author   (0.09s)
    fits 0.73  powerpoint
    fits 0.38  pptx-author
    fits 0.02  chroma

"Post this announcement to my Mastodon account."
  was xurl -> xurl   (0.09s)
    fits 0.56  xurl
    fits 0.38  computer-use
    fits 0.05  openhands
```

`.pptx` の2つのスキルは、それぞれが独自のテキストをもたらす際に1回ずつ分離します：デッキの要求がオーサリングスキルに切り替わります。

`fits`のNoulとChoiceはここで意見が分かれています：Noulは編集スキルを高く評価する一方、Choiceは作成スキルを選択します。これらは異なる事項を判断しています。Choiceは*どの*スキルかを決定し、Noulは*そもそも*何らかの言及を行うかどうかを決定します。

Mastodon に関するリクエストは両方のチェックを通過します：その最良の`fits` noul は 0.30 を上回るため、Mastodon に関するリクエストには X スキルが推奨されます。これに似たほとんどのリクエストは検出されます。
2 回目のパスでは、広範囲なランキングが渡したものを拒否することしかできず、ここではそれが 3 つのニアミスでした。

以下の関数は、レシピ全体です。2つのリクエストと2つの閾値があり、返ってくるスキル名は最大1つです。

自分のロスターを指すには、`hermes_roster.json`を置き換えてください。上記の質問はすべて、そのファイルから`name`、`description`、`description_full`、そして`body`を読み取っており、それ以外にヘルメスについて知っていることはありません。

```python
def suggest(request: str) -> tuple[str, ...]:
    """At most one skill name for a request, or () for "nothing here applies"."""
    wide = rank_wide(request)
    if wide["gate"] < GATE_THRESHOLD:
        return ()
    shortlist = tuple(name for name, _ in wide["ranked"][:SHORTLIST])
    result = rerank(request, shortlist, EXCERPT_CHARS)
    if max(result["fits"].values()) < FITS_THRESHOLD:
        return ()
    return (result["winner"],)


def suggestion_block(names: tuple[str, ...]) -> str:
    """What gets appended after the roster, in the suggestion.

    This string is a measured input rather than prose: it goes to the agent, so it is part
    of every graded turn's cache key. Editing a word here silently invalidates the shipped
    results and costs a live re-run to restore them.
    """
    body = (
        f"Relevant to the current request: {', '.join(names)}. Ignore this if it does not "
        "fit what the user actually asked for."
        if names
        else "No skill in the roster appears relevant to this request."
    )
    return f"\n\n<skill_relevance>\n{body}\n</skill_relevance>"


print(suggestion_block(suggest(DEMO[1])))
print(suggestion_block(suggest(DEMO[2])))
```

```


<skill_relevance>
Relevant to the current request: pptx-author. Ignore this if it does not fit what the user actually asked for.
</skill_relevance>


<skill_relevance>
Relevant to the current request: xurl. Ignore this if it does not fit what the user actually asked for.
</skill_relevance>
```

## ステップ5：提案を測定する

488件のリクエストそれぞれについて、エージェントに対して3回アクセスし、各アクセスで1ターンを測定する。実行の違いは、エージェントに伝えられる内容のみによる。

| | システムプロンプトに含める内容 |
| ----------------------- | ------------------------------------------------------------------ |
| エージェントのみ | なし |
| 提案付きエージェント | whatever `suggest()` が返したもの |
| 回答付きエージェント | カバースキルの名前、または該当がない場合は「nothing applies」 |

3番目は達成不可能です。これは、他の2つが測定される基準となる天井です。

その提案の文言は二つの役割を果たしている。それは、提案は無視してよいことを示しており、より強く押せば間違った提案に対してもコンプライアンスが得られるためであり、また、間違った提案は何も提案しないよりも悪いからである。そして、提案がないターンでも、それを伝える一文が送られます；何も送らなければ、ロースターの「読み込み側に誤差を許す」という指示が反対意見なく放置されてしまう。

```python
texts = [request["text"] for request in REQUESTS]
with ThreadPoolExecutor(max_workers=WORKERS) as pool:  # up to 488 x 2 TypeSafe requests
    suggested = dict(zip(texts, pool.map(suggest, texts)))
WIDE = {text: rank_wide(text) for text in texts}  # all cache hits now; reused below

arms = {
    "baseline": {},
    "TypeSafe": {
        request["text"]: suggestion_block(suggested[request["text"]])
        for request in REQUESTS
    },
    "oracle": {
        request["text"]: suggestion_block((request["gold"],) if request["gold"] else ())
        for request in REQUESTS
    },
}
scores = {
    arm: summarise(run_arm(arm, suggestions)) for arm, suggestions in arms.items()
}

print(f"{'run':<10}{'wrong loads':>13}{'needless loads':>16}")
for arm, row in scores.items():
    print(f"{arm:<10}{row['wrong_load']:>13.1%}{row['needless_load']:>16.1%}")


def fewer(metric: str) -> str:
    """The plain ratio between the two arms' error rates."""
    return f"{scores['baseline'][metric] / scores['TypeSafe'][metric]:.1f}x fewer"


print(
    f"\nbaseline -> TypeSafe:  {fewer('wrong_load')} wrong loads, "
    f"{fewer('needless_load')} needless ones"
)
```

```
run         wrong loads  needless loads
baseline          16.8%            9.8%
TypeSafe           7.3%            4.0%
oracle             2.5%            1.2%

baseline -> TypeSafe:  2.3x fewer wrong loads, 2.4x fewer needless ones
```

```python
moved = [
    (
        baseline[p["text"]]["loaded"][:1] == [p["gold"]],
        run_turn(AGENT_MODEL, "TypeSafe", p["text"], arms["TypeSafe"][p["text"]])[
            "loaded"
        ][:1]
        == [p["gold"]],
    )
    for p in POSITIVES
]
print(
    f"of {len(POSITIVES)} covered requests: {sum(not b and a for b, a in moved)} the suggestion "
    f"fixed, {sum(b and not a for b, a in moved)} it broke"
)
```

```
of 315 covered requests: 37 the suggestion fixed, 7 it broke
```

この提案は、壊すリクエストよりもはるかに多くのリクエストを修正しますが、エージェントが本来正しく処理していたいくつかのリクエストを壊してしまいます。ターン前に提示することの代償として、何もしない提案よりも、自信に満ちた誤った提案の方が説得力を持ちます。

```python
SURFACE, INK, INK2, MUTED = "#fcfcfb", "#0b0b0b", "#52514e", "#898781"
GRID, AXIS, BLUE, ORANGE = "#e1e0d9", "#c3c2b7", "#2a78d6", "#eb6834"

ARM_COLOR = {"baseline": BLUE, "TypeSafe": ORANGE, "oracle": MUTED}


def style(ax):
    ax.set_facecolor(SURFACE)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(AXIS)
    ax.tick_params(colors=MUTED, labelcolor=INK2, labelsize=9)
    ax.set_axisbelow(True)


panels = [
    ("wrong_load", f"wrong loads\n{len(POSITIVES)} covered requests"),
    ("needless_load", f"needless loads\n{len(NEGATIVES)} uncovered requests"),
]
names = list(scores)
fig, axes = plt.subplots(1, 2, figsize=(8.4, 3.6), facecolor=SURFACE)
for ax, (metric, title) in zip(axes, panels):
    style(ax)
    ax.grid(axis="y", color=GRID, linewidth=0.8)
    values = [scores[arm][metric] for arm in names]
    bars = ax.bar(
        names,
        values,
        0.58,
        color=[ARM_COLOR[arm] for arm in names],
        # the oracle is a ceiling, not a competitor: gray, and hatched so it never depends
        # on colour alone
        hatch=["", "", "///"],
        edgecolor=SURFACE,
        linewidth=1.2,
    )
    ax.bar_label(
        bars,
        labels=[f"{v:.1%}" for v in values],
        padding=3,
        color=INK2,
        fontsize=9,
    )
    ax.set_title(title, loc="left", color=INK2, fontsize=9.5)
    ax.set_ylim(0, max(values) * 1.28)
    ax.yaxis.set_major_formatter(PercentFormatter(xmax=1, decimals=0))
    ax.set_ylabel("% of those requests - lower is better", color=INK2, fontsize=9)
fig.suptitle(
    f"Hermes' {len(ROSTER)}-skill roster, {len(REQUESTS)} requests, {AGENT_MODEL}",
    x=0.02,
    ha="left",
    color=INK,
    fontsize=11,
)
fig.tight_layout()
display(fig)
plt.close(fig)
```

<img src="/img/cases/skill-suggestion-skill_suggestion.executed.1.png" alt="output" width="1242" height="534" data-path="cookbooks/skill_suggestion/skill_suggestion.executed.1.png" />

## 結果が示すもの

* 誤った負荷は16.8%から7.3%に、不要なものは9.8%から4.0%に減少し、これは切り捨てられたインデックスから推測することと答えを渡されることの間の大部分の差を説明している。
* エージェントが単独で正しく処理していたリクエストの一部は、提案が添付されると誤った結果になる。カウント数は上記の通り。

エージェントが多数の候補を扱っているときは、この形をコピーせよ。まずは安価な全体ランク付けを行い、その後、2〜3つに焦点を当てて詳細に調べる。いずれのステップも、結果が得られない場合がある。

## プレイグラウンドで開く

ステップ4のデッキリクエストに対して、各候補の完全な説明と本文の抜粋を条件として使用し、プレイグラウンドリンクを構築してください。

```python
demo_shortlist = tuple(name for name, _ in rank_wide(DEMO[1])["ranked"][:SHORTLIST])
playground_link = make_playground_link(
    build_state(DEMO[1]),
    rerank_questions(demo_shortlist, EXCERPT_CHARS),
    models=[TYPESAFE_MODEL],
)
display(
    Markdown(
        f"🔗 [Open the shortlist + questions in the TypeSafe playground]({playground_link})"
    )
)
```

[TypeSafeプレイグラウンドでショートリストと質問を開く →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiAE4ICOMCAziqQaQMICGS+AnhDPgA4wU+FBADmCFAAsEZfK34BLFFEn4wCKAGt8tTQgA2EiBwAUUCADcZAGh1KYrFAuP5LMiwoQB3W+bh9aWz4KKAR1VGEydlpWKCdjQPwAEWYAMVsAGQAhAHkASjlaOXwAOj4+FExbGFoFJFFXGFkAMwUyOABaFAR-fUcEMorMfGaIWQAjKKQwOob2MBGICBQkZdn8BFjVC1Z9B3iOJHhxmXxx2O0RYWl8UP19fCVb1kQRsgg4R44pBHw4CHU+gA-KRbKQQsgUAB9cyoLAMPD4UikAC+IFsIGCHwqtAw2ERRFIXkkChUjHwJBAKE4fAQ5NIKggpLp6KRICgZCUMgUrHJlL4EC8MgFdQRTBAzAo-VsUrAtjCT0GlTUGk0iVo+gU6kSq26iW6vX6tBK+EAKAT4ADE+AACoLhUyIgBlTQKe74SWbboyzZyuTTDYzIS2oVkW2ilVaIrm5rvTq0DmOFT4cRIGSOZwcLxKVTlSopgBW+p6fD63Q651oYQDSnWHnkMxCQgAGgBZDJ-dgKASljO2Wi01h6WS6ui+SSsMgoRLzFW1UQcACKAEETUv8AADJWYdePIryABaAElrXIyCoFFZXM18K3261DMbLVaAOrSb4QfAAVUrX5-UgURS6K6DzsJwwgKK88hbq4shlMswz3r8AFfBYED6FYCx1H6YFeKwYHmqwRR1AIKC2DwKAkWREzLJIBAcp66walqvzqJGQRKEmrFqlR-AUJWqDpgkADc+CyusYwbNgURxOs3TYG8HzYaUuaYCJCpOPUkkARpDTBHQkKCUgtAiX44x1OJsj9pqKA6TomrqCMrp0CJXhjC6mlZlIwjFqWdD4CYcGVHkth9NwgjqgOQ74COiQSX4iCoI+aCcqI4iyMSyAIFYsg-PgNSnAlBxFMQJXgKq1glaQSKlUx2oVaV1WkHp-EoIZ9VVRJFDNDIyChHuylDAA9IFCFOUgLwDE+NoUBQ1AAVyoJsipHSsIIkhjPSIBZDAroLMGMhhhEXFFNIrBgA+RSeTmnBSMYHQqSa5pWstq23bI1rvGAMChMU0GIa4HAzLoeW1Jp658Dd61IPdQybr+vwZRwYXRQgVZXICF6nPWqqFMU-0Tk4zSxKR0XLGonKXvImqXvtoYOkIla0LUxirmArAVFWMaKUuqCSO8fCkgA5EU4NDCta1jDuM7gxxkgdFxO5AfcREcAA2uwUj86StCDa041IFAPL6B0lZkB4fUALomJINkBLgg2DaI2YwOMJR+INGt8xAAtQDrevsIbuwm+4zK0HkJpoDcLbMCeg34DkzStKEHQAFKOmcUwqH5EDXrlYwKE7436HuFDk97tILOa-57kz8B+ad510EU1qQyz+CpBJuWTBAZ02HI+iypwJskuUVa04dQivetnKaUrDwmLVo46JFpwxfKcAnGAiSIDMrDBToqPXL84w7foKAdFh4N2mQIqoIrLr3BHJKAQ-DzIVTBc2zIHRCp-Qh8I4boZBvgwFTAsUYsh-iAnLBcKsx1-IC2UKoY6thDzMD+D0CAiRNjANmEUGKBQMqlyyjIMCRwN4FRqEIFA0lfhXHkLQHgZ4EZuXGEsTQJoLRWhyIIPgi0GRezgLyREpAACiFCwAzE0mzVqFZfgQPwAAJSXAAcT9AsSsQjUCkgPhOFQj1LTukEfIDo8daTQ0dEwn64jN5SIaEkRwrA5H4Ejr8Jch4OjjScJeGRTjCLyIkifXa6wMgZBbHIcomooCGUutmDB-wyCcE4S+N8wgPz5SMbGeQAAqbJ35fjMGMfgRGuBcn4FMdtYJmllFqJMBQGhngdjG1WqIQqVYUxpgOAUdmJZSQxPKfgAAcqjBY+hoC7EGpWfQzQOjrXoFWKwcQJK+OcaY58GtXDmJNlY34jC9gHH8kuABWd8AACYSgAAYCimI+ssZYNJ1hYRHGwiAaoBmOh6BrHRlY9GqDcLISAsBCpFFMY6EQM8Gg9FsXg4pcTECtV8fgXJLYJCcl9rkggpjcmnIACzWAAMwXIuQAanwCopQAAJF2OhWpkFoGUrF2SACM1gACcRLSUQLVAypF2SLBMpKPiwVZSF6yMMLYIUCBND6DAhQQw-iw4DNyUcrYvxzkXPwFE5AlYym5Pyf3IBXjMYq3mWdDFSrsnWjqBoYwCBzUtnYKwcQCwoBjJgL6V6EATbRM1JpRlqR3GOkdOa60TRdkQVdBOJQYEflnkkLYVYGCEWOItc+TYdZughs+t9A5bZPHph8Y41ZvKFxgCmCgc1FLP5shRGCEAdR6BkBzRmWgm1RGYGJjKgGvwc5Hx-HPIiRRcopRtt2tJmqe7gM7jcfKZBhaaqNEIWaNB6AmlfKSP5qYgRKJ9MU8cQhNhJmJg4e4YFIBL11PgfMVDHhTmihNEoqI62tCnLgXAAoQy3zFBSUg1JaSbVWDAfQ-D61GRoc2hIm0kgQD8rlOe+BBYfvtKKQWagPxwdpIbJO1xZIztNvO5ddBJ66CKBA7dh4hDIW1ByBQm9CgEA9NKUSPp5SBgGsqFBdlmI6mWEvA0JYjSPpALWtkL7aBvpehLMgfJf00hZOKQDwHWSkAbeBmSkGREgGg7Bm48HENiynmMVDkAj7Lw0AobD-5NK5VnQRqgK7iNvLI-gCju5Zw0bo4RAglT9B7WvhPCMbyG4XVhV5CGt1oYPSfaJpQ4ncAqCyTJqkcmAM8CU3W1TTb1NGSgzBodunX4IYSx8Vgxn0O6cwxZnRVmGg2fw0UQj9BChObGORyjRRqOck8+J-ANiwh2LUEW-xixZA1PUQfLRTgoC6LjUJlEaIMTswUAANRkMzJABJ+WshAFMjQ3QwAtgBAYWgiJVYgHzFlDoAqmWnJABbFEQA)

## 次のステップ

同じ形状が他の場所でも確認できます：
[意図ルーティング](/en/patterns/intent-routing/)はスキルではなくハンドラーへのルーティング用、[信頼度](/en/concepts/confidence/)は2つの閾値の選択用、そして[推測ファンアウト](/en/patterns/fan-out/)はすべての質問を1つのリクエストにまとめるためのものです。