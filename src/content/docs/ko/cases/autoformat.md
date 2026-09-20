---
title: "구조 복원"
description: "두 번의 요청을 통해 서식이 손실된 일반 텍스트에서 마크다운을 복원합니다. 첫 번째 요청은 강제로 줄 바꿈된 텍스트를 다시 연결하고, 두 번째 요청은 관련성이 있을 때만 읽히는 동반 질문과 함께 각 블록(제목, 목록, 코드, 알림)을 분류합니다."
section: cases
order: 100
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/autoformat"
translatedFrom: en
---
이 쿡북은 마크업이 제거된(문장 중간에서 하드 워핑된 줄, 제목 표시 없음, 목록 불릿 없음) 일반 텍스트를 받아 마크다운 형식인 제목, 단락, 목록, 인용, 코드, 호출구로 구조를 재구성합니다. 입력물은 정확히 그 상태의 팀 메모입니다.

텍스트 생성 모델은 텍스트를 마크다운으로 다시 작성할 수 있지만, 다시 작성하면 단어도 바뀔 수 있습니다. 여기서는 모델이 텍스트를 생성하지 않습니다. 문서에 대한 좁은 질문(이 줄이 문장 중간에서 이어지는가? 이 블록의 콘텐츠 유형은 무엇인가?)에 답하고, 코드가 렌더링을 수행하므로 출력의 모든 문자는 입력에서 비롯되며 모든 판단에는 확률이 수반됩니다.

전체 파이프라인은 문서당 2개의 API 요청으로 구성되며, 순차적으로 실행됩니다:

* **1단계, 연결:** 인접한 두 줄 쌍마다 한 `Noul` 질문(‘예’가 정답일 확률을 묻는 예/아니오 질문)을 추가해, 줄 바꿈이 문장을 두 줄로 나누었는지 확인합니다. 모든 쌍을 단일 요청으로 보내고, 끊긴 문장을 이어가는 줄들은 블록으로 다시 병합합니다.
* **2단계, 분류:** 병합된 블록마다 한 `Choice` 질문(옵션 목록 중 하나 선택, 모든 옵션에 확률 부여)을 추가해, 제목, 문단, 목록 항목, 인용, 코드, 또는 콜아웃(본문과 구분된 노트, 팁, 경고) 중 하나로 분류합니다. 이 블록들은 1단계가 완료된 후에만 존재하므로, 이는 두 번째 요청입니다. 또한 각 블록에 대한 동반 질문(제목 수준, 단계 순서, 콜아웃 종류)도 함께 전달되며, 블록 유형이 관련될 때만 그 답변이 읽힙니다.
* **직접 증거는 코드 안에 그대로 유지됩니다.** 빈 줄과 명시적 마커(`- `, `1.`, `#`)는 코드에서 읽히며, 모델이 재고려하도록 보내지지 않습니다. 이 메모는 빈 줄은 유지했지만 모든 마커는 제거되었습니다. 모델에게 제공되는 것은 텍스트에서 코드가 답변할 수 없는 질문들뿐입니다.

모든 동작은 pass-2 질문 기준에 명시되어 있습니다: 한 줄 설명 세 개의 사전과 `classify_questions` 안의 단계 질문의 참/거짓 기준이 그것입니다. 나머지 코드는 이를 둘러싼 연결 장치입니다. 비용과 지연 시간 수치는 부록에 있습니다: 왕복 두 번, 10,211 토큰, 0.8초, 이 메모에 대해 \$0.0015입니다.

## 설정

```bash
pip install ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

그런 다음 `TYPESAFE_API_KEY`를 설정합니다. 모든 API 호출은 쿡북과 함께 제공되는 `json_cache.json`에 캐시되므로, 다시 렌더링하면 API를 호출하지 않고도 게시된 숫자를 재생합니다. 모든 것을 다시 실시간으로 실행하려면 해당 파일을 삭제하십시오.

```python
import os
import re
import urllib.request
from pathlib import Path
from time import perf_counter

from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from typesafe_sdk import Choice, Noul, NoulCriteria, TypeSafeClient

TYPESAFE_MODEL = "jev-1.12"
PRICE = (0.042, 0.00)  # $ per 1M tokens (input, output); TypeSafe jev-1.12 as of 2026-09
client = TypeSafeClient(api_key=os.environ["TYPESAFE_API_KEY"], timeout=120.0)
json_cache = JsonCache(Path("json_cache.json"))
```

## 문서: 포맷을 잃어버린 팀 메모

테스트 문서는 빌드 시스템 마이그레이션에 관한 메모로, 평문 인박스에서 도착한 상태입니다: 문장 중간에서 하드 래핑된 문단, 맨줄에 있는 셸 명령어, 불릿이나 번호가 없는 두 개의 목록, 그 자체로 경고임을 표시하는 것이 없는 경고문.cookbook의 번호가 재현 가능하도록 고정된 gist에서 텍스트를 가져옵니다.

```python
GIST = (
    "https://gist.githubusercontent.com/eugene-shvarts/6df7daf97233bf92bcdd6b386a0fa561"
    "/raw/5da03690611fb6ddcbaabdb91fb9f91d9751b113/build-memo.txt"
)


@json_cache
def fetch_document(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "typesafe-cookbook/1.0"})
    with urllib.request.urlopen(request) as response:
        return response.read().decode()


RAW = fetch_document(GIST)
print(RAW[:560])
```

```
Migration to the new build system

Hi everyone, quick heads up about the build system migration that is
happening next week. We have been running the new pipeline in shadow
mode for three weeks and the results look solid, so it is time to
make the switch for real.

What changes for you

The old make targets keep working until the end of the month. The new
entrypoint is a single command that wraps everything, including the
docs build that used to be separate.

bun run build

Generated artifacts no longer need to be committed. The new pipeline
uploads them
```

라인 분할, 빈 줄 추적, ID 태깅은 모두 코드에서 처리되며, 모델은 관여하지 않습니다.
각 라인에는 짧은 ID(`L014| `)가 할당됩니다. 이 ID는 모델이 상태의 일부로 읽는 일반 텍스트이며, 질문과 답변은 이러한 ID를 사용하여 라인을 참조합니다(이것은 [시맨틱 서치 쿡북](/en/cases/semantic-find/)의 동일한 방식입니다).

```python
def to_lines(text: str) -> list[dict]:
    lines, gap = [], False
    for raw in text.split("\n"):
        stripped = re.sub(r"[\t ]+", " ", raw).strip()
        if not stripped:
            gap = bool(lines)  # a leading blank is not a break
            continue
        lines.append({"text": stripped, "gap": gap})
        gap = False
    return lines


def tag(items: list[dict], prefix: str) -> str:
    return "\n".join(
        f"{chr(10) if item['gap'] else ''}{prefix}{i:03d}| {item['text']}"
        for i, item in enumerate(items)
    )


def line_id(i: int) -> str:
    return f"L{i:03d}"


def block_id(i: int) -> str:
    return f"B{i:03d}"


LINES = to_lines(RAW)
print(f"{len(LINES)} non-blank lines. The model sees, e.g.:")
print("\n".join(tag(LINES, "L").splitlines()[19:24]))
```

```
28 non-blank lines. The model sees, e.g.:
L013| The cutover touches three teams, so check whether you are on this
L014| list before you plan anything for Monday:
L015| The platform team
L016| The web client team
L017| Whoever still owns the release tooling
```

## 1단계: 분할 문장 이어 붙이기

인접한 두 줄마다 하나의 Noul 질문을, 한 번의 요청으로 작성합니다; 빈 줄로 구분된 쌍은 건너뜁니다. 질문은 의도적으로 좁게 설정되어 있습니다(예: "이 줄이 문장 중간에 이어지는가?"). 이는 텍스트에 대한 객관적 사실에 가까운 것입니다. 부록에는 어휘 선택과 병합 임계값이 도출된 방식을 모두 다룹니다.

```python
def join_question(i: int) -> Noul:
    return Noul(
        instructions=f"Does line {line_id(i)} pick up mid-sentence, continuing a sentence left unfinished at the end of line {line_id(i - 1)}?",
        criteria=NoulCriteria(
            true="The line starts in the middle of a sentence that began on the previous line - the line break tore the sentence apart",
            false="The line begins a new sentence, item, heading, or thought of its own",
        ),
    )


@json_cache
def stitch(wording: str = "mid-sentence") -> dict:
    make = join_question if wording == "mid-sentence" else naive_join_question
    questions = {line_id(i): make(i) for i in range(1, len(LINES)) if not LINES[i]["gap"]}
    started = perf_counter()
    response = client.system_one(
        state=tag(LINES, "L"), questions=questions, model=TYPESAFE_MODEL
    )
    return {
        "joins": [
            response.answers[line_id(i)].noul if line_id(i) in response.answers else 0.0
            for i in range(len(LINES))
        ],
        "seconds": round(perf_counter() - started, 2),
        "usage": [response.usage.input_tokens, response.usage.output_tokens],
    }


result = stitch()
print(f"{sum(1 for l in LINES if not l['gap']) - 1} pair questions, one request, "
      f"{result['seconds']}s")
```

```
16 pair questions, one request, 0.32s
```

병합 기준은 이전 줄의 끝맺음에 따라 달라집니다. 문장 부호로 끝나지 않은 줄(붙임줄) 뒤에는 0.2 이상의 병합 확률로 쌍을 병합하며, 종결 부호(`.` `!` `?` `:` `;`) 뒤에는 기준이 0.5로 상승합니다. 부록에서는 두 숫자 뒤에 숨은 확률에 대해 자세히 설명합니다.

```python
JOIN_AFTER_DANGLING, JOIN_AFTER_TERMINAL = 0.2, 0.5


def ends_terminal(text: str) -> bool:
    return re.search(r'[.!?:;…]["\')\]]*$', text) is not None


def merge(joins: list[float]) -> list[dict]:
    blocks = []
    for i, line in enumerate(LINES):
        bar = (
            JOIN_AFTER_TERMINAL
            if i and ends_terminal(LINES[i - 1]["text"])
            else JOIN_AFTER_DANGLING
        )
        if blocks and not line["gap"] and joins[i] >= bar:
            blocks[-1]["text"] += " " + line["text"]
            blocks[-1]["lines"].append(i)
        else:
            blocks.append({"text": line["text"], "lines": [i], "gap": line["gap"]})
    return blocks


blocks = merge(result["joins"])
healed = len(LINES) - len(blocks)
print(f"{len(LINES)} lines -> {len(blocks)} blocks ({healed} line breaks healed)")
for i, block in enumerate(blocks):
    n = len(block["lines"])
    print(f"{block_id(i)}  {n} line{'s' if n > 1 else ' '}  {block['text'][:62]}")
```

```
28 lines -> 17 blocks (11 line breaks healed)
B000  1 line   Migration to the new build system
B001  4 lines  Hi everyone, quick heads up about the build system migration t
B002  1 line   What changes for you
B003  3 lines  The old make targets keep working until the end of the month. 
B004  1 line   bun run build
B005  3 lines  Generated artifacts no longer need to be committed. The new pi
B006  2 lines  The cutover touches three teams, so check whether you are on t
B007  1 line   The platform team
B008  1 line   The web client team
B009  1 line   Whoever still owns the release tooling
B010  1 line   Things to do before Monday
B011  1 line   Update your local toolchain to version 2.4 or later
B012  1 line   Delete the old build cache directory
B013  1 line   Run the doctor script and fix anything it flags
B014  3 lines  If the doctor script reports a red result on the toolchain che
B015  2 lines  As Dana put it in the kickoff, "a migration nobody notices is 
B016  1 line   Thanks, and shout if anything looks off.
```

## 2단계: 블록 분류

각 스티치된 블록에는 `Choice` 질문이 하나 붙습니다: *이 콘텐츠는 어떤 종류인가요?* 이 세 개의 사전과 아래 `classify_questions` 안에 있는 단계 질문의 참/거짓 기준은 분류기의 전체 명세입니다. 다른 로직은 없습니다. 파이프라인을 자신만의 문서에 맞게 조정하려면 이 설명들을 수정하세요.

```python
TYPE_CRITERIA = {
    "heading": "A short label or title that names the document or the section that follows it - not a full sentence of content",
    "paragraph": "Running prose: one or more complete sentences of explanatory or narrative text",
    "list_item": "One entry in a list of parallel items - an ingredient, a feature, a task, an attendee; reads as one of several sibling entries",
    "quote": "Words attributed to a person or source - quoted speech, a citation, an excerpt someone else wrote",
    "code": "Computer code, a shell command, terminal output, or a config snippet meant to be read verbatim",
    "callout": "A warning, tip, or important note that interrupts the flow to flag something the reader must not miss",
}
HLEVEL_CRITERIA = {
    "title": "The title of the whole document",
    "section": "A major section heading within the document",
    "subsection": "A minor heading nested under a section",
}
CALLOUT_CRITERIA = {
    "note": "Neutral extra information the reader should be aware of",
    "tip": "A helpful suggestion or shortcut that makes things easier",
    "warning": "A caution about something that can go wrong or cause harm",
}
```

아래의 모든 내용은 배관 작업입니다: 질문을 구성하고, 요청을 하나 보내고, 답변을 다시 읽어옵니다.
타입이 `heading`로 반환되면 렌더러는 제목 레벨이 필요하고, `list_item`이면 순서가 중요한지, `callout`이면 어떤 종류인지 확인해야 합니다. 타입들은 아직 알려지지 않았으며, 이를 기다린다면 세 번째 왕복 통신이 필요하므로, 동반 질문들은 동일한 요청 내에서 사전에 묻습니다. 이러한 답변의 대부분은 결코 읽히지 않습니다: 문단의 단계 확률은 의미가 없으며 단순히 무시됩니다. 추가적인 질문은 거의 영향을 미치지 않습니다. 상태는 대부분의 토큰을 포함하며, 어쨌든 한 번만 전송되기 때문입니다. 반면, 추가적인 왕복 통신은 전체 요청에 해당하는 지연 시간을 추가합니다.

```python
HEADING_MAX_CHARS = 90  # longer blocks can't render as headings, so don't ask


def classify_questions(texts: list[str]) -> dict:
    questions = {}
    for i, text in enumerate(texts):
        bid = block_id(i)
        questions[f"type_{bid}"] = Choice(
            instructions=f"What kind of content is block {bid}?", criteria=TYPE_CRITERIA
        )
        if len(text) <= HEADING_MAX_CHARS:
            questions[f"hlevel_{bid}"] = Choice(
                instructions=f"As a heading, what level would block {bid} occupy in this document's structure?",
                criteria=HLEVEL_CRITERIA,
            )
        questions[f"step_{bid}"] = Noul(
            instructions=f"Is block {bid} an instruction in a sequence where the order of the items matters?",
            criteria=NoulCriteria(
                true="It is one step of a procedure - the items around it must happen in order",
                false="Order is irrelevant - it is a loose collection, or not a list item at all",
            ),
        )
        questions[f"callout_{bid}"] = Choice(
            instructions=f"What kind of aside is block {bid}?", criteria=CALLOUT_CRITERIA
        )
    return questions


@json_cache
def classify(texts: list[str], gaps: list[bool]) -> dict:
    tagged = tag([{"text": t, "gap": g} for t, g in zip(texts, gaps)], "B")
    questions = classify_questions(texts)
    started = perf_counter()
    response = client.system_one(state=tagged, questions=questions, model=TYPESAFE_MODEL)
    judgments = []
    for i in range(len(texts)):
        bid = block_id(i)
        type_answer = response.answers[f"type_{bid}"]
        hlevel = response.answers.get(f"hlevel_{bid}")
        judgments.append(
            {
                "type": type_answer.choice,
                "confidence": type_answer.confidence,
                "probabilities": type_answer.probabilities,
                "hlevel": hlevel.choice if hlevel else "section",
                "step": response.answers[f"step_{bid}"].noul,
                "callout": response.answers[f"callout_{bid}"].choice,
            }
        )
    return {
        "judgments": judgments,
        "n_questions": len(questions),
        "seconds": round(perf_counter() - started, 2),
        "usage": [response.usage.input_tokens, response.usage.output_tokens],
    }


classified = classify([b["text"] for b in blocks], [b["gap"] for b in blocks])
for block, judgment in zip(blocks, classified["judgments"]):
    block.update(judgment)
print(f"{classified['n_questions']} questions about {len(blocks)} blocks, one request, "
      f"{classified['seconds']}s\n")
print(f"{'block':<6}{'type':<11}{'conf':<6}{'companion used':<18}text")
for i, b in enumerate(blocks):
    companion = {
        "heading": f"level={b['hlevel']}",
        "list_item": f"step={b['step']:.2f}",
        "callout": f"kind={b['callout']}",
    }.get(b["type"], "-")
    print(f"{block_id(i):<6}{b['type']:<11}{b['confidence']:.2f}  {companion:<18}"
          f"{b['text'][:46]}")
```

```
62 questions about 17 blocks, one request, 0.51s

block type       conf  companion used    text
B000  heading    0.99  level=title       Migration to the new build system
B001  paragraph  0.98  -                 Hi everyone, quick heads up about the build sy
B002  heading    0.75  level=section     What changes for you
B003  paragraph  0.89  -                 The old make targets keep working until the en
B004  code       1.00  -                 bun run build
B005  paragraph  0.90  -                 Generated artifacts no longer need to be commi
B006  paragraph  0.43  -                 The cutover touches three teams, so check whet
B007  list_item  0.99  step=0.15         The platform team
B008  list_item  1.00  step=0.16         The web client team
B009  list_item  0.99  step=0.12         Whoever still owns the release tooling
B010  heading    0.96  level=section     Things to do before Monday
B011  list_item  0.98  step=0.86         Update your local toolchain to version 2.4 or 
B012  list_item  0.99  step=0.87         Delete the old build cache directory
B013  list_item  0.92  step=0.90         Run the doctor script and fix anything it flag
B014  callout    0.65  kind=warning      If the doctor script reports a red result on t
B015  quote      0.99  -                 As Dana put it in the kickoff, "a migration no
B016  paragraph  0.92  -                 Thanks, and shout if anything looks off.
```

모든 블록의 판단은 해당 표에 있으며, 우측 열에는 사전에 결정된 답변이 적용된 결과가 표시됩니다: 월요일 전에 수행해야 할 세 가지 항목은 확률이 약 0.9로(번호 매겨진 목록으로 렌더링됨), 세 팀 관련 항목은 약 0.9로(글머리 기호 목록), 의약품 스크립트에 대한 미표기 경고는 `warning` 유형의 호출아웃으로 분류되었습니다. 부록에서는 모델이 불확실했던 하나의 블록을 다룹니다.

## 렌더링

페이지는 판단들을 조합하여 구성된다. 연속된 목록 항목은 하나의 목록이 되며, 항목들의 단계 확률 평균이 0.5 이상일 때 번호가 매겨진다. 이 임계값은 직접적인 질문을 통해 이루어지는 것이 아닌, 그룹 수준의 결정이다.

````python
STEP_THRESHOLD = 0.5
HEADING_MARK = {"title": "#", "section": "##", "subsection": "###"}
CALLOUT_MARK = {"note": "NOTE", "tip": "TIP", "warning": "WARNING"}


def to_markdown(blocks: list[dict]) -> str:
    groups = []
    for b in blocks:
        if b["type"] in ("list_item", "code") and groups and groups[-1][0] == b["type"]:
            groups[-1][1].append(b)
        else:
            groups.append((b["type"], [b]))
    parts = []
    for kind, items in groups:
        if kind == "list_item":
            ordered = sum(b["step"] for b in items) / len(items) >= STEP_THRESHOLD
            parts.append("\n".join(
                f"{n + 1}. {b['text']}" if ordered else f"- {b['text']}"
                for n, b in enumerate(items)
            ))
        elif kind == "code":
            parts.append("```\n" + "\n".join(b["text"] for b in items) + "\n```")
        elif kind == "heading":
            parts.append(f"{HEADING_MARK[items[0]['hlevel']]} {items[0]['text']}")
        elif kind == "quote":
            parts.append(f"> {items[0]['text']}")
        elif kind == "callout":
            parts.append(f"> [!{CALLOUT_MARK[items[0]['callout']]}]\n> {items[0]['text']}")
        else:
            parts.append(items[0]["text"])
    return "\n\n".join(parts) + "\n"


markdown = to_markdown(blocks)
print(markdown)
````

````text
# Migration to the new build system

Hi everyone, quick heads up about the build system migration that is happening next week. We have been running the new pipeline in shadow mode for three weeks and the results look solid, so it is time to make the switch for real.

## What changes for you

The old make targets keep working until the end of the month. The new entrypoint is a single command that wraps everything, including the docs build that used to be separate.

```
bun run build
```

Generated artifacts no longer need to be committed. The new pipeline uploads them to the registry automatically, and checking them in just creates merge conflicts.

The cutover touches three teams, so check whether you are on this list before you plan anything for Monday:

- The platform team
- The web client team
- Whoever still owns the release tooling

## Things to do before Monday

1. Update your local toolchain to version 2.4 or later
2. Delete the old build cache directory
3. Run the doctor script and fix anything it flags

> [!WARNING]
> If the doctor script reports a red result on the toolchain check, do not proceed with the migration. Ping the infra channel first and we will sort it out together.

> As Dana put it in the kickoff, "a migration nobody notices is the only kind worth shipping."

Thanks, and shout if anything looks off.
````

위 모든 단어는 입력에서 온 것이다. 파이프라인은 경계, 유형,
마크업만 선택했을 뿐이다.

## 플레이그라운드에서 열기

이 공유 링크에는 이어 붙인 블록과 전체 2차 질문 세트가 포함되어 있습니다. 이를 열어 분류를 실시간으로 다시 실행하세요.

```python
playground_link = make_playground_link(
    tag(blocks, "B"),
    classify_questions([b["text"] for b in blocks]),
    models=[TYPESAFE_MODEL],
)
display(Markdown(f"🔗 [Open the stitched memo + questions in the TypeSafe playground]({playground_link})"))
```

[TypeSafe 플레이그라운드에서 스티치된 메모 + 질문 열기 →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIAQgAxkA++AsgJYDmATgIYo0RL4oScAWC+SBAHd8AIxg0ANmHwBnAJ6yUCOAB0k60iQCMlABI18CAG4IG89ggA0+AI4SoAa3x8mYWfhgAHfE1EQYFF5+cSkZBSUVfDh6ZlZ2XhZ8Gg8eJi8vZBokOgEsIKEEBEcAOnwAdX400zEijgYYJCRs3JQ+PJEvGkzJbP5suTTIETgIMH4AMwgGXgYi-ELijyYkGTb+OdkYSRQPSQgIZ1kIXrAbY+SglM4aRE5uOCZHfnW5IRoUKB58KZm5pkkJXUmjIACZKOU0kEvis6AgPL98BYYMCkFoAMyUNDtE4yR7PThMBhw3b4Z4IHxCaaOFqeVBSYJGVb4CATRmjVA8MrY-iCETIFDmLwQbJXZZyFqSfhQCBwR7MtpJITMLweExmeRtFo2bJQSQwMC016QKAeULSRJBGCyBBrbiifg2rxElgIIEaNFkAAslHE9UaYgk0lRWgArJQAOLIMyumRE1gTJhQUlIbj7HJmPK2+61fAyuUfZRgbntPn4Lo9PqeLz7NwedZwHOvOZ0FKC+S+QKylg0KAAyTyGwrGRfBBOI18RsDABW1uh-2UHkQxOl7AmvWTsndIJIADYse1YFxTDMuDBR-WeHMXggmHBZOduKOnAs+OsZsjfHMWRwtXs27Uvz8J+NYrL4SCajwtKIlQ7BgEw8i4DuADsB78KBKC-I2yh3juAAcaELAgoh5r0AqcLeaieiQACcEI8BA6ozEoUiSCyQhIJeGwIFKTA2vcJwtCGOgkAeLT1twkCAdM-CwasCHCdouj4AAql48HKEiAQzPsfZsVwJwwgMXD4CeshsBwoIlF6LI6a6DAgto4L4AAIjxCCaa8uKBmEeZJu0hpzMm0zyI5mL4AASgGxrQFwzFQAw3RBMOPw0Jg4GQbSHw-JITB0LIik+vgACSbIxcF8WJV4QRzMKDCkkw+BzDImzbEECSvAZkhGRwz6ODYUmpkEXgMNARQyO8bTsrEPbsGUAAKE79EgEzMHmaRNDxqUMEo4ETfw7ySGxxz1ZcLKBPcJJ8Aw26eto4b4AAgh4LkrI1XgXdlxntDSTishMNiqCAjUxIws0cKm-hgB2Q29vCyRcT+A5ktkE3TFNshQRkLRAiAin7vg2IrI4D57YMARXGyKyZTk+D7IcHj-SUIA2CAI2ytVsgYNgeCEMAQMoPImQAPpaCQQMEPzICC5kEv4EDXwilACBA4DIAJR8Zg0EwctS64ho5HLQOPeTp25Q6bHTDcKBSpaAh3vD5XwORVuvDayYWXbUxHRAQgeNlAC0AgQMlPzbMdArIMrLJsjKqACqr8tsy6YNeDwRsgFFTS0uzNoEJYtnRDJeYc1Kmk2vHSDK4zbJYKBSAsCFhcNwwcQ0DUyjYInQO9Eowua2ovNAwA8oITLtskHCNb37Vss6zBHVtA8eEHYEtM1NACkOPy3igMBzNvKB8f14G+CgyirEUADcTW3u4viM2PrJyExAISqIvS0wKiXwt3ID2CHFWQ8QDlGmPfFggoaDiCLDmd6ZhjgcCtscfe0cg4AJgbITIY4eDbygB8cGQ4OBYGVgwaqchZQIALjxfiypAF-xlOMDOABhDmgRMwMOsL4QYPE2L5nlGcCiDAYgN0toED6KAbBW0anHCY9A5DNAyB5aIt5UA5gdLfNwpkzCiB7IPNWel9iBAzibIQRJmg5BsKwLwkiZi3DqkfVRQ0XhQknsoVu3hSSvHXL7HM648rkMQFqWmzY76ZjgHOYOQQYiyAKiAAAvmrbISgGge3YLEggQNIRJBpMyZ+ccL5ijELpZwYsAD8QMElJx4FKUwkhRZkHFrzKWMsgEZPVgxOG9DEpuO1rrAWHwpQZx5NbW2z9XhCAYrbE0ztUB-3dvEDQwCTaPGnEgscCyXB31pJNKCv4ArQBmSgOZMBRDzIssY6I2Qrb61pIISIMhGjjBmI1M57AKmJM4oKc8Cz0lJ2elwm5FjXxJBqVtKk2wZAf2gCUhpLIoCwC8B2b61xpmIFQAAcg8Mk75+8EDlPiWrSIXh6lkD6dLIWrSk6pm2H-JJXzUmcQzsVM0xT8Bi1PnSlJGyBgvIQPYKOB1rrOP4GAzMYz2jL2iBA+B+L9HdK1jrJpAsGiUqBsVQpBciUxy4ezZWYBcX4CDq8SVRIAjMmyuE3aaRFEcAGKKhyLMk6JkkDaDOw8GBPIRskVu7ljArCCEHL64p6b8RlIvBlNjIlcJnpcKISR+wVMqQrfsFMSWNMlgLClGdFadMdQreViVFUZpAE4jOAA5BAgQF5GGwGtbIWFwaMn+J6zGAQLTqKYKY78rI-5WIuXwSQXgJjbDkDAOgcIWIJCQQxeqR47b4kdrs-KRg+KbwdWrLt5i6AXL7IET2fgKYBI8kuu2fYOB0G4LQ2mVtd38TSEI95SdOXfIsr8zJLickyGfqu8YXqoUvjKY+zNIstDaDJS07NHTlZdM1oWslgLt1LNNkEc2W1XYDOcUkBuiBEaopdqedory9lJG9vsP2Z0g5DS4cOo6L9K7RzyewApf9555RVOnYBWct3llGnnH8IqZijG-PmGsHlHSRyrvDZ+ddcoNzih2K2Lc24d3yH-Ge-dlCDzaaPfg38kVTzpgBZ+rHF5sUlavW1OQN5b2o7vXFh9j6ELPhfcYCAb7NuWI-EVbIbQnjfuZD+tJv6b1iWrdBqqQFgOWOfRK0DswmTgTtKdzFtKoLsDAQB4QsFfFwfghZTniFmDIccRAVCXUHVGsoehYwIssLgOI9hNXt6Yx4SXOUw5LFmGEW-Cm4jI3SLXHI2QCjMhRJUUEEy6jm1aIYDo1geik4GIphczd2objWMLnY9G-rImYauPHdxnNGTeJECZPxuQSvHqWhoz1lqghUeibEpNIBn0MrfSAj9qNtX5PItcf9MKdD4ue0SklYGlXktlsA6lkhaWfK5a+plLLoVsrINoDlcOX0JB5S-flknXxmGFbZT14r+iaaXNKnasrFsFt6eDr5EX1Ves1coHw36eNjX1d+I1EqydfjNTIC1ETrWZEs0Tswf9nWuuAe6z11waA+pqTtwNhTp4HFDScKUEbm4h2jQBAeZ9fBHUTfolNgRQfgazcAnN0G83qxp0W-AUtS3AIrVWt++Q60rWmI8DZIS3CZlbRC3MnaiTed7d0ftPEh0jq2OO+EGzp3oznYqKJTxF3iRXeZcXtvVuGyQ7ujZB6LqXaCa0FxZ78AXoWKNa9Mxb1VCJIPZ7r2fkZyyUET92qf39CRwB1HQO1YtJJaCC3kO2nW6AXK2DtPi0IYua2s2fg0Ongw3bbDi7+B4dUa7Qj6zPYp5+Br32-sA1RsajRiO9HvMl0rkc23rHU4cbaVxnOvGED5yfoJ4uImy7iavzXGteuRucwZuIkZTG8LuW3dTAeN1MePTSeXXXaYzF0UzWNe8Q1dHRgW0TeVAbeCYOzA+LhI+WQE+MCaVS+NzG7TzfjbVXzGMY6KBT+XIYLX+W3cLNvKLZzWLNhO0HVeBZLchFBfgNBDLDBbLHBLhPBI+fLU+QrUhIIS7MrGhSrSfRbGrZhVhNxEucYZrAdXhWUfhTrIRbIHrMRQIfrG-WRC7EbJRRAHbSbbiTRE8ObW4ehU3O-NpExMxNbKxSNLbeqHbJxO2UUMwBoI7LxMjXxXKC7ChUvJtUJQTCJB7FIJ7D5bFN7NvT7XJWOJjX7XvAHUEAfKpUFOpLQEfOnS3cfKDVQ-NafB3ZpDDIZdoVgG2a-cZSZTfA5NFO-QlPfN5JDFZNZBlTZNwbZD4XZRkLfHopOLYU5PoxZTwy5VMGYBDPIe5OkT1XlBlIDF7DHDIpZcUBDGwCZEFdUNicFdtVlMouFBFfTXgFFLogUTFOQelPeOYIooGEHMo0fCLaHWHdI1vYBZlIpZHa4tePY7lAzG0XHaOCZAnRke1bVY1XnH3NxWQKnWonpeo5VGABnDVMeLVNnXVW0A1bnUnFQZYUaR5M6O7FwdIEXBA+1CXAEKXbTD1TMOXBXEwJXM6a4VXCAdXcNGQxTHXaePXTTA3BNeJZ7JbM3b4iosfRbaomDLEslZ3NpV3QUd3WtRqetb3RtP3FtBiIPDtLtMPW3PtJDAdaPY6MdCdBPZiGdT4C6A-BdS8DPW8LPddJOXPRDRYgvfdfwYvWIk9A-CvKvK9XIG9Jga0BvB9AlJ9CEhHYBdvFGbIh+GgX9P7K4sED4iHBAEldEH4yDJWGou3Oo+DLZPPRYhfFDJfS2FfVotfB2XDR47fAjcTYYg-UjY-CjM-MOWjCuC+BjHI2-FjFOdjDOF-WmXOd-Ggq2ITVcerX-OjYcqTWuTAIA+TUA1uHsFTSAtWaAzTWA3TVAEA7HGNZAheKUMzXnCzSeLAw0Gzc-AgzhRqYg0gqec+ZAVzdzO+agguZ+Og6tALJg8eH+ULJOdglMzgiBbgmBBLcsfgxBFLIQjA8LLLIoHLSQvLCyArTAEhYrChJQirOhW3DhDQ+rNhOvJrLhFrWjPhDrQRbrURFAPrQuAbFaIbGwsbew+0RwmQZw3RNwn2IxJDX0yxboPw+rbbRxQBYIg7MIzxdoE7KI-xEvUM9oZtMJJInXR7HYlvZMtpVMzvRjW-P9HMkgdEPMr4sgIshU34ttf414oypOYE-7FHKy9HAEz2bHaE3EvHOE78LydkmYEnNA8nb8ynFUhVcDFVJlfEx0FnLvdnPVUkxkE1Kk81KJIXek5ARk0K5k8rN1UKr1eXOYRXVRZXL1fkwUzXYUmYKjMU3afXeNI3aUk3USlAQs4sq3ZU8i+3NUsijUytLUtiD3XUr3IRA0rShI8mE0-gEPbtCYcPLwSPQdGjUdOPSdFC5DZPFxN0+4nINUVdbPDdbw6sv5PyPdBIIvBQkMicJIcMy9GvKMuvGMu9RvAypMtJTI7JL7b9cyLM-Izy6ynYofLQL0Xqqo0smKuDcHOfJDWsumeswuFo22A-dfVs2AbotG3fLslxHs8jQOfsi-VcgVb7XI2Ze-Cc9IJ-JOac3IWcj-ATIuYTUuMTcmyTAAmTN6bcxTMAvciA6YnuNsDTFQE88Cu45q2ecsFAm8iKjA8Ex8nAiRWzFgezIgxzU+cg38qgh+ecnzV+BgwLL+M8kLP+aC4y2CmLKBHg2BJCpLXa5BBgNLDCuQcQ3LaQvC2Qgiore60rOA8ravMi-RdQ4BOrBrGinQuivQtrQw5ikw1i9iqRSw7i7oUbZRPi3MabIS+bESwxDwq6iS9baS+xQI+Sg-EIw7ZSyYSIs7aIo9OIw0nS3aZImJb6ny36lMrIr9UcgpCy0E70PM6pM4klKGhyks3NKfVUunRo4BYZdGto9oCZE4TonGhOW3IjC5QY5ieYkYg2XIHZb6dew5Y5OY7YgYq5FYqs3IO5GBR5TMLYhZTuly7uzww42+44lxEohYNtSFSymyaAW4hAv8fAKY54gE3FGylnce6GqlJy23Qy9+tykGyG7yt+0XXlGEwVeEkK4nMqHnCkqVKK9EuGmfR3HEvEpnAk5Kok0aNKrnDK3nU1akwXK1PK0XJk23SXCLGXDk-2Lkv1Kq3k4NNXVcIUn2kU0OGNVq5KdquJGU9wuByevq2Ggais8HdUpOTU6tCayeBtX3Wa-3R0-+4PM0mOVa9am0ra+0z2RPWdF0g6tPd046zPNdP+X0ndGMwvIMgOq7YJcvMCCM16wuevOk+M5vH6xlHu-69M7vQevvEgL0PMiGsgUMeBhWfqme2KhG2++fJ0lGi2NG1fTGlsyYts9qDsl+AmkjI-Ym0-Jqgcy-Ncymscmm5gR-KcxobjZm+cr-dm5czmocgVHmzc2TYAhTRqwW1gfckWkAI8iW6XOAs86WwzJAueeWpeO8zA6zXA9Wt4t8wkEgpzXW6+fWviQ2l+PzE2sClgyCoGK2pOUBD1aLSBOLXgxLBBQuF2t20Q7MTBLCiQ6RXC9gfCwi-xkikOqrci8OtpSO6i7Qo5+i-Q9rVYIwli86Ni8wjitO6wjO2w8bNRASmbFwhbZNLqlbC6ugSSjbK2fwhxe7SulxaupSxGVShu9Sh6wJgS1uplqJFI1++HFB99OJvum-Ae7MoekgUMGBikElDJ1RtpP4pB6J97dyyy0MDB4VrBnHAK2EoVBE0q8KyVVEmVch7E6WeKoExKl4ikFK4kznYQ5h4h1h7K6IXKm1Aqp5Iq1kpOfh2xQRiq7kkRoNaNcRkuSRsF7XGR8UuNeRmHDqxbZRsMTJ9pdRnJ+G4tbRoGXR7UrUgx-Uox3l0xha3wCxntC0iPK0qPTa2POxgQ2s-apIQ60vE6r0zx6l7xm6qePxpuzSp64Jl69gN666z6yJtIzB97EygGqmIGnvEEpJ2V8GilElXcNNifC1ys0Yy642ZDIp5fEZPbe2HDCpje9sxkIjL2epk-DAppsmkZvHMy5jDptjOm7p7OGct-FmwuRctrUTcuCTaubVXmuTJuAW3c2Z4WtTMWmA5Z08ieC8ozTZ687Z4h+89ebA58neDWwg987Wsg78igv8usA2wCo2m59+O5821gsLf5jg15rgu2hC7gL5xt1LZ192wF7BL2ghX2iFo9KF2hGFsOxhCOzQxrGOl5OOxi9FxOkRLFlO55PF+RAl3i1RBwm7Ul4S8i9wqlhgLdWlsu2S-l491ljxdl+u7gc7ft67bSxItuvSwVhMoGZBmJ4y3utpyVtBsgXcOV4lLQddpVhBmlVVru9z1BxdgHXcbVzHXV-yimoKwnREk1lEinMhjR2e4tenBKmhpK+1+hjndK5E11rKgXHKjhr1u1Qqnhlkvh0qzk4N4R0-MN2qiR+qqRxq0U9Zq4CUtqxNxRzqwutdjd7J6nTR7N4anR0avRnUwt6a4tm7APY09tRaitlaqttamtjamPO0+Pex0xxxibZx54Vx5dT0jxnPLt-PHxwMw9DSx66EIdkO2vMduMpvSdnV6dzzwGzMhdjywL1J1drQZCUbjN8brLyhkARGmswp1DBso95s09p2XGnfTsoxupn2Bpu97rh9oD6-H7amtWB-SczjHp1-AUucwCgZpcgDv-NcsZrc8D6ZyD9uaDqA2D48+DqWhAmW7VEzBW8zXZrD-Zl83Do5j805ojvWjzMjp+Cj+gqjoLGjh5-+ejmCxjuC5j+LVjx275pBDj9C-5zCnjnC726NsCOQoiwO3TYO4Tssii8TqirQjhXQ1rWTgRNxTF3rHF1OmRdOxRdTibfirTvO1w3Tyl8S6lozzbGSgIuSzyFlxSiz47KznKLlwJTSktj1xzgVjulz3Y8L77sVrzvIqLzy5CEekoklUH4LrJ8HzE3J7L+etpRe1fcK1eqZSpuZeYnepgVZPe4Y1Y4+vZU+7o8+7eq+5Yg+25ePbMR+5TyfqJov4xT+ndml4FFDM4v+k0yy5CG47wO4sBiBrFV46BnY2ykgWv7LyokLxNz7uL9Vnzq-2L4YvyvlfV3B4KnEY1wh8k9As1tFUy5N8oeOXG1nlztas4qYqVEkkwxK7oE3W5XHPkEGFz5VquPrWrsVWlwNcg2vqHkq1zpgRsw0HXaNtI0QK9d42huAbkoy6o18we09CHiAKdxTdc2M3fNp7kMb75jGRpMxqaVDyWNNu1jOtntx2o-MnSzbVPKdyOrndTq3pIGF4xu49tfAfbB7oE0Hbnph2r3cJveg+6JkV+sTDvLOwzLA1y+IPIHiBjIB4R6BNuTNhQz1j5MkacPVGuhibJlNke+yc9lU0vb71uyN7Psve3Dhc0RyErTesT1pppwP2vTb9v0zZq08Vyj7YDtJnGZ81me9sVnnMxg59w4O2mFZohwMyXkUO-YNDugQw5WYReatMXocwcwnMda0vc5rL0ubkdrmivUCsr0gS0coK6va2pr1tofMHamQJ2j80N4iFMsHtIFrxxkKW8-a8hQTkHWUKh01CYneFhJ2jrIsZOBhJil7yTqKdfeynf3vi0D5Z0NOIfXOtoh05DdlsUfAzj4Skqx9y6CfMzsn3CIqU0+NnVQWXmz60l26qRPQVOz+qGD0yhPQpAD0sFV8x6WgKwXX3TYMDG+WbUAS3yTht8myHfDouA275b1e+AxfvkMQ2TD9xiJ9NEZ4In6YjFiwia5LfTWIP1L4i-TEcvz+EHEAUX9TfnTG34XEAG0rPCAf0RSgMoIHgE-i8S5Tn8C+l-SETf0VJAwVWD-fYm0g1YcjX+kJOih-0S6Gt8GYqP-orUAEZdbBlrMATKNtaEloBjrYrkQwQFlcaSnrBkugLOpOo6uJVWXLgMqotcVchAynpGxIFIBI0TTWRn1wTbG5k2tAiEdYId6DUtGLAkAHm3Gpzc9SC3Lgdn0Dyrdy2-AytoPmraLFrSwg7ag6T2pOMW2LjaQe20u7nVrhu7EACbADK3UVB3LMvOoMryaDR22gr6gXzc7F8AR4rBJlKySZ4RzBBZLQDRCDFbs8m6-ApujAPYI8l6SPDfISMOR410eXAzHmRlvaUZcegQhIQTyprzMSe77Mnp+yZrRDqesQ-9vEPx6M8Jm-NFnuAQogHkk4izLTP61yHnl8hyHOWqh1vLodheT5UXjhyqFa0ahhHFzPUP-Jy9r8wFfzIwTaEQVLaXQ55jbXeb21EKAw-XqhVdqcdjeYw03iC3N4ej+O-tWYbb3mEidFhtWFYUizd4MUNhcnLYQpx95q0-eg2A4ZnTsLHCc6d8bTvnQj6F19OhnUuncJM67YFKbiNlqnx8ScsYimfOznNS+FOd8+dIr7v8LTLisgRiTAHDRDBG1ISUfYqEZu2AFwiGirRJoi8Hb7qjO+Y-UITMRJFXVd6NTXERSJH5nsz6W9E5JP1JHX0Z+tMe+vP2pGKjL6Mkx-qv0ZHr9v6pxWpDv0uLSsaIXIo-ryKnHdFIGZ-d4hf1ga9i02ko34bJKBLP9wp4JcLrzz1bKi8GP-Ahi6wAHpcMS5ZSHs0mtZ6iIBBonVAw1gHOt4BlJfnOaMq6WiUKGAtWLwztECNvUTXfAc6JDTtd5ino7rt6MoFSlBu-o4bklM0ljdYRdgiUWGIjE1oC20Yn3LGKW6lsExS1c0imK25pja2u3TMQd2zHHdcxUgttu42tHyDru-pW7hWPu5VjT0z3SMmEw+rvchWvkgwfJK7zzslJnlFSSuwsHaB00oA2-vXxhFlSmBQMGHldWRrw8SmrglxFjTsmo9qmV7XwVj0XGk0Vx+PUvkTyTibiIh24qIZTx-YLlv8HNQDv-hA7JCwOIBCDheM7jzMbxkteAkhw2bPiihr4koe+NVp4FXy1Qz8s5h-IATSOjQ+Xs0JApgSza7Q1Xk80yQwT4KOvPgoMIN5oURhYhcYWbz45TCBOihOYaRQIkKw4WScBFi71orSd3e5Ez3l1m2HUSLC+w1TocMYnB9mJThM4WxIuFiVFiJdXwjxPj6md+JoRFPhEWEnWdG67w+IiY2QFRp9KTYtVnJNMr90y+IIkGapJ4j1IQZ-Y7SQtOlgIigYSI0ZEZNRFTEe+l9UkdiMH7WT1+CwfEaP2immTPijk8yXuzJE31a57kh5J5OfrnIE5+gj+v5MPqBSt+wUtkaYJEgRSeRDxTwbFMFHxThRiUkSMlMQZSjASMonziDPlG+UoSSowKiqIKlqiipkVNEqVI1jlSqGuXa4MzgK6Gi6pTrDAo1L5xsMKuKAzht62ukgAup2A+0b1LwGhsBpRAjXMNJjbkC0CkpBRjQOmnLzZpDfKGTpMWkwsRqbuSMatKmrrSOo3A5brwLW5JiNue0oQUdIbbO1xBOYyQenjcYXdP5Cgu6UoLuq2c1BT3DQS93rHvSImug1zonO+nJzjB-3HMunKBk9idAYOMURFi0najt2h9YcYvmKYuCMayM8pij3wzeDamQQImtjICGDk8Zz7JucnE6ak9n85PL9mTJiF-sf8wzY8bTKZ4MzzxQtS8SzM55LMchCHB8WAqvLczFapQlWth3wLi8hZUvf8ZQQaFeZaCxtJXrLIglsEoJisnobBJY6qzEJghZCUb1GHcdsKGE3WUQmmHW9KEhs6Fg71NlAxzZknNYdbLRa2zjCVEswjRL2F0TnZDEolpp1OGzZzhU0y4b7Oj7cT6WcfRlnxKrpPDa6OUcOen1EkBMPhm02Od8M+nSjnmP3FOaog7EwolIGc0osIpzkSK56ekhes0UMmMhjJjcgmZ8VbmlipUA-KyZ7DxFBJUZui2Yk5IskuTViXcjYk-XOX9EfJMy42Gv2HnMjf648tOWjmAaH9p5fIypnPJxQLzgcS8pSCvNC5rzXKaqTeWjiymYMcpCXfeflIEyFSn5mos+SGOy6VS3K+ouhnfKK5wCTRTUl+bHNQFcMaunU20T-J6nlV-5Tomqi6LqogKyBfPORlQL9EUtoF0K2BZDPPnQyS0S0tgago4FFsNp9neattPW5WNtuNjetvt0bakKzp5Cs7gWOoW3Srq5Y3to9LEmMK-IzC16dGVjLsLpl682ZSX1+4mD-l3YrOeUVEVT0bBjAhBdDwcGw8RxCMuRcexRlKKL2bsHwYTT8Ek1NFLTCmjosOV6K32xMwxTuPZx8Z9xZiqmfT1GZWLTxqQpTHYuZmZDuq2Qu8S4rWYFCuZqBIXsrT2YVCvxmtfDr+K-KBKSO4CEJUBTCWtCIlFtKJWGJebgJehcE3XghPY4az0sqSz2jrMmFZL9ZxFPJfb2qxLCzZxE13rHTKUJ1KJphbFjUskJ1LhsanI4W7KmwsSw+5LdWHpyuFcT-Z3S+4UHP6UCTQ5Lw4ZW8Kekt0HO-LS5NJLhUisPsNq+ZcCP4WFEdio9NSaQCcjrK3VecpevpMR4oi16By+ZncrblVzXlHAS5RMQDWwaW5Fc+5dP0eVz9u5mxRDZavhWlivla2E4qPLBS8Df1U85FCCtnmn955eKBKfKyA1OqwZ4o0VbCtSlfSN5E8pyNvKxy7ycG+Ob-piqPnYqSpA4-FbiSvkhKap70e+caP-4Ur3WtJalR-LkFfz6VbJX+UysdEYECBg0t0Ryq66xsWqPonlUmz5WppmNIG+aZaxzbhjxVK0yVTGMwVxiVukKXBctQVUHSdutpY6aqqTxkKpUF0pdFqvU00LdV90-VcGUNXVimFtYlhW9PNU6CCNH6mdvEz+mLKUcTkB1UBvsrOq1GQqvFVD1hl7t4ZzgxsvIqwyKKPB04tHohuvZYz-By4rRVfnxkbjwh9NIGIzUTVU9P8B48xdTIZ4ZqUhNitIUzNUwc8shXPZxTzw5my0BexQleHzJ8WCyfxwss5kEsAkSzgJramWcwRV6QSu1Ss7Xp8z16DrklmsgFqOoyXjqa0k6m3kYDt4qFZ1RE53iUtImosV1dsqpeusdlbqeKu64lqH09nh9vZRdPdn7NuEXreJQRa9SHOeF1171kcx9VgufVxznO7yq1aK1bHtb-peWlZVnPy2saxFc0+BWBoLkgAi5y9QVNBrLkYiMN8Gs5Ve2Q0Ej6dhKdDS-Sn7kjO5OG55TSO8nvqIunyoeSRp-qsiKNQ9bQOiCo17IZ5hyMFcmCFGQqmNOgYnc0nBnsb7+nGj5SAFlF95pdfG+LnvINYYqxcYVdUaa3E25ydRBKtVEStvm1TSVDU8lc-OU0Wi0B7Uz+d-K02MqhG-U1lQZuIFGb+yY0xsP115XHqAxaumzeTrs1iqUFTmyapwNc0TL4xHmxMV5sEGKqMxxCsQYFvVXBaKFMgjtld2LF+lItdCysbFuekmrQmZq8dhwsL70iPOX63hfjrV25adAE9ArTDSK0TcStnquGU4NkWVa-VNWkyYGvxoY81Foaxpi1ojVPtv145fRVuPjWkyk1-WlNUMyG3pqkh1iqZuNpzWTbDyji28SPHvHFqnxi2nmctorXlCBZfi9bQEtFlbbxZzahXtLNNoHa5ZR2pBdBNiXKyztA652sMOHVaz0JeYUFlhL1k4SDZeEo2QUrnVFKF1ls7hGRPKUYt7Z1S-7VxXomEts6+6j2S0q9ltKfZxdTpeetsQ9KK6ifJIOZ0R1DLTsEcjPmMujm3ZdKefH4ZwoHnWrcdUan9VLpSaMaAu3emFdrp4Mt7IuacmyMip1aoqTdX-ZLr-2PkkNT5Em0AXbr10O6oBTuxhi7sU1u6kBKm9+VaPU0+7-WOAv+bpuqp8k2VQ0rXJyp67gKI9FmqPfyp70k6XVwYgfcwP-2sDE9+jNaTNTc04LM9u0pOJaR81KqRBWYptkFtbaharp4WnVXuz1XKCDVbBsMi9Pr3vVktjYrHYRvS1tjMtm84QwXzSb3RY9wq91aVpOXlbR9iPNwZOKmIziGtmMhcc1tDh482tAhlfbGq62ZwjFu4kxcmspk76013NEbfTMP3ZqoO9ivNeLXP0gAdMc2x8ZzJv2eKVtn43xd+NrUba6hb+ptVcxAm3NwJHaujsdsAOnb+hyFIYUOq443aoDmE8FnAanUIH8lr2yilHRIlLqMD32ypWuqU6bq8D9Sgg0xKIOCVQdR62UhDpOVQ66W1By9X0qT43rGDHLFg6Mubpo7JlUk7g83rSmt7+D36jvfdH85ZzFWveu-s5UJPSH+FWrOQ3FwUOCakuRrLFa7pxUaGKpUm8AdfNoaO65Nzux+a7sQEtS35VXL3eYc02WHtN-ugBYHqAVRssJThsPRAuoHg6KT1R4rX4YizLSgj6CkI2nvc3mM8F3mq6umKIUqqSFBe+dHmMulUKUj5e7tr40yPYmaxITEdklsb2pbhdn64k+3qy1Abl2FR4HjoCC5UmIZrq2zZIqEiODvVFWpowovcGT6vBQa1RYfia1hqF9QQtce0zCGr641DNYY71vJk09DxFimmfvszVja5jbPBY1NvzUzbC1axtxYULLU7N79H4qtbsZrXHMDjDai5h-qlmgTv94FC450KuM9q4lKstjqAYeOoS0lwLZ45kvu1vHHt1CRA18ad4-HF1Vs-45sJ+1AndhIJqwmCaD7A7mlZLAuu0ooPl6Y+MOwOSifoMDLLOyO1g9ic+GcHX1+J5sUnKMGKTAzYZwnUBvDNeHCtUZuPeBkp3U6kSK9UueiN6KM6TllklnTZPrnXLo1ty45csgeUUinlC-LyVzsKMfr-kjUI4j8ol278pdMXQFdyOo0wbFdhzckyBfEM0muNdJ6i0buZOf8hNyh9k4Yc5M264qPJqqXyfy66HBT+h4U4YdFPsNxTbU83b63q6ym+p8puw0HuAWOHjNYC7lRNKgVWawzWp3w4gt1OOb9TKehuTKvT0mms9BCnPZadEEONnShexIx6VkGdsnTigl0zFqyNBM69nphvR9P7lSGcdP021XwuotA44kjqYGF0AABq8CCyLzBADGBtAMVm0PVVtCwRxgLqXmAAG0QA04EwAHG0AlAnIIAAALpxIgAA)

***

# 부록

## 비용과 지연 시간

```python
tokens = [result["usage"], classified["usage"]]
total_in, total_out = sum(t[0] for t in tokens), sum(t[1] for t in tokens)
cost = total_in / 1e6 * PRICE[0] + total_out / 1e6 * PRICE[1]
n_joins = sum(1 for l in LINES if not l["gap"]) - 1
print(f"pass 1  {n_joins} questions  {result['seconds']}s")
print(f"pass 2  {classified['n_questions']} questions  {classified['seconds']}s")
print(f"total   {total_in + total_out:,} tokens  "
      f"{result['seconds'] + classified['seconds']:.1f}s  ${cost:.4f}")
```

```
pass 1  16 questions  0.32s
pass 2  62 questions  0.51s
total   10,211 tokens  0.8s  $0.0003
```

두 번의 왕복, 10,211 토큰, 0.8초, \$0.0015.

## 조인 임계값의 출처

1라운드에서의 줄별 결합 확률:

```python
print("join  line")
for i, line in enumerate(LINES[:18]):
    join = "    " if i == 0 or line["gap"] else f"{result['joins'][i]:.2f}"
    print(f"{join}  {line_id(i)}| {line['text'][:66]}")
```

```
join  line
      L000| Migration to the new build system
      L001| Hi everyone, quick heads up about the build system migration that 
0.77  L002| happening next week. We have been running the new pipeline in shad
0.62  L003| mode for three weeks and the results look solid, so it is time to
0.39  L004| make the switch for real.
      L005| What changes for you
      L006| The old make targets keep working until the end of the month. The 
0.42  L007| entrypoint is a single command that wraps everything, including th
0.59  L008| docs build that used to be separate.
      L009| bun run build
      L010| Generated artifacts no longer need to be committed. The new pipeli
0.48  L011| uploads them to the registry automatically, and checking them in
0.40  L012| just creates merge conflicts.
      L013| The cutover touches three teams, so check whether you are on this
0.50  L014| list before you plan anything for Monday:
0.22  L015| The platform team
0.11  L016| The web client team
0.12  L017| Whoever still owns the release tooling
```

확률은 두 개의 별도 밴드에 분포한다: 문장을 나누는 줄바꿈은 점수가 0.39 이상, 작가가 의도한 줄바꿈은 점수가 0에 가깝다. 하지만 밴드 사이의 컷오프 지점을 어디에 둘지는 **이전 줄이 어떻게 끝나는지**에 달려 있으며, 이 사실은 코드가 직접 읽을 수 있다:

* *드문드문 나타나는* 줄(문장 부호 없이 끝나는 줄) 뒤에는 0.2 이상의 모든 값이
 계속으로 간주됩니다. 여기서 진정한 계속은 0.39까지 낮게 점수가 매겨집니다(`L004|
 make the switch for real.`). 따라서 0.5에서 단일 신중한 컷오프를 설정하면 건강한
 단락이 끊어질 수 있습니다.
* *종결* 부호(문장이나 절을 끝내는 문자: `.` `!` `?`
 `:` `;`) 뒤에는 컷오프 기준이 0.5로 상승합니다. 메모의 팀 목록은 그 이유를 보여줍니다: `L015| The platform
 team`은 콜론 뒤에 위치하며 점수는 0.22입니다. 이는 낮지만 0이 아닌 "이 문장이 계속된다"는 신호이며, 0.2 컷오프를 통과하여
 해당 목록을 소개하는 문장과 병합됩니다. 두 경우 모두에 단일 임계값이 통하지 않습니다. 코드가 먼저 부호를 확인하면 두 밴드가 분리됩니다.

## 왜 질문이 "문장 중간"이지 "같은 단락"이 아닌가

이 파이프라인의 첫 번째 버전은 자명한 질문을 던졌다. “이 두 줄이 같은 단락의 일부인가?” 특정 방식으로 실패했다. 머리글 아래에 있는 짧은 줄들의 연속(불릿 없이 입력된 목록)은 느슨한 의미에서 단락이다. 줄들이 함께 모여 하나의 주제를 공유하기 때문이다. 단락에 대해 묻자 모델은 모든 쌍에 대해 ‘예’라고 답하고, 병합 단계는 전체 목록을 하나의 긴 블록으로 합친다.

동일한 문서, 동일한 요청 형태, 단어만 변경됨:

```python
def naive_join_question(i: int) -> Noul:
    return Noul(
        instructions=f"Are lines {line_id(i - 1)} and {line_id(i)} part of the same paragraph?",
        criteria=NoulCriteria(
            true="The two lines belong to the same paragraph of running text",
            false="The two lines belong to different paragraphs or different pieces of content",
        ),
    )


naive = stitch("same-paragraph")
print(f"{'':14}{'mid-sentence':>13}{'same paragraph':>16}")
for i in (15, 16, 17, 20, 21):
    print(f"{line_id(i)}{'':2}{LINES[i]['text'][:36]:<38}"
          f"{result['joins'][i]:>7.2f}{naive['joins'][i]:>13.2f}")
print(f"\nblocks after merge: {len(blocks)} (mid-sentence) vs "
      f"{len(merge(naive['joins']))} (same paragraph)")
```

```
               mid-sentence  same paragraph
L015  The platform team                        0.22         0.77
L016  The web client team                      0.11         0.81
L017  Whoever still owns the release tooli     0.12         0.78
L020  Delete the old build cache directory     0.08         0.88
L021  Run the doctor script and fix anythi     0.05         0.91

blocks after merge: 17 (mid-sentence) vs 12 (same paragraph)
```

문장 구성에 따라, 마크업되지 않은 목록 항목은 모두 0.75 이상의 점수를 얻고 두 목록은 모두 병합된다. 메모는 몇 개의 긴 블록으로 합쳐진다. "같은 단락"은 모델이 주제가 이어지는지 판단하도록 요청하며, 목록 항목 사이에서는 주제가 이어진다. "문장 중간에서 이어받기"는 텍스트 자체에 대해 묻는다. 판단이 임계값에 영향을 줄 때, 질문은 그것을 결정하는 가장 좁은 사실을 명시해야 한다. 여기서 문장 구성은 17개 블록과 12개의 차이이다.

## 가장 낮은 신뢰도의 블록

```python
uncertain = min(blocks, key=lambda b: b["confidence"])
print(f'"{uncertain["text"]}"')
print(f"confidence {uncertain['confidence']:.2f}: ", end="")
print(", ".join(f"{k} {v:.2f}" for k, v in
                sorted(uncertain["probabilities"].items(), key=lambda kv: -kv[1])[:3]))
```

```
"The cutover touches three teams, so check whether you are on this list before you plan anything for Monday:"
confidence 0.43: paragraph 0.53, list_item 0.24, callout 0.19
```

팀 목록을 소개하는 문장은 진정으로 모호하다. 이는 뒤따르는 내용(제목 유사)을 명시하고, 완전한 문장(단락 유사)이며, 호출아웃이 위치할 자리에 있다. 확률은 이에 따라 분산된다(단락 0.53, 목록 항목 0.24, 호출아웃 0.19). UI는 이를 노출할 수 있다. 예를 들어, 승자 선택 뒤의 확률인 유형 신뢰도가 0.55 미만인 모든 블록에 밑줄을 그어 검토 대상으로 표시한다.