---
title: "기술 제안"
description: "182개의 Nous Research Hermes 카탈로그 기술 중 하나를 선택합니다. TypeSafe 요청은 모든 기술을 순위별로 정렬하고 턴에 기술이 필요한지 여부를 묻고, 두 번째 요청은 상위 세 가지를 정확히 읽어서 모두 거부할 수 있습니다. 승자의 이름은 에이전트의 sy"
section: cases
order: 270
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/skill_suggestion"
translatedFrom: en
---
*에이전트는 스킬을 잘라내어 시스템 메시지에 모두 로드함으로써 스킬을 선택하는데, 이는 비용을 증가시키고 스킬 선택 성능을 저하시키며 세션의 나머지 부분에 대해 컨텍스트 부패를 유발합니다. 우리는 턴마다 두 번의 TypeSafe 요청(스킬 순위 매기기용 하나와 선택 검증용 하나)을 사용하여 이를 해결하며, 잘못된 스킬 로드 횟수를 절반 이상 줄입니다.*

대용량의 기술 목록을 가진 에이전트는 거의 정보가 없는 상태에서 선택을 내린다. 이 목록은 인덱스 형태로 전달되며, 각 기술마다 한 줄씩 할당되고 설명은 잘려서 전체 텍스트가 대화를 가리지 않도록 한다. 여기서 사용되는 에이전트 허들인 Hermes는 기본적으로 60자로 제한한다. 예를 들어, 그 너비에서 `.pptx` 파일을 *편집*하는 기술은 그 파일을 *작성*하는 기술과 거의 동일하게 읽힌다. 피치 데크를 요청하면 에이전트가 잘못된 것을 로드할 수 있다. 전혀 적합한 기술이 없는 턴에서도, 이름의 목록이 추측을 유도하기 때문에 에이전트는 여전히 하나를 로드할 수 있다.

이 쿡북은 설명 부분을 그대로 두고 점진적 공개를 사용하며,
182개 스킬을 저렴하게 모두 읽은 후 세 가지를 자세히 읽습니다. 어떤 스킬을 로드할지(또는 로드하지 않을지) 결정하기 전에
두 개의 TypeSafe 요청이 들어갑니다. 첫 번째는 로스터의 모든 스킬을
사용자의 턴과 비교하여 랭킹을 매기고, 턴에 스킬이 필요한지 여부를 답변합니다. 두 번째는 이제 각 스킬의 전체 설명과
지시사항의 시작 부분을 포함하여 상위 세 개만 다시 읽으며, 모든 스킬을 거부할 수도 있습니다.

승자의 이름은 해당 턴의 에이전트 시스템 프롬프트의 한 줄 추가에 입력됩니다:

```
<skill_relevance>
Relevant to the current request: pptx-author. Ignore this if it does not fit what the user
actually asked for.
</skill_relevance>
```

에이전트는 전체 인덱스와 자체 판단을 유지하며, 해당 한 줄은 첫 번째로 확인할 항목을 가리키는 역할만 합니다. 명단 자체는 절대 변경되지 않으므로, 해당 명단에 대한 모든 접두어 캐싱은 여전히 유효합니다. `claude-haiku-4-5-20251001`에 대해 488건의 요청을 수행한 결과, Hermes 명단의 스킬을 사용했습니다:

| | 잘못된 스킬 로드 | 적합한 것이 없을 때 하나 로드 |
| ------------------------------------ | --------------------- | --------------------------- |
| 로스터만 있는 단독 에이전트 | 16.8% | 9.8% |
| **TypeSafe 제안이 있는 에이전트** | **7.3%** | **4.0%** |
| 정답을 전달받은 에이전트 | 2.5% | 1.2% |

세 번째 행은 실수를 위한 바닥이 0이 아님을 보여줍니다. 올바른 기술을 부여받은 에이전트라도 그것을 항상 로드하지는 않으며, 아무리 좋은 선택 방법이라도 그 한계를 넘지 못하기 때문입니다.

최대 하나의 스킬 이름만 반환하는 `suggest()` 함수, 시스템 프롬프트를 위해 이를 감싸는 `suggestion_block()`, 그리고 위의 표를 생성한 하니스가 완성됩니다. 이제 이를 자신의 로스터를 가리키도록 준비할 수 있습니다.

<!-- mermaid flowchart converted to equivalent tables (this site loads no chart library) -->

*흐름 방향: LR*

| 노드 | 설명 | 그룹 |
| :--- | :--- | :--- |
| `C1` | 콜 1 - 182개 스킬 모두 스킴 | 콜 1 - 182개 스킬 모두 스킴 |
| `Q1` | Choice: 어떤 스킬이 적합할까? / 182개 모두, 각 줄마다 한 줄씩 | 콜 1 - 182개 스킬 모두 스킴 |
| `N1` | Nouls: 스킬이 정말 필요한가? / · 그들의 작업에 개입할 것인가? / · 서면 지침을 따를 것인가? / · 아니면 그냥 대화만 할 것인가? | 콜 1 - 182개 스킬 모두 스킴 |
| `C2` | 콜 2 - 해당 3개를 제대로 읽기 | 콜 2 - 해당 3개를 제대로 읽기 |
| `Q2` | Choice: 이 3개 중 어떤 것을? / 이제 실제 세부 사항과 함께 | 콜 2 - 해당 3개를 제대로 읽기 |
| `N2` | Nouls: 각각이 / 정말 그것을 수행하는가? | 콜 2 - 해당 3개를 제대로 읽기 |

| From | Condition | To |
| :--- | :--- | :--- |
| `Q1` | — | `N1` |
| `Q2` | — | `N2` |
| `C1` | 상위 3개 | `C2` |
| `C1` | 해당 없음 / 적용 | `STOP` |
| `C2` | 해당 없음 | `STOP` |
| `C2` | 우승자 | `OUT` |


## 설정

* TypeSafe 클라이언트, Anthropic 클라이언트, 그리고 공유 쿡북 도우미를 설치합니다.
* [TypeSafe API 키](https://console.typesafe.ai/keys)와 측정할 에이전트의 Anthropic 키를 설정합니다.

```bash
pip install anthropic matplotlib ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
export TYPESAFE_API_KEY=your-key-here
export ANTHROPIC_API_KEY=your-key-here
```

> **참고:** 아래 코드 블록은 순서대로 하나의 스크립트입니다. 따라하려면 표시된 순서대로 단일 파일에 넣으세요.

## 캐싱 결과

`JsonCache`은 각 호출의 결과를 입력을 키로 하여 저장하므로, 아래 숫자를 다시 실행하면 API를 호출하는 대신 재실행됩니다. `json_cache.json`을 삭제하면 라이브로 실행됩니다. 공개된 실행은 `jev-1.12`과 `claude-haiku-4-5-20251001`을 사용했으며, 2026-07-31에 렌더링되었습니다.

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

## 1단계: 명단 로드

`hermes_roster.json`는 [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)(MIT)의 고정된 커밋 하나에 있는 182개 스킬을 담고 있습니다. 각 레코드에는 스킬의 이름과 카테고리, 인덱스가 보여주는 설명, 전체 설명, 그리고 `SKILL.md`의 시작 부분이 포함됩니다.

아래의 색인 및 프롬프트 내 그 위의 지침은 Hermes에서 복사한 것입니다.

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

## 단계 2: 에이전트를 자체적으로 평가하기

`requests.json`는 488건의 단일 턴 요청을 보유하며, 이 중 315건은 정확히 하나의 스킬로 처리되고 나머지 173건은 어떤 스킬로도 처리되지 않습니다.

Claude Sonnet 5가 각 스킬의 고유한 `SKILL.md`에서 작성한 요청이므로, 라벨은 신뢰할 수 있고 요청은 사용자가 보내는 것보다 더 쉽습니다.

발견된 173개는 모두 추측을 처벌하기 위해 작성되었다: 85개의 일상적인 요청, 42개의 어떤 기술도 처리하지 못하는 기술적 질문 (*모나드가 무엇인지 설명해 줘*), 그리고 46개의 로스터가 X와 그 외에는 아무것도 다루지 않는 등 로스터가 처리할 수 없는 구체적인 기능을 요구하는 것들 (*Mastodon에 게시해 줘*).

점수는 에이전트의 첫 번째 응답만 평가합니다. 두 숫자는 모두 오류율이므로, 각각의 값이 낮을수록 더 좋습니다:

* **잘못된 로드**: 커버된 요청 중 첫 번째 `skill_view` 호출이 커버 스킬이 아니었던 비율. 아무것도 로드하지 않은 턴은 누락으로 간주됩니다.
* **불필요한 로드**: 커버되지 않은 요청 중 에이전트가 `skill_view`를 호출한 비율.

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

제안은 로스터 내부가 아닌, 로스터 이후의 시스템 프롬프트 내 별도의 블록에 포함되므로, 로스터 텍스트는 모든 턴에서 동일하게 유지되어 프리픽스 캐싱이 가능합니다.

에이전트는 `skill_view`를 포함해 최소한의 도구 세트를 갖추고 있으며, `skill_view`는 자유 텍스트 이름으로 스킬을 로드합니다. 정확한 로드를 위해 이름은 스킬명과 정확히 일치해야 합니다.

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

에이전트는 현재 방식대로 로스터만으로 먼저 실행됩니다. 그 두 가지 오류율은 나머지 쿡북이 측정하는 기준선이 됩니다.

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

잘못된 부하가 우연이 기대하는 것보다 훨씬 더 자주 해당 기술의 고유 카테고리에 할당되므로, 어려운 부분은 몇몇 유사한 항목들을 구분해 내는 것입니다. 에이전트는 이미 대략 올바른 위치를 살펴보고 있습니다.

## 단계 3: 전체 로스터 순위 매기기

하나의 요청에는 두 가지 유형의 질문이 담겨 있습니다:

* **`which`**는 182개 스킬 이름 전체에 대한 [`Choice`](/en/primitives/choice/) 질문이며, 각 선택지의 기준은 인덱스 설명과 동일합니다(에이전트가 직접 받는 텍스트와 같음). 그 확률이 순위를 결정합니다.
* 요청에 대한 **세 가지 [`Noul`](/en/primitives/noul/) 질문**이 아래에 표시되며, 각각 설명이 아닌 조치 취하기를 원하는지 다른 방식으로 묻습니다. `prose_suffices`는 반대 방향으로 계산합니다. 이들의 평균이 아예 무엇을 제안할지 여부를 결정하며, 0.30 미만일 때는 아무것도 제안하지 않습니다.

둘 다 한 번의 요청으로 전송되므로, 랭킹 및 확인 비용은 왕복 한 번에 해당합니다.

이 세 가지를 작성하여 액션이 필요한지 여부를 확인하세요. 주제에 대한 질문은 *모나드가 무엇인지 설명해 주세요*와 기술이 필요한 요청을 분리하지 않습니다. 둘 다 소프트웨어이므로

한 `Choice`개의 질문은 이 정도의 명단을 자연스럽게 감당합니다. 몇 배 더 커지면 청크로 나누어 각각을 랭킹한 뒤, 이 동일한 짧은 후보군 단계에서 우승자들을 다시 처리합니다.

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

Notes.app 요청은 명확하며, 최상위 옵션이 정답입니다. 랭킹이 무엇을 하든 Mastodon 쪽은 구제할 수 없습니다. 세 가지 질문은 스킬이 필요함을 말해주는데, 계정 게시는 액션이기 때문입니다. X에 게시하는 스킬은 있지만 Mastodon에 대한 스킬이 없다면, 어차피 가장 가까운 스킬이 선택됩니다.

그럼 덱이 남는다. 두 리더는 `.pptx` 스킬이며, 60명의 캐릭터 기준에서 넓은 Choice 질문은 덱 작성에 관한 요청이므로 편집 스킬이 작성 스킬보다 앞선다.

## 4단계: 상위 3개 재랭킹

세 가지 옵션은 각 스킬의 고유한 `SKILL.md`의 시작 부분과 함께 전체 설명을 담을 여지를 남기므로, 두 번째 요청은 더 나은 증거에 동일한 질문을 던집니다:

* **`which`**은 쇼트리스트에 대한 `Choice` 질문이며, 해당 긴 텍스트가 각 옵션의 기준입니다.
* **`fits::{name}`**은 각 후보자당 하나의 `Noul` 질문입니다: 이 스킬이 요청에서 요구하는 구체적인 작업을 수행하는가? 각각 독립적으로 답변하므로, 모두 낮은 점수를 받을 수 있으며, 최고 점수가 0.30 미만인 쇼트리스트는 완전히 제외됩니다.

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

두 `.pptx` 스킬은 각각 고유한 텍스트를 가져올 때 한 번씩 분리됩니다: 데크 요청이 작성 스킬로 전환됩니다.

`fits` Noul과 Choice는 여기서 의견이 갈립니다: Noul은 편집 기술을 더 높은 점수로 평가하는 반면, Choice는 작성 기술을 선택합니다. 그들은 서로 다른 기준을 결정하고 있습니다. Choice는 *어떤* 기술인지를 결정하고, Noul은 아예 언급할지 여부를 결정합니다.

Mastodon 요청은 두 가지 검사 모두를 통과합니다: 최선의 `fits` noul 점수가 0.30을 상회하므로, Mastodon 관련 요청에는 X 스킬을 사용하는 것이 좋습니다. 이와 유사한 대부분의 요청은 필터링됩니다. 두 번째 패스는 넓은 랭킹이 제공한 항목 중 거절 가능한 것만 거절할 수 있으며, 여기서는 세 가지 근접 실패 사례가 해당되었습니다.

아래 함수는 전체 레시피입니다: 두 번의 요청과 두 개의 임계값이 있으며, 반환되는 스킬 이름은 최대 하나입니다.

The translation into Korean is as follows:
자신의 로스터를 가리키도록 하려면 `hermes_roster.json`를 교체하세요. 위의 모든 질문은
`name`, `description`, `description_full`, 그리고 `body`를 해당 파일에서 읽으며, 그 외에는
Hermes에 대해 아는 것이 없습니다.

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

## 5단계: 제안 측정

488개 요청 각각은 에이전트에게 세 번씩 전달되며, 각 전달은 한 번의 측정된 턴으로 구성됩니다. 실행 간 차이는 에이전트에게 알려지는 내용뿐입니다:

| | 시스템 프롬프트에 들어갈 내용 |
| ----------------------- | ------------------------------------------------------------------ |
| 에이전트 단독 | 없음 |
| 제안이 있는 에이전트 | whatever `suggest()`에서 반환된 내용 |
| 정답이 주어진 에이전트 | 커버링 스킬의 이름, 또는 해당 사항이 없을 경우 "nothing applies" |

세 번째는 달성 불가능합니다. 이는 다른 두 가지가 측정되는 기준점, 즉 한계입니다.

그 제안의 문구는 두 가지 역할을 한다. 그 제안은 무시할 수 있음을 말하는데, 더 강하게 밀어붙이면 잘못된 제안에도 순응을 얻을 수 있으며, 잘못된 제안은 아무것도 없는 것보다 나쁘기 때문이다. 그리고 제안할 것이 없는 턴에서도 이를 알리는 문장을 보냅니다; 전혀 보내지 않으면 로스터의 자체적인 "불확실할 때 로딩 쪽으로 기울인다"는 지시가 반대 없이 방치된다.

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

제안사항은 많은 요청을 수정하지만, 에이전트가 자체적으로 정확히 처리하던 일부 요청도 잘못 고칩니다. 턴 앞에 하나를 배치하는 대가로, 전혀 없는 제안보다 확신에 찬 잘못된 제안이 더 설득력 있습니다.

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

## 결과가 보여주는 것

* 잘못된 로드는 16.8%에서 7.3%로, 불필요한 로드는 9.8%에서 4.0%로 감소했으며, 이는 잘린 인덱스에서 추측하는 것과 정답을 전달받는 사이의 격차 대부분을 설명합니다.
* 에이전트가 처음부터 올바르게 처리했던 일부 요청은 제안이 첨부되면 잘못 반환됩니다. 해당 건수는 위와 같습니다.

당신의 에이전트가 많은 대상을 관리할 때 이 형태를 복사하세요: 모든 것에 대한 저렴한 랭킹, 그 다음 두세 가지를 밀착해서 살펴보기. 어느 단계에서도 결과가 없을 수 있습니다.

## 플레이그라운드에서 열기

4단계의 데크 요청에 대한 플레이그라운드 링크를 생성하세요. 각 후보의 전체 설명과 본문 발췌문을 기준으로 사용하세요.

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

[TypeSafe 플레이그라운드에서 쇼트리스트와 질문 열기 →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiAE4ICOMCAziqQaQMICGS+AnhDPgA4wU+FBADmCFAAsEZfK34BLFFEn4wCKAGt8tTQgA2EiBwAUUCADcZAGh1KYrFAuP5LMiwoQB3W+bh9aWz4KKAR1VGEydlpWKCdjQPwAEWYAMVsAGQAhAHkASjlaOXwAOj4+FExbGFoFJFFXGFkAMwUyOABaFAR-fUcEMorMfGaIWQAjKKQwOob2MBGICBQkZdn8BFjVC1Z9B3iOJHhxmXxx2O0RYWl8UP19fCVb1kQRsgg4R44pBHw4CHU+gA-KRbKQQsgUAB9cyoLAMPD4UikAC+IFsIGCHwqtAw2ERRFIXkkChUjHwJBAKE4fAQ5NIKggpLp6KRICgZCUMgUrHJlL4EC8MgFdQRTBAzAo-VsUrAtjCT0GlTUGk0iVo+gU6kSq26iW6vX6tBK+EAKAT4ADE+AACoLhUyIgBlTQKe74SWbboyzZyuTTDYzIS2oVkW2ilVaIrm5rvTq0DmOFT4cRIGSOZwcLxKVTlSopgBW+p6fD63Q651oYQDSnWHnkMxCQgAGgBZDJ-dgKASljO2Wi01h6WS6ui+SSsMgoRLzFW1UQcACKAEETUv8AADJWYdePIryABaAElrXIyCoFFZXM18K3261DMbLVaAOrSb4QfAAVUrX5-UgURS6K6DzsJwwgKK88hbq4shlMswz3r8AFfBYED6FYCx1H6YFeKwYHmqwRR1AIKC2DwKAkWREzLJIBAcp66walqvzqJGQRKEmrFqlR-AUJWqDpgkADc+CyusYwbNgURxOs3TYG8HzYaUuaYCJCpOPUkkARpDTBHQkKCUgtAiX44x1OJsj9pqKA6TomrqCMrp0CJXhjC6mlZlIwjFqWdD4CYcGVHkth9NwgjqgOQ74COiQSX4iCoI+aCcqI4iyMSyAIFYsg-PgNSnAlBxFMQJXgKq1glaQSKlUx2oVaV1WkHp-EoIZ9VVRJFDNDIyChHuylDAA9IFCFOUgLwDE+NoUBQ1AAVyoJsipHSsIIkhjPSIBZDAroLMGMhhhEXFFNIrBgA+RSeTmnBSMYHQqSa5pWstq23bI1rvGAMChMU0GIa4HAzLoeW1Jp658Dd61IPdQybr+vwZRwYXRQgVZXICF6nPWqqFMU-0Tk4zSxKR0XLGonKXvImqXvtoYOkIla0LUxirmArAVFWMaKUuqCSO8fCkgA5EU4NDCta1jDuM7gxxkgdFxO5AfcREcAA2uwUj86StCDa041IFAPL6B0lZkB4fUALomJINkBLgg2DaI2YwOMJR+INGt8xAAtQDrevsIbuwm+4zK0HkJpoDcLbMCeg34DkzStKEHQAFKOmcUwqH5EDXrlYwKE7436HuFDk97tILOa-57kz8B+ad510EU1qQyz+CpBJuWTBAZ02HI+iypwJskuUVa04dQivetnKaUrDwmLVo46JFpwxfKcAnGAiSIDMrDBToqPXL84w7foKAdFh4N2mQIqoIrLr3BHJKAQ-DzIVTBc2zIHRCp-Qh8I4boZBvgwFTAsUYsh-iAnLBcKsx1-IC2UKoY6thDzMD+D0CAiRNjANmEUGKBQMqlyyjIMCRwN4FRqEIFA0lfhXHkLQHgZ4EZuXGEsTQJoLRWhyIIPgi0GRezgLyREpAACiFCwAzE0mzVqFZfgQPwAAJSXAAcT9AsSsQjUCkgPhOFQj1LTukEfIDo8daTQ0dEwn64jN5SIaEkRwrA5H4Ejr8Jch4OjjScJeGRTjCLyIkifXa6wMgZBbHIcomooCGUutmDB-wyCcE4S+N8wgPz5SMbGeQAAqbJ35fjMGMfgRGuBcn4FMdtYJmllFqJMBQGhngdjG1WqIQqVYUxpgOAUdmJZSQxPKfgAAcqjBY+hoC7EGpWfQzQOjrXoFWKwcQJK+OcaY58GtXDmJNlY34jC9gHH8kuABWd8AACYSgAAYCimI+ssZYNJ1hYRHGwiAaoBmOh6BrHRlY9GqDcLISAsBCpFFMY6EQM8Gg9FsXg4pcTECtV8fgXJLYJCcl9rkggpjcmnIACzWAAMwXIuQAanwCopQAAJF2OhWpkFoGUrF2SACM1gACcRLSUQLVAypF2SLBMpKPiwVZSF6yMMLYIUCBND6DAhQQw-iw4DNyUcrYvxzkXPwFE5AlYym5Pyf3IBXjMYq3mWdDFSrsnWjqBoYwCBzUtnYKwcQCwoBjJgL6V6EATbRM1JpRlqR3GOkdOa60TRdkQVdBOJQYEflnkkLYVYGCEWOItc+TYdZughs+t9A5bZPHph8Y41ZvKFxgCmCgc1FLP5shRGCEAdR6BkBzRmWgm1RGYGJjKgGvwc5Hx-HPIiRRcopRtt2tJmqe7gM7jcfKZBhaaqNEIWaNB6AmlfKSP5qYgRKJ9MU8cQhNhJmJg4e4YFIBL11PgfMVDHhTmihNEoqI62tCnLgXAAoQy3zFBSUg1JaSbVWDAfQ-D61GRoc2hIm0kgQD8rlOe+BBYfvtKKQWagPxwdpIbJO1xZIztNvO5ddBJ66CKBA7dh4hDIW1ByBQm9CgEA9NKUSPp5SBgGsqFBdlmI6mWEvA0JYjSPpALWtkL7aBvpehLMgfJf00hZOKQDwHWSkAbeBmSkGREgGg7Bm48HENiynmMVDkAj7Lw0AobD-5NK5VnQRqgK7iNvLI-gCju5Zw0bo4RAglT9B7WvhPCMbyG4XVhV5CGt1oYPSfaJpQ4ncAqCyTJqkcmAM8CU3W1TTb1NGSgzBodunX4IYSx8Vgxn0O6cwxZnRVmGg2fw0UQj9BChObGORyjRRqOck8+J-ANiwh2LUEW-xixZA1PUQfLRTgoC6LjUJlEaIMTswUAANRkMzJABJ+WshAFMjQ3QwAtgBAYWgiJVYgHzFlDoAqmWnJABbFEQA)

다음 단계

같은 형태가 다른 곳에서도 나타납니다:
[의도 라우팅](/en/patterns/intent-routing/)은 스킬이 아닌 핸들러로 라우팅하기 위해, [신뢰도](/en/concepts/confidence/)는 두 임계값을 선택하기 위해, 그리고 [추측성 팬아웃](/en/patterns/fan-out/)은 모든 질문을 하나의 요청에 담기 위해 사용됩니다.